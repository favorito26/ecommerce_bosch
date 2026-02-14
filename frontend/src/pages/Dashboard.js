import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Package, Heart, User } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'orders');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const changeTab = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-slate-100 text-slate-800';
  };

  return (
    <div className="min-h-screen bg-white" data-testid="dashboard-page">
      <div className="container-custom py-12">
        <h1 className="text-4xl font-bold font-heading text-bosch-navy mb-8">My Dashboard</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="bg-bosch-surface p-6 rounded-sm h-fit">
            <div className="space-y-2">
              <button
                onClick={() => changeTab('orders')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-sm transition-colors ${
                  activeTab === 'orders' ? 'bg-bosch-red text-white' : 'hover:bg-slate-100'
                }`}
                data-testid="orders-tab"
              >
                <Package className="w-5 h-5" />
                <span>My Orders</span>
              </button>
              <Link
                to="/wishlist"
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-sm hover:bg-slate-100"
                data-testid="wishlist-tab"
              >
                <Heart className="w-5 h-5" />
                <span>Wishlist</span>
              </Link>
              <button
                onClick={() => changeTab('profile')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-sm transition-colors ${
                  activeTab === 'profile' ? 'bg-bosch-red text-white' : 'hover:bg-slate-100'
                }`}
                data-testid="profile-tab"
              >
                <User className="w-5 h-5" />
                <span>Profile</span>
              </button>
            </div>
          </aside>

          {/* Content */}
          <div className="lg:col-span-3">
            {activeTab === 'orders' && (
              <div data-testid="orders-content">
                <h2 className="text-2xl font-bold font-heading mb-6">My Orders</h2>
                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-bosch-red"></div>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-slate-600 mb-4">No orders yet</p>
                    <Link to="/products" className="btn-primary">Start Shopping</Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="border border-slate-200 rounded-sm p-6" data-testid={`order-${order.id}`}>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="text-sm text-slate-600">Order ID: {order.id}</p>
                            <p className="text-sm text-slate-600">Placed on: {new Date(order.created_at).toLocaleDateString()}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.order_status)}`}>
                            {order.order_status}
                          </span>
                        </div>
                        <div className="space-y-2 mb-4">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span>{item.product_name} x {item.quantity}</span>
                              <span>₹{(item.price * item.quantity).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                        <div className="border-t border-slate-200 pt-4 flex justify-between items-center">
                          <span className="font-semibold">Total: ₹{order.total_amount.toLocaleString()}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${order.payment_status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            Payment: {order.payment_status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'profile' && (
              <div data-testid="profile-content">
                <h2 className="text-2xl font-bold font-heading mb-6">Profile Information</h2>
                <div className="bg-bosch-surface p-6 rounded-sm space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Name</label>
                    <p className="text-lg font-semibold">{user?.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
                    <p className="text-lg font-semibold">{user?.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Phone</label>
                    <p className="text-lg font-semibold">{user?.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Role</label>
                    <p className="text-lg font-semibold capitalize">{user?.role}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;