'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import { Save, Check, Search, ToggleLeft, ToggleRight } from 'lucide-react';

const CATEGORIES = ['All', 'Breakfast', 'Rice & Biriyani', 'Special', 'Fish Fry & Curry', 'Homely Special', 'Non Veg Curry', 'Egg Special', 'Starters', 'Shawarma', 'Alfam', 'Mandi', 'Fried Rice & Noodles', 'Chinese', 'Juice & Shakes'];

export default function UpdatePricePage() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [edits, setEdits] = useState({});

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('category')
      .order('name');
    if (data) setMenuItems(data);
    if (error) console.error('Menu fetch error:', error);
    setLoading(false);
  };

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handlePriceChange = (id, newPrice) => {
    setEdits((prev) => ({ ...prev, [id]: { ...prev[id], price: newPrice } }));
  };

  const handleToggleSeasonal = (id) => {
    const item = menuItems.find((i) => i.id === id);
    setEdits((prev) => ({
      ...prev,
      [id]: { ...prev[id], seasonal: !(prev[id]?.seasonal ?? item.seasonal) },
    }));
  };

  const handleToggleAvailable = (id) => {
    const item = menuItems.find((i) => i.id === id);
    setEdits((prev) => ({
      ...prev,
      [id]: { ...prev[id], available: !(prev[id]?.available ?? item.available) },
    }));
  };

  const hasChanges = Object.keys(edits).length > 0;

  const handleSave = async () => {
    setSaving(true);
    const updates = Object.entries(edits).map(([id, changes]) => {
      const payload = {};
      if (changes.price !== undefined) payload.price = Number(changes.price);
      if (changes.seasonal !== undefined) payload.seasonal = changes.seasonal;
      if (changes.available !== undefined) payload.available = changes.available;
      return supabase.from('menu_items').update(payload).eq('id', id);
    });

    await Promise.all(updates);
    setEdits({});
    setSaving(false);
    setSaved(true);
    fetchMenu();
    setTimeout(() => setSaved(false), 2000);
  };

  const getCurrentPrice = (item) => {
    if (edits[item.id]?.price !== undefined) return edits[item.id].price;
    return item.price;
  };

  const getCurrentSeasonal = (item) => {
    if (edits[item.id]?.seasonal !== undefined) return edits[item.id].seasonal;
    return item.seasonal;
  };

  const getCurrentAvailable = (item) => {
    if (edits[item.id]?.available !== undefined) return edits[item.id].available;
    return item.available;
  };

  return (
    <div className="min-h-screen bg-kerala-cream pb-12">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-kerala-charcoal">Update Menu Prices</h2>
          {hasChanges && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-kerala-red text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-kerala-redHover flex items-center gap-2 disabled:opacity-50"
            >
              {saved ? <><Check size={16} /> Saved!</> : saving ? 'Saving...' : <><Save size={16} /> Save Changes</>}
            </button>
          )}
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search item..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:border-kerala-red focus:outline-none shadow-sm"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar mb-4">
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

        {loading ? (
          <div className="bg-white p-8 text-center rounded-2xl border border-gray-200">
            <p className="text-gray-400 font-semibold">Loading menu...</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredItems.map((item) => {
              const isEdited = !!edits[item.id];
              const currentPrice = getCurrentPrice(item);
              const currentSeasonal = getCurrentSeasonal(item);
              const currentAvailable = getCurrentAvailable(item);
              return (
                <div 
                  key={item.id}
                  className={`bg-white p-3 rounded-xl border shadow-sm flex flex-col sm:flex-row sm:items-center gap-3 transition ${
                    isEdited ? 'border-kerala-gold' : 'border-gray-100'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-kerala-charcoal text-sm truncate">{item.name}</span>
                      <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{item.category}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    {/* Price Input */}
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-bold text-gray-500">₹</span>
                      <input
                        type="number"
                        value={currentPrice}
                        onChange={(e) => handlePriceChange(item.id, e.target.value)}
                        className="w-20 text-sm font-bold text-kerala-charcoal border border-gray-200 rounded-lg px-2 py-1.5 focus:border-kerala-red focus:outline-none text-center"
                      />
                    </div>

                    {/* Seasonal Toggle */}
                    <button
                      onClick={() => handleToggleSeasonal(item.id)}
                      className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1.5 rounded-lg border transition ${
                        currentSeasonal 
                          ? 'bg-orange-50 border-orange-300 text-orange-600' 
                          : 'bg-gray-50 border-gray-200 text-gray-400'
                      }`}
                    >
                      {currentSeasonal ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                      Seasonal
                    </button>

                    {/* Available Toggle */}
                    <button
                      onClick={() => handleToggleAvailable(item.id)}
                      className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1.5 rounded-lg border transition ${
                        currentAvailable 
                          ? 'bg-green-50 border-green-300 text-green-600' 
                          : 'bg-red-50 border-red-300 text-red-500'
                      }`}
                    >
                      {currentAvailable ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                      {currentAvailable ? 'Active' : 'Hidden'}
                    </button>
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
