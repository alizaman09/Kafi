import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import {
  Coffee,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Check,
  X,
  AlertCircle,
  UploadCloud,
  Star,
  Layers,
  Tag,
  Link2,
  Smartphone,
  ExternalLink,
  RefreshCw
} from 'lucide-react';

export default function Products() {
  const { authFetch } = useAdminAuth();
  const location = useLocation();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filter
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortOrder, setSortOrder] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Form State (Simplified Cafe Menu Management)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    regular_price: '',
    category_id: '',
    is_featured: false,
    images: []
  });

  // Dedicated Image Handling State (Option 1: Device Upload vs Option 2: Image URL)
  const [imageMode, setImageMode] = useState('device'); // 'device' | 'url'
  const [uploadingImage, setUploadingImage] = useState(false);
  const [verifyingUrl, setVerifyingUrl] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [urlSuccess, setUrlSuccess] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [brokenThumbnails, setBrokenThumbnails] = useState({});

  // Open modal if ?new=true query param is present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('new') === 'true') {
      openAddModal();
    }
  }, [location.search]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [prodsRes, catsRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories')
      ]);
      const prods = await prodsRes.json();
      const cats = await catsRes.json();
      setProducts(prods);
      setCategories(cats);
    } catch (err) {
      setError('Failed to fetch menu catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setUploadError('');
    setUrlSuccess('');
    setPreviewUrl('');
    setCustomImageUrl('');
    setImageMode('device');
    setFormData({
      name: '',
      description: '',
      regular_price: '',
      category_id: categories[0]?.id || '',
      is_featured: false,
      images: []
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setUploadError('');
    setUrlSuccess('');
    const existingImg = product.images && product.images.length > 0 ? product.images[0] : '';
    setPreviewUrl(existingImg);
    if (existingImg.startsWith('http://') || existingImg.startsWith('https://')) {
      setImageMode('url');
      setCustomImageUrl(existingImg);
    } else {
      setImageMode('device');
      setCustomImageUrl('');
    }
    setFormData({
      name: product.name,
      description: product.description || '',
      regular_price: product.regular_price,
      category_id: product.category_id || '',
      is_featured: Boolean(product.is_featured),
      images: product.images || []
    });
    setIsModalOpen(true);
  };

  // OPTION 1: UPLOAD FROM DEVICE
  const handleImageFileUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif', 'image/svg+xml'];
    if (!validTypes.includes(file.type.toLowerCase()) && !file.name.match(/\.(jpg|jpeg|png|webp|svg|gif)$/i)) {
      setUploadError('Invalid file format: Please select a valid JPG, JPEG, PNG, or WEBP image.');
      return;
    }

    setUploadError('');
    setUrlSuccess('');
    setUploadingImage(true);

    // Instant local preview for immediate visual feedback
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);

    const data = new FormData();
    data.append('images', file);

    try {
      const res = await authFetch('/api/upload', {
        method: 'POST',
        body: data
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Server failed to save uploaded image');
      }

      if (result.urls && result.urls.length > 0) {
        const storedUrl = result.urls[0];
        // Save exact persistent storage URL
        setFormData(prev => ({
          ...prev,
          images: [storedUrl]
        }));
        setPreviewUrl(storedUrl);
        setUrlSuccess('Device image uploaded and stored permanently!');
      }
    } catch (err) {
      setUploadError(err.message || 'Image upload failed. Please try another image.');
      setPreviewUrl('');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  // OPTION 2: DIRECT IMAGE URL VERIFICATION & ATTACHMENT
  const handleVerifyAndSetUrl = () => {
    const raw = customImageUrl.trim();
    if (!raw) {
      setUploadError('Please paste or enter an image URL.');
      return;
    }

    // Require valid URL or root-relative path
    if (!raw.startsWith('http://') && !raw.startsWith('https://') && !raw.startsWith('/') && !raw.startsWith('data:')) {
      setUploadError('Please enter a valid URL starting with https://, http://, or /assets/...');
      return;
    }

    setVerifyingUrl(true);
    setUploadError('');
    setUrlSuccess('');

    // Pre-load image to verify accessibility
    const testImg = new Image();
    testImg.onload = () => {
      setVerifyingUrl(false);
      setFormData(prev => ({
        ...prev,
        images: [raw]
      }));
      setPreviewUrl(raw);
      setUrlSuccess('Image URL verified and applied successfully!');
    };
    testImg.onerror = () => {
      setVerifyingUrl(false);
      setUploadError('Failed to load image from URL. Please ensure it is a direct image link (PNG, JPG, WebP) and publicly accessible.');
    };
    testImg.src = raw;
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      images: []
    }));
    setPreviewUrl('');
    setCustomImageUrl('');
    setUploadError('');
    setUrlSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || formData.regular_price === '') {
      alert('Please provide menu item name and regular price.');
      return;
    }
    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await authFetch(url, {
        method,
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim(),
          regular_price: Number(formData.regular_price),
          category_id: formData.category_id ? Number(formData.category_id) : null,
          is_featured: formData.is_featured ? 1 : 0,
          images: formData.images,
          stock_quantity: 999
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save menu item');
      }

      setIsModalOpen(false);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await authFetch(`/api/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete menu item');
      setDeleteConfirmId(null);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Filter products
  const filteredProducts = (products || []).filter(p => {
    const s = (search || '').trim().toLowerCase();
    const pName = (p?.name || '').toLowerCase();
    const pDesc = (p?.description || '').toLowerCase();
    const matchesSearch =
      s === '' ||
      pName.includes(s) ||
      pDesc.includes(s);
    const matchesCategory = selectedCategory === '' || String(p?.category_id) === String(selectedCategory);
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (sortOrder === 'price_asc') return (a?.regular_price || 0) - (b?.regular_price || 0);
    if (sortOrder === 'price_desc') return (b?.regular_price || 0) - (a?.regular_price || 0);
    if (sortOrder === 'name') return (a?.name || '').localeCompare(b?.name || '');
    return (b?.id || 0) - (a?.id || 0);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#F2E4D5]">Cafe Menu Catalog</h1>
          <p className="text-xs text-[#917765]">Manage coffees, brews, pastries and cafe items displayed on your website.</p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#6E4E37] to-[#8C5D3B] hover:from-[#7D593E] hover:to-[#9D6A44] text-white text-xs font-semibold shadow-lg shadow-[#6E4E37]/30 flex items-center space-x-2 transition-all self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Add New Menu Item</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#160E0A] border border-[#2B1B13] grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-3 text-[#7A6150]" />
          <input
            type="text"
            placeholder="Search menu items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#1F1510] border border-[#3A251A] rounded-xl text-xs text-[#F2E4D5] placeholder-[#7A6150] focus:outline-none focus:border-[#C49A6C]"
          />
        </div>

        {/* Category */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full px-3 py-2 bg-[#1F1510] border border-[#3A251A] rounded-xl text-xs text-[#F2E4D5] focus:outline-none focus:border-[#C49A6C]"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="w-full px-3 py-2 bg-[#1F1510] border border-[#3A251A] rounded-xl text-xs text-[#F2E4D5] focus:outline-none focus:border-[#C49A6C]"
        >
          <option value="">Sort: Newest First</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="name">Name: A to Z</option>
        </select>
      </div>

      {/* Product List Table */}
      <div className="bg-[#160E0A] border border-[#2B1B13] rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#2B1B13] text-[#8C705E] uppercase tracking-wider font-semibold bg-[#1A110C]">
                <th className="py-3 px-4">Item</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Featured</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#221610]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#8C705E]">
                    <div className="w-8 h-8 mx-auto border-2 border-[#6E4E37] border-t-[#C49A6C] rounded-full animate-spin mb-2" />
                    <span>Loading menu items...</span>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#735A4A]">
                    No menu items found.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const firstImage = p.images && p.images.length > 0 ? p.images[0] : null;
                  return (
                    <tr key={p.id} className="hover:bg-[#1C120B]/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-xl bg-[#241710] border border-[#3A2417] flex items-center justify-center overflow-hidden flex-shrink-0 p-1 shadow-inner">
                            {firstImage && !brokenThumbnails[p.id] ? (
                              <img
                                src={firstImage}
                                alt={p.name}
                                onError={() => setBrokenThumbnails(prev => ({ ...prev, [p.id]: true }))}
                                className="max-h-full max-w-full object-contain"
                              />
                            ) : (
                              <Coffee size={20} className="text-[#8C6D53]" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-[#EDE0D4]">{p.name}</p>
                            <p className="text-[10px] text-[#856D5B] line-clamp-1 max-w-[220px]">
                              {p.description || 'No description'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-[#A89281]">
                        {p.category_name || 'Uncategorized'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-emerald-400">
                          PKR {p.regular_price}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {p.is_featured ? (
                          <span className="inline-flex items-center space-x-1 text-[11px] text-amber-300">
                            <Star size={12} className="fill-amber-400 text-amber-400" />
                            <span>Yes</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-[#695345]">No</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => openEditModal(p)}
                            title="Edit Menu Item"
                            className="p-1.5 rounded-lg bg-[#221610] hover:bg-[#2C1D15] text-[#C49A6C] hover:text-[#E8C49F] border border-[#3A2418] transition-colors"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(p.id)}
                            title="Delete Menu Item"
                            className="p-1.5 rounded-lg bg-[#221610] hover:bg-red-950/60 text-[#8C6D53] hover:text-red-400 border border-[#3A2418] hover:border-red-800 transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#18100B] border border-[#3A2417] rounded-2xl p-6 max-w-sm w-full space-y-4">
            <div className="w-10 h-10 rounded-full bg-red-950 text-red-400 flex items-center justify-center mx-auto">
              <Trash2 size={20} />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-[#F2E4D5]">Delete Product?</h3>
              <p className="text-xs text-[#8C705E] mt-1">
                This item will be permanently removed from both the admin inventory and the storefront menu.
              </p>
            </div>
            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 rounded-xl bg-[#221610] hover:bg-[#2C1D15] text-[#A68C7A] text-xs font-medium border border-[#3A2418]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 py-2 rounded-xl bg-red-800 hover:bg-red-700 text-white text-xs font-semibold shadow-lg shadow-red-950"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#150E0A] border border-[#362217] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#281A12] flex items-center justify-between">
              <div>
                <h2 className="text-base font-serif font-bold text-[#F2E4D5]">
                  {editingProduct ? 'Edit Menu Item' : 'Add New Menu Item'}
                </h2>
                <p className="text-[11px] text-[#8C705E]">
                  Updates reflect instantly on the KAFI storefront menu & scrollytelling.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-[#8C705E] hover:text-[#EDE0D4]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Body - Simplified for Cafe Menu */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-medium text-[#A68C7A] mb-1">
                  Menu Item Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Spanish Latte, Butter Almond Croissant"
                  className="w-full px-3 py-2 bg-[#1E140E] border border-[#3A251A] rounded-xl text-xs text-[#F2E4D5] focus:outline-none focus:border-[#C49A6C]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-[#A68C7A] mb-1">
                  Description / Tasting Notes
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Artisanal notes, flavor profile, ingredients..."
                  className="w-full px-3 py-2 bg-[#1E140E] border border-[#3A251A] rounded-xl text-xs text-[#F2E4D5] focus:outline-none focus:border-[#C49A6C]"
                />
              </div>

              {/* Regular Price & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#A68C7A] mb-1">
                    Regular Price (PKR) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1"
                    value={formData.regular_price}
                    onChange={(e) => setFormData({ ...formData, regular_price: e.target.value })}
                    placeholder="750"
                    className="w-full px-3 py-2 bg-[#1E140E] border border-[#3A251A] rounded-xl text-xs text-[#F2E4D5] focus:outline-none focus:border-[#C49A6C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#A68C7A] mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-3 py-2 bg-[#1E140E] border border-[#3A251A] rounded-xl text-xs text-[#F2E4D5] focus:outline-none focus:border-[#C49A6C]"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Featured Checkbox */}
              <div className="p-3 bg-[#1A110C] border border-[#2B1B13] rounded-xl">
                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-4 h-4 rounded text-[#C49A6C] focus:ring-[#C49A6C] bg-[#1E140E] border-[#3A251A]"
                  />
                  <span className="text-xs text-[#EDE0D4] font-medium">
                    Feature on Storefront Homepage
                  </span>
                </label>
              </div>

              {/* Two Options for Product Images: Upload from Device vs Direct URL */}
              <div className="p-4 rounded-xl bg-[#1A110C] border border-[#2B1B13] space-y-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-semibold text-[#D4A373]">
                      Product Image
                    </label>
                    <p className="text-[10px] text-[#8C705E]">
                      Select how you want to add this product's image:
                    </p>
                  </div>
                  {previewUrl && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-400 font-medium flex items-center gap-1">
                      <Check size={10} /> Image Attached
                    </span>
                  )}
                </div>

                {/* Option Switcher Tabs */}
                <div className="grid grid-cols-2 gap-2 bg-[#120B07] p-1 rounded-xl border border-[#2B1A12]">
                  <button
                    type="button"
                    onClick={() => {
                      setImageMode('device');
                      setUploadError('');
                      setUrlSuccess('');
                    }}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${imageMode === 'device'
                        ? 'bg-[#6E4E37] text-white shadow-md'
                        : 'text-[#A68C7A] hover:text-[#EDE0D4] hover:bg-[#1E130D]'
                      }`}
                  >
                    <UploadCloud size={14} className={imageMode === 'device' ? 'text-amber-200' : ''} />
                    <span>Option 1: Upload from Device</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setImageMode('url');
                      setUploadError('');
                      setUrlSuccess('');
                    }}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${imageMode === 'url'
                        ? 'bg-[#6E4E37] text-white shadow-md'
                        : 'text-[#A68C7A] hover:text-[#EDE0D4] hover:bg-[#1E130D]'
                      }`}
                  >
                    <Link2 size={14} className={imageMode === 'url' ? 'text-amber-200' : ''} />
                    <span>Option 2: Image URL</span>
                  </button>
                </div>

                {/* Feedback Alerts */}
                {uploadError && (
                  <div className="p-3 rounded-xl bg-red-950/70 border border-red-800 text-xs text-red-200 flex items-start space-x-2">
                    <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                    <span>{uploadError}</span>
                  </div>
                )}
                {urlSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-800 text-xs text-emerald-200 flex items-start space-x-2">
                    <Check size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>{urlSuccess}</span>
                  </div>
                )}

                {/* Option 1: Upload from Device */}
                {imageMode === 'device' && (
                  <div className="space-y-2">
                    <label className="w-full h-32 rounded-xl border-2 border-dashed border-[#422C1E] hover:border-[#C49A6C] bg-[#140D09] hover:bg-[#19110B] flex flex-col items-center justify-center text-center p-4 cursor-pointer transition-all group">
                      {uploadingImage ? (
                        <div className="flex flex-col items-center space-y-2 text-xs text-[#C49A6C]">
                          <div className="w-7 h-7 border-2 border-white/20 border-t-[#C49A6C] rounded-full animate-spin" />
                          <span>Uploading image to persistent storage...</span>
                        </div>
                      ) : (
                        <>
                          <div className="w-10 h-10 rounded-full bg-[#241710] group-hover:bg-[#321F14] text-[#C49A6C] flex items-center justify-center mb-1.5 transition-colors">
                            <UploadCloud size={20} />
                          </div>
                          <p className="text-xs font-semibold text-[#EDE0D4] group-hover:text-[#F5EAE0]">
                            Choose image from Computer or Mobile device
                          </p>
                          <p className="text-[10px] text-[#8C705E] mt-0.5">
                            Supports JPG, JPEG, PNG, WEBP (Saved directly in persistent storage)
                          </p>
                        </>
                      )}
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                        disabled={uploadingImage}
                        onChange={handleImageFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}

                {/* Option 2: Image URL */}
                {imageMode === 'url' && (
                  <div className="space-y-2">
                    <p className="text-[11px] text-[#A68C7A]">
                      Enter a direct image URL from the web or an existing asset path:
                    </p>
                    <div className="flex items-center space-x-2">
                      <input
                        type="url"
                        placeholder="https://example.com/coffee.jpg or /assets/cups/cup_clean_1.png"
                        value={customImageUrl}
                        onChange={(e) => setCustomImageUrl(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleVerifyAndSetUrl();
                          }
                        }}
                        className="flex-1 px-3 py-2 bg-[#140D09] border border-[#3A251A] rounded-xl text-xs text-[#F2E4D5] focus:outline-none focus:border-[#C49A6C]"
                      />
                      <button
                        type="button"
                        disabled={verifyingUrl || !customImageUrl.trim()}
                        onClick={handleVerifyAndSetUrl}
                        className="px-4 py-2 rounded-xl bg-[#281A12] hover:bg-[#382419] disabled:opacity-50 text-[#C49A6C] hover:text-[#E8C49F] text-xs font-semibold border border-[#3E2518] transition-colors flex items-center gap-1.5"
                      >
                        {verifyingUrl ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-[#C49A6C] rounded-full animate-spin" />
                            <span>Verifying...</span>
                          </>
                        ) : (
                          <>
                            <Check size={14} />
                            <span>Apply URL</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Active Image Preview & Management */}
                {(previewUrl || (formData.images && formData.images.length > 0)) && (
                  <div className="pt-2 border-t border-[#261811] space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-[#EDE0D4] flex items-center gap-1.5">
                        <ImageIcon size={13} className="text-[#C49A6C]" />
                        <span>Active Image Preview</span>
                      </span>
                      <span className="text-[10px] text-[#8C705E] font-mono truncate max-w-[250px]">
                        {previewUrl || formData.images[0]}
                      </span>
                    </div>

                    <div className="relative w-full h-44 bg-[#0E0906] rounded-xl border border-[#3A2417] flex items-center justify-center p-3 overflow-hidden shadow-inner group">
                      <img
                        src={previewUrl || formData.images[0]}
                        alt="Product Preview"
                        onError={() => setUploadError('Warning: This image failed to render. Please check the URL or upload a new image.')}
                        className="max-h-full max-w-full object-contain select-none"
                      />
                      {uploadingImage && (
                        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-xs text-[#EAD18D] space-y-2">
                          <div className="w-7 h-7 border-2 border-white/20 border-t-[#C49A6C] rounded-full animate-spin" />
                          <span>Uploading image...</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="text-[10px] text-[#A68C7A]">
                        {previewUrl?.startsWith('http') ? (
                          <span className="text-sky-400 font-medium">Linked via External URL</span>
                        ) : previewUrl?.startsWith('/uploads/') ? (
                          <span className="text-emerald-400 font-medium">Stored in /public/uploads/</span>
                        ) : (
                          <span className="text-[#C49A6C] font-medium">Local Asset File</span>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        {imageMode === 'device' && (
                          <label className="px-3 py-1 rounded-lg bg-[#251710] hover:bg-[#342217] text-[#C49A6C] text-xs font-medium border border-[#3E271B] cursor-pointer transition-colors">
                            Replace File
                            <input
                              type="file"
                              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                              disabled={uploadingImage}
                              onChange={handleImageFileUpload}
                              className="hidden"
                            />
                          </label>
                        )}
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="px-2.5 py-1 rounded-lg bg-red-950/50 hover:bg-red-900/60 text-red-300 text-xs font-medium border border-red-800/60 transition-colors"
                        >
                          Remove Image
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#281A12]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#221610] hover:bg-[#2C1D15] text-[#A68C7A] text-xs font-medium border border-[#3A2418]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#6E4E37] to-[#8C5D3B] hover:from-[#7D593E] hover:to-[#9D6A44] text-white text-xs font-semibold shadow-lg shadow-[#6E4E37]/30"
                >
                  {editingProduct ? 'Save Changes' : 'Add Menu Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

