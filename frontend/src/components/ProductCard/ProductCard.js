import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../Toast/Toast';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { addToast } = useToast();

  const discount = product.old_price
    ? Math.round(((product.old_price - product.price) / product.old_price) * 100)
    : 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      addToast('Sepete eklemek için giriş yapın', 'warning');
      return;
    }

    try {
      await addToCart(product.id);
      addToast(`${product.name} sepete eklendi!`, 'success');
    } catch (error) {
      addToast('Sepete eklenemedi', 'error');
    }
  };

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

  return (
    <Link to={`/product/${product.id}`} className="product-card">
      <div className="product-card-image">
        <img src={product.image} alt={product.name} loading="lazy" />
        {discount > 0 && (
          <span className="product-card-badge">%{discount}</span>
        )}
        <button className="product-card-cart-btn" onClick={handleAddToCart}>
          🛒 Sepete Ekle
        </button>
      </div>
      <div className="product-card-info">
        {product.category_name && (
          <span className="product-card-category">{product.category_name}</span>
        )}
        <h3 className="product-card-name">{product.name}</h3>
        <div className="product-card-rating">
          <div className="stars">{renderStars(product.rating)}</div>
          <span className="review-count">({product.review_count})</span>
        </div>
        <div className="product-card-price">
          <span className="current-price">{product.price.toLocaleString('tr-TR')} ₺</span>
          {product.old_price && (
            <span className="old-price">{product.old_price.toLocaleString('tr-TR')} ₺</span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
