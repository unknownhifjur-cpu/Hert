import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BarChart3 } from 'lucide-react';

const BondMoodTracker = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 pt-16 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center space-x-3 mb-6">
          <Link to="/bond/dashboard" className="p-2 text-gray-600 hover:text-rose-600 rounded-full hover:bg-rose-50 transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
            Mood Tracker
          </h1>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-100 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-rose-50 rounded-lg">
              <BarChart3 className="w-6 h-6 text-rose-500" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Weekly Mood Overview</h2>
          </div>
          <p className="text-gray-500 mb-4">Track your emotional journey together. Coming soon!</p>
          <div className="h-40 bg-rose-50/50 rounded-lg flex items-center justify-center border border-rose-100">
            <span className="text-rose-400">📊 Mood graph placeholder</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BondMoodTracker;