import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import {
  ShoppingBag,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  PackageCheck,
  XCircle,
  Eye,
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  FileText
} from 'lucide-react';

export default function Orders() {
  const { authFetch } = useAdminAuth();
  const location = useLocation();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Selected Order for Detail Modal
  const [activeOrder, setActiveOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await authFetch('/api/orders');
      const data = await res.json();
      setOrders(data);

      // If view param in URL, open modal
      const params = new URLSearchParams(location.search);
      const viewId = params.get('view');
      if (viewId) {
        const found = data.find(o => String(o.id) === viewId);
        if (found) setActiveOrder(found);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (newOrderStatus, newPaymentStatus) => {
    if (!activeOrder) return;
    try {
      setUpdatingStatus(true);
      const res = await authFetch(`/api/orders/${activeOrder.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          order_status: newOrderStatus || activeOrder.order_status,
          payment_status: newPaymentStatus || activeOrder.payment_status
        })
      });
      const updated = await res.json();
      setActiveOrder(updated);

      // Update in orders list
      setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
    } catch (err) {
      alert('Failed to update order: ' + err.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const statusColors = {
    Pending: {
      badge: 'bg-amber-950/70 text-amber-300 border-amber-800/80',
      icon: Clock
    },
    Processing: {
      badge: 'bg-blue-950/70 text-blue-300 border-blue-800/80',
      icon: PackageCheck
    },
    Shipped: {
      badge: 'bg-purple-950/70 text-purple-300 border-purple-800/80',
      icon: Truck
    },
    Delivered: {
      badge: 'bg-emerald-950/70 text-emerald-300 border-emerald-800/80',
      icon: CheckCircle2
    },
    Cancelled: {
      badge: 'bg-red-950/70 text-red-300 border-red-800/80',
      icon: XCircle
    }
  };

  const filteredOrders = (orders || []).filter(o => {
    const s = (search || '').trim().toLowerCase();
    const orderNum = (o?.order_number || '').toLowerCase();
    const custName = (o?.customer_name || '').toLowerCase();
    const custPhone = (o?.customer_phone || '').toLowerCase();

    const matchesSearch =
      s === '' ||
      orderNum.includes(s) ||
      custName.includes(s) ||
      custPhone.includes(s);
    const matchesStatus = selectedStatus === 'all' || o?.order_status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#F2E4D5]">Customer Orders</h1>
          <p className="text-xs text-[#917765]">
            Track delivery workflow, verify payments, and handle order status updates.
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="px-3.5 py-2 rounded-xl bg-[#1C120B] hover:bg-[#281A12] border border-[#3A2417] text-xs text-[#D4A373] font-medium transition-colors self-start sm:self-auto"
        >
          ↻ Refresh Orders
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Status filter tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
          {['all', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((status) => {
            const count = status === 'all'
              ? orders.length
              : orders.filter(o => o.order_status === status).length;

            return (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                  selectedStatus === status
                    ? 'bg-[#6E4E37] text-white shadow-md shadow-[#6E4E37]/30'
                    : 'bg-[#18100B] text-[#9E8372] hover:bg-[#221610] hover:text-[#EDE0D4] border border-[#2E1D14]'
                }`}
              >
                <span>{status === 'all' ? 'All Orders' : status}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 font-mono">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative min-w-[260px]">
          <Search size={15} className="absolute left-3.5 top-2.5 text-[#7A6150]" />
          <input
            type="text"
            placeholder="Search order #, customer, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#18100B] border border-[#332015] rounded-xl text-xs text-[#F2E4D5] placeholder-[#7A6150] focus:outline-none focus:border-[#C49A6C]"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#160E0A] border border-[#2B1B13] rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#2B1B13] text-[#8C705E] uppercase tracking-wider font-semibold bg-[#1A110C]">
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#221610]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#8C705E]">
                    <div className="w-8 h-8 mx-auto border-2 border-[#6E4E37] border-t-[#C49A6C] rounded-full animate-spin mb-2" />
                    <span>Loading orders...</span>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#735A4A]">
                    No orders match your filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const conf = statusColors[ord.order_status] || statusColors.Pending;
                  const Icon = conf.icon;

                  return (
                    <tr key={ord.id} className="hover:bg-[#1C120B]/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#E6C5A5]">
                        {ord.order_number}
                      </td>
                      <td className="py-3.5 px-4 text-[#8C705E]">
                        {ord.created_at ? ord.created_at.replace('T', ' ').slice(0, 16) : 'Just now'}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#EDE0D4]">{ord.customer_name}</div>
                        <div className="text-[10px] text-[#856D5B]">{ord.customer_phone}</div>
                      </td>
                      <td className="py-3.5 px-4 text-[#A89281]">
                        {ord.items?.length || 1} item{ord.items?.length > 1 ? 's' : ''}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#F2E5D7]">
                        PKR {Number(ord.total_amount).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-[11px] font-medium text-[#D4A373]">
                          {ord.payment_method}
                        </div>
                        <span
                          className={`inline-block text-[9px] px-1.5 py-0.2 rounded font-mono font-semibold ${
                            ord.payment_status === 'Paid'
                              ? 'bg-emerald-950/80 text-emerald-300'
                              : 'bg-neutral-800 text-neutral-400'
                          }`}
                        >
                          {ord.payment_status || 'Unpaid'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center space-x-1.5 text-[11px] px-2.5 py-1 rounded-full border font-medium ${conf.badge}`}
                        >
                          <Icon size={12} />
                          <span>{ord.order_status}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setActiveOrder(ord)}
                          className="px-3 py-1.5 rounded-lg bg-[#221610] hover:bg-[#2C1D15] text-[#C49A6C] hover:text-[#E8C49F] border border-[#3A2418] text-xs font-medium transition-colors"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {activeOrder && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#150E0A] border border-[#362217] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#281A12] flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-3">
                  <h2 className="text-base font-serif font-bold text-[#F2E4D5]">
                    Order {activeOrder.order_number}
                  </h2>
                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full border font-medium ${
                      statusColors[activeOrder.order_status]?.badge || ''
                    }`}
                  >
                    {activeOrder.order_status}
                  </span>
                </div>
                <p className="text-[11px] text-[#8C705E] mt-0.5">
                  Placed on {activeOrder.created_at ? activeOrder.created_at.replace('T', ' ').slice(0, 16) : 'Recent'}
                </p>
              </div>
              <button
                onClick={() => setActiveOrder(null)}
                className="p-1 rounded-lg text-[#8C705E] hover:text-[#EDE0D4]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Quick Status Workflow Action Buttons */}
              <div className="p-4 rounded-xl bg-[#1A110C] border border-[#2B1B13]">
                <label className="block text-xs font-semibold text-[#D4A373] mb-2 uppercase tracking-wider">
                  Update Order Status
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((st) => (
                    <button
                      key={st}
                      disabled={updatingStatus || activeOrder.order_status === st}
                      onClick={() => handleUpdateStatus(st, null)}
                      className={`py-2 px-2 rounded-xl text-xs font-medium transition-all text-center ${
                        activeOrder.order_status === st
                          ? 'bg-[#6E4E37] text-white font-bold shadow-md shadow-[#6E4E37]/40 ring-1 ring-[#C49A6C]'
                          : 'bg-[#221610] text-[#9E8372] hover:bg-[#2C1D15] hover:text-[#EDE0D4] border border-[#382317]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                {/* Payment Status Toggle */}
                <div className="mt-4 pt-3 border-t border-[#251710] flex items-center justify-between">
                  <span className="text-xs text-[#8C705E]">Payment Status:</span>
                  <div className="flex items-center space-x-2">
                    <button
                      disabled={updatingStatus}
                      onClick={() => handleUpdateStatus(null, 'Paid')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                        activeOrder.payment_status === 'Paid'
                          ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700'
                          : 'bg-[#221610] text-[#7A6150] hover:text-white border border-[#332015]'
                      }`}
                    >
                      ✓ Mark Paid
                    </button>
                    <button
                      disabled={updatingStatus}
                      onClick={() => handleUpdateStatus(null, 'Unpaid')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                        activeOrder.payment_status !== 'Paid'
                          ? 'bg-amber-900/60 text-amber-300 border border-amber-700'
                          : 'bg-[#221610] text-[#7A6150] hover:text-white border border-[#332015]'
                      }`}
                    >
                      Mark Unpaid
                    </button>
                  </div>
                </div>
              </div>

              {/* Customer & Shipping Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#1A110C] border border-[#2B1B13] space-y-2">
                  <h3 className="text-xs font-semibold text-[#D4A373] uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                    <User size={14} />
                    <span>Customer Information</span>
                  </h3>
                  <p className="text-xs font-medium text-[#EDE0D4]">{activeOrder.customer_name}</p>
                  <p className="text-xs text-[#A8907F] flex items-center space-x-2">
                    <Phone size={12} className="text-[#8C705E]" />
                    <span>{activeOrder.customer_phone}</span>
                  </p>
                  {activeOrder.customer_email && (
                    <p className="text-xs text-[#A8907F] flex items-center space-x-2">
                      <Mail size={12} className="text-[#8C705E]" />
                      <span>{activeOrder.customer_email}</span>
                    </p>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-[#1A110C] border border-[#2B1B13] space-y-2">
                  <h3 className="text-xs font-semibold text-[#D4A373] uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                    <MapPin size={14} />
                    <span>Shipping Address</span>
                  </h3>
                  <p className="text-xs text-[#EDE0D4] leading-relaxed">
                    {activeOrder.shipping_address}
                  </p>
                  <p className="text-xs text-[#8C705E]">City: {activeOrder.city || 'Lahore'}</p>
                  {activeOrder.notes && (
                    <p className="text-xs text-amber-200/80 italic mt-1 bg-amber-950/20 p-2 rounded-lg border border-amber-900/30">
                      Note: "{activeOrder.notes}"
                    </p>
                  )}
                </div>
              </div>

              {/* Ordered Items Table */}
              <div className="p-4 rounded-xl bg-[#1A110C] border border-[#2B1B13]">
                <h3 className="text-xs font-semibold text-[#D4A373] uppercase tracking-wider mb-3">
                  Ordered Products
                </h3>
                <div className="divide-y divide-[#251710]">
                  {(activeOrder.items || []).map((item, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-[#EDE0D4]">{item.product_name}</p>
                        <p className="text-[10px] text-[#8C705E]">
                          Variant: {item.selected_variant || 'Standard'} × {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-[#F2E5D7]">
                          PKR {Number(item.total).toLocaleString()}
                        </p>
                        <p className="text-[10px] text-[#7A6150]">
                          PKR {item.price} each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-[#251710] flex items-center justify-between">
                  <span className="text-xs font-bold text-[#EAD8CA] uppercase">Total Order Amount</span>
                  <span className="text-base font-serif font-bold text-[#C49A6C]">
                    PKR {Number(activeOrder.total_amount).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-[#281A12] flex items-center justify-between">
              <span className="text-xs text-[#8C705E]">Payment Method: {activeOrder.payment_method}</span>
              <button
                onClick={() => setActiveOrder(null)}
                className="px-4 py-2 rounded-xl bg-[#221610] hover:bg-[#2C1D15] text-[#A68C7A] text-xs font-medium border border-[#3A2418]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

