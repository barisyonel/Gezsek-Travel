import React from 'react';
import '../../App.css';

const regions = [
  { img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80', title: 'Bodrum', desc: 'Ege’nin incisi, eğlence ve deniz.' },
  { img: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80', title: 'Antalya', desc: 'Akdeniz’in tatil başkenti.' },
  { img: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=400&q=80', title: 'Marmaris', desc: 'Doğal güzellikler ve huzur.' },
  { img: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=400&q=80', title: 'Kapadokya', desc: 'Peri bacaları ve balonlar diyarı.' },
  { img: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=400&q=80', title: 'Karadeniz', desc: 'Yeşilin binbir tonu, yaylalar.' },
  { img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=400&q=80', title: 'Fethiye', desc: 'Ölüdeniz ve doğa harikası koylar.' },
  { img: 'https://images.unsplash.com/photo-1465156799763-2c087c332922?auto=format&fit=crop&w=400&q=80', title: 'Kuşadası', desc: 'Tarihi ve deniziyle ünlü.' },
];

const PopularRegions = () => (
  <section id="destinasyonlar" style={{padding: '2rem 0', background: 'var(--light-gray)'}}>
    <h2 style={{textAlign: 'center', color: 'var(--primary-turquoise)', marginBottom: '2rem', fontSize: '2rem'}}>Popüler Bölgeler</h2>
    <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2rem'}}>
      {regions.map((reg, i) => (
        <div key={i} style={{background: '#fff', borderRadius: 16, padding: '1rem', minWidth: 220, maxWidth: 260, textAlign: 'center', boxShadow: '0 2px 8px #0001'}}>
          <img src={reg.img} alt={reg.title} style={{width: '100%', height: 120, objectFit: 'cover', borderRadius: 12, marginBottom: 10}} />
          <div style={{fontWeight: 700, fontSize: '1.1rem', marginBottom: 8}}>{reg.title}</div>
          <div style={{fontSize: '0.98rem', color: '#555'}}>{reg.desc}</div>
        </div>
      ))}
    </div>
  </section>
);

export default PopularRegions; 