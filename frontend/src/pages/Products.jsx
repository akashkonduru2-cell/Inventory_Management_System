import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { StockBadge } from '../components/Badge';
import { ProductFormModal } from '../components/ProductFormModal';
import { StockActionModal } from '../components/StockActionModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Alert } from '../components/Alert';
import { formatCurrency } from '../utils/helpers';
import api from '../services/api';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  ArrowDownLeft,
  ArrowUpRight,
  Package,
  Layers,
  Truck
} from 'lucide-react';

export const Products = () => {
  const { canManageProducts, canDeleteProduct, canStockIn, canStockOut } = useAuth();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Modals state
  const [formModal, setFormModal] = useState({ isOpen: false, product: null });
  const [stockModal, setStockModal] = useState({ isOpen: false, product: null, type: 'IN' });
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, product: null });
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (selectedCategory) params.append('category_id', selectedCategory);
      if (selectedSupplier) params.append('supplier_id', selectedSupplier);
      if (selectedStatus) params.append('stock_status', selectedStatus);

      const [prodRes, catRes, supRes] = await Promise.all([
        api.get(`/products?${params.toString()}`),
        api.get('/categories'),
        api.get('/suppliers')
      ]);

      if (prodRes.data.success) setProducts(prodRes.data.data);
      if (catRes.data.success) setCategories(catRes.data.data);
      if (supRes.data.success) setSuppliers(supRes.data.data);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedSupplier, selectedStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.product) return;
    try {
      const res = await api.delete(`/products/${deleteDialog.product.id}`);
      if (res.data.success) {
        setFeedback({ type: 'success', message: 'Product deleted successfully' });
        setDeleteDialog({ isOpen: false, product: null });
        fetchProducts();
      }
    } catch (err) {
      setFeedback({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to delete product.'
      });
      setDeleteDialog({ isOpen: false, product: null });
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>Product Inventory Catalog</h2>
          <p style={{ color: '#64748b', fontSize: '13px', marginTop: '2px' }}>
            Manage SKU listings, pricing, live inventory quantities, and thresholds
          </p>
        </div>
        {canManageProducts && (
          <button
            onClick={() => setFormModal({ isOpen: true, product: null })}
            className="btn btn-primary"
          >
            <Plus size={16} />
            <span>Add New Product</span>
          </button>
        )}
      </div>

      {feedback.message && (
        <Alert
          type={feedback.type}
          message={feedback.message}
          onClose={() => setFeedback({ type: '', message: '' })}
        />
      )}

      {/* Filter Toolbar */}
      <div className="card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
        <form onSubmit={handleSearchSubmit} className="toolbar" style={{ margin: 0 }}>
          <div className="search-input-group">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by SKU, Product name, or description..."
              className="form-input search-input"
            />
          </div>

          <div className="filter-group">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="form-select"
              style={{ width: 'auto', minWidth: '150px' }}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="form-select"
              style={{ width: 'auto', minWidth: '150px' }}
            >
              <option value="">All Suppliers</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="form-select"
              style={{ width: 'auto', minWidth: '130px' }}
            >
              <option value="">All Statuses</option>
              <option value="IN_STOCK">In Stock</option>
              <option value="LOW_STOCK">Low Stock</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </select>

            <button type="submit" className="btn btn-secondary btn-sm">
              Apply Filter
            </button>

            {(search || selectedCategory || selectedSupplier || selectedStatus) && (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('');
                  setSelectedSupplier('');
                  setSelectedStatus('');
                }}
              >
                Reset
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Products Table */}
      <div className="table-container">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            Loading products...
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: '#64748b' }}>
            <Package size={40} color="#94a3b8" style={{ margin: '0 auto 12px auto', display: 'block' }} />
            <p style={{ fontWeight: 600, fontSize: '15px' }}>No products found</p>
            <p style={{ fontSize: '13px' }}>Try adjusting your search criteria or add a new product.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Product Name & Description</th>
                <th>Category</th>
                <th>Supplier</th>
                <th>Price (₹)</th>
                <th>Current Stock</th>
                <th>Min Alert</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>
                    <span className="sku-badge">{p.sku}</span>
                  </td>
                  <td style={{ maxWidth: '280px' }}>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{p.name}</div>
                    <div style={{ fontSize: '12px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p.description || 'No description provided'}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '13px', color: '#334155', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Layers size={13} color="#64748b" /> {p.category_name}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '13px', color: '#334155', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Truck size={13} color="#64748b" /> {p.supplier_name}
                    </span>
                  </td>
                  <td>
                    <strong>{formatCurrency(p.price)}</strong>
                  </td>
                  <td>
                    <strong style={{ fontSize: '14px', color: p.quantity <= p.minimum_stock ? '#d97706' : '#0f172a' }}>
                      {p.quantity}
                    </strong>
                  </td>
                  <td style={{ color: '#64748b' }}>{p.minimum_stock}</td>
                  <td>
                    <StockBadge quantity={p.quantity} minimumStock={p.minimum_stock} />
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                      {canStockIn && (
                        <button
                          className="btn btn-success btn-icon"
                          title="Stock IN (+)"
                          onClick={() => setStockModal({ isOpen: true, product: p, type: 'IN' })}
                        >
                          <ArrowUpRight size={14} />
                        </button>
                      )}
                      {canStockOut && (
                        <button
                          className="btn btn-danger btn-icon"
                          title="Stock OUT (-)"
                          onClick={() => setStockModal({ isOpen: true, product: p, type: 'OUT' })}
                        >
                          <ArrowDownLeft size={14} />
                        </button>
                      )}
                      {canManageProducts && (
                        <button
                          className="btn btn-secondary btn-icon"
                          title="Edit Product Details"
                          onClick={() => setFormModal({ isOpen: true, product: p })}
                        >
                          <Edit2 size={14} />
                        </button>
                      )}
                      {canDeleteProduct && (
                        <button
                          className="btn btn-outline btn-icon"
                          style={{ color: '#ef4444' }}
                          title="Delete Product"
                          onClick={() => setDeleteDialog({ isOpen: true, product: p })}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Product Form Modal (Add / Edit) */}
      {formModal.isOpen && (
        <ProductFormModal
          isOpen={formModal.isOpen}
          onClose={() => setFormModal({ isOpen: false, product: null })}
          product={formModal.product}
          onSuccess={(msg) => {
            setFeedback({ type: 'success', message: msg });
            fetchProducts();
          }}
        />
      )}

      {/* Stock IN/OUT Modal */}
      {stockModal.isOpen && (
        <StockActionModal
          isOpen={stockModal.isOpen}
          onClose={() => setStockModal({ isOpen: false, product: null, type: 'IN' })}
          product={stockModal.product}
          type={stockModal.type}
          onSuccess={(msg) => {
            setFeedback({ type: 'success', message: msg });
            fetchProducts();
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deleteDialog.isOpen && (
        <ConfirmDialog
          isOpen={deleteDialog.isOpen}
          onClose={() => setDeleteDialog({ isOpen: false, product: null })}
          onConfirm={handleDeleteConfirm}
          title={`Delete Product: ${deleteDialog.product?.sku}`}
          message={`Are you sure you want to permanently delete "${deleteDialog.product?.name}"? All associated transaction history will remain preserved.`}
        />
      )}
    </div>
  );
};
