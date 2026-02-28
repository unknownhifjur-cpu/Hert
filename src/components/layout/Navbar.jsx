import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import {
  Home,
  HeartHandshake,
  User,
  Search,
  Bell,
  Settings,
  MessageCircle,
  Heart,
  UserPlus,
  CheckCircle,
  Clock,
} from 'lucide-react';
import api from '../../utils/api';

const Navbar = () => {
  const { user } = useContext(AuthContext);
  const socket = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [showBottomNav, setShowBottomNav] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const lastScrollY = useRef(0);
  const notificationRef = useRef(null);

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

  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchUnreadChatCount();
    }
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

  const fetchUnreadChatCount = async () => {
    try {
      const res = await api.get('/chat/unread');
      setUnreadChatCount(res.data.count);
    } catch (err) {
      console.error('Failed to fetch unread chat count', err);
    }
  };

  useEffect(() => {
    if (!socket || !user) return;

    const handleNewMessage = (newMsg) => {
      if (newMsg.receiver?._id === user.id && newMsg.sender?._id !== user.id) {
        setUnreadChatCount(prev => prev + 1);
      }
    };

    const handleMessagesRead = ({ readerId, count }) => {
      if (readerId === user.id) {
        setUnreadChatCount(prev => Math.max(0, prev - count));
      }
    };

    socket.on('new-message', handleNewMessage);
    socket.on('messages-read', handleMessagesRead);

    return () => {
      socket.off('new-message', handleNewMessage);
      socket.off('messages-read', handleMessagesRead);
    };
  }, [socket, user]);

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

  const toggleNotifications = () => setNotificationsOpen(!notificationsOpen);
  const goToSettings = () => navigate('/settings');

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

  const iconVariants = {
    hover: { scale: 1.1, transition: { type: 'spring', stiffness: 400, damping: 10 } },
    tap: { scale: 0.95 },
  };

  const dotVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 500, damping: 20 } },
  };

  return (
    <>
      {/* Main navbar */}
      <nav className="bg-gradient-to-r from-rose-50 to-white shadow-sm border-b border-rose-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div whileHover="hover" whileTap="tap" variants={iconVariants}>
              <Link to="/" className="flex items-center space-x-2 group">
                <span className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-rose-400 bg-clip-text text-transparent">
                  HeartLock
                </span>
              </Link>
            </motion.div>

            {/* Desktop Search */}
            <div className="hidden md:block flex-1 max-w-md mx-4">
              <Link
                to="/search"
                className="flex items-center space-x-2 text-gray-500 hover:text-rose-600 transition border border-rose-200 rounded-full px-4 py-2 bg-white hover:bg-rose-50"
              >
                <Search className="h-5 w-5" />
                <span className="text-sm">Search users...</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              {['Home', 'Bond', 'Profile'].map((item) => {
                const path = item === 'Home' ? '/' : item === 'Bond' ? '/bond' : `/profile/${user.username}`;
                const isItemActive = isActive(path);
                return (
                  <motion.div
                    key={item}
                    whileHover="hover"
                    whileTap="tap"
                    variants={iconVariants}
                    className="relative"
                  >
                    <Link
                      to={path}
                      className={`px-4 py-2 rounded-full transition-all duration-300 ${
                        isItemActive
                          ? 'text-rose-600 bg-rose-100'
                          : 'text-gray-600 hover:text-rose-600 hover:bg-rose-50'
                      }`}
                    >
                      {item}
                    </Link>
                    {isItemActive && (
                      <motion.span
                        variants={dotVariants}
                        initial="hidden"
                        animate="visible"
                        className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-rose-500 rounded-full"
                      />
                    )}
                  </motion.div>
                );
              })}

              <span className="text-sm text-rose-400 font-light italic">Welcome, {user.username}!</span>

              {/* Chat icon with unread badge */}
              <motion.div whileHover="hover" whileTap="tap" variants={iconVariants} className="relative">
                <Link
                  to="/chat"
                  className="p-2 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-full transition block"
                  aria-label="Chat"
                >
                  <MessageCircle className="w-5 h-5" />
                </Link>
                {unreadChatCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {unreadChatCount > 9 ? '9+' : unreadChatCount}
                  </span>
                )}
              </motion.div>

              {/* Notifications / Settings */}
              {isOwnProfilePage() ? (
                <motion.div whileHover="hover" whileTap="tap" variants={iconVariants}>
                  <button
                    onClick={goToSettings}
                    className="p-2 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-full transition"
                    aria-label="Settings"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                </motion.div>
              ) : (
                <motion.div whileHover="hover" whileTap="tap" variants={iconVariants}>
                  <button
                    onClick={toggleNotifications}
                    className="relative p-2 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-full transition"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                </motion.div>
              )}
            </div>

            {/* Mobile right icons */}
            <div className="md:hidden flex items-center space-x-2">
              {/* Chat icon with badge on mobile */}
              <motion.div whileHover="hover" whileTap="tap" variants={iconVariants} className="relative">
                <Link
                  to="/chat"
                  className="p-2 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-full transition block"
                  aria-label="Chat"
                >
                  <MessageCircle className="w-6 h-6" />
                </Link>
                {unreadChatCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {unreadChatCount > 9 ? '9+' : unreadChatCount}
                  </span>
                )}
              </motion.div>

              <div className="relative" ref={notificationRef}>
                {isOwnProfilePage() ? (
                  <motion.div whileHover="hover" whileTap="tap" variants={iconVariants}>
                    <button
                      onClick={goToSettings}
                      className="p-2 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-full transition"
                      aria-label="Settings"
                    >
                      <Settings className="w-6 h-6" />
                    </button>
                  </motion.div>
                ) : (
                  <motion.div whileHover="hover" whileTap="tap" variants={iconVariants}>
                    <button
                      onClick={toggleNotifications}
                      className="relative p-2 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-full transition"
                      aria-label="Notifications"
                    >
                      <Bell className="w-6 h-6" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </button>
                  </motion.div>
                )}
                {/* Notifications dropdown */}
                {notificationsOpen && !isOwnProfilePage() && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-rose-100 overflow-hidden z-50 animate-slideDown">
                    <div className="p-4 border-b border-rose-100 flex justify-between items-center bg-gradient-to-r from-rose-50 to-white">
                      <span className="font-semibold text-gray-800">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs font-medium text-rose-600 hover:text-rose-700 px-3 py-1 rounded-full bg-rose-100 hover:bg-rose-200 transition"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto divide-y divide-rose-50">
                      {notifications.length > 0 ? (
                        notifications.map((notif) => (
                          <button
                            key={notif._id}
                            onClick={() => handleNotificationClick(notif)}
                            className={`w-full text-left p-4 hover:bg-rose-50/80 transition-all duration-200 flex items-start space-x-3 relative group ${
                              !notif.read ? 'bg-rose-50/30' : ''
                            }`}
                          >
                            <div className="relative flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-rose-400 to-rose-500 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                                {notif.sender?.username?.charAt(0).toUpperCase() || '?'}
                              </div>
                              <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-white shadow-sm flex items-center justify-center">
                                {notif.type === 'like' && <Heart className="h-3 w-3 text-rose-500" />}
                                {notif.type === 'comment' && <MessageCircle className="h-3 w-3 text-blue-500" />}
                                {notif.type === 'follow' && <UserPlus className="h-3 w-3 text-green-500" />}
                                {notif.type === 'bond_request' && <HeartHandshake className="h-3 w-3 text-purple-500" />}
                                {notif.type === 'bond_accept' && <CheckCircle className="h-3 w-3 text-emerald-500" />}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-800">
                                <span className="font-semibold">{notif.sender?.username}</span>{' '}
                                <span className="text-gray-600">
                                  {notif.type === 'like' && 'liked your photo'}
                                  {notif.type === 'comment' && 'commented on your photo'}
                                  {notif.type === 'follow' && 'started following you'}
                                  {notif.type === 'bond_request' && 'sent you a love request'}
                                  {notif.type === 'bond_accept' && 'accepted your love request'}
                                </span>
                              </p>
                              <p className="text-xs text-gray-400 mt-1 flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {formatTime(notif.createdAt)}
                              </p>
                            </div>
                            {!notif.read && <span className="w-2 h-2 bg-rose-500 rounded-full mt-2 animate-pulse"></span>}
                          </button>
                        ))
                      ) : (
                        <div className="p-8 text-center">
                          <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-400 text-sm">No notifications yet</p>
                          <p className="text-xs text-gray-300 mt-1">We'll let you know when something happens</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Bottom navigation */}
      <div
        className={`md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-rose-100 shadow-lg z-50 transform transition-transform duration-300 ${
          showBottomNav ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="flex justify-around items-center py-2">
          {[
            { to: '/', icon: Home, label: 'Home', active: isActive('/') },
            { to: '/bond', icon: HeartHandshake, label: 'Bond', active: isActive('/bond') },
            { to: '/search', icon: Search, label: 'Search', active: location.pathname === '/search' },
            { to: `/profile/${user.username}`, icon: User, label: 'Profile', active: isActive(`/profile/${user.username}`) },
          ].map((item) => (
            <motion.div
              key={item.label}
              whileHover="hover"
              whileTap="tap"
              variants={iconVariants}
              className="relative"
            >
              <Link
                to={item.to}
                className={`flex flex-col items-center p-2 transition ${
                  item.active ? 'text-rose-600' : 'text-gray-500 hover:text-rose-600'
                }`}
              >
                <item.icon className="w-6 h-6" />
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
              {item.active && (
                <motion.span
                  variants={dotVariants}
                  initial="hidden"
                  animate="visible"
                  className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-rose-500 rounded-full"
                />
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Spacer for fixed bottom nav */}
      <div className="md:hidden h-0" />

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
    </>
  );
};

export default Navbar;