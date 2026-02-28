import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Check if user hasn't dismissed in this session
      if (!sessionStorage.getItem('installPromptDismissed')) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if app is already installed
    window.addEventListener('appinstalled', () => {
      setShowPrompt(false);
      setDeferredPrompt(null);
      console.log('PWA was installed');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    sessionStorage.setItem('installPromptDismissed', 'true');
  };

  if (!showPrompt || dismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-gradient-to-r from-rose-50 to-pink-50 rounded-lg shadow-xl border border-rose-100 z-50 animate-slideUp">
      <div className="p-4">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="flex items-start space-x-3">
          <div className="bg-rose-100 p-2 rounded-lg">
            <Download className="w-6 h-6 text-rose-500" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">Install HeartLock</h3>
            <p className="text-sm text-gray-600 mt-1">
              Install our app for a better experience with offline access!
            </p>
            <button
              onClick={handleInstallClick}
              className="mt-3 bg-rose-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-rose-600 transition w-full"
            >
              Install App
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;