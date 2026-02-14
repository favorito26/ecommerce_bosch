import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Package, ShoppingCart, Users, DollarSign, Plus, Edit, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Admin = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({});
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: 'ovens',
    images: [''],
    stock: '',
    specifications: {}
  });

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchStats();
  }, [user]);

  useEffect(() => {
    if (activeTab === 'products') fetchProducts();
    else if (activeTab === 'orders') fetchOrders();
    else if (activeTab === 'users') fetchUsers();
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/products`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        ...productForm,
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock),
        images: productForm.images.filter(img => img.trim() !== '')
      };

      if (editingProduct) {
        await axios.put(`${API}/products/${editingProduct.id}`, productData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Product updated successfully');
      } else {
        await axios.post(`${API}/products`, productData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Product created successfully');
      }

      setShowProductModal(false);
      setEditingProduct(null);
      resetProductForm();
      fetchProducts();
    } catch (error) {
      toast.error('Failed to save product');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await axios.delete(`${API}/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handleOrderStatusUpdate = async (orderId, status) => {
    try {
      await axios.patch(
        `${API}/admin/orders/${orderId}`,
        null,
        {
          params: { order_status: status },
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      toast.success('Order status updated');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      description: '',
      price: '',
      category: 'ovens',
      images: [''],
      stock: '',
      specifications: {}
    });
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      images: product.images,
      stock: product.stock.toString(),
      specifications: product.specifications
    });
    setShowProductModal(true);
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    resetProductForm();
    setShowProductModal(true);
  };

  if (user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-white" data-testid="admin-page">
      <div className="container-custom py-12">
        <h1 className="text-4xl font-bold font-heading text-bosch-navy mb-8">Admin Panel</h1>

        {/* Tabs */}
        <div className="flex space-x-4 mb-8 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'dashboard'
                ? 'text-bosch-red border-b-2 border-bosch-red'
                : 'text-slate-600 hover:text-bosch-red'
            }`}
            data-testid="dashboard-tab"
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'products'
                ? 'text-bosch-red border-b-2 border-bosch-red'
                : 'text-slate-600 hover:text-bosch-red'
            }`}
            data-testid="products-tab"
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'orders'
                ? 'text-bosch-red border-b-2 border-bosch-red'
                : 'text-slate-600 hover:text-bosch-red'
            }`}
            data-testid="orders-tab"
          >
            Orders
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'users'
                ? 'text-bosch-red border-b-2 border-bosch-red'
                : 'text-slate-600 hover:text-bosch-red'
            }`}
            data-testid="users-tab"
          >
            Users
          </button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div data-testid="dashboard-content">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-bosch-surface p-6 rounded-sm shadow-soft">
                <div className="flex items-center justify-between mb-4">
                  <Package className="w-8 h-8 text-bosch-red" />
                  <span className="text-3xl font-bold">{stats.total_products}</span>
                </div>
                <p className="text-slate-600">Total Products</p>
              </div>
              <div className="bg-bosch-surface p-6 rounded-sm shadow-soft">
                <div className="flex items-center justify-between mb-4">
                  <ShoppingCart className="w-8 h-8 text-bosch-red" />
                  <span className="text-3xl font-bold">{stats.total_orders}</span>
                </div>
                <p className="text-slate-600">Total Orders</p>
              </div>
              <div className="bg-bosch-surface p-6 rounded-sm shadow-soft">
                <div className="flex items-center justify-between mb-4">
                  <Users className="w-8 h-8 text-bosch-red" />
                  <span className="text-3xl font-bold">{stats.total_users}</span>
                </div>
                <p className="text-slate-600">Total Users</p>
              </div>
              <div className="bg-bosch-surface p-6 rounded-sm shadow-soft">
                <div className="flex items-center justify-between mb-4">
                  <DollarSign className="w-8 h-8 text-bosch-red" />
                  <span className="text-3xl font-bold">₹{stats.total_revenue?.toLocaleString()}</span>
                </div>
                <p className="text-slate-600">Total Revenue</p>
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div data-testid="products-content">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold font-heading">Products Management</h2>
              <button onClick={openCreateModal} className="btn-primary" data-testid="add-product-button">
                <Plus className="w-5 h-5 mr-2" />
                Add Product
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-bosch-red"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border border-slate-200">
                  <thead className="bg-bosch-surface">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Product</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Category</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Price</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Stock</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Rating</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="border-t border-slate-200" data-testid={`product-row-${product.id}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-3">
                            <img src={product.images[0]} alt="" className="w-12 h-12 object-contain bg-bosch-surface rounded" />
                            <span className="font-medium">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 capitalize">{product.category}</td>
                        <td className="px-4 py-3">₹{product.price.toLocaleString()}</td>
                        <td className="px-4 py-3">{product.stock}</td>
                        <td className="px-4 py-3">{product.ratings_avg.toFixed(1)} ({product.ratings_count})</td>
                        <td className="px-4 py-3">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openEditModal(product)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                              data-testid={`edit-product-${product.id}`}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded"
                              data-testid={`delete-product-${product.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
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
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div data-testid="orders-content">
            <h2 className="text-2xl font-bold font-heading mb-6">Orders Management</h2>
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-bosch-red"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border border-slate-200 rounded-sm p-6" data-testid={`order-row-${order.id}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="font-semibold">Order ID: {order.id}</p>
                        <p className="text-sm text-slate-600">{new Date(order.created_at).toLocaleString()}</p>
                        <p className="text-sm text-slate-600 mt-2">Total: ₹{order.total_amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <select
                          value={order.order_status}
                          onChange={(e) => handleOrderStatusUpdate(order.id, e.target.value)}
                          className="input-field"
                          data-testid={`order-status-${order.id}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                    <div className="border-t border-slate-200 pt-4">
                      <p className="text-sm font-medium mb-2">Items:</p>
                      {order.items.map((item, idx) => (
                        <p key={idx} className="text-sm text-slate-600">
                          {item.product_name} x {item.quantity} - ₹{(item.price * item.quantity).toLocaleString()}
                        </p>
                      ))}
                    </div>
                    <div className="border-t border-slate-200 pt-4 mt-4">
                      <p className="text-sm font-medium mb-1">Shipping Address:</p>
                      <p className="text-sm text-slate-600">
                        {order.shipping_address.name}, {order.shipping_address.phone}<br />
                        {order.shipping_address.address}<br />
                        {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div data-testid="users-content">
            <h2 className="text-2xl font-bold font-heading mb-6">Users Management</h2>
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-bosch-red"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border border-slate-200">
                  <thead className="bg-bosch-surface">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Phone</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Role</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-t border-slate-200" data-testid={`user-row-${user.id}`}>
                        <td className="px-4 py-3">{user.name}</td>
                        <td className="px-4 py-3">{user.email}</td>
                        <td className="px-4 py-3">{user.phone || 'N/A'}</td>
                        <td className="px-4 py-3 capitalize">{user.role}</td>
                        <td className="px-4 py-3">{new Date(user.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Product Modal */}
        {showProductModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" data-testid="product-modal">
            <div className="bg-white rounded-sm max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold font-heading">
                    {editingProduct ? 'Edit Product' : 'Add Product'}
                  </h3>
                  <button onClick={() => setShowProductModal(false)} data-testid="close-modal">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleProductSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Product Name</label>
                    <input
                      type="text"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      className="input-field"
                      required
                      data-testid="product-name-input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      className="input-field min-h-[100px]"
                      required
                      data-testid="product-description-input"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Price (₹)</label>
                      <input
                        type="number"
                        value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                        className="input-field"
                        required
                        data-testid="product-price-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Stock</label>
                      <input
                        type="number"
                        value={productForm.stock}
                        onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                        className="input-field"
                        required
                        data-testid="product-stock-input"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      className="input-field"
                      data-testid="product-category-input"
                    >
                      <option value="ovens">Built-in Ovens</option>
                      <option value="cooktops">Cooktops</option>
                      <option value="dishwashers">Dishwashers</option>
                      <option value="chimneys">Kitchen Chimneys</option>
                      <option value="hobs">Hobs</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Image URL</label>
                    <input
                      type="url"
                      value={productForm.images[0]}
                      onChange={(e) => setProductForm({ ...productForm, images: [e.target.value] })}
                      className="input-field"
                      required
                      data-testid="product-image-input"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button type="submit" className="flex-1 btn-primary" data-testid="save-product-button">
                      {editingProduct ? 'Update Product' : 'Create Product'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowProductModal(false)}
                      className="flex-1 btn-secondary"
                      data-testid="cancel-button"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
