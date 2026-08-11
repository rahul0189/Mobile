import React, { useState } from 'react';
import { 
  Database, RefreshCw, Upload, Download, CheckCircle, 
  AlertTriangle, Menu, User, Mail, ShieldCheck, ToggleLeft, ToggleRight
} from 'lucide-react';
import { getTickets, getProducts, getSmsTemplates, saveTickets, saveProducts, saveSmsTemplates } from '../state';

export default function GoogleCloudSyncScreen({
  accountInfo,
  isSyncing,
  syncStatusMessage,
  onSignIn,
  onSignOut,
  onToggleAutoSync,
  onPerformBackup,
  onPerformRestore,
  onRestoreCustomJson,
  onOpenDrawer
}) {
  const [jsonText, setJsonText] = useState("");
  const [restoreError, setRestoreError] = useState("");
  const [restoreSuccess, setRestoreSuccess] = useState("");
  const [autoSyncLocal, setAutoSyncLocal] = useState(false);

  // Generate current local database backup string
  const generateLocalBackupJson = () => {
    const backupObj = {
      tickets: getTickets(),
      products: getProducts(),
      smsTemplates: getSmsTemplates(),
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
      if (!parsed.tickets || !parsed.products || !parsed.smsTemplates) {
        setRestoreError("Invalid format! Missing 'tickets', 'products', or 'smsTemplates' properties.");
        return;
      }

      onRestoreCustomJson(jsonText, (success, msg) => {
        if (success) {
          setRestoreSuccess(msg || "Database successfully restored!");
          setJsonText("");
        } else {
          setRestoreError(msg || "Error restoring database. Please verify JSON format.");
        }
      });
    } catch (e) {
      setRestoreError("Syntax Error: Invalid JSON text. " + e.message);
    }
  };

  const handleAutoSyncToggle = () => {
    const nextVal = !autoSyncLocal;
    setAutoSyncLocal(nextVal);
    onToggleAutoSync(nextVal);
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
            <p className="subtitle">Secure Google Account sync and offline database exports</p>
          </div>
        </div>
      </header>

      {/* Sync Grid */}
      <div className="sync-grid">
        {/* Google Account Status */}
        <div className="card sync-card">
          <h2 className="card-title">
            <User size={18} className="text-cyan" /> Google Cloud Account
          </h2>
          
          {accountInfo?.isLoggedIn ? (
            <div className="google-account-connected">
              <div className="connected-badge">
                <ShieldCheck size={18} className="text-emerald" />
                <span>Google Account Connected</span>
              </div>
              <div className="account-details">
                <div className="detail-item">
                  <User size={14} className="text-muted" />
                  <span>Name: <strong>{accountInfo.name}</strong></span>
                </div>
                <div className="detail-item">
                  <Mail size={14} className="text-muted" />
                  <span>Email: <strong>{accountInfo.email}</strong></span>
                </div>
              </div>

              <div className="auto-sync-row">
                <div className="sync-label-group">
                  <span>Auto Backup to Drive</span>
                  <p className="sub-label">Automatically saves database changes</p>
                </div>
                <button 
                  className="toggle-sync-btn" 
                  onClick={handleAutoSyncToggle}
                  aria-label="Toggle Auto Backup"
                >
                  {autoSyncLocal ? (
                    <ToggleRight className="text-cyan" size={36} />
                  ) : (
                    <ToggleLeft className="text-muted" size={36} />
                  )}
                </button>
              </div>

              <div className="sync-action-buttons">
                <button 
                  className="btn btn-primary" 
                  onClick={onPerformBackup} 
                  disabled={isSyncing}
                >
                  <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
                  Backup Now
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={onPerformRestore} 
                  disabled={isSyncing}
                >
                  <Upload size={16} />
                  Restore Sync
                </button>
              </div>

              <button className="btn btn-danger btn-sm" style={{ marginTop: '20px', width: '100%' }} onClick={onSignOut}>
                Disconnect Google Account
              </button>
            </div>
          ) : (
            <div className="google-account-disconnected">
              <div className="cloud-icon-bg">
                <Database size={48} />
              </div>
              <h3>Cloud Sync Inactive</h3>
              <p>Sign in with your Google account to enable secure cloud backups, auto-saving repair tickets, and syncing inventory stock across multiple devices.</p>
              
              <button 
                className="btn btn-primary" 
                onClick={() => onSignIn("rahul.chand@gmail.com", "Rahul Chand")}
                style={{ marginTop: '16px', width: '100%' }}
              >
                Sign In with Google Cloud
              </button>
            </div>
          )}

          {syncStatusMessage && (
            <div className="sync-status-toast">
              <div className="pulse-dot"></div>
              <span>{syncStatusMessage}</span>
            </div>
          )}
        </div>

        {/* Offline Backups JSON Manager */}
        <div className="card sync-card">
          <h2 className="card-title">
            <Download size={18} className="text-indigo" /> Local Storage Files
          </h2>
          
          <div className="offline-backup-actions">
            <p className="backup-desc">Export the entire repair shop database (tickets, inventory catalog, custom SMS notification templates) into a single offline `.json` file for local archiving.</p>
            <button className="btn btn-secondary" style={{ width: '100%', marginBottom: '24px' }} onClick={handleDownloadBackup}>
              <Download size={16} /> Export Local Database (.json)
            </button>
          </div>

          <hr className="divider" style={{ margin: '16px 0' }} />

          <div className="custom-restore-section">
            <h3>Restore Database from Clipboard</h3>
            <p className="backup-desc">Paste your backup JSON string content below to overwrite local storage data.</p>
            
            <textarea 
              className="form-input custom-json-textarea"
              placeholder='Paste JSON backup code here... e.g. { "tickets": [...], "products": [...] }'
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              rows={6}
            />

            {restoreError && (
              <div className="alert alert-error">
                <AlertTriangle size={16} />
                <span>{restoreError}</span>
              </div>
            )}

            {restoreSuccess && (
              <div className="alert alert-success">
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
