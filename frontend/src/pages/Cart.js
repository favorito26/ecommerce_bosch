import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus } from 'lucide-react';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, cartTotal } = useCart();
  const navigate = useNavigate();

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center" data-testid="empty-cart">
        <div className="text-center">
          <h2 className="text-3xl font-bold font-heading text-bosch-navy mb-4">Your Cart is Empty</h2>
          <p className="text-slate-600 mb-8">Add some products to get started</p>
          <Link to="/products" className="btn-primary" data-testid="continue-shopping-button">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" data-testid="cart-page">
      <div className="container-custom py-12">
        <h1 className="text-4xl font-bold font-heading text-bosch-navy mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <div
                key={item.product_id}
                className="flex gap-4 p-4 border border-slate-200 rounded-sm"
                data-testid={`cart-item-${item.product_id}`}
              >
                <img
                  src={item.product?.images?.[0]}
                  alt={item.product?.name}
                  className="w-24 h-24 object-contain bg-bosch-surface rounded-sm"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">{item.product?.name}</h3>
                  <p className="text-slate-600 text-sm mb-3">{item.product?.category}</p>
                  <p className="text-bosch-red font-bold" data-testid={`item-price-${item.product_id}`}>
                    ₹{item.product?.price?.toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-col justify-between items-end">
                  <button
                    onClick={() => removeFromCart(item.product_id)}
                    className="text-slate-400 hover:text-red-600"
                    data-testid={`remove-item-${item.product_id}`}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <div className="flex items-center border border-slate-200 rounded-sm">
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                      className="p-2 hover:bg-slate-50"
                      data-testid={`decrease-qty-${item.product_id}`}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 border-x border-slate-200" data-testid={`quantity-${item.product_id}`}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                      className="p-2 hover:bg-slate-50"
                      data-testid={`increase-qty-${item.product_id}`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="bg-bosch-surface p-6 rounded-sm h-fit" data-testid="order-summary">
            <h2 className="text-2xl font-bold font-heading mb-6">Order Summary</h2>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-slate-600">Subtotal</span>
                <span className="font-semibold" data-testid="subtotal">₹{cartTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Shipping</span>
                <span className="font-semibold text-green-600">FREE</span>
              </div>
              <div className="border-t border-slate-200 pt-4">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-2xl font-bold text-bosch-navy" data-testid="total">
                    ₹{cartTotal.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate('/checkout')}
              className="w-full btn-primary"
              data-testid="proceed-checkout-button"
            >
              Proceed to Checkout
            </button>
            <Link to="/products" className="block text-center mt-4 text-sm text-bosch-red hover:underline">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;