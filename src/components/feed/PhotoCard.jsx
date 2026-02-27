import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Send, Download, Share2, MoreHorizontal } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';

const PhotoCard = ({ photo }) => {
  const { user } = useContext(AuthContext);
  const currentUserId = user?._id || user?.id;

  const initiallyLiked = photo.likes?.some(id => id.toString() === currentUserId?.toString()) || false;

  const [likes, setLikes] = useState(photo.likes?.length || 0);
  const [liked, setLiked] = useState(initiallyLiked);
  const [comments, setComments] = useState(photo.comments || []);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showShareTooltip, setShowShareTooltip] = useState(false);
  const [heartAnim, setHeartAnim] = useState(false);

  const handleLike = async () => {
    // Trigger heart pop animation
    setHeartAnim(true);
    setTimeout(() => setHeartAnim(false), 300);

    try {
      const res = await api.post(`/photos/${photo._id}/like`);
      setLikes(res.data.likes);
      setLiked(res.data.liked);
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/photos/${photo._id}/comment`, { text: newComment });
      setComments([...comments, res.data]);
      setNewComment('');
    } catch (err) {
      console.error('Comment error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = photo.imageUrl;
    link.download = 'photo.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: photo.caption || 'Check this photo!',
          url: photo.imageUrl,
        });
      } catch (err) {
        console.log('Share cancelled', err);
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(photo.imageUrl);
      setShowShareTooltip(true);
      setTimeout(() => setShowShareTooltip(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300">
      {/* Header – clickable username */}
      <Link to={`/profile/${photo.user?.username}`} className="p-4 flex items-center space-x-3 hover:bg-gray-50 transition-colors">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center text-white font-semibold text-lg shadow-sm">
          {photo.user?.username ? photo.user.username.charAt(0).toUpperCase() : 'U'}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-gray-800">{photo.user?.username || 'Unknown'}</p>
          <p className="text-xs text-gray-400">{new Date(photo.createdAt).toLocaleString()}</p>
        </div>
        <button className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </Link>

      {/* Image with subtle zoom on hover */}
      <div className="overflow-hidden">
        <img
          src={photo.imageUrl}
          alt={photo.caption || 'Photo'}
          className="w-full max-h-96 object-cover transition-transform duration-500 hover:scale-105"
        />
      </div>

      {/* Footer */}
      <div className="p-4">
        {photo.caption && (
          <p className="text-gray-800 mb-3">
            <Link to={`/profile/${photo.user?.username}`} className="font-semibold mr-2 hover:underline">
              {photo.user?.username || 'Unknown'}
            </Link>
            {photo.caption}
          </p>
        )}

        {/* Action buttons – improved spacing and tooltips */}
        <div className="flex items-center space-x-2 mb-3">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-1 px-4 py-2 rounded-full transition-all group ${
              liked ? 'bg-rose-100 text-rose-600' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            } ${heartAnim ? 'scale-110' : ''}`}
          >
            <Heart
              className={`w-5 h-5 transition-all ${liked ? 'fill-rose-500 text-rose-500' : ''} group-hover:scale-110 ${heartAnim ? 'animate-like-pop' : ''}`}
            />
            <span className="text-sm font-medium">{likes}</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-1 px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition group"
          >
            <MessageCircle className="w-5 h-5 text-gray-500 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-gray-700">{comments.length}</span>
          </button>

          <button
            onClick={handleDownload}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition group relative"
            title="Download"
          >
            <Download className="w-5 h-5 text-gray-500 group-hover:scale-110 transition-transform" />
          </button>

          <div className="relative">
            <button
              onClick={handleShare}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition group"
              title="Share"
            >
              <Share2 className="w-5 h-5 text-gray-500 group-hover:scale-110 transition-transform" />
            </button>
            {showShareTooltip && (
              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap animate-fade-in">
                Link copied!
              </span>
            )}
          </div>
        </div>

        {/* Comments section – with animation */}
        <div
          className={`transition-all duration-300 overflow-hidden ${
            showComments ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="mt-3 border-t border-gray-100 pt-3">
            <div className="max-h-40 overflow-y-auto space-y-2 mb-3 pr-2 scrollbar-thin scrollbar-thumb-gray-200">
              {comments.map((comment) => (
                <div key={comment._id} className="flex items-start space-x-2 text-sm">
                  <Link to={`/profile/${comment.user?.username}`} className="font-semibold hover:underline flex-shrink-0">
                    {comment.user?.username}:
                  </Link>
                  <p className="text-gray-700 break-words">{comment.text}</p>
                </div>
              ))}
              {comments.length === 0 && (
                <p className="text-gray-400 text-sm text-center py-2">No comments yet. Be the first!</p>
              )}
            </div>

            <form onSubmit={handleCommentSubmit} className="flex items-center space-x-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-4 py-2 border border-gray-200 rounded-full text-sm focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition"
                disabled={submitting}
              />
              <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                className="p-2 text-rose-500 hover:text-rose-600 disabled:text-gray-300 transition"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Animation keyframes – add to global CSS or style tag */}
      <style>{`
        @keyframes like-pop {
          0% { transform: scale(1); }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
        .animate-like-pop {
          animation: like-pop 0.3s ease-in-out;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translate(-50%, 10px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default PhotoCard;