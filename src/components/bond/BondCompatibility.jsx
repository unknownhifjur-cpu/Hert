import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Award } from 'lucide-react';

const BondCompatibility = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 pt-16 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center space-x-3 mb-6">
          <Link to="/bond/dashboard" className="p-2 text-gray-600 hover:text-rose-600 rounded-full hover:bg-rose-50 transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
            Compatibility Insights
          </h1>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-100 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-rose-50 rounded-lg">
              <Award className="w-6 h-6 text-rose-500" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Compatibility Score</h2>
          </div>
          <div className="flex justify-center mb-4">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-rose-200"></div>
              <div className="absolute inset-0 rounded-full border-4 border-rose-500" style={{ clipPath: 'inset(0 0 0 0)' }}></div>
              <span className="text-3xl font-bold text-rose-600">85%</span>
            </div>
          </div>
          <p className="text-center text-gray-600">Based on your memories, goals, and interactions.</p>
          <p className="text-sm text-gray-400 text-center mt-2">More detailed analysis coming soon.</p>
        </div>
      </div>
    </div>
  );
};

export default BondCompatibility;