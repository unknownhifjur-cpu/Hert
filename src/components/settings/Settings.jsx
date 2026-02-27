import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { User, Lock, Mail, Globe, Bell, Trash2, Save, Settings as SettingsIcon } from 'lucide-react';
import api from '../../utils/api';

const Settings = () => {
  const { user } = useContext(AuthContext);
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

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'password', label: 'Password', icon: Lock },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'privacy', label: 'Privacy', icon: Globe },
    { id: 'notifications', label: 'Notifications', icon: Bell },
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
                  <div>
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