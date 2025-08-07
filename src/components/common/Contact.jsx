import React from 'react';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import '../../App.css';

const Contact = () => (
  <section className="contact-section" id="iletisim">
    <div className="contact-container">
      <div className="contact-info">
        <h2>İletişim</h2>
        <ul>
          <li><FaPhoneAlt /> 0850 466 77 44</li>
          <li><FaEnvelope /> info@gezsektravel.com</li>
          <li><FaMapMarkerAlt /> KÜTAHYA APARTMANI ALTI, Yeşilırmak, Ödeneğin Caddesi No:5/D, 60400 Tokat</li>
        </ul>
      </div>
      <div className="contact-map">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m28!1m12!1m3!1d190.1159780279855!2d36.55109516127344!3d40.32336110820682!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m13!3e6!4m5!1s0x407db74cf6c8a3ef%3A0x48fc9343ddc6f4cb!2zR2V6c2VrIFRyYXZlbCwgS1XFnkFUIEFQQVJUTUFOIEFMVEksIFllxZ9pbMSxcm1haywgw4dlw6dlbmlzdGFuIENhZGRlc2kgTk86NS9ELCBUb2thdCBNZXJrZXovVG9rYXQ!3m2!1d40.323361!2d36.551369!4m5!1s0x407db74cf6c8a3ef%3A0x48fc9343ddc6f4cb!2zS1XFnkFUIEFQQVJUTUFOIEFMVEksIFllxZ9pbMSxcm1haywgw4dlw6dlbmlzdGFuIENkLiBOTzo1L0QsIDYwNDAwIFRva2F0IE1lcmtlei9Ub2thdA!3m2!1d40.323361!2d36.551369!5e0!3m2!1str!2str!4v1753114706789!5m2!1str!2str"
          width="100%"
          height="350"
          style={{border:0, borderRadius: '12px'}}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Gezsek Travel Harita"
        ></iframe>
      </div>
    </div>
  </section>
);

export default Contact; 