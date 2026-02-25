import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import PhotoCard from './PhotoCard';

const Feed = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPhotos();
  }, []);

  // Fisher-Yates shuffle function
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
      // Shuffle photos for random order on each load
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
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
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-6">
        <div className="max-w-2xl mx-auto px-4">
          <header className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-rose-600">
                Feed
              </h1>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 text-gray-500 hover:text-rose-500 transition rounded-full hover:bg-rose-50"
                aria-label="Refresh feed"
              >
                <svg
                  className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            </div>

            <Link
              to="/upload"
              className="flex items-center space-x-2 bg-rose-500 hover:bg-rose-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition shadow-sm hover:shadow-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>New Post</span>
            </Link>
          </header>

          {loading ? (
            <div className="space-y-6">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : photos.length === 0 ? (
            <div className="text-center py-20 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100">
              <div className="text-6xl mb-4">📸</div>
              <p className="text-gray-500 text-lg mb-2">No photos yet</p>
              <p className="text-gray-400">Be the first to share a moment!</p>
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