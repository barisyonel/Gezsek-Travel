import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import '../../App.css';

// Bu veriler normalde API'den gelecek, şimdilik statik olarak tanımlıyoruz
// Admin panelinden yönetilecek slider verileri
const slides = [
  {
    id: 1,
    img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    title: 'Ege\'nin Berrak Koylari',
    slogan: 'Hayalindeki deniz tatili burada baslar.',
    price: '₺2,999',
    duration: '3 Gün 2 Gece',
    category: 'Yaz Turlari',
    isActive: true,
    order: 1
  },
  {
    id: 2,
    img: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1200&q=80',
    title: 'Kapadokya Balonlari',
    slogan: 'Gokyuzunde ozgurlugu kesfet!',
    price: '₺1,899',
    duration: '2 Gün 1 Gece',
    category: 'Kultur Turlari',
    isActive: true,
    order: 2
  },
  {
    id: 3,
    img: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=1200&q=80',
    title: 'Antalya Sahilleri',
    slogan: 'Gunes, kum ve huzur dolu anlar.',
    price: '₺3,499',
    duration: '4 Gün 3 Gece',
    category: 'Yaz Turlari',
    isActive: true,
    order: 3
  },
  {
    id: 4,
    img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80',
    title: 'Fethiye Oludeniz',
    slogan: 'Doganin en guzel tonlariyla bulus.',
    price: '₺2,799',
    duration: '3 Gün 2 Gece',
    category: 'Doga Turlari',
    isActive: true,
    order: 4
  },
  {
    id: 5,
    img: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80',
    title: 'Karadeniz Yaylalari',
    slogan: 'Yesilin binbir tonunda serin bir nefes.',
    price: '₺1,599',
    duration: '2 Gün 1 Gece',
    category: 'Doga Turlari',
    isActive: true,
    order: 5
  },
  {
    id: 6,
    img: 'https://images.unsplash.com/photo-1465156799763-2c087c332922?auto=format&fit=crop&w=1200&q=80',
    title: 'Kusadasi Gunbatimi',
    slogan: 'Her ani unutulmaz bir yolculuk.',
    price: '₺2,299',
    duration: '3 Gün 2 Gece',
    category: 'Yaz Turlari',
    isActive: true,
    order: 6
  },
];

const SliderSection = () => {
  // Sadece aktif slider'ları filtrele
  const activeSlides = slides.filter(slide => slide.isActive).sort((a, b) => a.order - b.order);
  
  return (
    <section style={{padding: 0, marginBottom: '2rem'}}>
      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        loop
        effect="fade"
        style={{borderRadius: '0 0 2rem 2rem', overflow: 'hidden'}}
      >
        {activeSlides.map((slide, i) => (
        <SwiperSlide key={i}>
          <div style={{
            position: 'relative',
            minHeight: 500,
            background: `linear-gradient(135deg, rgba(24,28,36,0.6) 0%, rgba(0,184,212,0.3) 100%), url(${slide.img}) center/cover no-repeat`,
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4rem 2rem 3rem 2rem',
            textAlign: 'center',
            transition: 'background 0.7s cubic-bezier(.4,2,.6,1)',
          }}>
            {/* Kategori Badge */}
            <div style={{
              position: 'absolute',
              top: '2rem',
              left: '2rem',
              background: 'rgba(255,255,255,0.9)',
              color: '#333',
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              fontSize: '0.9rem',
              fontWeight: '600',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              {slide.category}
            </div>

            {/* Fiyat Badge */}
            <div style={{
              position: 'absolute',
              top: '2rem',
              right: '2rem',
              background: 'linear-gradient(135deg, #00b894, #00a085)',
              color: '#fff',
              padding: '0.75rem 1.5rem',
              borderRadius: '25px',
              fontSize: '1.1rem',
              fontWeight: '700',
              boxShadow: '0 4px 12px rgba(0,184,148,0.3)'
            }}>
              {slide.price}
            </div>

            {/* Ana İçerik */}
            <div style={{ maxWidth: '800px', zIndex: 2 }}>
              <h2 style={{
                fontSize: '3rem', 
                fontWeight: 700, 
                marginBottom: '1rem', 
                textShadow: '0 4px 24px #0008',
                lineHeight: '1.2'
              }}>
                {slide.title}
              </h2>
              
              <div style={{
                fontSize: '1.4rem', 
                marginBottom: '2rem', 
                maxWidth: 600, 
                textShadow: '0 2px 12px #0007',
                opacity: 0.95
              }}>
                {slide.slogan}
              </div>

              {/* Tur Detayları */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '2rem',
                marginBottom: '2rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'rgba(255,255,255,0.1)',
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  backdropFilter: 'blur(10px)'
                }}>
                  <span>⏱️</span>
                  <span>{slide.duration}</span>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'rgba(255,255,255,0.1)',
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  backdropFilter: 'blur(10px)'
                }}>
                  <span>💰</span>
                  <span>Kişi Başı</span>
                </div>
              </div>

              {/* CTA Butonları */}
              <div style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}>
                <button style={{
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: '#fff',
                  border: 'none',
                  padding: '1rem 2rem',
                  borderRadius: '30px',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(102,126,234,0.4)'
                }}>
                  🗺️ Turları Keşfet
                </button>
                
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
                  📞 İletişim
                </button>
              </div>
            </div>

            {/* Alt Gradient Overlay */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '100px',
              background: 'linear-gradient(to top, rgba(0,0,0,0.3), transparent)',
              pointerEvents: 'none'
            }} />
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  </section>
  );
};

export default SliderSection; 