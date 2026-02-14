import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

const ProductCard = ({ product }) => {
  return (
    <Link to={`/products/${product.id}`} className="product-card" data-testid={`product-card-${product.id}`}>
      <div className="product-image-container">
        <img
          src={product.images[0]}
          alt={product.name}
          className="product-image"
        />
      </div>
      <div className="p-4">
        <p className="caption-text mb-2">{product.category}</p>
        <h3 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-2" data-testid="product-name">{product.name}</h3>
        <div className="flex items-center space-x-2 mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(product.ratings_avg)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-slate-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-slate-500">({product.ratings_count})</span>
        </div>
        <p className="text-2xl font-bold text-bosch-navy" data-testid="product-price">₹{product.price.toLocaleString()}</p>
        {product.stock > 0 ? (
          <p className="text-sm text-green-600 mt-2" data-testid="in-stock">In Stock</p>
        ) : (
          <p className="text-sm text-red-600 mt-2" data-testid="out-of-stock">Out of Stock</p>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;