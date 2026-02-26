import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Feed from './components/feed/Feed';
import Upload from './components/upload/Upload';
import Navbar from './components/layout/Navbar';
import Profile from './components/profile/Profile';
import EditProfile from './components/profile/EditProfile';

function AppRoutes() {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="text-center mt-10">Loading...</div>;

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
        
        {/* Profile routes – edit is more specific so it should take precedence */}
        <Route path="/profile/:username/edit" element={user ? <EditProfile /> : <Navigate to="/login" />} />
        <Route path="/profile/:username" element={user ? <Profile /> : <Navigate to="/login" />} />

        {/* fallback for unmatched paths to avoid "No routes matched" errors */}
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