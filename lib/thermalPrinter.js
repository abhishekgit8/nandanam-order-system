/**
 * Direct thermal printer via Web Bluetooth + ESC/POS commands
 * Works with Bluetooth thermal printers (58mm/80mm) — no browser print dialog
 */

let bluetoothDevice = null;
let bluetoothCharacteristic = null;

// ESC/POS command helpers
const encoder = new TextEncoder();

function cmd(...bytes) {
  return new Uint8Array(bytes);
}

const ESC = {
  INIT: cmd(0x1B, 0x40),           // Initialize printer
  ALIGN_LEFT: cmd(0x1B, 0x61, 0),
  ALIGN_CENTER: cmd(0x1B, 0x61, 1),
  ALIGN_RIGHT: cmd(0x1B, 0x61, 2),
  BOLD_ON: cmd(0x1B, 0x45, 1),
  BOLD_OFF: cmd(0x1B, 0x45, 0),
  UNDERLINE_ON: cmd(0x1B, 0x2D, 1),
  UNDERLINE_OFF: cmd(0x1B, 0x2D, 0),
  FONT_A: cmd(0x1B, 0x4D, 0),     // Normal font
  FONT_B: cmd(0x1B, 0x4D, 1),     // Small font
  FEED_LINE: cmd(0x0A),
  FEED_LINES: (n) => cmd(0x1B, 0x64, n),
  CUT: cmd(0x1D, 0x56, 0),        // Full cut
  CUT_PARTIAL: cmd(0x1D, 0x56, 1), // Partial cut
};

// Line width: 32 chars for 58mm, 48 chars for 80mm
const LINE_WIDTH = 32;

function padRight(str, len) {
  if (str.length >= len) return str.substring(0, len);
  return str + ' '.repeat(len - str.length);
}

function padLeft(str, len) {
  if (str.length >= len) return str.substring(0, len);
  return ' '.repeat(len - str.length) + str;
}

function centerText(str, len) {
  if (str.length >= len) return str.substring(0, len);
  const pad = Math.floor((len - str.length) / 2);
  return ' '.repeat(pad) + str + ' '.repeat(len - str.length - pad);
}

function line(char = '-', len = LINE_WIDTH) {
  return char.repeat(len);
}

function dualCol(left, right, width = LINE_WIDTH) {
  const gap = width - left.length - right.length;
  if (gap <= 0) return left.substring(0, width - right.length - 1) + ' ' + right;
  return left + ' '.repeat(gap) + right;
}

/**
 * Build ESC/POS byte array from receipt data
 * @param {Object} receipt - { kotNumber, table, date, time, items: [{name, qty, price}], total, footer }
 * @returns {Uint8Array}
 */
export function buildReceipt(receipt) {
  const parts = [];

  // Init printer
  parts.push(ESC.INIT);
  parts.push(ESC.FONT_A);

  // Header
  parts.push(ESC.ALIGN_CENTER);
  parts.push(ESC.BOLD_ON);
  parts.push(encoder.encode('NANDANAM'));
  parts.push(ESC.BOLD_OFF);
  parts.push(encoder.encode(centerText('RESTAURANT', LINE_WIDTH)));
  parts.push(encoder.encode(centerText('Electronic City, Bengaluru', LINE_WIDTH)));
  parts.push(ESC.FEED_LINE);
  parts.push(encoder.encode(line('=', LINE_WIDTH)));
  parts.push(ESC.FEED_LINE);

  // KOT + Date row
  parts.push(ESC.ALIGN_LEFT);
  parts.push(ESC.BOLD_ON);
  parts.push(encoder.encode(dualCol(`KOT #${receipt.kotNumber}`, receipt.date)));
  parts.push(ESC.BOLD_OFF);

  // Table + Time row
  parts.push(encoder.encode(dualCol(`Table: ${receipt.table}`, receipt.time)));
  parts.push(ESC.FEED_LINE);

  // Items
  parts.push(encoder.encode(line('-', LINE_WIDTH)));
  receipt.items.forEach((item) => {
    parts.push(ESC.BOLD_ON);
    parts.push(encoder.encode(item.name));
    parts.push(ESC.BOLD_OFF);
    parts.push(encoder.encode(dualCol(
      `  Qty: ${item.qty}  @ ₹${item.price}`,
      `₹${item.qty * item.price}`
    )));
  });
  parts.push(encoder.encode(line('-', LINE_WIDTH)));

  // Total
  parts.push(ESC.FEED_LINE);
  parts.push(ESC.BOLD_ON);
  parts.push(encoder.encode(dualCol('TOTAL', `₹${receipt.total}`, LINE_WIDTH)));
  parts.push(ESC.BOLD_OFF);
  parts.push(ESC.FEED_LINE);

  // Footer
  parts.push(encoder.encode(line('=', LINE_WIDTH)));
  parts.push(ESC.ALIGN_CENTER);
  parts.push(encoder.encode(centerText('Thank You!', LINE_WIDTH)));
  parts.push(encoder.encode(centerText('Please visit us again.', LINE_WIDTH)));
  parts.push(ESC.FEED_LINE);
  parts.push(ESC.FEED_LINE);
  parts.push(ESC.FEED_LINE);
  parts.push(ESC.CUT);

  // Combine all parts
  const totalLength = parts.reduce((sum, p) => sum + p.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  parts.forEach((p) => {
    result.set(p, offset);
    offset += p.length;
  });

  return result;
}

/**
 * Connect to a Bluetooth thermal printer
 * Opens the browser Bluetooth device picker
 */
export async function connectPrinter() {
  if (!navigator.bluetooth) {
    throw new Error('Web Bluetooth not supported. Use Chrome on Android or macOS.');
  }

  bluetoothDevice = await navigator.bluetooth.requestDevice({
    acceptAllDevices: true,
    optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb'], // Common thermal printer service
  });

  const server = await bluetoothDevice.gatt.connect();
  const service = await server.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb')
    .catch(async () => {
      // Try alternative service UUID
      const services = await server.getPrimaryServices();
      if (services.length === 0) throw new Error('No services found on printer');
      return services[0];
    });

  const characteristics = await service.getCharacteristics();
  bluetoothCharacteristic = characteristics.find(c =>
    c.properties.write || c.properties.writeWithoutResponse
  );

  if (!bluetoothCharacteristic) {
    throw new Error('No writable characteristic found on printer');
  }

  return true;
}

/**
 * Check if printer is connected
 */
export function isPrinterConnected() {
  return bluetoothDevice?.gatt?.connected && bluetoothCharacteristic != null;
}

/**
 * Disconnect printer
 */
export function disconnectPrinter() {
  if (bluetoothDevice?.gatt?.connected) {
    bluetoothDevice.gatt.disconnect();
  }
  bluetoothDevice = null;
  bluetoothCharacteristic = null;
}

/**
 * Send receipt data to printer
 * @param {Object} receipt - Receipt data
 */
export async function printReceipt(receipt) {
  if (!isPrinterConnected()) {
    await connectPrinter();
  }

  const data = buildReceipt(receipt);

  // Send in chunks (Bluetooth has MTU limit)
  const CHUNK_SIZE = 20;
  for (let i = 0; i < data.length; i += CHUNK_SIZE) {
    const chunk = data.slice(i, i + CHUNK_SIZE);
    try {
      await bluetoothCharacteristic.writeValueWithoutResponse(chunk);
    } catch {
      await bluetoothCharacteristic.writeValue(chunk);
    }
    // Small delay between chunks
    await new Promise(r => setTimeout(r, 20));
  }

  return true;
}

/**
 * Get printer connection status info
 */
export function getPrinterStatus() {
  if (!navigator.bluetooth) return { supported: false, connected: false };
  return {
    supported: true,
    connected: isPrinterConnected(),
    deviceName: bluetoothDevice?.name || null,
  };
}
