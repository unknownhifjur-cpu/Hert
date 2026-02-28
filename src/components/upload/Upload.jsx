import React, { useState, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Camera, X, UploadCloud, Image as ImageIcon, 
  Heart, Send, Sparkles 
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';

const Upload = () => {
  const { user } = useContext(AuthContext);
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert('File size should be less than 10MB');
        return;
      }
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setPreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('image', image);
    formData.append('caption', caption);
    try {
      await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate('/');
    } catch (err) {
      console.error('Upload error:', err);
      alert('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Create New Post
          </h1>
          <p className="text-gray-500">Share your special moment with the world</p>
        </div>

        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-rose-100 overflow-hidden">
          <div className="p-6 md:p-8">
            {/* Image Upload Area */}
            <div className="mb-8">
              <div className="relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                
                {preview ? (
                  <div className="relative group">
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full max-h-[400px] object-contain rounded-2xl bg-rose-50/50"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full text-gray-600 hover:text-rose-600 transition shadow-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="w-full h-64 md:h-80 border-3 border-dashed border-rose-200 hover:border-rose-400 rounded-2xl bg-rose-50/30 hover:bg-rose-50 transition-all flex flex-col items-center justify-center cursor-pointer">
                    <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-4">
                      <UploadCloud className="w-8 h-8 text-rose-500" />
                    </div>
                    <p className="text-gray-700 font-medium mb-1">Click to select a photo</p>
                    <p className="text-sm text-gray-400">or drag and drop</p>
                    <div className="flex gap-2 mt-4">
                      <span className="px-3 py-1 bg-rose-100 text-rose-600 text-xs rounded-full">JPG</span>
                      <span className="px-3 py-1 bg-rose-100 text-rose-600 text-xs rounded-full">PNG</span>
                      <span className="px-3 py-1 bg-rose-100 text-rose-600 text-xs rounded-full">Max 10MB</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Caption Input */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Caption
              </label>
              <textarea
                rows="4"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full px-5 py-4 bg-white border-2 border-rose-100 rounded-2xl focus:ring-4 focus:ring-rose-200 focus:border-rose-400 transition resize-none"
                placeholder="Write a caption for your moment..."
              />
            </div>

            {/* Preview Card */}
            {preview && (
              <div className="mb-8 p-4 bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl border border-rose-200">
                <div className="flex items-center space-x-2 mb-3">
                  <Sparkles className="w-4 h-4 text-rose-500" />
                  <p className="text-sm font-medium text-rose-600">Preview</p>
                </div>
                <div className="bg-white rounded-xl p-3 shadow-sm">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-semibold text-sm">
                      {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <p className="font-semibold text-sm text-gray-800">{user?.username || 'username'}</p>
                  </div>
                  <img src={preview} alt="Preview" className="w-full rounded-lg" />
                  {caption && (
                    <p className="text-sm text-gray-700 mt-3">
                      <span className="font-semibold mr-2">{user?.username}</span>
                      {caption}
                    </p>
                  )}
                  <div className="flex items-center space-x-4 mt-3 pt-3 border-t border-gray-100">
                    <span className="flex items-center space-x-1 text-xs text-gray-400">
                      <Heart className="w-4 h-4" />
                      <span>0 likes</span>
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="flex-1 px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition flex items-center justify-center space-x-2"
              >
                <X className="w-5 h-5" />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !image}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl font-medium transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-rose-500/25 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Sharing...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Share Post</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gradient-to-r from-rose-50 to-pink-50 border-t border-rose-100 text-center">
            <p className="text-xs text-gray-400 flex items-center justify-center space-x-1">
              <span>Your memories are secured with</span>
              <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;