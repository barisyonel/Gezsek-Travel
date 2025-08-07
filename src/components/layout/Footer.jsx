import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="modern-footer">
      {/* Ana Footer İçeriği */}
      <div className="footer-main">
        <div className="footer-container">
          
          {/* Logo ve Açıklama Bölümü */}
          <div className="footer-brand">
            <div className="footer-logo">
              <img src="/logo.png" alt="Gezsek Travel" />
              <h3>Gezsek Travel</h3>
            </div>
            <p className="footer-description">
              Türkiye'nin en güzel destinasyonlarını keşfetmek için profesyonel tur organizasyonu hizmeti sunuyoruz. 
              Kapadokya'dan Antalya'ya, Ege'den Karadeniz'e unutulmaz deneyimler yaşayın.
            </p>
            <div className="footer-social">
              <a href="https://www.instagram.com/gezsektravel" target="_blank" rel="noopener noreferrer" className="social-link instagram">
                <i className="fab fa-instagram"></i>
                <span>Instagram</span>
              </a>
              <a href="#" className="social-link facebook">
                <i className="fab fa-facebook"></i>
                <span>Facebook</span>
              </a>
              <a href="#" className="social-link whatsapp">
                <i className="fab fa-whatsapp"></i>
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Hızlı Linkler */}
          <div className="footer-section">
            <h4>Hızlı Linkler</h4>
            <ul className="footer-links">
              <li><a href="#turlar">Popüler Turlar</a></li>
              <li><a href="#kapadokya">Kapadokya Turları</a></li>
              <li><a href="#antalya">Antalya Turları</a></li>
              <li><a href="#ege">Ege Turları</a></li>
              <li><a href="#karadeniz">Karadeniz Turları</a></li>
              <li><a href="#balon">Balon Turları</a></li>
            </ul>
          </div>

          {/* Hizmetler */}
          <div className="footer-section">
            <h4>Hizmetlerimiz</h4>
            <ul className="footer-links">
              <li><a href="#organizasyon">Tur Organizasyonu</a></li>
              <li><a href="#rehberlik">Profesyonel Rehberlik</a></li>
              <li><a href="#konaklama">Konaklama</a></li>
              <li><a href="#ulasim">Ulaşım Hizmetleri</a></li>
              <li><a href="#sigorta">Seyahat Sigortası</a></li>
              <li><a href="#ozel">Özel Tur Paketleri</a></li>
            </ul>
          </div>

          {/* İletişim Bilgileri */}
          <div className="footer-section">
            <h4>İletişim</h4>
            <div className="contact-info">
              <div className="contact-item">
                <i className="fas fa-phone"></i>
                <div>
                  <span>Telefon</span>
                  <a href="tel:+905551234567">+90 555 123 45 67</a>
                </div>
              </div>
              <div className="contact-item">
                <i className="fas fa-envelope"></i>
                <div>
                  <span>E-posta</span>
                  <a href="mailto:info@gezsektravel.com">info@gezsektravel.com</a>
                </div>
              </div>
              <div className="contact-item">
                <i className="fas fa-map-marker-alt"></i>
                <div>
                  <span>Adres</span>
                  <span>Merkez Mahallesi, Turizm Caddesi No:123<br />Kapadokya, Nevşehir</span>
                </div>
              </div>
              <div className="contact-item">
                <i className="fas fa-clock"></i>
                <div>
                  <span>Çalışma Saatleri</span>
                  <span>Pazartesi - Pazar<br />08:00 - 20:00</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Alt Footer */}
      <div className="footer-bottom">
        <div className="footer-container">
          <div className="footer-bottom-content">
            <div className="copyright">
              <p>&copy; {currentYear} Gezsek Travel. Tüm hakları saklıdır.</p>
            </div>
            <div className="footer-bottom-links">
              <a href="/gizlilik">Gizlilik Politikası</a>
              <a href="/kullanim-kosullari">Kullanım Koşulları</a>
              <a href="/cerez-politikasi">Çerez Politikası</a>
              <a href="/kvkk">KVKK</a>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Signup */}
      <div className="newsletter-signup">
        <div className="footer-container">
          <div className="newsletter-content">
            <div className="newsletter-text">
              <h4>🎉 Özel Fırsatları Kaçırma!</h4>
              <p>E-posta listemize katıl, en güncel tur fırsatlarından haberdar ol.</p>
            </div>
            <div className="newsletter-form">
              <input 
                type="email" 
                placeholder="E-posta adresinizi girin" 
                className="newsletter-input"
              />
              <button className="newsletter-btn">
                <i className="fas fa-paper-plane"></i>
                Abone Ol
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 