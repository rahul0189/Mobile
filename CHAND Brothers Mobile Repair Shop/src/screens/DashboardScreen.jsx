import React, { useState } from 'react';
import { 
  Plus, Search, Wrench, AlertTriangle, 
  IndianRupee, ChevronRight, MessageSquare, Menu,
  Database, Users, BarChart3, Smartphone, Cpu,
  CheckCircle2, FileText, ShieldCheck, QrCode, Sparkles
} from 'lucide-react';
import { REPAIR_STATUSES } from '../state';

export default function DashboardScreen({
  tickets,
  products = [],
  searchQuery,
  onSearchQueryChanged,
  selectedFilter,
  onFilterSelected,
  onTicketClick,
  onSendSmsClick,
  onNewTicketClick,
  onOpenSmsTemplatesClick,
  onOpenCloudSyncClick,
  onOpenDrawer,
  lowStockCount,
  userName,
  syncError,
  syncBucketId
}) {
  const [lookupId, setLookupId] = useState("");
  const [lookupError, setLookupError] = useState("");

  // Statistics calculations
  const activeTickets = tickets.filter(t => t.status !== 'DELIVERED' && t.status !== 'CANCELLED');
  const activeTicketsCount = activeTickets.length;
  
  const totalActiveBalance = activeTickets.reduce((sum, t) => {
    const cost = t.estimatedCost > 0 ? t.estimatedCost : (t.partsCost + t.laborCost);
    const balance = cost - t.advancePaid;
    return sum + (balance > 0 ? balance : 0);
  }, 0);

  // Delivered (Completed Today approximation)
  const completedCount = tickets.filter(t => t.status === 'DELIVERED').length;

  // Total Revenue Collected
  const totalRevenue = tickets.reduce((sum, t) => {
    // Add advance payments plus full payments for delivered tickets
    const fullCost = t.estimatedCost > 0 ? t.estimatedCost : (t.partsCost + t.laborCost);
    const collected = t.status === 'DELIVERED' ? fullCost : t.advancePaid;
    return sum + (collected || 0);
  }, 0);

  // Quick lookup handler
  const handleLookupSubmit = (e) => {
    e.preventDefault();
    setLookupError("");
    const cleanId = lookupId.trim().toUpperCase();
    if (!cleanId) return;

    // Search by Ticket ID (e.g. REP-1001 or 1001)
    const found = tickets.find(t => 
      t.ticketNumber.toUpperCase() === cleanId || 
      t.ticketNumber.toUpperCase().endsWith(cleanId) ||
      t.id.toString() === cleanId
    );

    if (found) {
      onTicketClick(found);
      setLookupId("");
    } else {
      setLookupError(`Ticket "${cleanId}" not found.`);
      setTimeout(() => setLookupError(""), 3000);
    }
  };

  // Apply search filtering
  const getFilteredList = (list) => {
    return list.filter(ticket => {
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchNumber = ticket.ticketNumber.toLowerCase().includes(q);
        const matchName = ticket.customerName.toLowerCase().includes(q);
        const matchPhone = ticket.customerPhone.includes(q);
        const matchBrand = ticket.mobileBrand.toLowerCase().includes(q);
        const matchModel = ticket.mobileModel.toLowerCase().includes(q);
        const matchIssue = ticket.issueCategory.toLowerCase().includes(q);
        return matchNumber || matchName || matchPhone || matchBrand || matchModel || matchIssue;
      }
      return true;
    });
  };

  // Kanban Columns Data
  const pendingTickets = getFilteredList(tickets.filter(t => t.status === 'RECEIVED' || t.status === 'DIAGNOSING'));
  const inProgressTickets = getFilteredList(tickets.filter(t => t.status === 'IN_REPAIR' || t.status === 'WAITING_FOR_PARTS'));
  const readyTickets = getFilteredList(tickets.filter(t => t.status === 'READY_FOR_PICKUP'));

  // Format Date
  const formatDate = (ms) => {
    if (!ms) return "N/A";
    const d = new Date(ms);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  };

  // Calculate Donut Chart parameters
  const totalJobsCount = tickets.length;
  const paidJobsCount = tickets.filter(t => t.status === 'DELIVERED').length;
  const unpaidJobsCount = totalJobsCount - paidJobsCount;
  const paidPercent = totalJobsCount > 0 ? Math.round((paidJobsCount / totalJobsCount) * 100) : 0;
  // Circumference of 30px radius circle = 188.4
  const strokeOffset = 188.4 - (188.4 * paidPercent) / 100;

  return (
    <div className="dashboard-container">
      {/* Header Bar */}
      <header className="screen-header">
        <div className="header-left">
          <button className="menu-toggle-btn" onClick={onOpenDrawer} aria-label="Open Menu">
            <Menu size={24} />
          </button>
          <div>
            <h1>Repair Workspace</h1>
            <p className="welcome-msg" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <span>Logged in as: <span className="tech-name">{userName || "Rahul"}</span></span>
              {syncBucketId ? (
                <span className="sync-status-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', padding: '1px 6px', borderRadius: '10px', backgroundColor: syncError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: syncError ? 'var(--color-rose)' : 'var(--color-emerald)', border: `1px solid ${syncError ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}` }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: syncError ? 'var(--color-rose)' : 'var(--color-emerald)', display: 'inline-block' }}></span>
                  {syncError ? `Sync Error` : `Cloud Synced`}
                </span>
              ) : (
                <span className="sync-status-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', padding: '1px 6px', borderRadius: '10px', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#f59e0b', display: 'inline-block' }}></span>
                  Sync Off
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={onOpenCloudSyncClick}>
            <Database size={16} /> Sync
          </button>
          <button className="btn btn-secondary" onClick={onOpenSmsTemplatesClick}>
            <MessageSquare size={16} /> Alerts Setup
          </button>
          <button className="btn btn-primary" onClick={onNewTicketClick}>
            <Plus size={16} /> New Job
          </button>
        </div>
      </header>

      {/* Main Grid: 70% Left, 30% Right */}
      <div className="dashboard-adnan-grid">
        
        {/* Left Column (Main Dashboard Content) */}
        <div className="left-panel-workspace">
          
          {/* Sparkline Statistics Grid */}
          <div className="metrics-grid" style={{ marginBottom: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <div className="metric-card bg-glass border-indigo-glow" style={{ padding: '16px' }}>
              <div className="metric-info" style={{ flex: 1 }}>
                <span className="metric-label" style={{ fontSize: '11px' }}>Devices Tracked</span>
                <span className="metric-val" style={{ fontSize: '20px' }}>{totalJobsCount}</span>
                <span className="metric-subtext text-indigo" style={{ fontSize: '10px' }}>+3% this week</span>
              </div>
              <svg width="60" height="24" viewBox="0 0 60 24" style={{ alignSelf: 'flex-end', marginLeft: '8px' }}>
                <path d="M0,20 Q15,4 30,18 T60,8" fill="none" stroke="var(--color-indigo)" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>

            <div className="metric-card bg-glass" style={{ borderLeft: '4px solid #f59e0b', padding: '16px' }}>
              <div className="metric-info" style={{ flex: 1 }}>
                <span className="metric-label" style={{ fontSize: '11px' }}>Pending Repairs</span>
                <span className="metric-val" style={{ fontSize: '20px', color: '#f59e0b' }}>{activeTicketsCount}</span>
                <span className="metric-subtext" style={{ fontSize: '10px', color: '#f59e0b' }}>Active in workshop</span>
              </div>
              <svg width="60" height="24" viewBox="0 0 60 24" style={{ alignSelf: 'flex-end', marginLeft: '8px' }}>
                <path d="M0,10 L15,22 L30,6 L45,18 L60,4" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>

            <div className="metric-card bg-glass" style={{ borderLeft: '4px solid #10b981', padding: '16px' }}>
              <div className="metric-info" style={{ flex: 1 }}>
                <span className="metric-label" style={{ fontSize: '11px' }}>Completed Jobs</span>
                <span className="metric-val" style={{ fontSize: '20px', color: '#10b981' }}>{completedCount}</span>
                <span className="metric-subtext" style={{ fontSize: '10px', color: '#10b981' }}>Delivered & paid</span>
              </div>
              <svg width="60" height="24" viewBox="0 0 60 24" style={{ alignSelf: 'flex-end', marginLeft: '8px' }}>
                <path d="M0,22 Q10,12 25,6 T60,2" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>

            <div className="metric-card bg-glass border-cyan-glow" style={{ padding: '16px' }}>
              <div className="metric-info" style={{ flex: 1 }}>
                <span className="metric-label" style={{ fontSize: '11px' }}>Revenue (Total)</span>
                <span className="metric-val" style={{ fontSize: '20px', color: 'var(--color-cyan)' }}>₹{totalRevenue.toLocaleString('en-IN')}</span>
                <span className="metric-subtext text-cyan" style={{ fontSize: '10px' }}>Collected fees</span>
              </div>
              <svg width="60" height="24" viewBox="0 0 60 24" style={{ alignSelf: 'flex-end', marginLeft: '8px' }}>
                <path d="M0,20 Q15,4 30,12 T60,2" fill="none" stroke="var(--color-cyan)" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* Search bar inside board */}
          <div className="filter-section card" style={{ marginBottom: '20px', padding: '12px 16px' }}>
            <div className="search-bar-wrapper">
              <Search className="search-icon" size={18} />
              <input 
                type="text" 
                placeholder="Search board by model, brand, customer or ticket number..." 
                value={searchQuery}
                onChange={(e) => onSearchQueryChanged(e.target.value)}
                className="form-input search-input"
                style={{ height: '40px', fontSize: '14px' }}
              />
            </div>
          </div>

          {/* Kanban / List Router depending on selected filter */}
          {selectedFilter === 'ALL' ? (
            /* 3-Column Kanban Board */
            <div className="kanban-board">
              
              {/* Column 1: PENDING */}
              <div className="kanban-column">
                <div className="kanban-column-header">
                  <span className="kanban-column-title" style={{ color: 'var(--color-cyan)' }}>
                    <Smartphone size={16} /> PENDING
                  </span>
                  <span className="kanban-column-count">{pendingTickets.length}</span>
                </div>
                <div className="kanban-cards-container">
                  {pendingTickets.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '24px 8px', color: 'var(--color-text-muted)', fontSize: '12px' }}>No pending tasks</div>
                  ) : (
                    pendingTickets.map(t => (
                      <div key={t.id} className="kanban-card" onClick={() => onTicketClick(t)}>
                        <div className="kanban-card-header">
                          <span className="kanban-card-title">{t.mobileBrand} {t.mobileModel}</span>
                          <span className="kanban-card-id">{t.ticketNumber}</span>
                        </div>
                        <div className="kanban-card-body">
                          <div><strong>Client:</strong> {t.customerName}</div>
                          <div style={{ marginTop: '2px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            <strong>Issue:</strong> {t.issueCategory} ({t.issueDescription})
                          </div>
                        </div>
                        <div className="kanban-card-footer">
                          <span className="status-badge" style={{ backgroundColor: `${REPAIR_STATUSES[t.status]?.badgeColor}15`, color: REPAIR_STATUSES[t.status]?.badgeColor, fontSize: '10px', padding: '1px 6px', border: `1px solid ${REPAIR_STATUSES[t.status]?.badgeColor}30`, borderRadius: '4px' }}>
                            {REPAIR_STATUSES[t.status]?.displayName}
                          </span>
                          <span className="kanban-card-time">{formatDate(t.dateCreatedMillis)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Column 2: IN PROGRESS */}
              <div className="kanban-column">
                <div className="kanban-column-header">
                  <span className="kanban-column-title" style={{ color: '#f59e0b' }}>
                    <Cpu size={16} /> IN PROGRESS
                  </span>
                  <span className="kanban-column-count">{inProgressTickets.length}</span>
                </div>
                <div className="kanban-cards-container">
                  {inProgressTickets.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '24px 8px', color: 'var(--color-text-muted)', fontSize: '12px' }}>No active repairs</div>
                  ) : (
                    inProgressTickets.map(t => (
                      <div key={t.id} className="kanban-card" onClick={() => onTicketClick(t)}>
                        <div className="kanban-card-header">
                          <span className="kanban-card-title">{t.mobileBrand} {t.mobileModel}</span>
                          <span className="kanban-card-id">{t.ticketNumber}</span>
                        </div>
                        <div className="kanban-card-body">
                          <div><strong>Client:</strong> {t.customerName}</div>
                          <div style={{ marginTop: '2px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            <strong>Issue:</strong> {t.issueCategory} ({t.issueDescription})
                          </div>
                        </div>
                        <div className="kanban-card-footer">
                          <span className="status-badge" style={{ backgroundColor: `${REPAIR_STATUSES[t.status]?.badgeColor}15`, color: REPAIR_STATUSES[t.status]?.badgeColor, fontSize: '10px', padding: '1px 6px', border: `1px solid ${REPAIR_STATUSES[t.status]?.badgeColor}30`, borderRadius: '4px' }}>
                            {REPAIR_STATUSES[t.status]?.displayName}
                          </span>
                          <span className="kanban-card-time">{formatDate(t.dateCreatedMillis)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Column 3: READY */}
              <div className="kanban-column">
                <div className="kanban-column-header">
                  <span className="kanban-column-title" style={{ color: '#10b981' }}>
                    <CheckCircle2 size={16} /> READY
                  </span>
                  <span className="kanban-column-count">{readyTickets.length}</span>
                </div>
                <div className="kanban-cards-container">
                  {readyTickets.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '24px 8px', color: 'var(--color-text-muted)', fontSize: '12px' }}>No ready devices</div>
                  ) : (
                    readyTickets.map(t => (
                      <div key={t.id} className="kanban-card" onClick={() => onTicketClick(t)}>
                        <div className="kanban-card-header">
                          <span className="kanban-card-title">{t.mobileBrand} {t.mobileModel}</span>
                          <span className="kanban-card-id">{t.ticketNumber}</span>
                        </div>
                        <div className="kanban-card-body">
                          <div><strong>Client:</strong> {t.customerName}</div>
                          <div style={{ marginTop: '2px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            <strong>Issue:</strong> {t.issueCategory} ({t.issueDescription})
                          </div>
                        </div>
                        <div className="kanban-card-footer">
                          <span className="status-badge" style={{ backgroundColor: `${REPAIR_STATUSES[t.status]?.badgeColor}15`, color: REPAIR_STATUSES[t.status]?.badgeColor, fontSize: '10px', padding: '1px 6px', border: `1px solid ${REPAIR_STATUSES[t.status]?.badgeColor}30`, borderRadius: '4px' }}>
                            {REPAIR_STATUSES[t.status]?.displayName}
                          </span>
                          <span className="kanban-card-time">{formatDate(t.dateCreatedMillis)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          ) : (
            /* Single Wide Status List for Dock filtering */
            <div className="tickets-section card" style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 className="section-title" style={{ fontSize: '15px', color: REPAIR_STATUSES[selectedFilter]?.badgeColor || '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="status-dot" style={{ backgroundColor: REPAIR_STATUSES[selectedFilter]?.badgeColor }}></span>
                  {REPAIR_STATUSES[selectedFilter]?.displayName} List
                </h3>
                <button className="btn btn-secondary btn-icon-sm" onClick={() => onFilterSelected('ALL')} style={{ padding: '4px 10px', fontSize: '11px' }}>
                  Clear Filter
                </button>
              </div>

              {getFilteredList(tickets.filter(t => t.status === selectedFilter)).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--color-text-muted)' }}>
                  No tickets found matching status filter
                </div>
              ) : (
                <div className="table-responsive-wrapper">
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--color-border)', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                        <th style={{ padding: '12px' }}>Ticket</th>
                        <th style={{ padding: '12px' }}>Client</th>
                        <th style={{ padding: '12px' }}>Device</th>
                        <th style={{ padding: '12px' }}>Date</th>
                        <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getFilteredList(tickets.filter(t => t.status === selectedFilter)).map(t => (
                        <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', cursor: 'pointer' }} onClick={() => onTicketClick(t)} className="table-row-hover">
                          <td style={{ padding: '12px', fontFamily: 'monospace', fontWeight: 700, color: 'var(--color-cyan)' }}>{t.ticketNumber}</td>
                          <td style={{ padding: '12px', fontWeight: 600 }}>{t.customerName}</td>
                          <td style={{ padding: '12px' }}>{t.mobileBrand} {t.mobileModel}</td>
                          <td style={{ padding: '12px', fontSize: '12px' }}>{formatDate(t.dateCreatedMillis)}</td>
                          <td style={{ padding: '12px', textAlign: 'right' }}>
                            <ChevronRight size={16} style={{ color: 'var(--color-text-muted)' }} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Recent Customer Records Table */}
          <div className="tickets-section card">
            <h3 className="card-title" style={{ fontSize: '15px', marginBottom: '16px' }}>
              <Users size={18} /> Recent Customer Records
            </h3>
            
            {tickets.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--color-text-muted)', fontSize: '13px' }}>
                No client records found. Create a repair ticket to register.
              </div>
            ) : (
              <div className="table-responsive-wrapper">
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--color-border)', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                      <th style={{ padding: '12px' }}>Client Name</th>
                      <th style={{ padding: '12px' }}>Details / Repair</th>
                      <th style={{ padding: '12px' }}>Ticket ID</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>Payment Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.slice(-4).reverse().map(t => {
                      const cost = t.estimatedCost > 0 ? t.estimatedCost : (t.partsCost + t.laborCost);
                      const due = cost - t.advancePaid;
                      const isPaid = t.status === 'DELIVERED';
                      
                      return (
                        <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }} onClick={() => onTicketClick(t)} className="table-row-hover">
                          <td style={{ padding: '12px' }}>
                            <div style={{ fontWeight: 700, fontSize: '13px' }}>{t.customerName}</div>
                            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{t.customerPhone}</div>
                          </td>
                          <td style={{ padding: '12px' }}>
                            <div style={{ fontSize: '13px', fontWeight: 600 }}>{t.mobileBrand} {t.mobileModel}</div>
                            <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{t.issueCategory}</div>
                          </td>
                          <td style={{ padding: '12px', fontFamily: 'monospace', fontWeight: 700, color: 'var(--color-text-secondary)', fontSize: '12px' }}>
                            {t.ticketNumber}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'right' }}>
                            {isPaid ? (
                              <span className="operator-badge op-vi" style={{ backgroundColor: 'rgba(16,185,129,0.12)', color: '#10b981', borderColor: 'rgba(16,185,129,0.2)' }}>Paid</span>
                            ) : due > 0 ? (
                              <span className="operator-badge op-other" style={{ backgroundColor: 'rgba(245,158,11,0.12)', color: '#f59e0b', borderColor: 'rgba(245,158,11,0.2)' }}>Pending</span>
                            ) : (
                              <span className="operator-badge op-airtel" style={{ backgroundColor: 'rgba(239,68,68,0.12)', color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }}>Unpaid</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        {/* Right Column (Widgets Panel) */}
        <div className="right-panel-workspace">
          
          {/* Lookup & Scanner Widget */}
          <div className="lookup-widget">
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <QrCode size={18} className="text-cyan" /> MNP & ID LOOKUP
            </h3>

            {/* Viewfinder Mockup */}
            <div className="scanner-viewfinder">
              <div className="scanner-line"></div>
              <Sparkles size={32} style={{ color: 'var(--color-cyan-glow)', opacity: 0.4 }} className="animate-pulse" />
              <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '8px', letterSpacing: '0.05em' }}>SCANNER ACTIVATED</div>
            </div>

            <form onSubmit={handleLookupSubmit}>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <input 
                  type="text"
                  className="form-input"
                  placeholder="Enter Ticket ID (e.g. REP-1001)"
                  value={lookupId}
                  onChange={(e) => setLookupId(e.target.value)}
                  style={{ textAlign: 'center', letterSpacing: '0.05em', height: '38px', fontSize: '13px' }}
                />
              </div>
              {lookupError && (
                <div style={{ color: 'var(--color-rose)', fontSize: '11px', textAlign: 'center', marginBottom: '8px', fontWeight: 600 }}>{lookupError}</div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button type="submit" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                  Manual Look
                </button>
                <button type="button" className="btn btn-primary" onClick={() => alert("Simulating Camera QR Scan... Place barcode in front of webcam.")} style={{ padding: '6px 12px', fontSize: '12px' }}>
                  Start Scan
                </button>
              </div>
            </form>
          </div>

          {/* Inventory Stock Alerts Widget */}
          <div className="lookup-widget">
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={18} style={{ color: '#f59e0b' }} /> INVENTORY ALERT
            </h3>

            {products.length === 0 ? (
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', padding: '12px 0', textAlign: 'center' }}>
                No catalog items in database
              </div>
            ) : (
              products.slice(0, 3).map(p => {
                const limit = Math.max(p.quantity, p.lowStockThreshold * 2, 10);
                const percent = Math.min(100, Math.max(5, (p.quantity / limit) * 100));
                const isLow = p.quantity <= p.lowStockThreshold;
                const isOut = p.quantity === 0;
                
                const barColor = isOut ? 'var(--color-rose)' : isLow ? '#f59e0b' : '#10b981';
                
                return (
                  <div key={p.id} className="stock-progress-row">
                    <div className="stock-progress-header">
                      <span style={{ color: '#fff', fontWeight: 700 }}>{p.name}</span>
                      <span style={{ color: barColor, fontWeight: 800 }}>
                        {isOut ? "OUT" : isLow ? `Low ${p.quantity}/${limit}` : `${p.quantity}/${limit}`}
                      </span>
                    </div>
                    <div className="stock-progress-track">
                      <div 
                        className="stock-progress-bar" 
                        style={{ 
                          width: `${percent}%`, 
                          backgroundColor: barColor,
                          boxShadow: `0 0 8px ${barColor}40`
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Outstanding Billing status Widget (Donut chart SVG) */}
          <div className="lookup-widget">
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IndianRupee size={18} style={{ color: '#10b981' }} /> OUTSTANDING DUES
            </h3>

            <div className="donut-chart-wrapper">
              {/* circular SVG donut chart */}
              <svg width="80" height="80" viewBox="0 0 80 80">
                <circle 
                  cx="40" 
                  cy="40" 
                  r="30" 
                  fill="none" 
                  stroke="rgba(255,255,255,0.03)" 
                  strokeWidth="8" 
                />
                <circle 
                  cx="40" 
                  cy="40" 
                  r="30" 
                  fill="none" 
                  stroke="#10b981" 
                  strokeWidth="8" 
                  strokeDasharray="188.4" 
                  strokeDashoffset={strokeOffset} 
                  strokeLinecap="round" 
                  transform="rotate(-90 40 40)"
                  style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                />
                <text 
                  x="50%" 
                  y="53%" 
                  textAnchor="middle" 
                  dy=".3em" 
                  fill="#fff" 
                  fontSize="12" 
                  fontWeight="800"
                  fontFamily="var(--font-family-title)"
                >
                  {paidPercent}%
                </text>
              </svg>

              <div className="donut-legend">
                <div className="donut-legend-item">
                  <div className="donut-color-box" style={{ backgroundColor: '#10b981' }}></div>
                  <span>Paid ({paidJobsCount})</span>
                </div>
                <div className="donut-legend-item">
                  <div className="donut-color-box" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}></div>
                  <span>Dues ({unpaidJobsCount})</span>
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '10px', marginTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
              <span>Dues Value:</span>
              <span style={{ color: 'var(--color-rose)', fontWeight: 800 }}>₹{totalActiveBalance.toLocaleString('en-IN')}</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
