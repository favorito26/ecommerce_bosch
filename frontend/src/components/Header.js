import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, User, Search, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Header = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${searchQuery}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="header-glass" data-testid="main-header">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3" data-testid="logo-link">
            <div className="text-2xl font-bold font-heading text-bosch-navy">BOSCH</div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/products" className="text-sm font-medium text-slate-700 hover:text-bosch-red transition-colors" data-testid="nav-products-link">Products</Link>
            <Link to="/products?category=ovens" className="text-sm font-medium text-slate-700 hover:text-bosch-red transition-colors" data-testid="nav-ovens-link">Ovens</Link>
            <Link to="/products?category=cooktops" className="text-sm font-medium text-slate-700 hover:text-bosch-red transition-colors" data-testid="nav-cooktops-link">Cooktops</Link>
            <Link to="/products?category=dishwashers" className="text-sm font-medium text-slate-700 hover:text-bosch-red transition-colors" data-testid="nav-dishwashers-link">Dishwashers</Link>
          </nav>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden lg:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-bosch-red"
                data-testid="search-input"
              />
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/wishlist" className="relative p-2 hover:text-bosch-red transition-colors" data-testid="wishlist-link">
                  <Heart className="w-5 h-5" />
                </Link>
                <Link to="/cart" className="relative p-2 hover:text-bosch-red transition-colors" data-testid="cart-link">
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-bosch-red text-white text-xs rounded-full w-5 h-5 flex items-center justify-center" data-testid="cart-count">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <div className="relative group">
                  <button className="flex items-center space-x-2 p-2 hover:text-bosch-red transition-colors" data-testid="user-menu-button">
                    <User className="w-5 h-5" />
                    <span className="hidden md:inline text-sm">{user.name}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-sm shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link to="/dashboard" className="block px-4 py-2 text-sm hover:bg-slate-50" data-testid="dashboard-link">Dashboard</Link>
                    {user.role === 'admin' && (
                      <Link to="/admin" className="block px-4 py-2 text-sm hover:bg-slate-50" data-testid="admin-link">Admin Panel</Link>
                    )}
                    <button onClick={logout} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50" data-testid="logout-button">Logout</button>
                  </div>
                </div>
              </>
            ) : (
              <Link to="/login" className="btn-primary" data-testid="login-link">Login</Link>
            )}
            <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} data-testid="mobile-menu-button">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200" data-testid="mobile-menu">
            <nav className="flex flex-col space-y-2">
              <Link to="/products" className="text-sm font-medium text-slate-700 hover:text-bosch-red py-2" data-testid="mobile-products-link">Products</Link>
              <Link to="/products?category=ovens" className="text-sm font-medium text-slate-700 hover:text-bosch-red py-2" data-testid="mobile-ovens-link">Ovens</Link>
              <Link to="/products?category=cooktops" className="text-sm font-medium text-slate-700 hover:text-bosch-red py-2" data-testid="mobile-cooktops-link">Cooktops</Link>
              <Link to="/products?category=dishwashers" className="text-sm font-medium text-slate-700 hover:text-bosch-red py-2" data-testid="mobile-dishwashers-link">Dishwashers</Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;