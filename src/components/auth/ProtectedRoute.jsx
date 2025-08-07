import React from 'react';
import Auth from './Auth';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Auth />;
  return children;
};

export default ProtectedRoute; 