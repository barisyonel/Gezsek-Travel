import React, { useEffect, useState } from 'react';
import BlogCard from './BlogCard';

const API_URL = 'http://localhost:5001/api/blog';

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        // API'den gelen data array veya { blogs: [...] } formatında olabilir
        const blogsArray = Array.isArray(data) ? data : (data.blogs || []);
        setBlogs(blogsArray);
        setLoading(false);
      })
      .catch(() => {
        setError('Yazılar alınamadı.');
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="blog-list">Yükleniyor...</div>;
  if (error) return <div className="blog-list blog-list-error">{error}</div>;

  return (
    <div className="blog-list">
      {blogs.map(blog => (
        <BlogCard key={blog._id} blog={blog} onDetail={setDetail} />
      ))}
      {detail && (
        <div className="blog-modal-bg" onClick={() => setDetail(null)}>
          <div className="blog-modal" onClick={e => e.stopPropagation()}>
            <button className="blog-modal-close" onClick={() => setDetail(null)}>&times;</button>
            <img src={detail.img} alt={detail.title} style={{width: '100%', height: 180, objectFit: 'cover', borderRadius: 12, marginBottom: 16}} />
            <h3 style={{fontSize: '1.3rem', fontWeight: 700, marginBottom: 8}}>{detail.title}</h3>
            <div style={{fontSize: '1.08rem', color: '#555', marginBottom: 8}}>{detail.author}</div>
            <div style={{fontSize: '1.05rem', color: 'var(--primary-turquoise)', marginBottom: 6}}>{new Date(detail.createdAt).toLocaleDateString()}</div>
            <div style={{fontSize: '1rem', color: '#333', marginBottom: 14, whiteSpace: 'pre-line'}}>{detail.content}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogList; 