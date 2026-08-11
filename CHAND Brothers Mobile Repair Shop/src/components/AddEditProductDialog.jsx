import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

export default function AddEditProductDialog({
  product,
  onSave,
  onDismiss
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Screen");
  const [sku, setSku] = useState("");
  const [sellingPrice, setSellingPrice] = useState(0.0);
  const [costPrice, setCostPrice] = useState(0.0);
  const [quantity, setQuantity] = useState(0);
  const [lowStockThreshold, setLowStockThreshold] = useState(5);
  const [description, setDescription] = useState("");

  const categories = ["Screen", "Battery", "Charger & Cable", "Accessory", "Spare Part"];

  useEffect(() => {
    if (product) {
      setName(product.name || "");
      setCategory(product.category || "Screen");
      setSku(product.sku || "");
      setSellingPrice(product.sellingPrice || 0.0);
      setCostPrice(product.costPrice || 0.0);
      setQuantity(product.quantity || 0);
      setLowStockThreshold(product.lowStockThreshold || 5);
      setDescription(product.description || "");
    }
  }, [product]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !sku.trim()) {
      alert("Please fill in Name and SKU fields!");
      return;
    }

    onSave({
      id: product?.id,
      name: name.trim(),
      category,
      sku: sku.trim().toUpperCase(),
      sellingPrice: Number(sellingPrice) || 0.0,
      costPrice: Number(costPrice) || 0.0,
      quantity: Number(quantity) || 0,
      lowStockThreshold: Number(lowStockThreshold) || 5,
      description: description.trim(),
      dateUpdatedMillis: Date.now()
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content product-dialog-modal">
        <div className="modal-header">
          <h2>{product ? `Edit Product: ${product.sku}` : "Add New Stock Product"}</h2>
          <button className="close-btn" onClick={onDismiss} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            
            <div className="form-group">
              <label>Product Name *</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="form-input" 
                required 
                placeholder="e.g. iPhone 13 Pro Original Battery (3095 mAh)"
              />
            </div>

            <div className="form-row split-2">
              <div className="form-group">
                <label>SKU / barcode *</label>
                <input 
                  type="text" 
                  value={sku} 
                  onChange={(e) => setSku(e.target.value)} 
                  className="form-input" 
                  required 
                  placeholder="e.g. BAT-APL-IP13P"
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select 
                  className="form-input form-select" 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row split-2">
              <div className="form-group">
                <label>Cost Price (₹) *</label>
                <input 
                  type="number" 
                  value={costPrice} 
                  onChange={(e) => setCostPrice(Math.max(0, parseFloat(e.target.value) || 0))} 
                  className="form-input" 
                  required 
                  step="0.01" 
                  placeholder="Technician purchase cost"
                />
              </div>
              <div className="form-group">
                <label>Selling Price (₹) *</label>
                <input 
                  type="number" 
                  value={sellingPrice} 
                  onChange={(e) => setSellingPrice(Math.max(0, parseFloat(e.target.value) || 0))} 
                  className="form-input" 
                  required 
                  step="0.01" 
                  placeholder="Customer retail price"
                />
              </div>
            </div>

            <div className="form-row split-2">
              <div className="form-group">
                <label>Starting Stock Qty *</label>
                <input 
                  type="number" 
                  value={quantity} 
                  onChange={(e) => setQuantity(Math.max(0, parseInt(e.target.value) || 0))} 
                  className="form-input" 
                  required 
                  placeholder="Available quantity"
                />
              </div>
              <div className="form-group">
                <label>Low Stock Warning Level</label>
                <input 
                  type="number" 
                  value={lowStockThreshold} 
                  onChange={(e) => setLowStockThreshold(Math.max(0, parseInt(e.target.value) || 0))} 
                  className="form-input" 
                  placeholder="Alert threshold level"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Description (Optional)</label>
              <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                className="form-input" 
                rows={3} 
                placeholder="Product description, supplier contacts, quality grades..."
              />
            </div>

          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onDismiss}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              <Save size={16} /> Save Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
