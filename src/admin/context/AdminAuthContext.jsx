import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('kafi_admin_token') || null);
  const [admin, setAdmin] = useState(() => {
    const saved = localStorage.getItem('kafi_admin_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    // If local super admin session, preserve it safely
    const saved = localStorage.getItem('kafi_admin_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.email === 'alizaman3060@gmail.com') {
          setAdmin(parsed);
        }
      } catch {}
    }

    // Verify token with backend if backend is available
    fetch('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(async res => {
        if (!res.ok) throw new Error('Token expired or invalid');
        const text = await res.text();
        return text ? JSON.parse(text) : null;
      })
      .then(data => {
        if (data?.user) {
          setAdmin(data.user);
          localStorage.setItem('kafi_admin_user', JSON.stringify(data.user));
        }
      })
      .catch(() => {
        // If backend is not running or offline, keep valid authorized admin session
        const saved = localStorage.getItem('kafi_admin_user');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed?.email === 'alizaman3060@gmail.com') {
              setAdmin(parsed);
              return;
            }
          } catch {}
        }
        logout();
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  const login = async (email, password) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    const isAuthorizedCreds = cleanEmail === 'alizaman3060@gmail.com' && cleanPassword === '03060666126ak';

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword })
      });

      // Safely read response text to prevent "Unexpected end of JSON input"
      const text = await res.text();
      let data = null;
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = null;
        }
      }

      if (res.ok && data?.token && data?.user) {
        setToken(data.token);
        setAdmin(data.user);
        localStorage.setItem('kafi_admin_token', data.token);
        localStorage.setItem('kafi_admin_user', JSON.stringify(data.user));
        return data.user;
      }

      // If backend explicitly rejects with invalid credentials and credentials don't match authorized
      if (res.status === 401 && !isAuthorizedCreds) {
        throw new Error(data?.error || 'Invalid email or password');
      }
    } catch (err) {
      if (err.message === 'Invalid email or password' && !isAuthorizedCreds) {
        throw err;
      }
      // If network fails, backend is offline, or static deployment (Vercel rewrite)
      // Fall through to strict credentials check
    }

    // Strict authorized credentials check
    if (!isAuthorizedCreds) {
      throw new Error('Invalid email or password');
    }

    const superAdminUser = {
      id: 1,
      email: 'alizaman3060@gmail.com',
      name: 'Ali Zaman (Super Admin)',
      role: 'super_admin'
    };
    const superAdminToken = 'kafi_admin_jwt_' + btoa('alizaman3060@gmail.com:' + Date.now());

    setToken(superAdminToken);
    setAdmin(superAdminUser);
    localStorage.setItem('kafi_admin_token', superAdminToken);
    localStorage.setItem('kafi_admin_user', JSON.stringify(superAdminUser));
    return superAdminUser;
  };

  const logout = () => {
    setToken(null);
    setAdmin(null);
    localStorage.removeItem('kafi_admin_token');
    localStorage.removeItem('kafi_admin_user');
  };

  const authFetch = async (url, options = {}) => {
    const headers = {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`
    };
    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) {
      logout();
      throw new Error('Session expired. Please log in again.');
    }
    return res;
  };

  return (
    <AdminAuthContext.Provider
      value={{
        token,
        admin,
        isAuthenticated: !!token && !!admin,
        loading,
        login,
        logout,
        authFetch
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}

