import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Video, MoreVertical, Trash2 } from 'lucide-react';
import Avatar from './Avatar';

const ChatHeader = ({ partner, isOnline, partnerNotFound, onClearChat }) => {
  const navigate = useNavigate();
  const [showChatMenu, setShowChatMenu] = useState(false);
  const menuRef = useRef();

  return (
    <div className="flex-shrink-0 px-5 py-4 flex items-center justify-between border-b" style={{ background: 'white', borderColor: '#f3f4f6' }}>
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/chat')}
          className="p-2 rounded-full hover:bg-purple-50 transition md:hidden"
        >
          <ArrowLeft className="w-5 h-5 text-purple-600" />
        </button>

        {partnerNotFound ? (
          <>
            <div className="w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500 font-bold">?</span>
            </div>
            <div>
              <h2 className="font-bold text-base text-gray-500">User not available</h2>
              <p className="text-xs text-gray-400">Account may have been deleted</p>
            </div>
          </>
        ) : partner ? (
          <>
            <Avatar src={partner.profilePic} name={partner.username} size="md" online={isOnline} />
            <div>
              <h2 className="font-bold text-base" style={{ color: '#5b21b6' }}>{partner.username}</h2>
              <p className="text-xs" style={{ color: isOnline ? '#10b981' : '#9ca3af' }}>
                {isOnline ? 'online' : 'offline'}
              </p>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gray-200 animate-pulse" />
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          className="w-9 h-9 rounded-full flex items-center justify-center transition hover:opacity-80"
          style={{ background: '#ede9fe', color: '#7c3aed' }}
        >
          <Phone className="w-4 h-4" />
        </button>
        <button
          className="w-9 h-9 rounded-full flex items-center justify-center transition hover:opacity-80"
          style={{ background: '#ede9fe', color: '#7c3aed' }}
        >
          <Video className="w-4 h-4" />
        </button>
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowChatMenu(!showChatMenu)}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition"
          >
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </button>
          {showChatMenu && (
            <div className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-30">
              <button
                onClick={() => { onClearChat(); setShowChatMenu(false); }}
                className="w-full text-left px-4 py-3 text-sm flex items-center gap-2 hover:bg-red-50 text-red-500 transition"
              >
                <Trash2 className="w-4 h-4" />
                Clear chat
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;