import React from 'react';
import { X, Printer, ShieldAlert } from 'lucide-react';
import { REPAIR_STATUSES } from '../state';

export default function ReceiptDialog({
  ticket,
  onDismiss
}) {
  const balance = (ticket.estimatedCost > 0 ? ticket.estimatedCost : (ticket.partsCost + ticket.laborCost)) - ticket.advancePaid;
  const totalCost = ticket.estimatedCost > 0 ? ticket.estimatedCost : (ticket.partsCost + ticket.laborCost);

  const formatDate = (ms) => {
    return new Date(ms).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay receipt-modal-overlay">
      <div className="modal-content receipt-modal-content">
        <div className="modal-header hide-on-print">
          <h2>Print Repair Invoice</h2>
          <div className="header-actions">
            <button className="btn btn-primary btn-sm" onClick={handlePrint}>
              <Printer size={14} /> Print / PDF
            </button>
            <button className="close-btn" onClick={onDismiss} aria-label="Close">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="modal-body receipt-printable-area">
          {/* Printable Invoice Card */}
          <div className="receipt-invoice-card">
            
            {/* Invoice Header */}
            <div className="invoice-shop-header">
              <div className="shop-title-wrap">
                <span className="brand-title">CHAND BROTHERS</span>
                <span className="brand-subtitle">MOBILE REPAIR SHOP</span>
              </div>
              <div className="shop-contact-details">
                <p>Main Market Road, Near Gandhi Chowk</p>
                <p>Contact: +91 98765-43210, +91 99911-22334</p>
                <p>Email: support@chandbrothers.com</p>
              </div>
            </div>

            <hr className="receipt-line" />

            {/* Invoice Metadata */}
            <div className="invoice-meta-grid">
              <div className="meta-col">
                <p><span className="label">Ticket Num:</span> <strong>{ticket.ticketNumber}</strong></p>
                <p><span className="label">Date Booked:</span> {formatDate(ticket.dateCreatedMillis)}</p>
                <p><span className="label">Status:</span> {REPAIR_STATUSES[ticket.status]?.displayName}</p>
              </div>
              <div className="meta-col text-right">
                <p><span className="label">Client Name:</span> {ticket.customerName}</p>
                <p><span className="label">Client Phone:</span> +91 {ticket.customerPhone}</p>
              </div>
            </div>

            {/* Device Info Summary */}
            <div className="invoice-device-block">
              <h4>Device Identification</h4>
              <div className="device-spec-grid">
                <div><span className="label">Brand/Model:</span> {ticket.mobileBrand} {ticket.mobileModel}</div>
                <div><span className="label">Serial/IMEI:</span> {ticket.serialOrImei || "N/A"}</div>
                <div><span className="label">Lock Code:</span> {ticket.customerPasscode || "None"}</div>
                <div><span className="label">Condition:</span> {ticket.deviceCondition}</div>
              </div>
            </div>

            {/* Billing Itemization Table */}
            <div className="invoice-table-wrap">
              <table className="receipt-table">
                <thead>
                  <tr>
                    <th>Job / Part Description</th>
                    <th className="text-right">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {ticket.estimatedCost > 0 ? (
                    <tr>
                      <td>
                        <div className="job-desc">
                          <strong>Mobile Repair Charge ({ticket.issueCategory})</strong>
                          <span>Flat quote for hardware diagnostics & repair: "{ticket.issueDescription}"</span>
                        </div>
                      </td>
                      <td className="text-right font-outfit">₹{ticket.estimatedCost.toFixed(2)}</td>
                    </tr>
                  ) : (
                    <>
                      {ticket.partsCost > 0 && (
                        <tr>
                          <td>
                            <div className="job-desc">
                              <strong>Spare Part Replacement Cost</strong>
                              <span>Replaced component: {ticket.issueCategory}</span>
                            </div>
                          </td>
                          <td className="text-right font-outfit">₹{ticket.partsCost.toFixed(2)}</td>
                        </tr>
                      )}
                      {ticket.laborCost > 0 && (
                        <tr>
                          <td>
                            <div className="job-desc">
                              <strong>Technician Repair Labor Fee</strong>
                              <span>Disassembly, alignment assembly fitting & diagnostics testing</span>
                            </div>
                          </td>
                          <td className="text-right font-outfit">₹{ticket.laborCost.toFixed(2)}</td>
                        </tr>
                      )}
                    </>
                  )}
                </tbody>
              </table>
            </div>

            {/* Calculations Summary */}
            <div className="invoice-calculation-block">
              <div className="calc-row">
                <span>Subtotal:</span>
                <span>₹{totalCost.toFixed(2)}</span>
              </div>
              <div className="calc-row">
                <span>Advance Paid:</span>
                <span className="text-emerald">- ₹{ticket.advancePaid.toFixed(2)}</span>
              </div>
              <hr className="receipt-line-thin" />
              <div className="calc-row total">
                <span>Balance Due:</span>
                <span className="balance-val">₹{Math.max(0, balance).toFixed(2)}</span>
              </div>
            </div>

            {/* Terms and Signatures */}
            <div className="invoice-terms-signatures">
              <div className="terms-block">
                <h5>Terms & Conditions:</h5>
                <ul>
                  <li>Bring this ticket invoice for collection of the device.</li>
                  <li>No warranty claims valid for liquid damaged or dropped devices.</li>
                  <li>Devices not collected within 45 days will be disposed of.</li>
                  <li>Repair warranty covers replaced parts only for 15 days.</li>
                </ul>
              </div>
              
              <div className="signature-block">
                <div className="sig-line"></div>
                <span>Authorized Signatory</span>
                <span className="shop-stamp">CHAND BROTHERS</span>
              </div>
            </div>

          </div>
        </div>

        <div className="modal-footer hide-on-print">
          <button type="button" className="btn btn-secondary" onClick={onDismiss} style={{ width: '100%' }}>Close Invoice Preview</button>
        </div>
      </div>
    </div>
  );
}
