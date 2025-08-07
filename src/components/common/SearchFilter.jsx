import React, { useState, useEffect } from 'react';
import '../../App.css';

const SearchFilter = ({ onSearch, onClear }) => {
  const [filters, setFilters] = useState({
    query: '',
    category: 'all',
    minPrice: '',
    maxPrice: '',
    location: 'all',
    duration: '',
    participants: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const fetchFilterOptions = async () => {
    try {
      setLoading(true);
      const [categoriesRes, locationsRes] = await Promise.all([
        fetch('/api/tours/categories'),
        fetch('/api/tours/locations')
      ]);

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData.categories);
      }

      if (locationsRes.ok) {
        const locationsData = await locationsRes.json();
        setLocations(locationsData.locations);
      }
    } catch (error) {
      console.error('Filter options fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const activeFilters = Object.fromEntries(
      Object.entries(filters).filter(([key, value]) => 
        value && value !== 'all' && value !== ''
      )
    );
    onSearch(activeFilters);
  };

  const handleClear = () => {
    setFilters({
      query: '',
      category: 'all',
      minPrice: '',
      maxPrice: '',
      location: 'all',
      duration: '',
      participants: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    onClear();
  };

  const hasActiveFilters = () => {
    return Object.values(filters).some(value => 
      value && value !== 'all' && value !== ''
    );
  };

  return (
    <div className="search-filter-container">
      <form onSubmit={handleSearch} className="search-filter-form">
        {/* Ana Arama */}
        <div className="search-main">
          <div className="search-input-group">
            <input
              type="text"
              name="query"
              placeholder="🔍 Tur, lokasyon veya açıklama ara..."
              value={filters.query}
              onChange={handleInputChange}
              className="search-input"
            />
            <button type="submit" className="search-btn">
              Ara
            </button>
          </div>
          
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="advanced-toggle-btn"
          >
            {showAdvanced ? '🔽' : '🔼'} Gelişmiş Filtreler
          </button>
        </div>

        {/* Gelişmiş Filtreler */}
        {showAdvanced && (
          <div className="advanced-filters">
            <div className="filter-row">
              {/* Kategori */}
              <div className="filter-group">
                <label>📂 Kategori</label>
                <select
                  name="category"
                  value={filters.category}
                  onChange={handleInputChange}
                  className="filter-select"
                >
                  <option value="all">Tüm Kategoriler</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Lokasyon */}
              <div className="filter-group">
                <label>📍 Lokasyon</label>
                <select
                  name="location"
                  value={filters.location}
                  onChange={handleInputChange}
                  className="filter-select"
                >
                  <option value="all">Tüm Lokasyonlar</option>
                  {locations.map(location => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              {/* Süre */}
              <div className="filter-group">
                <label>⏱️ Süre</label>
                <input
                  type="text"
                  name="duration"
                  placeholder="Örn: 4 saat, 3 gün"
                  value={filters.duration}
                  onChange={handleInputChange}
                  className="filter-input"
                />
              </div>
            </div>

            <div className="filter-row">
              {/* Fiyat Aralığı */}
              <div className="filter-group price-range">
                <label>💰 Fiyat Aralığı</label>
                <div className="price-inputs">
                  <input
                    type="number"
                    name="minPrice"
                    placeholder="Min ₺"
                    value={filters.minPrice}
                    onChange={handleInputChange}
                    className="price-input"
                    min="0"
                  />
                  <span className="price-separator">-</span>
                  <input
                    type="number"
                    name="maxPrice"
                    placeholder="Max ₺"
                    value={filters.maxPrice}
                    onChange={handleInputChange}
                    className="price-input"
                    min="0"
                  />
                </div>
              </div>

              {/* Katılımcı Sayısı */}
              <div className="filter-group">
                <label>👥 Min. Katılımcı</label>
                <input
                  type="number"
                  name="participants"
                  placeholder="Kişi sayısı"
                  value={filters.participants}
                  onChange={handleInputChange}
                  className="filter-input"
                  min="1"
                />
              </div>

              {/* Sıralama */}
              <div className="filter-group">
                <label>📊 Sıralama</label>
                <select
                  name="sortBy"
                  value={filters.sortBy}
                  onChange={handleInputChange}
                  className="filter-select"
                >
                  <option value="createdAt">Tarih</option>
                  <option value="price">Fiyat</option>
                  <option value="title">İsim</option>
                  <option value="duration">Süre</option>
                </select>
                <select
                  name="sortOrder"
                  value={filters.sortOrder}
                  onChange={handleInputChange}
                  className="filter-select sort-order"
                >
                  <option value="desc">Azalan</option>
                  <option value="asc">Artan</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Filtre Aksiyonları */}
        <div className="filter-actions">
          {hasActiveFilters() && (
            <button
              type="button"
              onClick={handleClear}
              className="clear-filters-btn"
            >
              🗑️ Filtreleri Temizle
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default SearchFilter; 