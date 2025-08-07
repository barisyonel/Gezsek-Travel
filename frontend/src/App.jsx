import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import SliderSection from './components/common/SliderSection';
import PopularCategories from './components/common/PopularCategories';
import PopularRegions from './components/common/PopularRegions';
import InstagramTours from './components/tours/InstagramTours';
import Campaigns from './components/common/Campaigns';
import AboutContact from './components/common/AboutContact';
import Contact from './components/common/Contact';

import UserPanel from './components/user/UserPanel';
import AdminPanel from './components/admin/components/AdminPanel';
import AdminLogin from './components/admin/AdminLogin';
import BlogList from './components/blog/BlogList';
import FAQ from './components/common/FAQ';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminProtectedRoute from './components/admin/AdminProtectedRoute';
import ScrollReveal from './components/common/ScrollReveal';
import LoginPage from './components/auth/LoginPage';
import SearchPage from './components/pages/SearchPage';
import TourList from './components/tours/TourList';
import LiveChat from './components/common/LiveChat';
import './App.css';

// Ana Sayfa Component'i
const HomePage = () => {
  return (
    <>
      <Header />
      <main>
        <SliderSection />
        <ScrollReveal>
          <PopularCategories />
        </ScrollReveal>
        <ScrollReveal delay={200}>
          <PopularRegions />
        </ScrollReveal>
        <ScrollReveal delay={400}>
          <InstagramTours />
        </ScrollReveal>
        <ScrollReveal delay={600}>
          <Campaigns />
        </ScrollReveal>

        <ScrollReveal delay={800}>
          <Contact />
        </ScrollReveal>
        <ScrollReveal delay={1000}>
          <AboutContact />
        </ScrollReveal>
        <ScrollReveal delay={1200}>
          <BlogList />
        </ScrollReveal>
        <ScrollReveal delay={1400}>
          <FAQ />
        </ScrollReveal>
      </main>
      <Footer />
      <LiveChat />
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        
        {/* Profile Route */}
        <Route path="/profile" element={
          <ProtectedRoute>
            <div>
              <Header />
              <main style={{ paddingTop: '100px' }}>
                <UserPanel />
              </main>
              <Footer />
              <LiveChat />
            </div>
          </ProtectedRoute>
        } />
        
        {/* Admin Login Route */}
        <Route path="/admin" element={<AdminLogin />} />
        
        {/* Admin Panel Route */}
        <Route path="/admin-panel" element={
          <AdminProtectedRoute>
            <AdminPanel />
          </AdminProtectedRoute>
        } />
        
        {/* Tours Route */}
        <Route path="/tours" element={
          <div>
            <Header />
            <main style={{ paddingTop: '100px', minHeight: '60vh' }}>
              <TourList />
            </main>
            <Footer />
            <LiveChat />
          </div>
        } />
        
        {/* Destinations Route */}
        <Route path="/destinations" element={
          <div>
            <Header />
            <main style={{ paddingTop: '100px', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <h1 style={{ color: 'var(--primary-turquoise)', marginBottom: '1rem' }}>✈️ Destinasyonlar</h1>
                <p style={{ color: '#666', fontSize: '1.1rem' }}>Destinasyonlar sayfası yakında eklenecek...</p>
              </div>
            </main>
            <Footer />
            <LiveChat />
          </div>
        } />
        

        
        {/* About Route */}
        <Route path="/about" element={
          <div>
            <Header />
            <main style={{ paddingTop: '100px', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <h1 style={{ color: 'var(--primary-turquoise)', marginBottom: '1rem' }}>ℹ️ Hakkımızda</h1>
                <p style={{ color: '#666', fontSize: '1.1rem' }}>Hakkımızda sayfası yakında eklenecek...</p>
              </div>
            </main>
            <Footer />
            <LiveChat />
          </div>
        } />
        
        {/* Contact Route */}
        <Route path="/contact" element={
          <div>
            <Header />
            <main style={{ paddingTop: '100px', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <h1 style={{ color: 'var(--primary-turquoise)', marginBottom: '1rem' }}>📞 İletişim</h1>
                <p style={{ color: '#666', fontSize: '1.1rem' }}>İletişim sayfası yakında eklenecek...</p>
              </div>
            </main>
            <Footer />
            <LiveChat />
          </div>
        } />
        
        {/* Search Route */}
        <Route path="/search" element={
          <div>
            <Header />
            <main style={{ paddingTop: '100px', minHeight: '60vh' }}>
              <SearchPage />
            </main>
            <Footer />
            <LiveChat />
          </div>
        } />
      </Routes>
    </AuthProvider>
  );
}

export default App;
