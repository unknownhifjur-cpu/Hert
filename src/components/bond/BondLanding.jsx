import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';
import {
  Heart, HeartHandshake, Users, Send, Search, Check, X, Lock
} from 'lucide-react';

const BondLanding = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [bondStatus, setBondStatus] = useState(null);
  const [partner, setPartner] = useState(null);
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    fetchBondStatus();
  }, []);

  const fetchBondStatus = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bond/status');
      const { status, partner, sentRequests, receivedRequests, bondId } = res.data;
      setBondStatus(status);
      setPartner(partner);
      setSentRequests(sentRequests || []);
      setReceivedRequests(receivedRequests || []);

      if (status === 'bonded') {
        // Redirect to the dashboard
        navigate('/bond/dashboard', { state: { bondId, partner } });
      }
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

  return null;
};

export default BondLanding;