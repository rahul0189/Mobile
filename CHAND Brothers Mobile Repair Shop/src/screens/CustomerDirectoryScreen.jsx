import React, { useState } from 'react';
import { 
  Search, Menu, User, Phone, Calendar, Wrench, 
  IndianRupee, ChevronDown, ChevronUp, Plus, ExternalLink
} from 'lucide-react';
import { getCustomerProfiles, REPAIR_STATUSES } from '../state';

export default function CustomerDirectoryScreen({
  tickets,
  onSelectTicket,
  onNewTicketForCustomer,
  onOpenDrawer
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCustomerPhone, setExpandedCustomerPhone] = useState(null);

  // Fetch customer profiles calculated dynamically from the tickets db
  const customerProfiles = getCustomerProfiles();

  // Search filter
  const filteredCustomers = customerProfiles.filter(customer => {
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        customer.customerName.toLowerCase().includes(q) ||
        customer.customerPhone.includes(q)
      );
    }
    return true;
  });

  const formatDate = (ms) => {
    return new Date(ms).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleToggleExpand = (phone) => {
    if (expandedCustomerPhone === phone) {
      setExpandedCustomerPhone(null);
    } else {
      setExpandedCustomerPhone(phone);
    }
  };

  return (
    <div className="customers-container">
      {/* Header Bar */}
      <header className="screen-header">
        <div className="header-left">
          <button className="menu-toggle-btn" onClick={onOpenDrawer} aria-label="Open Menu">
            <Menu size={24} />
          </button>
          <div>
            <h1>Customer Directory</h1>
            <p className="subtitle">Client Accounts and Repair History</p>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="filter-section card">
        <div className="search-bar-wrapper">
          <Search className="search-icon" size={20} />
          <input 
            type="text" 
            placeholder="Search by client name or phone number..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input search-input"
          />
        </div>
      </div>

      {/* Customers List */}
      <div className="customers-section">
        <h2 className="section-title">
          Client Accounts
          <span className="count-badge">{filteredCustomers.length}</span>
        </h2>

        {filteredCustomers.length === 0 ? (
          <div className="empty-state card">
            <User size={48} className="empty-icon" />
            <h3>No customers found</h3>
            <p>No tickets matching search query or database is currently empty.</p>
          </div>
        ) : (
          <div className="customers-grid">
            {filteredCustomers.map(customer => {
              const isExpanded = expandedCustomerPhone === customer.customerPhone;
              
              return (
                <div key={customer.customerPhone} className={`customer-card card ${isExpanded ? 'expanded' : ''}`}>
                  <div className="customer-card-header" onClick={() => handleToggleExpand(customer.customerPhone)}>
                    <div className="customer-primary-info">
                      <div className="customer-avatar">
                        {customer.customerName.charAt(0).toUpperCase()}
                      </div>
                      <div className="customer-title-group">
                        <h3>{customer.customerName}</h3>
                        <span className="phone-text">
                          <Phone size={12} /> {customer.customerPhone}
                        </span>
                      </div>
                    </div>

                    <div className="customer-header-metrics">
                      <div className="header-metric">
                        <span className="label">Jobs</span>
                        <span className="val">{customer.totalJobsCount}</span>
                      </div>
                      <div className="header-metric">
                        <span className="label">Spent</span>
                        <span className="val text-emerald">₹{customer.totalAmountSpent.toFixed(0)}</span>
                      </div>
                      {customer.totalPendingBalance > 0 && (
                        <div className="header-metric">
                          <span className="label text-rose">Balance</span>
                          <span className="val text-rose font-bold">₹{customer.totalPendingBalance.toFixed(0)}</span>
                        </div>
                      )}
                    </div>

                    <button className="expand-card-btn" aria-label="Toggle Details">
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="customer-expanded-details animate-slide-down">
                      <hr className="divider" />
                      
                      <div className="details-metadata-row">
                        <div className="metadata-item">
                          <Calendar size={14} className="text-muted" />
                          <span>Last Visit: <strong>{formatDate(customer.lastVisitMillis)}</strong></span>
                        </div>
                        <div className="metadata-item">
                          <Wrench size={14} className="text-muted" />
                          <span>Active Repairs: <strong>{customer.activeJobsCount}</strong></span>
                        </div>
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => onNewTicketForCustomer(customer.customerName, customer.customerPhone)}
                        >
                          <Plus size={14} /> New Ticket
                        </button>
                      </div>

                      <h4 className="job-history-title">Repair Ticket History</h4>
                      
                      <div className="customer-history-list">
                        {customer.tickets.map(ticket => {
                          const ticketCost = ticket.estimatedCost > 0 ? ticket.estimatedCost : (ticket.partsCost + ticket.laborCost);
                          const isPaid = ticket.status === 'DELIVERED';
                          const balanceDue = isPaid ? 0 : (ticketCost - ticket.advancePaid);
                          
                          return (
                            <div 
                              key={ticket.id} 
                              className="history-ticket-item"
                              onClick={() => onSelectTicket(ticket)}
                            >
                              <div className="history-item-left">
                                <span className="ticket-num">{ticket.ticketNumber}</span>
                                <span className="device-desc">{ticket.mobileBrand} {ticket.mobileModel}</span>
                                <span className="issue-cat">{ticket.issueCategory}</span>
                              </div>
                              
                              <div className="history-item-right">
                                <span 
                                  className="badge status-badge"
                                  style={{ 
                                    backgroundColor: `${REPAIR_STATUSES[ticket.status]?.badgeColor}15`,
                                    color: REPAIR_STATUSES[ticket.status]?.badgeColor,
                                    fontSize: '11px',
                                    padding: '2px 8px'
                                  }}
                                >
                                  {REPAIR_STATUSES[ticket.status]?.displayName}
                                </span>
                                <div className="cost-tag text-right">
                                  <span className="price">₹{ticketCost.toFixed(0)}</span>
                                  {balanceDue > 0 && <span className="bal-due">Due: ₹{balanceDue.toFixed(0)}</span>}
                                </div>
                                <ExternalLink size={14} className="link-arrow" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
