import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Send, Download, Share2 } from 'lucide-react';
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
  const [copied, setCopied] = useState(false);

  const handleLike = async () => {
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
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
      {/* Header – clickable username */}
      <Link to={`/profile/${photo.user?.username}`} className="p-4 flex items-center space-x-3 hover:bg-gray-50 transition">
        <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-semibold text-lg">
          {photo.user?.username ? photo.user.username.charAt(0).toUpperCase() : 'U'}
        </div>
        <div>
          <p className="font-semibold text-gray-800">{photo.user?.username || 'Unknown'}</p>
          <p className="text-xs text-gray-400">{new Date(photo.createdAt).toLocaleString()}</p>
        </div>
      </Link>

      {/* Image */}
      <img
        src={photo.imageUrl}
        alt={photo.caption || 'Photo'}
        className="w-full max-h-96 object-cover"
      />

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

        {/* Action buttons */}
        <div className="flex items-center space-x-2 mb-3">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-full transition group ${
              liked ? 'bg-rose-100 text-rose-600' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <Heart
              className={`w-5 h-5 ${liked ? 'fill-rose-500 text-rose-500' : ''} group-hover:scale-110 transition-transform`}
            />
            <span className="text-sm font-medium">{likes} {likes === 1 ? 'like' : 'likes'}</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition group"
          >
            <MessageCircle className="w-5 h-5 text-gray-500 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-gray-700">
              {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
            </span>
          </button>

          {/* Download button */}
          <button
            onClick={handleDownload}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition group"
            title="Download"
          >
            <Download className="w-5 h-5 text-gray-500 group-hover:scale-110 transition-transform" />
          </button>

          {/* Share button */}
          <div className="relative">
            <button
              onClick={handleShare}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition group"
              title="Share"
            >
              <Share2 className="w-5 h-5 text-gray-500 group-hover:scale-110 transition-transform" />
            </button>
            {copied && (
              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                Copied!
              </span>
            )}
          </div>
        </div>

        {/* Comments section */}
        {showComments && (
          <div className="mt-3 border-t border-gray-100 pt-3">
            <div className="max-h-40 overflow-y-auto space-y-2 mb-3">
              {comments.map((comment) => (
                <div key={comment._id} className="flex items-start space-x-2 text-sm">
                  <Link to={`/profile/${comment.user?.username}`} className="font-semibold hover:underline">
                    {comment.user?.username}:
                  </Link>
                  <p className="text-gray-700">{comment.text}</p>
                </div>
              ))}
              {comments.length === 0 && (
                <p className="text-gray-400 text-sm">No comments yet. Be the first!</p>
              )}
            </div>

            <form onSubmit={handleCommentSubmit} className="flex items-center space-x-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-3 py-2 border border-gray-200 rounded-full text-sm focus:ring-1 focus:ring-rose-200 focus:border-rose-400 transition"
                disabled={submitting}
              />
              <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                className="p-2 text-rose-500 hover:text-rose-600 disabled:text-gray-300 transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoCard;