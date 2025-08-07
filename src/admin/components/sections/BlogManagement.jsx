import React from 'react';
import './BlogManagement.css';

const BlogManagement = ({ blogs, fetchDashboardData }) => {
  return (
    <div className="blogs-section">
      <div className="section-header">
        <h2>Blog Yönetimi</h2>
        <div className="header-actions">
          <input
            type="text"
            placeholder="Blog ara..."
            className="search-input"
          />
          <button className="add-btn">
            ➕ Yeni Blog
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Başlık</th>
              <th>Yazar</th>
              <th>Kategori</th>
              <th>Durum</th>
              <th>Tarih</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {blogs && blogs.length > 0 ? (
              blogs.map(blog => (
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
                      <button className="edit-btn">✏️</button>
                      <button className="delete-btn">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                  Henüz blog bulunmuyor
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BlogManagement; 