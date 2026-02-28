import React, { useState, useEffect, useContext } from 'react';
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

const Notifications = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const handleNotificationClick = (notif) => {
    if (notif.type === 'like' || notif.type === 'comment') {
      if (notif.photo) navigate(`/photo/${notif.photo._id}`);
    } else if (notif.type === 'follow') {
      navigate(`/profile/${notif.sender.username}`);
    } else if (notif.type === 'bond_request' || notif.type === 'bond_accept') {
      navigate('/bond');
    }
  };

  const handleFollowBack = async (notif) => {
    const id = notif._id;
    setActionLoading(prev => ({ ...prev, [id]: true }));
    try {
      await api.post(`/users/${notif.sender.username}/follow`);
      await markAsRead(id);
      // Mark locally that we've followed back
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, followedBack: true } : n))
      );
    } catch (err) {
      console.error('Follow back failed', err);
      alert(err.response?.data?.error || 'Failed to follow back');
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleAcceptRequest = async (notif) => {
    const id = notif._id;
    setActionLoading(prev => ({ ...prev, [id]: true }));
    try {
      await api.post(`/bond/accept/${notif.sender._id}`);
      await fetchNotifications();
    } catch (err) {
      console.error('Accept failed', err);
      alert(err.response?.data?.error || 'Failed to accept request');
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleRejectRequest = async (notif) => {
    const id = notif._id;
    setActionLoading(prev => ({ ...prev, [id]: true }));
    try {
      await api.post(`/bond/reject/${notif.sender._id}`);
      await fetchNotifications();
    } catch (err) {
      console.error('Reject failed', err);
      alert(err.response?.data?.error || 'Failed to reject request');
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
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

  const getIcon = (type) => {
    switch (type) {
      case 'like': return <Heart className="w-4 h-4 text-rose-500" />;
      case 'comment': return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case 'follow': return <UserPlus className="w-4 h-4 text-green-500" />;
      case 'bond_request': return <HeartHandshake className="w-4 h-4 text-purple-500" />;
      case 'bond_accept': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      default: return <Bell className="w-4 h-4 text-gray-400" />;
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 pt-16 pb-20">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 text-gray-600 hover:text-rose-600 rounded-full hover:bg-rose-50 transition"
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
              // Determine if current user already follows the sender (for follow notifications)
              const alreadyFollowing = user?.following?.some(
                followId => followId === notif.sender?._id
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
                    >
                      <div className="relative flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                          {notif.sender?.username?.charAt(0).toUpperCase() || '?'}
                        </div>
                        {/* Type icon badge */}
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
                      {notif.type === 'follow' && !alreadyFollowing && (
                        notif.followedBack ? (
                          <button
                            disabled
                            className="px-3 py-1.5 text-xs font-medium bg-gray-200 text-gray-500 rounded-full cursor-default flex items-center space-x-1"
                          >
                            <Check className="w-3 h-3" />
                            <span>Following</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleFollowBack(notif)}
                            disabled={actionLoading[notif._id]}
                            className="px-3 py-1.5 text-xs font-medium bg-rose-100 text-rose-600 rounded-full hover:bg-rose-200 transition disabled:opacity-50 flex items-center space-x-1"
                          >
                            {actionLoading[notif._id] ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <UserPlus className="w-3 h-3" />
                            )}
                            <span>Follow back</span>
                          </button>
                        )
                      )}

                      {notif.type === 'bond_request' && (
                        <>
                          <button
                            onClick={() => handleAcceptRequest(notif)}
                            disabled={actionLoading[notif._id]}
                            className="p-2 bg-emerald-100 text-emerald-600 rounded-full hover:bg-emerald-200 transition disabled:opacity-50"
                            title="Accept"
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
                        <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
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