'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getAllMenuItems, invalidateMenuCache } from '@/lib/menuCache';
import Navbar from '@/components/Navbar';
import Modal from '@/components/Modal';
import EmojiPicker from '@/components/EmojiPicker';
import { Save, Check, Search, ToggleLeft, ToggleRight, Plus, Trash2, Pencil } from 'lucide-react';

export default function UpdatePricePage() {
  const router = useRouter();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [edits, setEdits] = useState({});

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [newItem, setNewItem] = useState({ name: '', category: '', price: '', seasonal: false, emoji: '🍽️' });
  const [editItem, setEditItem] = useState({ name: '', category: '', price: '', seasonal: false, emoji: '🍽️' });
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);

  useEffect(() => {
    const auth = sessionStorage.getItem('nandanam_auth');
    if (auth !== 'true') { router.push('/login'); return; }
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      const menuData = await getAllMenuItems();
      setMenuItems(menuData);
    } catch (error) {
      console.error('Fetch error:', error);
    }
    setLoading(false);
  };

  const categoryNames = useMemo(() => {
    const cats = [...new Set(menuItems.map((item) => item.category).filter(Boolean))];
    return ['All', ...cats.sort()];
  }, [menuItems]);

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
        emoji: newItem.emoji,
        available: true,
      }])
      .select();
    if (!error && data) {
      await supabase.from('categories').upsert({ name: newItem.category }, { onConflict: 'name' });
      setMenuItems((prev) => [...prev, ...data]);
      invalidateMenuCache();
      setNewItem({ name: '', category: '', price: '', seasonal: false, emoji: '🍽️' });
      setShowAddModal(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  };

  const handleEditItem = async () => {
    if (!editItem.name || !editItem.category || !editItem.price) return;
    setSaving(true);
    const { error } = await supabase
      .from('menu_items')
      .update({
        name: editItem.name,
        category: editItem.category,
        price: Number(editItem.price),
        seasonal: editItem.seasonal,
        emoji: editItem.emoji,
      })
      .eq('id', editItem.id);
    if (!error) {
      await supabase.from('categories').upsert({ name: editItem.category }, { onConflict: 'name' });
      setMenuItems((prev) =>
        prev.map((item) =>
          item.id === editItem.id
            ? { ...item, ...editItem, price: Number(editItem.price) }
            : item
        )
      );
      invalidateMenuCache();
      setShowEditModal(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from('menu_items').delete().eq('id', id);
    if (!error) {
      setMenuItems((prev) => prev.filter((item) => item.id !== id));
      invalidateMenuCache();
      setShowDeleteConfirm(null);
    }
  };

  const openEdit = (item) => {
    setEditItem({ ...item });
    setShowEditModal(item);
  };

  const getCurrentPrice = (item) => edits[item.id]?.price !== undefined ? edits[item.id].price : item.price;
  const getCurrentSeasonal = (item) => edits[item.id]?.seasonal !== undefined ? edits[item.id].seasonal : item.seasonal;
  const getCurrentAvailable = (item) => edits[item.id]?.available !== undefined ? edits[item.id].available : item.available;

  return (
    <div className="min-h-screen bg-kerala-cream pb-20 sm:pb-12 sm:ml-56">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-kerala-charcoal">Menu</h2>
          <div className="flex gap-2">
            {hasChanges && (
              <button onClick={handleSave} disabled={saving}
                className="bg-kerala-red text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-kerala-redHover flex items-center gap-2 disabled:opacity-50">
                {saved ? <><Check size={16} /> Saved!</> : saving ? 'Saving...' : <><Save size={16} /> Save Changes</>}
              </button>
            )}
            <button onClick={() => setShowAddModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-green-700 flex items-center gap-2">
              <Plus size={16} /> Add Item
            </button>
          </div>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input type="text" placeholder="Search item..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:border-kerala-red focus:outline-none shadow-sm" />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar mb-4">
          {categoryNames.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
                activeCategory === cat
                  ? 'bg-kerala-red text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}>
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
              const currentPrice = getCurrentPrice(item);
              const currentSeasonal = getCurrentSeasonal(item);
              const currentAvailable = getCurrentAvailable(item);
              return (
                <div key={item.id}
                  className={`bg-white p-3 rounded-xl border shadow-sm flex flex-col sm:flex-row sm:items-center gap-3 transition ${
                    !currentAvailable ? 'opacity-50' : 'border-gray-100'
                  }`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{item.emoji || '🍽️'}</span>
                      <span className="font-bold text-kerala-charcoal text-sm truncate">{item.name}</span>
                      <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{item.category}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-bold text-gray-500">₹</span>
                      <input type="number" value={currentPrice}
                        onChange={(e) => handlePriceChange(item.id, e.target.value)}
                        className="w-20 text-sm font-bold text-kerala-charcoal border border-gray-200 rounded-lg px-2 py-1.5 focus:border-kerala-red focus:outline-none text-center" />
                    </div>
                    <button onClick={() => handleToggleSeasonal(item.id)}
                      className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1.5 rounded-lg border transition ${
                        currentSeasonal ? 'bg-orange-50 border-orange-300 text-orange-600' : 'bg-gray-50 border-gray-200 text-gray-400'
                      }`}>
                      {currentSeasonal ? <ToggleRight size={14} /> : <ToggleLeft size={14} />} Seasonal
                    </button>
                    <button onClick={() => handleToggleAvailable(item.id)}
                      className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1.5 rounded-lg border transition ${
                        currentAvailable ? 'bg-green-50 border-green-300 text-green-600' : 'bg-red-50 border-red-300 text-red-500'
                      }`}>
                      {currentAvailable ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                      {currentAvailable ? 'Active' : 'Hidden'}
                    </button>
                    <button onClick={() => openEdit(item)}
                      className="text-gray-400 hover:text-blue-600 transition p-1.5" title="Edit item">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => setShowDeleteConfirm(item)}
                      className="text-gray-400 hover:text-red-600 transition p-1.5" title="Delete item">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Add Item Modal */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Item">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <button onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="text-3xl p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              {newItem.emoji}
            </button>
            <input type="text" placeholder="Item name" value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              className="flex-1 p-2.5 border border-gray-200 rounded-lg text-sm focus:border-kerala-red focus:outline-none" />
          </div>
          {showEmojiPicker && (
            <EmojiPicker selected={newItem.emoji} onSelect={(emoji) => { setNewItem({ ...newItem, emoji }); setShowEmojiPicker(false); }} />
          )}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <select value={showNewCategory ? '__new__' : newItem.category}
                onChange={(e) => {
                  if (e.target.value === '__new__') { setShowNewCategory(true); }
                  else { setShowNewCategory(false); setNewItem({ ...newItem, category: e.target.value }); }
                }}
                className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:border-kerala-red focus:outline-none">
                <option value="">Select category</option>
                {categoryNames.filter((c) => c !== 'All').map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
                <option value="__new__">+ New Category</option>
              </select>
            </div>
            {showNewCategory && (
              <div className="flex gap-2 flex-1">
                <input type="text" placeholder="New category" value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && newCategoryName.trim() && supabase.from('categories').upsert({ name: newCategoryName.trim() }).then(() => { setNewItem((p) => ({ ...p, category: newCategoryName.trim() })); setNewCategoryName(''); setShowNewCategory(false); })}
                  className="flex-1 p-2.5 border border-gray-200 rounded-lg text-sm focus:border-kerala-red focus:outline-none" autoFocus />
                <button onClick={() => { if (newCategoryName.trim()) { supabase.from('categories').upsert({ name: newCategoryName.trim() }).then(() => { setNewItem((p) => ({ ...p, category: newCategoryName.trim() })); setNewCategoryName(''); setShowNewCategory(false); }); }}}
                  className="bg-kerala-red text-white px-3 rounded-lg text-xs font-bold hover:bg-kerala-redHover disabled:opacity-40" disabled={!newCategoryName.trim()}>Add</button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-500">₹</span>
            <input type="number" placeholder="Price" value={newItem.price}
              onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
              className="flex-1 p-2.5 border border-gray-200 rounded-lg text-sm focus:border-kerala-red focus:outline-none" />
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={() => setShowAddModal(false)}
              className="flex-1 py-2.5 rounded-lg text-sm font-bold border border-gray-200 hover:bg-gray-50 transition">Cancel</button>
            <button onClick={handleAddItem} disabled={!newItem.name || !newItem.category || !newItem.price || saving}
              className="flex-1 py-2.5 rounded-lg text-sm font-bold bg-green-600 text-white hover:bg-green-700 disabled:opacity-40 transition">
              {saving ? 'Adding...' : 'Add to Menu'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Item Modal */}
      <Modal open={!!showEditModal} onClose={() => setShowEditModal(null)} title="Edit Item">
        {showEditModal && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <button onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="text-3xl p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                {editItem.emoji}
              </button>
              <input type="text" placeholder="Item name" value={editItem.name}
                onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                className="flex-1 p-2.5 border border-gray-200 rounded-lg text-sm focus:border-kerala-red focus:outline-none" />
            </div>
            {showEmojiPicker && (
              <EmojiPicker selected={editItem.emoji} onSelect={(emoji) => { setEditItem({ ...editItem, emoji }); setShowEmojiPicker(false); }} />
            )}
            <div className="flex gap-3">
              <div className="flex-1">
                <select value={editItem.category}
                  onChange={(e) => setEditItem({ ...editItem, category: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:border-kerala-red focus:outline-none">
                  {categoryNames.filter((c) => c !== 'All').map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-500">₹</span>
              <input type="number" placeholder="Price" value={editItem.price}
                onChange={(e) => setEditItem({ ...editItem, price: e.target.value })}
                className="flex-1 p-2.5 border border-gray-200 rounded-lg text-sm focus:border-kerala-red focus:outline-none" />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" checked={editItem.seasonal}
                onChange={(e) => setEditItem({ ...editItem, seasonal: e.target.checked })}
                className="rounded border-gray-300" />
              Seasonal item
            </label>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowEditModal(null)}
                className="flex-1 py-2.5 rounded-lg text-sm font-bold border border-gray-200 hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleEditItem} disabled={!editItem.name || !editItem.category || !editItem.price || saving}
                className="flex-1 py-2.5 rounded-lg text-sm font-bold bg-kerala-red text-white hover:bg-kerala-redHover disabled:opacity-40 transition">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={!!showDeleteConfirm} onClose={() => setShowDeleteConfirm(null)} title="Delete Item">
        {showDeleteConfirm && (
          <div>
            <p className="text-gray-600 text-sm mb-1">
              Are you sure you want to delete <strong>{showDeleteConfirm.name}</strong>?
            </p>
            <p className="text-gray-400 text-xs mb-5">This action cannot be undone.</p>
            <div className="flex gap-2">
              <button onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-lg text-sm font-bold border border-gray-200 hover:bg-gray-50 transition">Cancel</button>
              <button onClick={() => handleDelete(showDeleteConfirm.id)}
                className="flex-1 py-2.5 rounded-lg text-sm font-bold bg-red-600 text-white hover:bg-red-700 transition">Delete</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
