import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, PlusCircle } from 'lucide-react';
import api from '../../utils/api';
import PhotoCard from './PhotoCard';

const Feed = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const fetchPhotos = async () => {
    try {
      const res = await api.get('/photos');
      const shuffled = shuffleArray(res.data);
      setPhotos(shuffled);
    } catch (err) {
      console.error('Error fetching photos:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPhotos();
  };

  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
      <div className="p-4 flex items-center space-x-3">
        <div className="h-10 w-10 rounded-full bg-gray-200"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
      <div className="w-full h-96 bg-gray-200"></div>
      <div className="p-4">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
        <div className="flex space-x-4">
          <div className="h-4 bg-gray-200 rounded w-16"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    </div>
  );

  const fadeInUpStyle = {
    animation: 'fadeInUp 0.5s ease-out forwards',
    opacity: 0,
  };

  const animationStyles = `
    @keyframes fadeInUp {
      0% { opacity: 0; transform: translateY(20px); }
      100% { opacity: 1; transform: translateY(0); }
    }
  `;

  return (
    <>
      <style>{animationStyles}</style>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-2xl mx-auto px-4 py-6">
          {/* Header – cleaner design */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold text-gray-800">Feed</h1>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 text-gray-400 hover:text-rose-500 transition rounded-full hover:bg-rose-50"
                aria-label="Refresh"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <Link
              to="/upload"
              className="flex items-center space-x-2 bg-rose-500 hover:bg-rose-600 text-white px-5 py-2.5 rounded-full text-sm font-medium transition shadow-sm hover:shadow-md"
            >
              <PlusCircle className="w-5 h-5" />
              <span>New Post</span>
            </Link>
          </div>

          {/* Feed Content */}
          {loading ? (
            <div className="space-y-6">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : photos.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="text-6xl mb-4">📸</div>
              <p className="text-gray-500 text-lg mb-2">No photos yet</p>
              <p className="text-gray-400 mb-6">Share your first moment with the community</p>
              <Link
                to="/upload"
                className="inline-flex items-center space-x-2 bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-full text-sm font-medium transition shadow-sm"
              >
                <PlusCircle className="w-5 h-5" />
                <span>Upload a Photo</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {photos.map((photo, index) => (
                <div
                  key={photo._id}
                  style={{ ...fadeInUpStyle, animationDelay: `${index * 0.1}s` }}
                >
                  <PhotoCard photo={photo} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Feed;