import { BUCKET_ID } from './bucketConfig';

// Perform bidirectional synchronization using Last-Write-Wins (LWW) conflict resolution
export async function syncCloudDatabase(phone, onUpdate) {
  if (!phone || !BUCKET_ID) return;
  const cleanPhone = phone.replace(/\D/g, "");
  const targetUrl = `https://kvdb.io/${BUCKET_ID}/backup_${cleanPhone}`;

  // Get local write time
  const localWriteTimeStr = localStorage.getItem('chand_last_local_write_time');
  const localWriteTime = localWriteTimeStr ? Number(localWriteTimeStr) : 0;

  try {
    const response = await fetch(targetUrl);
    
    // Case 1: No cloud backup exists yet
    if (!response.ok) {
      if (response.status === 404) {
        console.log('[Sync] No cloud backup found. Uploading local database...');
        await uploadLocalDatabase(cleanPhone, localWriteTime || Date.now());
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
      if (cloudData.simSales) localStorage.setItem('chand_sim_sales', JSON.stringify(cloudData.simSales));
      
      // Update local write timestamp to match cloud
      localStorage.setItem('chand_last_local_write_time', cloudBackupTime.toString());
      
      if (onUpdate) onUpdate();
    } 
    // Case 3: Local is newer -> Upload & overwrite cloud database
    else {
      console.log('[Sync] Local database has newer changes. Backing up to cloud...', { localWriteTime, cloudBackupTime });
      await uploadLocalDatabase(cleanPhone, localWriteTime);
    }
  } catch (e) {
    console.error('[Sync] Bidirectional sync failed:', e);
  }
}

// Helper function to upload local database package
async function uploadLocalDatabase(cleanPhone, timestamp) {
  const targetUrl = `https://kvdb.io/${BUCKET_ID}/backup_${cleanPhone}`;
  const payload = {
    tickets: JSON.parse(localStorage.getItem('chand_repair_tickets')) || [],
    products: JSON.parse(localStorage.getItem('chand_products')) || [],
    smsTemplates: JSON.parse(localStorage.getItem('chand_sms_templates')) || {},
    simSales: JSON.parse(localStorage.getItem('chand_sim_sales')) || [],
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
  }
}

// Retain legacy functions as thin wrappers to prevent compile errors in other files
export async function fetchCloudData(phone, onUpdate) {
  return syncCloudDatabase(phone, onUpdate);
}

export async function saveCloudData(phone) {
  const localWriteTimeStr = localStorage.getItem('chand_last_local_write_time') || Date.now().toString();
  const cleanPhone = phone.replace(/\D/g, "");
  return uploadLocalDatabase(cleanPhone, Number(localWriteTimeStr));
}
