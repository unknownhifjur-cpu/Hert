import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Gift } from 'lucide-react';

const BondAnniversary = () => {
  // Dummy anniversary date – in real app would come from bondData
  const daysTogether = 127;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 pt-16 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center space-x-3 mb-6">
          <Link to="/bond/dashboard" className="p-2 text-gray-600 hover:text-rose-600 rounded-full hover:bg-rose-50 transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
            Anniversary & Milestones
          </h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Anniversary Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-100 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-rose-50 rounded-lg">
                <Calendar className="w-6 h-6 text-rose-500" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Next Anniversary</h2>
            </div>
            <p className="text-3xl font-bold text-rose-600 mb-2">127 days</p>
            <p className="text-gray-500">together and counting</p>
            <p className="text-sm text-gray-400 mt-4">Anniversary date: March 15, 2025</p>
          </div>

          {/* Milestone Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-100 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-rose-50 rounded-lg">
                <Gift className="w-6 h-6 text-rose-500" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Recent Milestone</h2>
            </div>
            <p className="text-xl font-medium text-gray-800 mb-2">100 Days Together</p>
            <p className="text-sm text-gray-400">Celebrated on February 5, 2025</p>
            <div className="mt-4 pt-4 border-t border-rose-100">
              <p className="text-xs text-gray-400">More achievements will appear here as you grow together.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BondAnniversary;