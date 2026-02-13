import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setProfileDropdown(false);
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">◆</span>
          <span className="logo-text">SoftShop</span>
        </Link>

        {/* Search Bar */}
        <form className="navbar-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Ürün ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="search-btn">
            🔍
          </button>
        </form>

        {/* Nav Links */}
        <div className={`navbar-links ${mobileMenuOpen ? 'active' : ''}`}>
          <Link to="/products" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
            Ürünler
          </Link>

          <Link to="/cart" className="nav-link cart-link" onClick={() => setMobileMenuOpen(false)}>
            🛒
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>

          {isAuthenticated ? (
            <div className="profile-menu">
              <button
                className="profile-btn"
                onClick={() => setProfileDropdown(!profileDropdown)}
              >
                <span className="profile-avatar">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
                <span className="profile-name">{user?.name}</span>
              </button>
              {profileDropdown && (
                <div className="profile-dropdown">
                  <Link to="/profile" onClick={() => { setProfileDropdown(false); setMobileMenuOpen(false); }}>
                    👤 Profilim
                  </Link>
                  <Link to="/profile" onClick={() => { setProfileDropdown(false); setMobileMenuOpen(false); }}>
                    📦 Siparişlerim
                  </Link>
                  <button onClick={handleLogout}>
                    🚪 Çıkış Yap
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="nav-link login-link" onClick={() => setMobileMenuOpen(false)}>
              Giriş Yap
            </Link>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className={`hamburger ${mobileMenuOpen ? 'active' : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
