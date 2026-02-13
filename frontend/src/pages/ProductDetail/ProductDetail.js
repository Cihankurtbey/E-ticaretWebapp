import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../components/Toast/Toast';
import ProductCard from '../../components/ProductCard/ProductCard';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const [product, setProduct] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await productsAPI.getById(id);
        setProduct(response.data.product);
        setSimilar(response.data.similar);
        setQuantity(1);
      } catch (error) {
        console.error('Urun yuklenemedi:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      addToast('Sepete eklemek için giriş yapın', 'warning');
      return;
    }

    try {
      await addToCart(product.id, quantity);
      addToast(`${product.name} sepete eklendi!`, 'success');
    } catch (error) {
      addToast('Sepete eklenemedi', 'error');
    }
  };

  const discount = product?.old_price
    ? Math.round(((product.old_price - product.price) / product.old_price) * 100)
    : 0;

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= Math.floor(rating) ? 'star filled' : 'star empty'}>
          ★
        </span>
      );
    }
    return stars;
  };

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

  if (!product) {
    return (
      <div className="page">
        <div className="container">
          <div className="no-products">
            <h3>Ürün bulunamadı</h3>
            <Link to="/products" className="btn btn-primary" style={{marginTop: '16px', display: 'inline-flex'}}>
              Ürünlere Dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page product-detail-page">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/">Ana Sayfa</Link>
          <span>/</span>
          <Link to="/products">Ürünler</Link>
          <span>/</span>
          {product.category_name && (
            <>
              <Link to={`/products?category=${product.category_id}`}>{product.category_name}</Link>
              <span>/</span>
            </>
          )}
          <span className="current">{product.name}</span>
        </div>

        {/* Urun Detay */}
        <div className="product-detail">
          <div className="product-detail-image">
            <img src={product.image} alt={product.name} />
            {discount > 0 && (
              <span className="detail-badge">%{discount} İndirim</span>
            )}
          </div>

          <div className="product-detail-info">
            {product.category_name && (
              <span className="detail-category">{product.category_name}</span>
            )}
            <h1 className="detail-name">{product.name}</h1>

            <div className="detail-rating">
              <div className="stars">{renderStars(product.rating)}</div>
              <span className="rating-text">{product.rating} / 5</span>
              <span className="review-count">({product.review_count} değerlendirme)</span>
            </div>

            <div className="detail-price">
              <span className="price-current">{product.price.toLocaleString('tr-TR')} ₺</span>
              {product.old_price && (
                <>
                  <span className="price-old">{product.old_price.toLocaleString('tr-TR')} ₺</span>
                  <span className="price-discount">%{discount} indirim</span>
                </>
              )}
            </div>

            <p className="detail-description">{product.description}</p>

            <div className="detail-stock">
              {product.stock > 0 ? (
                <span className="in-stock">✓ Stokta ({product.stock} adet)</span>
              ) : (
                <span className="out-of-stock">✕ Stokta yok</span>
              )}
            </div>

            {product.stock > 0 && (
              <div className="detail-actions">
                <div className="quantity-selector">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
                  <span>{quantity}</span>
                  <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}>+</button>
                </div>
                <button className="btn btn-primary btn-lg add-to-cart-btn" onClick={handleAddToCart}>
                  🛒 Sepete Ekle
                </button>
              </div>
            )}

            <div className="detail-features">
              <div className="detail-feature">🚚 Ücretsiz Kargo</div>
              <div className="detail-feature">🔄 14 Gün İade</div>
              <div className="detail-feature">🔒 Güvenli Ödeme</div>
            </div>
          </div>
        </div>

        {/* Benzer Urunler */}
        {similar.length > 0 && (
          <section className="similar-products">
            <h2>Benzer Ürünler</h2>
            <div className="grid grid-4">
              {similar.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
