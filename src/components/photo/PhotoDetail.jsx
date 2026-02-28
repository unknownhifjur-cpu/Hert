import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';
import { 
  Heart, MessageCircle, Send, Download, Share2, 
  Trash2, X, ChevronLeft, MoreHorizontal, Bookmark,
  Clock, Calendar, User, Copy, Check
} from 'lucide-react';

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
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

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
      navigate(-1);
    } catch (err) {
      console.error(err);
      alert('Delete failed');
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = photo.imageUrl;
    link.download = `heartlock-${photo.user?.username || 'photo'}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const shareUrls = {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(photo?.caption || 'Check this photo on HeartLock!')}%20${encodeURIComponent(photo?.imageUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(photo?.imageUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(photo?.caption || 'Check this photo on HeartLock!')}&url=${encodeURIComponent(photo?.imageUrl)}`,
    copy: photo?.imageUrl
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(photo.imageUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin"></div>
          <Heart className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-rose-500 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !photo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 text-center border border-rose-100">
          <div className="w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <X className="w-12 h-12 text-rose-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Photo Not Found</h2>
          <p className="text-gray-600 mb-8">This photo may have been removed or doesn't exist.</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-medium transition shadow-lg shadow-rose-500/25"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 py-6 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:shadow-md transition border border-rose-100 text-gray-600 hover:text-rose-600"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          
          <div className="flex items-center space-x-2">
            
            
            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="p-2 bg-white/80 backdrop-blur-sm border border-rose-100 rounded-full text-gray-600 hover:text-rose-600 transition"
                title="Share"
              >
                <Share2 className="w-5 h-5" />
              </button>
              
              {showShareMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-rose-100 overflow-hidden z-20">
                  <div className="p-2">
                    <a
                      href={shareUrls.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition"
                      onClick={() => setShowShareMenu(false)}
                    >
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-bold">W</span>
                      </div>
                      <span>WhatsApp</span>
                    </a>
                    <a
                      href={shareUrls.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition"
                      onClick={() => setShowShareMenu(false)}
                    >
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold">f</span>
                      </div>
                      <span>Facebook</span>
                    </a>
                    <a
                      href={shareUrls.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition"
                      onClick={() => setShowShareMenu(false)}
                    >
                      <div className="w-8 h-8 bg-sky-100 rounded-full flex items-center justify-center">
                        <span className="text-sky-600 font-bold">𝕏</span>
                      </div>
                      <span>Twitter</span>
                    </a>
                    <button
                      onClick={() => {
                        copyToClipboard();
                        setShowShareMenu(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition"
                    >
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        {copied ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-600" />
                        )}
                      </div>
                      <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="relative">
              <button
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className="p-2 bg-white/80 backdrop-blur-sm border border-rose-100 rounded-full text-gray-600 hover:text-rose-600 transition"
                title="More"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>
              
              {showMoreMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-rose-100 overflow-hidden z-20">
                  <div className="p-2">
                    <button
                      onClick={() => {
                        handleDownload();
                        setShowMoreMenu(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition"
                    >
                      <Download className="w-5 h-5" />
                      <span>Download</span>
                    </button>
                    
                    {isOwner && (
                      <button
                        onClick={() => {
                          handleDelete();
                          setShowMoreMenu(false);
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-rose-600 hover:bg-rose-50 rounded-xl transition"
                      >
                        <Trash2 className="w-5 h-5" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-rose-100 overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Left: Image Section */}
            <div className="lg:w-3/5 bg-gradient-to-br from-rose-900/5 to-pink-900/5 p-6 lg:p-8 flex items-center justify-center min-h-[400px] lg:min-h-[600px]">
              <img
                src={photo.imageUrl}
                alt={photo.caption || 'Photo'}
                className="max-w-full max-h-[70vh] object-contain rounded-2xl shadow-2xl"
              />
            </div>

            {/* Right: Details Section */}
            <div className="lg:w-2/5 p-6 lg:p-8">
              {/* User Info */}
              <Link
                to={`/profile/${photo.user?.username}`}
                className="flex items-center space-x-4 p-3 rounded-2xl hover:bg-rose-50 transition group"
              >
                <div className="relative">
                  <div className="h-14 w-14 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-bold text-xl overflow-hidden shadow-md">
                    {photo.user?.profilePic ? (
                      <img src={photo.user.profilePic} alt={photo.user.username} className="w-full h-full object-cover" />
                    ) : (
                      photo.user?.username?.charAt(0).toUpperCase() || 'U'
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 group-hover:text-rose-600 transition text-lg">
                    {photo.user?.username || 'Unknown'}
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(photo.createdAt)}</span>
                  </div>
                </div>
              </Link>

              {/* Caption */}
              {photo.caption && (
                <div className="mt-6 p-5 bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl border border-rose-200">
                  <p className="text-gray-800 leading-relaxed">
                    <span className="font-semibold text-rose-600 mr-2">@{photo.user?.username}</span>
                    {photo.caption}
                  </p>
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center justify-between mt-6 p-4 bg-white rounded-2xl border border-rose-100">
                <button
                  onClick={handleLike}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition ${
                    liked 
                      ? 'bg-rose-500 text-white' 
                      : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${liked ? 'fill-white' : ''}`} />
                  <span className="font-medium">{likes}</span>
                </button>
                
                <div className="flex items-center space-x-2 text-gray-500">
                  <MessageCircle className="w-5 h-5" />
                  <span className="font-medium">{comments.length}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-gray-500">
                  <Calendar className="w-5 h-5" />
                  <span className="text-sm">{new Date(photo.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Comments Section */}
              <div className="mt-6">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                  <MessageCircle className="w-5 h-5 text-rose-500" />
                  <span>Comments ({comments.length})</span>
                </h3>
                
                <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                  {comments.length > 0 ? (
                    comments.map(comment => (
                      <div key={comment._id} className="flex items-start space-x-3 group">
                        <Link to={`/profile/${comment.user?.username}`}>
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">
                            {comment.user?.username?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        </Link>
                        <div className="flex-1 bg-gray-50 rounded-2xl p-3 group-hover:bg-rose-50 transition">
                          <Link to={`/profile/${comment.user?.username}`} className="font-semibold text-sm text-gray-800 hover:text-rose-600">
                            @{comment.user?.username}
                          </Link>
                          <p className="text-sm text-gray-700 mt-1">{comment.text}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <MessageCircle className="w-12 h-12 text-rose-300 mx-auto mb-3" />
                      <p className="text-gray-400">No comments yet</p>
                      <p className="text-sm text-gray-300">Be the first to comment!</p>
                    </div>
                  )}
                </div>

                {/* Add Comment */}
                <form onSubmit={handleCommentSubmit} className="mt-6">
                  <div className="flex items-center space-x-2 bg-white border-2 border-rose-100 rounded-full p-1 pl-4 focus-within:border-rose-400 focus-within:ring-2 focus-within:ring-rose-200 transition">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1 py-2 bg-transparent focus:outline-none text-sm"
                      disabled={submitting}
                    />
                    <button
                      type="submit"
                      disabled={submitting || !newComment.trim()}
                      className="p-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full hover:from-rose-600 hover:to-pink-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                    >
                      {submitting ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-400 flex items-center justify-center space-x-1">
            <Heart className="w-3 h-3 text-rose-400" />
            <span>Secured with HeartLock</span>
          </p>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #fda4af;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #f43f5e;
        }
      `}</style>
    </div>
  );
};

export default PhotoDetail;