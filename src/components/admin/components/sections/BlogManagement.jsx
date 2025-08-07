import React, { useState } from 'react';
import BlogModal from '../modals/BlogModal';
import { useBlogManagement } from '../../hooks/useBlogManagement';
import './BlogManagement.css';

const BlogManagement = ({ blogs, fetchDashboardData }) => {
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [showEditBlogModal, setShowEditBlogModal] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [blogFilters, setBlogFilters] = useState({ search: '', status: 'all', category: 'all' });

  const {
    blogForm,
    editBlogForm,
    handleBlogFormChange,
    handleEditBlogFormChange,
    handleAddBlog,
    handleUpdateBlog,
    handleDeleteBlog,
    handleEditBlog
  } = useBlogManagement({ blogs, fetchDashboardData, setShowBlogModal, setShowEditBlogModal, setSelectedBlog });

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title?.toLowerCase().includes(blogFilters.search.toLowerCase()) ||
                         blog.author?.toLowerCase().includes(blogFilters.search.toLowerCase());
    const matchesStatus = blogFilters.status === 'all' || 
                         (blogFilters.status === 'published' && blog.isPublished) ||
                         (blogFilters.status === 'draft' && !blog.isPublished);
    const matchesCategory = blogFilters.category === 'all' || blog.category === blogFilters.category;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="blogs-section">
      <div className="section-header">
        <h2>Blog Yönetimi</h2>
        <div className="header-actions">
          <input
            type="text"
            placeholder="Blog ara..."
            value={blogFilters.search}
            onChange={(e) => setBlogFilters({...blogFilters, search: e.target.value})}
            className="search-input"
          />
          <select
            value={blogFilters.status}
            onChange={(e) => setBlogFilters({...blogFilters, status: e.target.value})}
            className="filter-select"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="published">Yayında</option>
            <option value="draft">Taslak</option>
          </select>
          <select
            value={blogFilters.category}
            onChange={(e) => setBlogFilters({...blogFilters, category: e.target.value})}
            className="filter-select"
          >
            <option value="all">Tüm Kategoriler</option>
            <option value="Seyahat">Seyahat</option>
            <option value="Kültür">Kültür</option>
            <option value="Yemek">Yemek</option>
            <option value="Doğa">Doğa</option>
            <option value="Tarih">Tarih</option>
            <option value="Teknoloji">Teknoloji</option>
          </select>
          <button onClick={() => setShowBlogModal(true)} className="add-btn">
            ➕ Yeni Blog
          </button>
        </div>
      </div>

      {/* Debug bilgisi */}
      <div style={{ background: '#f0f0f0', padding: '10px', marginBottom: '20px', borderRadius: '5px' }}>
        <strong>Debug:</strong> {filteredBlogs?.length || 0} blog bulundu
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th><span>Başlık</span></th>
              <th><span>Yazar</span></th>
              <th><span>Kategori</span></th>
              <th><span>Durum</span></th>
              <th><span>Tarih</span></th>
              <th><span>İşlemler</span></th>
            </tr>
          </thead>
          <tbody>
            {filteredBlogs && filteredBlogs.length > 0 ? (
              filteredBlogs.map(blog => (
                <tr key={blog._id}>
                  <td>{blog.title}</td>
                  <td>{blog.author}</td>
                  <td>{blog.category}</td>
                  <td>
                    <span className={`status-badge ${blog.isPublished ? 'active' : 'inactive'}`}>
                      {blog.isPublished ? 'Yayında' : 'Taslak'}
                    </span>
                  </td>
                  <td>{new Date(blog.createdAt).toLocaleDateString('tr-TR')}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="edit-btn"
                        onClick={() => handleEditBlog(blog)}
                        title="Düzenle"
                      >
                        ✏️ Düzenle
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteBlog(blog._id, blog.title)}
                        title="Sil"
                      >
                        🗑️ Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                  Blog bulunamadı
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Blog Modal */}
      {showBlogModal && (
        <BlogModal
          isOpen={showBlogModal}
          onClose={() => setShowBlogModal(false)}
          formData={blogForm}
          onChange={handleBlogFormChange}
          onSubmit={handleAddBlog}
          title="Yeni Blog Ekle"
          submitText="Blog Ekle"
        />
      )}

      {/* Edit Blog Modal */}
      {showEditBlogModal && (
        <BlogModal
          isOpen={showEditBlogModal}
          onClose={() => setShowEditBlogModal(false)}
          formData={editBlogForm}
          onChange={handleEditBlogFormChange}
          onSubmit={handleUpdateBlog}
          title="Blog Düzenle"
          submitText="Güncelle"
          isEdit={true}
        />
      )}
    </div>
  );
};

export default BlogManagement; 