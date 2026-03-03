import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';
import { 
  X, Share2, MessageCircle, Heart, Star, Award, Crown, 
  Camera, MessageSquare, Calendar, MapPin, Link as LinkIcon,
  Settings, Grid, UserPlus,
  Check, ChevronRight, Lock
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
    } catch (err) {} finally { setFollowLoading(false); }
  };

  const handleUnfollow = async () => {
    if (!currentUser) return;
    setFollowLoading(true);
    try {
      await api.post(`/users/${username}/unfollow`);
      const res = await api.get(`/users/${username}`);
      setProfileUser(res.data);
    } catch (err) {} finally { setFollowLoading(false); }
  };

  const isFollowing = profileUser?.followers?.some(
    follower => follower._id?.toString() === currentUserId?.toString()
  );

  const handleShareProfile = async () => {
    const profileUrl = `${window.location.origin}/profile/${username}`;
    if (navigator.share) {
      try { await navigator.share({ title: `${username}'s Profile`, url: profileUrl }); } catch (err) {}
    } else {
      await navigator.clipboard.writeText(profileUrl);
      setShowShareTooltip(true);
      setTimeout(() => setShowShareTooltip(false), 2000);
    }
  };

  const openModal = async (type) => {
    setModalType(type); setModalOpen(true); setModalLoading(true);
    try {
      const res = await api.get(`/users/${username}/${type}`);
      setModalList(res.data);
    } catch (err) {} finally { setModalLoading(false); }
  };

  const closeModal = () => { setModalOpen(false); setModalList([]); setModalType(''); };

  const getBadgeInfo = () => {
    if (!profileUser?.createdAt) return { level: '', ringColor: '#fda4af', icon: null, bgColor: '#fff1f2', textColor: '#e11d48' };
    const ageDays = Math.floor((new Date() - new Date(profileUser.createdAt)) / 86400000);
    if (ageDays < 30) return { level: 'Newbie', ringColor: '#fda4af', icon: Heart, bgColor: '#fff1f2', textColor: '#e11d48' };
    if (ageDays < 90) return { level: 'Bronze', ringColor: '#fcd34d', icon: Star, bgColor: '#fffbeb', textColor: '#d97706' };
    if (ageDays < 180) return { level: 'Silver', ringColor: '#cbd5e1', icon: Award, bgColor: '#f8fafc', textColor: '#64748b' };
    return { level: 'Gold', ringColor: '#fbbf24', icon: Crown, bgColor: '#fffbeb', textColor: '#b45309' };
  };

  const formatJoinDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const badge = getBadgeInfo();
  const BadgeIcon = badge.icon;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #fff1f2 0%, #ffffff 50%, #fdf2f8 100%)' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
          <div className="w-16 h-16 rounded-full border-4 border-rose-100 border-t-rose-500 animate-spin" />
          <Heart className="absolute inset-0 m-auto w-6 h-6 text-rose-500 animate-pulse" />
        </div>
        <p className="text-rose-400 text-sm font-medium tracking-wide">Loading profile…</p>
      </div>
    </div>
  );

  if (error || !profileUser) return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #fff1f2, #fdf2f8)' }}>
      <div className="max-w-sm w-full text-center p-10 rounded-3xl shadow-2xl bg-white border border-rose-100">
        <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-5">
          <Lock className="w-10 h-10 text-rose-300" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Profile Not Found</h2>
        <p className="text-sm text-gray-500 mb-6">The user "{username}" doesn't exist or may have been removed.</p>
        <button onClick={() => navigate('/')}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition shadow-lg"
          style={{ background: 'linear-gradient(135deg, #f43f5e, #ec4899)' }}>
          Go Back Home
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(160deg, #fff1f2 0%, #ffffff 40%, #fdf2f8 100%)', fontFamily: "'Nunito', 'Segoe UI', sans-serif" }}>

      {/* ── HERO BANNER ── */}
      <div className="relative h-52 md:h-64 overflow-hidden">
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(135deg, #f43f5e 0%, #ec4899 40%, #a855f7 80%, #8b5cf6 100%)'
        }} />
        {/* Decorative circles */}
        <div className="absolute -top-10 -left-10 w-48 h-48 rounded-full opacity-20" style={{ background: 'white' }} />
        <div className="absolute top-4 right-20 w-24 h-24 rounded-full opacity-10" style={{ background: 'white' }} />
        <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full opacity-10 translate-x-16 translate-y-16" style={{ background: 'white' }} />
        <div className="absolute top-6 left-1/3 w-16 h-16 rounded-full opacity-10" style={{ background: 'white' }} />
        {/* Subtle dot pattern */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
      </div>

      <div className="max-w-4xl mx-auto px-4">

        {/* ── PROFILE CARD ── */}
        <div className="relative -mt-20 mb-6">
          <div className="bg-white rounded-3xl shadow-2xl border border-rose-50 p-6 md:p-8">

            <div className="flex flex-col sm:flex-row items-start gap-6">

              {/* Avatar */}
              <div className="relative -mt-16 sm:-mt-20 flex-shrink-0">
                <div
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden shadow-2xl cursor-pointer transition-transform hover:scale-105"
                  style={{ border: `4px solid ${badge.ringColor}`, boxShadow: `0 8px 32px ${badge.ringColor}66` }}
                  onClick={() => profileUser.profilePic && setAvatarModalOpen(true)}
                >
                  {profileUser.profilePic ? (
                    <img src={profileUser.profilePic} alt={profileUser.username} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-4xl font-black"
                      style={{ background: 'linear-gradient(135deg, #f43f5e, #ec4899)' }}>
                      {profileUser.username?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                {BadgeIcon && (
                  <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-xl bg-white shadow-xl flex items-center justify-center"
                    style={{ border: `2px solid ${badge.ringColor}` }}>
                    <BadgeIcon className="w-5 h-5" style={{ color: badge.textColor }} />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 pt-2">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">{profileUser.username}</h1>
                  {profileUser.isVerified && (
                    <span className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}>
                      <Check className="w-3.5 h-3.5 text-white" />
                    </span>
                  )}
                  <span className="text-xs px-3 py-1 rounded-full font-bold tracking-wide"
                    style={{ background: badge.bgColor, color: badge.textColor }}>
                    {badge.level}
                  </span>
                </div>

                {profileUser.bio && (
                  <p className="text-gray-600 text-sm md:text-base mb-4 leading-relaxed max-w-xl">{profileUser.bio}</p>
                )}

                <div className="flex flex-wrap gap-4 text-xs text-gray-400 mb-5">
                  {profileUser.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-400" />
                      {profileUser.location}
                    </span>
                  )}
                  {profileUser.website && (
                    <a href={profileUser.website} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 font-medium transition hover:opacity-70"
                      style={{ color: '#f43f5e' }}>
                      <LinkIcon className="w-3.5 h-3.5" />
                      {profileUser.website.replace(/^https?:\/\//, '')}
                    </a>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-rose-400" />
                    Joined {formatJoinDate(profileUser.createdAt)}
                  </span>
                </div>

                {/* Stats */}
                <div className="flex gap-6 mb-5">
                  {[
                    { label: 'Posts', value: photos.length, onClick: null },
                    { label: 'Followers', value: profileUser.followers?.length || 0, onClick: () => openModal('followers') },
                    { label: 'Following', value: profileUser.following?.length || 0, onClick: () => openModal('following') },
                  ].map(stat => (
                    <button key={stat.label} onClick={stat.onClick}
                      className={`text-center group transition ${stat.onClick ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}>
                      <div className="text-2xl font-black text-gray-900 group-hover:text-rose-500 transition leading-none">
                        {stat.value}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5 font-medium">{stat.label}</div>
                    </button>
                  ))}
                </div>

                {/* Buttons */}
                <div className="flex flex-wrap gap-2 relative">
                  {isOwnProfile ? (
                    <>
                      <button onClick={() => navigate(`/profile/${username}/edit`)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition hover:opacity-90 shadow-lg"
                        style={{ background: 'linear-gradient(135deg, #f43f5e, #ec4899)', boxShadow: '0 4px 20px rgba(244,63,94,0.3)' }}>
                        <Settings className="w-4 h-4" />
                        Edit Profile
                      </button>
                      <button onClick={handleShareProfile}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition hover:bg-gray-100"
                        style={{ background: '#f9fafb', color: '#374151', border: '1.5px solid #e5e7eb' }}>
                        <Share2 className="w-4 h-4" />
                        Share
                      </button>
                    </>
                  ) : currentUser ? (
                    <>
                      <button onClick={isFollowing ? handleUnfollow : handleFollow} disabled={followLoading}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition hover:opacity-90 shadow-lg disabled:opacity-60"
                        style={isFollowing
                          ? { background: '#f9fafb', color: '#374151', border: '1.5px solid #e5e7eb', boxShadow: 'none' }
                          : { background: 'linear-gradient(135deg, #f43f5e, #ec4899)', boxShadow: '0 4px 20px rgba(244,63,94,0.3)' }}>
                        {followLoading
                          ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          : <UserPlus className="w-4 h-4" />}
                        <span style={isFollowing ? { color: '#374151' } : {}}>{isFollowing ? 'Unfollow' : 'Follow'}</span>
                      </button>
                      <Link to={`/chat/${profileUser._id}`}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition hover:opacity-90"
                        style={{ background: '#fff1f2', color: '#f43f5e', border: '1.5px solid #fecdd3' }}>
                        <MessageCircle className="w-4 h-4" />
                        Message
                      </Link>
                      <button onClick={handleShareProfile}
                        className="p-2.5 rounded-xl transition hover:bg-gray-100"
                        style={{ background: '#f9fafb', border: '1.5px solid #e5e7eb' }}>
                        <Share2 className="w-4 h-4 text-gray-500" />
                      </button>
                    </>
                  ) : (
                    <Link to="/login"
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition hover:opacity-90 shadow-lg"
                      style={{ background: 'linear-gradient(135deg, #f43f5e, #ec4899)' }}>
                      Follow to Connect
                    </Link>
                  )}
                  {showShareTooltip && (
                    <div className="absolute top-full left-0 mt-2 bg-gray-900 text-white text-xs px-3 py-2 rounded-xl shadow-xl flex items-center gap-2 z-10">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      Profile link copied!
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="flex items-center gap-1 mb-6 p-1 bg-white rounded-2xl shadow-sm border border-rose-50 w-fit">
          <button onClick={() => setActiveTab('posts')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={activeTab === 'posts'
              ? { background: 'linear-gradient(135deg, #f43f5e, #ec4899)', color: 'white', boxShadow: '0 2px 12px rgba(244,63,94,0.25)' }
              : { color: '#9ca3af' }}>
            <Grid className="w-4 h-4" />
            Posts
          </button>
        </div>

        {/* ── PHOTO GRID ── */}
        {activeTab === 'posts' && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-black text-gray-800 flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #f43f5e, #ec4899)' }}>
                  <Camera className="w-4 h-4 text-white" />
                </span>
                Moments
              </h2>
              {photos.length > 0 && (
                <span className="text-xs text-gray-400 bg-white px-3 py-1.5 rounded-full shadow-sm border border-rose-50 font-medium">
                  {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
                </span>
              )}
            </div>

            {photos.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-rose-50">
                <div className="w-20 h-20 rounded-2xl rotate-6 mx-auto mb-5 flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #fff1f2, #fce7f3)' }}>
                  <Camera className="w-9 h-9 text-rose-300" />
                </div>
                <p className="font-bold text-gray-700 mb-1">No moments yet</p>
                <p className="text-sm text-gray-400">
                  {isOwnProfile ? 'Share your first photo to start your journey!' : "This user hasn't shared any moments yet"}
                </p>
                {isOwnProfile && (
                  <button onClick={() => navigate('/upload')}
                    className="mt-6 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition hover:opacity-90 shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #f43f5e, #ec4899)', boxShadow: '0 4px 20px rgba(244,63,94,0.25)' }}>
                    Upload First Photo
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {photos.map((photo, i) => (
                  <div key={photo._id}
                    className="relative aspect-square group cursor-pointer overflow-hidden rounded-2xl bg-gray-100 shadow-md hover:shadow-2xl transition-all duration-500"
                    style={{ animationDelay: `${i * 40}ms` }}
                    onClick={() => navigate(`/photo/${photo._id}`)}>
                    <img src={photo.imageUrl} alt={photo.caption || ''}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)' }} />

                    {/* Caption */}
                    {photo.caption && (
                      <div className="absolute top-2.5 left-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <p className="text-white text-xs bg-black/40 backdrop-blur-sm px-2 py-1 rounded-lg truncate">{photo.caption}</p>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-xs bg-black/30 backdrop-blur-sm px-2 py-1 rounded-lg font-semibold">
                          <Heart className="w-3 h-3" fill="white" />
                          {photo.likes?.length || 0}
                        </span>
                        <span className="flex items-center gap-1 text-xs bg-black/30 backdrop-blur-sm px-2 py-1 rounded-lg font-semibold">
                          <MessageSquare className="w-3 h-3" />
                          {photo.comments?.length || 0}
                        </span>
                      </div>
                      <ChevronRight className="w-5 h-5 bg-black/30 backdrop-blur-sm rounded-full p-1" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── FOLLOWERS / FOLLOWING MODAL ── */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-white rounded-3xl w-full max-w-sm max-h-[70vh] overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-rose-50 flex items-center justify-between">
              <h3 className="text-lg font-black text-gray-800">{modalType === 'followers' ? 'Followers' : 'Following'}</h3>
              <button onClick={closeModal} className="p-2 rounded-xl hover:bg-rose-50 transition">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[55vh]">
              {modalLoading ? (
                <div className="flex justify-center py-10">
                  <div className="w-10 h-10 rounded-full border-4 border-rose-100 border-t-rose-500 animate-spin" />
                </div>
              ) : modalList.length === 0 ? (
                <div className="text-center py-10">
                  <UserPlus className="w-10 h-10 text-rose-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">No {modalType} yet</p>
                </div>
              ) : (
                <ul className="space-y-1">
                  {modalList.map(u => (
                    <li key={u._id}>
                      <Link to={`/profile/${u.username}`} onClick={closeModal}
                        className="flex items-center gap-3 p-3 rounded-2xl hover:bg-rose-50 transition group">
                        <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
                          {u.profilePic
                            ? <img src={u.profilePic} alt={u.username} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-white font-black text-sm"
                                style={{ background: 'linear-gradient(135deg, #f43f5e, #ec4899)' }}>
                                {u.username.charAt(0).toUpperCase()}
                              </div>}
                        </div>
                        <span className="font-semibold text-sm text-gray-700 group-hover:text-rose-600 transition flex-1">{u.username}</span>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-rose-400 transition" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── AVATAR MODAL ── */}
      {avatarModalOpen && profileUser.profilePic && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setAvatarModalOpen(false)}>
          <div className="relative" onClick={e => e.stopPropagation()}>
            <img src={profileUser.profilePic} alt={profileUser.username}
              className="max-w-full max-h-[85vh] object-contain rounded-3xl shadow-2xl" />
            <button onClick={() => setAvatarModalOpen(false)}
              className="absolute top-3 right-3 p-2.5 rounded-xl bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeInUp 0.35s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default Profile;