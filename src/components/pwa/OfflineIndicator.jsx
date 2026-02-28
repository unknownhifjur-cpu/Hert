import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

const OfflineIndicator = () => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white px-4 py-2 z-50 transform transition-transform duration-300">
      <div className="container mx-auto flex items-center justify-center space-x-2">
        <WifiOff className="w-4 h-4" />
        <p className="text-sm font-medium">You are offline. Some features may be unavailable.</p>
      </div>
    </div>
  );
};

export default OfflineIndicator;