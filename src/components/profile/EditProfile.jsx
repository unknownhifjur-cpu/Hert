import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';
import { User, Camera, AlertCircle, Upload, X } from 'lucide-react';

const EditProfile = () => {
  const { username } = useParams();
  const { user: currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [bio, setBio] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    if (currentUser.username !== username) {
      navigate(`/profile/${username}`);
      return;
    }
    fetchUserProfile();
  }, [currentUser, username, navigate]);

  const fetchUserProfile = async () => {
    setFetchLoading(true);
    setFetchError('');
    try {
      const res = await api.get(`/users/${username}`);
      setBio(res.data.bio || '');
      setProfilePic(res.data.profilePic || '');
    } catch (err) {
      console.error('Error fetching profile:', err);
      if (err.response?.status === 404) {
        setFetchError('User profile not found.');
      } else {
        setFetchError('Failed to load profile. Please try again.');
      }
    } finally {
      setFetchLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setProfilePic(''); // clear any URL
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    const fileInput = document.getElementById('profile-pic-upload');
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFetchError('');

    try {
      let finalProfilePic = profilePic;

      if (selectedFile) {
        const formData = new FormData();
        formData.append('image', selectedFile);
        formData.append('caption', ''); // upload endpoint expects caption
        const uploadRes = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        finalProfilePic = uploadRes.data.photo.imageUrl;
      }

      await api.put(`/users/${username}`, { bio, profilePic: finalProfilePic });
      navigate(`/profile/${username}`);
    } catch (err) {
      console.error('Update error:', err);
      if (err.response?.status === 404) {
        setFetchError('User not found – please refresh or log in again.');
      } else if (err.response?.status === 403) {
        setFetchError('You are not authorized to edit this profile.');
      } else {
        setFetchError(err.response?.data?.error || 'Update failed');
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

  if (fetchError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-6">{fetchError}</p>
          <div className="space-x-3">
            <button
              onClick={() => navigate(`/profile/${username}`)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-2 rounded-lg transition"
            >
              Go Back
            </button>
            <button
              onClick={fetchUserProfile}
              className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-2 rounded-lg transition"
            >
              Retry
            </button>
          </div>
        </div>
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

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Profile Picture
              </label>

              <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-rose-300 transition">
                <input
                  id="profile-pic-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {previewUrl ? (
                  <div className="relative inline-block">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="h-24 w-24 rounded-full object-cover mx-auto border-2 border-rose-200"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="absolute -top-2 -right-2 p-1 bg-white rounded-full shadow-md text-gray-600 hover:text-rose-600 transition"
                      aria-label="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : profilePic ? (
                  <div className="relative inline-block">
                    <img
                      src={profilePic}
                      alt="Current profile"
                      className="h-24 w-24 rounded-full object-cover mx-auto border-2 border-gray-200"
                    />
                    <p className="text-xs text-gray-400 mt-2">Current picture</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                    <p className="text-gray-600">Click to upload a new picture</p>
                  </div>
                )}
              </div>

              <div className="flex items-center my-3">
                <div className="flex-1 border-t border-gray-200"></div>
                <span className="px-3 text-sm text-gray-400">OR</span>
                <div className="flex-1 border-t border-gray-200"></div>
              </div>

              <div className="relative">
                <Camera className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="url"
                  value={profilePic}
                  onChange={(e) => {
                    setProfilePic(e.target.value);
                    setSelectedFile(null);
                    setPreviewUrl('');
                    const fileInput = document.getElementById('profile-pic-upload');
                    if (fileInput) fileInput.value = '';
                  }}
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