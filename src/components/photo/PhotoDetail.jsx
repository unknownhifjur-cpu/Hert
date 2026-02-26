import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';
import { Heart, MessageCircle, Send, Download, Share2, Trash2, X } from 'lucide-react';

const PhotoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const currentUserId = user?._id || user?.id;
  const isOwner = photo?.user?._id === currentUserId || photo?.user?.id === currentUserId;

  useEffect(() => {
    fetchPhoto();
  }, [id]);

  const fetchPhoto = async () => {
    try {
      const res = await api.get(`/photos/${id}`);
      setPhoto(res.data);
      setLikes(res.data.likes?.length || 0);
      setLiked(res.data.likes?.some(uid => uid.toString() === currentUserId?.toString()));
      setComments(res.data.comments || []);
    } catch (err) {
      console.error(err);
      setError('Photo not found');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      const res = await api.post(`/photos/${id}/like`);
      setLikes(res.data.likes);
      setLiked(res.data.liked);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/photos/${id}/comment`, { text: newComment });
      setComments([...comments, res.data]);
      setNewComment('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this photo?')) return;
    try {
      await api.delete(`/photos/${id}`);
      navigate(-1); // go back to previous page
    } catch (err) {
      console.error(err);
      alert('Delete failed');
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

  const shareUrls = {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(photo?.caption || 'Check this photo!')}%20${encodeURIComponent(photo?.imageUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(photo?.imageUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(photo?.caption || 'Check this photo!')}&url=${encodeURIComponent(photo?.imageUrl)}`,
    copy: photo?.imageUrl
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(photo.imageUrl);
    alert('Link copied!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-rose-500 border-r-transparent"></div>
      </div>
    );
  }

  if (error || !photo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">{error || 'Photo not found'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header with back button */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-rose-600 transition">
              ← Back
            </button>
            <div className="flex items-center space-x-3">
              {isOwner && (
                <button
                  onClick={handleDelete}
                  className="p-2 text-gray-500 hover:text-rose-600 transition"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={handleDownload}
                className="p-2 text-gray-500 hover:text-rose-600 transition"
                title="Download"
              >
                <Download className="w-5 h-5" />
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="p-2 text-gray-500 hover:text-rose-600 transition"
                  title="Share"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                {showShareMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-10">
                    <a
                      href={shareUrls.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-4 py-2 text-gray-700 hover:bg-rose-50 hover:text-rose-600 transition"
                      onClick={() => setShowShareMenu(false)}
                    >
                      WhatsApp
                    </a>
                    <a
                      href={shareUrls.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-4 py-2 text-gray-700 hover:bg-rose-50 hover:text-rose-600 transition"
                      onClick={() => setShowShareMenu(false)}
                    >
                      Facebook
                    </a>
                    <a
                      href={shareUrls.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-4 py-2 text-gray-700 hover:bg-rose-50 hover:text-rose-600 transition"
                      onClick={() => setShowShareMenu(false)}
                    >
                      Twitter
                    </a>
                    <button
                      onClick={() => {
                        copyToClipboard();
                        setShowShareMenu(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-rose-50 hover:text-rose-600 transition"
                    >
                      Copy Link
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row">
            {/* Left: Image */}
            <div className="md:w-3/5 p-6 flex items-center justify-center bg-black/5">
              <img
                src={photo.imageUrl}
                alt={photo.caption || 'Photo'}
                className="max-h-[70vh] object-contain rounded-lg"
              />
            </div>

            {/* Right: Details */}
            <div className="md:w-2/5 p-6">
              {/* User info */}
              <Link
                to={`/profile/${photo.user?.username}`}
                className="flex items-center space-x-3 mb-6 hover:bg-gray-50 p-2 rounded-lg transition"
              >
                <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-semibold text-lg">
                  {photo.user?.username ? photo.user.username.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{photo.user?.username || 'Unknown'}</p>
                  <p className="text-xs text-gray-400">{new Date(photo.createdAt).toLocaleString()}</p>
                </div>
              </Link>

              {/* Caption */}
              {photo.caption && (
                <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-800">
                    <span className="font-semibold mr-2">{photo.user?.username}</span>
                    {photo.caption}
                  </p>
                </div>
              )}

              {/* Like button */}
              <div className="flex items-center space-x-2 mb-6">
                <button
                  onClick={handleLike}
                  className={`flex items-center space-x-1 px-4 py-2 rounded-full transition ${
                    liked ? 'bg-rose-100 text-rose-600' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${liked ? 'fill-rose-500 text-rose-500' : ''}`} />
                  <span className="font-medium">{likes} {likes === 1 ? 'like' : 'likes'}</span>
                </button>
              </div>

              {/* Comments section */}
              <div className="border-t border-gray-100 pt-4">
                <h3 className="font-semibold text-gray-800 mb-3">Comments ({comments.length})</h3>
                <div className="max-h-60 overflow-y-auto space-y-3 mb-4">
                  {comments.map(comment => (
                    <div key={comment._id} className="flex items-start space-x-2 text-sm">
                      <Link to={`/profile/${comment.user?.username}`} className="font-semibold hover:underline">
                        {comment.user?.username}:
                      </Link>
                      <p className="text-gray-700">{comment.text}</p>
                    </div>
                  ))}
                  {comments.length === 0 && (
                    <p className="text-gray-400 text-sm">No comments yet.</p>
                  )}
                </div>

                {/* Add comment */}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoDetail;