const https = require('https');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Get path from query parameters, e.g. /api/sync?path=mybucket/mykey
  const { path } = req.query;
  const targetUrl = `https://kvdb.io/${path || ''}`;

  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      const request = https.request(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': req.headers['content-type'] || 'application/json'
        }
      }, (response) => {
        let responseData = '';
        response.on('data', chunk => { responseData += chunk; });
        response.on('end', () => {
          res.status(response.statusCode).send(responseData.trim());
        });
      });
      request.on('error', (e) => {
        res.status(500).json({ error: e.message });
      });
      request.write(body);
      request.end();
    });
  } else {
    // GET request
    const request = https.request(targetUrl, {
      method: 'GET'
    }, (response) => {
      let responseData = '';
      response.on('data', chunk => { responseData += chunk; });
      response.on('end', () => {
        res.status(response.statusCode).send(responseData.trim());
      });
    });
    request.on('error', (e) => {
      res.status(500).json({ error: e.message });
    });
    request.end();
  }
};
