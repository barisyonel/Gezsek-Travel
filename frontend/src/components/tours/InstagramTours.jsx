import React, { useState } from 'react';
import '../../App.css';

const tours = [
  {
    title: 'Karadeniz Yayla Turu',
    desc: 'Doğanın kalbinde, yaylalarda unutulmaz bir deneyim! Ulaşım, konaklama ve rehberlik dahil.',
    date: '10-13 Ağustos',
    price: '12.000 TL',
    img: 'https://instagram.fist6-1.fna.fbcdn.net/v/t51.2885-15/karadeniz.jpg',
    url: 'https://www.instagram.com/p/DMXj0sdt7rZ/?igsh=aTJ5dmVneHE4bXl0',
    details: 'Tur programı: 1. gün Trabzon, 2. gün Uzungöl, 3. gün Ayder Yaylası, 4. gün dönüş. Fiyata ulaşım, konaklama, rehberlik, kahvaltı ve akşam yemeği dahildir.'
  },
  {
    title: 'Kapadokya Kültür Turu',
    desc: 'Peri bacaları, balonlar ve tarihi dokuyla dolu 3 gün! Ulaşım ve konaklama dahil.',
    date: '20-22 Temmuz',
    price: '8.500 TL',
    img: 'https://instagram.fist6-1.fna.fbcdn.net/v/t51.2885-15/kapadokya.jpg',
    url: 'https://www.instagram.com/p/DMK5YbdK2Mk/?igsh=MWQzMHI0aDBscDloMw==',
    details: 'Tur programı: 1. gün Göreme, 2. gün Avanos, 3. gün Ürgüp. Fiyata ulaşım, konaklama, rehberlik, balon turu ve müze girişleri dahildir.'
  },
  {
    title: 'GAP Turu',
    desc: 'Güneydoğu’nun eşsiz şehirleri, kültür ve lezzet dolu bir rota! 5 gece 6 gün.',
    date: '5-10 Eylül',
    price: '15.000 TL',
    img: 'https://instagram.fist6-1.fna.fbcdn.net/v/t51.2885-15/gap.jpg',
    url: 'https://www.instagram.com/p/DMXkIgOtYHT/?igsh=dGd4azIzOWJvd2Nj',
    details: 'Tur programı: Gaziantep, Şanlıurfa, Mardin, Diyarbakır, Adıyaman. Fiyata ulaşım, konaklama, rehberlik, müze girişleri ve yemekler dahildir.'
  },
  {
    title: 'Ege Akdeniz Turu',
    desc: 'Ege ve Akdeniz’in en güzel koyları, deniz ve güneşle dolu bir tatil!',
    date: '1-5 Temmuz',
    price: '13.000 TL',
    img: 'https://instagram.fist6-1.fna.fbcdn.net/v/t51.2885-15/egeakdeniz.jpg',
    url: 'https://www.instagram.com/p/DMK5HEoKtUT/?igsh=Yjl1dXFscTVlc21x',
    details: 'Tur programı: Bodrum, Marmaris, Fethiye, Kaş, Kalkan. Fiyata ulaşım, konaklama, rehberlik ve tekne turu dahildir.'
  },
  {
    title: 'Günübirlik Abant & Gölcük Turu',
    desc: 'Şehirden kaçış, doğayla buluşma! Sabah çıkış, akşam dönüş.',
    date: 'Her hafta sonu',
    price: '1.500 TL',
    img: 'https://instagram.fist6-1.fna.fbcdn.net/v/t51.2885-15/abant.jpg',
    url: 'https://www.instagram.com/p/DMK489ZKqw0/?igsh=OWJwdnYwNTlsb2g5',
    details: 'Tur programı: Sabah İstanbul’dan hareket, Abant ve Gölcük gezisi, akşam dönüş. Fiyata ulaşım, rehberlik ve öğle yemeği dahildir.'
  },
  {
    title: 'Yurtdışı Balkanlar Turu',
    desc: 'Balkanlar’ın tarihi şehirleri, kültür ve eğlence dolu bir rota! 5 gece 6 gün.',
    date: '15-20 Eylül',
    price: '650 €',
    img: 'https://instagram.fist6-1.fna.fbcdn.net/v/t51.2885-15/balkanlar.jpg',
    url: 'https://www.instagram.com/p/DMXj0sdt7rZ/?igsh=aTJ5dmVneHE4bXl0',
    details: 'Tur programı: Belgrad, Saraybosna, Üsküp, Ohrid, Tiran. Fiyata ulaşım, konaklama, rehberlik ve şehir turları dahildir.'
  },
];

const InstagramTours = () => {
  const [modal, setModal] = useState(null);

  return (
    <section style={{padding: '2rem 0', background: '#fff'}}>
      <h2 style={{textAlign: 'center', color: 'var(--primary-orange)', marginBottom: '2rem', fontSize: '2rem'}}>Instagram’dan Son Turlarımız</h2>
      <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2rem'}}>
        {tours.map((tour, i) => (
          <div
            className="tour-card"
            key={i}
            style={{background: 'var(--light-gray)', borderRadius: 16, padding: '1rem', minWidth: 220, maxWidth: 260, textAlign: 'center', boxShadow: '0 2px 8px #0001', cursor: 'pointer'}}
            onClick={() => setModal(tour)}
          >
            <img src={tour.img} alt={tour.title} style={{width: '100%', height: 120, objectFit: 'cover', borderRadius: 12, marginBottom: 10}} />
            <div style={{fontWeight: 700, fontSize: '1.1rem', marginBottom: 8}}>{tour.title}</div>
            <div style={{fontSize: '0.98rem', color: '#555', marginBottom: 6}}>{tour.desc}</div>
            <div style={{fontSize: '0.98rem', color: 'var(--primary-turquoise)', marginBottom: 6}}>{tour.date}</div>
            <div style={{fontWeight: 600, color: 'var(--primary-orange)', marginBottom: 10}}>{tour.price}</div>
            <a href={tour.url} target="_blank" rel="noopener noreferrer" className="slider-btn" onClick={e => e.stopPropagation()}>Instagram’da Gör</a>
          </div>
        ))}
      </div>
      {modal && (
        <div className="tour-modal-bg" onClick={() => setModal(null)}>
          <div className="tour-modal" onClick={e => e.stopPropagation()}>
            <button className="tour-modal-close" onClick={() => setModal(null)}>&times;</button>
            <img src={modal.img} alt={modal.title} style={{width: '100%', height: 180, objectFit: 'cover', borderRadius: 12, marginBottom: 16}} />
            <h3 style={{fontSize: '1.3rem', fontWeight: 700, marginBottom: 8}}>{modal.title}</h3>
            <div style={{fontSize: '1.08rem', color: '#555', marginBottom: 8}}>{modal.desc}</div>
            <div style={{fontSize: '1.05rem', color: 'var(--primary-turquoise)', marginBottom: 6}}>{modal.date}</div>
            <div style={{fontWeight: 600, color: 'var(--primary-orange)', marginBottom: 10}}>{modal.price}</div>
            <div style={{fontSize: '1rem', color: '#333', marginBottom: 14}}>{modal.details}</div>
            <a href={modal.url} target="_blank" rel="noopener noreferrer" className="slider-btn">Instagram’da Gör</a>
          </div>
        </div>
      )}
    </section>
  );
};

export default InstagramTours; 