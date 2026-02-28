import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';
import {
  Heart, Calendar, Image, Target, Smile, Lock, HeartHandshake,
  Camera, BookOpen, CheckCircle, Shield, Edit2, Save, Plus, Trash2, X,
  Users, Send, Search, Check, User as UserIcon
} from 'lucide-react';

const Bond = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [bondStatus, setBondStatus] = useState(null);
  const [partner, setPartner] = useState(null);
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [bondData, setBondData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [followLoading, setFollowLoading] = useState(false);

  // Form states for adding items (used when bonded)
  const [newMemory, setNewMemory] = useState({ date: '', text: '' });
  const [newDiary, setNewDiary] = useState({ date: '', text: '' });
  const [newGoal, setNewGoal] = useState({ text: '', completed: false });
  const [newCommitment, setNewCommitment] = useState('');
  const [editingMemoryId, setEditingMemoryId] = useState(null);
  const [editingDiaryId, setEditingDiaryId] = useState(null);
  const [editingGoalId, setEditingGoalId] = useState(null);
  const [editingCommitmentId, setEditingCommitmentId] = useState(null);

  // Sparkle effect state
  const [sparkle, setSparkle] = useState(false);

  useEffect(() => {
    fetchBondStatus();
  }, []);

  const fetchBondStatus = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bond/status');
      setBondStatus(res.data.status);
      setPartner(res.data.partner);
      setSentRequests(res.data.sentRequests || []);
      setReceivedRequests(res.data.receivedRequests || []);
      if (res.data.status === 'bonded') {
        await fetchBondData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 🔁 Changed to shared endpoint
  const fetchBondData = async () => {
    try {
      const res = await api.get('/bond/shared');
      setBondData(res.data);
    } catch (err) {
      console.error('Failed to fetch bond data', err);
    }
  };

  // 🔁 Changed to shared endpoint
  const updateBondData = async (updates) => {
    try {
      const res = await api.put('/bond/shared', updates);
      setBondData(res.data);
      triggerSparkle();
    } catch (err) {
      console.error('Failed to update bond data', err);
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
    setFollowLoading(true);
    try {
      await api.post(`/bond/accept/${userId}`);
      fetchBondStatus();
    } catch (err) {
      alert(err.response?.data?.error || 'Accept failed');
    } finally {
      setFollowLoading(false);
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

  // For bonded state – data manipulation
  const triggerSparkle = () => {
    setSparkle(true);
    setTimeout(() => setSparkle(false), 300);
  };

  const updateField = (field, value) => {
    updateBondData({ [field]: value });
  };

  const addItem = (field, item) => {
    const newItem = { ...item, id: Date.now() };
    updateBondData({ [field]: [...(bondData[field] || []), newItem] });
  };

  const updateItem = (field, id, updates) => {
    const updatedArray = bondData[field].map(item =>
      item.id === id ? { ...item, ...updates } : item
    );
    updateBondData({ [field]: updatedArray });
  };

  const deleteItem = (field, id) => {
    const filtered = bondData[field].filter(item => item.id !== id);
    updateBondData({ [field]: filtered });
  };

  // ---- Bond Atmosphere Mode ----
  const getBondAtmosphere = () => {
    if (!bondData?.startDate) return 'new-bond';
    const days = Math.floor((new Date() - new Date(bondData.startDate)) / (1000 * 60 * 60 * 24));
    if (days < 30) return 'new-bond';
    if (days < 180) return 'warm-harmony';
    return 'deep-connection';
  };
  const bondAtmosphere = getBondAtmosphere();

  // ---- Heartbeat Bond Meter ----
  const computeBondMeter = () => {
    const memoriesCount = bondData?.memories?.length || 0;
    const diaryCount = bondData?.diaryEntries?.length || 0;
    const goalsCompleted = bondData?.goals?.filter(g => g.completed).length || 0;
    const commitmentsCount = bondData?.commitments?.length || 0;
    const interactions = bondData?.interactions || 0;

    const score = Math.min(
      5,
      Math.floor(
        (memoriesCount * 0.5 +
          diaryCount * 0.5 +
          goalsCompleted * 1 +
          commitmentsCount * 0.3 +
          interactions * 0.1) / 2
      )
    );
    return Math.max(1, score);
  };
  const bondMeter = computeBondMeter();

  // ---- Floating Memory Bubble ----
  const lastMemory = bondData?.memories?.length
    ? bondData.memories.sort((a, b) => new Date(b.date) - new Date(a.date))[0]
    : null;
  const memoryBubbleText = lastMemory
    ? `✨ ${lastMemory.text}`
    : "Connection is resting peacefully 🌙";

  // ---- Silent Bond Indicator ----
  const isSilent = () => {
    const lastUpdate = bondData?.updatedAt ? new Date(bondData.updatedAt) : null;
    if (lastUpdate) {
      const daysSince = Math.floor((new Date() - lastUpdate) / (1000 * 60 * 60 * 24));
      return daysSince >= 7;
    }
    const totalItems =
      (bondData?.memories?.length || 0) +
      (bondData?.diaryEntries?.length || 0) +
      (bondData?.goals?.length || 0) +
      (bondData?.commitments?.length || 0);
    return totalItems === 0;
  };
  const silent = isSilent();

  const daysTogether = bondData?.startDate
    ? Math.floor((new Date() - new Date(bondData.startDate)) / (1000 * 60 * 60 * 24))
    : 0;

  const goalsMet = bondData?.goals?.filter(g => g.completed).length || 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin"></div>
          <Heart className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-rose-500 animate-pulse" />
        </div>
      </div>
    );
  }

  // Single state – search and send requests
  if (bondStatus === 'single') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 pt-16 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <HeartHandshake className="w-16 h-16 text-rose-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
              Find Your Bond
            </h1>
            <p className="text-gray-500 mt-2">Search for someone special and send a love request.</p>
          </div>

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
                className="w-full pl-10 pr-4 py-3 border border-rose-200 rounded-full focus:ring-2 focus:ring-rose-200 focus:border-rose-400 bg-white/80"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-rose-300" />
            </div>
          </div>

          {searchResults.length > 0 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-100 p-4 max-w-md mx-auto">
              <h3 className="font-medium text-gray-700 mb-2">Results</h3>
              <ul className="space-y-2">
                {searchResults.map(u => (
                  <li key={u._id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-semibold">
                        {u.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-gray-800">{u.username}</span>
                    </div>
                    {sentRequests.some(r => r._id === u._id) ? (
                      <span className="text-sm text-rose-400">Request sent</span>
                    ) : (
                      <button
                        onClick={() => sendRequest(u.username)}
                        className="text-rose-500 hover:text-rose-600 p-2 rounded-full hover:bg-rose-50"
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

  // Pending state – show requests
  if (bondStatus === 'pending') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 pt-16 pb-20 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <Users className="w-16 h-16 text-rose-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
              Love Requests
            </h1>
          </div>

          {receivedRequests.length > 0 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-100 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Received</h2>
              <ul className="space-y-3">
                {receivedRequests.map(r => (
                  <li key={r._id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-semibold">
                        {r.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-800">{r.username}</span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => acceptRequest(r._id)}
                        disabled={followLoading}
                        className="p-2 bg-emerald-100 text-emerald-600 rounded-full hover:bg-emerald-200 transition"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => rejectRequest(r._id)}
                        className="p-2 bg-rose-100 text-rose-600 rounded-full hover:bg-rose-200 transition"
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
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-100 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Sent</h2>
              <ul className="space-y-3">
                {sentRequests.map(r => (
                  <li key={r._id} className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-semibold">
                      {r.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-gray-800">{r.username}</span>
                    <span className="text-sm text-rose-400 ml-auto">Pending</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Bonded state – shared bond page
  if (!bondData) return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center px-4">
      <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg">
        <Lock className="w-12 h-12 text-rose-400 mx-auto mb-4" />
        <p className="text-gray-600">Failed to load bond data.</p>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen pt-16 pb-20 md:pb-8 px-4 ${bondAtmosphere}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header with partner info */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <HeartHandshake className="w-8 h-8 text-rose-500" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
              Bond
            </h1>
          </div>
          {partner && (
            <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-rose-100 self-start sm:self-auto">
              <span className="text-sm text-gray-500">with</span>
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                {partner.username?.charAt(0).toUpperCase()}
              </div>
              <span className="font-medium text-gray-800">{partner.username}</span>
            </div>
          )}
        </div>

        {/* Floating Memory Bubble */}
        <div className="mb-6 text-center animate-float">
          <div className="inline-block px-4 sm:px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full shadow-md border border-rose-100 max-w-full">
            <p className="text-sm text-rose-600 break-words">{memoryBubbleText}</p>
          </div>
        </div>

        {/* Silent Bond Indicator */}
        {silent && (
          <div className="mb-6 text-center animate-fade-in">
            <p className="text-sm text-amber-600 bg-amber-50/80 backdrop-blur-sm inline-block px-4 py-2 rounded-full shadow-sm border border-amber-200 max-w-full">
              💤 Connection is resting quietly
            </p>
          </div>
        )}

        {/* Sparkle effect */}
        {sparkle && (
          <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
            <div className="text-6xl animate-sparkle">✨</div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8">
          {[
            { icon: Calendar, label: 'together', value: `${daysTogether}d`, color: 'rose' },
            { icon: Image, label: 'memories', value: bondData?.memories?.length || 0, color: 'pink' },
            { icon: Target, label: 'goals met', value: goalsMet, color: 'rose' },
            { icon: BookOpen, label: 'diary', value: bondData?.diaryEntries?.length || 0, color: 'pink' }
          ].map((stat, idx) => (
            <div key={idx} className="bg-white/80 backdrop-blur-sm rounded-xl p-3 sm:p-4 shadow-md border border-rose-100 hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
                <span className="text-xs text-gray-400">{stat.label}</span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-gray-800 mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Relationship Overview */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-100 p-4 sm:p-6 hover:shadow-xl transition">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-rose-50 rounded-lg">
                <Heart className="w-6 h-6 text-rose-500" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Relationship Overview</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Bond status</span>
                <input
                  type="text"
                  value={bondData.bondStatus || 'Strong'}
                  onChange={(e) => updateField('bondStatus', e.target.value)}
                  className="text-right font-semibold text-rose-600 border-b border-transparent focus:border-rose-200 focus:outline-none px-1 w-24 bg-transparent"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Anniversary</span>
                <input
                  type="date"
                  value={bondData.anniversary || ''}
                  onChange={(e) => updateField('anniversary', e.target.value)}
                  className="text-right border-b border-transparent focus:border-rose-200 focus:outline-none px-1 bg-transparent"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Started on</span>
                <input
                  type="date"
                  value={bondData.startDate || ''}
                  onChange={(e) => updateField('startDate', e.target.value)}
                  className="text-right border-b border-transparent focus:border-rose-200 focus:outline-none px-1 bg-transparent"
                />
              </div>
              {/* Bond Meter */}
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Bond meter</span>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Heart
                      key={i}
                      className={`w-5 h-5 transition-all duration-300 ${
                        i <= bondMeter
                          ? 'fill-rose-500 text-rose-500 animate-soft-pulse'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Memories & Moments */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-100 p-4 sm:p-6 hover:shadow-xl transition md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-rose-50 rounded-lg">
                <Camera className="w-6 h-6 text-rose-500" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Memories & Moments</h2>
            </div>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2 scrollbar-thin">
              {bondData.memories?.map((memory) => (
                <div key={memory.id} className="flex items-start space-x-2 group p-2 hover:bg-rose-50/50 rounded-lg transition">
                  <div className="flex-1">
                    {editingMemoryId === memory.id ? (
                      <input
                        type="text"
                        value={memory.text}
                        onChange={(e) => updateItem('memories', memory.id, { text: e.target.value })}
                        onBlur={() => setEditingMemoryId(null)}
                        autoFocus
                        className="w-full px-2 py-1 border border-rose-200 rounded bg-white"
                      />
                    ) : (
                      <p className="text-sm text-gray-700 break-words">{memory.text}</p>
                    )}
                    <span className="text-xs text-gray-400">{new Date(memory.date).toLocaleDateString()}</span>
                  </div>
                  <button
                    onClick={() => setEditingMemoryId(memory.id)}
                    className="opacity-0 group-hover:opacity-100 transition p-1 hover:bg-gray-100 rounded"
                  >
                    <Edit2 className="w-3 h-3 text-gray-500" />
                  </button>
                  <button
                    onClick={() => deleteItem('memories', memory.id)}
                    className="opacity-0 group-hover:opacity-100 transition p-1 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-3 h-3 text-red-400" />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-col sm:flex-row gap-2">
              <input
                type="date"
                value={newMemory.date}
                onChange={(e) => setNewMemory({ ...newMemory, date: e.target.value })}
                className="text-sm border border-rose-200 rounded-lg px-2 py-1 bg-white"
              />
              <input
                type="text"
                placeholder="New memory..."
                value={newMemory.text}
                onChange={(e) => setNewMemory({ ...newMemory, text: e.target.value })}
                className="flex-1 text-sm border border-rose-200 rounded-lg px-2 py-1 bg-white"
              />
              <button
                onClick={() => {
                  if (newMemory.text && newMemory.date) {
                    addItem('memories', newMemory);
                    setNewMemory({ date: '', text: '' });
                  }
                }}
                className="p-2 bg-rose-100 text-rose-600 rounded-full hover:bg-rose-200 transition self-end sm:self-auto"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Diary Entries */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-100 p-4 sm:p-6 hover:shadow-xl transition">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-rose-50 rounded-lg">
                <BookOpen className="w-6 h-6 text-rose-500" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Diary</h2>
            </div>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2 scrollbar-thin">
              {bondData.diaryEntries?.map((entry) => (
                <div key={entry.id} className="flex items-start space-x-2 group p-2 hover:bg-rose-50/50 rounded-lg transition">
                  <div className="flex-1">
                    {editingDiaryId === entry.id ? (
                      <input
                        type="text"
                        value={entry.text}
                        onChange={(e) => updateItem('diaryEntries', entry.id, { text: e.target.value })}
                        onBlur={() => setEditingDiaryId(null)}
                        autoFocus
                        className="w-full px-2 py-1 border border-rose-200 rounded bg-white"
                      />
                    ) : (
                      <p className="text-sm text-gray-700 break-words">{entry.text}</p>
                    )}
                    <span className="text-xs text-gray-400">{new Date(entry.date).toLocaleDateString()}</span>
                  </div>
                  <button
                    onClick={() => setEditingDiaryId(entry.id)}
                    className="opacity-0 group-hover:opacity-100 transition p-1 hover:bg-gray-100 rounded"
                  >
                    <Edit2 className="w-3 h-3 text-gray-500" />
                  </button>
                  <button
                    onClick={() => deleteItem('diaryEntries', entry.id)}
                    className="opacity-0 group-hover:opacity-100 transition p-1 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-3 h-3 text-red-400" />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-col sm:flex-row gap-2">
              <input
                type="date"
                value={newDiary.date}
                onChange={(e) => setNewDiary({ ...newDiary, date: e.target.value })}
                className="text-sm border border-rose-200 rounded-lg px-2 py-1 bg-white"
              />
              <input
                type="text"
                placeholder="New diary entry..."
                value={newDiary.text}
                onChange={(e) => setNewDiary({ ...newDiary, text: e.target.value })}
                className="flex-1 text-sm border border-rose-200 rounded-lg px-2 py-1 bg-white"
              />
              <button
                onClick={() => {
                  if (newDiary.text && newDiary.date) {
                    addItem('diaryEntries', newDiary);
                    setNewDiary({ date: '', text: '' });
                  }
                }}
                className="p-2 bg-rose-100 text-rose-600 rounded-full hover:bg-rose-200 transition self-end sm:self-auto"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Goals */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-100 p-4 sm:p-6 hover:shadow-xl transition">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-rose-50 rounded-lg">
                <Target className="w-6 h-6 text-rose-500" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Goals</h2>
            </div>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2 scrollbar-thin">
              {bondData.goals?.map((goal) => (
                <div key={goal.id} className="flex items-center space-x-2 group p-1 hover:bg-rose-50/50 rounded-lg transition">
                  <input
                    type="checkbox"
                    checked={goal.completed}
                    onChange={(e) => updateItem('goals', goal.id, { completed: e.target.checked })}
                    className="rounded text-rose-500 focus:ring-rose-200"
                  />
                  <div className="flex-1">
                    {editingGoalId === goal.id ? (
                      <input
                        type="text"
                        value={goal.text}
                        onChange={(e) => updateItem('goals', goal.id, { text: e.target.value })}
                        onBlur={() => setEditingGoalId(null)}
                        autoFocus
                        className="w-full px-2 py-1 border border-rose-200 rounded bg-white"
                      />
                    ) : (
                      <span className={goal.completed ? 'line-through text-gray-400 break-words' : 'text-gray-700 break-words'}>
                        {goal.text}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setEditingGoalId(goal.id)}
                    className="opacity-0 group-hover:opacity-100 transition p-1 hover:bg-gray-100 rounded"
                  >
                    <Edit2 className="w-3 h-3 text-gray-500" />
                  </button>
                  <button
                    onClick={() => deleteItem('goals', goal.id)}
                    className="opacity-0 group-hover:opacity-100 transition p-1 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-3 h-3 text-red-400" />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                placeholder="New goal..."
                value={newGoal.text}
                onChange={(e) => setNewGoal({ ...newGoal, text: e.target.value })}
                className="flex-1 text-sm border border-rose-200 rounded-lg px-2 py-1 bg-white"
              />
              <button
                onClick={() => {
                  if (newGoal.text) {
                    addItem('goals', newGoal);
                    setNewGoal({ text: '', completed: false });
                  }
                }}
                className="p-2 bg-rose-100 text-rose-600 rounded-full hover:bg-rose-200 transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Commitments */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-100 p-4 sm:p-6 hover:shadow-xl transition">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-rose-50 rounded-lg">
                <CheckCircle className="w-6 h-6 text-rose-500" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Commitments</h2>
            </div>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2 scrollbar-thin">
              {bondData.commitments?.map((commitment) => (
                <div key={commitment.id} className="flex items-start space-x-2 group p-2 hover:bg-rose-50/50 rounded-lg transition">
                  <div className="flex-1">
                    {editingCommitmentId === commitment.id ? (
                      <input
                        type="text"
                        value={commitment.text}
                        onChange={(e) => updateItem('commitments', commitment.id, { text: e.target.value })}
                        onBlur={() => setEditingCommitmentId(null)}
                        autoFocus
                        className="w-full px-2 py-1 border border-rose-200 rounded bg-white"
                      />
                    ) : (
                      <p className="text-sm text-gray-700 break-words">{commitment.text}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setEditingCommitmentId(commitment.id)}
                    className="opacity-0 group-hover:opacity-100 transition p-1 hover:bg-gray-100 rounded"
                  >
                    <Edit2 className="w-3 h-3 text-gray-500" />
                  </button>
                  <button
                    onClick={() => deleteItem('commitments', commitment.id)}
                    className="opacity-0 group-hover:opacity-100 transition p-1 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-3 h-3 text-red-400" />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                placeholder="New commitment..."
                value={newCommitment}
                onChange={(e) => setNewCommitment(e.target.value)}
                className="flex-1 text-sm border border-rose-200 rounded-lg px-2 py-1 bg-white"
              />
              <button
                onClick={() => {
                  if (newCommitment) {
                    addItem('commitments', { id: Date.now(), text: newCommitment });
                    setNewCommitment('');
                  }
                }}
                className="p-2 bg-rose-100 text-rose-600 rounded-full hover:bg-rose-200 transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-rose-400 text-sm">
          ❤️ Nurture your connection every day.
        </div>
      </div>

      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-3px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }

        @keyframes softPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        .animate-soft-pulse {
          animation: softPulse 2s ease-in-out infinite;
        }

        @keyframes sparkle {
          0% { opacity: 0; transform: scale(0.5) rotate(0deg); }
          50% { opacity: 1; transform: scale(1.2) rotate(10deg); }
          100% { opacity: 0; transform: scale(0.5) rotate(0deg); }
        }
        .animate-sparkle {
          animation: sparkle 0.3s ease-out;
        }

        /* Bond Atmosphere backgrounds */
        .new-bond {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
        }
        .warm-harmony {
          background: linear-gradient(135deg, #ffe4e6 0%, #fecdd3 100%);
        }
        .deep-connection {
          background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
        }

        /* Scrollbar styling */
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
    </div>
  );
};

export default Bond;