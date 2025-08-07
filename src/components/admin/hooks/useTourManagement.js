import { useState } from 'react';

export const useTourManagement = ({ tours, fetchDashboardData, setShowTourModal, setShowEditTourModal, setSelectedTour }) => {
  const [tourForm, setTourForm] = useState({
    title: '',
    description: '',
    price: '',
    duration: '',
    location: '',
    category: '',
    highlights: '',
    dates: '',
    maxParticipants: 20,
    image: '',
    isActive: true
  });

  const [editTourForm, setEditTourForm] = useState({
    title: '',
    description: '',
    price: '',
    duration: '',
    location: '',
    category: '',
    highlights: '',
    dates: '',
    maxParticipants: 20,
    image: '',
    isActive: true
  });

  const handleTourFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTourForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddTour = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        return;
      }

      const response = await fetch('/api/tours', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...tourForm,
          price: parseInt(tourForm.price),
          maxParticipants: parseInt(tourForm.maxParticipants)
        })
      });

      if (response.ok) {
        const newTour = await response.json();
        setTourForm({
          title: '',
          description: '',
          price: '',
          duration: '',
          location: '',
          category: '',
          highlights: '',
          dates: '',
          maxParticipants: 20,
          image: '',
          isActive: true
        });
        setShowTourModal(false);
        alert('Tur başarıyla eklendi!');
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        const error = await response.json();
        alert(error.message || 'Tur eklenirken hata oluştu');
      }
    } catch (err) {
      alert('Tur eklenirken hata oluştu');
      console.error('Add tour error:', err);
    }
  };

  const handleEditTourFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditTourForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEditTour = (tour) => {
    setSelectedTour(tour);
    setEditTourForm({
      title: tour.title,
      description: tour.description,
      price: tour.price.toString(),
      duration: tour.duration,
      location: tour.location,
      category: tour.category,
      highlights: tour.highlights || '',
      dates: tour.dates || '',
      maxParticipants: tour.maxParticipants || 20,
      image: tour.image,
      isActive: tour.isActive
    });
    setShowEditTourModal(true);
  };

  const handleUpdateTour = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        return;
      }

      const response = await fetch(`/api/tours/${selectedTour._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...editTourForm,
          price: parseInt(editTourForm.price),
          maxParticipants: parseInt(editTourForm.maxParticipants)
        })
      });

      if (response.ok) {
        const updatedTour = await response.json();
        setShowEditTourModal(false);
        setSelectedTour(null);
        alert('Tur başarıyla güncellendi!');
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        const error = await response.json();
        alert(error.message || 'Tur güncellenirken hata oluştu');
      }
    } catch (err) {
      alert('Tur güncellenirken hata oluştu');
      console.error('Update tour error:', err);
    }
  };

  const handleDeleteTour = async (tourId, tourTitle) => {
    if (!window.confirm(`${tourTitle} turunu silmek istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        return;
      }

      const response = await fetch(`/api/tours/${tourId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('Tur başarıyla silindi!');
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        const error = await response.json();
        alert(error.message || 'Tur silinirken hata oluştu');
      }
    } catch (err) {
      alert('Tur silinirken hata oluştu');
      console.error('Delete tour error:', err);
    }
  };

  return {
    tourForm,
    editTourForm,
    handleTourFormChange,
    handleEditTourFormChange,
    handleAddTour,
    handleUpdateTour,
    handleDeleteTour,
    handleEditTour
  };
}; 