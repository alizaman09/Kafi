import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { Coffee } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAdminAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0907] flex flex-col items-center justify-center text-[#EDE4D8]">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#6E4E37] to-[#C49A6C] flex items-center justify-center shadow-2xl shadow-[#6E4E37]/40 border border-[#8C5D3B] animate-pulse mb-4">
          <Coffee size={28} className="text-white" />
        </div>
        <div className="text-sm font-serif tracking-widest text-[#D4A373] uppercase font-bold animate-pulse">
          Authenticating KAFI Portal...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}

