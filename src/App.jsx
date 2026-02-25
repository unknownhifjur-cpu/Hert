import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Feed from './components/feed/Feed';
import Upload from './components/upload/Upload';
import Navbar from './components/layout/Navbar';
import Profile from './components/profile/Profile';

function AppRoutes() {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
        <Route path="/" element={user ? <Feed /> : <Navigate to="/login" />} />
        <Route path="/upload" element={user ? <Upload /> : <Navigate to="/login" />} />
        <Route path="/profile/:username" element={user ? <Profile /> : <Navigate to="/login" />} />
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