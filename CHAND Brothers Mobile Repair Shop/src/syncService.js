const UPSTASH_URL = "https://fitting-bream-138175.upstash.io";
const UPSTASH_TOKEN = "gQAAAAAAAhu_AAIgcDJhZWMzZDA0OTg2Yjg0MGNjOGNhYTdmNGQ3M2I4MjAyMA";

const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Perform bidirectional synchronization using Last-Write-Wins (LWW) conflict resolution
export async function syncCloudDatabase(phone, onUpdate) {
  if (!phone) return;
  const cleanPhone = phone.replace(/\D/g, "");
  const dbKey = `chand_shop_db_${cleanPhone}`;

  // Get local write time
  const localWriteTimeStr = localStorage.getItem('chand_last_local_write_time');
  const localWriteTime = localWriteTimeStr ? Number(localWriteTimeStr) : 0;

  try {
    let cloudRawVal = null;

    // A. Use secure serverless backend API in production to hide keys
    if (!isLocalhost) {
      const response = await fetch(`/api/sync?phone=${cleanPhone}`);
      if (!response.ok) {
        throw new Error(`Serverless sync returned error status: ${response.status}`);
      }
      const resJson = await response.json();
      cloudRawVal = resJson.result;
    }
    // B. Fallback to direct Upstash query in localhost development
    else {
      console.log('[Sync] Localhost detected. Performing direct cloud connection...');
      const response = await fetch(`${UPSTASH_URL}/get/${dbKey}`, {
        headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` }
      });
      if (!response.ok) {
        throw new Error(`Upstash returned error status: ${response.status}`);
      }
      const resJson = await response.json();
      cloudRawVal = resJson.result;
    }

    // Case 1: No cloud database exists yet
    if (!cloudRawVal) {
      console.log('[Sync] No database found in Vercel KV. Uploading local database...');
      await uploadLocalDatabase(cleanPhone, localWriteTime || Date.now());
      return;
    }

    const cloudData = JSON.parse(cloudRawVal);
    const cloudBackupTime = cloudData.backupTime || 0;

    // Case 2: Cloud is newer (or equal) -> Download & overwrite local storage
    if (cloudBackupTime >= localWriteTime) {
      console.log('[Sync] Vercel KV is newer. Restoring locally...', { cloudBackupTime, localWriteTime });
      
      if (cloudData.tickets) localStorage.setItem('chand_repair_tickets', JSON.stringify(cloudData.tickets));
      if (cloudData.products) localStorage.setItem('chand_products', JSON.stringify(cloudData.products));
      if (cloudData.smsTemplates) localStorage.setItem('chand_sms_templates', JSON.stringify(cloudData.smsTemplates));
      
      // Sync technicians passwords database!
      if (cloudData.registered_technicians) {
        localStorage.setItem('chand_registered_technicians', JSON.stringify(cloudData.registered_technicians));
      }
      
      // Update local write timestamp to match cloud
      localStorage.setItem('chand_last_local_write_time', cloudBackupTime.toString());
      
      if (onUpdate) onUpdate();
    } 
    // Case 3: Local is newer -> Upload & overwrite cloud database
    else {
      console.log('[Sync] Local database has newer changes. Backing up to Vercel KV...', { localWriteTime, cloudBackupTime });
      await uploadLocalDatabase(cleanPhone, localWriteTime);
    }
  } catch (e) {
    console.error('[Sync] Bidirectional sync failed:', e);
    throw e;
  }
}

// Helper function to upload local database package
async function uploadLocalDatabase(cleanPhone, timestamp) {
  const dbKey = `chand_shop_db_${cleanPhone}`;
  const payload = {
    tickets: JSON.parse(localStorage.getItem('chand_repair_tickets')) || [],
    products: JSON.parse(localStorage.getItem('chand_products')) || [],
    smsTemplates: JSON.parse(localStorage.getItem('chand_sms_templates')) || {},
    registered_technicians: JSON.parse(localStorage.getItem('chand_registered_technicians')) || [],
    backupTime: timestamp
  };

  try {
    // A. Use secure serverless backend API in production to hide keys
    if (!isLocalhost) {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone, payload })
      });
      if (!response.ok) {
        throw new Error(`Serverless sync save failed. Status: ${response.status}`);
      }
    }
    // B. Fallback to direct Upstash query in localhost development
    else {
      const response = await fetch(`${UPSTASH_URL}/set/${dbKey}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${UPSTASH_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        throw new Error(`Failed to upload directly to Upstash. Status: ${response.status}`);
      }
    }
  } catch (e) {
    console.error('[Sync] Database upload failed:', e);
    throw e;
  }
}

// Retain legacy functions as thin wrappers to prevent compile errors in other files
export async function fetchCloudData(phone, onUpdate) {
  return syncCloudDatabase(phone, onUpdate);
}

export async function saveCloudData(phone) {
  const cleanPhone = phone.replace(/\D/g, "");
  const localWriteTimeStr = localStorage.getItem('chand_last_local_write_time') || Date.now().toString();
  return uploadLocalDatabase(cleanPhone, Number(localWriteTimeStr));
}

export async function resolveUserBucket(phone) {
  return "vercel_kv_active";
}

export async function initCloudSync() {
  return "vercel_kv_active";
}
