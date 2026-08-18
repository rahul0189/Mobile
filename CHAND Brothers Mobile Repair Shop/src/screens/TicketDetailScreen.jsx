import React, { useState } from 'react';
import { 
  ArrowLeft, Edit3, Trash2, Printer, MessageSquare, 
  Save, Check, Phone, ShieldAlert, Calendar, CreditCard,
  User, Smartphone, Clipboard, Key, ShieldCheck, Plus
} from 'lucide-react';
import { REPAIR_STATUSES } from '../state';

export default function TicketDetailScreen({
  ticket,
  onBack,
  onStatusChanged,
  onEditTicket,
  onShowReceipt,
  onDeleteTicket,
  onSendSmsAlert,
  onNewTicketForCustomer
}) {
  const [techNotes, setTechNotes] = useState(ticket.technicianNotes || "");
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(ticket.status);
  const [showStatusUpdateConfirm, setShowStatusUpdateConfirm] = useState(false);

  // Sync state if ticket details are updated in parent component
  React.useEffect(() => {
    setSelectedStatus(ticket.status);
    setTechNotes(ticket.technicianNotes || "");
  }, [ticket]);

  const isPaid = ticket.status === 'DELIVERED';
  const balance = isPaid ? 0 : ((ticket.estimatedCost > 0 ? ticket.estimatedCost : (ticket.partsCost + ticket.laborCost)) - ticket.advancePaid);
  const totalCost = ticket.estimatedCost > 0 ? ticket.estimatedCost : (ticket.partsCost + ticket.laborCost);

  const formatDate = (ms) => {
    return new Date(ms).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSaveNotes = () => {
    onStatusChanged(ticket.status, techNotes);
    setIsEditingNotes(false);
  };

  const handleStatusClick = (statusKey) => {
    setSelectedStatus(statusKey);
    setShowStatusUpdateConfirm(true);
  };

  const confirmStatusChange = () => {
    onStatusChanged(selectedStatus, techNotes);
    setShowStatusUpdateConfirm(false);
  };

  const handleSendWhatsApp = () => {
    const cleanPhone = ticket.customerPhone.replace(/\D/g, "");
    if (!cleanPhone) {
      alert("Invalid customer phone number!");
      return;
    }
    
    const statusName = REPAIR_STATUSES[ticket.status]?.displayName || ticket.status;
    const due = totalCost - ticket.advancePaid;
    
    let message = "";
    if (ticket.status === 'READY_FOR_PICKUP') {
      message = `GREAT NEWS! Hello ${ticket.customerName}, your ${ticket.mobileBrand} ${ticket.mobileModel} (Ticket #${ticket.ticketNumber}) is fully REPAIRED & READY FOR PICKUP! Remaining balance: ₹${due}. Thank you - CHAND BROTHERS Mobile Repair Shop.`;
    } else if (ticket.status === 'DELIVERED') {
      message = `Thank you ${ticket.customerName}! Your device ${ticket.mobileBrand} ${ticket.mobileModel} (Ticket #${ticket.ticketNumber}) has been delivered. Thank you for choosing CHAND BROTHERS Mobile Repair Shop!`;
    } else {
      message = `Hello ${ticket.customerName}, your device (${ticket.mobileBrand} ${ticket.mobileModel}) is currently in status: ${statusName} (Ticket #${ticket.ticketNumber}). Estimated cost: ₹${totalCost}. Advance Paid: ₹${ticket.advancePaid}. Thank you - CHAND BROTHERS.`;
    }

    const url = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handlePrintReceipt = () => {
    const printWindow = window.open('', '_blank');
    const due = totalCost - ticket.advancePaid;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${ticket.ticketNumber}</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; width: 80mm; margin: 0; padding: 10px; color: #000; font-size: 12px; }
            .header { text-align: center; margin-bottom: 15px; }
            .header h2 { margin: 0; font-size: 16px; }
            .header p { margin: 2px 0; font-size: 10px; }
            .divider { border-top: 1px dashed #000; margin: 10px 0; }
            .row { display: flex; justify-content: space-between; margin: 3px 0; }
            .bold { font-weight: bold; }
            .footer { text-align: center; margin-top: 20px; font-size: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>CHAND BROTHERS</h2>
            <p>Mobile Repair Shop</p>
            <p>Ph: +91 79869 11294</p>
          </div>
          <div class="divider"></div>
          <div class="row bold"><span>Ticket No:</span> <span>${ticket.ticketNumber}</span></div>
          <div class="row"><span>Date:</span> <span>${new Date(ticket.dateCreatedMillis).toLocaleDateString('en-IN')}</span></div>
          <div class="row"><span>Customer:</span> <span>${ticket.customerName}</span></div>
          <div class="row"><span>Phone:</span> <span>${ticket.customerPhone}</span></div>
          <div class="divider"></div>
          <div class="row bold"><span>Device:</span> <span>${ticket.mobileBrand} ${ticket.mobileModel}</span></div>
          <div class="row"><span>Issue:</span> <span>${ticket.issueCategory}</span></div>
          <div class="row"><span>Description:</span> <span>${ticket.issueDescription}</span></div>
          <div class="divider"></div>
          <div class="row"><span>Total Cost:</span> <span>₹${totalCost}</span></div>
          <div class="row"><span>Advance Paid:</span> <span>₹${ticket.advancePaid}</span></div>
          <div class="divider"></div>
          <div class="row bold" style="font-size: 14px;"><span>Balance Due:</span> <span>₹${due}</span></div>
          <div class="divider"></div>
          <div class="footer">
            <p>Thank you for your business!</p>
            <p>Please bring this slip for pickup.</p>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handlePrintLabel = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Label - ${ticket.ticketNumber}</title>
          <style>
            body { font-family: sans-serif; width: 50mm; height: 30mm; margin: 0; padding: 5px; box-sizing: border-box; font-size: 10px; }
            .label-container { border: 1px solid #000; padding: 4px; height: 100%; display: flex; flex-direction: column; justify-content: space-between; }
            .bold { font-weight: bold; }
            .ticket-no { font-size: 12px; font-family: monospace; }
          </style>
        </head>
        <body>
          <div class="label-container">
            <div class="bold ticket-no">${ticket.ticketNumber}</div>
            <div><span class="bold">Client:</span> ${ticket.customerName}</div>
            <div><span class="bold">Device:</span> ${ticket.mobileBrand} ${ticket.mobileModel}</div>
            <div><span class="bold">Issue:</span> ${ticket.issueCategory}</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="ticket-detail-container">
      {/* Header */}
      <header className="screen-header">
        <div className="header-left">
          <button className="btn btn-secondary btn-icon-only" onClick={onBack} aria-label="Go Back">
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="ticket-header-title">
              <h1>{ticket.ticketNumber}</h1>
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
            <p className="subtitle">Last updated: {formatDate(ticket.dateUpdatedMillis)}</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={handleSendWhatsApp} style={{ backgroundColor: 'rgba(37, 211, 102, 0.15)', color: '#25D366', borderColor: 'rgba(37, 211, 102, 0.3)' }}>
            <MessageSquare size={16} /> WhatsApp Alert
          </button>
          <button className="btn btn-secondary" onClick={handlePrintReceipt}>
            <Printer size={16} /> Print Receipt
          </button>
          <button className="btn btn-secondary" onClick={handlePrintLabel}>
            <Printer size={16} /> Print Label
          </button>
          <button className="btn btn-secondary" onClick={() => onEditTicket(ticket)}>
            <Edit3 size={16} /> Edit
          </button>
          <button className="btn btn-danger" onClick={() => {
            if(confirm(`Are you sure you want to delete Ticket ${ticket.ticketNumber}?`)) {
              onDeleteTicket(ticket.id);
              onBack();
            }
          }}>
            <Trash2 size={16} /> Delete
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <div className="detail-grid">
        {/* Left Side: Client, Device, and Status timeline */}
        <div className="detail-main-info">
          
          {/* Status Progression Timeline */}
          <div className="card timeline-card">
            <h2 className="card-title">Repair Progression</h2>
            <div className="timeline-stepper">
              {Object.entries(REPAIR_STATUSES).map(([key, value]) => {
                const isCurrent = ticket.status === key;
                const isCancelled = key === 'CANCELLED';
                
                // Don't show Cancelled in the main sequence unless it IS cancelled
                if (isCancelled && ticket.status !== 'CANCELLED') return null;

                return (
                  <button 
                    key={key} 
                    className={`timeline-step-btn ${isCurrent ? 'active' : ''}`}
                    onClick={() => handleStatusClick(key)}
                    style={{ '--step-color': value.badgeColor }}
                  >
                    <div className="step-marker" style={{ borderColor: value.badgeColor, backgroundColor: isCurrent ? value.badgeColor : 'transparent' }}>
                      {isCurrent && <Check size={12} className="check-icon" />}
                    </div>
                    <div className="step-label">
                      <span className="step-name">{value.displayName}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {showStatusUpdateConfirm && (
              <div className="status-confirm-box">
                <p>Change status to <strong>{REPAIR_STATUSES[selectedStatus]?.displayName}</strong>?</p>
                <div className="confirm-actions">
                  <button className="btn btn-secondary btn-sm" onClick={() => setShowStatusUpdateConfirm(false)}>Cancel</button>
                  <button className="btn btn-primary btn-sm" onClick={confirmStatusChange}>Confirm Update</button>
                </div>
              </div>
            )}
          </div>

          {/* Client & Device Details Card */}
          <div className="info-cards-row">
            {/* Client Info */}
            <div className="card info-subcard">
              <div className="info-card-header">
                <User size={18} className="text-cyan" />
                <h3>Client Details</h3>
              </div>
              <div className="info-fields">
                <div className="info-field">
                  <span className="info-label">Customer Name</span>
                  <span className="info-value">{ticket.customerName}</span>
                </div>
                <div className="info-field">
                  <span className="info-label">Phone Number</span>
                  <a href={`tel:${ticket.customerPhone}`} className="info-value phone-link">
                    <Phone size={14} /> {ticket.customerPhone}
                  </a>
                </div>
                {ticket.customerEmail && (
                  <div className="info-field">
                    <span className="info-label">Email Address</span>
                    <span className="info-value" style={{ wordBreak: 'break-all' }}>{ticket.customerEmail}</span>
                  </div>
                )}
                <div className="info-field">
                  <span className="info-label">Registration Date</span>
                  <span className="info-value"><Calendar size={14} /> {formatDate(ticket.dateCreatedMillis)}</span>
                </div>
                <button 
                  className="btn btn-secondary btn-sm" 
                  style={{ marginTop: '12px', width: '100%' }}
                  onClick={() => onNewTicketForCustomer(ticket.customerName, ticket.customerPhone)}
                >
                  <Plus size={14} /> Book Another Device
                </button>
              </div>
            </div>

            {/* Device Info */}
            <div className="card info-subcard">
              <div className="info-card-header">
                <Smartphone size={18} className="text-indigo" />
                <h3>Device Details</h3>
              </div>
              <div className="info-fields">
                <div className="info-field">
                  <span className="info-label">Device model</span>
                  <span className="info-value font-outfit">{ticket.mobileBrand} {ticket.mobileModel}</span>
                </div>
                <div className="info-field">
                  <span className="info-label">Color</span>
                  <span className="info-value">{ticket.deviceColor || "Black"}</span>
                </div>
                <div className="info-field">
                  <span className="info-label">Serial / IMEI</span>
                  <span className="info-value">{ticket.serialOrImei || "N/A"}</span>
                </div>
                <div className="info-field">
                  <span className="info-label">Power Status</span>
                  <span className={`badge ${ticket.isPoweringOn === false ? 'bg-rose' : 'bg-cyan'}`} style={{ width: 'fit-content', padding: '2px 8px', fontSize: '11px', borderRadius: '4px', fontWeight: 'bold' }}>
                    {ticket.isPoweringOn === false ? "Dead / Not Powering On" : "Powering On OK"}
                  </span>
                </div>
                <div className="info-field">
                  <span className="info-label">Device Lock Passcode</span>
                  <span className="info-value passcode-badge"><Key size={12} /> {ticket.customerPasscode || "None"}</span>
                </div>
                <div className="info-field">
                  <span className="info-label">Received Physical Condition</span>
                  <span className="info-value text-italic">"{ticket.deviceCondition}"</span>
                </div>
              </div>
            </div>
          </div>

          {/* Issue & Diagnosis Card */}
          <div className="card issue-card">
            <div className="info-card-header">
              <Clipboard size={18} className="text-rose" />
              <h3>Issue Details & Diagnosis</h3>
            </div>
            
            <div className="issue-details-grid">
              <div className="issue-detail-item">
                <span className="info-label">Issue Category</span>
                <span className="badge category-badge">{ticket.issueCategory}</span>
              </div>

              <div className="issue-detail-item">
                <span className="info-label">Repair Warranty</span>
                <span className="badge category-badge" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', borderColor: 'rgba(99, 102, 241, 0.3)' }}>
                  {ticket.warranty || "30 Days"}
                </span>
              </div>

              {ticket.estimatedReadyDate && (
                <div className="issue-detail-item">
                  <span className="info-label">Est. Completion Date</span>
                  <span className="info-value" style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-cyan)' }}>
                    <Calendar size={12} style={{ marginRight: '4px' }} />
                    {new Date(ticket.estimatedReadyDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              )}
              
              <div className="issue-detail-item" style={{ gridColumn: 'span 2' }}>
                <span className="info-label">Reported Fault Description</span>
                <p className="fault-description-text">"{ticket.issueDescription}"</p>
              </div>
            </div>
          </div>   <hr className="divider" />

            <div className="tech-notes-section">
              <div className="tech-notes-header">
                <span className="info-label">Technician Diagnosis & Action Notes</span>
                {!isEditingNotes ? (
                  <button className="btn btn-secondary btn-xs" onClick={() => setIsEditingNotes(true)}>
                    <Edit3 size={12} /> Edit Notes
                  </button>
                ) : (
                  <button className="btn btn-primary btn-xs" onClick={handleSaveNotes}>
                    <Save size={12} /> Save Notes
                  </button>
                )}
              </div>

              {isEditingNotes ? (
                <textarea 
                  className="form-input tech-notes-textarea" 
                  value={techNotes} 
                  onChange={(e) => setTechNotes(e.target.value)}
                  placeholder="Type updates, diagnostic details, ordered parts, etc..."
                  rows={4}
                />
              ) : (
                <p className="tech-notes-display">
                  {ticket.technicianNotes ? ticket.technicianNotes : <em>No technician notes logged yet. Click 'Edit Notes' to log details.</em>}
                </p>
              )}
            </div>
          </div>

        {/* Right Side: Billing & Financial Overview */}
        <div className="detail-sidebar">
          <div className="card billing-card">
            <div className="info-card-header">
              <CreditCard size={18} className="text-emerald" />
              <h3>Billing & Quote</h3>
            </div>

            <div className="billing-receipt-details">
              {ticket.estimatedCost > 0 ? (
                // Estimated cost layout
                <div className="billing-item quote-type">
                  <div className="billing-label-group">
                    <span className="billing-name">Estimated Quote</span>
                    <span className="billing-desc">Flatsourced total estimate</span>
                  </div>
                  <span className="billing-value text-cyan">₹{ticket.estimatedCost.toFixed(2)}</span>
                </div>
              ) : (
                // Itemized cost layout
                <>
                  <div className="billing-item">
                    <span className="billing-name">Spare Parts Cost</span>
                    <span className="billing-value">₹{ticket.partsCost.toFixed(2)}</span>
                  </div>
                  <div className="billing-item">
                    <span className="billing-name">Repair Labor Fee</span>
                    <span className="billing-value">₹{ticket.laborCost.toFixed(2)}</span>
                  </div>
                </>
              )}

              <hr className="divider" />

              <div className="billing-item total">
                <span className="billing-name">Total Price</span>
                <span className="billing-value">₹{totalCost.toFixed(2)}</span>
              </div>

              <div className="billing-item advance">
                <span className="billing-name">Advance Paid</span>
                <span className="billing-value text-emerald">- ₹{ticket.advancePaid.toFixed(2)}</span>
              </div>

              <hr className="divider" />

              <div className={`billing-item balance ${balance > 0 ? 'due' : 'settled'}`}>
                <span className="billing-name">{balance > 0 ? 'Remaining Balance' : 'Bill Paid'}</span>
                <span className="billing-value">
                  {balance > 0 ? `₹${balance.toFixed(2)}` : (
                    <span className="paid-stamp">
                      <ShieldCheck size={16} /> Fully Paid
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
