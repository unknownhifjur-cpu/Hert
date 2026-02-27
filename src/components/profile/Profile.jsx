import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';
import { X, Share2, MessageCircle, Heart, Star, Award, Crown, Camera, MessageSquare } from 'lucide-react';

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

  // Modal state for followers/following
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalList, setModalList] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  const currentUserId = currentUser?._id || currentUser?.id;

  useEffect(() => {
    fetchProfileData();
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
          title: `${username}'s Profile`,
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
    if (!profileUser || !profileUser.createdAt) return { level: '', ringColor: '', icon: null };
    const createdAt = new Date(profileUser.createdAt);
    const now = new Date();
    const ageDays = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));

    if (ageDays < 30) {
      return { 
        level: 'Newbie', 
        ringColor: 'ring-rose-200',
        icon: Heart,
        iconColor: 'text-rose-300',
      };
    } else if (ageDays < 90) {
      return { 
        level: 'Bronze', 
        ringColor: 'ring-rose-400',
        icon: Star,
        iconColor: 'text-rose-500',
      };
    } else if (ageDays < 180) {
      return { 
        level: 'Silver', 
        ringColor: 'ring-rose-600',
        icon: Award,
        iconColor: 'text-rose-600',
      };
    } else {
      return { 
        level: 'Gold', 
        ringColor: 'ring-amber-400',
        icon: Crown,
        iconColor: 'text-amber-500',
      };
    }
  };

  const badge = getBadgeInfo();
  const BadgeIcon = badge.icon;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-rose-500 border-r-transparent"></div>
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">{error || 'User not found'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8 pt-4 md:pt-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Profile Header (unchanged) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
            {/* Avatar with click-to-enlarge */}
            <div className="relative group">
              <div
                className={`h-16 w-16 md:h-20 md:w-20 rounded-full ring-4 ${badge.ringColor} ring-offset-2 overflow-hidden shadow-xl transition-all duration-300 group-hover:ring-opacity-80 cursor-${profileUser.profilePic ? 'pointer' : 'default'}`}
                title={`${badge.level} member – joined ${new Date(profileUser.createdAt).toLocaleDateString()}`}
                onClick={() => profileUser.profilePic && setAvatarModalOpen(true)}
              >
                {profileUser.profilePic ? (
                  <img
                    src={profileUser.profilePic}
                    alt={profileUser.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center text-white text-2xl md:text-3xl font-bold">
                    {profileUser.username?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              {BadgeIcon && (
                <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white shadow-lg flex items-center justify-center ${badge.iconColor}`}>
                  <BadgeIcon className="w-4 h-4" />
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 w-full md:w-auto">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl md:text-2xl font-bold text-gray-800">{profileUser.username}</h1>
                <span className="text-xs px-2 py-1 rounded-full bg-rose-50 text-rose-600 font-medium">
                  {badge.level}
                </span>
              </div>
              {profileUser.bio && (
                <p className="text-gray-600 text-sm md:text-base mb-2 md:mb-3">{profileUser.bio}</p>
              )}

              <div className="flex space-x-4 md:space-x-6 text-sm">
                <div>
                  <span className="font-semibold text-gray-800">{photos.length}</span>{' '}
                  <span className="text-gray-500">posts</span>
                </div>
                <button onClick={() => openModal('followers')} className="hover:text-rose-600 transition">
                  <span className="font-semibold text-gray-800">{profileUser.followers?.length || 0}</span>{' '}
                  <span className="text-gray-500">followers</span>
                </button>
                <button onClick={() => openModal('following')} className="hover:text-rose-600 transition">
                  <span className="font-semibold text-gray-800">{profileUser.following?.length || 0}</span>{' '}
                  <span className="text-gray-500">following</span>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            {isOwnProfile ? (
              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto mt-2 md:mt-0">
                <button
                  onClick={() => navigate(`/profile/${username}/edit`)}
                  className="w-full sm:w-auto bg-rose-500 hover:bg-rose-600 text-white px-6 py-2.5 md:py-2 rounded-lg text-sm font-medium transition"
                >
                  Edit Profile
                </button>
                <div className="relative w-full sm:w-auto">
                  <button
                    onClick={handleShareProfile}
                    className="w-full sm:w-auto bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2.5 md:py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    Share Profile
                  </button>
                  {showShareTooltip && (
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap animate-fade-in">
                      Link copied!
                    </span>
                  )}
                </div>
              </div>
            ) : currentUser ? (
              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto mt-2 md:mt-0">
                <button
                  onClick={isFollowing ? handleUnfollow : handleFollow}
                  disabled={followLoading}
                  className={`w-full sm:w-auto px-6 py-2.5 md:py-2 rounded-lg text-sm font-medium transition ${
                    isFollowing
                      ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                      : 'bg-rose-500 hover:bg-rose-600 text-white'
                  }`}
                >
                  {followLoading ? '...' : isFollowing ? 'Unfollow' : 'Follow'}
                </button>
                <Link
                  to={`/chat/${profileUser._id}`}
                  className="w-full sm:w-auto bg-rose-100 hover:bg-rose-200 text-rose-600 px-6 py-2.5 md:py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Message
                </Link>
              </div>
            ) : null}
          </div>
        </div>

        {/* Enhanced Photo Grid */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg md:text-xl font-semibold text-gray-800">Photos</h2>
          {photos.length > 0 && (
            <span className="text-sm text-gray-400">{photos.length} {photos.length === 1 ? 'photo' : 'photos'}</span>
          )}
        </div>

        {photos.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
            <Camera className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-lg">No photos yet</p>
            <p className="text-gray-400 text-sm mt-1">This user hasn't shared any moments</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map(photo => (
              <div
                key={photo._id}
                className="relative aspect-square group cursor-pointer overflow-hidden rounded-xl bg-white shadow-sm hover:shadow-xl transition-all duration-300"
                onClick={() => navigate(`/photo/${photo._id}`)}
              >
                <img
                  src={photo.imageUrl}
                  alt={photo.caption || 'User photo'}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Stats overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-3 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center space-x-1 text-sm">
                      <Heart className="w-4 h-4 fill-white" />
                      <span>{photo.likes?.length || 0}</span>
                    </span>
                    <span className="flex items-center space-x-1 text-sm">
                      <MessageSquare className="w-4 h-4" />
                      <span>{photo.comments?.length || 0}</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Followers/Following Modal (unchanged) */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md max-h-[70vh] overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">
                  {modalType === 'followers' ? 'Followers' : 'Following'}
                </h3>
                <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 overflow-y-auto max-h-[60vh]">
                {modalLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-rose-500 border-r-transparent"></div>
                  </div>
                ) : modalList.length === 0 ? (
                  <p className="text-center text-gray-400 py-8">No {modalType} yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {modalList.map(user => (
                      <li key={user._id}>
                        <Link
                          to={`/profile/${user.username}`}
                          onClick={closeModal}
                          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-rose-50 transition"
                        >
                          <div className="h-8 w-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-semibold text-sm">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-gray-700">{user.username}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Avatar Modal (unchanged) */}
        {avatarModalOpen && profileUser.profilePic && (
          <div
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
            onClick={() => setAvatarModalOpen(false)}
          >
            <div className="relative max-w-3xl max-h-full">
              <img
                src={profileUser.profilePic}
                alt={profileUser.username}
                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
              <button
                onClick={() => setAvatarModalOpen(false)}
                className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70 rounded-full p-2 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;