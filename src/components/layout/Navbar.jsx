import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';
import {
  Home, HeartHandshake, User, Search, X, Bell, Settings, MessageCircle,
  Check, X as XIcon, UserPlus // added icons for actions
} from 'lucide-react';

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
  const [showBottomNav, setShowBottomNav] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [actionLoading, setActionLoading] = useState(null); // id of notification being acted upon
  const lastScrollY = useRef(0);
  const searchRef = useRef(null);
  const mobileInputRef = useRef(null);
  const notificationRef = useRef(null);
  const debounceTimer = useRef(null);

  if (!user) return null;

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const isOwnProfilePage = () => {
    const path = location.pathname;
    if (!path.startsWith('/profile/')) return false;
    const segments = path.split('/');
    const profileUsername = segments[2];
    return profileUsername === user.username;
  };

  // Fetch notifications
  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
      setUnreadCount(res.data.filter(n => !n.read).length);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const handleNotificationClick = (notif) => {
    markAsRead(notif._id);
    setNotificationsOpen(false);
    if (notif.type === 'like' || notif.type === 'comment') {
      if (notif.photo) navigate(`/photo/${notif.photo._id}`);
    } else if (notif.type === 'follow') {
      navigate(`/profile/${notif.sender.username}`);
    } else if (notif.type === 'bond_request' || notif.type === 'bond_accept') {
      navigate('/bond');
    }
  };

  // Action: accept love request
  const acceptLoveRequest = async (notifId, senderId) => {
    setActionLoading(notifId);
    try {
      await api.post(`/bond/accept/${senderId}`);
      // After accepting, refresh notifications and bond status
      await fetchNotifications();
      // Optionally close dropdown or keep open
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to accept request');
    } finally {
      setActionLoading(null);
    }
  };

  // Action: reject love request
  const rejectLoveRequest = async (notifId, senderId) => {
    setActionLoading(notifId);
    try {
      await api.post(`/bond/reject/${senderId}`);
      await fetchNotifications();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to reject request');
    } finally {
      setActionLoading(null);
    }
  };

  // Action: follow back
  const followBack = async (notifId, senderId) => {
    setActionLoading(notifId);
    try {
      // We need the username of the sender to follow. We have senderId, but we need to get username.
      // The notification object has sender.username, but we need to follow by username.
      // We can use the existing follow endpoint which expects username in URL.
      // Let's extract username from notification.sender.username
      const notif = notifications.find(n => n._id === notifId);
      if (!notif || !notif.sender?.username) {
        alert('Cannot follow: missing username');
        return;
      }
      await api.post(`/users/${notif.sender.username}/follow`);
      await fetchNotifications();
      // Optionally mark notification as read after action
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to follow back');
    } finally {
      setActionLoading(null);
    }
  };

  // Click outside handlers (unchanged)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (mobileSearchOpen && mobileInputRef.current) mobileInputRef.current.focus();
  }, [mobileSearchOpen]);

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

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        setShowBottomNav(false);
      } else if (currentScrollY < lastScrollY.current) {
        setShowBottomNav(true);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const goToSettings = () => {
    navigate('/settings');
  };

  const formatTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffSeconds = Math.floor((now - date) / 1000);
    if (diffSeconds < 60) return 'just now';
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold text-rose-600 hover:text-rose-700 transition">
              HeartLock
            </Link>

            {/* Desktop Search (unchanged) */}
            <div className="hidden md:block flex-1 max-w-md mx-4" ref={searchRef}>
              {/* ... same as before ... */}
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              {/* ... links unchanged ... */}
              <Link
                to="/"
                className={`transition font-medium ${isActive('/') ? 'text-rose-600' : 'text-gray-700 hover:text-rose-600'}`}
              >
                Home
              </Link>
              <Link
                to="/bond"
                className={`transition font-medium ${isActive('/bond') ? 'text-rose-600' : 'text-gray-700 hover:text-rose-600'}`}
              >
                Bond
              </Link>
              <Link
                to={`/profile/${user.username}`}
                className={`transition font-medium ${isActive(`/profile/${user.username}`) ? 'text-rose-600' : 'text-gray-700 hover:text-rose-600'}`}
              >
                Profile
              </Link>
              <span className="text-gray-600 text-sm">Welcome, {user.username}!</span>
              <Link to="/chat" className="p-2 text-gray-600 hover:text-rose-600 transition" aria-label="Chat">
                <MessageCircle className="w-5 h-5" />
              </Link>
              {isOwnProfilePage() ? (
                <button onClick={goToSettings} className="p-2 text-gray-600 hover:text-rose-600 transition" aria-label="Settings">
                  <Settings className="w-5 h-5" />
                </button>
              ) : (
                <button onClick={toggleNotifications} className="relative p-2 text-gray-600 hover:text-rose-600 transition">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
              )}
            </div>

            {/* Mobile icons (unchanged) */}
            <div className="md:hidden flex items-center space-x-2">
              <Link to="/chat" className="p-2 text-gray-600 hover:text-rose-600 transition">
                <MessageCircle className="w-6 h-6" />
              </Link>
              <div className="relative" ref={notificationRef}>
                {isOwnProfilePage() ? (
                  <button onClick={goToSettings} className="p-2 text-gray-600 hover:text-rose-600 transition">
                    <Settings className="w-6 h-6" />
                  </button>
                ) : (
                  <button onClick={toggleNotifications} className="relative p-2 text-gray-600 hover:text-rose-600 transition">
                    <Bell className="w-6 h-6" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                )}
                {/* Notification dropdown with action buttons */}
                {notificationsOpen && !isOwnProfilePage() && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                    <div className="p-3 border-b border-gray-100 flex justify-between items-center">
                      <span className="font-semibold text-gray-700">Notifications</span>
                      {unreadCount > 0 && (
                        <button onClick={markAllAsRead} className="text-xs text-rose-500 hover:text-rose-600">
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notif) => {
                          const isLoading = actionLoading === notif._id;
                          return (
                            <div
                              key={notif._id}
                              className={`p-3 hover:bg-rose-50 border-b border-gray-50 last:border-0 transition ${
                                !notif.read ? 'bg-rose-50/50' : ''
                              }`}
                            >
                              <div className="flex items-start space-x-3">
                                <div className="h-8 w-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-semibold text-sm flex-shrink-0">
                                  {notif.sender?.username?.charAt(0).toUpperCase() || '?'}
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm text-gray-800">
                                    <span className="font-medium">{notif.sender?.username}</span>{' '}
                                    {notif.type === 'like' && 'liked your photo'}
                                    {notif.type === 'comment' && 'commented on your photo'}
                                    {notif.type === 'follow' && 'started following you'}
                                    {notif.type === 'bond_request' && 'sent you a love request'}
                                    {notif.type === 'bond_accept' && 'accepted your love request'}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-1">{formatTime(notif.createdAt)}</p>

                                  {/* Action buttons */}
                                  {notif.type === 'bond_request' && (
                                    <div className="flex space-x-2 mt-2">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          acceptLoveRequest(notif._id, notif.sender._id);
                                        }}
                                        disabled={isLoading}
                                        className="p-1 bg-green-100 text-green-600 rounded-full hover:bg-green-200 disabled:opacity-50"
                                        title="Accept"
                                      >
                                        {isLoading ? (
                                          <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                          <Check className="w-4 h-4" />
                                        )}
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          rejectLoveRequest(notif._id, notif.sender._id);
                                        }}
                                        disabled={isLoading}
                                        className="p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200 disabled:opacity-50"
                                        title="Reject"
                                      >
                                        {isLoading ? (
                                          <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                          <XIcon className="w-4 h-4" />
                                        )}
                                      </button>
                                    </div>
                                  )}

                                  {notif.type === 'follow' && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        followBack(notif._id, notif.sender._id);
                                      }}
                                      disabled={isLoading}
                                      className="mt-2 flex items-center space-x-1 text-xs bg-rose-100 text-rose-600 px-3 py-1 rounded-full hover:bg-rose-200 disabled:opacity-50"
                                    >
                                      {isLoading ? (
                                        <div className="w-4 h-4 border-2 border-rose-600 border-t-transparent rounded-full animate-spin" />
                                      ) : (
                                        <UserPlus className="w-3 h-3" />
                                      )}
                                      <span>Follow back</span>
                                    </button>
                                  )}
                                </div>
                                {!notif.read && !notif.type?.startsWith('bond_') && (
                                  <span className="w-2 h-2 bg-rose-500 rounded-full mt-2"></span>
                                )}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-6 text-center text-gray-400">No notifications yet</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Search Overlay (unchanged) */}
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
                  <button onClick={clearSearch} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
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

      {/* Bottom navigation (unchanged) */}
      <div
        className={`md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 transform transition-transform duration-300 ${
          showBottomNav ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="flex justify-around items-center py-2">
          <Link to="/" className={`flex flex-col items-center p-2 transition ${isActive('/') ? 'text-rose-600' : 'text-gray-600 hover:text-rose-600'}`}>
            <Home className="w-6 h-6" />
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link to="/bond" className={`flex flex-col items-center p-2 transition ${isActive('/bond') ? 'text-rose-600' : 'text-gray-600 hover:text-rose-600'}`}>
            <HeartHandshake className="w-6 h-6" />
            <span className="text-xs mt-1">Bond</span>
          </Link>
          <button onClick={toggleMobileSearch} className="flex flex-col items-center p-2 text-gray-600 hover:text-rose-600 transition">
            <Search className="w-6 h-6" />
            <span className="text-xs mt-1">Search</span>
          </button>
          <Link to={`/profile/${user.username}`} className={`flex flex-col items-center p-2 transition ${isActive(`/profile/${user.username}`) ? 'text-rose-600' : 'text-gray-600 hover:text-rose-600'}`}>
            <User className="w-6 h-6" />
            <span className="text-xs mt-1">Profile</span>
          </Link>
        </div>
      </div>

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