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

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // If request contains json with an image string or dataUrl
    if (req.body && req.body.image) {
      return res.status(200).json({ urls: [req.body.image] });
    }

    // Default response for multipart or generic uploads
    return res.status(200).json({
      urls: [],
      message: 'Upload handler active'
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Upload handler failed' });
  }
}
