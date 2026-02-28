import React, { useContext, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { Heart } from 'lucide-react';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Feed from './components/feed/Feed';
import Upload from './components/upload/Upload';
import Navbar from './components/layout/Navbar';
import Profile from './components/profile/Profile';
import Bond from './components/bond/Bond';
import EditProfile from './components/profile/EditProfile';
import PhotoDetail from './components/photo/PhotoDetail';
import Settings from './components/settings/Settings';
import Chat from './components/chat/Chat';
import InstallPrompt from './components/pwa/InstallPrompt';
import OfflineIndicator from './components/pwa/OfflineIndicator';

// Premium Loader Component
const PremiumLoader = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-white transition-opacity duration-500 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="flex flex-col items-center space-y-8">
        {/* Loader */}
        <div className="relative flex items-center justify-center">
          {/* Soft Glow */}
          <div className="absolute w-32 h-32 bg-rose-100 rounded-full blur-3xl opacity-40"></div>

          {/* Rotating Gradient Ring */}
          <div className="w-24 h-24 rounded-full loader-ring"></div>

          {/* Heart Logo */}
          <Heart className="absolute w-10 h-10 text-rose-500 animate-logoPulse" />
        </div>

        {/* Text */}
        <p className="text-sm text-gray-500 tracking-wide">
          Preparing your secure space...
        </p>
      </div>

      {/* Inline animations */}
      <style>{`
        .loader-ring {
          border: 3px solid #fce7f3;
          border-top-color: #f43f5e;
          border-right-color: #f43f5e;
          animation: spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes logoPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        .animate-logoPulse {
          animation: logoPulse 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

// Network Status Hook
const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};

function AppRoutes() {
  const { user, loading } = useContext(AuthContext);
  const isOnline = useNetworkStatus();

  if (loading) {
    return <PremiumLoader />;
  }

  return (
    <>
      {/* Offline indicator - shows when app is offline */}
      {!isOnline && <OfflineIndicator />}
      
      {/* Install prompt for PWA */}
      <InstallPrompt />
      
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />

        {/* Protected routes */}
        <Route path="/" element={user ? <Feed /> : <Navigate to="/login" />} />
        <Route path="/upload" element={user ? <Upload /> : <Navigate to="/login" />} />
        <Route path="/settings" element={user ? <Settings /> : <Navigate to="/login" />} />
        <Route path="/bond" element={user ? <Bond /> : <Navigate to="/login" />} />

        {/* Profile routes – edit is more specific */}
        <Route path="/profile/:username/edit" element={user ? <EditProfile /> : <Navigate to="/login" />} />
        <Route path="/profile/:username" element={user ? <Profile /> : <Navigate to="/login" />} />

        {/* Photo detail route */}
        <Route path="/photo/:id" element={user ? <PhotoDetail /> : <Navigate to="/login" />} />

        {/* Chat routes */}
        <Route path="/chat" element={user ? <Chat /> : <Navigate to="/login" />} />
        <Route path="/chat/:userId" element={user ? <Chat /> : <Navigate to="/login" />} />

        {/* Fallback for unmatched paths */}
        <Route path="*" element={<Navigate to={user ? '/' : '/login'} />} />
      </Routes>

      {/* Add offline support message for authenticated users */}
      {user && !isOnline && (
        <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-yellow-50 border border-yellow-200 rounded-lg p-4 z-40">
          <p className="text-sm text-yellow-800">
            You're currently offline. Some features may be limited.
          </p>
        </div>
      )}
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