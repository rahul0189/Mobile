import { BUCKET_ID } from './bucketConfig';

// Fetch and load database backup from the cloud silently
export async function fetchCloudData(phone, onUpdate) {
  if (!phone || !BUCKET_ID) return null;
  const cleanPhone = phone.replace(/\D/g, "");
  const targetUrl = `https://kvdb.io/${BUCKET_ID}/backup_${cleanPhone}`;

  try {
    const response = await fetch(targetUrl);
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
  if (!phone || !BUCKET_ID) return;
  const cleanPhone = phone.replace(/\D/g, "");
  const payload = {
    tickets: JSON.parse(localStorage.getItem('chand_repair_tickets')) || [],
    products: JSON.parse(localStorage.getItem('chand_products')) || [],
    smsTemplates: JSON.parse(localStorage.getItem('chand_sms_templates')) || {},
    simSales: JSON.parse(localStorage.getItem('chand_sim_sales')) || [],
    backupTime: Date.now()
  };

  const targetUrl = `https://kvdb.io/${BUCKET_ID}/backup_${cleanPhone}`;

  try {
    await fetch(targetUrl, {
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
