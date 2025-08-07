import React, { useState } from 'react';
import './EmailTest.css';

const EmailTest = () => {
  const [emailType, setEmailType] = useState('new-reservation');
  const [testEmail, setTestEmail] = useState('');
  const [testName, setTestName] = useState('');
  const [testTour, setTestTour] = useState('Test Turu');
  const [testDate, setTestDate] = useState('2024-12-25');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleEmailTest = async () => {
    try {
      setLoading(true);
      setResult(null);
      
      const token = localStorage.getItem('token');
      const response = await fetch('/api/tours/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          emailType,
          userEmail: testEmail,
          userName: testName,
          tourTitle: testTour,
          tourDate: testDate
        })
      });

      const data = await response.json();
      setResult(data);
      
      if (!data.error) {
        alert('Email test başarıyla gönderildi!');
      }
    } catch (err) {
      setResult({ error: 'Email test hatası' });
      console.error('Email test error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="email-test-section">
      <div className="section-header">
        <h2>📧 Email Test Paneli</h2>
        <p>Email template'lerini test etmek için kullanın</p>
      </div>

      <div className="email-test-form">
        <div className="form-group">
          <label>Email Tipi:</label>
          <select 
            value={emailType} 
            onChange={(e) => setEmailType(e.target.value)}
            className="form-select"
          >
            <option value="new-reservation">Yeni Rezervasyon</option>
            <option value="reservation-confirmed">Rezervasyon Onaylandı</option>
            <option value="reservation-cancelled">Rezervasyon İptal Edildi</option>
            <option value="welcome">Hoş Geldin Email'i</option>
            <option value="password-reset">Şifre Sıfırlama</option>
          </select>
        </div>

        <div className="form-group">
          <label>Test Email Adresi:</label>
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="test@example.com"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Test Kullanıcı Adı:</label>
          <input
            type="text"
            value={testName}
            onChange={(e) => setTestName(e.target.value)}
            placeholder="Test Kullanıcı"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Test Tur Adı:</label>
          <input
            type="text"
            value={testTour}
            onChange={(e) => setTestTour(e.target.value)}
            placeholder="Test Turu"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Test Tur Tarihi:</label>
          <input
            type="date"
            value={testDate}
            onChange={(e) => setTestDate(e.target.value)}
            className="form-input"
          />
        </div>

        <div className="form-actions">
          <button 
            onClick={handleEmailTest}
            disabled={loading || !testEmail}
            className="btn-primary"
          >
            {loading ? 'Gönderiliyor...' : '📧 Test Email Gönder'}
          </button>
        </div>

        {result && (
          <div className={`result-message ${result.error ? 'error' : 'success'}`}>
            <h4>{result.error ? '❌ Hata' : '✅ Başarılı'}</h4>
            <p>{result.error || result.message || 'Email başarıyla gönderildi!'}</p>
            {result.details && (
              <pre>{JSON.stringify(result.details, null, 2)}</pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailTest; 