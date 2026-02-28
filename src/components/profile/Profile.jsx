import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';
import { 
  X, Share2, MessageCircle, Heart, Star, Award, Crown, 
  Camera, MessageSquare, Calendar, MapPin, Link as LinkIcon,
  MoreHorizontal, Settings, Grid, Bookmark, UserPlus,
  Check, Copy, ChevronRight, Sparkles, Lock
} from 'lucide-react';

const Profile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useContext(AuthContext);
  const [profileUser, setProfileUser] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [followLoading, setFollowLoading] = useState(false);
  const [showShareTooltip, setShowShareTooltip] = useState(false);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');

  // Modal state for followers/following
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalList, setModalList] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  const currentUserId = currentUser?._id || currentUser?.id;

  useEffect(() => {
    fetchProfileData();
    window.scrollTo(0, 0);
  }, [username]);

  const fetchProfileData = async () => {
    try {
      const [userRes, photosRes] = await Promise.all([
        api.get(`/users/${username}`),
        api.get(`/users/${username}/photos`)
      ]);
      setProfileUser(userRes.data);
      setPhotos(photosRes.data);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('User not found');
    } finally {
      setLoading(false);
    }
  };

  const isOwnProfile = currentUser && currentUser.username === username;

  const handleFollow = async () => {
    if (!currentUser) return;
    setFollowLoading(true);
    try {
      await api.post(`/users/${username}/follow`);
      const res = await api.get(`/users/${username}`);
      setProfileUser(res.data);
    } catch (err) {
      console.error('Follow error:', err);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleUnfollow = async () => {
    if (!currentUser) return;
    setFollowLoading(true);
    try {
      await api.post(`/users/${username}/unfollow`);
      const res = await api.get(`/users/${username}`);
      setProfileUser(res.data);
    } catch (err) {
      console.error('Unfollow error:', err);
    } finally {
      setFollowLoading(false);
    }
  };

  const isFollowing = profileUser?.followers?.some(
    follower => follower._id?.toString() === currentUserId?.toString()
  );

  const handleShareProfile = async () => {
    const profileUrl = `${window.location.origin}/profile/${username}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${username}'s Profile - HeartLock`,
          text: profileUser?.bio || `Check out ${username}'s profile on HeartLock`,
          url: profileUrl,
        });
      } catch (err) {
        console.log('Share cancelled', err);
      }
    } else {
      await navigator.clipboard.writeText(profileUrl);
      setShowShareTooltip(true);
      setTimeout(() => setShowShareTooltip(false), 2000);
    }
  };

  const openModal = async (type) => {
    setModalType(type);
    setModalOpen(true);
    setModalLoading(true);
    try {
      const res = await api.get(`/users/${username}/${type}`);
      setModalList(res.data);
    } catch (err) {
      console.error(`Error fetching ${type}:`, err);
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalList([]);
    setModalType('');
  };

  // Determine badge based on account age
  const getBadgeInfo = () => {
    if (!profileUser || !profileUser.createdAt) return { level: '', ringColor: '', icon: null, bgColor: '' };
    const createdAt = new Date(profileUser.createdAt);
    const now = new Date();
    const ageDays = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));

    if (ageDays < 30) {
      return { 
        level: 'Newbie', 
        ringColor: 'ring-rose-200',
        bgColor: 'bg-rose-50 text-rose-600',
        icon: Heart,
        iconColor: 'text-rose-300',
      };
    } else if (ageDays < 90) {
      return { 
        level: 'Bronze', 
        ringColor: 'ring-amber-400',
        bgColor: 'bg-amber-50 text-amber-600',
        icon: Star,
        iconColor: 'text-amber-500',
      };
    } else if (ageDays < 180) {
      return { 
        level: 'Silver', 
        ringColor: 'ring-gray-400',
        bgColor: 'bg-gray-50 text-gray-600',
        icon: Award,
        iconColor: 'text-gray-500',
      };
    } else {
      return { 
        level: 'Gold', 
        ringColor: 'ring-yellow-400',
        bgColor: 'bg-yellow-50 text-yellow-600',
        icon: Crown,
        iconColor: 'text-yellow-500',
      };
    }
  };

  const formatJoinDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const badge = getBadgeInfo();
  const BadgeIcon = badge.icon;

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

  if (error || !profileUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 text-center border border-rose-100">
          <div className="w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-12 h-12 text-rose-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Profile Not Found</h2>
          <p className="text-gray-600 mb-8">The user "{username}" doesn't exist or may have been removed.</p>
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
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 pb-20 pt-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Profile Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-rose-100 p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar with click-to-enlarge */}
            <div className="relative group">
              <div
                className={`h-24 w-24 md:h-32 md:w-32 rounded-full ring-4 ${badge.ringColor} ring-offset-4 overflow-hidden shadow-2xl transition-all duration-300 group-hover:ring-opacity-80 cursor-${profileUser.profilePic ? 'pointer' : 'default'} transform hover:scale-105`}
                title={`${badge.level} member – joined ${formatJoinDate(profileUser.createdAt)}`}
                onClick={() => profileUser.profilePic && setAvatarModalOpen(true)}
              >
                {profileUser.profilePic ? (
                  <img
                    src={profileUser.profilePic}
                    alt={profileUser.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-rose-400 to-pink-600 flex items-center justify-center text-white text-3xl md:text-4xl font-bold">
                    {profileUser.username?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              {BadgeIcon && (
                <div className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white shadow-xl flex items-center justify-center ${badge.iconColor}`}>
                  <BadgeIcon className="w-5 h-5" />
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{profileUser.username}</h1>
                <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${badge.bgColor}`}>
                  {badge.level}
                </span>
                {profileUser.isVerified && (
                  <span className="bg-blue-500 text-white p-1 rounded-full">
                    <Check className="w-3 h-3" />
                  </span>
                )}
              </div>

              {/* Bio */}
              {profileUser.bio && (
                <p className="text-gray-600 text-sm md:text-base mb-4 max-w-2xl leading-relaxed">
                  {profileUser.bio}
                </p>
              )}

              {/* Additional Info */}
              <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-500">
                {profileUser.location && (
                  <span className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{profileUser.location}</span>
                  </span>
                )}
                {profileUser.website && (
                  <span className="flex items-center space-x-1">
                    <LinkIcon className="w-4 h-4" />
                    <a href={profileUser.website} target="_blank" rel="noopener noreferrer" className="text-rose-500 hover:underline">
                      {profileUser.website.replace(/^https?:\/\//, '')}
                    </a>
                  </span>
                )}
                <span className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {formatJoinDate(profileUser.createdAt)}</span>
                </span>
              </div>

              {/* Stats */}
              <div className="flex space-x-6 md:space-x-8 mb-6">
                <div className="text-center">
                  <span className="block text-xl font-bold text-gray-800">{photos.length}</span>
                  <span className="text-xs text-gray-500">Posts</span>
                </div>
                <button onClick={() => openModal('followers')} className="text-center hover:text-rose-600 transition group">
                  <span className="block text-xl font-bold text-gray-800 group-hover:text-rose-600">
                    {profileUser.followers?.length || 0}
                  </span>
                  <span className="text-xs text-gray-500 group-hover:text-rose-600">Followers</span>
                </button>
                <button onClick={() => openModal('following')} className="text-center hover:text-rose-600 transition group">
                  <span className="block text-xl font-bold text-gray-800 group-hover:text-rose-600">
                    {profileUser.following?.length || 0}
                  </span>
                  <span className="text-xs text-gray-500 group-hover:text-rose-600">Following</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {isOwnProfile ? (
                  <>
                    <button
                      onClick={() => navigate(`/profile/${username}/edit`)}
                      className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl text-sm font-medium transition shadow-lg shadow-rose-500/25 flex items-center space-x-2"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Edit Profile</span>
                    </button>
                    <button
                      onClick={handleShareProfile}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl text-sm font-medium transition flex items-center space-x-2"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Share</span>
                    </button>
                  </>
                ) : currentUser ? (
                  <>
                    <button
                      onClick={isFollowing ? handleUnfollow : handleFollow}
                      disabled={followLoading}
                      className={`px-6 py-3 rounded-xl text-sm font-medium transition flex items-center space-x-2 ${
                        isFollowing
                          ? 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                          : 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-lg shadow-rose-500/25'
                      }`}
                    >
                      {followLoading ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      ) : isFollowing ? (
                        <>
                          <UserPlus className="w-4 h-4" />
                          <span>Unfollow</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          <span>Follow</span>
                        </>
                      )}
                    </button>
                    <Link
                      to={`/chat/${profileUser._id}`}
                      className="bg-rose-100 hover:bg-rose-200 text-rose-600 px-6 py-3 rounded-xl text-sm font-medium transition flex items-center space-x-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Message</span>
                    </Link>
                    <button
                      onClick={handleShareProfile}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-3 rounded-xl transition"
                      title="Share Profile"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl text-sm font-medium transition shadow-lg shadow-rose-500/25"
                  >
                    Follow to Connect
                  </Link>
                )}
              </div>

              {/* Share tooltip */}
              {showShareTooltip && (
                <div className="absolute top-full right-0 mt-2 bg-gray-800 text-white text-sm px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 animate-fadeIn">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Profile link copied!</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-rose-100 mb-6">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium transition border-b-2 ${
              activeTab === 'posts'
                ? 'border-rose-500 text-rose-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>Posts</span>
        </button>
        </div>

        {/* Photo Grid */}
        {activeTab === 'posts' && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
                <Camera className="w-5 h-5 text-rose-500" />
                <span>Moments</span>
              </h2>
              {photos.length > 0 && (
                <span className="text-sm text-gray-400 bg-white/60 px-3 py-1 rounded-full">
                  {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
                </span>
              )}
            </div>

            {photos.length === 0 ? (
              <div className="text-center py-16 bg-white/60 backdrop-blur-sm rounded-3xl shadow-lg border border-rose-100">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <div className="absolute inset-0 bg-rose-100 rounded-full animate-pulse"></div>
                  <Camera className="relative w-12 h-12 text-rose-400 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="text-gray-700 text-lg mb-2">No moments yet</p>
                <p className="text-gray-400">
                  {isOwnProfile 
                    ? "Share your first photo to start your journey!" 
                    : "This user hasn't shared any moments yet"}
                </p>
                {isOwnProfile && (
                  <button
                    onClick={() => navigate('/upload')}
                    className="mt-6 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-medium transition shadow-lg shadow-rose-500/25"
                  >
                    Upload First Photo
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {photos.map(photo => (
                  <div
                    key={photo._id}
                    className="relative aspect-square group cursor-pointer overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                    onClick={() => navigate(`/photo/${photo._id}`)}
                  >
                    <img
                      src={photo.imageUrl}
                      alt={photo.caption || 'User photo'}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Caption preview */}
                    {photo.caption && (
                      <div className="absolute top-3 left-3 right-3">
                        <p className="text-white text-xs bg-black/50 backdrop-blur-sm px-2 py-1 rounded-lg truncate opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          {photo.caption}
                        </p>
                      </div>
                    )}
                    
                    {/* Stats overlay */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center space-x-1 text-sm bg-black/30 backdrop-blur-sm px-2 py-1 rounded-lg">
                          <Heart className="w-3.5 h-3.5" fill="white" />
                          <span>{photo.likes?.length || 0}</span>
                        </span>
                        <span className="flex items-center space-x-1 text-sm bg-black/30 backdrop-blur-sm px-2 py-1 rounded-lg">
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{photo.comments?.length || 0}</span>
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 bg-black/30 backdrop-blur-sm rounded-full p-1" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Followers/Following Modal */}
        {modalOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <div 
              className="bg-white rounded-3xl w-full max-w-md max-h-[70vh] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-rose-100 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800">
                  {modalType === 'followers' ? 'Followers' : 'Following'}
                </h3>
                <button 
                  onClick={closeModal} 
                  className="p-2 hover:bg-rose-50 rounded-full transition"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {modalLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="relative">
                      <div className="w-10 h-10 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin"></div>
                      <Heart className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-rose-500 animate-pulse" />
                    </div>
                  </div>
                ) : modalList.length === 0 ? (
                  <div className="text-center py-8">
                    <UserPlus className="w-12 h-12 text-rose-300 mx-auto mb-3" />
                    <p className="text-gray-500">No {modalType} yet</p>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {modalList.map(user => (
                      <li key={user._id}>
                        <Link
                          to={`/profile/${user.username}`}
                          onClick={closeModal}
                          className="flex items-center space-x-3 p-3 rounded-xl hover:bg-rose-50 transition group"
                        >
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                            {user.profilePic ? (
                              <img src={user.profilePic} alt={user.username} className="w-full h-full object-cover rounded-full" />
                            ) : (
                              user.username.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className="flex-1">
                            <span className="text-gray-800 font-medium group-hover:text-rose-600 transition">
                              {user.username}
                            </span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-rose-500 transition" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Avatar Modal */}
        {avatarModalOpen && profileUser.profilePic && (
          <div
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setAvatarModalOpen(false)}
          >
            <div className="relative max-w-3xl max-h-full">
              <img
                src={profileUser.profilePic}
                alt={profileUser.username}
                className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
              <button
                onClick={() => setAvatarModalOpen(false)}
                className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full p-3 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Profile;