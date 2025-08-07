import React, { useState } from 'react';

const faqs = [
  {
    q: 'Tur satın almak için üye olmak zorunda mıyım?',
    a: 'Evet, satın alma ve geçmiş turlarınızı görebilmek için üyelik gereklidir.'
  },
  {
    q: 'Satın aldığım turun detaylarını nereden görebilirim?',
    a: 'Kullanıcı panelinizde “Satın Aldığım/Geçmiş Turlar” bölümünden tüm detaylara ulaşabilirsiniz.'
  },
  {
    q: 'E-posta doğrulaması neden gerekli?',
    a: 'Hesabınızın güvenliği ve iletişim için e-posta doğrulaması zorunludur.'
  },
  {
    q: 'Tur iptal/iade koşulları nelerdir?',
    a: 'Her turun iptal/iade koşulları farklıdır. Detaylar için tur detay sayfasını inceleyin veya bizimle iletişime geçin.'
  },
  {
    q: 'Ödeme yöntemleri nelerdir?',
    a: 'Kredi kartı, banka havalesi ve çeşitli online ödeme yöntemleriyle ödeme yapabilirsiniz.'
  },
];

const FAQ = () => {
  const [open, setOpen] = useState(null);
  return (
    <section className="faq-section">
      <h2 className="faq-title">Sıkça Sorulan Sorular</h2>
      <div className="faq-list">
        {faqs.map((item, i) => (
          <div className="faq-item" key={i}>
            <button className="faq-question" onClick={() => setOpen(open === i ? null : i)}>
              {item.q}
              <span className="faq-arrow">{open === i ? '▲' : '▼'}</span>
            </button>
            {open === i && <div className="faq-answer">{item.a}</div>}
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQ; 