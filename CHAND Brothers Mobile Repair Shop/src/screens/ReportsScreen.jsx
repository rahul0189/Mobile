import React, { useState } from 'react';
import { 
  Menu, TrendingUp, IndianRupee, PieChart, BarChart3, 
  ChevronRight, ArrowUpRight, ArrowDownRight, Package, DollarSign,
  Download, Printer, ChevronDown, FileSpreadsheet
} from 'lucide-react';
import { REPAIR_STATUSES } from '../state';

export default function ReportsScreen({
  tickets,
  products,
  onOpenDrawer
}) {
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  const handleExportCsv = () => {
    if (tickets.length === 0) {
      alert("No tickets available to export!");
      return;
    }
    
    // Headers
    const headers = [
      "Ticket Number", "Status", "Customer Name", "Customer Phone", "Customer Email",
      "Mobile Brand", "Mobile Model", "Color", "Serial/IMEI", "Power Status",
      "Passcode", "Issue Category", "Warranty", "Est. Ready Date", "Description",
      "Technician Notes", "Estimated Cost", "Advance Paid", "Parts Cost", "Labor Cost",
      "Date Created", "Date Updated"
    ];
    
    // Format rows
    const rows = tickets.map(t => [
      t.ticketNumber,
      t.status,
      t.customerName,
      t.customerPhone,
      t.customerEmail || "N/A",
      t.mobileBrand,
      t.mobileModel,
      t.color || "N/A",
      t.serialOrImei || "N/A",
      t.isPoweringOn ? "Powering On" : "Dead",
      t.customerPasscode || "None",
      t.issueCategory,
      t.warranty || "30 Days",
      t.estimatedReadyDate ? new Date(t.estimatedReadyDate).toISOString().split('T')[0] : "N/A",
      t.issueDescription ? t.issueDescription.replace(/"/g, '""') : "",
      (t.technicianNotes || "").replace(/"/g, '""'),
      t.estimatedCost,
      t.advancePaid,
      t.partsCost,
      t.laborCost,
      new Date(t.dateCreatedMillis).toISOString().split('T')[0],
      new Date(t.dateUpdatedMillis).toISOString().split('T')[0]
    ]);
    
    // Build CSV string
    const csvContent = [
      headers.join(","),
      ...rows.map(e => e.map(val => `"${val}"`).join(","))
    ].join("\n");
    
    // Trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Chand_Brothers_Tickets_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Revenue & Financial calculations
  // Delivered tickets + advances on active ones
  const totalRevenue = tickets.reduce((sum, t) => {
    if (t.status === 'DELIVERED') {
      const cost = t.estimatedCost > 0 ? t.estimatedCost : (t.partsCost + t.laborCost);
      return sum + cost;
    } else {
      return sum + t.advancePaid;
    }
  }, 0);

  // Total cost of parts used in delivered repairs
  const totalPartsCostDelivered = tickets
    .filter(t => t.status === 'DELIVERED')
    .reduce((sum, t) => sum + t.partsCost, 0);

  // Profit calculation (Labor cost or Total price - Parts cost)
  const estimatedProfit = tickets
    .filter(t => t.status === 'DELIVERED')
    .reduce((sum, t) => {
      const cost = t.estimatedCost > 0 ? t.estimatedCost : (t.partsCost + t.laborCost);
      return sum + (cost - t.partsCost);
    }, 0);

  // Pending receivables
  const pendingReceivables = tickets
    .filter(t => t.status !== 'DELIVERED' && t.status !== 'CANCELLED')
    .reduce((sum, t) => {
      const cost = t.estimatedCost > 0 ? t.estimatedCost : (t.partsCost + t.laborCost);
      const balance = cost - t.advancePaid;
      return sum + (balance > 0 ? balance : 0);
    }, 0);

  // Inventory financial evaluation
  const inventoryCostValue = products.reduce((sum, p) => sum + (p.costPrice * p.quantity), 0);
  const inventoryRetailValue = products.reduce((sum, p) => sum + (p.sellingPrice * p.quantity), 0);
  const projectedInventoryProfit = inventoryRetailValue - inventoryCostValue;

  // Chart 1: Tickets by Status (CSS Bar chart)
  const statusCounts = {};
  Object.keys(REPAIR_STATUSES).forEach(k => { statusCounts[k] = 0; });
  tickets.forEach(t => {
    if (statusCounts[t.status] !== undefined) {
      statusCounts[t.status]++;
    }
  });

  const maxStatusCount = Math.max(...Object.values(statusCounts), 1);

  // Chart 2: Top Mobile Brands Serviced
  const brandCounts = {};
  tickets.forEach(t => {
    const brand = t.mobileBrand.trim().toUpperCase();
    if (brand) {
      brandCounts[brand] = (brandCounts[brand] || 0) + 1;
    }
  });
  const sortedBrands = Object.entries(brandCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5); // top 5

  const maxBrandCount = Math.max(...sortedBrands.map(b => b[1]), 1);

  // Chart 3: Issue Category distribution
  const issueCounts = {};
  tickets.forEach(t => {
    if (t.issueCategory) {
      issueCounts[t.issueCategory] = (issueCounts[t.issueCategory] || 0) + 1;
    }
  });
  const sortedIssues = Object.entries(issueCounts)
    .sort((a, b) => b[1] - a[1]);

  // Chart 4: Parts vs Labor split
  const totalPartsCostAll = tickets.reduce((sum, t) => sum + t.partsCost, 0);
  const totalLaborCostAll = tickets.reduce((sum, t) => sum + t.laborCost, 0);
  const partsPercentage = totalPartsCostAll + totalLaborCostAll > 0 
    ? (totalPartsCostAll / (totalPartsCostAll + totalLaborCostAll)) * 100 
    : 50;

  return (
    <div className="reports-container">
      {/* Header Bar */}
      <header className="screen-header">
        <div className="header-left">
          <button className="menu-toggle-btn" onClick={onOpenDrawer} aria-label="Open Menu">
            <Menu size={24} />
          </button>
          <div>
            <h1>Reports & Analytics</h1>
            <p className="subtitle">Performance and Financial overview</p>
          </div>
        </div>

        <div className="header-actions hide-on-print" style={{ position: 'relative' }}>
          <button className="btn btn-primary" onClick={() => setShowExportDropdown(!showExportDropdown)}>
            <Download size={16} /> Export Report <ChevronDown size={14} style={{ marginLeft: '4px' }} />
          </button>
          
          {showExportDropdown && (
            <div className="export-dropdown-menu">
              <button className="dropdown-item" onClick={() => { handleExportCsv(); setShowExportDropdown(false); }}>
                <FileSpreadsheet size={16} className="text-cyan" /> Export Spreadsheet (CSV)
              </button>
              <button className="dropdown-item" onClick={() => { window.print(); setShowExportDropdown(false); }}>
                <Printer size={16} className="text-emerald" /> Print Shop Summary
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Financial Overview Metrics */}
      <div className="metrics-grid reports-financial-grid">
        <div className="metric-card bg-glass border-emerald-glow">
          <div className="metric-icon text-emerald">
            <IndianRupee size={24} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Delivered Revenue</span>
            <span className="metric-val">₹{totalRevenue.toLocaleString('en-IN')}</span>
            <span className="metric-subtext text-emerald"><ArrowUpRight size={14} /> Shop cash receipts</span>
          </div>
        </div>

        <div className="metric-card bg-glass border-cyan-glow">
          <div className="metric-icon text-cyan">
            <TrendingUp size={24} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Closed Job Profit</span>
            <span className="metric-val">₹{estimatedProfit.toLocaleString('en-IN')}</span>
            <span className="metric-subtext text-cyan">Excluding spare parts cost</span>
          </div>
        </div>

        <div className="metric-card bg-glass border-rose-glow">
          <div className="metric-icon text-rose">
            <IndianRupee size={24} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Outstanding Receivables</span>
            <span className="metric-val">₹{pendingReceivables.toLocaleString('en-IN')}</span>
            <span className="metric-subtext text-rose">Locked in active repairs</span>
          </div>
        </div>

        <div className="metric-card bg-glass border-indigo-glow">
          <div className="metric-icon text-indigo">
            <Package size={24} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Inventory Valuation</span>
            <span className="metric-val">₹{inventoryRetailValue.toLocaleString('en-IN')}</span>
            <span className="metric-subtext text-indigo">Cost value: ₹{inventoryCostValue.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts Grid */}
      <div className="charts-grid">
        
        {/* Chart 1: Status distribution */}
        <div className="chart-card card">
          <h3 className="chart-title">
            <PieChart size={18} className="text-cyan" /> Tickets by Repair Status
          </h3>
          <div className="status-chart-list">
            {Object.entries(REPAIR_STATUSES).map(([key, value]) => {
              const count = statusCounts[key];
              const percentage = tickets.length > 0 ? (count / tickets.length) * 100 : 0;
              
              return (
                <div key={key} className="status-chart-row">
                  <div className="row-info">
                    <span className="status-name">{value.displayName}</span>
                    <span className="status-count">{count} jobs</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div 
                      className="progress-bar-fill animate-width" 
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: value.badgeColor,
                        boxShadow: `0 0 8px ${value.badgeColor}40`
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Brands distribution */}
        <div className="chart-card card">
          <h3 className="chart-title">
            <BarChart3 size={18} className="text-indigo" /> Top Device Brands Serviced
          </h3>
          {sortedBrands.length === 0 ? (
            <p className="no-data-msg">No repair tickets in the database.</p>
          ) : (
            <div className="vertical-chart-list">
              {sortedBrands.map(([brand, count]) => {
                const percentage = (count / maxBrandCount) * 100;
                return (
                  <div key={brand} className="status-chart-row">
                    <div className="row-info">
                      <span className="status-name font-bold font-outfit">{brand}</span>
                      <span className="status-count">{count} tickets</span>
                    </div>
                    <div className="progress-bar-bg">
                      <div 
                        className="progress-bar-fill brand-color-bar animate-width" 
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: 'var(--color-indigo)',
                          boxShadow: '0 0 8px var(--color-indigo-glow)'
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Chart 3: Cost Split Breakdown */}
        <div className="chart-card card cost-split-card">
          <h3 className="chart-title">
            <TrendingUp size={18} className="text-emerald" /> Cost Distribution (Parts vs Labor)
          </h3>
          
          <div className="donut-chart-container">
            <div className="donut-chart-svg-wrap">
              <svg viewBox="0 0 100 100" className="donut-svg">
                {/* Background Ring */}
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--color-border)" strokeWidth="10" />
                {/* Parts Segment */}
                <circle 
                  cx="50" 
                  cy="50" 
                  r="40" 
                  fill="transparent" 
                  stroke="var(--color-rose)" 
                  strokeWidth="10" 
                  strokeDasharray={`${partsPercentage * 2.51} 251`}
                  strokeDashoffset="0"
                  transform="rotate(-90 50 50)"
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dasharray 1s ease-out' }}
                />
                {/* Center Hole Details */}
                <circle cx="50" cy="50" r="30" fill="var(--color-bg-card)" />
              </svg>
              <div className="donut-center-label">
                <span className="title">Billing</span>
                <span className="value">₹{(totalPartsCostAll + totalLaborCostAll).toFixed(0)}</span>
              </div>
            </div>
            
            <div className="donut-legend">
              <div className="legend-item">
                <span className="legend-dot bg-rose"></span>
                <div className="legend-details">
                  <span className="label">Spare Parts</span>
                  <span className="val">₹{totalPartsCostAll.toFixed(2)} ({partsPercentage.toFixed(0)}%)</span>
                </div>
              </div>
              <div className="legend-item">
                <span className="legend-dot bg-emerald"></span>
                <div className="legend-details">
                  <span className="label">Labor / Tech Fees</span>
                  <span className="val">₹{totalLaborCostAll.toFixed(2)} ({(100 - partsPercentage).toFixed(0)}%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chart 4: Failure Category list */}
        <div className="chart-card card">
          <h3 className="chart-title">
            <Package size={18} className="text-rose" /> Diagnostics Categories
          </h3>
          {sortedIssues.length === 0 ? (
            <p className="no-data-msg">No diagnostics data.</p>
          ) : (
            <div className="vertical-chart-list issue-category-list">
              {sortedIssues.map(([cat, count]) => {
                return (
                  <div key={cat} className="issue-category-row">
                    <span className="category-label">{cat}</span>
                    <span className="category-value">{count} repairs</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
