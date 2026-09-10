'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { MENU_DATA } from '@/data/menu';
import Navbar from '@/components/Navbar';
import { Search, Plus, Minus, ShoppingBag, CheckCircle } from 'lucide-react';

const CATEGORIES = ['All', 'Breakfast', 'Rice & Biriyani', 'Special', 'Non Veg Curry', 'Alfam & Mandi', 'Starters', 'Chinese'];

export default function OrderPage() {
  const [selectedTable, setSelectedTable] = useState('Table 1');
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const filteredMenu = MENU_DATA.filter((item) => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (item) => {
    setCart((prev) => {
      const exists = prev.find((i) => i.id === item.id);
      if (exists) {
        return prev.map((i) => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handleSubmitOrder = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    setErrorMsg('');

    const { data, error } = await supabase.from('active_orders').insert([
      {
        table_number: selectedTable,
        items: cart,
        total_amount: totalAmount,
        status: 'PENDING',
      },
    ]).select();

    setLoading(false);

    if (error) {
      console.error('Order submit error:', error);
      setErrorMsg(error.message || 'Failed to send order. Check Supabase table.');
      setTimeout(() => setErrorMsg(''), 5000);
    } else {
      setShowSuccess(true);
      setCart([]);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-kerala-cream pb-32">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-4 space-y-4">
        {/* Success Alert */}
        {showSuccess && (
          <div className="bg-green-800 text-white p-3 rounded-xl shadow-lg flex items-center gap-2 animate-bounce">
            <CheckCircle size={20} />
            <span className="font-bold text-sm">Order sent to kitchen for {selectedTable}!</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-red-700 text-white p-3 rounded-xl shadow-lg flex items-center gap-2">
            <span className="font-bold text-sm">Error: {errorMsg}</span>
          </div>
        )}

        {/* Table Selector */}
        <div className="bg-white p-3 rounded-xl shadow-sm border border-kerala-creamDark flex justify-between items-center">
          <label className="font-bold text-kerala-charcoal text-sm">Select Table:</label>
          <select 
            value={selectedTable} 
            onChange={(e) => setSelectedTable(e.target.value)}
            className="p-2 bg-kerala-cream text-kerala-red font-bold rounded-lg border border-kerala-gold focus:outline-none"
          >
            {Array.from({ length: 12 }, (_, i) => `Table ${i + 1}`).concat(['Takeaway']).map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search dish (e.g. Porotta, Biriyani)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:border-kerala-red focus:outline-none shadow-sm"
          />
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
                activeCategory === cat 
                  ? 'bg-kerala-red text-white shadow-sm' 
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredMenu.map((item) => {
            const inCart = cart.find((i) => i.id === item.id);
            return (
              <div 
                key={item.id} 
                className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center hover:border-kerala-gold transition"
              >
                <div>
                  <p className="font-bold text-kerala-charcoal text-sm">{item.name}</p>
                  <p className="text-xs text-kerala-red font-semibold">₹{item.price}</p>
                </div>
                
                {inCart ? (
                  <div className="flex items-center gap-2 bg-kerala-cream px-2 py-1 rounded-lg border border-kerala-gold">
                    <button onClick={() => updateQty(item.id, -1)} className="text-kerala-red font-bold px-1"><Minus size={14} /></button>
                    <span className="font-bold text-xs text-kerala-charcoal">{inCart.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="text-kerala-red font-bold px-1"><Plus size={14} /></button>
                  </div>
                ) : (
                  <button
                    onClick={() => addToCart(item)}
                    className="bg-kerala-red text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-kerala-redHover flex items-center gap-1 shadow-sm"
                  >
                    <Plus size={14} /> Add
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </main>

      {/* Floating Bottom Cart Bar */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-kerala-gold p-4 shadow-2xl z-40">
          <div className="max-w-3xl mx-auto flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-500 font-semibold">{selectedTable} • {cart.reduce((s, i) => s + i.qty, 0)} Items</p>
              <p className="text-lg font-extrabold text-kerala-red">Total: ₹{totalAmount}</p>
            </div>
            <button
              disabled={loading}
              onClick={handleSubmitOrder}
              className="bg-kerala-red text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:bg-kerala-redHover flex items-center gap-2 disabled:opacity-50"
            >
              <ShoppingBag size={18} />
              {loading ? 'Submitting...' : 'Send Order'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}