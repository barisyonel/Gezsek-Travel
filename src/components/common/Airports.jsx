import React, { useState } from 'react';
import '../../App.css';

const API_KEY = 'demo'; // Gerçek kullanımda kendi API anahtarını girmen gerekir

const Airports = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setResults([]);
    try {
      const res = await fetch(`https://airlabs.co/api/v9/airports?api_key=${API_KEY}&search=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.response && data.response.length > 0) {
        setResults(data.response);
      } else {
        setResults([]);
        setError('Sonuç bulunamadı.');
      }
    } catch {
      setError('Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="ucak" className="airports-section">
      <div className="airports-container">
        <h2>Havalimanı Arama</h2>
        <form className="airports-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Ülke, şehir veya havalimanı adı yazın..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button type="submit">Ara</button>
        </form>
        {loading && <div className="airports-loading">Yükleniyor...</div>}
        {error && <div className="airports-error">{error}</div>}
        <div className="airports-results">
          {results.map((airport, i) => (
            <div className="airport-card" key={airport.iata_code + i}>
              <div className="airport-title">{airport.name}</div>
              <div className="airport-info">
                <span><b>Kod:</b> {airport.iata_code || '-'}</span>
                <span><b>Şehir:</b> {airport.city || '-'}</span>
                <span><b>Ülke:</b> {airport.country_name || '-'}</span>
              </div>
              {airport.lat && airport.lng && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${airport.lat},${airport.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="airport-map-link"
                >
                  Haritada Göster
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Airports; 