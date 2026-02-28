import React, { useContext, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { Heart } from 'lucide-react';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Feed from './components/feed/Feed';
import Upload from './components/upload/Upload';
import Navbar from './components/layout/Navbar';
import Profile from './components/profile/Profile';
import BondLanding from './components/bond/BondLanding';          // handles single/pending
import BondDashboard from './components/bond/BondDashboard';      // bonded overview
import BondTimeline from './components/bond/BondTimeline';        // timeline page
import BondMoodTracker from './components/bond/BondMoodTracker';  // mood tracker (placeholder)
import BondCompatibility from './components/bond/BondCompatibility'; // compatibility (placeholder)
import BondAnniversary from './components/bond/BondAnniversary';  // anniversary (placeholder)
import BondPrivacy from './components/bond/BondPrivacy';          // privacy (placeholder)
import BondGift from './components/bond/BondGift';                // gift system (placeholder)
import EditProfile from './components/profile/EditProfile';
import PhotoDetail from './components/photo/PhotoDetail';
import Settings from './components/settings/Settings';
import Chat from './components/chat/Chat';
import InstallPrompt from './components/pwa/InstallPrompt';
import OfflineIndicator from './components/pwa/OfflineIndicator';
import SearchPage from './components/search/SearchPage';
import Notifications from './pages/Notifications';

// Premium Loader Component - Updated Romantic Style
const PremiumLoader = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-gradient-to-br from-rose-50 via-white to-pink-50 transition-opacity duration-500 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="relative flex flex-col items-center">
        {/* Floating Hearts Background */}
        {[...Array(6)].map((_, i) => (
          <Heart
            key={i}
            className="absolute text-rose-200/30 animate-float"
            style={{
              left: `${Math.random() * 200 - 100}%`,
              top: `${Math.random() * 200 - 100}%`,
              animationDelay: `${i * 0.5}s`,
              width: `${20 + i * 5}px`,
              height: `${20 + i * 5}px`,
            }}
          />
        ))}

        {/* Main Heart */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-rose-200 rounded-full blur-2xl animate-pulse"></div>
          <div className="relative w-32 h-32 flex items-center justify-center">
            <Heart 
              className="w-20 h-20 text-rose-500 animate-glow" 
              fill="#f43f5e"
            />
            <div className="absolute inset-0 border-4 border-rose-300 rounded-full animate-ripple"></div>
            <div className="absolute inset-0 border-4 border-pink-300 rounded-full animate-ripple delay-500"></div>
          </div>
        </div>

        {/* Text */}
        <h1 className="text-3xl font-light text-gray-800 mb-2">
          Welcome to <span className="font-bold text-rose-500">HeartLock</span>
        </h1>
        <p className="text-gray-500 text-sm">Where memories are secured with love</p>
        
        {/* Dots */}
        <div className="flex space-x-2 mt-6">
          <div className="w-2 h-2 bg-rose-300 rounded-full animate-wave"></div>
          <div className="w-2 h-2 bg-rose-400 rounded-full animate-wave delay-100"></div>
          <div className="w-2 h-2 bg-rose-500 rounded-full animate-wave delay-200"></div>
          <div className="w-2 h-2 bg-rose-600 rounded-full animate-wave delay-300"></div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
        }
        @keyframes glow {
          0%, 100% { filter: drop-shadow(0 0 10px rgba(244, 63, 94, 0.5)); }
          50% { filter: drop-shadow(0 0 20px rgba(244, 63, 94, 0.8)); }
        }
        @keyframes ripple {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes wave {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.5); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
        .animate-ripple {
          animation: ripple 2s ease-out infinite;
        }
        .animate-wave {
          animation: wave 0.8s ease-in-out infinite;
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

// Component to conditionally render Navbar
const ConditionalNavbar = () => {
  const location = useLocation();
  
  // Check if it's an individual chat page (has userId parameter)
  const isIndividualChatRoute = location.pathname.startsWith('/chat/') && location.pathname !== '/chat';
  
  // Hide navbar only on individual chat pages, show on main chat list
  if (isIndividualChatRoute) {
    return null;
  }
  
  return <Navbar />;
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
      
      {/* Conditional Navbar - hides only on individual chat pages */}
      <ConditionalNavbar />
      
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />

        {/* Protected routes */}
        <Route path="/" element={user ? <Feed /> : <Navigate to="/login" />} />
        <Route path="/upload" element={user ? <Upload /> : <Navigate to="/login" />} />
        <Route path="/settings" element={user ? <Settings /> : <Navigate to="/login" />} />

        {/* Bond routes – landing page first */}
        <Route path="/bond" element={user ? <BondLanding /> : <Navigate to="/login" />} />
        <Route path="/bond/dashboard" element={user ? <BondDashboard /> : <Navigate to="/login" />} />
        <Route path="/bond/timeline" element={user ? <BondTimeline /> : <Navigate to="/login" />} />
        <Route path="/bond/mood" element={user ? <BondMoodTracker /> : <Navigate to="/login" />} />
        <Route path="/bond/compatibility" element={user ? <BondCompatibility /> : <Navigate to="/login" />} />
        <Route path="/bond/anniversary" element={user ? <BondAnniversary /> : <Navigate to="/login" />} />
        <Route path="/bond/privacy" element={user ? <BondPrivacy /> : <Navigate to="/login" />} />
        <Route path="/bond/gift" element={user ? <BondGift /> : <Navigate to="/login" />} />

        {/* Search and notifications (currently public – adjust if needed) */}
        <Route path="/search" element={<SearchPage />} />
        <Route path="/notifications" element={<Notifications />} />

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