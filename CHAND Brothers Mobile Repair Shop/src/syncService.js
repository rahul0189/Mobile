const IMMANUEL_KEY = "chand_brothers_shop_app";

// Local storage key for resolved bucket ID cache
const CACHE_KEY = "chand_cloud_bucket_id";

// Initialize and resolve the cloud bucket ID for a specific technician phone number
export async function resolveUserBucket(phone) {
  const cleanPhone = phone.replace(/\D/g, "");
  if (!cleanPhone) return "";

  // Check local cache first
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached && cached.length > 5 && !cached.includes("not found")) {
    return cached;
  }

  try {
    // 1. Fetch bucket ID mapped to this phone number from immanuel.co directory service (CORS-friendly GET)
    const targetDirUrl = `https://keyvalue.immanuel.co/api/KeyVal/GetValue/${IMMANUEL_KEY}/bucket_${cleanPhone}`;
    const response = await fetch(targetDirUrl);
    const data = await response.text();
    let bucketId = data ? data.replace(/"/g, "").trim() : "";

    const isInvalid = !bucketId || 
                      bucketId.includes("error") || 
                      bucketId.toLowerCase().includes("not found") || 
                      bucketId.toLowerCase().includes("notfound") ||
                      bucketId.length < 10;

    // 2. If no bucket exists for this account, create a new one on kvdb.io using multi-proxy fallback
    if (isInvalid) {
      console.log(`[Sync] Creating new KVdb bucket for account ${cleanPhone}...`);
      
      const proxies = [
        'https://thingproxy.freeboard.io/fetch/https://kvdb.io/',
        'https://corsproxy.io/?url=https%3A%2F%2Fkvdb.io%2F',
        'https://api.codetabs.com/v1/proxy?quest=https://kvdb.io/'
      ];

      for (const proxyUrl of proxies) {
        try {
          console.log(`[Sync] Trying bucket creation proxy: ${proxyUrl}`);
          const createRes = await fetch(proxyUrl, { method: 'POST' });
          if (createRes.ok) {
            const text = (await createRes.text()).trim();
            if (text && text.length > 5 && !text.includes('html') && !text.includes('error')) {
              bucketId = text;
              console.log(`[Sync] Successfully created bucket via proxy: ${bucketId}`);
              break; // Success
            }
          }
        } catch (err) {
          console.warn(`[Sync] Proxy failed: ${proxyUrl}`, err);
        }
      }

      if (bucketId && bucketId.length > 5 && !bucketId.includes('html')) {
        // Save the mapping to immanuel.co directory (CORS-friendly POST)
        const updateUrl = `https://keyvalue.immanuel.co/api/KeyVal/UpdateValue/${IMMANUEL_KEY}/bucket_${cleanPhone}/${bucketId}`;
        await fetch(updateUrl, { method: 'POST' });
        console.log(`[Sync] Saved bucket mapping for ${cleanPhone}: ${bucketId}`);
      } else {
        throw new Error("Could not create cloud storage. All proxies failed.");
      }
    }

    if (bucketId && bucketId.length > 5) {
      localStorage.setItem(CACHE_KEY, bucketId);
      return bucketId;
    }
  } catch (e) {
    console.error(`[Sync] Bucket resolution failed for account ${cleanPhone}:`, e);
    throw e;
  }

  return "";
}

// Perform bidirectional synchronization using Last-Write-Wins (LWW) conflict resolution
export async function syncCloudDatabase(phone, onUpdate) {
  if (!phone) return;
  const cleanPhone = phone.replace(/\D/g, "");
  const bucketId = await resolveUserBucket(cleanPhone);
  if (!bucketId) return;

  const targetUrl = `https://kvdb.io/${bucketId}/shop_database`;

  // Get local write time
  const localWriteTimeStr = localStorage.getItem('chand_last_local_write_time');
  const localWriteTime = localWriteTimeStr ? Number(localWriteTimeStr) : 0;

  try {
    const response = await fetch(targetUrl);
    
    // Case 1: No cloud database exists yet
    if (!response.ok) {
      if (response.status === 404) {
        console.log('[Sync] No cloud database found. Uploading local database...');
        await uploadLocalDatabase(bucketId, localWriteTime || Date.now());
      }
      return;
    }

    const cloudData = await response.json();
    const cloudBackupTime = cloudData.backupTime || 0;

    // Case 2: Cloud is newer (or equal) -> Download & overwrite local storage
    if (cloudBackupTime >= localWriteTime) {
      console.log('[Sync] Cloud database is newer. Restoring locally...', { cloudBackupTime, localWriteTime });
      
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
      console.log('[Sync] Local database has newer changes. Backing up to cloud...', { localWriteTime, cloudBackupTime });
      await uploadLocalDatabase(bucketId, localWriteTime);
    }
  } catch (e) {
    console.error('[Sync] Bidirectional sync failed:', e);
    throw e;
  }
}

// Helper function to upload local database package
async function uploadLocalDatabase(bucketId, timestamp) {
  const targetUrl = `https://kvdb.io/${bucketId}/shop_database`;
  const payload = {
    tickets: JSON.parse(localStorage.getItem('chand_repair_tickets')) || [],
    products: JSON.parse(localStorage.getItem('chand_products')) || [],
    smsTemplates: JSON.parse(localStorage.getItem('chand_sms_templates')) || {},
    registered_technicians: JSON.parse(localStorage.getItem('chand_registered_technicians')) || [],
    backupTime: timestamp
  };

  try {
    await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
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
  const cached = localStorage.getItem(CACHE_KEY);
  if (!cached) return;
  const localWriteTimeStr = localStorage.getItem('chand_last_local_write_time') || Date.now().toString();
  return uploadLocalDatabase(cached, Number(localWriteTimeStr));
}
