import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { useRazorpay } from "react-razorpay";

import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const RAZORPAY_KEY_ID = "rzp_test_SFx00XcX4OrsR0";

const Checkout = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const { Razorpay } = useRazorpay();
  const [loading, setLoading] = useState(false);

  const [shippingAddress, setShippingAddress] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const handleInputChange = (e) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value,
    });
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!Razorpay) {
      toast.error("Razorpay SDK failed to load");
      return;
    }

    setLoading(true);

    try {
      // 1️⃣ Create Razorpay order
      const orderResponse = await axios.post(
        `${API}/payment/create-order`,
        { amount: cartTotal },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const options = {
        key: RAZORPAY_KEY_ID,
        amount: orderResponse.data.amount,
        currency: "INR",
        order_id: orderResponse.data.id,
        name: "Bosch Appliances",
        description: "Purchase of premium kitchen appliances",

        handler: async (response) => {
          try {
            // 2️⃣ Verify payment
            await axios.post(
              `${API}/payment/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            // 3️⃣ Create order in DB
            const orderItems = cart.items.map((item) => ({
              product_id: item.product_id,
              product_name: item.product.name,
              price: item.product.price,
              quantity: item.quantity,
            }));

            const orderData = {
              items: orderItems,
              total_amount: cartTotal,
              shipping_address: shippingAddress,
              razorpay_order_id: response.razorpay_order_id,
            };

            const orderCreateResponse = await axios.post(
              `${API}/orders`,
              orderData,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            // 4️⃣ Update payment status
            await axios.patch(
              `${API}/orders/${orderCreateResponse.data.id}/payment`,
              null,
              {
                params: {
                  payment_id: response.razorpay_payment_id,
                },
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            clearCart();
            toast.success("Order placed successfully!");
            navigate("/dashboard?tab=orders");
          } catch (err) {
            console.error(err);
            toast.error("Order processing failed");
          }
        },

        prefill: {
          name: shippingAddress.name,
          contact: shippingAddress.phone,
        },

        theme: {
          color: "#D50032",
        },
      };

      const rzp = new Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error(error);
      toast.error("Payment initialization failed");
    } finally {
      setLoading(false);
    }
  };

  // Redirect if cart empty
  if (!cart.items || cart.items.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container-custom py-12">
        <h1 className="text-4xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shipping Form */}
          <form onSubmit={handlePayment} className="lg:col-span-2 space-y-6">
            <div className="bg-bosch-surface p-6 rounded-sm">
              <h2 className="text-2xl font-bold mb-6">Shipping Address</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  name="name"
                  placeholder="Full Name"
                  value={shippingAddress.name}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />

                <input
                  name="phone"
                  placeholder="Phone"
                  value={shippingAddress.phone}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />

                <textarea
                  name="address"
                  placeholder="Address"
                  value={shippingAddress.address}
                  onChange={handleInputChange}
                  className="input-field md:col-span-2"
                  required
                />

                <input
                  name="city"
                  placeholder="City"
                  value={shippingAddress.city}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />

                <input
                  name="state"
                  placeholder="State"
                  value={shippingAddress.state}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />

                <input
                  name="pincode"
                  placeholder="Pincode"
                  value={shippingAddress.pincode}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? "Processing..." : "Place Order & Pay"}
            </button>
          </form>

          {/* Order Summary */}
          <div className="bg-bosch-surface p-6 rounded-sm h-fit">
            <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

            <div className="space-y-3">
              {cart.items.map((item) => (
                <div
                  key={item.product_id}
                  className="flex justify-between text-sm"
                >
                  <span>
                    {item.product.name} × {item.quantity}
                  </span>
                  <span className="font-semibold">
                    ₹{(item.product.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}

              <div className="border-t pt-4 flex justify-between font-bold">
                <span>Total</span>
                <span>₹{cartTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
