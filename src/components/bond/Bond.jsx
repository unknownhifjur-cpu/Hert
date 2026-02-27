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
        await fetchSharedBond();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSharedBond = async () => {
    try {
      const res = await api.get('/bond/shared');
      setBondData(res.data.bondData);
    } catch (err) {
      console.error('Failed to fetch shared bond', err);
    }
  };

  const updateSharedBond = async (updates) => {
    try {
      const res = await api.put('/bond/shared', updates);
      setBondData(res.data.bondData);
    } catch (err) {
      console.error('Failed to update bond', err);
    }
  };

  // Search users
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
  const updateField = (field, value) => {
    updateSharedBond({ [field]: value });
  };

  const addItem = (field, item) => {
    const newItem = { ...item, id: Date.now() };
    updateSharedBond({ [field]: [...(bondData[field] || []), newItem] });
  };

  const updateItem = (field, id, updates) => {
    const updatedArray = bondData[field].map(item =>
      item.id === id ? { ...item, ...updates } : item
    );
    updateSharedBond({ [field]: updatedArray });
  };

  const deleteItem = (field, id) => {
    const filtered = bondData[field].filter(item => item.id !== id);
    updateSharedBond({ [field]: filtered });
  };

  const daysTogether = bondData?.startDate
    ? Math.floor((new Date() - new Date(bondData.startDate)) / (1000 * 60 * 60 * 24))
    : 0;

  const goalsMet = bondData?.goals?.filter(g => g.completed).length || 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-rose-500 border-t-transparent"></div>
      </div>
    );
  }

  // Single state – search and send requests
  if (bondStatus === 'single') {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 pb-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <HeartHandshake className="w-16 h-16 text-rose-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-800">Find Your Bond</h1>
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
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-full focus:ring-2 focus:ring-rose-200 focus:border-rose-400"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

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

  // Pending state – show requests
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
                        disabled={followLoading}
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

  // Bonded state – shared bond page
  if (!bondData) return <div className="min-h-screen flex items-center justify-center">Failed to load bond data.</div>;

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
                {partner.username?.charAt(0).toUpperCase()}
              </div>
              <span className="font-medium">{partner.username}</span>
            </div>
          )}
        </div>

        {/* Quick Stats (same as before, using bondData) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {/* ... same stats cards using bondData, daysTogether, goalsMet */}
        </div>

        {/* Cards Grid – same as before, but all updates go to shared bond */}
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
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Bond status</span>
                <input
                  type="text"
                  value={bondData.bondStatus}
                  onChange={(e) => updateField('bondStatus', e.target.value)}
                  className="text-right font-semibold text-rose-600 border-b border-transparent focus:border-rose-200 focus:outline-none px-1 w-24"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Anniversary</span>
                <input
                  type="date"
                  value={bondData.anniversary}
                  onChange={(e) => updateField('anniversary', e.target.value)}
                  className="text-right border-b border-transparent focus:border-rose-200 focus:outline-none px-1"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Started on</span>
                <input
                  type="date"
                  value={bondData.startDate}
                  onChange={(e) => updateField('startDate', e.target.value)}
                  className="text-right border-b border-transparent focus:border-rose-200 focus:outline-none px-1"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Connection strength</span>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={bondData.connectionStrength}
                    onChange={(e) => updateField('connectionStrength', parseInt(e.target.value) || 0)}
                    className="w-16 text-right border-b border-transparent focus:border-rose-200 focus:outline-none px-1"
                  />%
                </div>
              </div>
            </div>
          </div>

          {/* Memories & Moments (same as before) */}
          {/* ... other cards with same update functions using bondData */}
        </div>

        <div className="mt-8 text-center text-gray-400 text-sm">
          ❤️ Nurture your connection every day.
        </div>
      </div>
    </div>
  );
};

export default Bond;