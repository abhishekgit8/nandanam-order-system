'use client';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { getCachedMenu } from '@/lib/menuCache';
import Navbar from '@/components/Navbar';
import TableSelector from '@/components/TableSelector';
import VegIndicator from '@/components/VegIndicator';
import { Search, Plus, Minus, ShoppingBag, CheckCircle, X } from 'lucide-react';

export default function OrderPage() {
  const [menuData, setMenuData] = useState([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [menuError, setMenuError] = useState('');
  const [selectedTable, setSelectedTable] = useState('Table 1');
  const [activeCategory, setActiveCategory] = useState('All');
  const [vegFilter, setVegFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [seasonalItem, setSeasonalItem] = useState(null);
  const [seasonalPrice, setSeasonalPrice] = useState('');
  const [activeOrders, setActiveOrders] = useState([]);
  const successTimer = useRef(null);
  const errorTimer = useRef(null);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const data = await getCachedMenu();
        setMenuData(data);
      } catch (error) {
        setMenuError('Failed to load menu. Please refresh.');
      }
      setMenuLoading(false);
    };
    fetchMenu();

    const fetchActiveOrders = async () => {
      const { data } = await supabase
        .from('active_orders')
        .select('table_number, status');
      if (data) setActiveOrders(data);
    };
    fetchActiveOrders();
  }, []);

  useEffect(() => {
    return () => {
      if (successTimer.current) clearTimeout(successTimer.current);
      if (errorTimer.current) clearTimeout(errorTimer.current);
    };
  }, []);

  const categories = useMemo(() => {
    const cats = [...new Set(menuData.map((item) => item.category).filter(Boolean))];
    return ['All', ...cats.sort()];
  }, [menuData]);

  const filteredMenu = useMemo(() => {
    return menuData.filter((item) => {
      const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
      const matchesVeg = vegFilter === 'all' ||
        (vegFilter === 'veg' && item.veg !== false) ||
        (vegFilter === 'nonveg' && item.veg === false);
      return matchesCategory && matchesSearch && matchesVeg;
    });
  }, [menuData, activeCategory, search, vegFilter]);

  const totalAmount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  }, [cart]);

  const cartItemCount = useMemo(() => {
    return cart.reduce((s, i) => s + i.qty, 0);
  }, [cart]);

  const addToCart = useCallback((item) => {
    setCart((prev) => {
      const exists = prev.find((i) => i.id === item.id);
      if (exists) {
        return prev.map((i) => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...item, qty: 1 }];
    });
  }, []);

  const handleSeasonalAdd = useCallback(() => {
    if (!seasonalPrice || Number(seasonalPrice) <= 0) return;
    addToCart({ ...seasonalItem, price: Number(seasonalPrice) });
    setSeasonalItem(null);
    setSeasonalPrice('');
  }, [seasonalPrice, seasonalItem, addToCart]);

  const updateQty = useCallback((id, delta) => {
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
  }, []);

  const handleSubmitOrder = async () => {
    if (cart.length === 0 || loading) return;
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table_number: selectedTable,
          items: cart,
          total_amount: totalAmount,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setErrorMsg(result.error || 'Failed to send order.');
        errorTimer.current = setTimeout(() => setErrorMsg(''), 5000);
      } else {
        setShowSuccess(true);
        setCart([]);
        successTimer.current = setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (err) {
      setErrorMsg('Network error. Check your connection.');
      errorTimer.current = setTimeout(() => setErrorMsg(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const needsPrice = (item) => item.seasonal && item.price === 0;

  return (
    <div className="min-h-screen bg-kerala-cream pb-20 sm:pb-4 sm:ml-56">
      <Navbar />

      {seasonalItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-kerala-charcoal text-lg">{seasonalItem.name}</h3>
              <button onClick={() => { setSeasonalItem(null); setSeasonalPrice(''); }} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-3">Enter today&apos;s price:</p>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg font-bold text-kerala-charcoal">₹</span>
              <input
                type="number"
                autoFocus
                value={seasonalPrice}
                onChange={(e) => setSeasonalPrice(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSeasonalAdd()}
                placeholder="0"
                className="w-full text-2xl font-bold text-kerala-charcoal border-b-2 border-kerala-gold focus:border-kerala-red focus:outline-none py-2 bg-transparent"
              />
            </div>
            <button
              onClick={handleSeasonalAdd}
              disabled={!seasonalPrice || Number(seasonalPrice) <= 0}
              className="w-full bg-kerala-red text-white py-3 rounded-xl font-bold text-sm hover:bg-kerala-redHover disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Add to Cart — ₹{seasonalPrice || '0'}
            </button>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-green-800 text-white p-3 rounded-xl shadow-lg flex items-center gap-2 animate-bounce max-w-sm w-full mx-4">
          <CheckCircle size={20} />
          <span className="font-bold text-sm">Order sent to kitchen for {selectedTable}!</span>
        </div>
      )}

      {errorMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-red-700 text-white p-3 rounded-xl shadow-lg flex items-center gap-2 max-w-sm w-full mx-4">
          <span className="font-bold text-sm">Error: {errorMsg}</span>
        </div>
      )}

      <main className="max-w-3xl mx-auto px-4 py-4 space-y-4">
        {menuError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl text-sm font-semibold">
            {menuError}
          </div>
        )}

        <TableSelector
          selected={selectedTable}
          onSelect={setSelectedTable}
          activeOrders={activeOrders}
        />

        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search dish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:border-kerala-red focus:outline-none shadow-sm"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
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

        {/* Veg/Non-Veg Filter */}
        <div className="flex gap-2 mb-3">
          {[
            { key: 'all', label: 'All', icon: null },
            { key: 'veg', label: 'Veg', icon: '🟢' },
            { key: 'nonveg', label: 'Non-Veg', icon: '🔴' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setVegFilter(f.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                vegFilter === f.key
                  ? 'bg-kerala-red text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {f.icon && <span className="text-sm">{f.icon}</span>}
              {f.label}
            </button>
          ))}
        </div>

        {menuLoading ? (
          <div className="bg-white p-8 text-center rounded-2xl border border-gray-200">
            <p className="text-gray-400 font-semibold">Loading menu...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredMenu.map((item) => {
              const inCart = cart.find((i) => i.id === item.id);
              const needsPriceItem = needsPrice(item);
              return (
                <div
                  key={item.id}
                  className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center hover:border-kerala-gold transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center text-xl flex-shrink-0">
                      {item.emoji || '🍽️'}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <VegIndicator veg={item.veg !== false} />
                        <p className="font-bold text-kerala-charcoal text-sm">{item.name}</p>
                      </div>
                      {item.seasonal && item.price === 0 ? (
                        <p className="text-xs text-orange-500 font-semibold">Seasonal</p>
                      ) : item.seasonal ? (
                        <p className="text-xs text-orange-500 font-semibold">₹{item.price}</p>
                      ) : (
                        <p className="text-xs text-kerala-red font-semibold">₹{item.price}</p>
                      )}
                    </div>
                  </div>

                  {inCart ? (
                    <div className="flex items-center gap-2 bg-kerala-cream px-2 py-1 rounded-lg border border-kerala-gold">
                      <button onClick={() => updateQty(item.id, -1)} className="text-kerala-red font-bold px-1"><Minus size={14} /></button>
                      <span className="font-bold text-xs text-kerala-charcoal">{inCart.qty}</span>
                      <button onClick={() => updateQty(item.id, 1)} className="text-kerala-red font-bold px-1"><Plus size={14} /></button>
                    </div>
                  ) : needsPriceItem ? (
                    <button
                      onClick={() => { setSeasonalItem(item); setSeasonalPrice(''); }}
                      className="text-xs text-orange-500 font-semibold px-3 py-1.5 border border-orange-300 rounded-lg hover:bg-orange-50 transition"
                    >
                      Set Price
                    </button>
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
        )}
      </main>

      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-kerala-gold p-4 shadow-2xl z-40">
          <div className="max-w-3xl mx-auto flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-500 font-semibold">{selectedTable} • {cartItemCount} Items</p>
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
