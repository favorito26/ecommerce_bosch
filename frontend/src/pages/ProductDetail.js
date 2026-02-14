import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Star, ShoppingCart, Heart, Minus, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ProductDetail = () => {
  const { id } = useParams();
  const { user, token } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [wishlistAdded, setWishlistAdded] = useState(false);

  useEffect(() => {
    fetchProduct();
    fetchReviews();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${API}/products/${id}`);
      setProduct(response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${API}/reviews/${id}`);
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleAddToCart = async () => {
    await addToCart(id, quantity);
    toast.success('Added to cart!');
  };

  const handleAddToWishlist = async () => {
    if (!token) {
      toast.error('Please login to add to wishlist');
      return;
    }
    try {
      await axios.post(`${API}/wishlist/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlistAdded(true);
      toast.success('Added to wishlist!');
    } catch (error) {
      toast.error('Failed to add to wishlist');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error('Please login to submit a review');
      return;
    }
    try {
      await axios.post(
        `${API}/reviews`,
        { product_id: id, ...newReview },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Review submitted!');
      setNewReview({ rating: 5, comment: '' });
      fetchReviews();
      fetchProduct();
    } catch (error) {
      toast.error('Failed to submit review');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-bosch-red"></div>
      </div>
    );
  }

  if (!product) {
    return <div className="min-h-screen flex items-center justify-center">Product not found</div>;
  }

  return (
    <div className="min-h-screen bg-white" data-testid="product-detail-page">
      <div className="container-custom py-12">
        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Images */}
          <div>
            <div className="aspect-square bg-bosch-surface rounded-sm overflow-hidden mb-4">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-contain p-8"
                data-testid="main-product-image"
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`aspect-square bg-bosch-surface rounded-sm overflow-hidden border-2 ${
                    selectedImage === idx ? 'border-bosch-red' : 'border-transparent'
                  }`}
                  data-testid={`thumbnail-${idx}`}
                >
                  <img src={img} alt="" className="w-full h-full object-contain p-2" />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div>
            <p className="caption-text text-bosch-red mb-2">{product.category}</p>
            <h1 className="text-4xl font-bold font-heading text-bosch-navy mb-4" data-testid="product-title">{product.name}</h1>
            
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.ratings_avg)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-slate-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-slate-600">({product.ratings_count} reviews)</span>
            </div>

            <p className="text-4xl font-bold text-bosch-navy mb-6" data-testid="product-price">₹{product.price.toLocaleString()}</p>

            <p className="body-text mb-8">{product.description}</p>

            {/* Specifications */}
            <div className="bg-bosch-surface p-6 rounded-sm mb-8">
              <h3 className="font-heading font-semibold text-lg mb-4">Specifications</h3>
              <div className="space-y-2">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-slate-600">{key}:</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quantity & Actions */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium">Quantity:</label>
                <div className="flex items-center border border-slate-200 rounded-sm">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-slate-50"
                    data-testid="decrease-quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 border-x border-slate-200" data-testid="quantity-display">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-slate-50"
                    data-testid="increase-quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1 btn-primary"
                  data-testid="add-to-cart-button"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
                <button
                  onClick={handleAddToWishlist}
                  disabled={wishlistAdded}
                  className="btn-secondary"
                  data-testid="add-to-wishlist-button"
                >
                  <Heart className={`w-5 h-5 ${wishlistAdded ? 'fill-bosch-red text-bosch-red' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="border-t border-slate-200 pt-16">
          <h2 className="text-3xl font-bold font-heading text-bosch-navy mb-8">Customer Reviews</h2>

          {/* Review Form */}
          {user && (
            <form onSubmit={handleSubmitReview} className="bg-bosch-surface p-6 rounded-sm mb-8">
              <h3 className="font-heading font-semibold mb-4">Write a Review</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReview({ ...newReview, rating: star })}
                        data-testid={`rating-star-${star}`}
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= newReview.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Comment</label>
                  <textarea
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    className="input-field min-h-[100px]"
                    required
                    data-testid="review-comment"
                  />
                </div>
                <button type="submit" className="btn-primary" data-testid="submit-review-button">
                  Submit Review
                </button>
              </div>
            </form>
          )}

          {/* Reviews List */}
          <div className="space-y-6">
            {reviews.length === 0 ? (
              <p className="text-slate-600 text-center py-8">No reviews yet. Be the first to review!</p>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="border-b border-slate-200 pb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{review.user_name}</span>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm">{review.comment}</p>
                  <p className="text-xs text-slate-400 mt-2">
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;