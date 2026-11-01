import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import {
  LayoutDashboard,
  Coffee,
  ShoppingBag,
  Layers,
  Boxes,
  Users,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Bell,
  Search,
  Sparkles
} from 'lucide-react';

export default function AdminLayout() {
  const { admin, logout } = useAdminAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
    { name: 'Products', path: '/admin/products', icon: Coffee },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Categories', path: '/admin/categories', icon: Layers },
    { name: 'Inventory', path: '/admin/inventory', icon: Boxes },
    { name: 'Customers', path: '/admin/customers', icon: Users },
  ];

  const getPageTitle = () => {
    const current = navItems.find(item => 
      item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path)
    );
    return current ? current.name : 'Admin Portal';
  };

  return (
    <div className="min-h-screen bg-[#0D0907] text-[#EDE4D8] font-sans flex flex-col md:flex-row antialiased selection:bg-[#C49A6C] selection:text-black">
      {/* Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#160F0B] border-b border-[#2C1C14] sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#6E4E37] to-[#C49A6C] flex items-center justify-center text-white font-bold text-xs tracking-wider shadow-md">
            KF
          </div>
          <span className="font-serif tracking-widest text-lg font-bold text-[#E6C29F]">KAFI ADMIN</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg bg-[#221711] text-[#D2B48C] hover:text-white"
        >
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#140D09] border-r border-[#261811] flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 md:static ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo & Brand */}
          <div className="p-6 border-b border-[#221610] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#583925] to-[#B38758] flex items-center justify-center text-white font-serif font-black text-sm tracking-wider shadow-lg shadow-black/60 border border-[#8B5E3C]/40">
                K
              </div>
              <div>
                <h1 className="font-serif font-extrabold tracking-widest text-[#E6C29F] text-base leading-none">
                  KAFI
                </h1>
                <span className="text-[10px] tracking-wider uppercase text-[#8F7565] font-semibold">
                  Gulberg Experience
                </span>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#2A1910] text-[#D4A373] border border-[#523321] font-mono">
              v1.0
            </span>
          </div>

          {/* Nav Links */}
          <nav className="p-4 space-y-1.5">
            <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-[#735A4A]">
              Store Management
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path);

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.exact}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[#6E4E37] to-[#8C5D3B] text-white shadow-md shadow-[#6E4E37]/30 font-semibold'
                      : 'text-[#B8A394] hover:bg-[#1E140E] hover:text-[#E8D7CA]'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-amber-200' : 'text-[#856A59]'} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#221610] space-y-3">
          {/* Quick link to live site */}
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-[#C49A6C] bg-[#1E140E] hover:bg-[#2A1A12] border border-[#3A2418] transition-colors"
          >
            <span className="flex items-center space-x-2">
              <ExternalLink size={14} />
              <span>View Storefront</span>
            </span>
            <span className="text-[10px] text-[#8C6D53]">Live ↗</span>
          </a>

          {/* Admin User info card */}
          <div className="p-3 rounded-xl bg-[#1A110B] border border-[#2B1B13] flex items-center justify-between">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-[#3A2418] text-[#E0B589] font-bold flex items-center justify-center text-xs flex-shrink-0">
                {admin?.name ? admin.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-[#E5D2C2] truncate">{admin?.name || 'Administrator'}</p>
                <p className="text-[10px] text-[#8A7160] truncate">{admin?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-[#997966] hover:text-red-400 hover:bg-[#2E1813] transition-colors"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-[#140D09]/80 backdrop-blur-md border-b border-[#241710] sticky top-0 z-30">
          <div>
            <h2 className="text-xl font-bold font-serif text-[#F0DFCF] tracking-wide">
              {getPageTitle()}
            </h2>
            <p className="text-xs text-[#8A7161]">KAFI Gulberg Administration & Operations</p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="px-3 py-1.5 rounded-full bg-[#1C120B] border border-[#362217] text-xs text-[#C49A6C] flex items-center space-x-2 shadow-inner">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>System Online</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-1.5 text-xs px-3.5 py-1.5 rounded-lg bg-[#24160F] text-[#B89781] hover:text-red-300 hover:bg-[#341812] border border-[#3C2215] transition-colors"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Page Content View */}
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Overlay for mobile drawer */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 md:hidden"
        />
      )}
    </div>
  );
}

