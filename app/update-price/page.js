'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getAllMenuItems, invalidateMenuCache } from '@/lib/menuCache';
import Navbar from '@/components/Navbar';
import { Save, Check, Search, ToggleLeft, ToggleRight, Plus, Trash2, X } from 'lucide-react';

export default function UpdatePricePage() {
  const router = useRouter();
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [edits, setEdits] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', category: '', price: '', seasonal: false });
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);

  useEffect(() => {
    const auth = sessionStorage.getItem('nandanam_auth');
    if (auth !== 'true') {
      router.push('/login');
      return;
    }
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      const [menuData, catData] = await Promise.all([
        getAllMenuItems(),
        supabase.from('categories').select('*').order('sort_order'),
      ]);
      setMenuItems(menuData);
      if (catData.data) setCategories(catData.data);
    } catch (error) {
      console.error('Fetch error:', error);
    }
    setLoading(false);
  };

  const categoryNames = useMemo(() => {
    return ['All', ...categories.map((c) => c.name)];
  }, [categories]);

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [menuItems, activeCategory, search]);

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

  const handleSoftDelete = (id) => {
    setEdits((prev) => ({ ...prev, [id]: { ...prev[id], available: false } }));
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

    await Promise.allSettled(updates);

    setMenuItems((prev) =>
      prev.map((item) => {
        const changes = edits[item.id];
        if (!changes) return item;
        return {
          ...item,
          ...(changes.price !== undefined && { price: Number(changes.price) }),
          ...(changes.seasonal !== undefined && { seasonal: changes.seasonal }),
          ...(changes.available !== undefined && { available: changes.available }),
        };
      })
    );

    invalidateMenuCache();
    setEdits({});
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.category || !newItem.price) return;
    setSaving(true);

    const { data, error } = await supabase
      .from('menu_items')
      .insert([{
        name: newItem.name,
        category: newItem.category,
        price: Number(newItem.price),
        seasonal: newItem.seasonal,
        available: true,
      }])
      .select();

    if (!error && data) {
      setMenuItems((prev) => [...prev, ...data]);
      invalidateMenuCache();
      setNewItem({ name: '', category: '', price: '', seasonal: false });
      setShowAddForm(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    const { error } = await supabase
      .from('categories')
      .insert([{ name: newCategoryName.trim(), sort_order: categories.length }]);
    if (!error) {
      setCategories((prev) => [...prev, { name: newCategoryName.trim() }]);
      setNewItem((prev) => ({ ...prev, category: newCategoryName.trim() }));
      setNewCategoryName('');
      setShowNewCategory(false);
    }
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
          <h2 className="text-xl font-bold text-kerala-charcoal">Manage Menu</h2>
          <div className="flex gap-2">
            {hasChanges && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-kerala-red text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-kerala-redHover flex items-center gap-2 disabled:opacity-50"
              >
                {saved ? <><Check size={16} /> Saved!</> : saving ? 'Saving...' : <><Save size={16} /> Save Changes</>}
              </button>
            )}
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-green-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-green-700 flex items-center gap-2"
            >
              {showAddForm ? <><X size={16} /> Cancel</> : <><Plus size={16} /> Add Item</>}
            </button>
          </div>
        </div>

        {showAddForm && (
          <div className="bg-white p-4 rounded-xl shadow-sm border border-green-200 mb-4">
            <h3 className="font-bold text-kerala-charcoal mb-3">Add New Menu Item</h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <input
                type="text"
                placeholder="Item name"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                className="p-2 border border-gray-200 rounded-lg text-sm focus:border-kerala-red focus:outline-none"
              />
              <div className="relative">
                <select
                  value={showNewCategory ? '__new__' : newItem.category}
                  onChange={(e) => {
                    if (e.target.value === '__new__') {
                      setShowNewCategory(true);
                    } else {
                      setShowNewCategory(false);
                      setNewItem({ ...newItem, category: e.target.value });
                    }
                  }}
                  className="p-2 border border-gray-200 rounded-lg text-sm focus:border-kerala-red focus:outline-none w-full"
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id || c.name} value={c.name}>{c.name}</option>
                  ))}
                  <option value="__new__">+ New Category</option>
                </select>
              </div>
              {showNewCategory && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Category name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                    className="p-2 border border-gray-200 rounded-lg text-sm focus:border-kerala-red focus:outline-none flex-1"
                    autoFocus
                  />
                  <button
                    onClick={handleAddCategory}
                    disabled={!newCategoryName.trim()}
                    className="bg-kerala-red text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-kerala-redHover disabled:opacity-40"
                  >
                    Add
                  </button>
                </div>
              )}
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold text-gray-500">₹</span>
                <input
                  type="number"
                  placeholder="Price"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                  className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:border-kerala-red focus:outline-none"
                />
              </div>
              <button
                onClick={handleAddItem}
                disabled={!newItem.name || !newItem.category || !newItem.price || saving}
                className="bg-green-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-green-700 disabled:opacity-40"
              >
                Add to Menu
              </button>
            </div>
          </div>
        )}

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
          {categoryNames.map((cat) => (
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
                  } ${!currentAvailable ? 'opacity-50' : ''}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-kerala-charcoal text-sm truncate">{item.name}</span>
                      <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{item.category}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-bold text-gray-500">₹</span>
                      <input
                        type="number"
                        value={currentPrice}
                        onChange={(e) => handlePriceChange(item.id, e.target.value)}
                        className="w-20 text-sm font-bold text-kerala-charcoal border border-gray-200 rounded-lg px-2 py-1.5 focus:border-kerala-red focus:outline-none text-center"
                      />
                    </div>

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
