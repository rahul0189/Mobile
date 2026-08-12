import React, { useState, useEffect } from 'react';
import { X, Smartphone, CreditCard, User, Tag, IndianRupee } from 'lucide-react';

export default function AddEditSimSaleDialog({
  sale,
  onSave,
  onDismiss
}) {
  const [customerName, setCustomerName] = useState("");
  const [allottedNumber, setAllottedNumber] = useState("");
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [operator, setOperator] = useState("Vi");
  const [planType, setPlanType] = useState("PREPAID");
  const [planAmount, setPlanAmount] = useState("");
  const [amountCollected, setAmountCollected] = useState("");
  const [notes, setNotes] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (sale) {
      setCustomerName(sale.customerName || "");
      setAllottedNumber(sale.allottedNumber || "");
      setAadhaarNumber(sale.aadhaarNumber || "");
      setOperator(sale.operator || "Jio");
      setPlanType(sale.planType || "PREPAID");
      setPlanAmount(sale.planAmount ? sale.planAmount.toString() : "");
      setAmountCollected(sale.amountCollected ? sale.amountCollected.toString() : "");
      setNotes(sale.notes || "");
    }
  }, [sale]);

  const handleAadhaarChange = (e) => {
    const rawVal = e.target.value.replace(/\D/g, "");
    const limited = rawVal.substring(0, 12);
    const parts = [];
    for (let i = 0; i < limited.length; i += 4) {
      parts.push(limited.substring(i, i + 4));
    }
    setAadhaarNumber(parts.join("-"));
  };

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, "");
    setAllottedNumber(val.substring(0, 10));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");

    const cleanAadhaar = aadhaarNumber.replace(/-/g, "");
    if (cleanAadhaar.length !== 12) {
      setErrorMsg("Aadhaar Number must be exactly 12 digits.");
      return;
    }

    if (allottedNumber.length !== 10) {
      setErrorMsg("Allotted Mobile Number must be exactly 10 digits.");
      return;
    }

    const planVal = parseFloat(planAmount) || 0;
    const collectedVal = parseFloat(amountCollected) || 0;

    const saleData = {
      id: sale ? sale.id : undefined,
      customerName: customerName.trim(),
      allottedNumber,
      aadhaarNumber,
      operator,
      planType,
      planAmount: planVal,
      amountCollected: collectedVal,
      notes: notes.trim(),
      dateCreatedMillis: sale ? sale.dateCreatedMillis : undefined
    };

    onSave(saleData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h2>{sale ? "Edit SIM Activation Record" : "Sell New SIM Card"}</h2>
          <button className="close-btn" onClick={onDismiss} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body dialog-form">
          {errorMsg && (
            <div className="alert alert-error" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="form-group">
            <label>Customer Name</label>
            <div className="input-with-icon">
              <User size={16} className="input-icon" />
              <input
                type="text"
                className="form-input"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Rahul Kumar"
                required
              />
            </div>
          </div>

          <div className="form-row split-2">
            <div className="form-group">
              <label>Allotted Mobile Number</label>
              <div className="input-with-icon">
                <Smartphone size={16} className="input-icon" />
                <input
                  type="tel"
                  className="form-input"
                  value={allottedNumber}
                  onChange={handlePhoneChange}
                  placeholder="10-digit number"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Aadhaar Card Number</label>
              <div className="input-with-icon">
                <CreditCard size={16} className="input-icon" />
                <input
                  type="text"
                  className="form-input"
                  value={aadhaarNumber}
                  onChange={handleAadhaarChange}
                  placeholder="0000-0000-0000"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-row split-2">
            <div className="form-group">
              <label>SIM Operator</label>
              <select
                className="form-input"
                value={operator}
                onChange={(e) => setOperator(e.target.value)}
                required
              >
                <option value="Vi">Vi (Vodafone Idea)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Plan Type</label>
              <div className="plan-type-toggles" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', height: '42px', alignItems: 'center' }}>
                <button
                  type="button"
                  className={`btn btn-sm ${planType === 'PREPAID' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setPlanType('PREPAID')}
                  style={{ height: '100%', margin: 0 }}
                >
                  Prepaid
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${planType === 'POSTPAID' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setPlanType('POSTPAID')}
                  style={{ height: '100%', margin: 0 }}
                >
                  Postpaid
                </button>
              </div>
            </div>
          </div>

          <div className="form-row split-2">
            <div className="form-group">
              <label>FRC / Recharge Plan (₹)</label>
              <div className="input-with-icon">
                <IndianRupee size={16} className="input-icon" />
                <input
                  type="number"
                  className="form-input"
                  value={planAmount}
                  onChange={(e) => {
                    setPlanAmount(e.target.value);
                    if (!amountCollected) setAmountCollected(e.target.value);
                  }}
                  placeholder="e.g. 299"
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Amount Collected (₹)</label>
              <div className="input-with-icon">
                <IndianRupee size={16} className="input-icon" />
                <input
                  type="number"
                  className="form-input"
                  value={amountCollected}
                  onChange={(e) => setAmountCollected(e.target.value)}
                  placeholder="e.g. 350"
                  min="0"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>SIM Serial / Remarks / Notes</label>
            <textarea
              className="form-input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. SIM Card Serial / ICCID or additional info..."
              rows="3"
            />
          </div>

          <div className="modal-footer" style={{ padding: '16px 0 0 0', borderTop: '1px solid var(--color-border)' }}>
            <button type="button" className="btn btn-secondary" onClick={onDismiss}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {sale ? "Update Record" : "Save Activation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
