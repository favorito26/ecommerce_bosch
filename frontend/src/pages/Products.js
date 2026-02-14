import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { SlidersHorizontal, X } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
    minPrice: '',
    maxPrice: '',
    minRating: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [searchParams]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.category) params.category = filters.category;
      if (filters.search) params.search = filters.search;
      if (filters.minPrice) params.min_price = filters.minPrice;
      if (filters.maxPrice) params.max_price = filters.maxPrice;
      if (filters.minRating) params.min_rating = filters.minRating;

      const response = await axios.get(`${API}/products`, { params });
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const applyFilters = () => {
    const params = {};
    if (filters.category) params.category = filters.category;
    if (filters.search) params.search = filters.search;
    setSearchParams(params);
    fetchProducts();
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      search: '',
      minPrice: '',
      maxPrice: '',
      minRating: ''
    });
    setSearchParams({});
    fetchProducts();
  };

  return (
    <div className="min-h-screen bg-white" data-testid="products-page">
      <div className="container-custom py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold font-heading text-bosch-navy mb-2">Products</h1>
            <p className="text-slate-600">{products.length} products found</p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden btn-secondary"
            data-testid="toggle-filters-button"
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filters
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside
            className={`lg:block ${
              showFilters ? 'block' : 'hidden'
            } bg-bosch-surface p-6 rounded-sm h-fit`}
            data-testid="filters-sidebar"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading font-semibold text-lg">Filters</h3>
              <button onClick={() => setShowFilters(false)} className="lg:hidden">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="input-field"
                  data-testid="category-filter"
                >
                  <option value="">All Categories</option>
                  <option value="ovens">Built-in Ovens</option>
                  <option value="cooktops">Cooktops</option>
                  <option value="dishwashers">Dishwashers</option>
                  <option value="chimneys">Kitchen Chimneys</option>
                  <option value="hobs">Hobs</option>
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Price Range</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="input-field"
                    data-testid="min-price-filter"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="input-field"
                    data-testid="max-price-filter"
                  />
                </div>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Minimum Rating</label>
                <select
                  value={filters.minRating}
                  onChange={(e) => handleFilterChange('minRating', e.target.value)}
                  className="input-field"
                  data-testid="rating-filter"
                >
                  <option value="">Any Rating</option>
                  <option value="4">4 Stars & Above</option>
                  <option value="3">3 Stars & Above</option>
                  <option value="2">2 Stars & Above</option>
                </select>
              </div>

              <div className="space-y-3">
                <button onClick={applyFilters} className="w-full btn-primary" data-testid="apply-filters-button">
                  Apply Filters
                </button>
                <button onClick={clearFilters} className="w-full btn-secondary" data-testid="clear-filters-button">
                  Clear All
                </button>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-bosch-red"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-600">No products found matching your criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;