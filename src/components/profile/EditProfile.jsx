import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';
import { 
  User, Camera, AlertCircle, Upload, X, Save, 
  ArrowLeft, Heart, Edit3, Image as ImageIcon, 
  CheckCircle, Trash2, Sparkles 
} from 'lucide-react';

const EditProfile = () => {
  const { username } = useParams();
  const { user: currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [bio, setBio] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const MAX_BIO_CHARS = 150;

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

  useEffect(() => {
    setCharCount(bio.length);
  }, [bio]);

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
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setProfilePic(''); // clear any URL
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setProfilePic('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFetchError('');
    setSaveSuccess(false);

    try {
      let finalProfilePic = profilePic;

      if (selectedFile) {
        const formData = new FormData();
        formData.append('image', selectedFile);
        formData.append('caption', 'Profile picture');
        const uploadRes = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        finalProfilePic = uploadRes.data.photo.imageUrl;
      }

      await api.put(`/users/${username}`, { 
        bio: bio.trim(), 
        profilePic: finalProfilePic 
      });
      
      setSaveSuccess(true);
      setTimeout(() => {
        navigate(`/profile/${username}`);
      }, 1500);
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

  const getBioProgressColor = () => {
    if (charCount > MAX_BIO_CHARS) return 'bg-rose-500';
    if (charCount > MAX_BIO_CHARS * 0.8) return 'bg-yellow-500';
    return 'bg-emerald-500';
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin"></div>
          <Heart className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-rose-500 animate-pulse" />
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 text-center border border-rose-100">
          <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-rose-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-8">{fetchError}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate(`/profile/${username}`)}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </button>
            <button
              onClick={fetchUserProfile}
              className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-medium transition flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Try Again</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header with back button */}
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={() => navigate(`/profile/${username}`)}
            className="p-2 hover:bg-white/50 rounded-full transition group"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600 group-hover:text-rose-500" />
          </button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
              Edit Profile
            </h1>
            <p className="text-gray-500 text-sm mt-1">Customize your public profile</p>
          </div>
        </div>

        {/* Success message */}
        {saveSuccess && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center space-x-3 animate-slideDown">
            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-emerald-700 font-medium">Profile updated successfully! Redirecting...</p>
          </div>
        )}

        {/* Main form card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-rose-100 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Profile Picture Section */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Camera className="w-5 h-5 text-rose-500" />
                <h3 className="text-lg font-semibold text-gray-800">Profile Picture</h3>
              </div>

              {/* Preview Area */}
              <div className="bg-rose-50/50 rounded-2xl p-6 border-2 border-dashed border-rose-200 hover:border-rose-300 transition">
                <div className="flex flex-col items-center">
                  {/* Image Preview */}
                  <div className="relative mb-4">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 p-1">
                      <div className="w-full h-full rounded-full bg-white overflow-hidden">
                        {previewUrl ? (
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : profilePic ? (
                          <img
                            src={profilePic}
                            alt="Current"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-50">
                            <User className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Remove button */}
                    {(previewUrl || profilePic) && (
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="absolute -top-2 -right-2 p-2 bg-white rounded-full shadow-lg text-gray-600 hover:text-rose-600 transition border border-gray-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Upload Options */}
                  <div className="w-full max-w-sm">
                    {/* File Upload Button */}
                    <div className="relative mb-3">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="w-full px-4 py-3 bg-white border-2 border-rose-200 rounded-xl text-rose-600 font-medium hover:bg-rose-50 transition flex items-center justify-center space-x-2">
                        <Upload className="w-5 h-5" />
                        <span>Choose a photo</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-400 text-center">
                      or paste an image URL below
                    </p>

                    {/* URL Input */}
                    <div className="relative mt-3">
                      <ImageIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="url"
                        value={profilePic}
                        onChange={(e) => {
                          setProfilePic(e.target.value);
                          setSelectedFile(null);
                          setPreviewUrl('');
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition"
                        placeholder="https://example.com/avatar.jpg"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Edit3 className="w-5 h-5 text-rose-500" />
                  <h3 className="text-lg font-semibold text-gray-800">Bio</h3>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  charCount > MAX_BIO_CHARS 
                    ? 'bg-rose-100 text-rose-600' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {charCount}/{MAX_BIO_CHARS}
                </span>
              </div>

              <textarea
                rows="4"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className={`w-full px-5 py-4 bg-white border-2 rounded-xl focus:ring-2 focus:ring-rose-200 transition resize-none ${
                  charCount > MAX_BIO_CHARS 
                    ? 'border-rose-300 focus:border-rose-500' 
                    : 'border-gray-200 focus:border-rose-400'
                }`}
                placeholder="Tell us about yourself... What makes you special?"
                maxLength={MAX_BIO_CHARS}
              />

              {/* Character progress bar */}
              <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${getBioProgressColor()}`}
                  style={{ width: `${(charCount / MAX_BIO_CHARS) * 100}%` }}
                ></div>
              </div>

              <p className="text-xs text-gray-400 mt-2 flex items-center space-x-1">
                <Sparkles className="w-3 h-3" />
                <span>Your bio helps others know you better</span>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => navigate(`/profile/${username}`)}
                className="flex-1 px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition flex items-center justify-center space-x-2"
              >
                <X className="w-5 h-5" />
                <span>Cancel</span>
              </button>
              <button
                type="submit"
                disabled={loading || charCount > MAX_BIO_CHARS}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg shadow-rose-500/25"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Tips Card */}
        <div className="mt-6 bg-rose-50/50 backdrop-blur-sm rounded-2xl border border-rose-100 p-6">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-rose-500" />
            <span>Profile Tips</span>
          </h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
              <span>Add a clear photo of yourself to build trust</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
              <span>Write a bio that reflects your personality</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
              <span>Keep your bio concise and engaging ({MAX_BIO_CHARS} chars max)</span>
            </li>
          </ul>
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default EditProfile;