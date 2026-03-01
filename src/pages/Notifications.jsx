import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from './../utils/api';
import {
  Heart,
  MessageCircle,
  UserPlus,
  HeartHandshake,
  CheckCircle,
  Bell,
  Clock,
  ArrowLeft,
  CheckCheck,
  Check,
  X,
  Loader2
} from 'lucide-react';

/**
 * Notifications Component
 * Displays user notifications with real-time actions (follow back, accept/reject bond)
 * Features:
 * - Mark as read on click
 * - Optimistic updates for actions
 * - Global user context updated after follow-back
 * - AbortController for fetch cancellation
 * - Separate loading states per action
 * - Improved error handling
 * - Proper key usage and memoization
 */
const Notifications = () => {
  const { user, refreshUser } = useContext(AuthContext); // Assume refreshUser fetches latest user data
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  // Fetch notifications on mount with abort support
  useEffect(() => {
    abortControllerRef.current = new AbortController();
    fetchNotifications(abortControllerRef.current.signal);

    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const fetchNotifications = async (signal) => {
    try {
      setError(null);
      const res = await api.get('/notifications', { signal });
      setNotifications(res.data);
    } catch (err) {
      if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
        console.error('Failed to fetch notifications', err);
        setError('Unable to load notifications. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Mark a single notification as read (optimistic update)
  const markAsRead = useCallback(async (id) => {
    // Optimistically update local state
    setNotifications(prev =>
      prev.map(n => (n._id === id ? { ...n, read: true } : n))
    );
    try {
      await api.put(`/notifications/${id}/read`);
    } catch (err) {
      console.error('Failed to mark as read', err);
      // Revert optimistic update on error
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, read: false } : n))
      );
    }
  }, []);

  // Mark all as read (optimistic update)
  const markAllAsRead = useCallback(async () => {
    const previous = notifications;
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try {
      await api.put('/notifications/read-all');
    } catch (err) {
      console.error('Failed to mark all as read', err);
      setNotifications(previous); // revert
    }
  }, [notifications]);

  // Handle click on notification body (navigate + mark read)
  const handleNotificationClick = useCallback((notif) => {
    if (!notif.read) {
      markAsRead(notif._id);
    }
    if (notif.type === 'like' || notif.type === 'comment') {
      if (notif.photo) navigate(`/photo/${notif.photo._id}`);
    } else if (notif.type === 'follow') {
      navigate(`/profile/${notif.sender.username}`);
    } else if (notif.type === 'bond_request' || notif.type === 'bond_accept') {
      navigate('/bond');
    }
  }, [markAsRead, navigate]);

  // Follow back action
  const handleFollowBack = useCallback(async (notif) => {
    const id = notif._id;
    setActionLoading(prev => ({ ...prev, [id]: true }));
    try {
      await api.post(`/users/${notif.sender.username}/follow`);
      // Update local notification state (hide button)
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, followedBack: true } : n))
      );
      // Mark as read (optional – could keep notification but without button)
      await markAsRead(id);
      // Refresh global user context to update following list
      if (refreshUser) await refreshUser();
    } catch (err) {
      console.error('Follow back failed', err);
      alert(err.response?.data?.error || 'Failed to follow back. Please try again.');
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  }, [markAsRead, refreshUser]);

  // Accept bond request
  const handleAcceptRequest = useCallback(async (notif) => {
    const id = notif._id;
    setActionLoading(prev => ({ ...prev, [id]: true }));
    try {
      await api.post(`/bond/accept/${notif.sender._id}`);
      // Remove notification on success
      setNotifications(prev => prev.filter(n => n._id !== id));
      // Optionally refresh user if bond status changed
      if (refreshUser) await refreshUser();
    } catch (err) {
      console.error('Accept failed', err);
      if (err.response?.status === 400) {
        // Stale notification – remove it silently
        setNotifications(prev => prev.filter(n => n._id !== id));
      } else {
        alert(err.response?.data?.error || 'Failed to accept request. Please try again.');
      }
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  }, [refreshUser]);

  // Reject bond request
  const handleRejectRequest = useCallback(async (notif) => {
    const id = notif._id;
    setActionLoading(prev => ({ ...prev, [id]: true }));
    try {
      await api.post(`/bond/reject/${notif.sender._id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      console.error('Reject failed', err);
      if (err.response?.status === 400) {
        setNotifications(prev => prev.filter(n => n._id !== id));
      } else {
        alert(err.response?.data?.error || 'Failed to reject request. Please try again.');
      }
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  }, []);

  // Helper: format relative time
  const formatTime = useCallback((dateString) => {
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
  }, []);

  // Helper: get icon for notification type
  const getIcon = useCallback((type) => {
    switch (type) {
      case 'like': return <Heart className="w-4 h-4 text-rose-500" />;
      case 'comment': return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case 'follow': return <UserPlus className="w-4 h-4 text-green-500" />;
      case 'bond_request': return <HeartHandshake className="w-4 h-4 text-purple-500" />;
      case 'bond_accept': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      default: return <Bell className="w-4 h-4 text-gray-400" />;
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin"></div>
          <Heart className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-rose-500 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-100 p-8 max-w-md">
          <Bell className="w-16 h-16 text-rose-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-2">{error}</p>
          <button
            onClick={() => {
              setLoading(true);
              setError(null);
              fetchNotifications();
            }}
            className="mt-4 px-4 py-2 bg-rose-500 text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 pt-16 pb-20">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 text-gray-600 hover:text-rose-600 rounded-full hover:bg-rose-50 transition"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
              Notifications
            </h1>
          </div>
          {notifications.some(n => !n.read) && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-rose-600 hover:text-rose-700 px-3 py-1 rounded-full bg-rose-100 hover:bg-rose-200 transition flex items-center space-x-1"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark all as read</span>
            </button>
          )}
        </div>

        {/* Notifications list */}
        {notifications.length === 0 ? (
          <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-100">
            <Bell className="w-16 h-16 text-rose-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-2">No notifications yet</p>
            <p className="text-gray-400">We'll let you know when something happens</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {notifications.map(notif => {
              // Convert both to string for safe comparison
              const alreadyFollowing = user?.following?.some(
                followId => String(followId) === String(notif.sender?._id)
              );

              return (
                <li key={notif._id}>
                  <div
                    className={`w-full p-4 rounded-xl transition-all duration-200 flex items-start space-x-3 ${
                      !notif.read
                        ? 'bg-rose-50/80'
                        : 'bg-white/80'
                    }`}
                  >
                    {/* Avatar and main content (clickable) */}
                    <div
                      className="flex-1 flex items-start space-x-3 cursor-pointer"
                      onClick={() => handleNotificationClick(notif)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && handleNotificationClick(notif)}
                    >
                      <div className="relative flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                          {notif.sender?.username?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-white shadow-sm flex items-center justify-center">
                          {getIcon(notif.type)}
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
                        <div className="flex items-center space-x-2 mt-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-400">{formatTime(notif.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center space-x-2">
                      {notif.type === 'follow' && !alreadyFollowing && !notif.followedBack && (
                        <button
                          onClick={() => handleFollowBack(notif)}
                          disabled={actionLoading[notif._id]}
                          className="px-3 py-1.5 text-xs font-medium bg-rose-100 text-rose-600 rounded-full hover:bg-rose-200 transition disabled:opacity-50 flex items-center space-x-1"
                          aria-label={`Follow back ${notif.sender?.username}`}
                        >
                          {actionLoading[notif._id] ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <UserPlus className="w-3 h-3" />
                          )}
                          <span>Follow back</span>
                        </button>
                      )}

                      {notif.type === 'bond_request' && (
                        <>
                          <button
                            onClick={() => handleAcceptRequest(notif)}
                            disabled={actionLoading[notif._id]}
                            className="p-2 bg-emerald-100 text-emerald-600 rounded-full hover:bg-emerald-200 transition disabled:opacity-50"
                            title="Accept"
                            aria-label="Accept bond request"
                          >
                            {actionLoading[notif._id] ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleRejectRequest(notif)}
                            disabled={actionLoading[notif._id]}
                            className="p-2 bg-rose-100 text-rose-600 rounded-full hover:bg-rose-200 transition disabled:opacity-50"
                            title="Reject"
                            aria-label="Reject bond request"
                          >
                            {actionLoading[notif._id] ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <X className="w-4 h-4" />
                            )}
                          </button>
                        </>
                      )}

                      {!notif.read && (
                        <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" aria-label="Unread" />
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Notifications;