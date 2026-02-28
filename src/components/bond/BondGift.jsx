import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Gift, Heart, Star, Sparkles } from 'lucide-react';

const BondGift = () => {
  const dummyGifts = [
    { id: 1, icon: Heart, name: 'Heart', color: 'rose' },
    { id: 2, icon: Star, name: 'Star', color: 'amber' },
    { id: 3, icon: Sparkles, name: 'Sparkle', color: 'purple' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 pt-16 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center space-x-3 mb-6">
          <Link to="/bond/dashboard" className="p-2 text-gray-600 hover:text-rose-600 rounded-full hover:bg-rose-50 transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
            Gift System
          </h1>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-100 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-rose-50 rounded-lg">
              <Gift className="w-6 h-6 text-rose-500" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Send a Virtual Gift</h2>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            {dummyGifts.map(gift => (
              <button
                key={gift.id}
                className="p-4 bg-rose-50/50 rounded-xl hover:bg-rose-100 transition flex flex-col items-center space-y-2"
              >
                <gift.icon className={`w-8 h-8 text-${gift.color}-500`} />
                <span className="text-xs text-gray-600">{gift.name}</span>
              </button>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-rose-100">
            <h3 className="text-sm font-medium text-gray-800 mb-2">Gift History</h3>
            <p className="text-sm text-gray-500 italic">No gifts sent yet. Surprise your partner!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BondGift;