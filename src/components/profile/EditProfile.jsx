import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';
import { User, Camera } from 'lucide-react';

const EditProfile = () => {
  const { username } = useParams();
  const { user: currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [bio, setBio] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Redirect if not logged in or not own profile
    if (!currentUser || currentUser.username !== username) {
      navigate(`/profile/${username}`);
      return;
    }
    fetchUserProfile();
  }, [currentUser, username, navigate]);

  const fetchUserProfile = async () => {
    try {
      const res = await api.get(`/users/${username}`);
      setBio(res.data.bio || '');
      setProfilePic(res.data.profilePic || '');
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!username) {
      console.warn('EditProfile: missing username param');
      setError('Unable to determine which profile to update.');
      setLoading(false);
      return;
    }

    // log the target path so we can see what is being requested in devtools
    console.debug('Submitting profile update', {
      baseURL: api.defaults.baseURL,
      path: `/users/${username}`,
      data: { bio, profilePic }
    });

    try {
      await api.put(`/users/${username}`, { bio, profilePic });
      navigate(`/profile/${username}`);
    } catch (err) {
      // give more context depending on status code
      console.error('Update error:', err);
      if (err.response) {
        if (err.response.status === 404) {
          setError('User not found – please refresh or log in again.');
        } else if (err.response.status === 401) {
          setError('You are not authorized. Please log in.');
        } else {
          setError(err.response.data?.error || 'Update failed');
        }
      } else {
        setError('Network error – could not reach server');
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-rose-500 border-r-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-lg mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
            <User className="w-6 h-6 text-rose-500" />
            <span>Edit Profile</span>
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture URL */}
            <div>
              <label htmlFor="profilePic" className="block text-sm font-medium text-gray-700 mb-1">
                Profile Picture URL
              </label>
              <div className="relative">
                <Camera className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="profilePic"
                  type="url"
                  value={profilePic}
                  onChange={(e) => setProfilePic(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition"
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Leave empty to use initial‑based avatar
              </p>
            </div>

            {/* Bio */}
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                id="bio"
                rows="4"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition resize-none"
                placeholder="Tell something about yourself..."
              />
            </div>

            {/* Buttons */}
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => navigate(`/profile/${username}`)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-4 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;