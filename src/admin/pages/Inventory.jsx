import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import {
  Boxes,
  AlertTriangle,
  ArrowUpDown,
  History,
  CheckCircle,
  Plus,
  Minus,
  X,
  Search,
  Filter
} from 'lucide-react';

export default function Inventory() {
  const { authFetch } = useAdminAuth();
  const location = useLocation();

  const [inventory, setInventory] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stock'); // 'stock' | 'logs'

  // Adjustment Modal
  const [adjustItem, setAdjustItem] = useState(null);
  const [changeAmount, setChangeAmount] = useState('');
  const [adjustType, setAdjustType] = useState('add'); // 'add' | 'subtract'
  const [reason, setReason] = useState('Restocked shipment from roastery');
  const [adjusting, setAdjusting] = useState(false);

  // Filter
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const filter = params.get('status');
    if (filter === 'low_stock') {
      setStatusFilter('low_stock');
    }
  }, [location.search]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [invRes, logsRes] = await Promise.all([
        authFetch('/api/inventory'),
        authFetch('/api/inventory/logs')
      ]);
      const invData = await invRes.json();
      const logsData = await logsRes.json();
      setInventory(invData);
      setLogs(logsData);
    } catch (err) {
      console.error('Failed to load inventory data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAdjustModal = (item) => {
    setAdjustItem(item);
    setChangeAmount('10');
    setAdjustType('add');
    setReason('Shipment arrived from local supplier');
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!adjustItem || !changeAmount) return;

    const amount = Number(changeAmount);
    const finalChange = adjustType === 'add' ? amount : -amount;

    try {
      setAdjusting(true);
      const res = await authFetch('/api/inventory/adjust', {
        method: 'POST',
        body: JSON.stringify({
          product_id: adjustItem.id,
          change_amount: finalChange,
          reason
        })
      });

      if (!res.ok) throw new Error('Stock adjustment failed');

      setAdjustItem(null);
      loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setAdjusting(false);
    }
  };

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      search === '' ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'low_stock' && item.stock_quantity <= 10 && item.stock_quantity > 0) ||
      (statusFilter === 'out_of_stock' && item.stock_quantity <= 0) ||
      (statusFilter === 'in_stock' && item.stock_quantity > 10);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#F2E4D5]">Inventory & Stock Control</h1>
          <p className="text-xs text-[#917765]">
            Real-time automated deduction on customer orders, restock adjustments, and audit log.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center p-1 rounded-xl bg-[#160E0A] border border-[#2B1B13]">
          <button
            onClick={() => setActiveTab('stock')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'stock'
                ? 'bg-[#6E4E37] text-white shadow-md'
                : 'text-[#9E8372] hover:text-[#EDE0D4]'
            }`}
          >
            Live Inventory
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
              activeTab === 'logs'
                ? 'bg-[#6E4E37] text-white shadow-md'
                : 'text-[#9E8372] hover:text-[#EDE0D4]'
            }`}
          >
            <History size={13} />
            <span>Audit Logs</span>
          </button>
        </div>
      </div>

      {activeTab === 'stock' ? (
        <>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#160E0A] border border-[#2B1B13]">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium ${
                  statusFilter === 'all'
                    ? 'bg-[#2E1E15] text-[#F2E4D5] border border-[#4A3224]'
                    : 'text-[#8C705E] hover:text-[#EDE0D4]'
                }`}
              >
                All Items ({inventory.length})
              </button>
              <button
                onClick={() => setStatusFilter('low_stock')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium ${
                  statusFilter === 'low_stock'
                    ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                    : 'text-[#8C705E] hover:text-amber-300'
                }`}
              >
                Low Stock (≤10)
              </button>
              <button
                onClick={() => setStatusFilter('out_of_stock')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium ${
                  statusFilter === 'out_of_stock'
                    ? 'bg-red-950/80 text-red-300 border border-red-800'
                    : 'text-[#8C705E] hover:text-red-300'
                }`}
              >
                Out of Stock (0)
              </button>
            </div>

            <div className="relative">
              <Search size={14} className="absolute left-3 top-2.5 text-[#7A6150]" />
              <input
                type="text"
                placeholder="Search SKU or product..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-60 pl-8 pr-3 py-1.5 bg-[#1F1510] border border-[#3A251A] rounded-xl text-xs text-[#F2E4D5] placeholder-[#7A6150] focus:outline-none focus:border-[#C49A6C]"
              />
            </div>
          </div>

          {/* Inventory Table */}
          <div className="bg-[#160E0A] border border-[#2B1B13] rounded-2xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#2B1B13] text-[#8C705E] uppercase tracking-wider font-semibold bg-[#1A110C]">
                    <th className="py-3 px-4">SKU</th>
                    <th className="py-3 px-4">Product Name</th>
                    <th className="py-3 px-4">Stock Level</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Last Updated</th>
                    <th className="py-3 px-4 text-right">Adjust Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#221610]">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-[#8C705E]">
                        <div className="w-8 h-8 mx-auto border-2 border-[#6E4E37] border-t-[#C49A6C] rounded-full animate-spin mb-2" />
                        <span>Loading inventory levels...</span>
                      </td>
                    </tr>
                  ) : filteredInventory.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-[#735A4A]">
                        No inventory matching selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredInventory.map((item) => (
                      <tr key={item.id} className="hover:bg-[#1C120B]/60 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-semibold text-[#D4A373]">
                          {item.sku}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-[#EDE0D4]">
                          {item.name}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-serif font-bold text-sm text-[#F5EAE0]">
                            {item.stock_quantity}
                          </span>
                          <span className="text-[10px] text-[#8C705E] ml-1">units</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                              item.stock_quantity <= 0
                                ? 'bg-red-950/80 text-red-300 border-red-800'
                                : item.stock_quantity <= 10
                                ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                                : 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                            }`}
                          >
                            {item.stock_quantity <= 0
                              ? 'Out of Stock'
                              : item.stock_quantity <= 10
                              ? 'Low Stock Alert'
                              : 'Healthy Stock'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-[#8C705E]">
                          {item.updated_at ? item.updated_at.replace('T', ' ').slice(0, 16) : 'Recently'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => openAdjustModal(item)}
                            className="px-3 py-1.5 rounded-lg bg-[#221610] hover:bg-[#2C1D15] text-[#C49A6C] hover:text-[#E8C49F] border border-[#3A2418] text-xs font-medium transition-colors"
                          >
                            ± Adjust Stock
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Audit Logs View */
        <div className="bg-[#160E0A] border border-[#2B1B13] rounded-2xl overflow-hidden shadow-lg">
          <div className="p-4 bg-[#1A110C] border-b border-[#2B1B13]">
            <h3 className="text-xs font-semibold text-[#D4A373] uppercase tracking-wider">
              Inventory Mutation Audit Trail
            </h3>
            <p className="text-[11px] text-[#8C705E]">
              Every order deduction, manual restock, or cancellation restoration is logged chronologically.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#2B1B13] text-[#8C705E] uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Change</th>
                  <th className="py-3 px-4">New Balance</th>
                  <th className="py-3 px-4">Reason / Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#221610]">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-[#735A4A]">
                      No audit logs recorded yet.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#1C120B]/60 transition-colors">
                      <td className="py-3 px-4 text-[#8C705E] font-mono">
                        {log.created_at ? log.created_at.replace('T', ' ').slice(0, 16) : 'Now'}
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#EDE0D4]">
                        {log.product_name}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold">
                        {log.change_amount > 0 ? (
                          <span className="text-emerald-400">+{log.change_amount}</span>
                        ) : (
                          <span className="text-red-400">{log.change_amount}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-[#D4A373]">
                        {log.new_stock} units
                      </td>
                      <td className="py-3 px-4 text-[#A89281]">
                        {log.reason}
                        {log.reference_order_id && (
                          <span className="text-[#8C705E] ml-1">
                            (Order #{log.reference_order_id})
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {adjustItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#150E0A] border border-[#362217] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#281A12]">
              <div>
                <h3 className="text-base font-serif font-bold text-[#F2E4D5]">
                  Adjust Stock: {adjustItem.name}
                </h3>
                <p className="text-[11px] text-[#8C705E] font-mono">
                  SKU: {adjustItem.sku} | Current: {adjustItem.stock_quantity} units
                </p>
              </div>
              <button onClick={() => setAdjustItem(null)} className="text-[#8C705E] hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              {/* Add vs Subtract */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustType('add')}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                    adjustType === 'add'
                      ? 'bg-emerald-950 border border-emerald-700 text-emerald-300'
                      : 'bg-[#1E140E] border border-[#332015] text-[#8C705E]'
                  }`}
                >
                  <Plus size={14} />
                  <span>Restock / Add (+)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustType('subtract')}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                    adjustType === 'subtract'
                      ? 'bg-red-950 border border-red-700 text-red-300'
                      : 'bg-[#1E140E] border border-[#332015] text-[#8C705E]'
                  }`}
                >
                  <Minus size={14} />
                  <span>Deduct / Spoilage (-)</span>
                </button>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-xs font-medium text-[#A68C7A] mb-1">
                  Quantity Units *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={changeAmount}
                  onChange={(e) => setChangeAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1E140E] border border-[#3A251A] rounded-xl text-sm text-[#F2E4D5] focus:outline-none focus:border-[#C49A6C]"
                />
              </div>

              {/* Reason */}
              <div>
                <label className="block text-xs font-medium text-[#A68C7A] mb-1">
                  Audit Reason / Notes *
                </label>
                <input
                  type="text"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Weekly roastery shipment received"
                  className="w-full px-3 py-2 bg-[#1E140E] border border-[#3A251A] rounded-xl text-xs text-[#F2E4D5] focus:outline-none focus:border-[#C49A6C]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 pt-3 border-t border-[#251710]">
                <button
                  type="button"
                  onClick={() => setAdjustItem(null)}
                  className="px-4 py-2 rounded-xl bg-[#221610] text-[#A68C7A] text-xs font-medium border border-[#3A2418]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjusting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#6E4E37] to-[#8C5D3B] hover:from-[#7D593E] hover:to-[#9D6A44] text-white text-xs font-semibold shadow-lg shadow-[#6E4E37]/30 disabled:opacity-50"
                >
                  {adjusting ? 'Saving...' : 'Apply Stock Change'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

