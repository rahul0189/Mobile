import React, { useState, useEffect } from 'react';
import { X, Save, AlertTriangle } from 'lucide-react';

export default function AddEditTicketDialog({
  ticket,
  initialCustomerName = "",
  initialCustomerPhone = "",
  onSave,
  onDismiss
}) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [mobileBrand, setMobileBrand] = useState("");
  const [mobileModel, setMobileModel] = useState("");
  const [serialOrImei, setSerialOrImei] = useState("");
  const [issueCategory, setIssueCategory] = useState("Screen");
  const [issueDescription, setIssueDescription] = useState("");
  const [deviceCondition, setDeviceCondition] = useState("Normal wear & tear");
  const [customerPasscode, setCustomerPasscode] = useState("");
  const [estimatedCost, setEstimatedCost] = useState(0.0);
  const [advancePaid, setAdvancePaid] = useState(0.0);
  const [partsCost, setPartsCost] = useState(0.0);
  const [laborCost, setLaborCost] = useState(0.0);
  const [isPriority, setIsPriority] = useState(false);
  const [status, setStatus] = useState("RECEIVED");
  const [technicianNotes, setTechnicianNotes] = useState("");

  const categories = [
    "Screen", "Battery", "Charging Port", "Water Damage", 
    "Software", "Motherboard", "Camera", "Buttons", "Other"
  ];

  // Prepopulate if editing ticket, or prefilling customer
  useEffect(() => {
    if (ticket) {
      setCustomerName(ticket.customerName || "");
      setCustomerPhone(ticket.customerPhone || "");
      setMobileBrand(ticket.mobileBrand || "");
      setMobileModel(ticket.mobileModel || "");
      setSerialOrImei(ticket.serialOrImei || "");
      setIssueCategory(ticket.issueCategory || "Screen");
      setIssueDescription(ticket.issueDescription || "");
      setDeviceCondition(ticket.deviceCondition || "Normal wear & tear");
      setCustomerPasscode(ticket.customerPasscode || "");
      setEstimatedCost(ticket.estimatedCost || 0.0);
      setAdvancePaid(ticket.advancePaid || 0.0);
      setPartsCost(ticket.partsCost || 0.0);
      setLaborCost(ticket.laborCost || 0.0);
      setIsPriority(ticket.isPriority || false);
      setStatus(ticket.status || "RECEIVED");
      setTechnicianNotes(ticket.technicianNotes || "");
    } else {
      setCustomerName(initialCustomerName);
      setCustomerPhone(initialCustomerPhone);
    }
  }, [ticket, initialCustomerName, initialCustomerPhone]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !mobileBrand.trim() || !mobileModel.trim()) {
      alert("Please fill in Name, Phone, Brand, and Model!");
      return;
    }

    onSave({
      id: ticket?.id,
      ticketNumber: ticket?.ticketNumber || "",
      dateCreatedMillis: ticket?.dateCreatedMillis || Date.now(),
      dateUpdatedMillis: Date.now(),
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      mobileBrand: mobileBrand.trim(),
      mobileModel: mobileModel.trim(),
      serialOrImei: serialOrImei.trim(),
      issueCategory,
      issueDescription: issueDescription.trim(),
      deviceCondition: deviceCondition.trim(),
      customerPasscode: customerPasscode.trim(),
      estimatedCost: Number(estimatedCost) || 0.0,
      advancePaid: Number(advancePaid) || 0.0,
      partsCost: Number(partsCost) || 0.0,
      laborCost: Number(laborCost) || 0.0,
      status,
      technicianNotes: technicianNotes.trim(),
      isPriority
    });
  };

  return (
    <div className="modal-overlay">
      <form onSubmit={handleSubmit} className="modal-content ticket-dialog-modal">
        <div className="modal-header">
          <h2>{ticket ? `Edit Ticket ${ticket.ticketNumber}` : "New Repair Booking"}</h2>
          <button className="close-btn" onClick={onDismiss} aria-label="Close">
            <X size={20} />
          </button>
        </div>
          <div className="modal-body">
            
            {/* Customer Details Row */}
            <div className="form-row split-2">
              <div className="form-group">
                <label>Customer Name *</label>
                <input 
                  type="text" 
                  value={customerName} 
                  onChange={(e) => setCustomerName(e.target.value)} 
                  className="form-input" 
                  required 
                  placeholder="e.g. Rahul Sharma"
                />
              </div>
              <div className="form-group">
                <label>Customer Phone *</label>
                <input 
                  type="tel" 
                  value={customerPhone} 
                  onChange={(e) => setCustomerPhone(e.target.value)} 
                  className="form-input" 
                  required 
                  placeholder="e.g. 9876543210"
                />
              </div>
            </div>

            {/* Device Details Row */}
            <div className="form-row split-3">
              <div className="form-group">
                <label>Mobile Brand *</label>
                <input 
                  type="text" 
                  value={mobileBrand} 
                  onChange={(e) => setMobileBrand(e.target.value)} 
                  className="form-input" 
                  required 
                  placeholder="e.g. OnePlus"
                />
              </div>
              <div className="form-group">
                <label>Mobile Model *</label>
                <input 
                  type="text" 
                  value={mobileModel} 
                  onChange={(e) => setMobileModel(e.target.value)} 
                  className="form-input" 
                  required 
                  placeholder="e.g. Nord CE 3"
                />
              </div>
              <div className="form-group">
                <label>Serial / IMEI (Optional)</label>
                <input 
                  type="text" 
                  value={serialOrImei} 
                  onChange={(e) => setSerialOrImei(e.target.value)} 
                  className="form-input" 
                  placeholder="IMEI code"
                />
              </div>
            </div>

            {/* Issue Description & Category */}
            <div className="form-row split-2">
              <div className="form-group">
                <label>Issue Category</label>
                <select 
                  className="form-input form-select" 
                  value={issueCategory} 
                  onChange={(e) => setIssueCategory(e.target.value)}
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Lock Pattern/Passcode (Optional)</label>
                <input 
                  type="text" 
                  value={customerPasscode} 
                  onChange={(e) => setCustomerPasscode(e.target.value)} 
                  className="form-input" 
                  placeholder="Screen lock code"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Issue Description & Symptoms</label>
              <textarea 
                value={issueDescription} 
                onChange={(e) => setIssueDescription(e.target.value)} 
                className="form-input" 
                rows={3} 
                placeholder="e.g. Display glass cracked, flickering screen, touch unresponsive"
              />
            </div>

            <div className="form-group">
              <label>Received Device Condition</label>
              <input 
                type="text" 
                value={deviceCondition} 
                onChange={(e) => setDeviceCondition(e.target.value)} 
                className="form-input" 
                placeholder="e.g. Scratched frame, dented corners, missing SIM tray"
              />
            </div>

            <hr className="divider" style={{ margin: '16px 0' }} />

            {/* Billing & Cost Fields */}
            <h3 className="section-subtitle-inline">Billing Estimation</h3>
            
            <div className="form-row split-4">
              <div className="form-group">
                <label>Estimated Quote (₹)</label>
                <input 
                  type="number" 
                  value={estimatedCost} 
                  onChange={(e) => setEstimatedCost(Math.max(0, parseFloat(e.target.value) || 0))} 
                  className="form-input" 
                  step="0.01"
                />
              </div>
              <div className="form-group">
                <label>Advance Paid (₹)</label>
                <input 
                  type="number" 
                  value={advancePaid} 
                  onChange={(e) => setAdvancePaid(Math.max(0, parseFloat(e.target.value) || 0))} 
                  className="form-input" 
                  step="0.01"
                />
              </div>
              <div className="form-group">
                <label>Spare Parts Cost (₹)</label>
                <input 
                  type="number" 
                  value={partsCost} 
                  onChange={(e) => setPartsCost(Math.max(0, parseFloat(e.target.value) || 0))} 
                  className="form-input" 
                  step="0.01"
                  placeholder="For internal ledger"
                />
              </div>
              <div className="form-group">
                <label>Labor / Tech Fee (₹)</label>
                <input 
                  type="number" 
                  value={laborCost} 
                  onChange={(e) => setLaborCost(Math.max(0, parseFloat(e.target.value) || 0))} 
                  className="form-input" 
                  step="0.01"
                  placeholder="For internal ledger"
                />
              </div>
            </div>

            {/* Checkboxes / Priority */}
            <div className="form-group checkbox-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
              <input 
                type="checkbox" 
                id="isPriority" 
                checked={isPriority} 
                onChange={(e) => setIsPriority(e.target.checked)} 
                className="checkbox-input"
              />
              <label htmlFor="isPriority" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertTriangle size={14} className="text-amber" /> Mark as Express Priority Repair (Express turnaround)
              </label>
            </div>
            
            {ticket && (
              <div className="form-group" style={{ marginTop: '12px' }}>
                <label>Technician Notes</label>
                <textarea 
                  value={technicianNotes} 
                  onChange={(e) => setTechnicianNotes(e.target.value)} 
                  className="form-input" 
                  rows={2} 
                  placeholder="Notes about diagnostic results or parts replacement..."
                />
              </div>
            )}

          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onDismiss}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              <Save size={16} /> Save Ticket
            </button>
          </div>
      </form>
    </div>
  );
}
