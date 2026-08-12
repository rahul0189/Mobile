import React, { useState, useEffect } from 'react';
import { 
  Wrench, Package, Users, BarChart3, Database, 
  LogOut, ShieldAlert, X, Shield, Lock, Smartphone, User, Menu
} from 'lucide-react';

// Import local state logic
import { 
  getTickets, saveTickets, getProducts, getSmsTemplates, getAuthUser, setAuthUser,
  createOrUpdateTicket, createOrUpdateProduct, adjustProductQuantity,
  deleteProduct, deleteTicket, saveSmsTemplate, generateSmsMessage,
  getSimSales, saveSimSales, createOrUpdateSimSale, deleteSimSale
} from './state';

// Import Screens
import DashboardScreen from './screens/DashboardScreen';
import TicketDetailScreen from './screens/TicketDetailScreen';
import ProductInventoryScreen from './screens/ProductInventoryScreen';
import CustomerDirectoryScreen from './screens/CustomerDirectoryScreen';
import ReportsScreen from './screens/ReportsScreen';
import GoogleCloudSyncScreen from './screens/GoogleCloudSyncScreen';
import SimSalesScreen from './screens/SimSalesScreen';

// Import Dialog Overlays
import AddEditTicketDialog from './components/AddEditTicketDialog';
import AddEditProductDialog from './components/AddEditProductDialog';
import SmsAlertDialog from './components/SmsAlertDialog';
import SmsTemplateManagerDialog from './components/SmsTemplateManagerDialog';
import ReceiptDialog from './components/ReceiptDialog';
import AddEditSimSaleDialog from './components/AddEditSimSaleDialog';

export default function App() {
  // Splash & Auth State
  const [showShutter, setShowShutter] = useState(true);
  const [shutterOpening, setShutterOpening] = useState(false);
  const [authUser, setAuthUserLocal] = useState(getAuthUser());
  const [phoneLogin, setPhoneLogin] = useState("");
  const [techNameLogin, setTechNameLogin] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState("");
  const [pendingUserObj, setPendingUserObj] = useState(null);

  // Navigation State
  const [currentDestination, setCurrentDestination] = useState("REPAIR_TICKETS");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Database State (synchronized from state.js)
  const [tickets, setTickets] = useState([]);
  const [products, setProducts] = useState([]);
  const [smsTemplates, setSmsTemplates] = useState({});
  const [simSales, setSimSales] = useState([]);

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
  const [showAddEditSimSaleDialog, setShowAddEditSimSaleDialog] = useState(false);
  const [editingSimSale, setEditingSimSale] = useState(null);

  // Prefills
  const [prefillCustomerName, setPrefillCustomerName] = useState("");
  const [prefillCustomerPhone, setPrefillCustomerPhone] = useState("");

  // Sync state variables
  const [googleAccount, setGoogleAccount] = useState({ isLoggedIn: false, name: "", email: "" });
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState("");

  // Trigger loading database on start
  useEffect(() => {
    // Load local storage initial values
    setTickets(getTickets());
    setProducts(getProducts());
    setSmsTemplates(getSmsTemplates());
    setSimSales(getSimSales());

    // Listen for database updates
    const handleDbUpdate = () => {
      setTickets(getTickets());
      setProducts(getProducts());
      setSmsTemplates(getSmsTemplates());
      setSimSales(getSimSales());
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

  // Sync state to local variables on manual changes
  const refreshDbState = () => {
    setTickets(getTickets());
    setProducts(getProducts());
    setSmsTemplates(getSmsTemplates());
    setSimSales(getSimSales());
  };

  // Registered Technicians DB helper
  const getRegisteredTechnicians = () => {
    let techs = localStorage.getItem('chand_registered_technicians');
    if (!techs) {
      // Prepopulate with 'Rahul' account from his screenshots
      const initialTechs = [{ name: "Rahul", phone: "7986911294" }];
      localStorage.setItem('chand_registered_technicians', JSON.stringify(initialTechs));
      return initialTechs;
    }
    return JSON.parse(techs);
  };

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setLoginError("");
    const phone = phoneLogin.trim();
    const name = techNameLogin.trim();

    if (!phone) {
      setLoginError("Please enter your mobile number.");
      return;
    }

    const techs = getRegisteredTechnicians();
    let targetUser = null;

    if (isSignUp) {
      if (!name) {
        setLoginError("Please enter your name.");
        return;
      }
      const exists = techs.find(t => t.phone === phone);
      if (exists) {
        setLoginError("This mobile number is already registered. Switch to Sign In!");
        return;
      }

      targetUser = { name, phone, provider: "phone" };
    } else {
      const exists = techs.find(t => t.phone === phone);
      if (!exists) {
        setLoginError("Account not found. Please register by selecting Sign Up!");
        return;
      }

      targetUser = exists;
    }

    // Trigger OTP modal instead of signing in immediately
    setPendingUserObj(targetUser);
    setShowOtpVerification(true);
    setOtpInput("");
    setOtpError("");
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setOtpError("");

    if (otpInput === "1234") {
      // If signing up, save new account to database
      if (isSignUp && pendingUserObj) {
        const techs = getRegisteredTechnicians();
        techs.push(pendingUserObj);
        localStorage.setItem('chand_registered_technicians', JSON.stringify(techs));
      }

      // Log in
      setAuthUser(pendingUserObj);
      setAuthUserLocal(pendingUserObj);

      // Clean up states
      setShowOtpVerification(false);
      setPendingUserObj(null);
      setOtpInput("");
    } else {
      setOtpError("Invalid verification code! Try entering '1234'.");
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
      refreshDbState();
      const simMsg = data.simSales ? `, ${data.simSales.length} SIM records` : "";
      callback(true, `Database restored successfully. Loaded ${data.tickets.length} tickets, ${data.products.length} products${simMsg}.`);
    } catch(e) {
      callback(false, e.message);
    }
  };

  // SIM Sales Operations handlers
  const handleSaveSimSale = (saleData) => {
    createOrUpdateSimSale(saleData);
    setShowAddEditSimSaleDialog(false);
    setEditingSimSale(null);
    refreshDbState();
  };

  const handleDeleteSimSale = (id) => {
    if (confirm("Are you sure you want to delete this SIM sale record?")) {
      deleteSimSale(id);
      refreshDbState();
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
    refreshDbState();
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
    refreshDbState();
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
    refreshDbState();
  };

  const handleAdjustQuantity = (productId, delta) => {
    adjustProductQuantity(productId, delta);
    refreshDbState();
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
              <p>Mobile Tech Dashboard Access</p>
            </div>

            <div className="auth-tab-buttons">
              <button 
                type="button"
                className={`auth-tab-btn ${!isSignUp ? 'active' : ''}`}
                onClick={() => {
                  setIsSignUp(false);
                  setLoginError("");
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
                }}
              >
                Sign Up
              </button>
            </div>

            <div className="login-tabs">
              {loginError && (
                <div className="auth-error-alert">
                  <ShieldAlert size={16} />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="phone-login-form">
                {isSignUp && (
                  <div className="form-group">
                    <label>Technician Name</label>
                    <div className="input-with-icon">
                      <User size={16} className="input-icon" />
                      <input 
                        type="text" 
                        className="form-input" 
                        value={techNameLogin} 
                        onChange={(e) => setTechNameLogin(e.target.value)} 
                        placeholder="e.g. Rahul Chand"
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
                      placeholder="e.g. 7986911294"
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary auth-submit-btn" style={{ width: '100%', marginTop: '10px' }}>
                  {isSignUp ? "Register & Access Panel" : "Login & Access Panel"}
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        /* 3. Main Dashboard Application layout */
        <div className="app-container">
          {/* Side Drawer Sidebar Navigation */}
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
                className={`nav-item ${currentDestination === 'SIM_ACTIVATIONS' ? 'active' : ''}`}
                onClick={() => {
                  setSelectedTicket(null);
                  setCurrentDestination('SIM_ACTIVATIONS');
                  setIsSidebarOpen(false);
                }}
              >
                <Smartphone size={18} />
                <span>SIM Activations</span>
                {simSales.length > 0 && <span className="nav-badge bg-cyan">{simSales.length}</span>}
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
          <main className="main-content">
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
                  case "SIM_ACTIVATIONS":
                    return (
                      <SimSalesScreen
                        sales={simSales}
                        onOpenDrawer={() => setIsSidebarOpen(true)}
                        onNewSaleClick={() => {
                          setEditingSimSale(null);
                          setShowAddEditSimSaleDialog(true);
                        }}
                        onEditSaleClick={(sale) => {
                          setEditingSimSale(sale);
                          setShowAddEditSimSaleDialog(true);
                        }}
                        onDeleteSaleClick={handleDeleteSimSale}
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
                        accountInfo={googleAccount}
                        isSyncing={isSyncing}
                        syncStatusMessage={syncStatusMsg}
                        onSignIn={handleGoogleSignIn}
                        onSignOut={handleGoogleSignOut}
                        onToggleAutoSync={() => {}}
                        onPerformBackup={handleBackupNow}
                        onPerformRestore={handleRestoreSync}
                        onRestoreCustomJson={handleCustomJsonRestore}
                        onOpenDrawer={() => setIsSidebarOpen(true)}
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

      {showAddEditSimSaleDialog && (
        <AddEditSimSaleDialog
          sale={editingSimSale}
          onSave={handleSaveSimSale}
          onDismiss={() => {
            setShowAddEditSimSaleDialog(false);
            setEditingSimSale(null);
          }}
        />
      )}

      {/* OTP Verification Modal Overlay */}
      {showOtpVerification && (
        <div className="login-screen-overlay otp-overlay" style={{ zIndex: 1600 }}>
          <div className="login-card card otp-card">
            <div className="login-header">
              <div className="shop-logo">
                <Smartphone size={32} />
              </div>
              <h1>OTP VERIFICATION</h1>
              <p>Enter the 4-digit code sent to +91 {obfuscatePhone(phoneLogin)}</p>
            </div>

            {otpError && (
              <div className="auth-error-alert">
                <ShieldAlert size={16} />
                <span>{otpError}</span>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="phone-login-form">
              <div className="form-group">
                <label style={{ textAlign: 'center', display: 'block', fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                  Please enter <strong>1234</strong> to unlock the tech console
                </label>
                <input 
                  type="text" 
                  maxLength={4}
                  className="form-input otp-digit-input" 
                  value={otpInput} 
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))} 
                  placeholder="• • • •"
                  style={{ textAlign: 'center', fontSize: '24px', letterSpacing: '8px', height: '54px' }}
                  required
                  autoFocus
                />
              </div>

              <div className="form-row split-2" style={{ marginTop: '10px' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setShowOtpVerification(false);
                    setPendingUserObj(null);
                    setOtpInput("");
                    setOtpError("");
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Verify Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
