import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Logo & Aciklama */}
          <div className="footer-col footer-about">
            <Link to="/" className="footer-logo">
              <span className="logo-icon">◆</span>
              <span className="logo-text">SoftShop</span>
            </Link>
            <p>Türkiye'nin en modern online alışveriş platformu. Kaliteli ürünler, uygun fiyatlar ve hızlı teslimat.</p>
            <div className="footer-social">
              <a href="#!" aria-label="Facebook">📘</a>
              <a href="#!" aria-label="Twitter">🐦</a>
              <a href="#!" aria-label="Instagram">📷</a>
              <a href="#!" aria-label="YouTube">▶️</a>
            </div>
          </div>

          {/* Hizli Linkler */}
          <div className="footer-col">
            <h3>Hızlı Linkler</h3>
            <ul>
              <li><Link to="/">Ana Sayfa</Link></li>
              <li><Link to="/products">Tüm Ürünler</Link></li>
              <li><Link to="/cart">Sepetim</Link></li>
              <li><Link to="/profile">Hesabım</Link></li>
            </ul>
          </div>

          {/* Kategoriler */}
          <div className="footer-col">
            <h3>Kategoriler</h3>
            <ul>
              <li><Link to="/products?category=1">Elektronik</Link></li>
              <li><Link to="/products?category=2">Giyim</Link></li>
              <li><Link to="/products?category=3">Ev & Yaşam</Link></li>
              <li><Link to="/products?category=4">Spor & Outdoor</Link></li>
            </ul>
          </div>

          {/* Iletisim */}
          <div className="footer-col">
            <h3>İletişim</h3>
            <ul className="footer-contact">
              <li>📍 İstanbul, Türkiye</li>
              <li>📞 +90 545 658 34 02</li>
              <li>📧 Cihankurtbey@icloud.com</li>
              <li>🕐 7/24 Destek</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2026 SoftShop. Tüm hakları saklıdır.</p>
          <div className="footer-payments">
            <span>💳 Visa</span>
            <span>💳 Mastercard</span>
            <span>💳 Troy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
