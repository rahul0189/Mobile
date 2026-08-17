const fs = require('fs');
const https = require('https');

const IMMANUEL_KEY = "chand_brothers_shop_app";
const IMMANUEL_VAL_KEY = "bucket_key";
const configPath = './src/bucketConfig.js';

// Helper to make synchronous-like requests using Promises
function httpGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function httpPost(url) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, { method: 'POST' }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.end();
  });
}

async function resolveBucket() {
  try {
    console.log('[Sync Config] Resolving permanent KVdb bucket ID from directory...');
    
    // 1. Fetch from directory service
    const dirUrl = `https://keyvalue.immanuel.co/api/KeyVal/GetValue/${IMMANUEL_KEY}/${IMMANUEL_VAL_KEY}`;
    const rawData = await httpGet(dirUrl);
    let bucketId = rawData ? rawData.replace(/"/g, "").trim() : "";

    const isInvalid = !bucketId || 
                      bucketId.includes("error") || 
                      bucketId.toLowerCase().includes("not found") || 
                      bucketId.toLowerCase().includes("notfound") ||
                      bucketId.length < 10;

    if (isInvalid) {
      console.log('[Sync Config] No valid bucket found. Generating a new KVdb bucket...');
      
      // 2. Create bucket on kvdb.io
      const newBucket = await httpPost('https://kvdb.io/');
      bucketId = newBucket.trim();

      if (bucketId && bucketId.length > 5 && !bucketId.includes('error')) {
        console.log('[Sync Config] Generated bucket:', bucketId);
        
        // 3. Save to directory service
        const updateUrl = `https://keyvalue.immanuel.co/api/KeyVal/UpdateValue/${IMMANUEL_KEY}/${IMMANUEL_VAL_KEY}/${bucketId}`;
        await httpPost(updateUrl);
        console.log('[Sync Config] Saved bucket ID to directory service.');
      } else {
        throw new Error(`Failed to generate bucket. Server returned: ${bucketId}`);
      }
    } else {
      console.log('[Sync Config] Using existing bucket ID:', bucketId);
    }

    // 4. Write config file
    fs.writeFileSync(configPath, `export const BUCKET_ID = "${bucketId}";\n`);
    console.log('[Sync Config] Successfully wrote src/bucketConfig.js');
  } catch (e) {
    console.error('[Sync Config] Error resolving bucket:', e.message);
    // Fallback placeholder
    if (!fs.existsSync(configPath)) {
      fs.writeFileSync(configPath, `export const BUCKET_ID = "fallback_chand_bucket_v1";\n`);
    }
  }
}

resolveBucket();
