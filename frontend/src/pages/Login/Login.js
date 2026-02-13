import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast/Toast';
import './Login.css';

const Login = () => {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      addToast('Lütfen tüm alanları doldurun', 'warning');
      return;
    }

    setLoading(true);
    try {
      await login(form.email, form.password);
      addToast('Giriş başarılı! Hoş geldiniz.', 'success');
      navigate('/');
    } catch (error) {
      addToast(error.response?.data?.message || 'Giriş yapılamadı', 'error');
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
            <h1>Giriş Yap</h1>
            <p>Hesabınıza giriş yapın</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
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
                placeholder="••••••••"
              />
            </div>

            <button type="submit" className="btn btn-primary btn-lg auth-btn" disabled={loading}>
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Hesabınız yok mu?{' '}
              <Link to="/register" className="auth-link">Kayıt Ol</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
