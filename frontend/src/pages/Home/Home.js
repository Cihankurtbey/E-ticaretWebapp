import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI } from '../../services/api';
import HeroBanner from '../../components/HeroBanner/HeroBanner';
import ProductCard from '../../components/ProductCard/ProductCard';
import './Home.css';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [saleProducts, setSaleProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          productsAPI.getCategories(),
          productsAPI.getAll({ limit: 20 })
        ]);

        setCategories(catRes.data);
        
        const allProducts = prodRes.data.products;
        setFeaturedProducts(allProducts.filter(p => p.rating >= 4.5).slice(0, 4));
        setSaleProducts(allProducts.filter(p => p.old_price).slice(0, 4));
      } catch (error) {
        console.error('Veri yuklenemedi:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <div className="loading-page">
            <div className="spinner"></div>
            <p>Yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page home-page">
      <div className="container">
        {/* Hero Banner */}
        <HeroBanner />

        {/* Kategoriler */}
        <section className="home-section">
          <div className="section-header">
            <h2>Kategoriler</h2>
            <Link to="/products" className="section-link">Tümünü Gör →</Link>
          </div>
          <div className="categories-grid">
            {categories.map(cat => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.id}`}
                className="category-card"
              >
                <div className="category-image">
                  <img src={cat.image} alt={cat.name} loading="lazy" />
                </div>
                <span className="category-name">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* One Cikan Urunler */}
        {featuredProducts.length > 0 && (
          <section className="home-section">
            <div className="section-header">
              <h2>⭐ Öne Çıkan Ürünler</h2>
              <Link to="/products?sort=rating" className="section-link">Tümünü Gör →</Link>
            </div>
            <div className="grid grid-4">
              {featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Indirimli Urunler */}
        {saleProducts.length > 0 && (
          <section className="home-section">
            <div className="section-header">
              <h2>🔥 İndirimli Ürünler</h2>
              <Link to="/products" className="section-link">Tümünü Gör →</Link>
            </div>
            <div className="grid grid-4">
              {saleProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Ozellikler */}
        <section className="home-features">
          <div className="feature-card">
            <span className="feature-icon">🚚</span>
            <h3>Ücretsiz Kargo</h3>
            <p>150₺ üzeri siparişlerde</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🔄</span>
            <h3>Kolay İade</h3>
            <p>14 gün içinde ücretsiz</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🔒</span>
            <h3>Güvenli Ödeme</h3>
            <p>256-bit SSL şifreleme</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">💬</span>
            <h3>7/24 Destek</h3>
            <p>Her zaman yanınızdayız</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
