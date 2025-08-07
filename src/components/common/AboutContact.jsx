import React from 'react';
import '../../App.css';

const AboutContact = () => (
  <section id="hakkimizda" style={{padding: '2rem 0', background: 'var(--light-gray)'}}>
    <div style={{maxWidth: 900, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'center'}}>
      <div style={{flex: 1, minWidth: 260}}>
        <h2 style={{color: 'var(--primary-turquoise)', fontSize: '1.7rem', marginBottom: 12}}>Hakkımızda</h2>
        <p style={{fontSize: '1.08rem', color: '#444'}}>Gezsek Travel, sadece tur düzenleyen, gezgin ruhlara ilham veren bir seyahat markasıdır. Türkiye ve dünyanın dört bir yanındaki en güzel rotalara, güvenli ve keyifli turlar sunuyoruz. Profesyonel ekibimizle, unutulmaz anılar biriktirmeniz için buradayız.</p>
      </div>
    </div>
  </section>
);

export default AboutContact; 