import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usersAPI, ordersAPI } from '../../services/api';
import { useToast } from '../../components/Toast/Toast';
import './Profile.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();
  const [tab, setTab] = useState('profile');
  const [orders, setOrders] = useState([]);
  const [profile, setProfile] = useState({ name: '', phone: '', address: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, ordersRes] = await Promise.all([
          usersAPI.getProfile(),
          ordersAPI.getAll()
        ]);
        setProfile({
          name: profileRes.data.name || '',
          phone: profileRes.data.phone || '',
          address: profileRes.data.address || ''
        });
        setOrders(ordersRes.data);
      } catch (error) {
        console.error('Profil yuklenemedi:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await usersAPI.updateProfile(profile);
      updateUser({ name: profile.name });
      addToast('Profil güncellendi!', 'success');
    } catch (error) {
      addToast('Profil güncellenemedi', 'error');
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Teslim Edildi': return 'var(--success)';
      case 'Kargoda': return '#2196f3';
      case 'Hazirlaniyor': return 'var(--warning)';
      case 'Iptal': return 'var(--error)';
      default: return 'var(--text-muted)';
    }
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

  return (
    <div className="page profile-page">
      <div className="container">
        <div className="profile-layout">
          {/* Sidebar */}
          <aside className="profile-sidebar">
            <div className="profile-user">
              <div className="profile-avatar-lg">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <h3>{user?.name}</h3>
              <p>{user?.email}</p>
            </div>
            <nav className="profile-nav">
              <button
                className={`profile-nav-item ${tab === 'profile' ? 'active' : ''}`}
                onClick={() => setTab('profile')}
              >
                👤 Profil Bilgileri
              </button>
              <button
                className={`profile-nav-item ${tab === 'orders' ? 'active' : ''}`}
                onClick={() => setTab('orders')}
              >
                📦 Siparişlerim
              </button>
            </nav>
          </aside>

          {/* Content */}
          <main className="profile-content">
            {tab === 'profile' ? (
              <div className="profile-section">
                <h2>Profil Bilgileri</h2>
                <form onSubmit={handleProfileSave}>
                  <div className="input-group">
                    <label>Ad Soyad</label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ad Soyad"
                    />
                  </div>
                  <div className="input-group">
                    <label>E-posta</label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="input-disabled"
                    />
                  </div>
                  <div className="input-group">
                    <label>Telefon</label>
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="05XX XXX XXXX"
                    />
                  </div>
                  <div className="input-group">
                    <label>Adres</label>
                    <textarea
                      value={profile.address}
                      onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Teslimat adresi"
                      rows={3}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Kaydediliyor...' : 'Kaydet'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="profile-section">
                <h2>Siparişlerim</h2>
                {orders.length === 0 ? (
                  <div className="no-orders">
                    <span>📦</span>
                    <p>Henüz siparişiniz yok</p>
                  </div>
                ) : (
                  <div className="orders-list">
                    {orders.map(order => (
                      <div key={order.id} className="order-card">
                        <div className="order-header">
                          <div className="order-info">
                            <span className="order-id">Sipariş #{order.id}</span>
                            <span className="order-date">
                              {new Date(order.created_at).toLocaleDateString('tr-TR', {
                                year: 'numeric', month: 'long', day: 'numeric'
                              })}
                            </span>
                          </div>
                          <div className="order-meta">
                            <span
                              className="order-status"
                              style={{ color: getStatusColor(order.status), borderColor: getStatusColor(order.status) }}
                            >
                              {order.status}
                            </span>
                            <span className="order-total">{parseFloat(order.total).toLocaleString('tr-TR')} ₺</span>
                          </div>
                        </div>
                        <div className="order-items">
                          {order.items?.map(item => (
                            <div key={item.id} className="order-item">
                              <img src={item.image} alt={item.name} />
                              <div className="order-item-info">
                                <span>{item.name}</span>
                                <span className="order-item-qty">{item.quantity} adet × {parseFloat(item.price).toLocaleString('tr-TR')} ₺</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Profile;
