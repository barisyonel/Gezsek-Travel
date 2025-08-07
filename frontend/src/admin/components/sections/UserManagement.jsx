import React, { useState } from 'react';
import UserModal from '../modals/UserModal';
import { useUserManagement } from '../../hooks/useUserManagement';
import './UserManagement.css';

const UserManagement = ({ users, fetchDashboardData }) => {
  const [showUserModal, setShowUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userFilters, setUserFilters] = useState({ search: '', status: 'all', role: 'all' });

  const {
    userForm,
    editUserForm,
    handleUserFormChange,
    handleEditUserFormChange,
    handleAddUser,
    handleUpdateUser,
    handleDeleteUser,
    handleEditUser
  } = useUserManagement({ users, fetchDashboardData, setShowUserModal, setShowEditUserModal, setSelectedUser });

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(userFilters.search.toLowerCase()) ||
                         user.email?.toLowerCase().includes(userFilters.search.toLowerCase());
    const matchesStatus = userFilters.status === 'all' || 
                         (userFilters.status === 'verified' && user.verified) ||
                         (userFilters.status === 'unverified' && !user.verified);
    const matchesRole = userFilters.role === 'all' ||
                       (userFilters.role === 'admin' && user.isAdmin) ||
                       (userFilters.role === 'user' && !user.isAdmin);
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  return (
    <div className="users-section">
      <div className="section-header">
        <h2>Kullanıcı Yönetimi</h2>
        <div className="header-actions">
          <input
            type="text"
            placeholder="Kullanıcı ara..."
            value={userFilters.search}
            onChange={(e) => setUserFilters({...userFilters, search: e.target.value})}
            className="search-input"
          />
          <select
            value={userFilters.status}
            onChange={(e) => setUserFilters({...userFilters, status: e.target.value})}
            className="filter-select"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="verified">Doğrulanmış</option>
            <option value="unverified">Doğrulanmamış</option>
          </select>
          <select
            value={userFilters.role}
            onChange={(e) => setUserFilters({...userFilters, role: e.target.value})}
            className="filter-select"
          >
            <option value="all">Tüm Roller</option>
            <option value="admin">Admin</option>
            <option value="user">Kullanıcı</option>
          </select>
          <button onClick={() => setShowUserModal(true)} className="add-btn">
            ➕ Yeni Kullanıcı
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Kullanıcı</th>
              <th>Email</th>
              <th>Telefon</th>
              <th>Durum</th>
              <th>Rol</th>
              <th>Kayıt Tarihi</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user._id}>
                <td>
                  <div className="user-info">
                    <div className="user-avatar">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="user-name">{user.name}</div>
                    </div>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>{user.phone || '-'}</td>
                <td>
                  <span className={`status-badge ${user.verified ? 'active' : 'inactive'}`}>
                    {user.verified ? 'Doğrulanmış' : 'Doğrulanmamış'}
                  </span>
                </td>
                <td>
                  <span className={`role-badge ${user.isAdmin ? 'admin' : 'user'}`}>
                    {user.isAdmin ? 'Admin' : 'Kullanıcı'}
                  </span>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString('tr-TR')}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="edit-btn"
                      onClick={() => handleEditUser(user)}
                      title="Düzenle"
                    >
                      ✏️
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteUser(user._id, user.name)}
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

      {/* User Modal */}
      {showUserModal && (
        <UserModal
          isOpen={showUserModal}
          onClose={() => setShowUserModal(false)}
          formData={userForm}
          onChange={handleUserFormChange}
          onSubmit={handleAddUser}
          title="Yeni Kullanıcı Ekle"
          submitText="Kullanıcı Ekle"
        />
      )}

      {/* Edit User Modal */}
      {showEditUserModal && (
        <UserModal
          isOpen={showEditUserModal}
          onClose={() => setShowEditUserModal(false)}
          formData={editUserForm}
          onChange={handleEditUserFormChange}
          onSubmit={handleUpdateUser}
          title="Kullanıcı Düzenle"
          submitText="Güncelle"
          isEdit={true}
        />
      )}
    </div>
  );
};

export default UserManagement; 