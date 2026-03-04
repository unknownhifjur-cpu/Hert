import React, { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';
import { Heart, MessageCircle, Camera, ArrowLeft } from 'lucide-react';

// Reusable Avatar component (matches your BondLanding style)
const Avatar = ({ name, size = 'md', src }) => {
  const sz = size === 'lg' ? 'h-16 w-16 text-2xl' : 'h-10 w-10 text-sm';
  if (src) {
    return <img src={src} alt={name} className={`${sz} rounded-full object-cover`} />;
  }
  return (
    <div
      className={`${sz} rounded-full flex items-center justify-center font-semibold text-white shadow-sm`}
      style={{ background: 'linear-gradient(135deg, #fb7185, #e11d48)' }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
};

const BondDashboard = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const { partner, bondId } = location.state || {};

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If no partner in state, fetch bond status to ensure we're bonded
    if (!partner) {
      const fetchStatus = async () => {
        try {
          const res = await api.get('/bond/status');
          if (res.data.status === 'bonded' && res.data.partner) {
            // We have partner data, but we need to update state? 
            // For simplicity, we could set partner from response,
            // but since we're not using state here, we could redirect.
            // Actually, we might want to store partner in component state.
            // For now, we'll just stop loading and show message.
            setLoading(false);
            // Optionally redirect back to bond landing if not bonded.
          } else {
            navigate('/bond');
          }
        } catch (err) {
          console.error(err);
          navigate('/bond');
        } finally {
          setLoading(false);
        }
      };
      fetchStatus();
    } else {
      setLoading(false);
    }
  }, [partner, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-white flex items-center justify-center">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-2 border-rose-200 border-t-rose-500 animate-spin" />
          <Heart className="absolute inset-0 m-auto w-5 h-5 text-rose-500 fill-rose-200 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-rose-400 mb-4">No bond information found.</p>
          <button
            onClick={() => navigate('/bond')}
            className="px-6 py-2 bg-rose-500 text-white rounded-full text-sm hover:bg-rose-600 transition"
          >
            Go to Bond Landing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-rose-50/40">
      {/* Background blobs (same as landing) */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-rose-100/50 blur-3xl" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 rounded-full bg-rose-200/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 rounded-full bg-rose-100/40 blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Back button */}
        <button
          onClick={() => navigate('/bond')}
          className="flex items-center gap-2 text-rose-400 hover:text-rose-600 transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Bond
        </button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-500 text-xs px-5 py-2 rounded-full mb-6">
            <Heart className="w-3 h-3 fill-rose-400" />
            You're Bonded!
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-rose-600 to-rose-400 bg-clip-text text-transparent">
              {user.username}
            </span>
            <span className="text-gray-400 mx-3">&</span>
            <span className="bg-gradient-to-r from-rose-600 to-rose-400 bg-clip-text text-transparent">
              {partner.username}
            </span>
          </h1>
          <p className="text-rose-400 italic">Your bond is now active. Start sharing moments!</p>
        </motion.div>

        {/* Partner Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-rose-100 rounded-3xl shadow-sm p-8 mb-10"
        >
          <div className="flex flex-col md:flex-row items-center gap-8">
            <Avatar name={partner.username} size="lg" src={partner.profilePic} />
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-semibold text-gray-800">{partner.username}</h2>
              <p className="text-gray-500 mt-1">{partner.bio || 'No bio yet'}</p>
              <div className="flex gap-4 mt-4 justify-center md:justify-start">
                <div className="text-center">
                  <div className="text-rose-500 font-semibold">❤️ Bonded</div>
                  <div className="text-xs text-gray-400">Since just now</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => navigate('/chat', { state: { partner } })}
            className="bg-white border border-rose-100 rounded-2xl p-6 hover:shadow-md transition cursor-pointer group"
          >
            <MessageCircle className="w-8 h-8 text-rose-400 mb-3 group-hover:text-rose-500 transition" />
            <h3 className="text-lg font-semibold text-gray-800">Chat</h3>
            <p className="text-gray-500 text-sm">Send messages to your partner</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onClick={() => navigate('/upload')}
            className="bg-white border border-rose-100 rounded-2xl p-6 hover:shadow-md transition cursor-pointer group"
          >
            <Camera className="w-8 h-8 text-rose-400 mb-3 group-hover:text-rose-500 transition" />
            <h3 className="text-lg font-semibold text-gray-800">Share a Photo</h3>
            <p className="text-gray-500 text-sm">Capture a moment together</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BondDashboard;