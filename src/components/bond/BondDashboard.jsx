import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart, Calendar, Image, Target, BookOpen, Camera,
  HeartHandshake, Lock, Sparkles, ChevronRight, BarChart3,
  Clock, Award, Shield, Gift
} from 'lucide-react';
import api from '../../utils/api';

const BondDashboard = () => {
  const navigate = useNavigate();
  const [bondData, setBondData] = useState(null);
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const bondPromise = api.get('/bond/shared').catch(err => {
        if (err.response?.status === 404) {
          console.warn('Shared bond not found, falling back to legacy data.');
          return api.get('/bond/data');
        }
        throw err;
      });

      const [bondRes, statusRes] = await Promise.all([
        bondPromise,
        api.get('/bond/status')
      ]);

      setBondData(bondRes.data);
      setPartner(statusRes.data.partner);
    } catch (err) {
      console.error('Failed to load bond data', err);
    } finally {
      setLoading(false);
    }
  };

  const daysTogether = bondData?.startDate
    ? Math.floor((new Date() - new Date(bondData.startDate)) / (1000 * 60 * 60 * 24))
    : 0;

  const goalsMet = bondData?.goals?.filter(g => g.completed).length || 0;

  const computeBondMeter = () => {
    const memoriesCount = bondData?.memories?.length || 0;
    const diaryCount = bondData?.diaryEntries?.length || 0;
    const goalsCompleted = goalsMet;
    const commitmentsCount = bondData?.commitments?.length || 0;
    const interactions = bondData?.interactions || 0;
    const score = Math.min(5, Math.floor(
      (memoriesCount * 0.5 + diaryCount * 0.5 + goalsCompleted * 1 + commitmentsCount * 0.3 + interactions * 0.1) / 2
    ));
    return Math.max(1, score);
  };
  const bondMeter = computeBondMeter();

  const lastMemory = bondData?.memories?.length
    ? bondData.memories.sort((a, b) => new Date(b.date) - new Date(a.date))[0]
    : null;
  const memoryBubbleText = lastMemory ? `✨ ${lastMemory.text}` : "Connection is resting peacefully 🌙";

  const isSilent = () => {
    const lastUpdate = bondData?.updatedAt ? new Date(bondData.updatedAt) : null;
    if (lastUpdate) {
      const daysSince = Math.floor((new Date() - lastUpdate) / (1000 * 60 * 60 * 24));
      return daysSince >= 7;
    }
    const totalItems = (bondData?.memories?.length || 0) + (bondData?.diaryEntries?.length || 0) +
                      (bondData?.goals?.length || 0) + (bondData?.commitments?.length || 0);
    return totalItems === 0;
  };
  const silent = isSilent();

  const navigationCards = [
    { path: '/bond/timeline', icon: Clock, label: 'Timeline', color: 'rose' },
    { path: '/bond/mood', icon: BarChart3, label: 'Mood Tracker', color: 'pink' },
    { path: '/bond/compatibility', icon: Award, label: 'Compatibility', color: 'rose' },
    { path: '/bond/anniversary', icon: Calendar, label: 'Anniversary', color: 'pink' },
    { path: '/bond/privacy', icon: Shield, label: 'Privacy', color: 'rose' },
    { path: '/bond/gift', icon: Gift, label: 'Gift System', color: 'pink' }
  ];

  // ----- Stylish Loading Screen -----
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-rose-200 rounded-full blur-xl animate-pulse"></div>
            <Heart className="relative w-16 h-16 text-rose-500 animate-glow" fill="#f43f5e" />
          </div>
          <p className="text-gray-600 text-lg font-light">Loading your bond...</p>
          <p className="text-gray-400 text-sm mt-2">Just a moment, love.</p>
        </div>
      </div>
    );
  }

  // ----- Stylish Error Screen -----
  if (!bondData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center px-4">
        <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-100 p-8 max-w-md">
          <Lock className="w-16 h-16 text-rose-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-6">We couldn't load your bond data. This might be temporary.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/bond/dashboard')}
              className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-medium transition shadow-lg shadow-rose-500/25"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ----- Main Dashboard (unchanged) -----
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 pt-16 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* ... rest of the dashboard JSX (same as before) ... */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <HeartHandshake className="w-8 h-8 text-rose-500" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
              Bond Dashboard
            </h1>
          </div>
          {partner && (
            <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-rose-100">
              <span className="text-sm text-gray-500">with</span>
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                {partner.username?.charAt(0).toUpperCase()}
              </div>
              <span className="font-medium text-gray-800">{partner.username}</span>
            </div>
          )}
        </div>

        {/* Memory Bubble */}
        <div className="mb-6 text-center animate-float">
          <div className="inline-block px-4 sm:px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full shadow-md border border-rose-100 max-w-full">
            <p className="text-sm text-rose-600 break-words">{memoryBubbleText}</p>
          </div>
        </div>

        {/* Silent Indicator */}
        {silent && (
          <div className="mb-6 text-center animate-fade-in">
            <p className="text-sm text-amber-600 bg-amber-50/80 backdrop-blur-sm inline-block px-4 py-2 rounded-full shadow-sm border border-amber-200 max-w-full">
              💤 Connection is resting quietly
            </p>
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

        {/* Bond Meter Card */}
        <div className="mb-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center space-x-2">
            <Heart className="w-5 h-5 text-rose-500" />
            <span>Bond Meter</span>
          </h2>
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map(i => (
              <Heart
                key={i}
                className={`w-8 h-8 transition-all duration-300 ${
                  i <= bondMeter
                    ? 'fill-rose-500 text-rose-500 animate-soft-pulse'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Navigation to other pages */}
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Explore</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {navigationCards.map((card, idx) => (
            <Link
              key={idx}
              to={card.path}
              className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-md border border-rose-100 hover:shadow-lg transition group"
            >
              <div className="flex items-center justify-between mb-2">
                <card.icon className={`w-6 h-6 text-${card.color}-400`} />
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-rose-500 transition" />
              </div>
              <span className="text-sm font-medium text-gray-700">{card.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Animation styles */}
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
        @keyframes glow {
          0%, 100% { filter: drop-shadow(0 0 10px rgba(244, 63, 94, 0.5)); }
          50% { filter: drop-shadow(0 0 20px rgba(244, 63, 94, 0.8)); }
        }
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default BondDashboard;