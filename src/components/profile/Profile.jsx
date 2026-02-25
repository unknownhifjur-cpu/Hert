import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../utils/api';

const Profile = () => {
  const { username } = useParams();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserPhotos = async () => {
      try {
        const res = await api.get(`/users/${username}/photos`);
        setPhotos(res.data);
      } catch (err) {
        console.error('Error fetching photos:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserPhotos();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-rose-500 border-r-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Profile header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8 flex items-center space-x-6">
          <div className="h-20 w-20 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 text-3xl font-bold">
            {username?.charAt(0).toUpperCase()}
          </div>
          <h1 className="text-2xl font-bold text-gray-800">{username}</h1>
        </div>

        {/* Photo grid */}
        {photos.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500">No photos yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {photos.map(photo => (
              <div
                key={photo._id}
                className="relative aspect-square group overflow-hidden rounded-lg border border-gray-200 hover:border-rose-300 transition"
              >
                <img
                  src={photo.imageUrl}
                  alt={photo.caption || 'User photo'}
                  className="w-full h-full object-cover"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white space-x-4">
                  <span className="flex items-center space-x-1">
                    <span>❤️</span>
                    <span>{photo.likes?.length || 0}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span>💬</span>
                    <span>{photo.comments?.length || 0}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;