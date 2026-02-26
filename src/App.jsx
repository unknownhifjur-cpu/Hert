import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { Heart } from 'lucide-react';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Feed from './components/feed/Feed';
import Upload from './components/upload/Upload';
import Navbar from './components/layout/Navbar';
import Profile from './components/profile/Profile';
import EditProfile from './components/profile/EditProfile';
import PhotoDetail from './components/photo/PhotoDetail';
import Settings from './components/settings/Settings';
import { useEffect, useState } from "react";

function AppRoutes() {
  const { user, loading } = useContext(AuthContext);


if (loading) {
  return <PremiumLoader />;
}

function PremiumLoader() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-white transition-opacity duration-500 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="flex flex-col items-center space-y-8">

        {/* Loader */}
        <div className="relative flex items-center justify-center">

          {/* Soft Glow */}
          <div className="absolute w-32 h-32 bg-rose-100 rounded-full blur-3xl opacity-40"></div>

          {/* Rotating Gradient Ring */}
          <div className="loader-ring w-24 h-24 rounded-full"></div>

          {/* Logo */}
          <img
            src="/favicon.png"
            alt="HeartLock Logo"
            className="absolute w-10 h-10 object-contain animate-logoPulse"
          />
        </div>

        {/* Text */}
        <p className="text-sm text-gray-500 tracking-wide">
          Preparing your secure space...
        </p>

      </div>
    </div>
  );
}
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />

        {/* Protected routes */}
        <Route path="/" element={user ? <Feed /> : <Navigate to="/login" />} />
        <Route path="/upload" element={user ? <Upload /> : <Navigate to="/login" />} />
        <Route path="/settings" element={user ? <Settings /> : <Navigate to="/login" />} />
        
        {/* Profile routes – edit is more specific so it should take precedence */}
        <Route path="/profile/:username/edit" element={user ? <EditProfile /> : <Navigate to="/login" />} />
        <Route path="/profile/:username" element={user ? <Profile /> : <Navigate to="/login" />} />

        {/* Photo detail route */}
        <Route path="/photo/:id" element={user ? <PhotoDetail /> : <Navigate to="/login" />} />

        {/* fallback for unmatched paths */}
        <Route path="*" element={<Navigate to={user ? "/" : "/login"} />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;