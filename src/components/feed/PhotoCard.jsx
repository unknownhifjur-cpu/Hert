import React, { useState, useContext, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  MessageCircle,
  Send,
  Download,
  Share2,
  MoreHorizontal,
  Bookmark,
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';

// Helper to determine badge ring color (same as Profile)
const getBadgeRingColor = (createdAt) => {
  if (!createdAt) return '';
  const ageDays = Math.floor((new Date() - new Date(createdAt)) / (1000 * 60 * 60 * 24));
  if (ageDays < 30) return 'ring-rose-200';
  if (ageDays < 90) return 'ring-rose-400';
  if (ageDays < 180) return 'ring-rose-600';
  return 'ring-amber-400';
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const heartBurstVariants = {
  initial: { scale: 0, opacity: 1 },
  animate: {
    scale: [0, 1.2, 1.5],
    opacity: [1, 0.8, 0],
    transition: { duration: 0.8, ease: 'easeOut' },
  },
  exit: { opacity: 0 },
};

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
  const [imageLoaded, setImageLoaded] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showHeartOverlay, setShowHeartOverlay] = useState(false);
  const imageContainerRef = useRef(null);
  const optionsRef = useRef(null);

  const badgeRingColor = getBadgeRingColor(photo.user?.createdAt);

  // Close options dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target)) {
        setShowOptions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLike = async () => {
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

  const handleImageDoubleClick = (e) => {
    e.preventDefault();
    handleLike();
    setShowHeartOverlay(true);
    setTimeout(() => setShowHeartOverlay(false), 800);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/photos/${photo._id}/comment`, { text: newComment });
      setComments([...comments, res.data]);
      setNewComment('');
      if (!showComments) setShowComments(true);
    } catch (err) {
      console.error('Comment error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(photo.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `photo-${photo._id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: photo.caption || 'Check out this photo!',
          text: photo.caption || '',
          url: photo.imageUrl,
        });
      } catch (err) {
        console.log('Share cancelled', err);
      }
    } else {
      await navigator.clipboard.writeText(photo.imageUrl);
      setShowShareTooltip(true);
      setTimeout(() => setShowShareTooltip(false), 2000);
    }
  };

  return (
    <motion.article
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -4 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300"
    >
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between">
        <Link to={`/profile/${photo.user?.username}`} className="flex items-center space-x-3 group">
          {/* Avatar with badge ring */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className={`relative h-10 w-10 rounded-full ring-2 ${badgeRingColor} ring-offset-2 overflow-hidden flex-shrink-0`}
          >
            {photo.user?.profilePic && !avatarError ? (
              <img
                src={photo.user.profilePic}
                alt={photo.user.username}
                className="w-full h-full object-cover"
                onError={() => setAvatarError(true)}
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center text-white font-semibold text-lg">
                {photo.user?.username ? photo.user.username.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
          </motion.div>
          <div className="flex-1">
            <p className="font-semibold text-gray-800 group-hover:text-rose-600 transition-colors">
              {photo.user?.username || 'Unknown'}
            </p>
            <p className="text-xs text-gray-400">{new Date(photo.createdAt).toLocaleString()}</p>
          </div>
        </Link>

        {/* Options dropdown */}
        <div className="relative" ref={optionsRef}>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowOptions(!showOptions)}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition"
            aria-label="More options"
          >
            <MoreHorizontal className="w-5 h-5" />
          </motion.button>
          <AnimatePresence>
            {showOptions && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10"
              >
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-rose-50 flex items-center space-x-2">
                  <Bookmark className="w-4 h-4" />
                  <span>Save</span>
                </button>
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-rose-50 flex items-center space-x-2">
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
                <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2">
                  <span>Report</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Image with double‑click like and floating heart */}
      <div
        ref={imageContainerRef}
        className="relative bg-gray-100 overflow-hidden cursor-pointer"
        onDoubleClick={handleImageDoubleClick}
      >
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />
        )}
        <img
          src={photo.imageUrl}
          alt={photo.caption || 'Photo'}
          className={`w-full max-h-96 object-cover transition-opacity duration-500 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          loading="lazy"
        />
        <AnimatePresence>
          {showHeartOverlay && (
            <motion.div
              key="heart-burst"
              variants={heartBurstVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <Heart className="w-20 h-20 text-rose-500 fill-rose-500" strokeWidth={1.5} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Actions and caption */}
      <div className="p-4">
        {photo.caption && (
          <div className="mb-3 text-gray-800">
            <Link to={`/profile/${photo.user?.username}`} className="font-semibold mr-2 hover:underline">
              {photo.user?.username || 'Unknown'}
            </Link>
            <span>{photo.caption}</span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleLike}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-full transition-all group ${
                liked ? 'bg-rose-100 text-rose-600' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
              aria-label="Like"
            >
              <motion.div
                animate={heartAnim ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <Heart
                  className={`w-5 h-5 ${liked ? 'fill-rose-500 text-rose-500' : ''}`}
                />
              </motion.div>
              <span className="text-sm font-medium">{likes}</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowComments(!showComments)}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-full transition group ${
                showComments ? 'bg-rose-100 text-rose-600' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
              aria-label="Comments"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-medium">{comments.length}</span>
            </motion.button>
          </div>

          <div className="flex items-center space-x-1">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleDownload}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition group relative"
              aria-label="Download"
            >
              <Download className="w-5 h-5 text-gray-500" />
            </motion.button>

            <div className="relative">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleShare}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition group"
                aria-label="Share"
              >
                <Share2 className="w-5 h-5 text-gray-500" />
              </motion.button>
              <AnimatePresence>
                {showShareTooltip && (
                  <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-20"
                  >
                    Link copied!
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Comments section */}
        <AnimatePresence initial={false}>
          {showComments && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="max-h-40 overflow-y-auto space-y-2 mb-3 pr-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                  {comments.map((comment) => (
                    <div key={comment._id} className="flex items-start space-x-2 text-sm">
                      <Link
                        to={`/profile/${comment.user?.username}`}
                        className="font-semibold hover:underline flex-shrink-0 text-gray-800"
                      >
                        {comment.user?.username}:
                      </Link>
                      <p className="text-gray-600 break-words">{comment.text}</p>
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
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    type="submit"
                    disabled={submitting || !newComment.trim()}
                    className="p-2 text-rose-500 hover:text-rose-600 disabled:text-gray-300 transition"
                    aria-label="Send comment"
                  >
                    <Send className="w-5 h-5" />
                  </motion.button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Custom scrollbar (no animation needed) */}
      <style>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 20px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #d1d5db;
        }
      `}</style>
    </motion.article>
  );
};

export default PhotoCard;