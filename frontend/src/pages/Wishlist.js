import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Wishlist = () => {
  const { token } = useAuth();
  const { addToCart } = useCart();
  const [wishlist, setWishlist] = useState({ products: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const response = await axios.get(`${API}/wishlist`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlist(response.data);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      await axios.delete(`${API}/wishlist/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Removed from wishlist');
      fetchWishlist();
    } catch (error) {
      toast.error('Failed to remove from wishlist');
    }
  };

  const handleAddToCart = async (productId) => {
    await addToCart(productId);
    toast.success('Added to cart!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-bosch-red"></div>
      </div>
    );
  }

  if (wishlist.products.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center" data-testid="empty-wishlist">
        <div className="text-center">
          <h2 className="text-3xl font-bold font-heading text-bosch-navy mb-4">Your Wishlist is Empty</h2>
          <p className="text-slate-600 mb-8">Save your favorite products for later</p>
          <Link to="/products" className="btn-primary">Browse Products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" data-testid="wishlist-page">
      <div className="container-custom py-12">
        <h1 className="text-4xl font-bold font-heading text-bosch-navy mb-8">My Wishlist</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlist.products.map((product) => (
            <div key={product.id} className="border border-slate-200 rounded-sm overflow-hidden" data-testid={`wishlist-item-${product.id}`}>
              <Link to={`/products/${product.id}`}>
                <div className="aspect-square bg-bosch-surface p-8">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-contain"
                  />
                </div>
              </Link>
              <div className="p-4">
                <p className="caption-text mb-2">{product.category}</p>
                <h3 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-2">{product.name}</h3>
                <p className="text-2xl font-bold text-bosch-navy mb-4">₹{product.price.toLocaleString()}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddToCart(product.id)}
                    className="flex-1 btn-primary text-sm py-2"
                    data-testid={`add-to-cart-${product.id}`}
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => removeFromWishlist(product.id)}
                    className="btn-secondary p-2"
                    data-testid={`remove-${product.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;