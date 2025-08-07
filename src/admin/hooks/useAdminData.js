import { useState, useCallback } from 'react';

export const useAdminData = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Data states
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [tours, setTours] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      
      const [statsRes, usersRes, toursRes, blogsRes, reservationsRes, activitiesRes] = await Promise.all([
        fetch('/api/auth/admin/stats', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/auth/admin/users', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/tours/admin', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/blog/admin/all', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/tours/admin/reservations', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/activities', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
      if (toursRes.ok) {
        const toursData = await toursRes.json();
        setTours(toursData.tours || toursData || []);
      }
      if (blogsRes.ok) setBlogs(await blogsRes.json());
      if (reservationsRes.ok) {
        const reservationsData = await reservationsRes.json();
        setReservations(reservationsData.reservations || reservationsData);
      }
      if (activitiesRes.ok) setRecentActivities(await activitiesRes.json());
      
    } catch (err) {
      setError('Veriler yüklenirken hata oluştu');
      console.error('Fetch dashboard data error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    stats,
    users,
    tours,
    blogs,
    reservations,
    recentActivities,
    fetchDashboardData,
    setUsers,
    setTours,
    setBlogs,
    setReservations
  };
}; 