import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import PhotoCard from './PhotoCard';

const Feed = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const res = await api.get('/photos');
      setPhotos(res.data);
    } catch (err) {
      console.error('Error fetching photos:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Photo Feed</h1>
      {photos.length === 0 ? (
        <p>No photos yet. Be the first to upload!</p>
      ) : (
        photos.map(photo => <PhotoCard key={photo._id} photo={photo} />)
      )}
    </div>
  );
};

export default Feed;