import React, { useState, useEffect } from 'react';
import { 
  Database, RefreshCw, Upload, Download, CheckCircle, 
  AlertTriangle, Menu, User, Mail, ShieldCheck, CloudLightning,
  Sparkles, CheckCircle2, Copy, Key, Link2, LogOut
} from 'lucide-react';
import { getTickets, getProducts, getSmsTemplates } from '../state';

export default function GoogleCloudSyncScreen({
  authUser,
  onOpenDrawer,
  onRefreshDb
}) {
  const [bucketId, setBucketId] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");
  const [syncType, setSyncType] = useState(""); // "success", "error", "info"
  const [lastBackupTime, setLastBackupTime] = useState(null);
  
  const [inputKey, setInputKey] = useState("");
  const [jsonText, setJsonText] = useState("");
  const [restoreError, setRestoreError] = useState("");
  const [restoreSuccess, setRestoreSuccess] = useState("");

  // Load bucket configuration on mount
  useEffect(() => {
    const savedBucket = localStorage.getItem('chand_cloud_bucket_id');
    if (savedBucket) {
      setBucketId(savedBucket);
      const storedTime = localStorage.getItem(`chand_last_backup_time`);
      if (storedTime) {
        setLastBackupTime(Number(storedTime));
      }
    }
  }, []);

  // Generate a brand new cloud sync key on kvdb.io
  const handleGenerateKey = async () => {
    setIsSyncing(true);
    setSyncMsg("Generating secure Cloud Sync Key...");
    setSyncType("info");

    try {
      const targetUrl = 'https://kvdb.io/';
      const response = await fetch('https://corsproxy.io/?url=' + encodeURIComponent(targetUrl), {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error("Failed to create bucket on server.");
      }

      const newBucketId = (await response.text()).trim();
      if (newBucketId) {
        localStorage.setItem('chand_cloud_bucket_id', newBucketId);
        setBucketId(newBucketId);
        setSyncMsg("New Sync Key generated! Share this key with other devices to link them.");
        setSyncType("success");
      }
    } catch (e) {
      console.error(e);
      setSyncMsg("Failed to generate Sync Key. Check internet connection.");
      setSyncType("error");
    } finally {
      setIsSyncing(false);
    }
  };

  // Connect an existing sync key
  const handleConnectKey = (e) => {
    e.preventDefault();
    setSyncMsg("");
    const cleanKey = inputKey.trim();

    if (!cleanKey) {
      setSyncMsg("Please enter a valid Sync Key.");
      setSyncType("error");
      return;
    }

    localStorage.setItem('chand_cloud_bucket_id', cleanKey);
    setBucketId(cleanKey);
    setInputKey("");
    setSyncMsg("Device successfully linked! Click 'Restore from Cloud' to download data.");
    setSyncType("success");
  };

  // Disconnect sync key
  const handleDisconnect = () => {
    if (confirm("Are you sure you want to disconnect? Your local data won't be deleted, but cloud sync will stop.")) {
      localStorage.removeItem('chand_cloud_bucket_id');
      localStorage.removeItem('chand_last_backup_time');
      setBucketId("");
      setLastBackupTime(null);
      setSyncMsg("Cloud Sync disconnected.");
      setSyncType("info");
    }
  };

  // Perform a 1-click cloud backup
  const handleCloudBackup = async () => {
    if (!bucketId) return;

    setIsSyncing(true);
    setSyncMsg("Saving data to Cloud Database...");
    setSyncType("info");

    const backupData = {
      tickets: getTickets(),
      products: getProducts(),
      smsTemplates: getSmsTemplates(),
      simSales: JSON.parse(localStorage.getItem('chand_sim_sales')) || [],
      backupTime: Date.now(),
      technician: authUser?.name || "Rahul"
    };

    try {
      const targetUrl = `https://kvdb.io/${bucketId}/shop_database`;
      const response = await fetch('https://corsproxy.io/?url=' + encodeURIComponent(targetUrl), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(backupData)
      });

      if (response.ok) {
        setSyncMsg("Backup saved to Cloud successfully! Ready to load on other devices.");
        setSyncType("success");
        localStorage.setItem(`chand_last_backup_time`, Date.now().toString());
        setLastBackupTime(Date.now());
      } else {
        throw new Error("Failed to save backup on server.");
      }
    } catch (e) {
      console.error(e);
      setSyncMsg("Cloud backup failed! Check your internet connection.");
      setSyncType("error");
    } finally {
      setIsSyncing(false);
    }
  };

  // Perform a 1-click cloud restore
  const handleCloudRestore = async () => {
    if (!bucketId) return;

    if (!confirm("WARNING: This will overwrite your current device data with your cloud backup. Proceed?")) {
      return;
    }

    setIsSyncing(true);
    setSyncMsg("Fetching your cloud data...");
    setSyncType("info");

    try {
      const targetUrl = `https://kvdb.io/${bucketId}/shop_database`;
      const response = await fetch('https://corsproxy.io/?url=' + encodeURIComponent(targetUrl));
      
      if (!response.ok) {
        throw new Error("No backup found or server error.");
      }

      const backupData = await response.json();
      
      if (backupData.tickets) {
        localStorage.setItem('chand_repair_tickets', JSON.stringify(backupData.tickets));
      }
      if (backupData.products) {
        localStorage.setItem('chand_products', JSON.stringify(backupData.products));
      }
      if (backupData.smsTemplates) {
        localStorage.setItem('chand_sms_templates', JSON.stringify(backupData.smsTemplates));
      }
      if (backupData.simSales) {
        localStorage.setItem('chand_sim_sales', JSON.stringify(backupData.simSales));
      }

      setSyncMsg("Database successfully restored! All tickets and products updated.");
      setSyncType("success");
      
      if (onRefreshDb) {
        onRefreshDb();
      }
    } catch (e) {
      console.error(e);
      setSyncMsg("No backup database found in this cloud key. Click 'Backup to Cloud' first.");
      setSyncType("error");
    } finally {
      setIsSyncing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(bucketId);
    alert("Sync Key copied to clipboard!");
  };

  // Generate current local database backup string for offline export
  const generateLocalBackupJson = () => {
    const backupObj = {
      tickets: getTickets(),
      products: getProducts(),
      smsTemplates: getSmsTemplates(),
      simSales: JSON.parse(localStorage.getItem('chand_sim_sales')) || [],
      backupTime: Date.now(),
      shopName: "CHAND Brothers Mobile Repair"
    };
    return JSON.stringify(backupObj, null, 2);
  };

  const handleDownloadBackup = () => {
    const dataStr = generateLocalBackupJson();
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chand_brothers_backup_${new Date().toISOString().slice(0,10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCustomRestore = () => {
    setRestoreError("");
    setRestoreSuccess("");
    
    if (jsonText.trim() === "") {
      setRestoreError("Please paste JSON backup text before restoring.");
      return;
    }

    try {
      const parsed = JSON.parse(jsonText);
      if (!parsed.tickets || !parsed.products) {
        setRestoreError("Invalid format! Missing 'tickets' or 'products' properties.");
        return;
      }

      if (parsed.tickets) {
        localStorage.setItem('chand_repair_tickets', JSON.stringify(parsed.tickets));
      }
      if (parsed.products) {
        localStorage.setItem('chand_products', JSON.stringify(parsed.products));
      }
      if (parsed.smsTemplates) {
        localStorage.setItem('chand_sms_templates', JSON.stringify(parsed.smsTemplates));
      }
      if (parsed.simSales) {
        localStorage.setItem('chand_sim_sales', JSON.stringify(parsed.simSales));
      }

      setRestoreSuccess("Database successfully restored from JSON!");
      setJsonText("");

      if (onRefreshDb) {
        onRefreshDb();
      }
    } catch (e) {
      setRestoreError("Syntax Error: Invalid JSON text. " + e.message);
    }
  };

  const formatTime = (ms) => {
    if (!ms) return "Never";
    return new Date(ms).toLocaleString('en-IN');
  };

  return (
    <div className="sync-container">
      {/* Header Bar */}
      <header className="screen-header">
        <div className="header-left">
          <button className="menu-toggle-btn" onClick={onOpenDrawer} aria-label="Open Menu">
            <Menu size={24} />
          </button>
          <div>
            <h1>Cloud Sync & Backups</h1>
            <p className="subtitle">Secure multi-device cloud synchronization and offline database exports</p>
          </div>
        </div>
      </header>

      {/* Sync Grid */}
      <div className="sync-grid">
        
        {/* 1-Click Cloud Account Status */}
        <div className="card sync-card border-indigo-glow">
          <h2 className="card-title">
            <CloudLightning size={18} className="text-cyan animate-pulse" /> 1-Click Cloud Sync
          </h2>
          
          {bucketId ? (
            /* Case A: Key Connected */
            <div className="google-account-connected">
              <div className="connected-badge" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={18} className="text-emerald" />
                  <span>Cloud Storage Connected</span>
                </div>
                <button className="btn btn-sm btn-danger" onClick={handleDisconnect} style={{ padding: '4px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <LogOut size={12} /> Disconnect
                </button>
              </div>
              
              <div className="account-details" style={{ marginTop: '16px' }}>
                <label style={{ fontSize: '11px', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>Your Shop Sync Key (Share with other devices):</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input 
                    type="text" 
                    readOnly 
                    value={bucketId} 
                    className="form-input" 
                    style={{ fontFamily: 'monospace', fontSize: '12px', height: '36px', backgroundColor: 'rgba(0,0,0,0.2)', color: 'var(--color-cyan)', fontWeight: 'bold' }}
                  />
                  <button className="btn btn-secondary" onClick={copyToClipboard} style={{ padding: '0 12px', height: '36px' }} title="Copy Sync Key">
                    <Copy size={16} />
                  </button>
                </div>
              </div>

              <div className="sync-info-row" style={{ margin: '16px 0', padding: '10px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
                <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Last Cloud Sync:</div>
                <div style={{ fontSize: '13px', color: '#fff', fontWeight: 700 }}>{formatTime(lastBackupTime)}</div>
              </div>

              {syncMsg && (
                <div className={`alert ${syncType === 'success' ? 'alert-success' : syncType === 'error' ? 'alert-error' : 'alert-info'}`} style={{ marginBottom: '16px' }}>
                  {syncType === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                  <span>{syncMsg}</span>
                </div>
              )}

              <div className="sync-action-buttons" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button 
                  className="btn btn-primary" 
                  onClick={handleCloudBackup} 
                  disabled={isSyncing}
                  style={{ height: '44px', fontWeight: 700 }}
                >
                  <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
                  Backup to Cloud
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={handleCloudRestore} 
                  disabled={isSyncing}
                  style={{ height: '44px', fontWeight: 700 }}
                >
                  <Upload size={16} />
                  Restore from Cloud
                </button>
              </div>
            </div>
          ) : (
            /* Case B: No Key Connected */
            <div className="google-account-disconnected" style={{ textAlign: 'center', padding: '20px 0' }}>
              <div className="cloud-icon-bg" style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(6,182,212,0.1)', display: 'flex', alignItems: 'center', justify: 'center', margin: '0 auto 16px auto', color: 'var(--color-cyan)' }}>
                <Database size={32} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>Sync Devices Together</h3>
              <p className="backup-desc" style={{ maxWidth: '360px', margin: '0 auto 20px auto' }}>
                Link your phone and PC to sync repair tickets and inventory catalog across devices without handling files.
              </p>

              {syncMsg && (
                <div className={`alert ${syncType === 'success' ? 'alert-success' : syncType === 'error' ? 'alert-error' : 'alert-info'}`} style={{ marginBottom: '16px', textAlign: 'left' }}>
                  {syncType === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                  <span>{syncMsg}</span>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                {/* Option 1: Generate Key */}
                <div style={{ padding: '16px', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                  <span style={{ display: 'block', fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '8px', fontWeight: 600 }}>Option A: Fresh Setup</span>
                  <button 
                    className="btn btn-primary" 
                    onClick={handleGenerateKey} 
                    disabled={isSyncing}
                    style={{ width: '100%' }}
                  >
                    <Key size={16} /> Generate New Sync Key
                  </button>
                </div>

                {/* Option 2: Connect Existing Key */}
                <div style={{ padding: '16px', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                  <span style={{ display: 'block', fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '8px', fontWeight: 600 }}>Option B: Link to Another Device</span>
                  <form onSubmit={handleConnectKey} style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      type="text" 
                      placeholder="Paste Sync Key here..." 
                      className="form-input" 
                      value={inputKey}
                      onChange={(e) => setInputKey(e.target.value)}
                      style={{ height: '36px', fontSize: '12px' }}
                      required
                    />
                    <button type="submit" className="btn btn-secondary" style={{ height: '36px', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                      <Link2 size={16} /> Link
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Offline Backups JSON Manager */}
        <div className="card sync-card">
          <h2 className="card-title">
            <Download size={18} className="text-indigo" /> Advanced Offline Backups
          </h2>
          
          <div className="offline-backup-actions">
            <p className="backup-desc">Export the entire repair shop database (tickets, inventory catalog, custom SMS notification templates) into a single offline `.json` file for local archiving.</p>
            <button className="btn btn-secondary" style={{ width: '100%', marginBottom: '24px' }} onClick={handleDownloadBackup}>
              <Download size={16} /> Export Local Database (.json)
            </button>
          </div>

          <hr className="divider" style={{ margin: '16px 0', opacity: 0.1 }} />

          <div className="custom-restore-section">
            <h3>Restore Database from Clipboard</h3>
            <p className="backup-desc">Paste your backup JSON string content below to overwrite local storage data.</p>
            
            <textarea 
              className="form-input custom-json-textarea"
              placeholder='Paste JSON backup code here... e.g. { "tickets": [...], "products": [...] }'
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              rows={4}
              style={{ fontSize: '12px', fontFamily: 'monospace' }}
            />

            {restoreError && (
              <div className="alert alert-error" style={{ marginTop: '10px' }}>
                <AlertTriangle size={16} />
                <span>{restoreError}</span>
              </div>
            )}

            {restoreSuccess && (
              <div className="alert alert-success" style={{ marginTop: '10px' }}>
                <CheckCircle size={16} />
                <span>{restoreSuccess}</span>
              </div>
            )}

            <button className="btn btn-secondary" style={{ width: '100%', marginTop: '12px' }} onClick={handleCustomRestore}>
              <Upload size={16} /> Load pasted Backup Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
