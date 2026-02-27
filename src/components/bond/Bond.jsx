import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';
import {
  Heart, Calendar, Image, Target, Smile, Lock, HeartHandshake,
  Check, X, Send, Search, Users, Camera, BookOpen,
  CheckCircle, Shield
} from 'lucide-react';

const Bond = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [bondStatus, setBondStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [partner, setPartner] = useState(null);
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);

  // Dummy data for bonded view (replace with actual API call later)
  const [bondStats, setBondStats] = useState({
    connectionStrength: 92,
    daysTogether: 247,
    sharedPhotos: 47,
    goalsMet: 2,
    totalGoals: 5,
    anniversary: 'June 15, 2024',
    recentMemories: [
      { date: '2025-12-10', text: 'First trip to the mountains', icon: '📸' },
      { date: '2025-11-05', text: 'Concert night', icon: '🎵' },
    ],
    diaryEntries: 3,
    recentDiary: [
      { date: '2026-02-27', excerpt: 'Today we talked...' },
      { date: '2026-02-26', excerpt: 'Cooked together...' },
    ],
    goals: [
      { id: 1, text: 'Travel to Japan', completed: false },
      { id: 2, text: 'Learn to cook together', completed: true },
    ],
    commitments: [
      'Call every evening',
      'Monthly date night',
    ],
    mood: 'happy',
    interactions: 89,
  });

  useEffect(() => {
    fetchBondStatus();
  }, []);

  const fetchBondStatus = async () => {
    try {
      const res = await api.get('/bond/status');
      setBondStatus(res.data.status);
      setPartner(res.data.partner);
      setSentRequests(res.data.sentRequests || []);
      setReceivedRequests(res.data.receivedRequests || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async (query) => {
    if (query.length < 2) return;
    try {
      const res = await api.get(`/users/search?q=${query}`);
      setSearchResults(res.data.filter(u => u.username !== user.username));
    } catch (err) {
      console.error(err);
    }
  };

  const sendRequest = async (username) => {
    try {
      await api.post(`/bond/request/${username}`);
      alert('Request sent!');
      fetchBondStatus();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to send request');
    }
  };

  const acceptRequest = async (userId) => {
    try {
      await api.post(`/bond/accept/${userId}`);
      fetchBondStatus();
    } catch (err) {
      alert(err.response?.data?.error || 'Accept failed');
    }
  };

  const rejectRequest = async (userId) => {
    try {
      await api.post(`/bond/reject/${userId}`);
      fetchBondStatus();
    } catch (err) {
      alert(err.response?.data?.error || 'Reject failed');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-4 border-rose-500 border-t-transparent"></div></div>;

  // Single user – find love
  if (bondStatus === 'single') {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 pb-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <HeartHandshake className="w-16 h-16 text-rose-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-800">Find Your Bond</h1>
            <p className="text-gray-500 mt-2">Search for someone special and send a love request.</p>
          </div>

          {/* Search */}
          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by username..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  searchUsers(e.target.value);
                }}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-full focus:ring-2 focus:ring-rose-200 focus:border-rose-400"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* Results */}
          {searchResults.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 max-w-md mx-auto">
              <h3 className="font-medium text-gray-700 mb-2">Results</h3>
              <ul className="space-y-2">
                {searchResults.map(u => (
                  <li key={u._id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-semibold">
                        {u.username.charAt(0).toUpperCase()}
                      </div>
                      <span>{u.username}</span>
                    </div>
                    {sentRequests.some(r => r._id === u._id) ? (
                      <span className="text-sm text-gray-400">Request sent</span>
                    ) : (
                      <button
                        onClick={() => sendRequest(u.username)}
                        className="text-rose-500 hover:text-rose-600 text-sm font-medium"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Pending – show sent/received requests
  if (bondStatus === 'pending') {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 pb-20">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-8">
            <Users className="w-16 h-16 text-rose-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-800">Love Requests</h1>
          </div>

          {receivedRequests.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Received</h2>
              <ul className="space-y-3">
                {receivedRequests.map(r => (
                  <li key={r._id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-rose-100 flex items-center justify-center">
                        {r.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium">{r.username}</span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => acceptRequest(r._id)}
                        className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => rejectRequest(r._id)}
                        className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {sentRequests.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Sent</h2>
              <ul className="space-y-3">
                {sentRequests.map(r => (
                  <li key={r._id} className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-rose-100 flex items-center justify-center">
                      {r.username.charAt(0).toUpperCase()}
                    </div>
                    <span>{r.username}</span>
                    <span className="text-sm text-gray-400 ml-auto">Pending</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Bonded – show the full Bond dashboard (using dummy data for now)
  if (bondStatus === 'bonded') {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 pb-20 md:pb-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header with partner info */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-3 mb-4 sm:mb-0">
              <HeartHandshake className="w-8 h-8 text-rose-500" />
              <h1 className="text-3xl font-bold text-gray-800">Bond</h1>
            </div>
            {partner && (
              <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm">
                <span className="text-sm text-gray-600">with</span>
                <div className="h-6 w-6 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 text-xs font-bold">
                  {partner.username.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium">{partner.username}</span>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <Heart className="w-6 h-6 text-rose-500 mb-2" />
              <p className="text-2xl font-bold text-gray-800">{bondStats.connectionStrength}%</p>
              <p className="text-xs text-gray-400">Connection</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <Calendar className="w-6 h-6 text-rose-500 mb-2" />
              <p className="text-2xl font-bold text-gray-800">{bondStats.daysTogether}</p>
              <p className="text-xs text-gray-400">Days together</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <Camera className="w-6 h-6 text-rose-500 mb-2" />
              <p className="text-2xl font-bold text-gray-800">{bondStats.sharedPhotos}</p>
              <p className="text-xs text-gray-400">Photos</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <Target className="w-6 h-6 text-rose-500 mb-2" />
              <p className="text-2xl font-bold text-gray-800">{bondStats.goalsMet}/{bondStats.totalGoals}</p>
              <p className="text-xs text-gray-400">Goals met</p>
            </div>
          </div>

          {/* Bond Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Relationship Overview */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-rose-50 rounded-lg">
                  <Heart className="w-6 h-6 text-rose-500" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800">Relationship Overview</h2>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Bond status</span>
                  <span className="font-semibold text-rose-600">Strong</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Anniversary</span>
                  <span className="font-medium">{bondStats.anniversary}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Connection strength</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 rounded-full" style={{ width: `${bondStats.connectionStrength}%` }} />
                    </div>
                    <span className="text-sm font-medium">{bondStats.connectionStrength}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Memories & Moments */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-rose-50 rounded-lg">
                  <Image className="w-6 h-6 text-rose-500" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800">Memories & Moments</h2>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Shared photos</span>
                  <span className="font-medium">{bondStats.sharedPhotos}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Saved notes</span>
                  <span className="font-medium">12</span> {/* Could be dynamic */}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Recent memories</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {bondStats.recentMemories.map((mem, idx) => (
                      <li key={idx} className="truncate">{mem.icon} {mem.date} – {mem.text}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Diary */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-rose-50 rounded-lg">
                  <BookOpen className="w-6 h-6 text-rose-500" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800">Diary</h2>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total entries</span>
                  <span className="font-medium">{bondStats.diaryEntries}</span>
                </div>
                <ul className="text-sm text-gray-600">
                  {bondStats.recentDiary.map((entry, idx) => (
                    <li key={idx} className="truncate">📝 {entry.date} – {entry.excerpt}</li>
                  ))}
                </ul>
                <button className="text-sm text-rose-500 hover:text-rose-600">Write new →</button>
              </div>
            </div>

            {/* Promises & Goals */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-rose-50 rounded-lg">
                  <Target className="w-6 h-6 text-rose-500" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800">Promises & Goals</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Couple goals</p>
                  <ul className="text-sm space-y-1">
                    {bondStats.goals.map(goal => (
                      <li key={goal.id} className="flex items-center space-x-2">
                        <CheckCircle className={`w-4 h-4 ${goal.completed ? 'text-green-500' : 'text-gray-300'}`} />
                        <span className={goal.completed ? 'line-through text-gray-400' : 'text-gray-600'}>
                          {goal.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Commitments</p>
                  <ul className="text-sm text-gray-600">
                    {bondStats.commitments.map((item, idx) => (
                      <li key={idx}>❤️ {item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Mood & Connection */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-rose-50 rounded-lg">
                  <Smile className="w-6 h-6 text-rose-500" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800">Mood & Connection</h2>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Recent mood</span>
                  <span className="capitalize">{bondStats.mood}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Connection health</span>
                  <span className="font-medium">{bondStats.connectionStrength}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Interactions</span>
                  <span className="font-medium">{bondStats.interactions}</span>
                </div>
              </div>
            </div>

            {/* Privacy & Control */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-rose-50 rounded-lg">
                  <Lock className="w-6 h-6 text-rose-500" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800">Privacy & Control</h2>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Lock settings</span>
                  <span className="text-rose-600">Enabled</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Access permissions</span>
                  <span className="font-medium">Only you two</span>
                </div>
                <p className="text-sm text-gray-600 flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>End-to-end encrypted</span>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center text-gray-400 text-sm">
            ❤️ Nurture your connection every day.
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Bond;