// Secure Vercel Serverless Function to interface with Upstash Redis
// This keeps database REST tokens safe on the backend.
export default async function handler(request, response) {
  // CORS Headers
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  const UPSTASH_URL = process.env.VITE_UPSTASH_KV_REST_API_URL;
  const UPSTASH_TOKEN = process.env.VITE_UPSTASH_KV_REST_API_TOKEN;

  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    return response.status(500).json({ error: "Server database credentials not configured in Vercel settings." });
  }

  try {
    if (request.method === 'GET') {
      const { phone } = request.query;
      if (!phone) {
        return response.status(400).json({ error: "Missing phone parameter." });
      }
      const cleanPhone = phone.replace(/\D/g, "");
      const dbKey = `chand_shop_db_${cleanPhone}`;

      const res = await fetch(`${UPSTASH_URL}/get/${dbKey}`, {
        headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` }
      });
      
      if (!res.ok) {
        throw new Error(`Upstash fetch error: ${res.statusText}`);
      }

      const data = await res.json();
      return response.status(200).json({ result: data.result });
    }

    if (request.method === 'POST') {
      const { phone, payload } = request.body;
      if (!phone || !payload) {
        return response.status(400).json({ error: "Missing phone or payload parameters." });
      }
      const cleanPhone = phone.replace(/\D/g, "");
      const dbKey = `chand_shop_db_${cleanPhone}`;

      const res = await fetch(`${UPSTASH_URL}/set/${dbKey}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${UPSTASH_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error(`Upstash save error: ${res.statusText}`);
      }

      return response.status(200).json({ success: true });
    }

    return response.status(405).json({ error: "Method not allowed." });
  } catch (err) {
    console.error("Serverless API Error:", err);
    return response.status(500).json({ error: err.message });
  }
}
