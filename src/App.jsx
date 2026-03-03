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
import BondLanding from './components/bond/BondLanding';
import BondDashboard from './components/bond/BondDashboard';
import BondTimeline from './components/bond/BondTimeline';
import BondMoodTracker from './components/bond/BondMoodTracker';
import BondCompatibility from './components/bond/BondCompatibility';
import BondAnniversary from './components/bond/BondAnniversary';
import BondPrivacy from './components/bond/BondPrivacy';
import BondGift from './components/bond/BondGift';
import EditProfile from './components/profile/EditProfile';
import PhotoDetail from './components/photo/PhotoDetail';
import Settings from './components/settings/Settings';
import Chat from './components/chat/Chat';
import InstallPrompt from './components/pwa/InstallPrompt';
import OfflineIndicator from './components/pwa/OfflineIndicator';
import SearchPage from './components/search/SearchPage';
import Notifications from './pages/Notifications';
import api from './utils/api'; // needed for push

// Premium Loader Component (unchanged)
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
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-rose-200 rounded-full blur-2xl animate-pulse"></div>
          <div className="relative w-32 h-32 flex items-center justify-center">
            <Heart className="w-20 h-20 text-rose-500 animate-glow" fill="#f43f5e" />
            <div className="absolute inset-0 border-4 border-rose-300 rounded-full animate-ripple"></div>
            <div className="absolute inset-0 border-4 border-pink-300 rounded-full animate-ripple delay-500"></div>
          </div>
        </div>
        <h1 className="text-3xl font-light text-gray-800 mb-2">
          Welcome to <span className="font-bold text-rose-500">HeartLock</span>
        </h1>
        <p className="text-gray-500 text-sm">Where memories are secured with love</p>
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
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-glow { animation: glow 2s ease-in-out infinite; }
        .animate-ripple { animation: ripple 2s ease-out infinite; }
        .animate-wave { animation: wave 0.8s ease-in-out infinite; }
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

// Conditional Navbar
const ConditionalNavbar = () => {
  const location = useLocation();
  const isIndividualChatRoute = location.pathname.startsWith('/chat/') && location.pathname !== '/chat';
  if (isIndividualChatRoute) return null;
  return <Navbar />;
};

// Helper for push subscription
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function AppRoutes() {
  const { user, loading } = useContext(AuthContext);
  const isOnline = useNetworkStatus();

  // Push notification setup
  useEffect(() => {
    if (!user || loading) return; // only when logged in

    let currentSubscription = null;

    async function setupPush() {
      if (!('serviceWorker' in navigator && 'PushManager' in window)) {
        console.log('Push not supported');
        return;
      }

      try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return;

        const registration = await navigator.serviceWorker.register('/sw.js');
        await navigator.serviceWorker.ready;

        const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
        if (!vapidPublicKey) {
          console.error('VAPID public key missing');
          return;
        }

        let subscription = await registration.pushManager.getSubscription();
        if (!subscription) {
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
          });
        }

        currentSubscription = subscription;
        await api.post('/push/subscribe', subscription);
        console.log('Push subscription saved');
      } catch (err) {
        console.error('Push setup failed', err);
      }
    }

    setupPush();

    return () => {
      if (currentSubscription) {
        currentSubscription.unsubscribe()
          .then(() => {
            api.delete('/push/unsubscribe', {
              data: { endpoint: currentSubscription.endpoint }
            }).catch(console.error);
          })
          .catch(console.error);
      }
    };
  }, [user, loading]);

  if (loading) return <PremiumLoader />;

  return (
    <>
      {!isOnline && <OfflineIndicator />}
      <InstallPrompt />
      <ConditionalNavbar />
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />

        <Route path="/" element={user ? <Feed /> : <Navigate to="/login" />} />
        <Route path="/upload" element={user ? <Upload /> : <Navigate to="/login" />} />
        <Route path="/settings" element={user ? <Settings /> : <Navigate to="/login" />} />

        <Route path="/bond" element={user ? <BondLanding /> : <Navigate to="/login" />} />
        <Route path="/bond/dashboard" element={user ? <BondDashboard /> : <Navigate to="/login" />} />
        <Route path="/bond/timeline" element={user ? <BondTimeline /> : <Navigate to="/login" />} />
        <Route path="/bond/mood" element={user ? <BondMoodTracker /> : <Navigate to="/login" />} />
        <Route path="/bond/compatibility" element={user ? <BondCompatibility /> : <Navigate to="/login" />} />
        <Route path="/bond/anniversary" element={user ? <BondAnniversary /> : <Navigate to="/login" />} />
        <Route path="/bond/privacy" element={user ? <BondPrivacy /> : <Navigate to="/login" />} />
        <Route path="/bond/gift" element={user ? <BondGift /> : <Navigate to="/login" />} />

        <Route path="/search" element={<SearchPage />} />
        <Route path="/notifications" element={<Notifications />} />

        <Route path="/profile/:username/edit" element={user ? <EditProfile /> : <Navigate to="/login" />} />
        <Route path="/profile/:username" element={user ? <Profile /> : <Navigate to="/login" />} />

        <Route path="/photo/:id" element={user ? <PhotoDetail /> : <Navigate to="/login" />} />

        <Route path="/chat" element={user ? <Chat /> : <Navigate to="/login" />} />
        <Route path="/chat/:userId" element={user ? <Chat /> : <Navigate to="/login" />} />

        <Route path="*" element={<Navigate to={user ? '/' : '/login'} />} />
      </Routes>

      {user && !isOnline && (
        <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-yellow-50 border border-yellow-200 rounded-lg p-4 z-40">
          <p className="text-sm text-yellow-800">You're currently offline. Some features may be limited.</p>
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