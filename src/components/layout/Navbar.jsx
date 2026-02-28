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
  const [showBottomNav, setShowBottomNav] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const lastScrollY = useRef(0);

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

  const goToSettings = () => navigate('/settings');

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
                <motion.div whileHover="hover" whileTap="tap" variants={iconVariants} className="relative">
                  <Link
                    to="/notifications"
                    className="p-2 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-full transition block"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                  </Link>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
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

              {/* Notifications/Settings on mobile */}
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
                <motion.div whileHover="hover" whileTap="tap" variants={iconVariants} className="relative">
                  <Link
                    to="/notifications"
                    className="p-2 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-full transition block"
                    aria-label="Notifications"
                  >
                    <Bell className="w-6 h-6" />
                  </Link>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </motion.div>
              )}
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