import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';
import { X, Share2, MessageCircle } from 'lucide-react'; // added MessageCircle

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

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); // 'followers' or 'following'
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
      // Fallback: copy to clipboard
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
      <div className="max-w-4xl mx-auto px-4">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
            {/* Avatar */}
            <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 text-2xl md:text-3xl font-bold overflow-hidden flex-shrink-0">
              {profileUser.profilePic ? (
                <img
                  src={profileUser.profilePic}
                  alt={profileUser.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                profileUser.username?.charAt(0).toUpperCase()
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 w-full md:w-auto">
              <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-1 md:mb-2">{profileUser.username}</h1>
              {profileUser.bio && (
                <p className="text-gray-600 text-sm md:text-base mb-2 md:mb-3">{profileUser.bio}</p>
              )}

              {/* Stats Row */}
              <div className="flex space-x-4 md:space-x-6 text-sm">
                <div>
                  <span className="font-semibold text-gray-800">{photos.length}</span>{' '}
                  <span className="text-gray-500">posts</span>
                </div>
                <button
                  onClick={() => openModal('followers')}
                  className="hover:text-rose-600 transition"
                >
                  <span className="font-semibold text-gray-800">
                    {profileUser.followers?.length || 0}
                  </span>{' '}
                  <span className="text-gray-500">followers</span>
                </button>
                <button
                  onClick={() => openModal('following')}
                  className="hover:text-rose-600 transition"
                >
                  <span className="font-semibold text-gray-800">
                    {profileUser.following?.length || 0}
                  </span>{' '}
                  <span className="text-gray-500">following</span>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            {isOwnProfile ? (
              // Own profile: Edit Profile + Share Profile
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
              // Other user's profile: Follow/Unfollow + Message
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

        {/* Photo Grid (unchanged) */}
        <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-3 md:mb-4">Photos</h2>
        {photos.length === 0 ? (
          <div className="text-center py-12 md:py-16 bg-white rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500">No photos yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {photos.map(photo => (
              <div
                key={photo._id}
                className="relative aspect-square group overflow-hidden rounded-lg border border-gray-200 hover:border-rose-300 transition cursor-pointer"
                onClick={() => navigate(`/photo/${photo._id}`)}
              >
                <img
                  src={photo.imageUrl}
                  alt={photo.caption || 'User photo'}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white space-x-4">
                  <span className="flex items-center space-x-1">
                    <span>❤️</span>
                    <span>{photo.likes?.length || 0}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span>💬</span>
                    <span>{photo.comments?.length || 0}</span>
                  </span>
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
      </div>
    </div>
  );
};

export default Profile;