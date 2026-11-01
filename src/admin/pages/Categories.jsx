import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { Layers, Plus, Edit2, Trash2, X, AlertCircle } from 'lucide-react';

export default function Categories() {
  const { authFetch } = useAdminAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form & Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState('');
  const [error, setError] = useState('');

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setParentId('');
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setParentId(cat.parent_id || '');
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const url = editingCategory ? `/api/categories/${editingCategory.id}` : '/api/categories';
      const method = editingCategory ? 'PUT' : 'POST';

      const res = await authFetch(url, {
        method,
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          parent_id: parentId ? Number(parentId) : null
        })
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Operation failed');
      }

      setIsModalOpen(false);
      loadCategories();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category? Products in it will be unassigned.')) {
      return;
    }
    try {
      const res = await authFetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      loadCategories();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#F2E4D5]">Categories & Collections</h1>
          <p className="text-xs text-[#917765]">
            Organize coffee types, roasts, cold brews, and bakery items.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#6E4E37] to-[#8C5D3B] hover:from-[#7D593E] hover:to-[#9D6A44] text-white text-xs font-semibold shadow-lg shadow-[#6E4E37]/30 flex items-center space-x-2 transition-all self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-[#8C705E]">
            <div className="w-8 h-8 mx-auto border-2 border-[#6E4E37] border-t-[#C49A6C] rounded-full animate-spin mb-2" />
            <p className="text-xs">Loading categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="col-span-full py-12 text-center text-[#735A4A]">
            No categories defined yet.
          </div>
        ) : (
          categories.map((cat) => (
            <div
              key={cat.id}
              className="p-5 rounded-2xl bg-[#160E0A] border border-[#2B1B13] shadow-lg flex flex-col justify-between hover:border-[#6E4E37]/50 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-xl bg-[#221610] text-[#D4A373] border border-[#362217]">
                      <Layers size={16} />
                    </div>
                    <div>
                      <h3 className="text-sm font-serif font-bold text-[#EDE0D4]">{cat.name}</h3>
                      <p className="text-[10px] text-[#8C705E] font-mono">/{cat.slug}</p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#20150E] text-[#C49A6C] border border-[#382317] font-semibold">
                    {cat.product_count || 0} products
                  </span>
                </div>
                <p className="text-xs text-[#9E8372] mt-3 line-clamp-2">
                  {cat.description || 'No description provided.'}
                </p>
              </div>

              <div className="flex items-center justify-end space-x-2 mt-4 pt-3 border-t border-[#221610]">
                <button
                  onClick={() => openEditModal(cat)}
                  className="px-2.5 py-1 rounded-lg bg-[#1F140E] hover:bg-[#2A1B13] text-[#C49A6C] text-xs font-medium border border-[#3A2417] flex items-center space-x-1"
                >
                  <Edit2 size={12} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="px-2.5 py-1 rounded-lg bg-[#1F140E] hover:bg-red-950/60 text-[#8C705E] hover:text-red-400 text-xs font-medium border border-[#3A2417] hover:border-red-800 flex items-center space-x-1"
                >
                  <Trash2 size={12} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#150E0A] border border-[#362217] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#281A12]">
              <h2 className="text-base font-serif font-bold text-[#F2E4D5]">
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#8C705E] hover:text-white">
                <X size={18} />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-950/50 border border-red-800 text-xs text-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#A68C7A] mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Specialty Beans"
                  className="w-full px-3 py-2 bg-[#1E140E] border border-[#3A251A] rounded-xl text-xs text-[#F2E4D5] focus:outline-none focus:border-[#C49A6C]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A68C7A] mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe items in this collection..."
                  className="w-full px-3 py-2 bg-[#1E140E] border border-[#3A251A] rounded-xl text-xs text-[#F2E4D5] focus:outline-none focus:border-[#C49A6C]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-[#251710]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#221610] text-[#A68C7A] text-xs font-medium border border-[#3A2418]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#6E4E37] to-[#8C5D3B] hover:from-[#7D593E] hover:to-[#9D6A44] text-white text-xs font-semibold shadow-lg shadow-[#6E4E37]/30"
                >
                  {editingCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

