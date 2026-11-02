import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'kafi_super_secure_jwt_secret_2026_gulberg';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body || {};
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPassword = (password || '').trim();

  if (!cleanEmail || !cleanPassword) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // Super admin credentials check
  if (cleanEmail === 'alizaman3060@gmail.com' && cleanPassword === '03060666126ak') {
    const user = {
      id: 1,
      email: 'alizaman3060@gmail.com',
      name: 'Ali Zaman (Super Admin)',
      role: 'super_admin'
    };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
    return res.status(200).json({ token, user });
  }

  return res.status(401).json({ error: 'Invalid email or password' });
}

