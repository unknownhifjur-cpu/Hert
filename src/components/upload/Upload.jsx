import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, X, UploadCloud, Image as ImageIcon } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';

const Upload = () => {
  const { user } = useContext(AuthContext);
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setPreview('');
    // Reset file input
    const fileInput = document.getElementById('file-upload');
    if (fileInput) fileInput.value = '';
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
              <Camera className="w-6 h-6 text-rose-500" />
              <span>Create new post</span>
            </h2>
          </div>

          <div className="flex flex-col md:flex-row">
            {/* Left: Image upload area */}
            <div className="md:w-1/2 p-6 border-r border-gray-100">
              <div className="relative h-full min-h-[300px] flex items-center justify-center">
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  required={!image}
                />
                <div
                  className={`w-full h-full border-2 border-dashed rounded-xl p-6 text-center transition-all flex items-center justify-center ${
                    preview
                      ? 'border-rose-300 bg-rose-50/50'
                      : 'border-gray-300 hover:border-rose-300 hover:bg-rose-50/30'
                  }`}
                >
                  {preview ? (
                    <div className="relative w-full">
                      <img
                        src={preview}
                        alt="Preview"
                        className="max-h-64 mx-auto rounded-lg shadow-md object-contain"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute -top-2 -right-2 p-1 bg-white rounded-full shadow-md text-gray-600 hover:text-rose-600 transition"
                        aria-label="Remove image"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex justify-center text-gray-400">
                        <ImageIcon className="w-12 h-12" />
                      </div>
                      <p className="text-gray-600 font-medium">
                        Click to select a photo
                      </p>
                      <p className="text-sm text-gray-400">
                        or drag and drop
                      </p>
                      <p className="text-xs text-gray-400">
                        JPG, PNG, GIF up to 10MB
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Caption and preview card */}
            <div className="md:w-1/2 p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Caption input */}
                <div>
                  <label htmlFor="caption" className="block text-sm font-medium text-gray-700 mb-1">
                    Caption
                  </label>
                  <textarea
                    id="caption"
                    rows="3"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition resize-none"
                    placeholder="Write a caption..."
                  />
                </div>

                {/* Live preview card (how it will look in feed) */}
                {preview && (
                  <div className="mt-4">
                    <p className="text-xs uppercase tracking-wider text-gray-400 mb-2">Preview</p>
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="h-8 w-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-semibold text-sm">
                          {user?.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-gray-800">{user?.username || 'username'}</p>
                        </div>
                      </div>
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-full max-h-48 object-cover rounded-lg"
                      />
                      {caption && (
                        <p className="text-sm text-gray-700 mt-2">
                          <span className="font-semibold mr-2">{user?.username}</span>
                          {caption}
                        </p>
                      )}
                      <div className="flex items-center text-xs text-gray-400 mt-2 space-x-4">
                        <span>❤️ 0 likes</span>
                        <span>💬 0 comments</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading || !image}
                  className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Sharing...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-5 h-5" />
                      <span>Share Post</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Footer with back link */}
          <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-sm text-gray-500 hover:text-rose-600 transition"
            >
              ← Cancel and go back to Feed
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;