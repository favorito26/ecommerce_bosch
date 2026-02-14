import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'sonner';
import useRazorpay from 'react-razorpay';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const RAZORPAY_KEY_ID = 'rzp_test_SFx00XcX4OrsR0';

const Checkout = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [Razorpay] = useRazorpay();
  const [loading, setLoading] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  const handleInputChange = (e) => {
    setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create Razorpay order
      const orderResponse = await axios.post(
        `${API}/payment/create-order`,
        { amount: cartTotal },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const options = {
        key: RAZORPAY_KEY_ID,
        amount: orderResponse.data.amount,
        currency: 'INR',
        order_id: orderResponse.data.id,
        name: 'Bosch Appliances',
        description: 'Purchase of premium kitchen appliances',
        handler: async (response) => {
          try {
            // Verify payment
            await axios.post(
              `${API}/payment/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            // Create order
            const orderItems = cart.items.map(item => ({
              product_id: item.product_id,
              product_name: item.product.name,
              price: item.product.price,
              quantity: item.quantity
            }));

            const orderData = {
              items: orderItems,
              total_amount: cartTotal,
              shipping_address: shippingAddress,
              razorpay_order_id: response.razorpay_order_id
            };

            const orderCreateResponse = await axios.post(
              `${API}/orders`,
              orderData,
              { headers: { Authorization: `Bearer ${token}` } }
            );

            // Update payment status
            await axios.patch(
              `${API}/orders/${orderCreateResponse.data.id}/payment`,
              null,
              {
                params: { payment_id: response.razorpay_payment_id },
                headers: { Authorization: `Bearer ${token}` }
              }
            );

            clearCart();
            toast.success('Order placed successfully!');
            navigate('/dashboard?tab=orders');
          } catch (error) {
            toast.error('Order creation failed');
          }
        },
        prefill: {
          name: shippingAddress.name,
          contact: shippingAddress.phone
        },
        theme: {
          color: '#D50032'
        }
      };

      const razorpayInstance = new Razorpay(options);
      razorpayInstance.open();
    } catch (error) {
      toast.error('Payment initialization failed');
    } finally {
      setLoading(false);
    }
  };

  if (cart.items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-white" data-testid="checkout-page">
      <div className="container-custom py-12">
        <h1 className="text-4xl font-bold font-heading text-bosch-navy mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shipping Form */}
          <form onSubmit={handlePayment} className="lg:col-span-2 space-y-6">
            <div className="bg-bosch-surface p-6 rounded-sm">
              <h2 className="text-2xl font-bold font-heading mb-6">Shipping Address</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={shippingAddress.name}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                    data-testid="shipping-name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={shippingAddress.phone}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                    data-testid="shipping-phone"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Address</label>
                  <textarea
                    name="address"
                    value={shippingAddress.address}
                    onChange={handleInputChange}
                    className="input-field min-h-[80px]"
                    required
                    data-testid="shipping-address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">City</label>
                  <input
                    type="text"
                    name="city"
                    value={shippingAddress.city}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                    data-testid="shipping-city"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">State</label>
                  <input
                    type="text"
                    name="state"
                    value={shippingAddress.state}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                    data-testid="shipping-state"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    value={shippingAddress.pincode}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                    data-testid="shipping-pincode"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary"
              data-testid="place-order-button"
            >
              {loading ? 'Processing...' : 'Place Order & Pay'}
            </button>
          </form>

          {/* Order Summary */}
          <div className="bg-bosch-surface p-6 rounded-sm h-fit">
            <h2 className="text-2xl font-bold font-heading mb-6">Order Summary</h2>
            <div className="space-y-4 mb-6">
              {cart.items.map((item) => (
                <div key={item.product_id} className="flex justify-between text-sm">
                  <span className="text-slate-600">
                    {item.product.name} x {item.quantity}
                  </span>
                  <span className="font-semibold">
                    ₹{(item.product.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
              <div className="border-t border-slate-200 pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-semibold">₹{cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Shipping</span>
                  <span className="font-semibold text-green-600">FREE</span>
                </div>
                <div className="border-t border-slate-200 pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-2xl font-bold text-bosch-navy" data-testid="checkout-total">
                      ₹{cartTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;