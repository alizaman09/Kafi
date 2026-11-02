export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    }
  }
};

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

  try {
    if (req.body) {
      if (typeof req.body === 'string') {
        try {
          req.body = JSON.parse(req.body);
        } catch {}
      }

      if (req.body.image) {
        return res.status(200).json({ urls: [req.body.image] });
      }

      if (Array.isArray(req.body.images) && req.body.images.length > 0) {
        return res.status(200).json({ urls: req.body.images });
      }
    }

    return res.status(200).json({
      urls: [],
      message: 'Upload handler active'
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Upload handler failed' });
  }
}
