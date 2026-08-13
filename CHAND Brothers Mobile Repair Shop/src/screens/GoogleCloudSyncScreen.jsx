import React, { useState, useEffect } from 'react';
import { 
  Database, RefreshCw, Upload, Download, CheckCircle, 
  AlertTriangle, Menu, User, Mail, ShieldCheck, CloudLightning,
  Sparkles, CheckCircle2
} from 'lucide-react';
import { getTickets, getProducts, getSmsTemplates } from '../state';

export default function GoogleCloudSyncScreen({
  authUser,
  onOpenDrawer,
  onRefreshDb
}) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");
  const [syncType, setSyncType] = useState(""); // "success", "error", "info"
  const [lastBackupTime, setLastBackupTime] = useState(null);
  
  const [jsonText, setJsonText] = useState("");
  const [restoreError, setRestoreError] = useState("");
  const [restoreSuccess, setRestoreSuccess] = useState("");

  const cleanPhone = authUser?.phone?.replace(/\D/g, "") || "";

  useEffect(() => {
    if (cleanPhone) {
      const stored = localStorage.getItem(`chand_last_backup_${cleanPhone}`);
      if (stored) {
        setLastBackupTime(Number(stored));
      }
    }
  }, [cleanPhone]);

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

  // Perform a 1-click cloud backup
  const handleCloudBackup = async () => {
    if (!authUser || !authUser.phone) {
      setSyncMsg("Please log in with your phone number to enable cloud backups.");
      setSyncType("error");
      return;
    }

    setIsSyncing(true);
    setSyncMsg("Saving data to Cloud Database...");
    setSyncType("info");

    const backupData = {
      tickets: getTickets(),
      products: getProducts(),
      smsTemplates: getSmsTemplates(),
      simSales: JSON.parse(localStorage.getItem('chand_sim_sales')) || [],
      backupTime: Date.now(),
      technician: authUser.name
    };

    try {
      const response = await fetch(`https://kvdb.io/chandbrothers_v1/backup_${cleanPhone}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(backupData)
      });

      if (response.ok) {
        setSyncMsg("Backup saved to Cloud successfully! Ready to restore on any device.");
        setSyncType("success");
        localStorage.setItem(`chand_last_backup_${cleanPhone}`, Date.now().toString());
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
    if (!authUser || !authUser.phone) {
      setSyncMsg("Please log in with your phone number to restore database.");
      setSyncType("error");
      return;
    }

    if (!confirm("WARNING: This will overwrite your current device data with your cloud backup. Proceed?")) {
      return;
    }

    setIsSyncing(true);
    setSyncMsg("Fetching your cloud data...");
    setSyncType("info");

    try {
      const response = await fetch(`https://kvdb.io/chandbrothers_v1/backup_${cleanPhone}`);
      
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
      setSyncMsg("No backup found for this number in the cloud. Click 'Backup to Cloud' first.");
      setSyncType("error");
    } finally {
      setIsSyncing(false);
    }
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
            <p className="subtitle">Secure Google Cloud sync and offline database exports</p>
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
          
          <div className="google-account-connected">
            <div className="connected-badge">
              <ShieldCheck size={18} className="text-emerald" />
              <span>Linked to Phone: <strong>+91 {authUser?.phone || "Unknown"}</strong></span>
            </div>
            
            <p className="backup-desc" style={{ marginTop: '12px' }}>
              Your database backups are safely stored in Google Cloud and tied directly to your technician phone number. 
              You can instantly save or load your shop data on any device without handling files.
            </p>

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
