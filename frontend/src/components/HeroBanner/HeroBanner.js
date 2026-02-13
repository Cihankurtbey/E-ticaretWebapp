import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './HeroBanner.css';

const slides = [
  {
    title: 'Kış İndirimleri Başladı!',
    subtitle: 'Seçili ürünlerde %50\'ye varan indirimler',
    cta: 'Alışverişe Başla',
    link: '/products',
    bg: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    accent: '#e94560'
  },
  {
    title: 'Yeni Sezon Ürünler',
    subtitle: 'En yeni teknoloji ve moda ürünleri keşfedin',
    cta: 'Keşfet',
    link: '/products?sort=newest',
    bg: 'linear-gradient(135deg, #0f3460 0%, #16213e 50%, #1a1a2e 100%)',
    accent: '#00c853'
  },
  {
    title: 'Ücretsiz Kargo',
    subtitle: '150₺ ve üzeri alışverişlerde kargo bedava',
    cta: 'Fırsatları Gör',
    link: '/products',
    bg: 'linear-gradient(135deg, #16213e 0%, #1a1a2e 50%, #0f3460 100%)',
    accent: '#ffc107'
  }
];

const HeroBanner = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="hero-banner">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`hero-slide ${index === current ? 'active' : ''}`}
          style={{ background: slide.bg }}
        >
          <div className="hero-content">
            <div className="hero-badge" style={{ color: slide.accent }}>
              ● Özel Teklif
            </div>
            <h1 className="hero-title">{slide.title}</h1>
            <p className="hero-subtitle">{slide.subtitle}</p>
            <Link
              to={slide.link}
              className="hero-cta"
              style={{ background: slide.accent }}
            >
              {slide.cta} →
            </Link>
          </div>
          <div className="hero-decoration">
            <div className="hero-circle" style={{ borderColor: slide.accent }}></div>
            <div className="hero-circle hero-circle-2" style={{ borderColor: slide.accent }}></div>
          </div>
        </div>
      ))}

      <div className="hero-dots">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`hero-dot ${index === current ? 'active' : ''}`}
            onClick={() => setCurrent(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroBanner;
