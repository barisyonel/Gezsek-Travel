import React from 'react';
import { FaUmbrellaBeach, FaLandmark, FaShip, FaMapMarkedAlt, FaTree, FaCalendarDay } from 'react-icons/fa';
import '../../App.css';

const categories = [
  { icon: <FaUmbrellaBeach />, title: 'Yaz Turları', desc: 'Deniz, güneş ve eğlence dolu yaz rotaları.' },
  { icon: <FaLandmark />, title: 'Kültür Turları', desc: 'Tarihi ve kültürel keşifler için.' },
  { icon: <FaShip />, title: 'Gemi Turları', desc: 'Deniz üzerinde unutulmaz yolculuklar.' },
  { icon: <FaMapMarkedAlt />, title: 'Kıbrıs Turları', desc: 'Kıbrıs’ın eşsiz güzellikleri.' },
  { icon: <FaCalendarDay />, title: 'Günübirlik Turlar', desc: 'Kısa kaçamaklar, dolu dolu günler.' },
  { icon: <FaTree />, title: 'Doğa Turları', desc: 'Doğayla iç içe, huzurlu rotalar.' },
];

const PopularCategories = () => (
  <section id="turlar" style={{
    padding: '4rem 0', 
    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
    position: 'relative'
  }}>
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '1px',
      background: 'linear-gradient(90deg, transparent, rgba(0,184,212,0.3), transparent)'
    }} />
    
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h2 style={{
          color: '#333', 
          marginBottom: '1rem', 
          fontSize: '2.5rem',
          fontWeight: '700'
        }}>
          🗺️ Popüler Tur Kategorileri
        </h2>
        <p style={{
          color: '#666',
          fontSize: '1.1rem',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          Her zevke ve bütçeye uygun, unutulmaz deneyimler sunan tur kategorilerimizi keşfedin
        </p>
      </div>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '2rem',
        marginBottom: '3rem'
      }}>
        {categories.map((cat, i) => (
          <div key={i} style={{
            background: '#fff',
            borderRadius: '20px',
            padding: '2.5rem 2rem',
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease',
            border: '1px solid rgba(0,0,0,0.05)',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden'
          }} onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-8px)';
            e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.15)';
          }} onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)';
          }}>
            {/* Hover Effect Background */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, rgba(102,126,234,0.05), rgba(118,75,162,0.05))',
              opacity: 0,
              transition: 'opacity 0.3s ease',
              pointerEvents: 'none'
            }} />
            
            <div style={{
              fontSize: '3rem', 
              color: 'var(--primary-turquoise)', 
              marginBottom: '1.5rem',
              position: 'relative',
              zIndex: 1
            }}>
              {cat.icon}
            </div>
            
            <div style={{
              fontWeight: '700', 
              fontSize: '1.3rem', 
              marginBottom: '1rem',
              color: '#333',
              position: 'relative',
              zIndex: 1
            }}>
              {cat.title}
            </div>
            
            <div style={{
              fontSize: '1rem', 
              color: '#666',
              lineHeight: '1.6',
              position: 'relative',
              zIndex: 1
            }}>
              {cat.desc}
            </div>
            
            {/* Badge */}
            <div style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: '#fff',
              padding: '0.25rem 0.75rem',
              borderRadius: '12px',
              fontSize: '0.8rem',
              fontWeight: '600'
            }}>
              Popüler
            </div>
          </div>
        ))}
      </div>
      
      {/* CTA Section */}
      <div style={{
        textAlign: 'center',
        padding: '2rem',
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        borderRadius: '20px',
        color: '#fff',
        boxShadow: '0 8px 32px rgba(102,126,234,0.3)'
      }}>
        <h3 style={{
          fontSize: '1.8rem',
          marginBottom: '1rem',
          fontWeight: '600'
        }}>
          🎯 Sizin İçin En Uygun Turu Bulalım
        </h3>
        <p style={{
          fontSize: '1.1rem',
          marginBottom: '2rem',
          opacity: 0.9
        }}>
          Uzman ekibimiz size özel tur önerileri sunar
        </p>
        <button style={{
          background: 'rgba(255,255,255,0.2)',
          color: '#fff',
          border: '2px solid rgba(255,255,255,0.3)',
          padding: '1rem 2rem',
          borderRadius: '30px',
          fontSize: '1.1rem',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          backdropFilter: 'blur(10px)'
        }}>
          🗺️ Tüm Turları Görüntüle
        </button>
      </div>
    </div>
  </section>
);

export default PopularCategories; 