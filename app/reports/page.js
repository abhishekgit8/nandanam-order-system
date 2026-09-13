'use client';
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import { Calendar, TrendingUp, ShoppingBag, IndianRupee, Download, ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react';
import { generateReportPDF } from '@/lib/pdfExport';

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function formatDate(d) {
  return d.toISOString().split('T')[0];
}

export default function ReportsPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [viewMode, setViewMode] = useState('daily');
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel('orders-history-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders_history' }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('orders_history')
      .select('*')
      .order('created_at', { ascending: true });
    if (data) setOrders(data);
    setLoading(false);
  };

  const dailyOrders = useMemo(() => {
    return orders.filter((o) => o.completed_at?.startsWith(selectedDate));
  }, [orders, selectedDate]);

  const dailySummary = useMemo(() => {
    const totalOrders = dailyOrders.length;
    const totalRevenue = dailyOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
    return { totalOrders, totalRevenue, avgOrderValue };
  }, [dailyOrders]);

  const topItems = useMemo(() => {
    const itemMap = {};
    dailyOrders.forEach((order) => {
      order.items.forEach((item) => {
        if (!itemMap[item.name]) {
          itemMap[item.name] = { name: item.name, totalQty: 0, totalRevenue: 0 };
        }
        itemMap[item.name].totalQty += item.qty;
        itemMap[item.name].totalRevenue += item.price * item.qty;
      });
    });
    return Object.values(itemMap).sort((a, b) => b.totalQty - a.totalQty).slice(0, 10);
  }, [dailyOrders]);

  const monthlyData = useMemo(() => {
    const year = currentYear;
    const month = currentMonth;
    const daysInMonth = getDaysInMonth(year, month);
    const result = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayOrders = orders.filter((o) => o.completed_at?.startsWith(dateStr));
      const revenue = dayOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
      result.push({ date: dateStr, day, orders: dayOrders.length, revenue });
    }
    return result;
  }, [orders, currentMonth, currentYear]);

  const monthlySummary = useMemo(() => {
    const totalOrders = monthlyData.reduce((sum, d) => sum + d.orders, 0);
    const totalRevenue = monthlyData.reduce((sum, d) => sum + d.revenue, 0);
    return { totalOrders, totalRevenue };
  }, [monthlyData]);

  const handleExportPDF = () => {
    generateReportPDF({
      date: selectedDate,
      summary: dailySummary,
      topItems,
    });
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="min-h-screen bg-kerala-cream pb-20 sm:pb-12 sm:ml-56">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-kerala-charcoal flex items-center gap-2">
            <BarChart3 className="text-kerala-red" /> Dashboard
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('daily')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'daily' ? 'bg-kerala-red text-white' : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'monthly' ? 'bg-kerala-red text-white' : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              Monthly
            </button>
          </div>
        </div>

        {loading ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-gray-200">
            <p className="text-gray-400 font-semibold">Loading reports...</p>
          </div>
        ) : viewMode === 'daily' ? (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
              <Calendar className="text-kerala-red" size={20} />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="p-2 border border-gray-200 rounded-lg text-sm font-bold text-kerala-charcoal focus:border-kerala-red focus:outline-none"
              />
              <button
                onClick={handleExportPDF}
                className="ml-auto bg-kerala-red text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-kerala-redHover flex items-center gap-2"
              >
                <Download size={14} /> Export PDF
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
                <ShoppingBag className="mx-auto mb-2 text-kerala-red" size={24} />
                <p className="text-2xl font-extrabold text-kerala-charcoal">{dailySummary.totalOrders}</p>
                <p className="text-xs text-gray-500">Total Orders</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
                <IndianRupee className="mx-auto mb-2 text-kerala-red" size={24} />
                <p className="text-2xl font-extrabold text-kerala-red">₹{dailySummary.totalRevenue}</p>
                <p className="text-xs text-gray-500">Total Revenue</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
                <TrendingUp className="mx-auto mb-2 text-kerala-red" size={24} />
                <p className="text-2xl font-extrabold text-kerala-charcoal">₹{dailySummary.avgOrderValue}</p>
                <p className="text-xs text-gray-500">Avg Order Value</p>
              </div>
            </div>

            {topItems.length > 0 && (
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-kerala-charcoal mb-3">Top Ordered Items</h3>
                <div className="space-y-2">
                  {topItems.map((item, i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 bg-kerala-cream rounded-full flex items-center justify-center text-xs font-bold text-kerala-red">
                          {i + 1}
                        </span>
                        <span className="text-sm font-medium text-gray-700">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-500">{item.totalQty} sold</span>
                        <span className="font-bold text-kerala-red">₹{item.totalRevenue}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {dailyOrders.length === 0 && (
              <div className="bg-white p-8 text-center rounded-2xl border border-gray-200">
                <p className="text-gray-400 font-semibold">No orders for this date</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
              <button onClick={() => { if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); } else { setCurrentMonth(currentMonth - 1); } }} className="p-2 hover:bg-gray-100 rounded-lg">
                <ChevronLeft size={20} />
              </button>
              <h3 className="font-bold text-kerala-charcoal">{monthNames[currentMonth]} {currentYear}</h3>
              <button onClick={() => { if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); } else { setCurrentMonth(currentMonth + 1); } }} className="p-2 hover:bg-gray-100 rounded-lg">
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 text-center">
                <p className="text-xl font-extrabold text-kerala-charcoal">{monthlySummary.totalOrders}</p>
                <p className="text-xs text-gray-500">Orders</p>
              </div>
              <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 text-center">
                <p className="text-xl font-extrabold text-kerala-red">₹{monthlySummary.totalRevenue}</p>
                <p className="text-xs text-gray-500">Revenue</p>
              </div>
              <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 text-center">
                <p className="text-xl font-extrabold text-kerala-charcoal">
                  {monthlySummary.totalOrders > 0 ? Math.round(monthlySummary.totalRevenue / monthlySummary.totalOrders) : 0}
                </p>
                <p className="text-xs text-gray-500">Avg Order</p>
              </div>
              <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 text-center">
                <p className="text-xl font-extrabold text-kerala-charcoal">
                  {monthlyData.filter((d) => d.orders > 0).length}
                </p>
                <p className="text-xs text-gray-500">Active Days</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-gray-400 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => <div key={d}>{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: new Date(currentYear, currentMonth, 1).getDay() }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {monthlyData.map((d) => {
                  const maxRevenue = Math.max(...monthlyData.map((x) => x.revenue), 1);
                  const intensity = d.revenue > 0 ? Math.max(0.2, d.revenue / maxRevenue) : 0;
                  return (
                    <button
                      key={d.date}
                      onClick={() => { setSelectedDate(d.date); setViewMode('daily'); }}
                      className={`p-2 rounded-lg text-xs font-bold transition hover:ring-2 hover:ring-kerala-gold ${
                        d.revenue > 0
                          ? `bg-kerala-red text-white`
                          : 'bg-gray-50 text-gray-300'
                      }`}
                      style={d.revenue > 0 ? { opacity: intensity } : {}}
                    >
                      <div>{d.day}</div>
                      {d.revenue > 0 && <div className="text-[8px]">₹{d.revenue}</div>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
