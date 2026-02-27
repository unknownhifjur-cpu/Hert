import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';
import io from 'socket.io-client';
import {
  Send, ArrowLeft, MoreVertical, Check, CheckCheck,
  Edit2, Trash2, X, CheckCircle
} from 'lucide-react';

const Chat = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [partner, setPartner] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [sending, setSending] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [showMessageMenu, setShowMessageMenu] = useState(null);
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const menuRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Socket connection
  useEffect(() => {
    if (!user) return;

    // Connect to Socket.io server
    socketRef.current = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000');

    // Join your own room
    socketRef.current.emit('join-chat', user._id);

    // Listen for typing events
    socketRef.current.on('typing', ({ userId: fromUserId, isTyping }) => {
      // Only show if the typing user is the current chat partner
      if (fromUserId === userId) {
        setPartnerTyping(isTyping);
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [user, userId]);

  // Emit typing status
  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    if (!socketRef.current || !userId) return;

    // Clear previous timeout
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    // Emit typing started
    socketRef.current.emit('typing', { room: userId, isTyping: true });

    // Set timeout to stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current.emit('typing', { room: userId, isTyping: false });
    }, 2000);
  };

  // Clear typing when message sent
  useEffect(() => {
    if (socketRef.current && userId && !newMessage.trim()) {
      socketRef.current.emit('typing', { room: userId, isTyping: false });
    }
  }, [newMessage]);

  // ... (rest of your existing functions: fetchMessages, sendMessage, etc.)

  // Modify sendMessage to stop typing
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !userId) return;
    // Stop typing before sending
    if (socketRef.current) {
      socketRef.current.emit('typing', { room: userId, isTyping: false });
    }
    setSending(true);
    try {
      const res = await api.post('/chat', {
        receiverId: userId,
        message: newMessage.trim()
      });
      setMessages([...messages, res.data]);
      setNewMessage('');
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  // ... (rest of your component remains the same)

  return (
    <div className="min-h-screen bg-rose-50 flex flex-col">
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-rose-100 p-4 flex items-center justify-between rounded-t-2xl mt-4">
          <div className="flex items-center space-x-3">
            <button onClick={() => navigate('/chat')} className="p-2 text-gray-600 hover:text-rose-600 rounded-full hover:bg-rose-50">
              <ArrowLeft className="w-5 h-5" />
            </button>
            {partner && (
              <>
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center text-white font-bold text-lg overflow-hidden">
                  {partner.profilePic ? (
                    <img src={partner.profilePic} alt={partner.username} className="w-full h-full object-cover" />
                  ) : (
                    partner.username?.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <h2 className="font-semibold text-gray-800">{partner.username}</h2>
                  {/* Optional: show "Typing..." when partner is typing */}
                  {partnerTyping && (
                    <p className="text-xs text-rose-500 animate-pulse">typing...</p>
                  )}
                </div>
              </>
            )}
          </div>
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowChatMenu(!showChatMenu)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-rose-50"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            {showChatMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-rose-100">
                <button onClick={clearChat} className="w-full text-left px-4 py-3 text-sm text-rose-600 hover:bg-rose-50">
                  <Trash2 className="w-4 h-4 inline mr-2" /> Clear chat
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Messages area (unchanged) */}
        {/* ... */}

        {/* Input area */}
        <form onSubmit={sendMessage} className="bg-white rounded-b-2xl shadow-sm border border-rose-100 p-3 mb-4">
          <div className="flex items-center space-x-2">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={handleTyping}  // use handleTyping instead of direct set
              placeholder="Type a message"
              className="flex-1 px-4 py-3 bg-rose-50 border border-rose-200 rounded-full focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition placeholder-gray-500"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="p-3 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition disabled:opacity-50"
            >
              {sending ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Chat;