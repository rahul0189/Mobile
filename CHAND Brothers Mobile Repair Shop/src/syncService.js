// Automatic Background Cloud Sync Service for CHAND Brothers

const IMMANUEL_KEY = "chand_brothers_shop_app";
const IMMANUEL_VAL_KEY = "bucket_key";

// Local storage key for resolved bucket ID cache
const CACHE_KEY = "chand_cloud_bucket_id";

// Initialize and resolve the shared cloud bucket ID
export async function initCloudSync() {
  // Check local cache first
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    return cached;
  }

  try {
    // 1. Fetch shared bucket ID from immanuel.co directory service via CORS proxy
    const targetDirUrl = `https://keyvalue.immanuel.co/api/KeyVal/GetValue/${IMMANUEL_KEY}/${IMMANUEL_VAL_KEY}`;
    const response = await fetch('https://corsproxy.io/?url=' + encodeURIComponent(targetDirUrl));
    const data = await response.text();
    let bucketId = data ? data.replace(/"/g, "").trim() : "";

    // 2. If no bucket exists in directory, create a new one on kvdb.io via CORS proxy
    const isInvalid = !bucketId || 
                      bucketId.includes("error") || 
                      bucketId.toLowerCase().includes("not found") || 
                      bucketId.toLowerCase().includes("notfound") ||
                      bucketId.length < 10;

    if (isInvalid) {
      const targetUrl = 'https://kvdb.io/';
      const createRes = await fetch('https://corsproxy.io/?url=' + encodeURIComponent(targetUrl), {
        method: 'POST'
      });
      if (createRes.ok) {
        bucketId = (await createRes.text()).trim();
        if (bucketId) {
          // Save newly created bucket ID back to immanuel.co directory (POST via proxy to avoid preflight blocks)
          const updateUrl = `https://keyvalue.immanuel.co/api/KeyVal/UpdateValue/${IMMANUEL_KEY}/${IMMANUEL_VAL_KEY}/${bucketId}`;
          await fetch('https://corsproxy.io/?url=' + encodeURIComponent(updateUrl), {
            method: 'POST'
          });
        }
      }
    }

    if (bucketId) {
      localStorage.setItem(CACHE_KEY, bucketId);
      return bucketId;
    }
  } catch (e) {
    console.error("Cloud Sync directory resolution failed:", e);
  }

  return "";
}

// Fetch and load database backup from the cloud silently (via CORS Proxy)
export async function fetchCloudData(phone, onUpdate) {
  if (!phone) return null;
  const bucket = await initCloudSync();
  if (!bucket) return null;

  const cleanPhone = phone.replace(/\D/g, "");
  const targetUrl = `https://kvdb.io/${bucket}/backup_${cleanPhone}`;

  try {
    const response = await fetch('https://corsproxy.io/?url=' + encodeURIComponent(targetUrl));
    if (!response.ok) return null;

    const data = await response.json();
    if (data) {
      if (data.tickets) localStorage.setItem('chand_repair_tickets', JSON.stringify(data.tickets));
      if (data.products) localStorage.setItem('chand_products', JSON.stringify(data.products));
      if (data.smsTemplates) localStorage.setItem('chand_sms_templates', JSON.stringify(data.smsTemplates));
      if (data.simSales) localStorage.setItem('chand_sim_sales', JSON.stringify(data.simSales));
      
      // Notify parent app to reload state variables
      if (onUpdate) onUpdate();
      return data;
    }
  } catch (e) {
    console.error("Background cloud download failed:", e);
  }
  return null;
}

// Save database backup to the cloud silently (via CORS Proxy)
export async function saveCloudData(phone) {
  if (!phone) return;
  const bucket = await initCloudSync();
  if (!bucket) return;

  const cleanPhone = phone.replace(/\D/g, "");
  const payload = {
    tickets: JSON.parse(localStorage.getItem('chand_repair_tickets')) || [],
    products: JSON.parse(localStorage.getItem('chand_products')) || [],
    smsTemplates: JSON.parse(localStorage.getItem('chand_sms_templates')) || {},
    simSales: JSON.parse(localStorage.getItem('chand_sim_sales')) || [],
    backupTime: Date.now()
  };

  const targetUrl = `https://kvdb.io/${bucket}/backup_${cleanPhone}`;

  try {
    await fetch('https://corsproxy.io/?url=' + encodeURIComponent(targetUrl), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
  } catch (e) {
    console.error("Background cloud upload failed:", e);
  }
}
