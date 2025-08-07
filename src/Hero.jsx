import React from 'react';
import './App.css';

const Hero = () => (
  <section className="hero">
    <h1>Hayalindeki Turu Gezsek Travel ile Keşfet!</h1>
    <p>Türkiye'nin ve dünyanın en güzel rotalarına, en iyi tur fırsatlarıyla ulaş. Sadece turlar, sadece gezginler için!</p>
    <form className="hero-search" onSubmit={e => e.preventDefault()} style={{margin: '0 auto', maxWidth: 400, display: 'flex', gap: 8}}>
      <input
        type="text"
        placeholder="Tur, bölge veya kategori ara..."
        style={{flex: 1, padding: '0.7rem 1rem', borderRadius: 8, border: 'none', fontSize: '1rem'}}
      />
      <button
        type="submit"
        style={{background: 'var(--primary-turquoise)', color: '#fff', border: 'none', borderRadius: 8, padding: '0.7rem 1.2rem', fontWeight: 600, fontSize: '1rem', cursor: 'pointer'}}
      >Ara</button>
    </form>
  </section>
);

export default Hero; 