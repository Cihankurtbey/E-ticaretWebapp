import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast/Toast';
import '../Login/Login.css';

const Register = () => {
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password) {
      addToast('Lütfen tüm alanları doldurun', 'warning');
      return;
    }

    if (form.password.length < 6) {
      addToast('Şifre en az 6 karakter olmalıdır', 'warning');
      return;
    }

    if (form.password !== form.confirmPassword) {
      addToast('Şifreler eşleşmiyor', 'warning');
      return;
    }

    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      addToast('Kayıt başarılı! Hoş geldiniz.', 'success');
      navigate('/');
    } catch (error) {
      addToast(error.response?.data?.message || 'Kayıt yapılamadı', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <Link to="/" className="auth-logo">
              <span className="logo-icon">◆</span>
              <span className="logo-text">SoftShop</span>
            </Link>
            <h1>Kayıt Ol</h1>
            <p>Yeni hesap oluşturun</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <label>Ad Soyad</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Ad Soyad"
              />
            </div>
            <div className="input-group">
              <label>E-posta</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="ornek@email.com"
              />
            </div>
            <div className="input-group">
              <label>Şifre</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="En az 6 karakter"
              />
            </div>
            <div className="input-group">
              <label>Şifre Tekrar</label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Şifreyi tekrar girin"
              />
            </div>

            <button type="submit" className="btn btn-primary btn-lg auth-btn" disabled={loading}>
              {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Zaten hesabınız var mı?{' '}
              <Link to="/login" className="auth-link">Giriş Yap</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
