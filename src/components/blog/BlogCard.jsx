import React from 'react';

const BlogCard = ({ blog, onDetail }) => {
  return (
    <div className="blog-card">
      <img src={blog.img} alt={blog.title} style={{width: '100%', height: 100, objectFit: 'cover', borderRadius: 10, marginBottom: 8}} />
      <div className="blog-title">{blog.title}</div>
      <div className="blog-meta">{blog.author} &bull; {new Date(blog.createdAt).toLocaleDateString()}</div>
      <div className="blog-snippet">{blog.content.slice(0, 100)}...</div>
      <button className="blog-detail-btn" onClick={() => onDetail(blog)}>Detay</button>
    </div>
  );
};

export default BlogCard; 