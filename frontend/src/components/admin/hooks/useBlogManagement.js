import { useState } from 'react';

export const useBlogManagement = ({ blogs, fetchDashboardData, setShowBlogModal, setShowEditBlogModal, setSelectedBlog }) => {
  const [blogForm, setBlogForm] = useState({
    title: '',
    content: '',
    excerpt: '',
    author: 'Gezsek Travel',
    category: '',
    tags: '',
    img: '',
    isPublished: true,
    featured: false
  });

  const [editBlogForm, setEditBlogForm] = useState({
    title: '',
    content: '',
    excerpt: '',
    author: '',
    category: '',
    tags: '',
    img: '',
    isPublished: true,
    featured: false
  });

  const handleBlogFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBlogForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddBlog = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        return;
      }

      // Tags'ı array'e çevir
      const tagsArray = blogForm.tags ? blogForm.tags.split(',').map(tag => tag.trim()) : [];

      const response = await fetch('/api/blog/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...blogForm,
          tags: tagsArray
        })
      });

      if (response.ok) {
        const newBlog = await response.json();
        setBlogForm({
          title: '',
          content: '',
          excerpt: '',
          author: 'Gezsek Travel',
          category: '',
          tags: '',
          img: '',
          isPublished: true,
          featured: false
        });
        setShowBlogModal(false);
        alert('Blog başarıyla eklendi!');
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        const error = await response.json();
        alert(error.message || 'Blog eklenirken hata oluştu');
      }
    } catch (err) {
      alert('Blog eklenirken hata oluştu');
      console.error('Add blog error:', err);
    }
  };

  const handleEditBlogFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditBlogForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEditBlog = (blog) => {
    setSelectedBlog(blog);
    setEditBlogForm({
      title: blog.title,
      content: blog.content,
      excerpt: blog.excerpt || '',
      author: blog.author,
      category: blog.category || '',
      tags: blog.tags ? blog.tags.join(', ') : '',
      img: blog.img || '',
      isPublished: blog.isPublished,
      featured: blog.featured || false
    });
    setShowEditBlogModal(true);
  };

  const handleUpdateBlog = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        return;
      }

      // Tags'ı array'e çevir
      const tagsArray = editBlogForm.tags ? editBlogForm.tags.split(',').map(tag => tag.trim()) : [];

      const response = await fetch(`/api/blog/admin/${selectedBlog._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...editBlogForm,
          tags: tagsArray
        })
      });

      if (response.ok) {
        const updatedBlog = await response.json();
        setShowEditBlogModal(false);
        setSelectedBlog(null);
        alert('Blog başarıyla güncellendi!');
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        const error = await response.json();
        alert(error.message || 'Blog güncellenirken hata oluştu');
      }
    } catch (err) {
      alert('Blog güncellenirken hata oluştu');
      console.error('Update blog error:', err);
    }
  };

  const handleDeleteBlog = async (blogId, blogTitle) => {
    if (!window.confirm(`${blogTitle} blogunu silmek istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        return;
      }

      const response = await fetch(`/api/blog/admin/${blogId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('Blog başarıyla silindi!');
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        const error = await response.json();
        alert(error.message || 'Blog silinirken hata oluştu');
      }
    } catch (err) {
      alert('Blog silinirken hata oluştu');
      console.error('Delete blog error:', err);
    }
  };

  return {
    blogForm,
    editBlogForm,
    handleBlogFormChange,
    handleEditBlogFormChange,
    handleAddBlog,
    handleUpdateBlog,
    handleDeleteBlog,
    handleEditBlog
  };
}; 