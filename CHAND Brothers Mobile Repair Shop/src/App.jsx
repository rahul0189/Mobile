import React, { useState, useEffect } from 'react';
import { 
  Wrench, Package, Users, BarChart3, Database, 
  LogOut, ShieldAlert, X, Shield, Lock, Smartphone, User, Menu,
  Bell, Cpu, CheckCircle2, FileText, ShieldCheck
} from 'lucide-react';

// Import local state logic
import { 
  getTickets, saveTickets, getProducts, getSmsTemplates, getAuthUser, setAuthUser,
  createOrUpdateTicket, createOrUpdateProduct, adjustProductQuantity,
  deleteProduct, deleteTicket, saveSmsTemplate, generateSmsMessage,
  getSimSales, saveSimSales, createOrUpdateSimSale, deleteSimSale
} from './state';

import { initCloudSync, fetchCloudData, saveCloudData, syncCloudDatabase } from './syncService';

// Import Screens
import DashboardScreen from './screens/DashboardScreen';
import TicketDetailScreen from './screens/TicketDetailScreen';
import ProductInventoryScreen from './screens/ProductInventoryScreen';
import CustomerDirectoryScreen from './screens/CustomerDirectoryScreen';
import ReportsScreen from './screens/ReportsScreen';
import GoogleCloudSyncScreen from './screens/GoogleCloudSyncScreen';


// Import Dialog Overlays
import AddEditTicketDialog from './components/AddEditTicketDialog';
import AddEditProductDialog from './components/AddEditProductDialog';
import SmsAlertDialog from './components/SmsAlertDialog';
import SmsTemplateManagerDialog from './components/SmsTemplateManagerDialog';
import ReceiptDialog from './components/ReceiptDialog';


export default function App() {
  // Splash & Auth State
  const [showShutter, setShowShutter] = useState(true);
  const [shutterOpening, setShutterOpening] = useState(false);
  const [authUser, setAuthUserLocal] = useState(getAuthUser());
  const [phoneLogin, setPhoneLogin] = useState("");
  const [techNameLogin, setTechNameLogin] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState("");
  const [passwordLogin, setPasswordLogin] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Navigation State
  const [currentDestination, setCurrentDestination] = useState("REPAIR_TICKETS");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Database State (synchronized from state.js)
  const [tickets, setTickets] = useState([]);
  const [products, setProducts] = useState([]);
  const [smsTemplates, setSmsTemplates] = useState({});


  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("ALL");
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [selectedProductCategory, setSelectedProductCategory] = useState("ALL");

  // Modals Visibility
  const [showAddEditDialog, setShowAddEditDialog] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [showAddEditProductDialog, setShowAddEditProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showSmsTemplateDialog, setShowSmsTemplateDialog] = useState(false);
  const [pendingSmsAlert, setPendingSmsAlert] = useState(null);
  const [receiptTicket, setReceiptTicket] = useState(null);


  // Prefills
  const [prefillCustomerName, setPrefillCustomerName] = useState("");
  const [prefillCustomerPhone, setPrefillCustomerPhone] = useState("");

  // Sync state variables
  const [googleAccount, setGoogleAccount] = useState({ isLoggedIn: false, name: "", email: "" });
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState("");
  const [syncError, setSyncError] = useState("");
  const [syncBucketId, setSyncBucketId] = useState("");

  // Trigger loading database on start
  useEffect(() => {
    // Load local storage initial values
    setTickets(getTickets());
    setProducts(getProducts());
    setSmsTemplates(getSmsTemplates());

    // Listen for database updates
    const handleDbUpdate = () => {
      setTickets(getTickets());
      setProducts(getProducts());
      setSmsTemplates(getSmsTemplates());
    };

    // Listen for auth updates
    const handleAuthUpdate = () => {
      setAuthUserLocal(getAuthUser());
    };

    window.addEventListener('chand_db_update', handleDbUpdate);
    window.addEventListener('chand_auth_update', handleAuthUpdate);

    // Splash door delay
    const timer = setTimeout(() => {
      setShutterOpening(true);
      const closeTimer = setTimeout(() => {
        setShowShutter(false);
      }, 1400);
      return () => clearTimeout(closeTimer);
    }, 1200);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('chand_db_update', handleDbUpdate);
      window.removeEventListener('chand_auth_update', handleAuthUpdate);
    };
  }, []);

  // Set up periodic cloud synchronization whenever the logged-in technician changes
  useEffect(() => {
    if (!authUser || !authUser.phone) {
      setSyncBucketId("");
      setSyncError("");
      return;
    }

    const runSync = async () => {
      try {
        await syncCloudDatabase(authUser.phone, () => {
          setTickets(getTickets());
          setProducts(getProducts());
          setSmsTemplates(getSmsTemplates());
        });
        setSyncBucketId(localStorage.getItem('chand_cloud_bucket_id') || "");
        setSyncError("");
      } catch (err) {
        console.error("Cloud synchronization polling failed:", err);
        setSyncError(err.message || "Failed to sync");
      }
    };

    // Run initial fetch on login/load
    runSync();

    // Poll every 10 seconds for background sync updates from other devices
    const interval = setInterval(runSync, 10000);

    return () => clearInterval(interval);
  }, [authUser]);

  // Sync state to local variables on manual changes
  const refreshDbState = async (isLocalMutation = false) => {
    setTickets(getTickets());
    setProducts(getProducts());
    setSmsTemplates(getSmsTemplates());

    // Silently push changes to cloud database if this is a user-triggered write action
    if (isLocalMutation) {
      localStorage.setItem('chand_last_local_write_time', Date.now().toString());
      const user = getAuthUser();
      if (user && user.phone) {
        try {
          await syncCloudDatabase(user.phone, () => {
            setTickets(getTickets());
            setProducts(getProducts());
            setSmsTemplates(getSmsTemplates());
          });
          setSyncBucketId(localStorage.getItem('chand_cloud_bucket_id') || "");
          setSyncError("");
        } catch (err) {
          console.error("Cloud upload on local mutation failed:", err);
          setSyncError(err.message || "Failed to upload changes");
        }
      }
    }
  };

  // Registered Technicians DB helper
  const getRegisteredTechnicians = () => {
    let techs = localStorage.getItem('chand_registered_technicians');
    if (!techs) {
      // Prepopulate with 'Rahul' account with default password '123'
      const initialTechs = [{ name: "Rahul", phone: "7986911294", password: "123" }];
      localStorage.setItem('chand_registered_technicians', JSON.stringify(initialTechs));
      return initialTechs;
    }
    return JSON.parse(techs);
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoginSuccess("");
    const phone = phoneLogin.trim();
    const name = techNameLogin.trim();
    const password = passwordLogin.trim();

    if (!phone) {
      setLoginError("Please enter your mobile number.");
      return;
    }

    if (!password) {
      setLoginError("Please enter your password.");
      return;
    }

    setIsLoggingIn(true);

    try {
      // 1. Fetch account credentials from the cloud database registry before checking password
      if (!isSignUp) {
        console.log(`[Sync] Downloading cloud credentials for ${phone}...`);
        await syncCloudDatabase(phone, () => {
          setTickets(getTickets());
          setProducts(getProducts());
          setSmsTemplates(getSmsTemplates());
        });
      }

      const techs = getRegisteredTechnicians();

      if (isForgotPassword) {
        const idx = techs.findIndex(t => t.phone === phone);
        if (idx === -1) {
          setLoginError("This mobile number is not registered yet. Please select Sign Up!");
          setIsLoggingIn(false);
          return;
        }

        techs[idx].password = password;
        localStorage.setItem('chand_registered_technicians', JSON.stringify(techs));

        // Push new credentials to cloud immediately
        localStorage.setItem('chand_last_local_write_time', Date.now().toString());
        await syncCloudDatabase(phone);

        // Go back to login screen with success message, DO NOT auto-login
        setPasswordLogin("");
        setIsForgotPassword(false);
        setLoginSuccess("Password reset successfully! Please log in with your new password.");
      } else if (isSignUp) {
        if (!name) {
          setLoginError("Please enter your name.");
          setIsLoggingIn(false);
          return;
        }
        const exists = techs.find(t => t.phone === phone);
        if (exists) {
          setLoginError("This mobile number is already registered. Switch to Sign In!");
          setIsLoggingIn(false);
          return;
        }

        const newUser = { name, phone, password, provider: "phone" };
        techs.push(newUser);
        localStorage.setItem('chand_registered_technicians', JSON.stringify(techs));

        // Sync initial technician registry block with cloud database
        localStorage.setItem('chand_last_local_write_time', Date.now().toString());
        await syncCloudDatabase(phone);

        // Log in immediately
        setAuthUser(newUser);
        setAuthUserLocal(newUser);
        setPasswordLogin("");
        refreshDbState();
      } else {
        const exists = techs.find(t => t.phone === phone);
        if (!exists) {
          setLoginError("Account not found. Please register by selecting Sign Up!");
          setIsLoggingIn(false);
          return;
        }

        // Check password (fallback to '123' if not set in legacy account)
        const correctPassword = exists.password || "123";
        if (password !== correctPassword) {
          setLoginError("Invalid password. Please try again.");
          setIsLoggingIn(false);
          return;
        }

        // Log in
        setAuthUser(exists);
        setAuthUserLocal(exists);
        setPasswordLogin("");
        refreshDbState();
      }
    } catch (err) {
      console.error("[Login Sync Error] ", err);
      setLoginError("Network connection failed. Could not verify credentials.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const obfuscatePhone = (phone) => {
    if (!phone || phone.length < 4) return phone;
    const first = phone.slice(0, 2);
    const last = phone.slice(-2);
    return `${first}******${last}`;
  };

  const handleLogout = () => {
    if(confirm("Logout from shop system?")) {
      setAuthUser(null);
      setCurrentDestination("REPAIR_TICKETS");
      setSelectedTicket(null);
    }
  };

  // Google Sync Simulation
  const handleGoogleSignIn = (email, name) => {
    setGoogleAccount({ isLoggedIn: true, name, email });
    setSyncStatusMsg("Google Account synced.");
  };

  const handleGoogleSignOut = () => {
    setGoogleAccount({ isLoggedIn: false, name: "", email: "" });
    setSyncStatusMsg("Google Cloud disconnected.");
  };

  const handleBackupNow = () => {
    setIsSyncing(true);
    setSyncStatusMsg("Backing up databases to Google Drive...");
    setTimeout(() => {
      setIsSyncing(false);
      setSyncStatusMsg(`Backup complete! Saved ${tickets.length} tickets, ${products.length} catalog items.`);
    }, 1500);
  };

  const handleRestoreSync = () => {
    setIsSyncing(true);
    setSyncStatusMsg("Retrieving backup files from Google Drive...");
    setTimeout(() => {
      setIsSyncing(false);
      setSyncStatusMsg("Restore complete! Local storage synced with Google Drive backup.");
      refreshDbState();
    }, 1500);
  };

  const handleCustomJsonRestore = (jsonStr, callback) => {
    try {
      const data = JSON.parse(jsonStr);
      saveTickets(data.tickets || []);
      saveProducts(data.products || []);
      saveSmsTemplates(data.smsTemplates || {});
      if (data.simSales) {
        saveSimSales(data.simSales);
      }
      refreshDbState(true);
      const simMsg = data.simSales ? `, ${data.simSales.length} SIM records` : "";
      callback(true, `Database restored successfully. Loaded ${data.tickets.length} tickets, ${data.products.length} products${simMsg}.`);
    } catch(e) {
      callback(false, e.message);
    }
  };



  // Ticket Operations handlers
  const handleSaveTicket = (ticketData) => {
    createOrUpdateTicket(ticketData);
    setShowAddEditDialog(false);
    setEditingTicket(null);
    setPrefillCustomerName("");
    setPrefillCustomerPhone("");
    // If we're updating the currently viewed ticket, refresh its detailed state
    if (selectedTicket && selectedTicket.id === ticketData.id) {
      const allT = getTickets();
      const updatedT = allT.find(t => t.id === ticketData.id);
      setSelectedTicket(updatedT);
    }
    refreshDbState(true);
  };

  const handleStatusChanged = (ticketId, newStatus, technicianNotes) => {
    console.log("[CHAND DB] handleStatusChanged called with:", { ticketId, newStatus, technicianNotes });
    const ticketsDb = getTickets();
    let idx = ticketsDb.findIndex(t => t.id == ticketId);
    
    if (idx === -1 && selectedTicket) {
      console.warn("[CHAND DB] Loose ID match failed. Attempting fallback match using ticket number:", selectedTicket.ticketNumber);
      idx = ticketsDb.findIndex(t => t.ticketNumber === selectedTicket.ticketNumber);
    }
    
    console.log("[CHAND DB] Target ticket index resolved to:", idx);
    
    if (idx !== -1) {
      ticketsDb[idx].status = newStatus;
      ticketsDb[idx].dateUpdatedMillis = Date.now();
      const notes = technicianNotes || "";
      if (notes.trim() !== "") {
        ticketsDb[idx].technicianNotes = notes.trim();
      }
      
      // If auto sync with google is enabled & account connected
      if (googleAccount.isLoggedIn) {
        setSyncStatusMsg("Auto Backup: saving changes...");
        setTimeout(() => setSyncStatusMsg("Auto Backup: database saved."), 600);
      }
      
      // Update currently selected ticket details in view
      setSelectedTicket(ticketsDb[idx]);
      console.log("[CHAND DB] Ticket updated successfully in memory:", ticketsDb[idx]);
    } else {
      console.error("[CHAND DB] Error: Could not find ticket matching ID or TicketNumber!");
    }
    
    // Save to local storage
    saveTickets(ticketsDb);
    refreshDbState(true);
  };

  const handlePrepareSms = (ticket, statusKey) => {
    const rawTemplate = smsTemplates[statusKey] || "";
    const formatted = generateSmsMessage(ticket, rawTemplate);
    setPendingSmsAlert({ ticket, formattedMessage: formatted });
  };

  const handleNewTicketForCustomer = (name, phone) => {
    setPrefillCustomerName(name);
    setPrefillCustomerPhone(phone);
    setEditingTicket(null);
    setShowAddEditDialog(true);
  };

  // Product Inventory helpers
  const handleSaveProduct = (prodData) => {
    createOrUpdateProduct(prodData);
    setShowAddEditProductDialog(false);
    setEditingProduct(null);
    refreshDbState(true);
  };

  const handleAdjustQuantity = (productId, delta) => {
    adjustProductQuantity(productId, delta);
    refreshDbState(true);
  };

  // Calculate low stock metrics
  const lowStockCount = products.filter(p => p.quantity <= p.lowStockThreshold).length;

  return (
    <>
      {/* 1. Animated Shop Door Shutter Splash Overlay */}
      {showShutter && (
        <div className={`shutter-splash-overlay ${shutterOpening ? 'slide-up-exit' : ''}`}>
          <div className="shutter-signboard">
            <div className="shutter-icon-wrap">
              <Wrench size={36} className="text-cyan animate-pulse" />
            </div>
            <h1>CHAND BROTHERS</h1>
            <h2>MOBILE REPAIR SHOP</h2>
            <div className="shutter-tagline-glow">
              <span className="shutter-dot"></span> WAKING UP WORKSHOP DOOR...
            </div>
          </div>
          
          {/* Metallic rolling slats */}
          <div className="shutter-slats-bg">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className={`shutter-slat ${i % 2 === 0 ? 'alt' : ''}`}>
                <div className="slat-ridge"></div>
              </div>
            ))}
          </div>

          <div className="shutter-handle-bar">
            <div className="lock-label">
              <Lock size={16} /> AUTOMATIC SHOP DOOR UNLOCKING...
            </div>
          </div>
        </div>
      )}

      {/* 2. Login Screen (if not authenticated) */}
      {!authUser ? (
        <div className="login-screen-overlay">
          <div className="login-card card">
            <div className="login-header">
              <div className="shop-logo">
                <Wrench size={32} />
              </div>
              <h1>CHAND BROTHERS</h1>
              <p>{isForgotPassword ? "Reset Technician Password" : "Mobile Tech Dashboard Access"}</p>
            </div>

            {!isForgotPassword && (
              <div className="auth-tab-buttons">
                <button 
                  type="button"
                  className={`auth-tab-btn ${!isSignUp ? 'active' : ''}`}
                  onClick={() => {
                    setIsSignUp(false);
                    setLoginError("");
                    setLoginSuccess("");
                  }}
                >
                  Login
                </button>
                <button 
                  type="button"
                  className={`auth-tab-btn ${isSignUp ? 'active' : ''}`}
                  onClick={() => {
                    setIsSignUp(true);
                    setLoginError("");
                    setLoginSuccess("");
                  }}
                >
                  Sign Up
                </button>
              </div>
            )}

            <div className="login-tabs">
              {loginError && (
                <div className="auth-error-alert">
                  <ShieldAlert size={16} />
                  <span>{loginError}</span>
                </div>
              )}

              {loginSuccess && (
                <div className="auth-error-alert" style={{ backgroundColor: 'rgba(16,185,129,0.12)', color: '#10b981', borderColor: 'rgba(16,185,129,0.2)' }}>
                  <CheckCircle2 size={16} />
                  <span>{loginSuccess}</span>
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="phone-login-form">
                {isSignUp && !isForgotPassword && (
                  <div className="form-group">
                    <label>Technician Name</label>
                    <div className="input-with-icon">
                      <User size={16} className="input-icon" />
                      <input 
                        type="text" 
                        className="form-input" 
                        value={techNameLogin} 
                        onChange={(e) => setTechNameLogin(e.target.value)} 
                        placeholder="Enter your name"
                        required
                      />
                    </div>
                  </div>
                )}
                
                <div className="form-group">
                  <label>Mobile Number</label>
                  <div className="input-with-icon">
                    <Smartphone size={16} className="input-icon" />
                    <input 
                      type="tel" 
                      className="form-input" 
                      value={phoneLogin} 
                      onChange={(e) => setPhoneLogin(e.target.value)} 
                      placeholder="Enter mobile number"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>{isForgotPassword ? "New Password" : "Password"}</label>
                  <div className="input-with-icon">
                    <Lock size={16} className="input-icon" />
                    <input 
                      type="password" 
                      className="form-input" 
                      value={passwordLogin} 
                      onChange={(e) => setPasswordLogin(e.target.value)} 
                      placeholder={isSignUp ? "Create password" : isForgotPassword ? "Create new password" : "Enter password"}
                      required
                    />
                  </div>
                </div>

                {!isSignUp && !isForgotPassword && (
                  <div style={{ textAlign: 'right', marginTop: '-12px', marginBottom: '16px' }}>
                    <button 
                      type="button" 
                      onClick={() => {
                        setIsForgotPassword(true);
                        setLoginError("");
                      }}
                      style={{ background: 'none', border: 'none', color: 'var(--color-cyan)', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                {isForgotPassword && (
                  <div style={{ textAlign: 'right', marginTop: '-12px', marginBottom: '16px' }}>
                    <button 
                      type="button" 
                      onClick={() => {
                        setIsForgotPassword(false);
                        setLoginError("");
                      }}
                      style={{ background: 'none', border: 'none', color: 'var(--color-cyan)', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Back to login
                    </button>
                  </div>
                )}

                <button type="submit" className="btn btn-primary auth-submit-btn" style={{ width: '100%', marginTop: '10px' }} disabled={isLoggingIn}>
                  {isLoggingIn ? "Verifying & Syncing Cloud..." : isForgotPassword ? "Reset Password & Login" : isSignUp ? "Register & Access Panel" : "Login & Access Panel"}
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        /* 3. Main Dashboard Application layout */
        <div className="app-container">
          {/* Top Horizontal Navbar for PC */}
          <header className="top-nav-bar hide-on-mobile">
            <div className="top-brand-group">
              <Wrench size={22} className="text-cyan" />
              <div>
                <span style={{ display: 'block', fontFamily: 'var(--font-family-title)', fontWeight: 900, fontSize: '15px', letterSpacing: '0.05em', color: '#fff' }}>CHAND BROTHERS</span>
                <span style={{ display: 'block', fontSize: '9px', textTransform: 'uppercase', color: 'var(--color-cyan)', fontWeight: 700, letterSpacing: '0.15em', marginTop: '-2px' }}>Mobile Repair Shop</span>
              </div>
            </div>

            <nav className="top-nav-tabs">
              <button 
                className={`top-nav-tab ${currentDestination === 'REPAIR_TICKETS' && !selectedTicket ? 'active' : ''}`}
                onClick={() => { setSelectedTicket(null); setCurrentDestination('REPAIR_TICKETS'); }}
              >
                <Wrench size={14} />
                <span>Dashboard</span>
              </button>
              <button 
                className={`top-nav-tab ${currentDestination === 'PRODUCT_INVENTORY' ? 'active' : ''}`}
                onClick={() => { setSelectedTicket(null); setCurrentDestination('PRODUCT_INVENTORY'); }}
              >
                <Package size={14} />
                <span>Product Inventory</span>
                {lowStockCount > 0 && <span className="nav-badge bg-rose" style={{ marginLeft: '4px', padding: '1px 5px', fontSize: '9px' }}>{lowStockCount} Low</span>}
              </button>
              <button 
                className={`top-nav-tab ${currentDestination === 'CUSTOMERS' ? 'active' : ''}`}
                onClick={() => { setSelectedTicket(null); setCurrentDestination('CUSTOMERS'); }}
              >
                <Users size={14} />
                <span>Customer Directory</span>
              </button>

              <button 
                className={`top-nav-tab ${currentDestination === 'REPORTS' ? 'active' : ''}`}
                onClick={() => { setSelectedTicket(null); setCurrentDestination('REPORTS'); }}
              >
                <BarChart3 size={14} />
                <span>Reports & Analytics</span>
              </button>
              <button 
                className={`top-nav-tab ${currentDestination === 'GOOGLE_CLOUD_SYNC' ? 'active' : ''}`}
                onClick={() => { setSelectedTicket(null); setCurrentDestination('GOOGLE_CLOUD_SYNC'); }}
              >
                <Database size={14} />
                <span>Cloud Sync</span>
              </button>
            </nav>

            <div className="top-nav-actions">
              <button className="dock-item" style={{ width: '38px', height: '38px', borderRadius: '50%', border: '1px solid var(--color-border-glow)' }} title="Notifications">
                <Bell size={18} />
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderLeft: '1px solid var(--color-border)', paddingLeft: '16px' }}>
                <div className="user-initial" style={{ width: '32px', height: '32px', fontSize: '13px' }}>
                  {authUser.name ? authUser.name.charAt(0).toUpperCase() : "T"}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>{authUser.name || "Technician"}</span>
                  <span style={{ fontSize: '9px', color: 'var(--color-text-secondary)' }}>Operator</span>
                </div>
                <button className="logout-btn" onClick={handleLogout} title="Log Out" style={{ marginLeft: '8px' }}>
                  <LogOut size={15} />
                </button>
              </div>
            </div>
          </header>

          {/* Left Sidebar Collapsed Dock for PC */}
          <aside className="left-sidebar-dock hide-on-mobile">
            <button 
              className={`dock-item ${selectedFilter === 'ALL' ? 'active' : ''}`} 
              onClick={() => { setSelectedTicket(null); setCurrentDestination('REPAIR_TICKETS'); setSelectedFilter('ALL'); }}
              title="All Tickets"
            >
              <Wrench size={20} />
            </button>
            <button 
              className={`dock-item ${selectedFilter === 'RECEIVED' ? 'active' : ''}`} 
              onClick={() => { setSelectedTicket(null); setCurrentDestination('REPAIR_TICKETS'); setSelectedFilter('RECEIVED'); }}
              title="Received Tickets"
            >
              <FileText size={20} />
              {tickets.filter(t => t.status === 'RECEIVED').length > 0 && <span className="badge-dot"></span>}
            </button>
            <button 
              className={`dock-item ${selectedFilter === 'IN_REPAIR' ? 'active' : ''}`} 
              onClick={() => { setSelectedTicket(null); setCurrentDestination('REPAIR_TICKETS'); setSelectedFilter('IN_REPAIR'); }}
              title="In Repair"
            >
              <Cpu size={20} />
              {tickets.filter(t => t.status === 'IN_REPAIR').length > 0 && <span className="badge-dot" style={{ backgroundColor: 'var(--color-amber)' }}></span>}
            </button>
            <button 
              className={`dock-item ${selectedFilter === 'READY_FOR_PICKUP' ? 'active' : ''}`} 
              onClick={() => { setSelectedTicket(null); setCurrentDestination('REPAIR_TICKETS'); setSelectedFilter('READY_FOR_PICKUP'); }}
              title="Ready for Pickup"
            >
              <CheckCircle2 size={20} />
              {tickets.filter(t => t.status === 'READY_FOR_PICKUP').length > 0 && <span className="badge-dot" style={{ backgroundColor: 'var(--color-emerald)' }}></span>}
            </button>
            <button 
              className={`dock-item ${selectedFilter === 'DELIVERED' ? 'active' : ''}`} 
              onClick={() => { setSelectedTicket(null); setCurrentDestination('REPAIR_TICKETS'); setSelectedFilter('DELIVERED'); }}
              title="Delivered & Paid"
            >
              <ShieldCheck size={20} />
            </button>
          </aside>

          {/* Side Drawer Sidebar Navigation (Mobile drawer backup) */}
          <aside className={`sidebar-navigation ${isSidebarOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
              <div className="brand-badge">
                <Wrench size={20} className="text-cyan" />
                <div>
                  <span className="brand-name">CHAND BROTHERS</span>
                  <span className="brand-sub">Mobile Repair Shop</span>
                </div>
              </div>
              <button className="close-sidebar-btn" onClick={() => setIsSidebarOpen(false)} aria-label="Close Menu">
                <X size={20} />
              </button>
            </div>

            <nav className="sidebar-nav-menu">
              <button 
                className={`nav-item ${currentDestination === 'REPAIR_TICKETS' && !selectedTicket ? 'active' : ''}`}
                onClick={() => {
                  setSelectedTicket(null);
                  setCurrentDestination('REPAIR_TICKETS');
                  setIsSidebarOpen(false);
                }}
              >
                <Wrench size={18} />
                <span>Repair Tickets</span>
                <span className="nav-badge bg-cyan">{tickets.filter(t => t.status !== 'DELIVERED' && t.status !== 'CANCELLED').length}</span>
              </button>

              <button 
                className={`nav-item ${currentDestination === 'PRODUCT_INVENTORY' ? 'active' : ''}`}
                onClick={() => {
                  setSelectedTicket(null);
                  setCurrentDestination('PRODUCT_INVENTORY');
                  setIsSidebarOpen(false);
                }}
              >
                <Package size={18} />
                <span>Product Inventory</span>
                {lowStockCount > 0 && <span className="nav-badge bg-rose animate-pulse">{lowStockCount} Low</span>}
              </button>

              <button 
                className={`nav-item ${currentDestination === 'CUSTOMERS' ? 'active' : ''}`}
                onClick={() => {
                  setSelectedTicket(null);
                  setCurrentDestination('CUSTOMERS');
                  setIsSidebarOpen(false);
                }}
              >
                <Users size={18} />
                <span>Customer Directory</span>
              </button>



              <button 
                className={`nav-item ${currentDestination === 'REPORTS' ? 'active' : ''}`}
                onClick={() => {
                  setSelectedTicket(null);
                  setCurrentDestination('REPORTS');
                  setIsSidebarOpen(false);
                }}
              >
                <BarChart3 size={18} />
                <span>Reports & Analytics</span>
              </button>

              <button 
                className={`nav-item ${currentDestination === 'GOOGLE_CLOUD_SYNC' ? 'active' : ''}`}
                onClick={() => {
                  setSelectedTicket(null);
                  setCurrentDestination('GOOGLE_CLOUD_SYNC');
                  setIsSidebarOpen(false);
                }}
              >
                <Database size={18} />
                <span>Cloud Sync & Export</span>
              </button>
            </nav>

            <div className="sidebar-footer">
              <div className="user-profile-widget">
                <div className="avatar">
                  {authUser.name ? authUser.name.charAt(0).toUpperCase() : "T"}
                </div>
                <div className="profile-details">
                  <span className="username">{authUser.name || "Technician"}</span>
                  <span className="useremail">{authUser.email || authUser.phone || "Offline Tech"}</span>
                </div>
              </div>
              <button className="logout-btn" onClick={handleLogout} title="Log Out">
                <LogOut size={18} />
              </button>
            </div>
          </aside>

          {/* Main Content Layout area */}
          <main className="main-content main-content-adnan">
            {selectedTicket ? (
              <TicketDetailScreen
                ticket={selectedTicket}
                onBack={() => setSelectedTicket(null)}
                onStatusChanged={(status, notes) => handleStatusChanged(selectedTicket.id, status, notes)}
                onEditTicket={(ticket) => {
                  setEditingTicket(ticket);
                  setShowAddEditDialog(true);
                }}
                onShowReceipt={(ticket) => setReceiptTicket(ticket)}
                onDeleteTicket={(id) => deleteTicket(id)}
                onSendSmsAlert={(ticket) => handlePrepareSms(ticket, ticket.status)}
                onNewTicketForCustomer={handleNewTicketForCustomer}
              />
            ) : (
              (() => {
                switch(currentDestination) {
                  case "REPAIR_TICKETS":
                    return (
                      <DashboardScreen
                        tickets={tickets}
                        products={products}
                        searchQuery={searchQuery}
                        onSearchQueryChanged={setSearchQuery}
                        selectedFilter={selectedFilter}
                        onFilterSelected={setSelectedFilter}
                        onTicketClick={setSelectedTicket}
                        onSendSmsClick={(ticket) => handlePrepareSms(ticket, ticket.status)}
                        onNewTicketClick={() => {
                          setEditingTicket(null);
                          setShowAddEditDialog(true);
                        }}
                        onOpenSmsTemplatesClick={() => setShowSmsTemplateDialog(true)}
                        onOpenCloudSyncClick={() => setCurrentDestination('GOOGLE_CLOUD_SYNC')}
                        onOpenDrawer={() => setIsSidebarOpen(true)}
                        lowStockCount={lowStockCount}
                        userName={authUser.name}
                        syncError={syncError}
                        syncBucketId={syncBucketId}
                      />
                    );
                  case "PRODUCT_INVENTORY":
                    return (
                      <ProductInventoryScreen
                        products={products}
                        searchQuery={productSearchQuery}
                        onSearchQueryChanged={setProductSearchQuery}
                        selectedCategory={selectedProductCategory}
                        onCategorySelected={setSelectedProductCategory}
                        onOpenDrawer={() => setIsSidebarOpen(true)}
                        onNewProductClick={() => {
                          setEditingProduct(null);
                          setShowAddEditProductDialog(true);
                        }}
                        onEditProductClick={(prod) => {
                          setEditingProduct(prod);
                          setShowAddEditProductDialog(true);
                        }}
                        onDeleteProductClick={(id) => deleteProduct(id)}
                        onAdjustQuantity={handleAdjustQuantity}
                      />
                    );
                  case "CUSTOMERS":
                    return (
                      <CustomerDirectoryScreen
                        tickets={tickets}
                        onSelectTicket={setSelectedTicket}
                        onNewTicketForCustomer={handleNewTicketForCustomer}
                        onOpenDrawer={() => setIsSidebarOpen(true)}
                      />
                    );

                  case "REPORTS":
                    return (
                      <ReportsScreen
                        tickets={tickets}
                        products={products}
                        onOpenDrawer={() => setIsSidebarOpen(true)}
                      />
                    );
                  case "GOOGLE_CLOUD_SYNC":
                    return (
                      <GoogleCloudSyncScreen
                        authUser={authUser}
                        onOpenDrawer={() => setIsSidebarOpen(true)}
                        onRefreshDb={refreshDbState}
                      />
                    );
                  default:
                    return <div>Destination Page Not Found</div>;
                }
              })()
            )}
          </main>

          {/* mobile screen top action bar */}
          <div className="mobile-header-nav hide-on-desktop">
            <button className="menu-toggle-btn" onClick={() => setIsSidebarOpen(true)} aria-label="Open Menu">
              <Menu size={24} />
            </button>
            <span className="mobile-logo-title">CHAND BROTHERS</span>
            <div className="user-initial">
              {authUser.name ? authUser.name.charAt(0).toUpperCase() : "T"}
            </div>
          </div>
        </div>
      )}

      {/* 4. Global Dialog Modal Overlays */}
      {showAddEditDialog && (
        <AddEditTicketDialog
          ticket={editingTicket}
          initialCustomerName={prefillCustomerName}
          initialCustomerPhone={prefillCustomerPhone}
          onSave={handleSaveTicket}
          onDismiss={() => {
            setShowAddEditDialog(false);
            setEditingTicket(null);
            setPrefillCustomerName("");
            setPrefillCustomerPhone("");
          }}
        />
      )}

      {showAddEditProductDialog && (
        <AddEditProductDialog
          product={editingProduct}
          onSave={handleSaveProduct}
          onDismiss={() => {
            setShowAddEditProductDialog(false);
            setEditingProduct(null);
          }}
        />
      )}

      {pendingSmsAlert && (
        <SmsAlertDialog
          ticket={pendingSmsAlert.ticket}
          initialMessage={pendingSmsAlert.formattedMessage}
          onDismiss={() => setPendingSmsAlert(null)}
        />
      )}

      {showSmsTemplateDialog && (
        <SmsTemplateManagerDialog
          templates={smsTemplates}
          onSaveTemplate={saveSmsTemplate}
          onDismiss={() => setShowSmsTemplateDialog(false)}
        />
      )}

      {receiptTicket && (
        <ReceiptDialog
          ticket={receiptTicket}
          onDismiss={() => setReceiptTicket(null)}
        />
      )}




    </>
  );
}
