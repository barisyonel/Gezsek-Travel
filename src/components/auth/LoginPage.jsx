import React from 'react';
import Auth from './Auth';
import '../../App.css';

const LoginPage = () => {
  return (
    <div className="login-page">
      <div className="login-page-header">
        <a href="/" className="back-home">
          <i className="fas fa-arrow-left"></i>
          Ana Sayfaya Dön
        </a>
      </div>
      <Auth />
    </div>
  );
};

export default LoginPage; 