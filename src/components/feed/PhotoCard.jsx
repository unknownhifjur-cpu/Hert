import React from 'react';
import { Heart, MessageCircle } from 'lucide-react';

const PhotoCard = ({ photo }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
      {/* Card Header: User Info */}
      <div className="p-4 flex items-center space-x-3">
        <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-semibold text-lg">
          {photo.user?.username ? photo.user.username.charAt(0).toUpperCase() : 'U'}
        </div>
        <div>
          <p className="font-semibold text-gray-800">
            {photo.user?.username || 'Unknown'}
          </p>
          <p className="text-xs text-gray-400">
            {new Date(photo.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Card Image */}
      <img
        src={photo.imageUrl}
        alt={photo.caption || 'Photo'}
        className="w-full max-h-96 object-cover"
      />

      {/* Card Footer: Caption & Action Buttons */}
      <div className="p-4">
        {photo.caption && (
          <p className="text-gray-800 mb-3">
            <span className="font-semibold mr-2">
              {photo.user?.username || 'Unknown'}
            </span>
            {photo.caption}
          </p>
        )}
        
        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {/* Like Button */}
          <button className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition group">
            <Heart className="w-5 h-5 text-rose-500 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-gray-700">
              {photo.likes?.length || 0} {photo.likes?.length === 1 ? 'like' : 'likes'}
            </span>
          </button>

          {/* Comment Button */}
          <button className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition group">
            <MessageCircle className="w-5 h-5 text-gray-500 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-gray-700">
              {photo.comments?.length || 0} {photo.comments?.length === 1 ? 'comment' : 'comments'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhotoCard;