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
  const [customerEmail, setCustomerEmail] = useState("");
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

  // New Fields
  const [deviceColor, setDeviceColor] = useState("Black");
  const [warranty, setWarranty] = useState("30 Days");
  const [isPoweringOn, setIsPoweringOn] = useState(true);
  const [estimatedReadyDate, setEstimatedReadyDate] = useState("");
  
  // Brand Select logic
  const BRANDS_LIST = ["Apple", "Samsung", "OnePlus", "Xiaomi", "Vivo", "Oppo", "Realme", "Motorola", "Google", "Nokia", "Other"];
  const [selectedBrand, setSelectedBrand] = useState("Apple");
  const [customBrand, setCustomBrand] = useState("");

  const categories = [
    "Screen", "Battery", "Charging Port", "Water Damage", 
    "Software", "Motherboard", "Camera", "Buttons", "Other"
  ];

  const colors = [
    "Black", "White", "Silver/Gray", "Blue", "Gold", "Green", "Red", "Purple", "Other"
  ];

  const warranties = [
    "No Warranty", "15 Days", "30 Days", "90 Days", "180 Days"
  ];

  // Prepopulate if editing ticket, or prefilling customer
  useEffect(() => {
    if (ticket) {
      setCustomerName(ticket.customerName || "");
      setCustomerPhone(ticket.customerPhone || "");
      setCustomerEmail(ticket.customerEmail || "");
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
      
      // New options
      setDeviceColor(ticket.deviceColor || "Black");
      setWarranty(ticket.warranty || "30 Days");
      setIsPoweringOn(ticket.isPoweringOn !== undefined ? ticket.isPoweringOn : true);
      setEstimatedReadyDate(ticket.estimatedReadyDate || "");

      // Brand dropdown
      const brand = ticket.mobileBrand || "";
      if (BRANDS_LIST.includes(brand)) {
        setSelectedBrand(brand);
      } else {
        setSelectedBrand("Other");
        setCustomBrand(brand);
      }
    } else {
      setCustomerName(initialCustomerName);
      setCustomerPhone(initialCustomerPhone);
      setCustomerEmail("");
      
      // Reset brand
      setSelectedBrand("Apple");
      setCustomBrand("");
      
      // Reset new fields
      setDeviceColor("Black");
      setWarranty("30 Days");
      setIsPoweringOn(true);
      // Set estimated ready date to tomorrow by default
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setEstimatedReadyDate(tomorrow.toISOString().split('T')[0]);
    }
  }, [ticket, initialCustomerName, initialCustomerPhone]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalBrand = selectedBrand === "Other" ? customBrand.trim() : selectedBrand;
    
    if (!customerName.trim() || !customerPhone.trim() || !finalBrand || !mobileModel.trim()) {
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
      customerEmail: customerEmail.trim(),
      mobileBrand: finalBrand,
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
      isPriority,
      // New options
      deviceColor,
      warranty,
      isPoweringOn,
      estimatedReadyDate
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
            <div className="form-row split-3">
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
              <div className="form-group">
                <label>Customer Email (Optional)</label>
                <input 
                  type="email" 
                  value={customerEmail} 
                  onChange={(e) => setCustomerEmail(e.target.value)} 
                  className="form-input" 
                  placeholder="e.g. rahul@chandbrothers.com"
                />
              </div>
            </div>

            {/* Device Brand & Model Row */}
            <div className={`form-row ${selectedBrand === 'Other' ? 'split-3' : 'split-2'}`}>
              <div className="form-group">
                <label>Mobile Brand *</label>
                <select 
                  className="form-input form-select" 
                  value={selectedBrand} 
                  onChange={(e) => {
                    setSelectedBrand(e.target.value);
                    if (e.target.value !== "Other") {
                      setMobileBrand(e.target.value);
                    }
                  }}
                >
                  {BRANDS_LIST.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>

              {selectedBrand === "Other" && (
                <div className="form-group">
                  <label>Specify Brand Name *</label>
                  <input 
                    type="text" 
                    value={customBrand} 
                    onChange={(e) => setCustomBrand(e.target.value)} 
                    className="form-input" 
                    required 
                    placeholder="e.g. Realme, Techno, Nothing"
                  />
                </div>
              )}

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
            </div>

            {/* Device Identification & Appearance Row */}
            <div className="form-row split-3">
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
              <div className="form-group">
                <label>Device Color</label>
                <select 
                  className="form-input form-select" 
                  value={deviceColor} 
                  onChange={(e) => setDeviceColor(e.target.value)}
                >
                  {colors.map(col => <option key={col} value={col}>{col}</option>)}
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

            {/* Issue Category, Warranty, Power Status, and Ready Date */}
            <div className="form-row split-4">
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
                <label>Repair Warranty</label>
                <select 
                  className="form-input form-select" 
                  value={warranty} 
                  onChange={(e) => setWarranty(e.target.value)}
                >
                  {warranties.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Is Powering On?</label>
                <select 
                  className="form-input form-select" 
                  value={isPoweringOn ? "Yes" : "No"} 
                  onChange={(e) => setIsPoweringOn(e.target.value === "Yes")}
                >
                  <option value="Yes">Yes (Powering On)</option>
                  <option value="No">No (Dead / Water Damage)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Estimated Ready Date</label>
                <input 
                  type="date" 
                  value={estimatedReadyDate} 
                  onChange={(e) => setEstimatedReadyDate(e.target.value)} 
                  className="form-input" 
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
