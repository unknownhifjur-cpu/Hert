import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Check, Clock } from 'lucide-react';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [installStarted, setInstallStarted] = useState(false);
  const [platform, setPlatform] = useState('web');

  // Detect platform
  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    
    if (/android/i.test(userAgent)) {
      setPlatform('android');
    } else if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      setPlatform('ios');
    } else {
      setPlatform('web');
    }
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Don't show on iOS - they have different install flow
      if (platform === 'ios') {
        // Show custom iOS instructions after some delay
        const hasSeenIosPrompt = localStorage.getItem('iosInstallPromptSeen');
        if (!hasSeenIosPrompt) {
          setTimeout(() => setShowPrompt(true), 3000);
        }
      } else {
        // Check if user hasn't dismissed in this session
        const dismissedCount = parseInt(sessionStorage.getItem('installPromptDismissedCount') || '0');
        if (dismissedCount < 2) { // Show up to 2 times per session
          setShowPrompt(true);
        }
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if app is already installed
    window.addEventListener('appinstalled', () => {
      setShowPrompt(false);
      setDeferredPrompt(null);
      // Show success message
      setTimeout(() => {
        alert('HeartLock has been successfully installed!');
      }, 500);
    });

    // For iOS, check if in standalone mode
    if (window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches) {
      setShowPrompt(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [platform]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    setInstallStarted(true);
    
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
    } catch (error) {
      console.error('Install prompt error:', error);
    } finally {
      setInstallStarted(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    
    // Track dismissals
    const dismissedCount = parseInt(sessionStorage.getItem('installPromptDismissedCount') || '0');
    sessionStorage.setItem('installPromptDismissedCount', (dismissedCount + 1).toString());
    
    // For iOS, store in localStorage
    if (platform === 'ios') {
      localStorage.setItem('iosInstallPromptSeen', 'true');
    }
  };

  const handleRemindLater = () => {
    setShowPrompt(false);
    setDismissed(true);
    
    // Set a cookie/timestamp to show again after 24 hours
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    localStorage.setItem('nextPromptTime', tomorrow.getTime().toString());
  };

  if (!showPrompt || dismissed) return null;

  // iOS specific install instructions
  if (platform === 'ios') {
    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 animate-slideUp">
        <div className="p-5">
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-start space-x-3">
            <div className="bg-blue-100 p-3 rounded-full">
              <Smartphone className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-lg">Install HeartLock</h3>
              <p className="text-sm text-gray-600 mt-1">
                Install on your iPhone for the best experience!
              </p>
              
              <div className="mt-4 space-y-3">
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium">
                    1
                  </div>
                  <span>Tap the Share button</span>
                  <span className="text-2xl">📤</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium">
                    2
                  </div>
                  <span>Scroll down and tap</span>
                  <span className="font-medium">"Add to Home Screen"</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium">
                    3
                  </div>
                  <span>Tap "Add" in the top right</span>
                </div>
              </div>
              
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={handleDismiss}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
                >
                  Later
                </button>
                <button
                  onClick={handleDismiss}
                  className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Android/Web install prompt
  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slideUp">
      <div className="bg-white rounded-xl shadow-2xl border border-rose-100 overflow-hidden">
        {/* Progress bar for install */}
        {installStarted && (
          <div className="h-1 bg-rose-100">
            <div className="h-1 bg-rose-500 animate-progress"></div>
          </div>
        )}
        
        <div className="p-5">
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-start space-x-4">
            {/* App Icon */}
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl shadow-lg flex items-center justify-center">
                <Download className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                <span className="text-[10px] text-white font-bold">+</span>
              </div>
            </div>
            
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-lg">Install HeartLock</h3>
              <p className="text-sm text-gray-600 mt-1">
                Get faster access, offline support, and a better experience!
              </p>
              
              {/* Features list */}
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center space-x-2 text-xs text-gray-600">
                  <Check className="w-3.5 h-3.5 text-green-500" />
                  <span>Works offline</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-600">
                  <Check className="w-3.5 h-3.5 text-green-500" />
                  <span>Faster loading</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-600">
                  <Check className="w-3.5 h-3.5 text-green-500" />
                  <span>Home screen access</span>
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={handleRemindLater}
                  className="flex items-center justify-center space-x-1 px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Later</span>
                </button>
                <button
                  onClick={handleInstallClick}
                  disabled={installStarted}
                  className="flex-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-rose-600 hover:to-pink-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-rose-500/25"
                >
                  {installStarted ? 'Installing...' : 'Install Now'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;