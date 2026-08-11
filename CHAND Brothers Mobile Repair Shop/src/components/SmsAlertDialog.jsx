import React, { useState } from 'react';
import { X, Copy, Check, Send, MessageSquare } from 'lucide-react';

export default function SmsAlertDialog({
  ticket,
  initialMessage,
  onDismiss
}) {
  const [copied, setCopied] = useState(false);
  const [msgBody, setMsgBody] = useState(initialMessage);

  const handleCopy = () => {
    navigator.clipboard.writeText(msgBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendSms = () => {
    // Open native SMS client
    const encodedBody = encodeURIComponent(msgBody);
    const smsUrl = `sms:${ticket.customerPhone}?body=${encodedBody}`;
    
    // Check if web sharing is available (useful on mobile chrome browsers)
    if (navigator.share) {
      navigator.share({
        title: `SMS for Ticket ${ticket.ticketNumber}`,
        text: msgBody
      }).catch(err => {
        // Fallback to sms URI
        window.location.href = smsUrl;
      });
    } else {
      window.location.href = smsUrl;
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content sms-dialog-modal">
        <div className="modal-header">
          <h2>
            <MessageSquare size={18} className="text-cyan" /> SMS Status Notification
          </h2>
          <button className="close-btn" onClick={onDismiss} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          <div className="sms-details-box">
            <div className="recipient-row">
              <span className="label">Send to:</span>
              <span className="value font-bold">{ticket.customerName} ({ticket.customerPhone})</span>
            </div>
            <div className="ticket-ref-row">
              <span className="label">Ticket Reference:</span>
              <span className="value badge category-badge">{ticket.ticketNumber}</span>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '16px' }}>
            <label>Message Content</label>
            <textarea 
              value={msgBody} 
              onChange={(e) => setMsgBody(e.target.value)} 
              className="form-input sms-body-textarea" 
              rows={5}
            />
          </div>

          <div className="sms-tips-box">
            <p>💡 Tip: Placeholders like <code>{"{NAME}"}</code> and <code>{"{MODEL}"}</code> have been populated. You can edit this text freely before sending.</p>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onDismiss}>Close</button>
          
          <button type="button" className="btn btn-secondary" onClick={handleCopy}>
            {copied ? (
              <>
                <Check size={16} className="text-emerald" /> Copied!
              </>
            ) : (
              <>
                <Copy size={16} /> Copy to Clipboard
              </>
            )}
          </button>

          <button type="button" className="btn btn-primary" onClick={handleSendSms}>
            <Send size={16} /> Send SMS
          </button>
        </div>
      </div>
    </div>
  );
}
