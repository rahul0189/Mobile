import React from 'react';
import { 
  Plus, Search, Menu, Package, AlertTriangle, 
  ChevronRight, Edit3, Trash2, ShieldAlert, ArrowUpDown,
  TrendingDown, DollarSign
} from 'lucide-react';

export default function ProductInventoryScreen({
  products,
  searchQuery,
  onSearchQueryChanged,
  selectedCategory,
  onCategorySelected,
  onOpenDrawer,
  onNewProductClick,
  onEditProductClick,
  onDeleteProductClick,
  onAdjustQuantity
}) {

  const categories = ["ALL", "Screen", "Battery", "Charger & Cable", "Accessory", "Spare Part"];

  // Filter products list
  const filteredProducts = products.filter(product => {
    // Filter by category
    if (selectedCategory !== 'ALL' && product.category !== selectedCategory) {
      return false;
    }
    // Search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchName = product.name.toLowerCase().includes(q);
      const matchSku = product.sku.toLowerCase().includes(q);
      return matchName || matchSku;
    }
    return true;
  });

  const lowStockProducts = products.filter(p => p.quantity <= p.lowStockThreshold);
  const totalStockValuation = products.reduce((sum, p) => sum + (p.sellingPrice * p.quantity), 0);
  const inventoryCostValue = products.reduce((sum, p) => sum + (p.costPrice * p.quantity), 0);

  return (
    <div className="inventory-container">
      {/* Header Bar */}
      <header className="screen-header">
        <div className="header-left">
          <button className="menu-toggle-btn" onClick={onOpenDrawer} aria-label="Open Menu">
            <Menu size={24} />
          </button>
          <div>
            <h1>Product Inventory</h1>
            <p className="subtitle">Stock and Spare Parts Catalog</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={onNewProductClick}>
            <Plus size={16} /> Add Product
          </button>
        </div>
      </header>

      {/* Overview stats */}
      <div className="metrics-grid inventory-metrics">
        <div className="metric-card bg-glass">
          <div className="metric-icon text-cyan">
            <Package size={24} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Total Unique Items</span>
            <span className="metric-val">{products.length}</span>
          </div>
        </div>

        <div className="metric-card bg-glass">
          <div className="metric-icon text-amber">
            <AlertTriangle size={24} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Low Stock Alerts</span>
            <span className="metric-val">{lowStockProducts.length}</span>
          </div>
        </div>

        <div className="metric-card bg-glass">
          <div className="metric-icon text-emerald">
            <DollarSign size={24} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Retail Value</span>
            <span className="metric-val">₹{totalStockValuation.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="filter-section card">
        <div className="search-bar-wrapper">
          <Search className="search-icon" size={20} />
          <input 
            type="text" 
            placeholder="Search by product name or SKU..." 
            value={searchQuery}
            onChange={(e) => onSearchQueryChanged(e.target.value)}
            className="form-input search-input"
          />
        </div>
        
        <div className="status-filter-tabs category-tabs">
          {categories.map(cat => {
            const count = cat === 'ALL' ? products.length : products.filter(p => p.category === cat).length;
            return (
              <button 
                key={cat} 
                className={`filter-tab ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => onCategorySelected(cat)}
              >
                {cat === 'ALL' ? 'All Items' : cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Catalog Table */}
      <div className="inventory-section card">
        <h2 className="section-title">Stock Catalog</h2>
        
        {filteredProducts.length === 0 ? (
          <div className="empty-state">
            <Package size={48} className="empty-icon" />
            <h3>No products found</h3>
            <p>Try refining your search terms or add a new spare part to stock.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Product & SKU</th>
                  <th>Category</th>
                  <th className="text-right">Cost Price</th>
                  <th className="text-right">Selling Price</th>
                  <th className="text-center">Stock Level</th>
                  <th className="text-right">Value (Retail)</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => {
                  const isLow = product.quantity <= product.lowStockThreshold;
                  
                  return (
                    <tr key={product.id} className={isLow ? 'row-low-stock' : ''}>
                      <td>
                        <div className="product-info-cell">
                          <span className="product-name">{product.name}</span>
                          <span className="product-sku">{product.sku}</span>
                        </div>
                      </td>
                      <td>
                        <span className="badge category-badge">{product.category}</span>
                      </td>
                      <td className="text-right text-muted">₹{product.costPrice.toFixed(2)}</td>
                      <td className="text-right text-cyan font-bold">₹{product.sellingPrice.toFixed(2)}</td>
                      <td>
                        <div className="stock-level-cell">
                          <div className="stock-adjust-group">
                            <button 
                              className="stock-adjust-btn minus" 
                              onClick={() => onAdjustQuantity(product.id, -1)}
                              aria-label="Decrease Stock"
                            >
                              -
                            </button>
                            <span className={`stock-qty ${isLow ? 'low' : ''}`}>
                              {product.quantity}
                            </span>
                            <button 
                              className="stock-adjust-btn plus" 
                              onClick={() => onAdjustQuantity(product.id, 1)}
                              aria-label="Increase Stock"
                            >
                              +
                            </button>
                          </div>
                          {isLow && (
                            <span className="low-stock-warning" title="Low Stock Warning">
                              <ShieldAlert size={14} /> Low
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="text-right font-outfit">₹{(product.sellingPrice * product.quantity).toFixed(2)}</td>
                      <td>
                        <div className="actions-cell">
                          <button 
                            className="btn btn-secondary btn-xs btn-icon-only" 
                            onClick={() => onEditProductClick(product)}
                            title="Edit"
                          >
                            <Edit3 size={12} />
                          </button>
                          <button 
                            className="btn btn-danger btn-xs btn-icon-only" 
                            onClick={() => {
                              if(confirm(`Delete ${product.name} from catalog?`)) {
                                onDeleteProductClick(product.id);
                              }
                            }}
                            title="Delete"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
