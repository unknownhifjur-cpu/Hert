import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, Users } from 'lucide-react';

const BondPrivacy = () => {
  const [visibility, setVisibility] = useState('private'); // 'private', 'friends', 'public'

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 pt-16 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center space-x-3 mb-6">
          <Link to="/bond/dashboard" className="p-2 text-gray-600 hover:text-rose-600 rounded-full hover:bg-rose-50 transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
            Privacy & Security
          </h1>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-100 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-rose-50 rounded-lg">
              <Shield className="w-6 h-6 text-rose-500" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Relationship Visibility</h2>
          </div>

          <div className="space-y-3">
            <label className="flex items-center p-3 bg-rose-50/50 rounded-lg cursor-pointer">
              <input
                type="radio"
                name="visibility"
                value="private"
                checked={visibility === 'private'}
                onChange={() => setVisibility('private')}
                className="mr-3 text-rose-500 focus:ring-rose-200"
              />
              <div>
                <span className="font-medium text-gray-800 flex items-center">
                  <Lock className="w-4 h-4 mr-1 text-rose-500" />
                  Private
                </span>
                <p className="text-xs text-gray-500">Only visible to you and your partner</p>
              </div>
            </label>

            <label className="flex items-center p-3 bg-rose-50/50 rounded-lg cursor-pointer">
              <input
                type="radio"
                name="visibility"
                value="friends"
                checked={visibility === 'friends'}
                onChange={() => setVisibility('friends')}
                className="mr-3 text-rose-500 focus:ring-rose-200"
              />
              <div>
                <span className="font-medium text-gray-800 flex items-center">
                  <Users className="w-4 h-4 mr-1 text-rose-500" />
                  Friends
                </span>
                <p className="text-xs text-gray-500">Visible to friends (coming soon)</p>
              </div>
            </label>

            <label className="flex items-center p-3 bg-rose-50/50 rounded-lg cursor-pointer">
              <input
                type="radio"
                name="visibility"
                value="public"
                checked={visibility === 'public'}
                onChange={() => setVisibility('public')}
                className="mr-3 text-rose-500 focus:ring-rose-200"
              />
              <div>
                <span className="font-medium text-gray-800 flex items-center">
                  <Eye className="w-4 h-4 mr-1 text-rose-500" />
                  Public
                </span>
                <p className="text-xs text-gray-500">Visible to everyone (not recommended)</p>
              </div>
            </label>
          </div>

          <div className="mt-6 pt-4 border-t border-rose-100">
            <h3 className="text-sm font-medium text-gray-800 mb-2">Immutable Records</h3>
            <p className="text-xs text-gray-500 mb-2">
              ⚠️ Historical data (memories, diary entries) cannot be edited after 30 days. This ensures the integrity of your shared history.
            </p>
            <div className="bg-amber-50/50 p-3 rounded-lg">
              <p className="text-xs text-amber-600">You can request data deletion at any time through support.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BondPrivacy;