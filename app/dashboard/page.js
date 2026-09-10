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
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'active_orders' }, (payload) => {
          setOrders((prev) => [...prev, payload.new]);
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'active_orders' }, (payload) => {
          setOrders((prev) => prev.map((o) => o.id === payload.new.id ? payload.new : o));
        })
        .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'active_orders' }, (payload) => {
          setOrders((prev) => prev.filter((o) => o.id !== payload.old.id));
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
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      const { error } = await supabase.from('active_orders').delete().eq('id', orderId);
      if (error) fetchOrders();
    } else {
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
      const { error } = await supabase.from('active_orders').update({ status: newStatus }).eq('id', orderId);
      if (error) fetchOrders();
    }
  };

  const handleCancel = async (orderId) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    const { error } = await supabase.from('active_orders').delete().eq('id', orderId);
    if (error) fetchOrders();
  };

  const handlePrint = (order) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN');
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const kotNum = order.kot_number || String(order.id).slice(-6);

    const receiptHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Nandanam Restaurant</title>
          <style>
            @page { size: 58mm auto; margin: 2mm; }
            @media print {
              html, body { width: 58mm; height: auto; margin: 0; padding: 0; overflow: hidden; }
              @page { size: 58mm auto; margin: 2mm; }
            }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Courier New', monospace; font-size: 10px; width: 54mm; padding: 0; }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .line { border-top: 1px dashed #000; margin: 3px 0; }
            .double-line { border-top: 3px double #000; margin: 3px 0; }
            .row { display: flex; justify-content: space-between; }
            .item-row { margin-bottom: 2px; }
            .item-top { display: flex; justify-content: space-between; }
            .item-name { }
            .item-vals { display: flex; justify-content: space-between; font-size: 11px; }
            .col-head { font-size: 8px; margin-bottom: 2px; }
            .footer { text-align: center; margin-top: 4px; font-size: 8px; }
          </style>
        </head>
        <body>
          <div class="center bold" style="font-size:14px; letter-spacing:1px;">NANDANAM RESTAURANT</div>
          <div class="center" style="font-size:9px;">Ananda Nagar, Electronic City</div>
          <div class="center" style="font-size:9px;">Bengaluru</div>
          <div class="double-line"></div>
          <div class="row bold" style="font-size:10px;">
            <span>KOT #${kotNum}</span>
            <span>${dateStr}</span>
          </div>
          <div class="row">
            <span class="bold">Table: ${order.table_number}</span>
            <span>${timeStr}</span>
          </div>
          <div class="line"></div>
          ${order.items.map(i => `
            <div class="item-row">
              <div class="item-top bold">${i.name}</div>
              <div class="item-vals">
                <span>Qty: ${i.qty}</span>
                <span>Rate: ₹${i.price}</span>
                <span>₹${i.price * i.qty}</span>
              </div>
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
            {[...orders].sort((a, b) => {
              if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
              if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
              return new Date(a.created_at) - new Date(b.created_at);
            }).map((order) => {
              const isPending = order.status === 'PENDING';
              const isServed = order.status === 'SERVED';
              const elapsed = order.created_at ? timeAgo(order.created_at) : '';
              const ageMin = order.created_at ? Math.floor((now - new Date(order.created_at)) / 60000) : 0;
              const isStale = isPending && ageMin > 15;
              return (
                <div 
                  key={order.id}
                  className={`rounded-2xl border-2 p-4 shadow-md flex flex-col justify-between transition ${
                    isStale ? 'bg-white border-orange-400 animate-pulse' 
                    : isPending ? 'bg-white border-kerala-red' 
                    : 'bg-gray-50 border-gray-300 opacity-75'
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
                        isPending ? 'bg-red-100 text-kerala-red' : 'bg-green-100 text-green-700'
                      }`}>
                        {isPending ? 'PENDING' : 'SERVED'}
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
