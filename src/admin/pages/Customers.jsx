import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import {
  Users,
  Search,
  Phone,
  Mail,
  MapPin,
  ShoppingBag,
  Clock,
  X,
  CreditCard
} from 'lucide-react';

export default function Customers() {
  const { authFetch } = useAdminAuth();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Selected Customer Drawer
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await authFetch('/api/customers');
      const data = await res.json();
      setCustomers(data);
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const openCustomerProfile = async (cust) => {
    setSelectedCustomer(cust);
    try {
      setLoadingOrders(true);
      const res = await authFetch(`/api/customers/${cust.id}`);
      const data = await res.json();
      setCustomerOrders(data.orders || []);
    } catch (err) {
      console.error('Failed to load customer orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const filteredCustomers = (customers || []).filter((c) => {
    const s = (search || '').trim().toLowerCase();
    return (
      s === '' ||
      (c?.name && c.name.toLowerCase().includes(s)) ||
      (c?.phone && c.phone.toLowerCase().includes(s)) ||
      (c?.email && c.email.toLowerCase().includes(s)) ||
      (c?.city && c.city.toLowerCase().includes(s))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#F2E4D5]">Customer Directory</h1>
          <p className="text-xs text-[#917765]">
            Registered patron profiles, contact books, order counts, and lifetime loyalty spend.
          </p>
        </div>

        {/* Search */}
        <div className="relative min-w-[260px]">
          <Search size={15} className="absolute left-3.5 top-2.5 text-[#7A6150]" />
          <input
            type="text"
            placeholder="Search patron name, phone, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#18100B] border border-[#332015] rounded-xl text-xs text-[#F2E4D5] placeholder-[#7A6150] focus:outline-none focus:border-[#C49A6C]"
          />
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-[#160E0A] border border-[#2B1B13] rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#2B1B13] text-[#8C705E] uppercase tracking-wider font-semibold bg-[#1A110C]">
                <th className="py-3 px-4">Patron Name</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">City</th>
                <th className="py-3 px-4">Total Orders</th>
                <th className="py-3 px-4">Lifetime Spend</th>
                <th className="py-3 px-4 text-right">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#221610]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#8C705E]">
                    <div className="w-8 h-8 mx-auto border-2 border-[#6E4E37] border-t-[#C49A6C] rounded-full animate-spin mb-2" />
                    <span>Loading customer database...</span>
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#735A4A]">
                    No customer records found.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-[#1C120B]/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#2A1B13] text-[#D4A373] font-serif font-bold text-xs flex items-center justify-center border border-[#3E271B]">
                          {(cust?.name || 'C').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-[#EDE0D4]">{cust.name}</p>
                          <p className="text-[10px] text-[#8C705E]">ID: #CUST-{cust.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-xs text-[#D4A373]">{cust.phone}</div>
                      {cust.email && (
                        <div className="text-[10px] text-[#856D5B]">{cust.email}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-[#A89281]">
                      {cust.city || 'Lahore'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-[#EDE0D4]">
                        {cust.total_orders || 0}
                      </span>
                      <span className="text-[10px] text-[#8C705E] ml-1">orders</span>
                    </td>
                    <td className="py-3.5 px-4 font-serif font-semibold text-emerald-400">
                      PKR {Number(cust.total_spent || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openCustomerProfile(cust)}
                        className="px-3 py-1.5 rounded-lg bg-[#221610] hover:bg-[#2C1D15] text-[#C49A6C] hover:text-[#E8C49F] border border-[#3A2418] text-xs font-medium transition-colors"
                      >
                        Order History →
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Profile & Past Orders Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#150E0A] border border-[#362217] rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#281A12]">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-[#2A1B13] text-[#D4A373] font-serif font-bold text-sm flex items-center justify-center border border-[#3E271B]">
                  {(selectedCustomer?.name || 'C').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold text-[#F2E4D5]">
                    {selectedCustomer.name}
                  </h3>
                  <p className="text-[11px] text-[#8C705E]">{selectedCustomer.phone}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-[#8C705E] hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 pr-1">
              {/* Profile Details */}
              <div className="p-3.5 rounded-xl bg-[#1A110C] border border-[#2B1B13] text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[#8C705E]">Delivery Address:</span>
                  <span className="text-[#EDE0D4] font-medium text-right max-w-[250px]">
                    {selectedCustomer.address || 'Standard Delivery Address'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8C705E]">City:</span>
                  <span className="text-[#EDE0D4] font-medium">{selectedCustomer.city || 'Lahore'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8C705E]">Lifetime Order Value:</span>
                  <span className="text-emerald-400 font-bold font-serif">
                    PKR {Number(selectedCustomer.total_spent || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Orders History */}
              <div>
                <h4 className="text-xs font-semibold text-[#D4A373] uppercase tracking-wider mb-2">
                  Order History ({customerOrders.length})
                </h4>

                {loadingOrders ? (
                  <div className="py-6 text-center text-xs text-[#8C705E]">
                    Loading customer orders...
                  </div>
                ) : customerOrders.length === 0 ? (
                  <div className="py-6 text-center text-xs text-[#735A4A]">
                    No past orders recorded for this customer.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {customerOrders.map((ord) => (
                      <div
                        key={ord.id}
                        className="p-3 rounded-xl bg-[#1A110C] border border-[#2B1B13] flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-mono font-bold text-[#E6C5A5]">{ord.order_number}</p>
                          <p className="text-[10px] text-[#8C705E]">
                            {ord.created_at ? ord.created_at.slice(0, 10) : 'Recent'} · {ord.payment_method}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-[#F2E5D7]">
                            PKR {Number(ord.total_amount).toLocaleString()}
                          </p>
                          <span className="text-[10px] px-2 py-0.2 rounded-full bg-[#241710] text-[#D4A373] border border-[#3A2417]">
                            {ord.order_status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-[#251710] flex justify-end">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 rounded-xl bg-[#221610] text-[#A68C7A] text-xs font-medium border border-[#3A2418]"
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

