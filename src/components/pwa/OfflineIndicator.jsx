import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, X } from 'lucide-react';

const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Handle online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      setShow(true);
      // Auto-hide after 3 seconds when coming back online
      setTimeout(() => setShow(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShow(true);
      setDismissed(false); // Reset dismissed when going offline
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Show indicator if initially offline
    if (!navigator.onLine) {
      setShow(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleDismiss = () => {
    setShow(false);
    setDismissed(true);
  };

  const handleRetry = () => {
    window.location.reload();
  };

  if (!show || dismissed) return null;

  return (
    <div
      className={`
        fixed top-0 left-0 right-0 z-50
        transform transition-all duration-500 ease-in-out
        ${show ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}
      `}
    >
      {isOnline ? (
        // Online success message
        <div className="bg-green-500 text-white px-4 py-3 shadow-lg">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-green-600 rounded-full p-1">
                <Wifi className="w-4 h-4" />
              </div>
              <p className="text-sm font-medium">
                <span className="font-semibold">Back Online!</span> Your connection has been restored.
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="text-white/80 hover:text-white transition"
              aria-label="Dismiss"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        // Offline warning message
        <div className="bg-amber-500 text-white px-4 py-3 shadow-lg">
          <div className="container mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-amber-600 rounded-full p-1 animate-pulse">
                  <WifiOff className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    <span className="font-semibold">You're offline</span>
                  </p>
                  <p className="text-xs text-amber-100 mt-0.5">
                    Don't worry! You can still view cached content.
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleRetry}
                  className="bg-white text-amber-600 px-3 py-1 rounded-md text-xs font-medium hover:bg-amber-50 transition"
                >
                  Retry
                </button>
                <button
                  onClick={handleDismiss}
                  className="text-white/80 hover:text-white transition"
                  aria-label="Dismiss"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Offline capabilities indicator */}
            <div className="mt-2 flex items-center space-x-4 text-xs text-amber-100">
              <span className="flex items-center space-x-1">
                <span className="w-1.5 h-1.5 bg-amber-200 rounded-full"></span>
                <span>Viewing cached photos</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-1.5 h-1.5 bg-amber-200 rounded-full"></span>
                <span>Reading messages</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfflineIndicator;