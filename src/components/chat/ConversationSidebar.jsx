import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Heart, ArrowLeft, X } from 'lucide-react';
import Avatar from './Avatar';
import api from '../../utils/api';

const ConversationSidebar = ({ currentUserId }) => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/chat/conversations/list');
      setConversations(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load conversations.');
    } finally {
      setLoading(false);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`${currentUserId ? 'hidden md:flex' : 'flex'} flex-col md:w-80 lg:w-96 w-full h-full`} style={{ background: '#f5f0fc' }}>
      {/* Header */}
      <div className="relative flex-shrink-0" style={{ minHeight: '200px' }}>
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #6d28d9 0%, #9333ea 50%, #db2777 100%)',
            borderRadius: '0 0 40px 0'
          }}
        />
        <div className="absolute top-4 right-16 w-16 h-16 rounded-full opacity-20" style={{ background: '#a855f7' }} />
        <div className="absolute top-12 right-6 w-10 h-10 rounded-full opacity-30" style={{ background: '#ec4899' }} />
        <div className="absolute bottom-8 left-8 w-8 h-8 rounded-full opacity-20" style={{ background: '#c084fc' }} />

        <div className="relative z-10 px-5 pt-5 pb-8">
          <div className="flex items-center justify-between mb-5">
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-full transition"
              style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white/40">
              {/* Current user avatar – can be added later */}
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Chat with friends</h1>
          <p className="text-purple-200 text-sm">{filteredConversations.length} conversations</p>
        </div>
      </div>

      {/* Online strip (static for now) */}
      {conversations.length > 0 && (
        <div className="px-4 pt-4 pb-2 flex-shrink-0">
          <div className="flex items-center gap-1 mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            <span className="text-xs font-semibold text-purple-700">Online</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center border-2 border-dashed border-purple-300 text-purple-400 hover:border-purple-500 transition">
              <Search className="w-4 h-4" />
            </button>
            {conversations.slice(0, 6).map(conv => (
              <Link key={conv.user._id} to={`/chat/${conv.user._id}`} className="flex-shrink-0">
                <Avatar src={conv.user.profilePic} name={conv.user.username} size="md" online />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="px-4 py-3 flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-9 py-2.5 rounded-xl text-sm outline-none border border-purple-100 focus:border-purple-400 transition"
            style={{ background: 'white', color: '#3b0764' }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 hover:text-purple-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Messages label */}
      <div className="px-4 mb-2 flex-shrink-0">
        <span className="text-sm font-bold text-purple-700">Messages</span>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {error ? (
          <div className="text-center py-10">
            <p className="text-red-500 text-sm mb-3">{error}</p>
            <button
              onClick={fetchConversations}
              className="px-4 py-2 bg-purple-600 text-white rounded-full text-sm hover:bg-purple-700"
            >
              Retry
            </button>
          </div>
        ) : loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin" />
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center py-14">
            <div className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: '#ede9fe' }}>
              <Heart className="w-7 h-7 text-purple-400" />
            </div>
            <p className="text-purple-500 text-sm">No conversations yet</p>
          </div>
        ) : (
          <ul className="space-y-1">
            {filteredConversations.map(conv => (
              <li key={conv.user._id}>
                <Link
                  to={`/chat/${conv.user._id}`}
                  className={`flex items-center gap-3 px-3 py-3 rounded-2xl transition-all group ${
                    currentUserId === conv.user._id ? 'shadow-sm' : 'hover:bg-purple-50'
                  }`}
                  style={currentUserId === conv.user._id ? { background: 'white' } : {}}
                >
                  <div className="relative">
                    <Avatar src={conv.user.profilePic} name={conv.user.username} size="md" />
                    {conv.unread && (
                      <span
                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ background: '#ef4444', fontSize: '9px' }}
                      >
                        {typeof conv.unread === 'number' ? conv.unread : ''}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <p className="font-semibold text-sm truncate" style={{ color: '#1e1b4b' }}>
                        {conv.user.username}
                      </p>
                      <span className="text-xs ml-2 flex-shrink-0" style={{ color: '#9ca3af' }}>
                        {formatTime(conv.lastTime)}
                      </span>
                    </div>
                    <p className={`text-xs truncate mt-0.5 ${conv.unread ? 'font-semibold text-gray-700' : 'text-gray-400'}`}>
                      {conv.lastMessage}
                    </p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition flex gap-1">
                    <button className="p-1.5 rounded-full hover:bg-purple-100">
                      <MoreVertical className="w-3.5 h-3.5 text-purple-400" />
                    </button>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default ConversationSidebar;