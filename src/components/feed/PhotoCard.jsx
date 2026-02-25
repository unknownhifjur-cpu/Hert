import React from 'react';

const PhotoCard = ({ photo }) => {
  return (
    <div className="border border-gray-300 rounded p-4 my-4 max-w-md mx-auto">
      <p className="font-semibold">{photo.user?.username || 'Unknown'}</p>
      <img src={photo.imageUrl} alt={photo.caption} className="w-full max-h-96 object-cover my-2" />
      <p className="text-gray-800">{photo.caption}</p>
      <p className="text-sm text-gray-500">
        ❤️ {photo.likes?.length || 0} likes • 💬 {photo.comments?.length || 0} comments
      </p>
      <small className="text-gray-400">{new Date(photo.createdAt).toLocaleString()}</small>
    </div>
  );
};

export default PhotoCard;