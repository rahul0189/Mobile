import React, { useState } from 'react';
import { 
  Menu, Smartphone, CreditCard, Search, Plus, 
  Trash2, Edit, Eye, EyeOff, Tag, IndianRupee, ShieldCheck
} from 'lucide-react';

export default function SimSalesScreen({
  sales,
  onOpenDrawer,
  onNewSaleClick,
  onEditSaleClick,
  onDeleteSaleClick
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOperator, setSelectedOperator] = useState("ALL");
  const [revealedAadhaars, setRevealedAadhaars] = useState([]);

  // Compute metrics
  const totalSold = sales.length;
  const jioCount = sales.filter(s => s.operator === 'Jio').length;
  const airtelCount = sales.filter(s => s.operator === 'Airtel').length;
  const totalRevenue = sales.reduce((sum, s) => sum + (s.amountCollected || 0), 0);

  // Toggle Aadhaar view
  const toggleAadhaarReveal = (id) => {
    if (revealedAadhaars.includes(id)) {
      setRevealedAadhaars(revealedAadhaars.filter(x => x !== id));
    } else {
      setRevealedAadhaars([...revealedAadhaars, id]);
    }
  };

  // Securely format Aadhaar
  const getMaskedAadhaar = (aadhaar, id) => {
    if (revealedAadhaars.includes(id)) return aadhaar;
    return "XXXX-XXXX-" + aadhaar.slice(-4);
  };

  // Format date helper
  const formatDate = (ms) => {
    if (!ms) return "N/A";
    return new Date(ms).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Filters and searches
  const filteredSales = sales.filter(s => {
    const term = searchQuery.toLowerCase().trim();
    const matchSearch = 
      s.customerName.toLowerCase().includes(term) ||
      s.allottedNumber.includes(term) ||
      s.aadhaarNumber.replace(/-/g, "").includes(term);

    const matchOperator = 
      selectedOperator === 'ALL' || 
      s.operator.toUpperCase() === selectedOperator.toUpperCase();

    return matchSearch && matchOperator;
  });

  return (
    <div className="reports-container sim-ledger-screen">
      {/* Header Bar */}
      <header className="screen-header">
        <div className="header-left">
          <button className="menu-toggle-btn" onClick={onOpenDrawer} aria-label="Open Menu">
            <Menu size={24} />
          </button>
          <div>
            <h1>SIM Card Activations</h1>
            <p className="subtitle">Allotted numbers and Aadhaar activation ledger</p>
          </div>
        </div>

        <div className="header-actions">
          <button className="btn btn-primary" onClick={onNewSaleClick}>
            <Plus size={16} /> Sell New SIM
          </button>
        </div>
      </header>

      {/* Metrics overview */}
      <div className="metrics-grid reports-financial-grid" style={{ marginBottom: '24px' }}>
        <div className="metric-card bg-glass border-indigo-glow">
          <div className="metric-icon text-indigo">
            <Smartphone size={24} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Total SIMs Sold</span>
            <span className="metric-val">{totalSold} Activations</span>
            <span className="metric-subtext text-indigo">All operators ledger</span>
          </div>
        </div>

        <div className="metric-card bg-glass" style={{ borderLeft: '4px solid #3b82f6' }}>
          <div className="metric-icon" style={{ color: '#3b82f6' }}>
            <ShieldCheck size={24} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Jio Activations</span>
            <span className="metric-val">{jioCount} SIMs</span>
            <span className="metric-subtext" style={{ color: '#3b82f6' }}>Reliance Jio Infocomm</span>
          </div>
        </div>

        <div className="metric-card bg-glass" style={{ borderLeft: '4px solid #ef4444' }}>
          <div className="metric-icon" style={{ color: '#ef4444' }}>
            <ShieldCheck size={24} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Airtel Activations</span>
            <span className="metric-val">{airtelCount} SIMs</span>
            <span className="metric-subtext" style={{ color: '#ef4444' }}>Bharti Airtel India</span>
          </div>
        </div>

        <div className="metric-card bg-glass border-emerald-glow">
          <div className="metric-icon text-emerald">
            <IndianRupee size={24} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Total FRC Collected</span>
            <span className="metric-val">₹{totalRevenue.toLocaleString('en-IN')}</span>
            <span className="metric-subtext text-emerald">Total sales revenue</span>
          </div>
        </div>
      </div>

      {/* Search & filters tools */}
      <div className="search-filter-card card" style={{ marginBottom: '20px' }}>
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by client name, allotted mobile number or Aadhaar card..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-tabs-container" style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['ALL', 'JIO', 'AIRTEL', 'VI', 'BSNL', 'OTHER'].map(op => (
            <button
              key={op}
              className={`filter-tab ${selectedOperator === op ? 'active' : ''}`}
              onClick={() => setSelectedOperator(op)}
            >
              {op}
            </button>
          ))}
        </div>
      </div>

      {/* Main ledger list */}
      <div className="tickets-list-wrapper">
        {filteredSales.length === 0 ? (
          <div className="empty-state card">
            <p>No SIM activation records match your search criteria.</p>
            <button className="btn btn-secondary" onClick={onNewSaleClick} style={{ marginTop: '12px' }}>
              <Plus size={14} /> Sell First SIM
            </button>
          </div>
        ) : (
          <div className="card table-responsive-wrapper" style={{ padding: 0, overflowX: 'auto' }}>
            <table className="inventory-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '16px' }}>Date</th>
                  <th style={{ padding: '16px' }}>Client</th>
                  <th style={{ padding: '16px' }}>Allotted Number</th>
                  <th style={{ padding: '16px' }}>Aadhaar Number</th>
                  <th style={{ padding: '16px' }}>Operator</th>
                  <th style={{ padding: '16px' }}>Plan / FRC</th>
                  <th style={{ padding: '16px' }}>Collected</th>
                  <th style={{ padding: '16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map((sale) => (
                  <tr key={sale.id} className="inventory-row-item" style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '16px', fontSize: '13px' }}>
                      {formatDate(sale.dateCreatedMillis)}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: 700, fontSize: '14px', color: '#fff' }}>{sale.customerName}</div>
                      {sale.notes && <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sale.notes}</div>}
                    </td>
                    <td style={{ padding: '16px', fontWeight: 800, color: 'var(--color-cyan)', fontSize: '14px', fontFamily: 'var(--font-family-title)' }}>
                      +91 {sale.allottedNumber}
                    </td>
                    <td style={{ padding: '16px', fontSize: '13px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}>{getMaskedAadhaar(sale.aadhaarNumber, sale.id)}</span>
                        <button 
                          className="action-btn text-muted" 
                          onClick={() => toggleAadhaarReveal(sale.id)}
                          style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer' }}
                          title="Toggle Aadhaar View"
                        >
                          {revealedAadhaars.includes(sale.id) ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span className={`operator-badge op-${sale.operator.toLowerCase()}`}>
                        {sale.operator} ({sale.planType})
                      </span>
                    </td>
                    <td style={{ padding: '16px', fontWeight: 600, color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                      ₹{sale.planAmount}
                    </td>
                    <td style={{ padding: '16px', fontWeight: 700, color: 'var(--color-emerald)', fontSize: '14px' }}>
                      ₹{sale.amountCollected}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button 
                          className="btn btn-secondary btn-icon-sm" 
                          onClick={() => onEditSaleClick(sale)}
                          style={{ padding: '6px' }}
                          aria-label="Edit Record"
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          className="btn btn-danger btn-icon-sm" 
                          onClick={() => onDeleteSaleClick(sale.id)}
                          style={{ padding: '6px' }}
                          aria-label="Delete Record"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
