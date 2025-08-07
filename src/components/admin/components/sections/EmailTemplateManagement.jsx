import React, { useState, useEffect } from 'react';
import EmailTemplateModal from '../modals/EmailTemplateModal';
import EmailTemplatePreviewModal from '../modals/EmailTemplatePreviewModal';
import EmailTemplateTestModal from '../modals/EmailTemplateTestModal';
import './EmailTemplateManagement.css';

const EmailTemplateManagement = () => {
  const [templates, setTemplates] = useState([]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [themes, setThemes] = useState([]);
  const [popularTemplates, setPopularTemplates] = useState([]);
  const [recentTemplates, setRecentTemplates] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    status: 'all',
    createdBy: 'all'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchTemplates();
    fetchCategories();
    fetchThemes();
    fetchPopularTemplates();
    fetchRecentTemplates();
  }, [filters, pagination.page]);

  const fetchTemplates = async () => {
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== 'all')
        )
      });

      const response = await fetch(`/api/email-templates/admin?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates);
        setPagination(prev => ({
          ...prev,
          total: data.total,
          pages: data.pages
        }));
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/email-templates/admin/categories', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchThemes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/email-templates/admin/themes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setThemes(data);
      }
    } catch (error) {
      console.error('Error fetching themes:', error);
    }
  };

  const fetchPopularTemplates = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/email-templates/admin/popular', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPopularTemplates(data);
      }
    } catch (error) {
      console.error('Error fetching popular templates:', error);
    }
  };

  const fetchRecentTemplates = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/email-templates/admin/recent', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRecentTemplates(data);
      }
    } catch (error) {
      console.error('Error fetching recent templates:', error);
    }
  };

  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setShowTemplateModal(true);
  };

  const handleEditTemplate = (template) => {
    setEditingTemplate(template);
    setShowTemplateModal(true);
  };

  const handlePreviewTemplate = (template) => {
    setSelectedTemplate(template);
    setShowPreviewModal(true);
  };

  const handleTestTemplate = (template) => {
    setSelectedTemplate(template);
    setShowTestModal(true);
  };

  const handleDuplicateTemplate = async (templateId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/email-templates/admin/${templateId}/duplicate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchTemplates();
        alert('Şablon başarıyla kopyalandı!');
      } else {
        const error = await response.json();
        alert(error.message || 'Kopyalama hatası');
      }
    } catch (error) {
      console.error('Error duplicating template:', error);
      alert('Kopyalama hatası');
    }
  };

  const handleSaveTemplate = async (templateData) => {
    try {
      const token = localStorage.getItem('token');
      const url = editingTemplate
        ? `/api/email-templates/admin/${editingTemplate._id}`
        : '/api/email-templates/admin';

      const method = editingTemplate ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(templateData)
      });

      if (response.ok) {
        setShowTemplateModal(false);
        setEditingTemplate(null);
        fetchTemplates();
        alert(editingTemplate ? 'Şablon güncellendi!' : 'Şablon oluşturuldu!');
      } else {
        const error = await response.json();
        alert(error.message || 'Bir hata oluştu');
      }
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Bir hata oluştu');
    }
  };

  const handleDeleteTemplate = async (templateId, templateName) => {
    if (!window.confirm(`${templateName} şablonunu silmek istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/email-templates/admin/${templateId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchTemplates();
        alert('Şablon silindi!');
      } else {
        const error = await response.json();
        alert(error.message || 'Silme hatası');
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Silme hatası');
    }
  };

  const getCategoryIcon = (category) => {
    const categoryData = categories.find(c => c.value === category);
    return categoryData ? categoryData.icon : '📧';
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'notification': return '#17a2b8';
      case 'reservation': return '#28a745';
      case 'marketing': return '#fd7e14';
      case 'system': return '#6c757d';
      case 'welcome': return '#20c997';
      case 'reminder': return '#ffc107';
      case 'custom': return '#6f42c1';
      default: return '#6c757d';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#28a745';
      case 'inactive': return '#6c757d';
      case 'draft': return '#ffc107';
      default: return '#6c757d';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'html': return '🌐';
      case 'text': return '📝';
      case 'mjml': return '📧';
      default: return '📧';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR') + ' ' + date.toLocaleTimeString('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  return (
    <div className="email-template-management-section">
      <div className="section-header">
        <h2>📧 Email Template Yönetimi</h2>
        <div className="header-actions">
          <button onClick={handleCreateTemplate} className="add-btn">
            ➕ Yeni Şablon
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="stat-card">
          <div className="stat-icon">📧</div>
          <div className="stat-content">
            <h4>Toplam Şablon</h4>
            <p>{pagination.total}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h4>Aktif Şablonlar</h4>
            <p>{templates.filter(t => t.status === 'active').length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h4>Popüler Şablonlar</h4>
            <p>{popularTemplates.length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🕒</div>
          <div className="stat-content">
            <h4>Son Kullanılan</h4>
            <p>{recentTemplates.length}</p>
          </div>
        </div>
      </div>

      {/* Popular Templates */}
      {popularTemplates.length > 0 && (
        <div className="popular-templates-section">
          <h3>🏆 Popüler Şablonlar</h3>
          <div className="popular-templates-grid">
            {popularTemplates.slice(0, 4).map((template) => (
              <div key={template._id} className="popular-template-card">
                <div className="template-header">
                  <span className="template-icon">{getCategoryIcon(template.category)}</span>
                  <span className="template-name">{template.name}</span>
                </div>
                <div className="template-stats">
                  <span className="stat">Gönderim: {template.usage.totalSent}</span>
                  <span className="stat">Başarı: {template.usage.successRate}%</span>
                </div>
                <div className="template-actions">
                  <button 
                    onClick={() => handlePreviewTemplate(template)}
                    className="action-btn preview-btn"
                    title="Önizle"
                  >
                    👁️
                  </button>
                  <button 
                    onClick={() => handleEditTemplate(template)}
                    className="action-btn edit-btn"
                    title="Düzenle"
                  >
                    ✏️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Şablon ara..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="search-input"
          />
        </div>
        <div className="filter-group">
          <select
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            className="filter-select"
          >
            <option value="all">Tüm Kategoriler</option>
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.icon} {category.label}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="filter-select"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="active">Aktif</option>
            <option value="inactive">Pasif</option>
            <option value="draft">Taslak</option>
          </select>
        </div>
      </div>

      {/* Templates Table */}
      <div className="templates-table-container">
        <table className="templates-table">
          <thead>
            <tr>
              <th>Kategori</th>
              <th>İsim</th>
              <th>Konu</th>
              <th>Tür</th>
              <th>Durum</th>
              <th>Oluşturan</th>
              <th>Son Güncelleme</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {templates.map((template) => (
              <tr key={template._id}>
                <td>
                  <span 
                    className="category-badge"
                    style={{ backgroundColor: getCategoryColor(template.category) }}
                  >
                    {getCategoryIcon(template.category)} {template.category}
                  </span>
                </td>
                <td>
                  <div className="template-info">
                    <div className="template-name">{template.name}</div>
                    <div className="template-description">{template.description}</div>
                  </div>
                </td>
                <td>
                  <div className="subject-text">{template.subject}</div>
                </td>
                <td>
                  <span className="type-badge">
                    {getTypeIcon(template.type)} {template.type}
                  </span>
                </td>
                <td>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(template.status) }}
                  >
                    {template.status}
                  </span>
                </td>
                <td>
                  <div className="creator-info">
                    <div className="creator-name">{template.createdBy?.name}</div>
                    <div className="creator-email">{template.createdBy?.email}</div>
                  </div>
                </td>
                <td>
                  <div className="date-info">
                    <div className="date">{formatDate(template.updatedAt)}</div>
                    <div className="version">v{template.version.current}</div>
                  </div>
                </td>
                <td>
                  <div className="template-actions">
                    <button 
                      onClick={() => handlePreviewTemplate(template)}
                      className="action-btn preview-btn"
                      title="Önizle"
                    >
                      👁️
                    </button>
                    <button 
                      onClick={() => handleTestTemplate(template)}
                      className="action-btn test-btn"
                      title="Test Et"
                    >
                      🧪
                    </button>
                    <button 
                      onClick={() => handleDuplicateTemplate(template._id)}
                      className="action-btn duplicate-btn"
                      title="Kopyala"
                    >
                      📋
                    </button>
                    <button 
                      onClick={() => handleEditTemplate(template)}
                      className="action-btn edit-btn"
                      title="Düzenle"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => handleDeleteTemplate(template._id, template.name)}
                      className="action-btn delete-btn"
                      title="Sil"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            disabled={pagination.page === 1}
            className="pagination-btn"
          >
            ← Önceki
          </button>
          
          <span className="pagination-info">
            Sayfa {pagination.page} / {pagination.pages} ({pagination.total} şablon)
          </span>
          
          <button 
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={pagination.page === pagination.pages}
            className="pagination-btn"
          >
            Sonraki →
          </button>
        </div>
      )}

      {/* Empty State */}
      {templates.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📧</div>
          <h3>Henüz email şablonu yok</h3>
          <p>Profesyonel email şablonları oluşturmaya başlayın</p>
        </div>
      )}

      {/* Email Template Modal */}
      {showTemplateModal && (
        <EmailTemplateModal
          isOpen={showTemplateModal}
          onClose={() => setShowTemplateModal(false)}
          template={editingTemplate}
          onSave={handleSaveTemplate}
          categories={categories}
          themes={themes}
          title={editingTemplate ? 'Şablon Düzenle' : 'Yeni Şablon Oluştur'}
        />
      )}

      {/* Email Template Preview Modal */}
      {showPreviewModal && selectedTemplate && (
        <EmailTemplatePreviewModal
          isOpen={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          template={selectedTemplate}
        />
      )}

      {/* Email Template Test Modal */}
      {showTestModal && selectedTemplate && (
        <EmailTemplateTestModal
          isOpen={showTestModal}
          onClose={() => setShowTestModal(false)}
          template={selectedTemplate}
        />
      )}
    </div>
  );
};

export default EmailTemplateManagement; 