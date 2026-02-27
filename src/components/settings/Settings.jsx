import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { User, Lock, Mail, Globe, Bell, Trash2, Save, Settings as SettingsIcon, LogOut, Info,
  Camera,
  Users,
  Shield,
  Sparkles,
  Moon,
  MessageCircle,
  Palette, HeartHandshake,
  Heart,
  CalendarDays } from 'lucide-react';
import api from '../../utils/api';

const Settings = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('account');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Form states
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [email, setEmail] = useState(user?.email || '');
  const [notifications, setNotifications] = useState({
    emailLikes: true,
    emailComments: true,
    emailFollowers: false,
    pushLikes: true,
    pushComments: false,
    pushFollowers: true,
  });
  const [privacy, setPrivacy] = useState('public'); // 'public' or 'private'

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    setLoading(true);
    try {
      await api.put('/auth/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setMessage({ type: 'success', text: 'Password updated successfully' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to update password' });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/auth/email', { email });
      setMessage({ type: 'success', text: 'Email updated successfully' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to update email' });
    } finally {
      setLoading(false);
    }
  };

  const handlePrivacyUpdate = async () => {
    setLoading(true);
    try {
      await api.put('/users/privacy', { privacy });
      setMessage({ type: 'success', text: 'Privacy settings updated' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Update failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationUpdate = async () => {
    setLoading(true);
    try {
      await api.put('/users/notifications', notifications);
      setMessage({ type: 'success', text: 'Notification preferences saved' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Update failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
    setLoading(true);
    try {
      await api.delete('/auth/account');
      localStorage.removeItem('token');
      window.location.href = '/login';
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to delete account' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      logout();
      navigate('/login');
    }
  };

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'password', label: 'Password', icon: Lock },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'privacy', label: 'Privacy', icon: Globe },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'about', label: 'About', icon: Info },        // New About tab
    { id: 'logout', label: 'Logout', icon: LogOut },
    { id: 'danger', label: 'Danger Zone', icon: Trash2 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-100">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
              <SettingsIcon className="w-6 h-6 text-rose-500" />
              <span>Settings</span>
            </h1>
          </div>

          <div className="flex flex-col md:flex-row">
            {/* Sidebar tabs */}
            <div className="md:w-64 border-r border-gray-100 bg-gray-50/50">
              <nav className="p-4 space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                      activeTab === tab.id
                        ? 'bg-rose-50 text-rose-600'
                        : 'text-gray-600 hover:bg-rose-50/50 hover:text-rose-600'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Main content */}
            <div className="flex-1 p-6">
              {message.text && (
                <div
                  className={`mb-6 p-3 rounded-lg text-sm ${
                    message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                  }`}
                >
                  {message.text}
                </div>
              )}

              {/* Account Tab */}
              {activeTab === 'account' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-xl border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Profile Information</h3>
                    <p className="text-gray-600 mb-4">
                      Manage your public profile information.
                    </p>
                    <button
                      onClick={() => navigate(`/profile/${user.username}/edit`)}
                      className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-2 rounded-lg text-sm font-medium transition"
                    >
                      Edit Profile
                    </button>
                  </div>
                </div>
              )}

              {/* Password Tab */}
              {activeTab === 'password' && (
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Change Password</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      required
                      minLength={6}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center space-x-2 bg-rose-500 hover:bg-rose-600 text-white px-6 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{loading ? 'Updating...' : 'Update Password'}</span>
                  </button>
                </form>
              )}

              {/* Email Tab */}
              {activeTab === 'email' && (
                <form onSubmit={handleEmailUpdate} className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Change Email</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center space-x-2 bg-rose-500 hover:bg-rose-600 text-white px-6 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{loading ? 'Updating...' : 'Update Email'}</span>
                  </button>
                </form>
              )}

              {/* Privacy Tab */}
              {activeTab === 'privacy' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Privacy Settings</h3>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="privacy"
                        value="public"
                        checked={privacy === 'public'}
                        onChange={() => setPrivacy('public')}
                        className="text-rose-500 focus:ring-rose-200"
                      />
                      <span className="text-gray-700">Public account – anyone can see your photos</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="privacy"
                        value="private"
                        checked={privacy === 'private'}
                        onChange={() => setPrivacy('private')}
                        className="text-rose-500 focus:ring-rose-200"
                      />
                      <span className="text-gray-700">Private account – only followers can see your photos</span>
                    </label>
                  </div>
                  <button
                    onClick={handlePrivacyUpdate}
                    disabled={loading}
                    className="flex items-center space-x-2 bg-rose-500 hover:bg-rose-600 text-white px-6 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{loading ? 'Saving...' : 'Save Privacy Settings'}</span>
                  </button>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Notification Preferences</h3>
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Email Notifications</h4>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={notifications.emailLikes}
                          onChange={(e) => setNotifications({ ...notifications, emailLikes: e.target.checked })}
                          className="rounded text-rose-500 focus:ring-rose-200"
                        />
                        <span className="text-gray-700">Someone likes my photo</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={notifications.emailComments}
                          onChange={(e) => setNotifications({ ...notifications, emailComments: e.target.checked })}
                          className="rounded text-rose-500 focus:ring-rose-200"
                        />
                        <span className="text-gray-700">Someone comments on my photo</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={notifications.emailFollowers}
                          onChange={(e) => setNotifications({ ...notifications, emailFollowers: e.target.checked })}
                          className="rounded text-rose-500 focus:ring-rose-200"
                        />
                        <span className="text-gray-700">Someone follows me</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Push Notifications</h4>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={notifications.pushLikes}
                          onChange={(e) => setNotifications({ ...notifications, pushLikes: e.target.checked })}
                          className="rounded text-rose-500 focus:ring-rose-200"
                        />
                        <span className="text-gray-700">Likes</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={notifications.pushComments}
                          onChange={(e) => setNotifications({ ...notifications, pushComments: e.target.checked })}
                          className="rounded text-rose-500 focus:ring-rose-200"
                        />
                        <span className="text-gray-700">Comments</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={notifications.pushFollowers}
                          onChange={(e) => setNotifications({ ...notifications, pushFollowers: e.target.checked })}
                          className="rounded text-rose-500 focus:ring-rose-200"
                        />
                        <span className="text-gray-700">New followers</span>
                      </label>
                    </div>
                  </div>
                  <button
                    onClick={handleNotificationUpdate}
                    disabled={loading}
                    className="flex items-center space-x-2 bg-rose-500 hover:bg-rose-600 text-white px-6 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{loading ? 'Saving...' : 'Save Preferences'}</span>
                  </button>
                </div>
              )}

             {/* About Tab */}
{activeTab === "about" && (
  <div className="space-y-6">
    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">

      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="h-12 w-12 rounded-full bg-rose-100 flex items-center justify-center">
          <Info className="w-6 h-6 text-rose-500" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800">HeartLock</h3>
          <p className="text-sm text-gray-500">Version 1.0.0</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 mb-6 leading-relaxed">
        HeartLock is more than just a photo-sharing platform — it’s a space 
        to capture emotions, preserve memories, and connect through moments 
        that truly matter. Build your personal visual story and share it 
        with the people who matter most.
      </p>

      {/* Features */}
      <div className="border-t border-gray-100 pt-6">
        <h4 className="font-semibold text-gray-700 mb-4">Key Features</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">

          <div className="flex items-start space-x-3 bg-gray-50 p-4 rounded-lg">
            <Camera className="w-5 h-5 text-rose-500 mt-1" />
            <div>
              <h5 className="font-medium text-gray-800">Share Moments</h5>
              <p>Upload photos and create a timeline of your favorite memories.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 bg-gray-50 p-4 rounded-lg">
            <Users className="w-5 h-5 text-rose-500 mt-1" />
            <div>
              <h5 className="font-medium text-gray-800">Connect</h5>
              <p>Follow friends and build meaningful digital connections.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 bg-gray-50 p-4 rounded-lg">
            <Shield className="w-5 h-5 text-rose-500 mt-1" />
            <div>
              <h5 className="font-medium text-gray-800">Privacy Control</h5>
              <p>Manage visibility and choose who can view your content.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 bg-gray-50 p-4 rounded-lg">
            <Sparkles className="w-5 h-5 text-rose-500 mt-1" />
            <div>
              <h5 className="font-medium text-gray-800">Discover</h5>
              <p>Explore inspiring photography and creative stories.</p>
            </div>
          </div>

        </div>
      </div>

      {/* Coming Soon */}
<div className="border-t border-gray-100 pt-6 mt-6">
  <h4 className="font-semibold text-gray-700 mb-4">Coming Soon</h4>

  <div className="space-y-4 text-sm text-gray-600">

    <div className="flex items-center space-x-3">
      <Moon className="w-4 h-4 text-rose-500" />
      <span>Dark Mode Support</span>
    </div>

    <div className="flex items-center space-x-3">
      <MessageCircle className="w-4 h-4 text-rose-500" />
      <span>Direct Messaging</span>
    </div>

    <div className="flex items-center space-x-3">
      <Palette className="w-4 h-4 text-rose-500" />
      <span>Profile Customization</span>
    </div>

    {/* New Relationship Features */}

    <div className="flex items-center space-x-3">
      <HeartHandshake className="w-4 h-4 text-rose-500" />
      <span>Love Connect – Match & build meaningful bonds</span>
    </div>

    <div className="flex items-center space-x-3">
      <Heart className="w-4 h-4 text-rose-500" />
      <span>Relationship Manager – Track and celebrate milestones</span>
    </div>

    <div className="flex items-center space-x-3">
      <CalendarDays className="w-4 h-4 text-rose-500" />
      <span>Anniversary & Special Date Reminders</span>
    </div>

  </div>
</div>

      {/* Footer */}
      <div className="border-t border-gray-100 pt-4 mt-6">
        <p className="text-xs text-gray-400">
          © 2026 HeartLock. All rights reserved.
        </p>
      </div>

    </div>
  </div>
)}
              {/* Logout Tab */}
              {activeTab === 'logout' && (
                <div className="space-y-4">
                  <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
                    <LogOut className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">End Your Session</h3>
                    <p className="text-gray-600 mb-6">
                      You will be logged out of your account and redirected to the login page.
                    </p>
                    <button
                      onClick={handleLogout}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg text-sm font-medium transition inline-flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Danger Zone */}
              {activeTab === 'danger' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h3>
                  <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                    <h4 className="font-medium text-red-700 mb-2">Delete Account</h4>
                    <p className="text-sm text-red-600 mb-4">
                      Once you delete your account, there is no going back. All your data will be permanently removed.
                    </p>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={loading}
                      className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>{loading ? 'Processing...' : 'Delete Account'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;