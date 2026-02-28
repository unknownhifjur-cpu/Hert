import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Camera, BookOpen, Target, CheckCircle } from 'lucide-react';
import api from '../../utils/api';

const BondTimeline = () => {
  const [bondData, setBondData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/bond/shared')
      .then(res => setBondData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!bondData) return <div>Error</div>;

  // Combine and sort all items by date
  const allItems = [
    ...(bondData.memories || []).map(m => ({ ...m, type: 'memory' })),
    ...(bondData.diaryEntries || []).map(d => ({ ...d, type: 'diary' })),
    ...(bondData.goals || []).map(g => ({ ...g, type: 'goal' })),
    ...(bondData.commitments || []).map(c => ({ ...c, type: 'commitment' }))
  ].sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));

  const getIcon = (type) => {
    switch (type) {
      case 'memory': return <Camera className="w-4 h-4 text-rose-500" />;
      case 'diary': return <BookOpen className="w-4 h-4 text-pink-500" />;
      case 'goal': return <Target className="w-4 h-4 text-emerald-500" />;
      case 'commitment': return <CheckCircle className="w-4 h-4 text-purple-500" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 pt-16 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center space-x-3 mb-6">
          <Link to="/bond/dashboard" className="p-2 text-gray-600 hover:text-rose-600 rounded-full hover:bg-rose-50 transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
            Timeline
          </h1>
        </div>

        <div className="space-y-4">
          {allItems.map((item, idx) => (
            <div key={idx} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-rose-100 flex items-start space-x-3">
              <div className="p-2 bg-rose-50 rounded-lg">{getIcon(item.type)}</div>
              <div className="flex-1">
                <p className="text-gray-800">{item.text || item.message}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(item.date || item.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BondTimeline;