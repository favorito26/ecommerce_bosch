import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [] });
  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      fetchCart();
    }
  }, [token]);

  const fetchCart = async () => {
    if (!token) return;
    try {
      const response = await axios.get(`${API}/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCart(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    if (!token) {
      alert('Please login to add items to cart');
      return;
    }

    const existingItem = cart.items.find(item => item.product_id === productId);
    let newItems;

    if (existingItem) {
      newItems = cart.items.map(item =>
        item.product_id === productId
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      newItems = [...cart.items, { product_id: productId, quantity }];
    }

    try {
      await axios.post(
        `${API}/cart`,
        { items: newItems.map(item => ({ product_id: item.product_id, quantity: item.quantity })) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchCart();
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      return removeFromCart(productId);
    }

    const newItems = cart.items.map(item =>
      item.product_id === productId ? { ...item, quantity } : item
    );

    try {
      await axios.post(
        `${API}/cart`,
        { items: newItems.map(item => ({ product_id: item.product_id, quantity: item.quantity })) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchCart();
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  };

  const removeFromCart = async (productId) => {
    const newItems = cart.items.filter(item => item.product_id !== productId);

    try {
      await axios.post(
        `${API}/cart`,
        { items: newItems.map(item => ({ product_id: item.product_id, quantity: item.quantity })) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchCart();
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const clearCart = () => {
    setCart({ items: [] });
  };

  const cartTotal = cart.items.reduce((total, item) => {
    return total + (item.product?.price || 0) * item.quantity;
  }, 0);

  const cartCount = cart.items.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeFromCart, clearCart, fetchCart, cartTotal, cartCount }}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;