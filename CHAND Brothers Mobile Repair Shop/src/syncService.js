// Automatic Background Cloud Sync Service for CHAND Brothers

const IMMANUEL_KEY = "chand_brothers_shop_app";
const IMMANUEL_VAL_KEY = "bucket_key";

// Local storage key for resolved bucket ID cache
const CACHE_KEY = "chand_shared_bucket_id_cache";

let resolvedBucketId = "";

// Initialize and resolve the shared cloud bucket ID
export async function initCloudSync() {
  if (resolvedBucketId) return resolvedBucketId;

  // Check local cache first
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    resolvedBucketId = cached;
    return cached;
  }

  try {
    // 1. Fetch shared bucket ID from immanuel.co directory service
    const response = await fetch(`https://keyvalue.immanuel.co/api/KeyVal/GetValue/${IMMANUEL_KEY}/${IMMANUEL_VAL_KEY}`);
    const data = await response.text();
    let bucketId = data ? data.replace(/"/g, "").trim() : "";

    // 2. If no bucket exists in directory, create a new one on kvdb.io via CORS proxy
    if (!bucketId || bucketId.includes("error") || bucketId.length < 5) {
      const createRes = await fetch('https://corsproxy.io/?' + encodeURIComponent('https://kvdb.io/'), {
        method: 'POST'
      });
      if (createRes.ok) {
        bucketId = (await createRes.text()).trim();
        if (bucketId) {
          // Save newly created bucket ID back to immanuel.co directory for all other devices
          await fetch(`https://keyvalue.immanuel.co/api/KeyVal/UpdateValue/${IMMANUEL_KEY}/${IMMANUEL_VAL_KEY}/${bucketId}`, {
            method: 'POST'
          });
        }
      }
    }

    if (bucketId) {
      resolvedBucketId = bucketId;
      localStorage.setItem(CACHE_KEY, bucketId);
      return bucketId;
    }
  } catch (e) {
    console.error("Cloud Sync directory resolution failed:", e);
  }

  return "";
}

// Fetch and load database backup from the cloud silently
export async function fetchCloudData(phone, onUpdate) {
  if (!phone) return null;
  const bucket = await initCloudSync();
  if (!bucket) return null;

  const cleanPhone = phone.replace(/\D/g, "");
  try {
    const response = await fetch(`https://kvdb.io/${bucket}/backup_${cleanPhone}`);
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

// Save database backup to the cloud silently
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

  try {
    await fetch(`https://kvdb.io/${bucket}/backup_${cleanPhone}`, {
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
