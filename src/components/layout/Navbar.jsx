import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Home, Upload, User, Search, X, Bell } from 'lucide-react';
import api from '../../utils/api';

const Navbar = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searching, setSearching] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const searchRef = useRef(null);
  const mobileInputRef = useRef(null);
  const notificationRef = useRef(null);
  const debounceTimer = useRef(null);

  if (!user) return null;

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  // Click outside search dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Click outside notification dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-focus mobile search when opened
  useEffect(() => {
    if (mobileSearchOpen && mobileInputRef.current) {
      mobileInputRef.current.focus();
    }
  }, [mobileSearchOpen]);

  // Debounced search
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    setSearching(true);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      try {
        const res = await api.get(`/users/search?q=${searchQuery}`);
        setSearchResults(res.data);
        setShowDropdown(true);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setSearching(false);
      }
    }, 300);
  }, [searchQuery]);

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowDropdown(false);
  };

  const goToProfile = (username) => {
    navigate(`/profile/${username}`);
    clearSearch();
    setMobileSearchOpen(false);
  };

  const toggleMobileSearch = () => {
    setMobileSearchOpen(!mobileSearchOpen);
    if (!mobileSearchOpen) clearSearch();
    setNotificationsOpen(false);
  };

  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
    if (mobileSearchOpen) setMobileSearchOpen(false);
  };

  // Dummy notifications
  const notifications = [
    { id: 1, text: 'John Doe liked your photo', time: '2 min ago' },
    { id: 2, text: 'Jane commented: "Nice shot!"', time: '1 hour ago' },
    { id: 3, text: 'You have a new follower', time: '3 hours ago' },
  ];

  return (
    <>
      {/* Main navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="text-2xl font-bold text-rose-600 hover:text-rose-700 transition">
              HeartLock
            </Link>

            {/* Desktop Search */}
            <div className="hidden md:block flex-1 max-w-md mx-4" ref={searchRef}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-full text-sm focus:ring-1 focus:ring-rose-200 focus:border-rose-400 transition"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
                {showDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 max-h-60 overflow-y-auto z-50">
                    {searching ? (
                      <div className="p-4 text-center text-gray-400">Searching...</div>
                    ) : searchResults.length > 0 ? (
                      searchResults.map((result) => (
                        <button
                          key={result._id}
                          onClick={() => goToProfile(result.username)}
                          className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-rose-50 transition"
                        >
                          <div className="h-8 w-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-semibold text-sm">
                            {result.username.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-700">{result.username}</span>
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-400">No users found</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-gray-700 hover:text-rose-600 transition font-medium">
                Home
              </Link>
              <Link to="/upload" className="text-gray-700 hover:text-rose-600 transition font-medium">
                Upload
              </Link>
              <Link to={`/profile/${user.username}`} className="text-gray-700 hover:text-rose-600 transition font-medium">
                Profile
              </Link>
              <span className="text-gray-600 text-sm">Welcome, {user.username}!</span>
              {/* Desktop notification bell (optional) – you can remove if not needed */}
              <button
                onClick={toggleNotifications}
                className="relative p-2 text-gray-600 hover:text-rose-600 transition"
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
                )}
              </button>
              {/* Logout removed – will be on profile page */}
            </div>

            {/* Mobile: notification bell (replaces logout) */}
            <div className="md:hidden flex items-center">
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={toggleNotifications}
                  className="p-2 text-gray-600 hover:text-rose-600 transition"
                  aria-label="Notifications"
                >
                  <Bell className="w-6 h-6" />
                  {notifications.length > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full"></span>
                  )}
                </button>
                {/* Notification dropdown */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                    <div className="p-3 border-b border-gray-100 font-semibold text-gray-700">Notifications</div>
                    <div className="max-h-60 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notif) => (
                          <div key={notif.id} className="p-3 hover:bg-rose-50 border-b border-gray-50 last:border-0">
                            <p className="text-sm text-gray-700">{notif.text}</p>
                            <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-gray-400">No notifications</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Search Overlay */}
          {mobileSearchOpen && (
            <div className="md:hidden mt-3 pb-3 animate-fadeIn" ref={searchRef}>
              <div className="relative">
                <input
                  ref={mobileInputRef}
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm focus:ring-1 focus:ring-rose-200 focus:border-rose-400 transition"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
              {showDropdown && (
                <div className="mt-2 bg-white rounded-xl shadow-lg border border-gray-100 max-h-60 overflow-y-auto">
                  {searching ? (
                    <div className="p-4 text-center text-gray-400">Searching...</div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((result) => (
                      <button
                        key={result._id}
                        onClick={() => goToProfile(result.username)}
                        className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-rose-50 transition"
                      >
                        <div className="h-8 w-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-semibold text-sm">
                          {result.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-700">{result.username}</span>
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-400">No users found</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Bottom navigation for mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="flex justify-around items-center py-2">
          <Link to="/" className="flex flex-col items-center p-2 text-gray-600 hover:text-rose-600 transition">
            <Home className="w-6 h-6" />
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link to="/upload" className="flex flex-col items-center p-2 text-gray-600 hover:text-rose-600 transition">
            <Upload className="w-6 h-6" />
            <span className="text-xs mt-1">Upload</span>
          </Link>
          <Link to={`/profile/${user.username}`} className="flex flex-col items-center p-2 text-gray-600 hover:text-rose-600 transition">
            <User className="w-6 h-6" />
            <span className="text-xs mt-1">Profile</span>
          </Link>
          <button
            onClick={toggleMobileSearch}
            className="flex flex-col items-center p-2 text-gray-600 hover:text-rose-600 transition"
          >
            <Search className="w-6 h-6" />
            <span className="text-xs mt-1">Search</span>
          </button>
        </div>
      </div>

      {/* Spacer for mobile bottom nav */}
      <div className="md:hidden h-0"></div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </>
  );
};

export default Navbar;