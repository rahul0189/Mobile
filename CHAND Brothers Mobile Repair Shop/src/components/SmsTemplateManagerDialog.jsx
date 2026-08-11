import React, { useState, useEffect } from 'react';
import { X, Save, MessageSquare, Info } from 'lucide-react';
import { REPAIR_STATUSES } from '../state';

export default function SmsTemplateManagerDialog({
  templates,
  onSaveTemplate,
  onDismiss
}) {
  const [activeTab, setActiveTab] = useState("RECEIVED");
  const [templateText, setTemplateText] = useState("");

  // Sync state with templates when active tab changes
  useEffect(() => {
    setTemplateText(templates[activeTab] || "");
  }, [activeTab, templates]);

  const handleSave = () => {
    onSaveTemplate(activeTab, templateText);
    alert(`Template for ${REPAIR_STATUSES[activeTab]?.displayName} successfully saved!`);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content sms-templates-modal">
        <div className="modal-header">
          <h2>
            <MessageSquare size={18} className="text-cyan" /> SMS Notification Templates
          </h2>
          <button className="close-btn" onClick={onDismiss} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body template-manager-body">
          {/* Left Column: Status Tabs */}
          <div className="template-sidebar-tabs">
            {Object.entries(REPAIR_STATUSES).map(([key, value]) => {
              return (
                <button 
                  key={key}
                  type="button" 
                  className={`template-tab-btn ${activeTab === key ? 'active' : ''}`}
                  onClick={() => setActiveTab(key)}
                  style={{ '--tab-color': value.badgeColor }}
                >
                  <span className="status-dot" style={{ backgroundColor: value.badgeColor }}></span>
                  {value.displayName}
                </button>
              );
            })}
          </div>

          {/* Right Column: Template Editor */}
          <div className="template-editor-content">
            <h3 className="editor-title">
              Editing: <span className="status-highlight" style={{ color: REPAIR_STATUSES[activeTab]?.badgeColor }}>{REPAIR_STATUSES[activeTab]?.displayName}</span> Template
            </h3>

            <div className="form-group">
              <label>Template Text Body</label>
              <textarea 
                value={templateText} 
                onChange={(e) => setTemplateText(e.target.value)} 
                className="form-input template-textarea" 
                rows={6}
                placeholder="Write SMS message text..."
              />
            </div>

            <button className="btn btn-primary" onClick={handleSave} style={{ width: '100%' }}>
              <Save size={16} /> Save This Template
            </button>

            <hr className="divider" style={{ margin: '16px 0' }} />

            {/* Placeholders Guide */}
            <div className="placeholders-guide-box">
              <div className="guide-header">
                <Info size={14} className="text-cyan" />
                <span>Available Dynamic Placeholders</span>
              </div>
              <ul className="placeholders-list">
                <li><code>{"{NAME}"}</code> - Customer's Full Name</li>
                <li><code>{"{MODEL}"}</code> - Device Model description</li>
                <li><code>{"{TICKET}"}</code> - Ticket Reference Code</li>
                <li><code>{"{STATUS}"}</code> - Current status name</li>
                <li><code>{"{ESTIMATED_COST}"}</code> - Estimated Repair quote</li>
                <li><code>{"{BALANCE_DUE}"}</code> - Remaining balance to be paid</li>
                <li><code>{"{TOTAL_COST}"}</code> - Repair parts + labor total cost</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onDismiss} style={{ width: '100%' }}>Close Template Manager</button>
        </div>
      </div>
    </div>
  );
}
