import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { ordersAPI } from '../../services/api';
import { useToast } from '../../components/Toast/Toast';
import './Checkout.css';

const Checkout = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    city: '',
    district: '',
    address: '',
    cardName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: ''
  });

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (step === 1) {
      if (!form.fullName || !form.phone || !form.city || !form.address) {
        addToast('Lütfen tüm adres alanlarını doldurun', 'warning');
        return;
      }
      setStep(2);
      return;
    }

    if (!form.cardName || !form.cardNumber || !form.cardExpiry || !form.cardCvv) {
      addToast('Lütfen tüm ödeme alanlarını doldurun', 'warning');
      return;
    }

    setLoading(true);
    try {
      const fullAddress = `${form.fullName}, ${form.phone}, ${form.address}, ${form.district}, ${form.city}`;
      const response = await ordersAPI.create(fullAddress);
      clearCart();
      addToast('Siparişiniz başarıyla oluşturuldu!', 'success');
      navigate('/profile');
    } catch (error) {
      addToast(error.response?.data?.message || 'Sipariş oluşturulamadı', 'error');
    } finally {
      setLoading(false);
    }
  };

  const shippingCost = cartTotal >= 150 ? 0 : 29.90;
  const finalTotal = cartTotal + shippingCost;

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="page checkout-page">
      <div className="container">
        <div className="page-header">
          <h1>💳 Ödeme</h1>
        </div>

        {/* Progress Steps */}
        <div className="checkout-steps">
          <div className={`checkout-step ${step >= 1 ? 'active' : ''}`}>
            <span className="step-number">1</span>
            <span className="step-label">Teslimat</span>
          </div>
          <div className="step-line"></div>
          <div className={`checkout-step ${step >= 2 ? 'active' : ''}`}>
            <span className="step-number">2</span>
            <span className="step-label">Ödeme</span>
          </div>
        </div>

        <div className="checkout-layout">
          <form className="checkout-form" onSubmit={handleSubmit}>
            {step === 1 ? (
              <div className="form-section">
                <h2>Teslimat Adresi</h2>
                <div className="form-grid">
                  <div className="input-group">
                    <label>Ad Soyad</label>
                    <input
                      type="text"
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      placeholder="Ad Soyad"
                    />
                  </div>
                  <div className="input-group">
                    <label>Telefon</label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="05XX XXX XXXX"
                    />
                  </div>
                  <div className="input-group">
                    <label>İl</label>
                    <input
                      type="text"
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      placeholder="İl"
                    />
                  </div>
                  <div className="input-group">
                    <label>İlçe</label>
                    <input
                      type="text"
                      name="district"
                      value={form.district}
                      onChange={handleChange}
                      placeholder="İlçe"
                    />
                  </div>
                </div>
                <div className="input-group">
                  <label>Adres Detayı</label>
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Mahalle, sokak, bina no, daire no..."
                    rows={3}
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-lg">
                  Ödeme Adımına Geç →
                </button>
              </div>
            ) : (
              <div className="form-section">
                <h2>Ödeme Bilgileri</h2>
                <p className="form-note">🔒 Ödeme bilgileriniz güvenli şekilde işlenir (Demo)</p>
                <div className="input-group">
                  <label>Kart Üzerindeki İsim</label>
                  <input
                    type="text"
                    name="cardName"
                    value={form.cardName}
                    onChange={handleChange}
                    placeholder="Kart üzerindeki isim"
                  />
                </div>
                <div className="input-group">
                  <label>Kart Numarası</label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={form.cardNumber}
                    onChange={handleChange}
                    placeholder="XXXX XXXX XXXX XXXX"
                    maxLength={19}
                  />
                </div>
                <div className="form-grid">
                  <div className="input-group">
                    <label>Son Kullanma Tarihi</label>
                    <input
                      type="text"
                      name="cardExpiry"
                      value={form.cardExpiry}
                      onChange={handleChange}
                      placeholder="AA/YY"
                      maxLength={5}
                    />
                  </div>
                  <div className="input-group">
                    <label>CVV</label>
                    <input
                      type="text"
                      name="cardCvv"
                      value={form.cardCvv}
                      onChange={handleChange}
                      placeholder="XXX"
                      maxLength={3}
                    />
                  </div>
                </div>
                <div className="form-buttons">
                  <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>
                    ← Geri
                  </button>
                  <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                    {loading ? 'İşleniyor...' : `${finalTotal.toLocaleString('tr-TR')} ₺ Öde`}
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Siparis Ozeti */}
          <div className="checkout-summary">
            <h3>Sipariş Özeti</h3>
            <div className="checkout-items">
              {cartItems.map(item => (
                <div key={item.id} className="checkout-item">
                  <img src={item.image} alt={item.name} />
                  <div className="checkout-item-info">
                    <span className="checkout-item-name">{item.name}</span>
                    <span className="checkout-item-qty">{item.quantity} adet</span>
                  </div>
                  <span className="checkout-item-price">
                    {(item.price * item.quantity).toLocaleString('tr-TR')} ₺
                  </span>
                </div>
              ))}
            </div>
            <div className="summary-divider"></div>
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
            <div className="summary-divider"></div>
            <div className="summary-row summary-total">
              <span>Toplam</span>
              <span>{finalTotal.toLocaleString('tr-TR')} ₺</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
