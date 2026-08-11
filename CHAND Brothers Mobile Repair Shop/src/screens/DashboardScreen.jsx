import React from 'react';
import { 
  Plus, Search, Filter, Wrench, AlertTriangle, 
  IndianRupee, ChevronRight, MessageSquare, Menu,
  Database, Users, TrendingUp, BarChart2
} from 'lucide-react';
import { REPAIR_STATUSES } from '../state';

export default function DashboardScreen({
  tickets,
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
  userName
}) {

  // Statistics calculations
  const activeTickets = tickets.filter(t => t.status !== 'DELIVERED' && t.status !== 'CANCELLED');
  const activeTicketsCount = activeTickets.length;
  
  const totalActiveBalance = activeTickets.reduce((sum, t) => {
    const cost = t.estimatedCost > 0 ? t.estimatedCost : (t.partsCost + t.laborCost);
    const balance = cost - t.advancePaid;
    return sum + (balance > 0 ? balance : 0);
  }, 0);

  // Apply filters and searches
  const filteredTickets = tickets.filter(ticket => {
    // Filter by status
    if (selectedFilter !== 'ALL') {
      if (ticket.status !== selectedFilter) return false;
    }
    
    // Search query
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

  // Format Date
  const formatDate = (ms) => {
    const d = new Date(ms);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="dashboard-container">
      {/* Header Bar */}
      <header className="screen-header">
        <div className="header-left">
          <button className="menu-toggle-btn" onClick={onOpenDrawer} aria-label="Open Menu">
            <Menu size={24} />
          </button>
          <div>
            <h1>Dashboard</h1>
            <p className="welcome-msg">Logged in as: <span className="tech-name">{userName || "Guest Technician"}</span></p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={onOpenCloudSyncClick}>
            <Database size={16} /> Sync
          </button>
          <button className="btn btn-secondary" onClick={onOpenSmsTemplatesClick}>
            <MessageSquare size={16} /> Templates
          </button>
          <button className="btn btn-primary" onClick={onNewTicketClick}>
            <Plus size={16} /> New Job
          </button>
        </div>
      </header>

      {/* Metrics Row */}
      <div className="metrics-grid">
        <div className="metric-card cyan">
          <div className="metric-icon">
            <Wrench size={24} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Active Repairs</span>
            <span className="metric-val">{activeTicketsCount}</span>
          </div>
        </div>
        
        <div className="metric-card amber">
          <div className="metric-icon">
            <AlertTriangle size={24} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Low Stock items</span>
            <span className="metric-val">{lowStockCount}</span>
          </div>
        </div>

        <div className="metric-card emerald">
          <div className="metric-icon">
            <IndianRupee size={24} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Active Balance Due</span>
            <span className="metric-val">₹{totalActiveBalance.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="filter-section card">
        <div className="search-bar-wrapper">
          <Search className="search-icon" size={20} />
          <input 
            type="text" 
            placeholder="Search ticket, client name, phone, model or brand..." 
            value={searchQuery}
            onChange={(e) => onSearchQueryChanged(e.target.value)}
            className="form-input search-input"
          />
        </div>
        
        <div className="status-filter-tabs">
          <button 
            className={`filter-tab ${selectedFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => onFilterSelected('ALL')}
          >
            All ({tickets.length})
          </button>
          {Object.entries(REPAIR_STATUSES).map(([key, value]) => {
            const count = tickets.filter(t => t.status === key).length;
            return (
              <button 
                key={key} 
                className={`filter-tab ${selectedFilter === key ? 'active' : ''}`}
                onClick={() => onFilterSelected(key)}
                style={{ '--accent-color': value.badgeColor }}
              >
                <span className="status-dot" style={{ backgroundColor: value.badgeColor }}></span>
                {value.displayName} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Ticket List Grid */}
      <div className="tickets-section">
        <h2 className="section-title">
          {selectedFilter === 'ALL' ? 'All Tickets' : REPAIR_STATUSES[selectedFilter]?.displayName + ' Tickets'} 
          <span className="count-badge">{filteredTickets.length}</span>
        </h2>

        {filteredTickets.length === 0 ? (
          <div className="empty-state card">
            <Wrench size={48} className="empty-icon" />
            <h3>No tickets found</h3>
            <p>Try refining your search terms or change the status filter.</p>
            <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={onNewTicketClick}>
              <Plus size={16} /> Create New Ticket
            </button>
          </div>
        ) : (
          <div className="tickets-grid">
            {filteredTickets.map(ticket => {
              const balance = (ticket.estimatedCost > 0 ? ticket.estimatedCost : (ticket.partsCost + ticket.laborCost)) - ticket.advancePaid;
              const isLowStockWarn = ticket.status === 'WAITING_FOR_PARTS';
              
              return (
                <div 
                  key={ticket.id} 
                  className={`ticket-card card ${ticket.isPriority ? 'priority' : ''}`}
                  onClick={() => onTicketClick(ticket)}
                >
                  <div className="ticket-card-header">
                    <span className="ticket-number">{ticket.ticketNumber}</span>
                    <div className="ticket-badges">
                      {ticket.isPriority && <span className="badge priority-badge">Priority</span>}
                      <span 
                        className="badge status-badge"
                        style={{ 
                          backgroundColor: `${REPAIR_STATUSES[ticket.status]?.badgeColor}20`,
                          color: REPAIR_STATUSES[ticket.status]?.badgeColor,
                          border: `1px solid ${REPAIR_STATUSES[ticket.status]?.badgeColor}40`
                        }}
                      >
                        {REPAIR_STATUSES[ticket.status]?.displayName}
                      </span>
                    </div>
                  </div>

                  <div className="ticket-card-body">
                    <h3 className="device-title">{ticket.mobileBrand} {ticket.mobileModel}</h3>
                    <p className="issue-label">{ticket.issueCategory} • <span className="desc-truncate">{ticket.issueDescription}</span></p>
                    
                    <div className="client-info">
                      <span className="client-name">{ticket.customerName}</span>
                      <span className="client-phone">{ticket.customerPhone}</span>
                    </div>

                    <div className="ticket-footer-row">
                      <div className="date-info">
                        <span className="label">Booked:</span>
                        <span className="value">{formatDate(ticket.dateCreatedMillis)}</span>
                      </div>
                      
                      <div className="price-info">
                        {balance > 0 ? (
                          <>
                            <span className="label">Due:</span>
                            <span className="value balance-due">₹{balance.toFixed(2)}</span>
                          </>
                        ) : (
                          <>
                            <span className="label text-emerald">Paid:</span>
                            <span className="value text-emerald">₹{(ticket.estimatedCost > 0 ? ticket.estimatedCost : (ticket.partsCost + ticket.laborCost)).toFixed(2)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="ticket-card-hover-arrow">
                    <ChevronRight size={20} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
