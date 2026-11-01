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
  Tag
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

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    regular_price: '',
    sale_price: '',
    category_id: '',
    stock_quantity: '',
    is_featured: false,
    images: [],
    sizes: [],
    colors: [],
    variants: []
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [sizeInput, setSizeInput] = useState('');
  const [variantInput, setVariantInput] = useState({ name: '', price: '', stock: '' });

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
      setError('Failed to fetch product catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: 'KF-' + Math.floor(100 + Math.random() * 900),
      description: '',
      regular_price: '',
      sale_price: '',
      category_id: categories[0]?.id || '',
      stock_quantity: '20',
      is_featured: false,
      images: [],
      sizes: ['Regular', 'Large'],
      colors: [],
      variants: []
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      description: product.description || '',
      regular_price: product.regular_price,
      sale_price: product.sale_price || '',
      category_id: product.category_id || '',
      stock_quantity: product.stock_quantity,
      is_featured: Boolean(product.is_featured),
      images: product.images || [],
      sizes: product.sizes || [],
      colors: product.colors || [],
      variants: product.variants || []
    });
    setIsModalOpen(true);
  };

  const handleImageFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const data = new FormData();
    for (let i = 0; i < files.length; i++) {
      data.append('images', files[i]);
    }

    try {
      setUploadingImage(true);
      const res = await authFetch('/api/upload', {
        method: 'POST',
        body: data
      });
      const result = await res.json();
      if (result.urls) {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...result.urls]
        }));
      }
    } catch (err) {
      alert('Image upload failed: ' + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddImageUrl = () => {
    if (!customImageUrl.trim()) return;
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, customImageUrl.trim()]
    }));
    setCustomImageUrl('');
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleAddSize = () => {
    if (!sizeInput.trim()) return;
    if (!formData.sizes.includes(sizeInput.trim())) {
      setFormData(prev => ({
        ...prev,
        sizes: [...prev.sizes, sizeInput.trim()]
      }));
    }
    setSizeInput('');
  };

  const handleRemoveSize = (size) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.filter(s => s !== size)
    }));
  };

  const handleAddVariant = () => {
    if (!variantInput.name.trim() || !variantInput.price) return;
    setFormData(prev => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          name: variantInput.name.trim(),
          price: Number(variantInput.price),
          stock: Number(variantInput.stock || 0)
        }
      ]
    }));
    setVariantInput({ name: '', price: '', stock: '' });
  };

  const handleRemoveVariant = (index) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await authFetch(url, {
        method,
        body: JSON.stringify({
          ...formData,
          regular_price: Number(formData.regular_price),
          sale_price: formData.sale_price ? Number(formData.sale_price) : null,
          category_id: formData.category_id ? Number(formData.category_id) : null,
          stock_quantity: Number(formData.stock_quantity),
          is_featured: formData.is_featured ? 1 : 0
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save product');
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
      if (!res.ok) throw new Error('Failed to delete product');
      setDeleteConfirmId(null);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesSearch =
      search === '' ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === '' || String(p.category_id) === String(selectedCategory);
    const matchesStatus = selectedStatus === '' || p.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  }).sort((a, b) => {
    if (sortOrder === 'price_asc') return a.regular_price - b.regular_price;
    if (sortOrder === 'price_desc') return b.regular_price - a.regular_price;
    if (sortOrder === 'stock_asc') return a.stock_quantity - b.stock_quantity;
    if (sortOrder === 'name') return a.name.localeCompare(b.name);
    return b.id - a.id;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#F2E4D5]">Product Catalog</h1>
          <p className="text-xs text-[#917765]">Manage physical coffee beans, brews, pastries and custom options.</p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#6E4E37] to-[#8C5D3B] hover:from-[#7D593E] hover:to-[#9D6A44] text-white text-xs font-semibold shadow-lg shadow-[#6E4E37]/30 flex items-center space-x-2 transition-all self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#160E0A] border border-[#2B1B13] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-3 text-[#7A6150]" />
          <input
            type="text"
            placeholder="Search by name or SKU..."
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

        {/* Status */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="w-full px-3 py-2 bg-[#1F1510] border border-[#3A251A] rounded-xl text-xs text-[#F2E4D5] focus:outline-none focus:border-[#C49A6C]"
        >
          <option value="">All Stock Statuses</option>
          <option value="in_stock">In Stock (&gt;10)</option>
          <option value="low_stock">Low Stock (≤10)</option>
          <option value="out_of_stock">Out of Stock (0)</option>
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
          <option value="stock_asc">Stock: Lowest First</option>
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
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Featured</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#221610]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#8C705E]">
                    <div className="w-8 h-8 mx-auto border-2 border-[#6E4E37] border-t-[#C49A6C] rounded-full animate-spin mb-2" />
                    <span>Loading products...</span>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#735A4A]">
                    No products found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const firstImage = p.images && p.images.length > 0 ? p.images[0] : null;
                  return (
                    <tr key={p.id} className="hover:bg-[#1C120B]/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-lg bg-[#241710] border border-[#3A2417] flex items-center justify-center overflow-hidden flex-shrink-0">
                            {firstImage ? (
                              <img
                                src={firstImage}
                                alt={p.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            ) : (
                              <Coffee size={18} className="text-[#8C6D53]" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-[#EDE0D4]">{p.name}</p>
                            <p className="text-[10px] text-[#856D5B] line-clamp-1 max-w-[200px]">
                              {p.description || 'No description'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[#D4A373]">
                        {p.sku}
                      </td>
                      <td className="py-3.5 px-4 text-[#A89281]">
                        {p.category_name || 'Uncategorized'}
                      </td>
                      <td className="py-3.5 px-4">
                        {p.sale_price ? (
                          <div>
                            <span className="font-semibold text-emerald-400">
                              PKR {p.sale_price}
                            </span>
                            <span className="text-[10px] text-[#786151] line-through ml-1.5">
                              {p.regular_price}
                            </span>
                          </div>
                        ) : (
                          <span className="font-semibold text-[#EDE0D4]">
                            PKR {p.regular_price}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                            p.stock_quantity <= 0
                              ? 'bg-red-950/80 text-red-300 border-red-800'
                              : p.stock_quantity <= 10
                              ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                              : 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                          }`}
                        >
                          {p.stock_quantity} in stock
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
                            title="Edit Product"
                            className="p-1.5 rounded-lg bg-[#221610] hover:bg-[#2C1D15] text-[#C49A6C] hover:text-[#E8C49F] border border-[#3A2418] transition-colors"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(p.id)}
                            title="Delete Product"
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
                  {editingProduct ? 'Edit Coffee Product' : 'Add New Physical Product'}
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

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Product Name */}
                <div>
                  <label className="block text-xs font-medium text-[#A68C7A] mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Spanish Latte"
                    className="w-full px-3 py-2 bg-[#1E140E] border border-[#3A251A] rounded-xl text-xs text-[#F2E4D5] focus:outline-none focus:border-[#C49A6C]"
                  />
                </div>

                {/* SKU */}
                <div>
                  <label className="block text-xs font-medium text-[#A68C7A] mb-1">
                    SKU Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="e.g. KF-LAT-001"
                    className="w-full px-3 py-2 bg-[#1E140E] border border-[#3A251A] rounded-xl text-xs text-[#F2E4D5] focus:outline-none focus:border-[#C49A6C] font-mono"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-[#A68C7A] mb-1">
                  Product Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Artisanal notes, origins, flavor profile..."
                  className="w-full px-3 py-2 bg-[#1E140E] border border-[#3A251A] rounded-xl text-xs text-[#F2E4D5] focus:outline-none focus:border-[#C49A6C]"
                />
              </div>

              {/* Pricing & Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#A68C7A] mb-1">
                    Regular Price (PKR) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.regular_price}
                    onChange={(e) => setFormData({ ...formData, regular_price: e.target.value })}
                    placeholder="750"
                    className="w-full px-3 py-2 bg-[#1E140E] border border-[#3A251A] rounded-xl text-xs text-[#F2E4D5] focus:outline-none focus:border-[#C49A6C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#A68C7A] mb-1">
                    Sale Price (Optional)
                  </label>
                  <input
                    type="number"
                    value={formData.sale_price}
                    onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                    placeholder="699"
                    className="w-full px-3 py-2 bg-[#1E140E] border border-[#3A251A] rounded-xl text-xs text-[#F2E4D5] focus:outline-none focus:border-[#C49A6C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#A68C7A] mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                    placeholder="25"
                    className="w-full px-3 py-2 bg-[#1E140E] border border-[#3A251A] rounded-xl text-xs text-[#F2E4D5] focus:outline-none focus:border-[#C49A6C]"
                  />
                </div>
              </div>

              {/* Category & Featured */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
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
                <div className="pt-5">
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
              </div>

              {/* Images Section */}
              <div className="p-3.5 rounded-xl bg-[#1A110C] border border-[#2B1B13] space-y-3">
                <label className="block text-xs font-semibold text-[#D4A373]">
                  Product Images
                </label>
                <div className="flex flex-wrap gap-2">
                  {formData.images.map((img, idx) => (
                    <div key={idx} className="relative w-14 h-14 rounded-lg bg-[#241710] border border-[#3A2417] overflow-hidden group">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 text-red-400 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}

                  <label className="w-14 h-14 rounded-lg border border-dashed border-[#4A3223] hover:border-[#C49A6C] flex flex-col items-center justify-center text-[#8C705E] hover:text-[#C49A6C] cursor-pointer transition-colors">
                    {uploadingImage ? (
                      <div className="w-4 h-4 border border-t-[#C49A6C] rounded-full animate-spin" />
                    ) : (
                      <>
                        <UploadCloud size={16} />
                        <span className="text-[9px] mt-0.5">Upload</span>
                      </>
                    )}
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Or paste image URL (e.g. /images/spanish-latte.png)"
                    value={customImageUrl}
                    onChange={(e) => setCustomImageUrl(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-[#1F1510] border border-[#3A251A] rounded-lg text-xs text-[#F2E4D5] focus:outline-none focus:border-[#C49A6C]"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-3 py-1.5 rounded-lg bg-[#281A12] hover:bg-[#342217] text-[#C49A6C] text-xs font-medium border border-[#3E2518]"
                  >
                    Add URL
                  </button>
                </div>
              </div>

              {/* Sizes / Options */}
              <div className="p-3.5 rounded-xl bg-[#1A110C] border border-[#2B1B13] space-y-2">
                <label className="block text-xs font-semibold text-[#D4A373]">
                  Sizes & Serving Options
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {formData.sizes.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-[#241710] border border-[#3A2417] text-xs text-[#EDE0D4] flex items-center space-x-1.5"
                    >
                      <span>{s}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSize(s)}
                        className="text-[#8C705E] hover:text-red-400"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="e.g. Regular (8oz), Large (12oz)"
                    value={sizeInput}
                    onChange={(e) => setSizeInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-[#1F1510] border border-[#3A251A] rounded-lg text-xs text-[#F2E4D5] focus:outline-none focus:border-[#C49A6C]"
                  />
                  <button
                    type="button"
                    onClick={handleAddSize}
                    className="px-3 py-1.5 rounded-lg bg-[#281A12] text-[#C49A6C] text-xs font-medium border border-[#3E2518]"
                  >
                    + Add Size
                  </button>
                </div>
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
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

