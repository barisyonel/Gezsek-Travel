import { useState } from 'react';

export const useUserManagement = ({ users, fetchDashboardData, setShowUserModal, setShowEditUserModal, setSelectedUser }) => {
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    birthDate: '',
    gender: 'erkek',
    isAdmin: false
  });

  const [editUserForm, setEditUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    verified: true,
    isAdmin: false
  });

  const handleUserFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUserForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        return;
      }

      const response = await fetch('/api/auth/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userForm)
      });

      if (response.ok) {
        const newUser = await response.json();
        setUserForm({
          name: '',
          email: '',
          phone: '',
          password: '',
          birthDate: '',
          gender: 'erkek',
          isAdmin: false
        });
        setShowUserModal(false);
        alert('Kullanıcı başarıyla eklendi!');
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        const error = await response.json();
        alert(error.message || 'Kullanıcı eklenirken hata oluştu');
      }
    } catch (err) {
      alert('Kullanıcı eklenirken hata oluştu');
      console.error('Add user error:', err);
    }
  };

  const handleEditUserFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditUserForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditUserForm({
      name: user.name,
      email: user.email,
      phone: user.phone,
      verified: user.verified,
      isAdmin: user.isAdmin
    });
    setShowEditUserModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        return;
      }

      const response = await fetch(`/api/auth/admin/users/${selectedUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editUserForm)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setShowEditUserModal(false);
        setSelectedUser(null);
        alert('Kullanıcı başarıyla güncellendi!');
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        const error = await response.json();
        alert(error.message || 'Kullanıcı güncellenirken hata oluştu');
      }
    } catch (err) {
      alert('Kullanıcı güncellenirken hata oluştu');
      console.error('Update user error:', err);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`${userName} kullanıcısını silmek istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        return;
      }

      const response = await fetch(`/api/auth/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('Kullanıcı başarıyla silindi!');
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        const error = await response.json();
        alert(error.message || 'Kullanıcı silinirken hata oluştu');
      }
    } catch (err) {
      alert('Kullanıcı silinirken hata oluştu');
      console.error('Delete user error:', err);
    }
  };

  return {
    userForm,
    editUserForm,
    handleUserFormChange,
    handleEditUserFormChange,
    handleAddUser,
    handleUpdateUser,
    handleDeleteUser,
    handleEditUser
  };
}; 