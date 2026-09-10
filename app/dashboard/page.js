'use client';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import { Clock, Printer, XCircle, ChefHat } from 'lucide-react';

function timeAgo(dateStr) {
  const now = new Date();
  const then = new Date(dateStr);
  const diffMs = now - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins === 1) return '1 min ago';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m ago`;
}

export default function DashboardPage() {
  const [orders, setOrders] = useState([]);
  const [fetchError, setFetchError] = useState('');
  const [now, setNow] = useState(Date.now());

  const fetchOrders = useCallback(async () => {
    const { data, error } = await supabase
      .from('active_orders')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) {
      console.error('Fetch orders error:', error);
      setFetchError(error.message);
    } else {
      setOrders(data);
      setFetchError('');
    }
  }, []);

  useEffect(() => {
    fetchOrders();

    let channel;
    try {
      channel = supabase
        .channel('realtime_kitchen')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'active_orders' }, () => {
          fetchOrders();
        })
        .subscribe((status) => {
          if (status === 'CHANNEL_ERROR') {
            console.error('Realtime subscription failed. Enable Realtime on active_orders table in Supabase.');
          }
        });
    } catch (e) {
      console.error('Realtime setup error:', e);
    }

    const timer = setInterval(() => setNow(Date.now()), 30000);

    return () => {
      if (channel) supabase.removeChannel(channel);
      clearInterval(timer);
    };
  }, [fetchOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    if (newStatus === 'COMPLETED') {
      await supabase.from('active_orders').delete().eq('id', orderId);
    } else {
      await supabase.from('active_orders').update({ status: newStatus }).eq('id', orderId);
    }
  };

  const handleCancel = async (orderId) => {
    await supabase.from('active_orders').delete().eq('id', orderId);
  };

  const handlePrint = (order) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN');
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const orderNum = String(order.id).slice(-6);

    const receiptHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Nandanam Restaurant</title>
          <style>
            @page { size: 58mm auto; margin: 2mm; }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Courier New', monospace; font-size: 11px; width: 54mm; padding: 0; }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .line { border-top: 1px dashed #000; margin: 4px 0; }
            .double-line { border-top: 3px double #000; margin: 4px 0; }
            .row { display: flex; justify-content: space-between; }
            .item-row { display: flex; justify-content: space-between; margin-bottom: 1px; }
            .item-name { flex: 1; }
            .item-qty { width: 12mm; text-align: center; }
            .item-rate { width: 14mm; text-align: right; }
            .item-amt { width: 14mm; text-align: right; }
            .col-head { font-size: 9px; margin-bottom: 2px; }
            .footer { text-align: center; margin-top: 6px; font-size: 9px; }
          </style>
        </head>
        <body>
          <div class="center bold" style="font-size:14px; letter-spacing:1px;">NANDANAM RESTAURANT</div>
          <div class="center" style="font-size:9px;">Ananda Nagar, Electronic City</div>
          <div class="center" style="font-size:9px;">Bengaluru</div>
          <div class="double-line"></div>
          <div class="row bold" style="font-size:10px;">
            <span>KOT #${orderNum}</span>
            <span>${dateStr}</span>
          </div>
          <div class="row">
            <span class="bold">Table: ${order.table_number}</span>
            <span>${timeStr}</span>
          </div>
          <div class="line"></div>
          <div class="row col-head bold">
            <span style="flex:1;">Item</span>
            <span style="width:12mm;text-align:center;">Qty</span>
            <span style="width:14mm;text-align:right;">Rate</span>
            <span style="width:14mm;text-align:right;">Amt</span>
          </div>
          <div class="line"></div>
          ${order.items.map(i => `
            <div class="item-row">
              <span class="item-name">${i.name}</span>
              <span class="item-qty">${i.qty}</span>
              <span class="item-rate">₹${i.price}</span>
              <span class="item-amt">₹${i.price * i.qty}</span>
            </div>
          `).join('')}
          <div class="line"></div>
          <div class="row bold" style="font-size:12px;">
            <span>TOTAL</span>
            <span>₹${order.total_amount}</span>
          </div>
          <div class="double-line"></div>
          <div class="footer">
            <div class="bold">Thank You!</div>
            <div>Please visit us again.</div>
          </div>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `;
    const printWin = window.open('', '_blank');
    if (printWin) {
      printWin.document.write(receiptHtml);
      printWin.document.close();
    } else {
      alert('Popup blocked! Please allow popups for this site and try again.');
    }
  };

  const pendingCount = orders.filter(o => o.status === 'PENDING').length;

  return (
    <div className="min-h-screen bg-kerala-cream pb-12">
      <Navbar pendingCount={pendingCount} />

      <main className="max-w-7xl mx-auto px-4 py-6">
        <h2 className="text-xl font-bold text-kerala-charcoal mb-4 flex items-center gap-2">
          <Clock className="text-kerala-red" /> Live Kitchen Orders
          {pendingCount > 0 && (
            <span className="bg-kerala-red text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {pendingCount} pending
            </span>
          )}
        </h2>

        {fetchError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm font-semibold">
            Error loading orders: {fetchError}
          </div>
        )}

        {orders.length === 0 && !fetchError ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-gray-200">
            <ChefHat className="mx-auto mb-4 text-gray-300" size={48} />
            <p className="text-gray-400 font-semibold text-lg">No active orders</p>
            <p className="text-gray-300 text-sm mt-1">Orders from the counter will appear here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders.map((order) => {
              const isPending = order.status === 'PENDING';
              const elapsed = order.created_at ? timeAgo(order.created_at) : '';
              const ageMin = order.created_at ? Math.floor((now - new Date(order.created_at)) / 60000) : 0;
              const isStale = isPending && ageMin > 15;
              return (
                <div 
                  key={order.id}
                  className={`bg-white rounded-2xl border-2 p-4 shadow-md flex flex-col justify-between transition ${
                    isStale ? 'border-orange-400 animate-pulse' : isPending ? 'border-kerala-red' : 'border-kerala-gold'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-center mb-3 border-b pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-lg text-kerala-charcoal">{order.table_number}</span>
                        {elapsed && (
                          <span className="text-[10px] text-gray-400 font-medium">{elapsed}</span>
                        )}
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                        isPending ? 'bg-red-100 text-kerala-red' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>

                    <div className="space-y-1.5 mb-4 text-sm text-gray-700">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between font-medium">
                          <span>{item.qty}x {item.name}</span>
                          <span>₹{item.price * item.qty}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-bold text-kerala-charcoal">Total:</span>
                      <span className="font-extrabold text-base text-kerala-red">₹{order.total_amount}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handlePrint(order)}
                        className="bg-gray-100 text-gray-700 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-200 flex items-center justify-center gap-1"
                      >
                        <Printer size={14} /> Print
                      </button>

                      {isPending ? (
                        <>
                          <button
                            onClick={() => handleStatusChange(order.id, 'SERVED')}
                            className="bg-kerala-gold text-kerala-charcoal py-1.5 rounded-lg text-xs font-bold hover:bg-yellow-400"
                          >
                            Served
                          </button>
                          <button
                            onClick={() => handleCancel(order.id)}
                            className="bg-red-100 text-red-600 py-1.5 rounded-lg text-xs font-bold hover:bg-red-200 flex items-center justify-center gap-1"
                          >
                            <XCircle size={14} />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleStatusChange(order.id, 'COMPLETED')}
                          className="col-span-2 bg-kerala-red text-white py-1.5 rounded-lg text-xs font-bold hover:bg-kerala-redHover"
                        >
                          Clear Order
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
