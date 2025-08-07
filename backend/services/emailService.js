const nodemailer = require('nodemailer');

// Email transporter oluştur (test modu)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'test@example.com',
    pass: process.env.EMAIL_PASS || 'test-password'
  }
});

// Test modu kontrolü
const isTestMode = !process.env.EMAIL_USER || !process.env.EMAIL_PASS;

// Email template'leri
const emailTemplates = {
  // Rezervasyon onayı
  reservationConfirmed: (userName, tourTitle, tourDate, reservationId) => ({
    subject: '🎉 Rezervasyonunuz Onaylandı!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #00B8D4, #FF6F00); color: white; padding: 2rem; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="margin: 0; font-size: 2rem;">🎉 Rezervasyon Onaylandı!</h1>
          <p style="margin: 0.5rem 0 0 0; font-size: 1.1rem;">Gezsek Travel</p>
        </div>
        
        <div style="background: white; padding: 2rem; border: 1px solid #e0e0e0; border-top: none;">
          <p style="font-size: 1.1rem; color: #333; margin-bottom: 1.5rem;">
            Merhaba <strong>${userName}</strong>,
          </p>
          
          <p style="font-size: 1rem; color: #555; line-height: 1.6; margin-bottom: 1.5rem;">
            <strong>${tourTitle}</strong> turu için yaptığınız rezervasyon başarıyla onaylanmıştır.
          </p>
          
          <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 8px; margin: 1.5rem 0;">
            <h3 style="color: #00B8D4; margin: 0 0 1rem 0;">📋 Rezervasyon Detayları</h3>
            <p style="margin: 0.5rem 0;"><strong>Tur:</strong> ${tourTitle}</p>
            <p style="margin: 0.5rem 0;"><strong>Tarih:</strong> ${tourDate}</p>
            <p style="margin: 0.5rem 0;"><strong>Rezervasyon No:</strong> #${reservationId}</p>
          </div>
          
          <p style="font-size: 1rem; color: #555; line-height: 1.6; margin-bottom: 1.5rem;">
            Tur günü gelmeden önce size detaylı bilgiler gönderilecektir. 
            Herhangi bir sorunuz olursa bizimle iletişime geçebilirsiniz.
          </p>
          
          <div style="text-align: center; margin: 2rem 0;">
            <a href="${process.env.FRONTEND_URL}/profile" 
               style="background: #00B8D4; color: white; padding: 1rem 2rem; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
              Rezervasyonlarımı Görüntüle
            </a>
          </div>
          
          <p style="font-size: 0.9rem; color: #888; text-align: center; margin-top: 2rem;">
            Bu email otomatik olarak gönderilmiştir. Lütfen yanıtlamayınız.
          </p>
        </div>
        
        <div style="background: #f8f9fa; padding: 1rem; text-align: center; border-radius: 0 0 12px 12px; border: 1px solid #e0e0e0; border-top: none;">
          <p style="margin: 0; color: #666; font-size: 0.9rem;">
            © 2024 Gezsek Travel. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    `
  }),

  // Rezervasyon iptali
  reservationCancelled: (userName, tourTitle, tourDate, reservationId) => ({
    subject: '❌ Rezervasyon İptal Edildi',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #dc3545, #ff6f00); color: white; padding: 2rem; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="margin: 0; font-size: 2rem;">❌ Rezervasyon İptal Edildi</h1>
          <p style="margin: 0.5rem 0 0 0; font-size: 1.1rem;">Gezsek Travel</p>
        </div>
        
        <div style="background: white; padding: 2rem; border: 1px solid #e0e0e0; border-top: none;">
          <p style="font-size: 1.1rem; color: #333; margin-bottom: 1.5rem;">
            Merhaba <strong>${userName}</strong>,
          </p>
          
          <p style="font-size: 1rem; color: #555; line-height: 1.6; margin-bottom: 1.5rem;">
            <strong>${tourTitle}</strong> turu için yaptığınız rezervasyon iptal edilmiştir.
          </p>
          
          <div style="background: #fff5f5; padding: 1.5rem; border-radius: 8px; margin: 1.5rem 0; border-left: 4px solid #dc3545;">
            <h3 style="color: #dc3545; margin: 0 0 1rem 0;">📋 İptal Edilen Rezervasyon</h3>
            <p style="margin: 0.5rem 0;"><strong>Tur:</strong> ${tourTitle}</p>
            <p style="margin: 0.5rem 0;"><strong>Tarih:</strong> ${tourDate}</p>
            <p style="margin: 0.5rem 0;"><strong>Rezervasyon No:</strong> #${reservationId}</p>
          </div>
          
          <p style="font-size: 1rem; color: #555; line-height: 1.6; margin-bottom: 1.5rem;">
            Başka bir tur rezervasyonu yapmak isterseniz web sitemizi ziyaret edebilirsiniz.
          </p>
          
          <div style="text-align: center; margin: 2rem 0;">
            <a href="${process.env.FRONTEND_URL}" 
               style="background: #00B8D4; color: white; padding: 1rem 2rem; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
              Yeni Tur Ara
            </a>
          </div>
          
          <p style="font-size: 0.9rem; color: #888; text-align: center; margin-top: 2rem;">
            Bu email otomatik olarak gönderilmiştir. Lütfen yanıtlamayınız.
          </p>
        </div>
        
        <div style="background: #f8f9fa; padding: 1rem; text-align: center; border-radius: 0 0 12px 12px; border: 1px solid #e0e0e0; border-top: none;">
          <p style="margin: 0; color: #666; font-size: 0.9rem;">
            © 2024 Gezsek Travel. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    `
  }),

  // Yeni rezervasyon bildirimi
  newReservation: (userName, tourTitle, tourDate, participants, totalPrice) => ({
    subject: '📅 Yeni Rezervasyon Oluşturuldu',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #28a745, #00B8D4); color: white; padding: 2rem; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="margin: 0; font-size: 2rem;">📅 Yeni Rezervasyon</h1>
          <p style="margin: 0.5rem 0 0 0; font-size: 1.1rem;">Gezsek Travel</p>
        </div>
        
        <div style="background: white; padding: 2rem; border: 1px solid #e0e0e0; border-top: none;">
          <p style="font-size: 1.1rem; color: #333; margin-bottom: 1.5rem;">
            Merhaba <strong>${userName}</strong>,
          </p>
          
          <p style="font-size: 1rem; color: #555; line-height: 1.6; margin-bottom: 1.5rem;">
            <strong>${tourTitle}</strong> turu için rezervasyonunuz başarıyla oluşturulmuştur.
          </p>
          
          <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 8px; margin: 1.5rem 0;">
            <h3 style="color: #28a745; margin: 0 0 1rem 0;">📋 Rezervasyon Detayları</h3>
            <p style="margin: 0.5rem 0;"><strong>Tur:</strong> ${tourTitle}</p>
            <p style="margin: 0.5rem 0;"><strong>Tarih:</strong> ${tourDate}</p>
            <p style="margin: 0.5rem 0;"><strong>Katılımcı:</strong> ${participants} kişi</p>
            <p style="margin: 0.5rem 0;"><strong>Toplam Tutar:</strong> ₺${totalPrice}</p>
          </div>
          
          <p style="font-size: 1rem; color: #555; line-height: 1.6; margin-bottom: 1.5rem;">
            Rezervasyonunuz inceleme aşamasındadır. Onaylandığında size bilgi verilecektir.
          </p>
          
          <div style="text-align: center; margin: 2rem 0;">
            <a href="${process.env.FRONTEND_URL}/profile" 
               style="background: #28a745; color: white; padding: 1rem 2rem; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
              Rezervasyonlarımı Görüntüle
            </a>
          </div>
          
          <p style="font-size: 0.9rem; color: #888; text-align: center; margin-top: 2rem;">
            Bu email otomatik olarak gönderilmiştir. Lütfen yanıtlamayınız.
          </p>
        </div>
        
        <div style="background: #f8f9fa; padding: 1rem; text-align: center; border-radius: 0 0 12px 12px; border: 1px solid #e0e0e0; border-top: none;">
          <p style="margin: 0; color: #666; font-size: 0.9rem;">
            © 2024 Gezsek Travel. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    `
  }),

  // Tur hatırlatması
  tourReminder: (userName, tourTitle, tourDate, meetingPoint) => ({
    subject: '⏰ Tur Hatırlatması - Yarın Turunuz Var!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ffc107, #ff6f00); color: white; padding: 2rem; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="margin: 0; font-size: 2rem;">⏰ Tur Hatırlatması</h1>
          <p style="margin: 0.5rem 0 0 0; font-size: 1.1rem;">Gezsek Travel</p>
        </div>
        
        <div style="background: white; padding: 2rem; border: 1px solid #e0e0e0; border-top: none;">
          <p style="font-size: 1.1rem; color: #333; margin-bottom: 1.5rem;">
            Merhaba <strong>${userName}</strong>,
          </p>
          
          <p style="font-size: 1rem; color: #555; line-height: 1.6; margin-bottom: 1.5rem;">
            Yarın <strong>${tourTitle}</strong> turunuz var! Hazırlıklarınızı tamamlamayı unutmayın.
          </p>
          
          <div style="background: #fff3cd; padding: 1.5rem; border-radius: 8px; margin: 1.5rem 0; border-left: 4px solid #ffc107;">
            <h3 style="color: #856404; margin: 0 0 1rem 0;">📅 Tur Bilgileri</h3>
            <p style="margin: 0.5rem 0;"><strong>Tur:</strong> ${tourTitle}</p>
            <p style="margin: 0.5rem 0;"><strong>Tarih:</strong> ${tourDate}</p>
            <p style="margin: 0.5rem 0;"><strong>Buluşma Noktası:</strong> ${meetingPoint}</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 8px; margin: 1.5rem 0;">
            <h3 style="color: #00B8D4; margin: 0 0 1rem 0;">📋 Önemli Hatırlatmalar</h3>
            <ul style="margin: 0; padding-left: 1.5rem; color: #555;">
              <li>Kimlik belgenizi yanınızda bulundurun</li>
              <li>Rahat kıyafetler giyin</li>
              <li>Su ve atıştırmalık alın</li>
              <li>15 dakika önce buluşma noktasında olun</li>
            </ul>
          </div>
          
          <p style="font-size: 1rem; color: #555; line-height: 1.6; margin-bottom: 1.5rem;">
            Herhangi bir sorunuz olursa bizimle iletişime geçebilirsiniz.
          </p>
          
          <p style="font-size: 0.9rem; color: #888; text-align: center; margin-top: 2rem;">
            Bu email otomatik olarak gönderilmiştir. Lütfen yanıtlamayınız.
          </p>
        </div>
        
        <div style="background: #f8f9fa; padding: 1rem; text-align: center; border-radius: 0 0 12px 12px; border: 1px solid #e0e0e0; border-top: none;">
          <p style="margin: 0; color: #666; font-size: 0.9rem;">
            © 2024 Gezsek Travel. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    `
  })
};

// Email gönderme fonksiyonu
const sendEmail = async (to, template, data) => {
  try {
    const emailContent = emailTemplates[template](...data);
    
    if (isTestMode) {
      // Test modunda email göndermek yerine console'a yazdır
      console.log('📧 TEST MODU - Email gönderilecek:');
      console.log('To:', to);
      console.log('Subject:', emailContent.subject);
      console.log('Content:', emailContent.html);
      return { success: true, messageId: 'test-mode', testMode: true };
    }
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: emailContent.subject,
      html: emailContent.html
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email gönderildi:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Email gönderme hatası:', error);
    return { success: false, error: error.message };
  }
};

// Email servis fonksiyonları
const emailService = {
  // Rezervasyon onayı gönder
  sendReservationConfirmation: async (userEmail, userName, tourTitle, tourDate, reservationId) => {
    return await sendEmail(userEmail, 'reservationConfirmed', [userName, tourTitle, tourDate, reservationId]);
  },

  // Rezervasyon iptali gönder
  sendReservationCancellation: async (userEmail, userName, tourTitle, tourDate, reservationId) => {
    return await sendEmail(userEmail, 'reservationCancelled', [userName, tourTitle, tourDate, reservationId]);
  },

  // Yeni rezervasyon bildirimi gönder
  sendNewReservationNotification: async (userEmail, userName, tourTitle, tourDate, participants, totalPrice) => {
    return await sendEmail(userEmail, 'newReservation', [userName, tourTitle, tourDate, participants, totalPrice]);
  },

  // Tur hatırlatması gönder
  sendTourReminder: async (userEmail, userName, tourTitle, tourDate, meetingPoint) => {
    return await sendEmail(userEmail, 'tourReminder', [userName, tourTitle, tourDate, meetingPoint]);
  },

  // Özel email gönder
  sendCustomEmail: async (to, subject, html) => {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: to,
        subject: subject,
        html: html
      };

      const result = await transporter.sendMail(mailOptions);
      console.log('Özel email gönderildi:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Özel email gönderme hatası:', error);
      return { success: false, error: error.message };
    }
  }
};

module.exports = emailService; 