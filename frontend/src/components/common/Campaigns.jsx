import React from 'react';
import '../../App.css';

const campaigns = [
  {
    img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
    title: 'Yaz Erken Rezervasyon Fırsatı',
    desc: 'Yaz turlarında %30’a varan indirimler! Sınırlı kontenjan.'
  },
  {
    img: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80',
    title: 'Kültür Turlarında Ekstra Gece',
    desc: 'Seçili kültür turlarında 1 gece konaklama hediye.'
  },
  {
    img: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=400&q=80',
    title: 'Günübirlik Turlarda 2. Kişi %50 İndirimli',
    desc: 'Hafta sonu günübirlik turlarda eşsiz fırsat.'
  },
];

const Campaigns = () => (
  <section id="kampanyalar" style={{padding: '2rem 0', background: '#fff'}}>
    <h2 style={{textAlign: 'center', color: 'var(--primary-orange)', marginBottom: '2rem', fontSize: '2rem'}}>Kampanyalar & Fırsatlar</h2>
    <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2rem'}}>
      {campaigns.map((c, i) => (
        <div key={i} style={{background: 'var(--light-gray)', borderRadius: 16, padding: '1rem', minWidth: 220, maxWidth: 260, textAlign: 'center', boxShadow: '0 2px 8px #0001'}}>
          <img src={c.img} alt={c.title} style={{width: '100%', height: 120, objectFit: 'cover', borderRadius: 12, marginBottom: 10}} />
          <div style={{fontWeight: 700, fontSize: '1.1rem', marginBottom: 8}}>{c.title}</div>
          <div style={{fontSize: '0.98rem', color: '#555'}}>{c.desc}</div>
        </div>
      ))}
    </div>
  </section>
);

export default Campaigns; 