import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import {
  DollarSign,
  ShoppingBag,
  Coffee,
  Users,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  Clock,
  CheckCircle2,
  PackageCheck,
  Plus
} from 'lucide-react';

export default function Dashboard() {
  const { authFetch } = useAdminAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await authFetch('/api/dashboard/stats');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <div className="w-10 h-10 border-2 border-[#6E4E37] border-t-[#C49A6C] rounded-full animate-spin" />
        <p className="text-xs text-[#9B806F]">Loading store intelligence...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-red-950/40 border border-red-800/40 text-red-200">
        <p className="font-semibold text-sm">Failed to load statistics</p>
        <p className="text-xs mt-1 text-red-300">{error}</p>
        <button
          onClick={fetchStats}
          className="mt-4 px-4 py-2 bg-red-900/60 hover:bg-red-800/60 rounded-xl text-xs font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  const {
    totalProducts = 0,
    totalOrders = 0,
    totalCustomers = 0,
    totalRevenue = 0,
    lowStockCount = 0,
    recentOrders = [],
    lowStockProducts = [],
    salesHistory = []
  } = stats || {};

  // Find max daily revenue for chart scaling
  const maxRevenue = Math.max(...salesHistory.map(s => Number(s.daily_revenue || 0)), 1000);

  return (
    <div className="space-y-8">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#F2E4D5]">Gulberg Store Overview</h1>
          <p className="text-xs text-[#917765]">Real-time performance, inventory alerts and order dispatch status.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/admin/products?new=true"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#6E4E37] to-[#8C5D3B] hover:from-[#7D593E] hover:to-[#9D6A44] text-white text-xs font-semibold shadow-lg shadow-[#6E4E37]/30 flex items-center space-x-2 transition-all"
          >
            <Plus size={16} />
            <span>New Product</span>
          </Link>
          <Link
            to="/admin/orders"
            className="px-4 py-2.5 rounded-xl bg-[#1C130D] hover:bg-[#281B13] border border-[#382317] text-[#C49A6C] text-xs font-semibold transition-all flex items-center space-x-2"
          >
            <ShoppingBag size={15} />
            <span>View All Orders</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="p-5 rounded-2xl bg-[#160E0A] border border-[#2B1B13] shadow-lg shadow-black/40 relative overflow-hidden group hover:border-[#6E4E37]/60 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-[#997C69] uppercase tracking-wider">Total Revenue</span>
            <div className="p-2.5 rounded-xl bg-[#281B13] text-[#D4A373]">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="text-2xl font-serif font-bold text-[#F5EAE0]">
            PKR {Number(totalRevenue).toLocaleString()}
          </div>
          <div className="mt-2 flex items-center text-[11px] text-emerald-400 font-medium">
            <TrendingUp size={13} className="mr-1" />
            <span>Active transactions</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="p-5 rounded-2xl bg-[#160E0A] border border-[#2B1B13] shadow-lg shadow-black/40 relative overflow-hidden group hover:border-[#6E4E37]/60 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-[#997C69] uppercase tracking-wider">Total Orders</span>
            <div className="p-2.5 rounded-xl bg-[#281B13] text-[#D4A373]">
              <ShoppingBag size={18} />
            </div>
          </div>
          <div className="text-2xl font-serif font-bold text-[#F5EAE0]">
            {totalOrders}
          </div>
          <div className="mt-2 flex items-center text-[11px] text-[#A68C7A]">
            <Clock size={13} className="mr-1 text-[#8C6D53]" />
            <span>Storefront & counter orders</span>
          </div>
        </div>

        {/* Total Products */}
        <div className="p-5 rounded-2xl bg-[#160E0A] border border-[#2B1B13] shadow-lg shadow-black/40 relative overflow-hidden group hover:border-[#6E4E37]/60 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-[#997C69] uppercase tracking-wider">Products Catalog</span>
            <div className="p-2.5 rounded-xl bg-[#281B13] text-[#D4A373]">
              <Coffee size={18} />
            </div>
          </div>
          <div className="text-2xl font-serif font-bold text-[#F5EAE0]">
            {totalProducts}
          </div>
          <div className="mt-2 flex items-center text-[11px] text-[#A68C7A]">
            <PackageCheck size={13} className="mr-1 text-[#8C6D53]" />
            <span>Live on public menu</span>
          </div>
        </div>

        {/* Total Customers */}
        <div className="p-5 rounded-2xl bg-[#160E0A] border border-[#2B1B13] shadow-lg shadow-black/40 relative overflow-hidden group hover:border-[#6E4E37]/60 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-[#997C69] uppercase tracking-wider">Customers</span>
            <div className="p-2.5 rounded-xl bg-[#281B13] text-[#D4A373]">
              <Users size={18} />
            </div>
          </div>
          <div className="text-2xl font-serif font-bold text-[#F5EAE0]">
            {totalCustomers}
          </div>
          <div className="mt-2 flex items-center text-[11px] text-amber-300/80">
            <span>Registered profiles</span>
          </div>
        </div>
      </div>

      {/* Low Stock Alert Banner (Conditional) */}
      {lowStockCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-900/40 text-amber-300">
              <AlertTriangle size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-200">
                {lowStockCount} Product{lowStockCount > 1 ? 's' : ''} Running Low on Stock!
              </p>
              <p className="text-xs text-amber-300/70">
                Items are at or below 10 units. Restock soon to prevent order delays.
              </p>
            </div>
          </div>
          <Link
            to="/admin/inventory?status=low_stock"
            className="px-3.5 py-1.5 rounded-xl bg-amber-900/50 hover:bg-amber-800/60 text-amber-200 text-xs font-medium border border-amber-700/50 transition-colors inline-flex items-center space-x-1.5 self-start sm:self-auto"
          >
            <span>Inspect Inventory</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      )}

      {/* Sales Overview Chart & Low Stock Sidekick */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart (2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#160E0A] border border-[#2B1B13] shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-serif font-bold text-[#F2E4D5]">Sales Activity (Recent Days)</h3>
              <p className="text-xs text-[#8C705E]">Completed and processing store revenue</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-[#241710] text-[#C49A6C] border border-[#3A2417]">
              7-Day Trend
            </span>
          </div>

          {salesHistory.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-xs text-[#7A6251]">
              No sales data recorded yet.
            </div>
          ) : (
            <div className="h-52 flex items-end justify-between gap-3 pt-6 pb-2 px-2">
              {salesHistory.map((day, idx) => {
                const heightPercent = Math.max(12, Math.round((Number(day.daily_revenue || 0) / maxRevenue) * 100));
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono text-[#D4A373] bg-[#22160F] px-1.5 py-0.5 rounded border border-[#3A2418]">
                      PKR {Number(day.daily_revenue).toLocaleString()}
                    </div>
                    <div className="w-full bg-[#20150E] rounded-t-lg h-36 flex items-end overflow-hidden p-1">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full bg-gradient-to-t from-[#6E4E37] to-[#C49A6C] rounded-t-md group-hover:from-[#825C41] group-hover:to-[#D4AA7B] transition-all duration-300"
                      />
                    </div>
                    <span className="text-[10px] text-[#8C705E] font-mono truncate max-w-full">
                      {day.order_date ? day.order_date.slice(5) : `Day ${idx + 1}`}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Low Stock Items List (1 col) */}
        <div className="p-6 rounded-2xl bg-[#160E0A] border border-[#2B1B13] shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-serif font-bold text-[#F2E4D5]">Low Stock Alert</h3>
              <Link to="/admin/inventory" className="text-xs text-[#C49A6C] hover:underline">
                View all
              </Link>
            </div>

            {lowStockProducts.length === 0 ? (
              <div className="p-6 rounded-xl bg-[#1D130D] border border-[#2E1E15] text-center my-6">
                <CheckCircle2 size={24} className="mx-auto text-emerald-400 mb-2" />
                <p className="text-xs text-[#EAD8CA] font-medium">All items well stocked</p>
                <p className="text-[11px] text-[#856C5B] mt-0.5">No critical shortages right now</p>
              </div>
            ) : (
              <div className="space-y-3">
                {lowStockProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="p-3 rounded-xl bg-[#1C120B] border border-[#2E1C13] flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-semibold text-[#EDE0D4] truncate max-w-[150px]">
                        {prod.name}
                      </p>
                      <p className="text-[10px] text-[#8A6F5D] font-mono">{prod.sku}</p>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-lg font-bold ${
                        prod.stock_quantity <= 0
                          ? 'bg-red-950/80 text-red-300 border border-red-800'
                          : 'bg-amber-950/80 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {prod.stock_quantity} left
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link
            to="/admin/inventory"
            className="w-full mt-4 py-2.5 text-center rounded-xl bg-[#221610] hover:bg-[#2C1D15] border border-[#3A2418] text-xs font-medium text-[#D4A373] transition-colors"
          >
            Update Inventory Stock
          </Link>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="p-6 rounded-2xl bg-[#160E0A] border border-[#2B1B13] shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-base font-serif font-bold text-[#F2E4D5]">Recent Customer Orders</h3>
            <p className="text-xs text-[#8C705E]">Latest incoming orders from web storefront & WhatsApp checkout</p>
          </div>
          <Link
            to="/admin/orders"
            className="text-xs text-[#C49A6C] hover:text-[#E0B589] font-medium flex items-center space-x-1"
          >
            <span>Manage Orders</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#2B1B13] text-[#8C705E] uppercase tracking-wider font-semibold">
                <th className="pb-3 pr-4">Order #</th>
                <th className="pb-3 px-4">Customer</th>
                <th className="pb-3 px-4">Items</th>
                <th className="pb-3 px-4">Total</th>
                <th className="pb-3 px-4">Payment</th>
                <th className="pb-3 px-4">Status</th>
                <th className="pb-3 pl-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#221610]">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#735A4A]">
                    No customer orders yet.
                  </td>
                </tr>
              ) : (
                recentOrders.map((ord) => {
                  const statusColors = {
                    Pending: 'bg-amber-950/60 text-amber-300 border-amber-800/60',
                    Processing: 'bg-blue-950/60 text-blue-300 border-blue-800/60',
                    Shipped: 'bg-purple-950/60 text-purple-300 border-purple-800/60',
                    Delivered: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60',
                    Cancelled: 'bg-red-950/60 text-red-300 border-red-800/60',
                  };

                  return (
                    <tr key={ord.id} className="hover:bg-[#1C120B]/50 transition-colors">
                      <td className="py-3.5 pr-4 font-mono font-semibold text-[#E6C5A5]">
                        {ord.order_number}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-[#EDE0D4]">{ord.customer_name}</div>
                        <div className="text-[10px] text-[#856D5B]">{ord.customer_phone}</div>
                      </td>
                      <td className="py-3.5 px-4 text-[#A89281]">
                        {ord.item_count || 1} item{ord.item_count > 1 ? 's' : ''}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#F2E5D7]">
                        PKR {Number(ord.total_amount).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#221610] text-[#B89B84] border border-[#382317]">
                          {ord.payment_status || 'Unpaid'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[11px] px-2.5 py-0.5 rounded-full border font-medium ${
                            statusColors[ord.order_status] || 'bg-neutral-800 text-neutral-300 border-neutral-700'
                          }`}
                        >
                          {ord.order_status}
                        </span>
                      </td>
                      <td className="py-3.5 pl-4 text-right">
                        <Link
                          to={`/admin/orders?view=${ord.id}`}
                          className="text-[#C49A6C] hover:text-[#E8C49F] font-medium"
                        >
                          Details →
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

