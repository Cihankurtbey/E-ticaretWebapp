import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../components/Toast/Toast';
import './Cart.css';

const Cart = () => {
  const { isAuthenticated } = useAuth();
  const { cartItems, cartTotal, updateQuantity, removeFromCart, loading } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <div className="page">
        <div className="container">
          <div className="cart-empty">
            <span className="cart-empty-icon">🛒</span>
            <h2>Sepetinizi görüntülemek için giriş yapın</h2>
            <p>Ürünleri sepete eklemek için önce giriş yapmalısınız.</p>
            <Link to="/login" className="btn btn-primary btn-lg">Giriş Yap</Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <div className="loading-page">
            <div className="spinner"></div>
            <p>Sepet yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="page">
        <div className="container">
          <div className="cart-empty">
            <span className="cart-empty-icon">🛒</span>
            <h2>Sepetiniz boş</h2>
            <p>Henüz sepetinize ürün eklememişsiniz.</p>
            <Link to="/products" className="btn btn-primary btn-lg">Alışverişe Başla</Link>
          </div>
        </div>
      </div>
    );
  }

  const handleQuantityChange = async (itemId, newQuantity) => {
    try {
      await updateQuantity(itemId, newQuantity);
    } catch {
      addToast('Miktar güncellenemedi', 'error');
    }
  };

  const handleRemove = async (itemId) => {
    try {
      await removeFromCart(itemId);
      addToast('Ürün sepetten silindi', 'info');
    } catch {
      addToast('Ürün silinemedi', 'error');
    }
  };

  const shippingCost = cartTotal >= 150 ? 0 : 29.90;
  const finalTotal = cartTotal + shippingCost;

  return (
    <div className="page cart-page">
      <div className="container">
        <div className="page-header">
          <h1>🛒 Sepetim</h1>
          <p>{cartItems.length} ürün</p>
        </div>

        <div className="cart-layout">
          {/* Sepet Urunleri */}
          <div className="cart-items">
            {cartItems.map(item => (
              <div key={item.id} className="cart-item">
                <Link to={`/product/${item.product_id}`} className="cart-item-image">
                  <img src={item.image} alt={item.name} />
                </Link>
                <div className="cart-item-info">
                  <Link to={`/product/${item.product_id}`} className="cart-item-name">
                    {item.name}
                  </Link>
                  <div className="cart-item-price">
                    <span className="item-price">{item.price.toLocaleString('tr-TR')} ₺</span>
                    {item.old_price && (
                      <span className="item-old-price">{item.old_price.toLocaleString('tr-TR')} ₺</span>
                    )}
                  </div>
                </div>
                <div className="cart-item-quantity">
                  <button
                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    disabled={item.quantity >= item.stock}
                  >
                    +
                  </button>
                </div>
                <div className="cart-item-total">
                  {(item.price * item.quantity).toLocaleString('tr-TR')} ₺
                </div>
                <button className="cart-item-remove" onClick={() => handleRemove(item.id)}>
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Siparis Ozeti */}
          <div className="cart-summary">
            <h3>Sipariş Özeti</h3>
            <div className="summary-row">
              <span>Ara Toplam</span>
              <span>{cartTotal.toLocaleString('tr-TR')} ₺</span>
            </div>
            <div className="summary-row">
              <span>Kargo</span>
              <span className={shippingCost === 0 ? 'free-shipping' : ''}>
                {shippingCost === 0 ? 'Ücretsiz' : `${shippingCost.toLocaleString('tr-TR')} ₺`}
              </span>
            </div>
            {shippingCost > 0 && (
              <div className="shipping-note">
                {(150 - cartTotal).toLocaleString('tr-TR')} ₺ daha ekleyin, kargo bedava!
              </div>
            )}
            <div className="summary-divider"></div>
            <div className="summary-row summary-total">
              <span>Toplam</span>
              <span>{finalTotal.toLocaleString('tr-TR')} ₺</span>
            </div>
            <button
              className="btn btn-primary btn-lg checkout-btn"
              onClick={() => navigate('/checkout')}
            >
              Ödemeye Geç →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
