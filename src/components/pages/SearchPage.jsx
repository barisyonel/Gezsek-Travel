import React, { useState, useEffect } from 'react';
import SearchFilter from '../common/SearchFilter';
import TourCard from '../tours/TourCard';
import '../../App.css';

const SearchPage = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12
  });
  const [currentFilters, setCurrentFilters] = useState({});

  useEffect(() => {
    // Sayfa yüklendiğinde tüm turları getir
    fetchTours();
  }, []);

  const fetchTours = async (filters = {}, page = 1) => {
    try {
      setLoading(true);
      setError('');

      // Query parametrelerini oluştur
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...filters
      });

      const response = await fetch(`/api/tours/search?${queryParams}`);
      const data = await response.json();

      if (response.ok) {
        setTours(data.tours);
        setPagination(data.pagination);
        setCurrentFilters(filters);
      } else {
        setError(data.message || 'Turlar yüklenirken hata oluştu');
      }
    } catch (err) {
      setError('Bağlantı hatası. Lütfen tekrar deneyin.');
      console.error('Fetch tours error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (filters) => {
    fetchTours(filters, 1);
  };

  const handleClear = () => {
    fetchTours({}, 1);
  };

  const handlePageChange = (page) => {
    fetchTours(currentFilters, page);
  };

  const handleTourDetail = (tour) => {
    // Tur detay modalını aç
    console.log('Tour detail:', tour);
  };

  const handleReservationSuccess = (reservation) => {
    // Rezervasyon başarılı mesajı
    console.log('Reservation success:', reservation);
  };

  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, pagination.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // İlk sayfa
    if (startPage > 1) {
      pages.push(
        <button
          key="first"
          onClick={() => handlePageChange(1)}
          className="pagination-btn"
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(<span key="dots1">...</span>);
      }
    }

    // Sayfa numaraları
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`pagination-btn ${i === pagination.currentPage ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }

    // Son sayfa
    if (endPage < pagination.totalPages) {
      if (endPage < pagination.totalPages - 1) {
        pages.push(<span key="dots2">...</span>);
      }
      pages.push(
        <button
          key="last"
          onClick={() => handlePageChange(pagination.totalPages)}
          className="pagination-btn"
        >
          {pagination.totalPages}
        </button>
      );
    }

    return (
      <div className="pagination">
        <button
          onClick={() => handlePageChange(pagination.currentPage - 1)}
          disabled={pagination.currentPage === 1}
          className="pagination-btn"
        >
          ← Önceki
        </button>
        
        {pages}
        
        <button
          onClick={() => handlePageChange(pagination.currentPage + 1)}
          disabled={pagination.currentPage === pagination.totalPages}
          className="pagination-btn"
        >
          Sonraki →
        </button>
      </div>
    );
  };

  return (
    <div className="search-page">
      <div className="search-page-header">
        <h1>🔍 Tur Ara</h1>
        <p>Hayalindeki tatili bulmak için arama yap veya filtreleri kullan</p>
      </div>

      {/* Arama ve Filtreleme */}
      <SearchFilter 
        onSearch={handleSearch}
        onClear={handleClear}
      />

      {/* Arama Sonuçları */}
      <div className="search-results">
        {loading ? (
          <div className="search-loading">
            <div className="loading-spinner"></div>
            <p>Turlar aranıyor...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            {error}
            <button onClick={() => fetchTours()} className="retry-btn">
              Tekrar Dene
            </button>
          </div>
        ) : tours.length === 0 ? (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3>Arama Sonucu Bulunamadı</h3>
            <p>
              Arama kriterlerinize uygun tur bulunamadı. 
              Filtrelerinizi değiştirerek tekrar deneyebilirsiniz.
            </p>
            <button onClick={handleClear} className="browse-tours-btn">
              Tüm Turları Gör
            </button>
          </div>
        ) : (
          <>
            {/* Sonuç Başlığı */}
            <div className="search-results-header">
              <div className="results-count">
                {pagination.totalItems} tur bulundu
                {Object.keys(currentFilters).length > 0 && (
                  <span className="filter-indicator">
                    (filtrelenmiş)
                  </span>
                )}
              </div>
              <div className="results-sort">
                <span>Sırala:</span>
                <select 
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-');
                    handleSearch({ ...currentFilters, sortBy, sortOrder });
                  }}
                  defaultValue="createdAt-desc"
                >
                  <option value="createdAt-desc">En Yeni</option>
                  <option value="price-asc">Fiyat (Düşük-Yüksek)</option>
                  <option value="price-desc">Fiyat (Yüksek-Düşük)</option>
                  <option value="title-asc">İsim (A-Z)</option>
                  <option value="duration-asc">Süre (Kısa-Uzun)</option>
                </select>
              </div>
            </div>

            {/* Tur Listesi */}
            <div className="tours-grid">
              {tours.map(tour => (
                <TourCard
                  key={tour._id}
                  tour={tour}
                  onDetail={handleTourDetail}
                  onPurchaseSuccess={handleReservationSuccess}
                />
              ))}
            </div>

            {/* Sayfalama */}
            {renderPagination()}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchPage; 