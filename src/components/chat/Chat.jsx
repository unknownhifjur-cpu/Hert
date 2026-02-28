import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';
import {
  Send, ArrowLeft, MoreVertical, Check, CheckCheck,
  Edit2, Trash2, X, CheckCircle,
  Search, Heart, Lock
} from 'lucide-react';
import io from 'socket.io-client';

const Chat = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [partner, setPartner] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [editingMessage, setEditingMessage] = useState(null);
  const [showMessageMenu, setShowMessageMenu] = useState(null);
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const menuRef = useRef(null);
  const socketRef = useRef(null);

  // ---- Initial data fetching ----
  useEffect(() => {
    if (userId) fetchMessages(userId);
    else fetchConversations();
  }, [userId]);

  useEffect(() => {
    scrollToBottom();
    if (userId && inputRef.current) inputRef.current.focus();
  }, [messages, userId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMessageMenu(null);
        setShowChatMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ---- Socket.io connection & events ----
  useEffect(() => {
    if (!user || !userId) return;

    const token = localStorage.getItem('token');
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket']
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected');
      socket.emit('join-conversation', { partnerId: userId });
    });

    socket.on('new-message', (newMsg) => {
      setMessages(prev => {
        // Avoid duplicate messages (e.g., when sending from self)
        if (prev.some(msg => msg._id === newMsg._id)) return prev;
        return [...prev, newMsg];
      });
    });

    // Optional: handle typing indicators
    socket.on('user-typing', ({ userId: typingUserId, isTyping }) => {
      // You can add a "typing..." indicator here
    });

    return () => {
      socket.disconnect();
    };
  }, [user, userId]);

  // ---- Helper functions ----
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async (otherUserId) => {
    setLoading(true);
    try {
      const res = await api.get(`/chat/${otherUserId}`);
      setMessages(res.data);
      if (res.data.length > 0) {
        const partnerUser = res.data[0].sender._id === otherUserId ? res.data[0].sender : res.data[0].receiver;
        setPartner(partnerUser);
      } else {
        try {
          const userRes = await api.get(`/users/${otherUserId}`);
          setPartner(userRes.data);
        } catch (err) {
          console.error('Could not fetch partner info');
        }
      }
      await api.put(`/chat/read/${otherUserId}`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/chat/conversations/list');
      setConversations(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Send message via socket (no API call needed – server saves & broadcasts)
  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !userId || !socketRef.current) return;

    socketRef.current.emit('send-message', {
      receiverId: userId,
      message: newMessage.trim(),
      replyTo: replyingTo?._id
    });

    setNewMessage('');
    setReplyingTo(null);
  };

  const editMessage = async () => {
    if (!editingMessage || !editingMessage.text.trim()) return;
    try {
      const res = await api.put(`/chat/${editingMessage.id}`, {
        message: editingMessage.text.trim()
      });
      setMessages(prev =>
        prev.map(msg => (msg._id === editingMessage.id ? res.data : msg))
      );
      setEditingMessage(null);
      setShowMessageMenu(null);
    } catch (err) {
      console.error('Edit failed', err);
      alert(err.response?.data?.error || 'Failed to edit message');
    }
  };

  const unsendMessage = async (messageId) => {
    if (!window.confirm('Unsend this message?')) return;
    try {
      await api.delete(`/chat/${messageId}`);
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
      setShowMessageMenu(null);
    } catch (err) {
      console.error('Unsend failed', err);
      alert('Failed to unsend message');
    }
  };

  const clearChat = async () => {
    if (!userId || !window.confirm('Delete all messages in this conversation?')) return;
    try {
      await api.delete(`/chat/conversation/${userId}`);
      setMessages([]);
      setShowChatMenu(false);
    } catch (err) {
      console.error('Clear chat failed', err);
      alert('Failed to clear chat');
    }
  };

  const isMessageEditable = (msg) => {
    const isSender = msg.sender._id === user._id || msg.sender._id === user.id;
    if (!isSender) return false;
    const msgTime = new Date(msg.createdAt);
    const now = new Date();
    const diffMinutes = (now - msgTime) / (1000 * 60);
    return diffMinutes <= 5;
  };

  const groupMessagesByDate = () => {
    const groups = [];
    let currentDate = null;
    messages.forEach(msg => {
      const msgDate = new Date(msg.createdAt).toLocaleDateString();
      if (msgDate !== currentDate) {
        groups.push({ type: 'date', date: msgDate });
        currentDate = msgDate;
      }
      groups.push({ type: 'message', data: msg });
    });
    return groups;
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isToday = (dateString) => {
    const today = new Date().toLocaleDateString();
    return dateString === today;
  };

  const filteredConversations = conversations.filter(conv =>
    conv.user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ---- Render ----
  if (loading && !userId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin"></div>
          <Heart className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-rose-500 animate-pulse" />
        </div>
      </div>
    );
  }

  // Conversations list view
  if (!userId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50">
        {/* Sticky header with search */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-rose-100 pt-12 pb-3 px-4">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => navigate('/')}
                  className="p-2 text-gray-600 hover:text-rose-600 rounded-full hover:bg-rose-100 transition"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                  Heart Chats
                </h1>
              </div>
              <span className="text-sm text-rose-400 bg-rose-50 px-3 py-1 rounded-full">
                {filteredConversations.length} chats
              </span>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-rose-300" />
              </div>
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-3.5 bg-rose-50/50 border border-rose-100 rounded-xl text-sm focus:ring-2 focus:ring-rose-300 focus:bg-white transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-3 flex items-center text-rose-400 hover:text-rose-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {searchQuery && (
              <div className="mt-2 text-xs text-rose-400">
                Found {filteredConversations.length} {filteredConversations.length === 1 ? 'chat' : 'chats'}
              </div>
            )}
          </div>
        </div>

        {/* Conversations list */}
        <div className="px-4 pb-20">
          <div className="max-w-2xl mx-auto mt-4">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-16 bg-white/60 backdrop-blur-sm rounded-3xl shadow-lg border border-rose-100 animate-fadeIn">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <div className="absolute inset-0 bg-rose-100 rounded-full animate-pulse"></div>
                  <Heart className="relative w-12 h-12 text-rose-400 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="text-gray-600 text-lg mb-2">No conversations yet</p>
                <p className="text-gray-400">
                  {searchQuery ? 'Try a different search term' : 'Start a new conversation'}
                </p>
              </div>
            ) : (
              <ul className="space-y-3 animate-fadeIn">
                {filteredConversations.map(conv => (
                  <li key={conv.user._id}>
                    <Link
                      to={`/chat/${conv.user._id}`}
                      className="flex items-center space-x-4 p-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition-all border border-rose-100 hover:border-rose-300 group"
                    >
                      <div className="relative">
                        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-bold text-xl overflow-hidden shadow-md">
                          {conv.user.profilePic ? (
                            <img src={conv.user.profilePic} alt={conv.user.username} className="w-full h-full object-cover" />
                          ) : (
                            conv.user.username.charAt(0).toUpperCase()
                          )}
                        </div>
                        {conv.unread && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 border-2 border-white rounded-full flex items-center justify-center">
                            <span className="text-[10px] text-white font-bold">!</span>
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <p className="font-semibold text-gray-800 group-hover:text-rose-600 transition truncate">
                            {conv.user.username}
                          </p>
                          <span className="text-xs text-rose-400 ml-2 flex-shrink-0">
                            {formatMessageTime(conv.lastTime)}
                          </span>
                        </div>
                        <p className={`text-sm truncate mt-1 ${conv.unread ? 'text-gray-800 font-medium' : 'text-rose-400'}`}>
                          {conv.lastMessage}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-pink-50">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin"></div>
          <Heart className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-rose-500 animate-pulse" />
        </div>
      </div>
    );
  }

  const groupedMessages = groupMessagesByDate();

  return (
    <div className="h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex flex-col">
      {/* Sticky header with clear chat button */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-sm border-b border-rose-100 shadow-sm">
        <div className="max-w-3xl mx-auto w-full px-4">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/chat')}
                className="p-2 text-gray-600 hover:text-rose-600 rounded-full hover:bg-rose-50 transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              {partner && (
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-bold text-lg overflow-hidden shadow-md">
                      {partner.profilePic ? (
                        <img src={partner.profilePic} alt={partner.username} className="w-full h-full object-cover" />
                      ) : (
                        partner.username?.charAt(0).toUpperCase()
                      )}
                    </div>
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-800">{partner.username}</h2>
                  </div>
                </div>
              )}
            </div>
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowChatMenu(!showChatMenu)}
                className="p-2 text-gray-600 hover:text-rose-600 rounded-full hover:bg-rose-50 transition"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
              {showChatMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-rose-100 overflow-hidden z-30">
                  <button
                    onClick={clearChat}
                    className="w-full text-left px-4 py-3 text-sm text-rose-600 hover:bg-rose-50 transition flex items-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Clear chat</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages area with subtle heart pattern */}
      <div className="flex-1 overflow-y-auto px-4 py-6" style={{ backgroundImage: 'radial-gradient(circle at 10px 10px, rgba(244, 63, 94, 0.05) 2px, transparent 0)', backgroundSize: '30px 30px' }}>
        <div className="max-w-3xl mx-auto">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="relative mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-rose-100 to-pink-100 rounded-3xl rotate-12 shadow-inner flex items-center justify-center">
                  <Heart className="w-12 h-12 text-rose-400" fill="#fda4af" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center">
                  <Lock className="w-5 h-5 text-rose-500" />
                </div>
              </div>
              <p className="text-gray-700 text-lg font-medium mb-2">Secure Conversation</p>
              <p className="text-gray-500 max-w-xs">
                Your messages are end-to-end encrypted. Say something to start the conversation!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {groupedMessages.map((item, index) => {
                if (item.type === 'date') {
                  return (
                    <div key={`date-${index}`} className="flex justify-center my-4">
                      <span className="px-4 py-1.5 bg-white/70 backdrop-blur-sm text-rose-500 text-xs rounded-full shadow-sm border border-rose-100">
                        {isToday(item.date) ? 'Today' : item.date}
                      </span>
                    </div>
                  );
                }
                const msg = item.data;
                const isMe = msg.sender._id === user._id || msg.sender._id === user.id;
                const editable = isMe && isMessageEditable(msg);

                return (
                  <div
                    key={msg._id}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fadeIn group`}
                  >
                    {!isMe && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex-shrink-0 mr-2 mt-1 overflow-hidden">
                        {partner?.profilePic ? (
                          <img src={partner.profilePic} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white text-xs">
                            {partner?.username?.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    )}

                    {editingMessage && editingMessage.id === msg._id ? (
                      <div className="max-w-[70%] w-full bg-white border-2 border-rose-200 rounded-2xl p-3 shadow-lg">
                        <textarea
                          value={editingMessage.text}
                          onChange={(e) => setEditingMessage({ ...editingMessage, text: e.target.value })}
                          className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-200 focus:border-rose-400 resize-none"
                          rows="2"
                          autoFocus
                        />
                        <div className="flex justify-end space-x-2 mt-2">
                          <button
                            onClick={() => setEditingMessage(null)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <button
                            onClick={editMessage}
                            className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-full transition"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className={`flex flex-col max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                          {msg.replyTo && (
                            <div className="mb-1 px-3 py-1 bg-rose-50 rounded-lg text-xs text-rose-600 max-w-[200px] truncate border border-rose-100">
                              ↪ Replying to: {msg.replyTo.message}
                            </div>
                          )}
                          <div
                            className={`relative px-4 py-3 rounded-2xl shadow-sm ${
                              isMe
                                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-br-none'
                                : 'bg-white text-gray-800 rounded-bl-none border border-rose-100'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                              {msg.message}
                            </p>
                            <div className={`flex items-center justify-end space-x-1 mt-1 text-xs ${isMe ? 'text-rose-200' : 'text-rose-400'}`}>
                              <span>{formatMessageTime(msg.createdAt)}</span>
                              {isMe && (
                                <span>
                                  {msg.read ? (
                                    <CheckCheck className="w-3.5 h-3.5" />
                                  ) : (
                                    <Check className="w-3.5 h-3.5" />
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Message menu */}
                        {isMe && (
                          <div className="relative ml-2 self-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => setShowMessageMenu(showMessageMenu === msg._id ? null : msg._id)}
                              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-white/50"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            {showMessageMenu === msg._id && (
                              <div className="absolute right-0 mt-1 w-36 bg-white rounded-xl shadow-lg border border-rose-100 overflow-hidden z-10">
                                {editable && (
                                  <button
                                    onClick={() => {
                                      setEditingMessage({ id: msg._id, text: msg.message });
                                      setShowMessageMenu(null);
                                    }}
                                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-rose-50 transition flex items-center space-x-2"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                    <span>Edit</span>
                                  </button>
                                )}
                                <button
                                  onClick={() => unsendMessage(msg._id)}
                                  className="w-full text-left px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition flex items-center space-x-2"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Unsend</span>
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Reply indicator */}
      {replyingTo && (
        <div className="max-w-3xl mx-auto w-full px-4 mb-2">
          <div className="bg-white/80 backdrop-blur-sm border border-rose-200 rounded-xl p-2 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-rose-500">↪ Replying</span>
              <span className="text-sm text-gray-600 truncate max-w-[200px]">{replyingTo.message}</span>
            </div>
            <button
              onClick={() => setReplyingTo(null)}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="max-w-3xl mx-auto w-full px-4 pb-4">
        <form onSubmit={sendMessage} className="relative">
          <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm border border-rose-200 rounded-full shadow-lg hover:shadow-xl transition-shadow px-2">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a secure message..."
              className="flex-1 py-3 px-3 bg-transparent focus:outline-none text-gray-700 placeholder-rose-300"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="p-2.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full hover:from-rose-600 hover:to-pink-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>

        {/* Encryption notice */}
        <div className="flex items-center justify-center space-x-1 mt-2">
          <Lock className="w-3 h-3 text-rose-300" />
          <p className="text-xs text-rose-300">End-to-end encrypted</p>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Chat;