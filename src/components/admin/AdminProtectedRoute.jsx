import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminProtectedRoute = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminStatus = async () => {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');

      if (!token) {
        navigate('/admin');
        return;
      }

      if (user) {
        try {
          const userData = JSON.parse(user);
          if (userData.isAdmin) {
            setIsAdmin(true);
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error('User data parse error:', error);
        }
      }

      // Server'dan admin kontrolü
      try {
        const response = await fetch('/api/auth/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const userData = await response.json();
          if (userData.isAdmin) {
            setIsAdmin(true);
            setLoading(false);
            return;
          }
        }
      } catch (error) {
        console.error('Admin check error:', error);
      }

      // Admin değilse login sayfasına yönlendir
      navigate('/admin');
    };

    checkAdminStatus();
  }, [navigate]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem',
        color: 'var(--primary-turquoise)'
      }}>
        <div>
          <div className="loading-spinner" style={{ margin: '0 auto 1rem auto' }}></div>
          <p>Admin yetkisi kontrol ediliyor...</p>
        </div>
      </div>
    );
  }

  return isAdmin ? children : null;
};

export default AdminProtectedRoute; 