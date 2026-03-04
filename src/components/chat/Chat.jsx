import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';
import {
  Send, ArrowLeft, MoreVertical, Check, CheckCheck,
  Edit2, Trash2, X, CheckCircle,
  Search, Heart, Lock, Phone, Video, Mic, Plus
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
  const [isPartnerOnline, setIsPartnerOnline] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [partnerNotFound, setPartnerNotFound] = useState(false);
  const [conversationsError, setConversationsError] = useState(null);
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const menuRef = useRef(null);
  const socketRef = useRef(null);

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

  useEffect(() => {
    if (!user || !userId) return;
    const token = localStorage.getItem('token');
    const socket = io(import.meta.env.VITE_API_URL || 'https://hert-backend.onrender.com', {
      auth: { token },
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join-conversation', { partnerId: userId });
    });
    socket.on('new-message', (newMsg) => {
      setMessages(prev => {
        if (prev.some(msg => msg._id === newMsg._id)) return prev;
        return [...prev, newMsg];
      });
    });
    socket.on('user-online', (onlineUserId) => {
      if (onlineUserId === userId) setIsPartnerOnline(true);
    });
    socket.on('user-offline', (offlineUserId) => {
      if (offlineUserId === userId) setIsPartnerOnline(false);
    });
    socket.on('user-typing', ({ userId: typingUserId, isTyping }) => {
      if (typingUserId === userId) setPartnerTyping(isTyping);
    });
    socket.on('messages-read', ({ readerId }) => {
      if (readerId === userId) {
        setMessages(prev => prev.map(msg =>
          msg.sender._id === user._id ? { ...msg, read: true } : msg
        ));
      }
    });
    return () => socket.disconnect();
  }, [user, userId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async (otherUserId) => {
    setLoading(true);
    setPartnerNotFound(false);
    try {
      const res = await api.get(`/chat/${otherUserId}`);
      setMessages(res.data);
      if (res.data.length > 0) {
        const partnerUser = res.data[0].sender._id === otherUserId ? res.data[0].sender : res.data[0].receiver;
        setPartner(partnerUser);
      } else {
        try {
          const userRes = await api.get(`/users/id/${otherUserId}`);
          setPartner(userRes.data);
        } catch (err) {
          if (err.response?.status === 404) {
            setPartnerNotFound(true);
          } else {
            console.error(err);
          }
        }
      }
      await api.put(`/chat/read/${otherUserId}`);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 404) {
        setPartnerNotFound(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchConversations = async () => {
    setLoading(true);
    setConversationsError(null);
    try {
      const res = await api.get('/chat/conversations/list');
      setConversations(res.data);
    } catch (err) {
      console.error(err);
      setConversationsError('Failed to load conversations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !userId || !socketRef.current || partnerNotFound) return;
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      socketRef.current.emit('typing', { partnerId: userId, isTyping: false });
    }
    socketRef.current.emit('send-message', {
      receiverId: userId,
      message: newMessage.trim(),
      replyTo: replyingTo?._id
    });
    setNewMessage('');
    setReplyingTo(null);
  };

  const handleTyping = () => {
    if (!socketRef.current || partnerNotFound) return;
    socketRef.current.emit('typing', { partnerId: userId, isTyping: true });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current.emit('typing', { partnerId: userId, isTyping: false });
    }, 2000);
  };

  const editMessage = async () => {
    if (!editingMessage || !editingMessage.text.trim()) return;
    try {
      const res = await api.put(`/chat/${editingMessage.id}`, { message: editingMessage.text.trim() });
      setMessages(prev => prev.map(msg => (msg._id === editingMessage.id ? res.data : msg)));
      setEditingMessage(null);
      setShowMessageMenu(null);
    } catch (err) {
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
      alert('Failed to clear chat');
    }
  };

  const isMessageEditable = (msg) => {
    const isSender = msg.sender._id === user._id || msg.sender._id === user.id;
    if (!isSender) return false;
    const diffMinutes = (new Date() - new Date(msg.createdAt)) / (1000 * 60);
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
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isToday = (dateString) => dateString === new Date().toLocaleDateString();

  const filteredConversations = conversations.filter(conv =>
    conv.user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const Avatar = ({ src, name, size = 'md', online = false }) => {
    const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-11 h-11 text-sm', lg: 'w-14 h-14 text-base' };
    return (
      <div className="relative shrink-0">
        <div className={`${sizes[size]} rounded-full overflow-hidden flex items-center justify-center font-bold text-white`}
          style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}>
          {src ? <img src={src} alt={name} className="w-full h-full object-cover" /> : name?.charAt(0).toUpperCase()}
        </div>
        {online && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full" />}
      </div>
    );
  };

  if (loading && !userId) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#e8e0f5' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin" />
          <p className="text-purple-600 font-medium text-sm">Loading chats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden" style={{ background: '#e8e0f5', fontFamily: "'Nunito', 'Segoe UI', sans-serif" }}>

      {/* ── LEFT SIDEBAR ── */}
      <div className={`${userId ? 'hidden md:flex' : 'flex'} flex-col md:w-80 lg:w-96 w-full h-full`}
        style={{ background: '#f5f0fc' }}>

        {/* Purple wave header */}
        <div className="relative flex-shrink-0" style={{ minHeight: '200px' }}>
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(135deg, #6d28d9 0%, #9333ea 50%, #db2777 100%)',
            borderRadius: '0 0 40px 0'
          }} />
          <div className="absolute top-4 right-16 w-16 h-16 rounded-full opacity-20" style={{ background: '#a855f7' }} />
          <div className="absolute top-12 right-6 w-10 h-10 rounded-full opacity-30" style={{ background: '#ec4899' }} />
          <div className="absolute bottom-8 left-8 w-8 h-8 rounded-full opacity-20" style={{ background: '#c084fc' }} />

          <div className="relative z-10 px-5 pt-5 pb-8">
            <div className="flex items-center justify-between mb-5">
              <button onClick={() => navigate('/')}
                className="p-2 rounded-full transition"
                style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}>
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white/40">
                {user?.profilePic
                  ? <img src={user.profilePic} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-purple-300 flex items-center justify-center text-white text-sm font-bold">
                      {user?.username?.charAt(0).toUpperCase()}
                    </div>}
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Chat with friends</h1>
            <p className="text-purple-200 text-sm">{filteredConversations.length} conversations</p>
          </div>
        </div>

        {/* Online users strip */}
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
              <button onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 hover:text-purple-600">
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
          {conversationsError ? (
            <div className="text-center py-10">
              <p className="text-red-500 text-sm mb-3">{conversationsError}</p>
              <button
                onClick={fetchConversations}
                className="px-4 py-2 bg-purple-600 text-white rounded-full text-sm hover:bg-purple-700 transition"
              >
                Retry
              </button>
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
                  <Link to={`/chat/${conv.user._id}`}
                    className={`flex items-center gap-3 px-3 py-3 rounded-2xl transition-all group ${
                      userId === conv.user._id ? 'shadow-sm' : 'hover:bg-purple-50'
                    }`}
                    style={userId === conv.user._id ? { background: 'white' } : {}}>
                    <div className="relative">
                      <Avatar src={conv.user.profilePic} name={conv.user.username} size="md" />
                      {conv.unread && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-white text-xs font-bold"
                          style={{ background: '#ef4444', fontSize: '9px' }}>
                          {typeof conv.unread === 'number' ? conv.unread : ''}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <p className="font-semibold text-sm truncate" style={{ color: '#1e1b4b' }}>{conv.user.username}</p>
                        <span className="text-xs ml-2 flex-shrink-0" style={{ color: '#9ca3af' }}>
                          {formatMessageTime(conv.lastTime)}
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
      </div>

      {/* ── RIGHT: CHAT AREA ── */}
      {userId ? (
        <div className="flex-1 h-full flex flex-col overflow-hidden" style={{ background: 'white' }}>

          {/* Chat header */}
          <div className="flex-shrink-0 px-5 py-4 flex items-center justify-between border-b"
            style={{ background: 'white', borderColor: '#f3f4f6' }}>
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/chat')}
                className="p-2 rounded-full hover:bg-purple-50 transition md:hidden">
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
                  <Avatar src={partner.profilePic} name={partner.username} size="md" online={isPartnerOnline} />
                  <div>
                    <h2 className="font-bold text-base" style={{ color: '#5b21b6' }}>{partner.username}</h2>
                    <p className="text-xs" style={{ color: isPartnerOnline ? '#10b981' : '#9ca3af' }}>
                      {partnerTyping ? 'typing...' : isPartnerOnline ? 'online' : 'offline'}
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
              <button className="w-9 h-9 rounded-full flex items-center justify-center transition hover:opacity-80"
                style={{ background: '#ede9fe', color: '#7c3aed' }}>
                <Phone className="w-4 h-4" />
              </button>
              <button className="w-9 h-9 rounded-full flex items-center justify-center transition hover:opacity-80"
                style={{ background: '#ede9fe', color: '#7c3aed' }}>
                <Video className="w-4 h-4" />
              </button>
              <div className="relative" ref={menuRef}>
                <button onClick={() => setShowChatMenu(!showChatMenu)}
                  className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition">
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </button>
                {showChatMenu && (
                  <div className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-30">
                    <button onClick={clearChat}
                      className="w-full text-left px-4 py-3 text-sm flex items-center gap-2 hover:bg-red-50 text-red-500 transition">
                      <Trash2 className="w-4 h-4" />
                      Clear chat
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden px-5 py-4"
            style={{ background: '#fafafa' }}>
            <div className="max-w-2xl mx-auto">
              {loading ? (
                <div className="flex justify-center pt-10">
                  <div className="w-8 h-8 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin" />
                </div>
              ) : partnerNotFound ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <div className="w-16 h-16 rounded-2xl rotate-12 mb-4 flex items-center justify-center bg-gray-100">
                    <Lock className="w-7 h-7 text-gray-400" />
                  </div>
                  <p className="font-semibold text-gray-600 mb-1">This user is no longer available</p>
                  <p className="text-sm text-gray-400">You cannot send messages to a deleted account.</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <div className="w-16 h-16 rounded-2xl rotate-12 mb-4 flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #ede9fe, #fce7f3)' }}>
                    <Lock className="w-7 h-7" style={{ color: '#9333ea' }} />
                  </div>
                  <p className="font-semibold text-gray-600 mb-1">End-to-end encrypted</p>
                  <p className="text-sm text-gray-400">Say something to start the conversation!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {groupMessagesByDate().map((item, index) => {
                    if (item.type === 'date') {
                      return (
                        <div key={`date-${index}`} className="flex justify-center my-4">
                          <span className="px-4 py-1 text-xs rounded-full font-medium"
                            style={{ background: '#f3f4f6', color: '#9ca3af' }}>
                            {isToday(item.date) ? 'Today' : item.date}
                          </span>
                        </div>
                      );
                    }
                    const msg = item.data;
                    const isMe = msg.sender._id === user._id || msg.sender._id === user.id;
                    const editable = isMe && isMessageEditable(msg);

                    return (
                      <div key={msg._id} className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'} group`}>
                        {!isMe && (
                          <Avatar src={partner?.profilePic} name={partner?.username} size="sm" />
                        )}

                        {editingMessage && editingMessage.id === msg._id ? (
                          <div className="max-w-[65%] w-full bg-white border-2 border-purple-200 rounded-2xl p-3 shadow-lg">
                            <textarea
                              value={editingMessage.text}
                              onChange={e => setEditingMessage({ ...editingMessage, text: e.target.value })}
                              className="w-full p-2 border border-purple-100 rounded-xl text-sm focus:ring-2 focus:ring-purple-200 resize-none outline-none"
                              rows="2" autoFocus
                            />
                            <div className="flex justify-end gap-2 mt-2">
                              <button onClick={() => setEditingMessage(null)}
                                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition">
                                <X className="w-4 h-4" />
                              </button>
                              <button onClick={editMessage}
                                className="p-1.5 rounded-full transition"
                                style={{ color: '#9333ea', background: '#ede9fe' }}>
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className={`flex flex-col max-w-[65%] ${isMe ? 'items-end' : 'items-start'}`}>
                              {msg.replyTo && (
                                <div className="mb-1 px-3 py-1 rounded-lg text-xs max-w-[200px] truncate border"
                                  style={{ background: '#f5f3ff', color: '#7c3aed', borderColor: '#ddd6fe' }}>
                                  ↪ {msg.replyTo.message}
                                </div>
                              )}
                              <div className={`px-4 py-2.5 rounded-2xl shadow-sm ${
                                isMe ? 'rounded-br-md' : 'rounded-bl-md'
                              }`}
                                style={isMe
                                  ? { background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: 'white' }
                                  : { background: '#f3f4f6', color: '#1f2937' }}>
                                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.message}</p>
                                <div className={`flex items-center gap-1 mt-1 text-xs ${isMe ? 'text-purple-200 justify-end' : 'text-gray-400'}`}>
                                  <span>✓ {formatMessageTime(msg.createdAt)}</span>
                                  {isMe && msg.read && <CheckCheck className="w-3 h-3" />}
                                </div>
                              </div>
                            </div>

                            {isMe && (
                              <div className="relative self-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => setShowMessageMenu(showMessageMenu === msg._id ? null : msg._id)}
                                  className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                                  <MoreVertical className="w-3.5 h-3.5" />
                                </button>
                                {showMessageMenu === msg._id && (
                                  <div className="absolute right-0 bottom-7 w-36 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-10">
                                    {editable && (
                                      <button onClick={() => { setEditingMessage({ id: msg._id, text: msg.message }); setShowMessageMenu(null); }}
                                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 flex items-center gap-2 transition">
                                        <Edit2 className="w-3.5 h-3.5 text-purple-500" />
                                        Edit
                                      </button>
                                    )}
                                    <button onClick={() => unsendMessage(msg._id)}
                                      className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2 transition">
                                      <Trash2 className="w-3.5 h-3.5" />
                                      Unsend
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
                  {partnerTyping && !partnerNotFound && (
                    <div className="flex items-end gap-2">
                      <Avatar src={partner?.profilePic} name={partner?.username} size="sm" />
                      <div className="px-4 py-3 rounded-2xl rounded-bl-md flex gap-1 items-center"
                        style={{ background: '#f3f4f6' }}>
                        <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          </div>

          {/* Reply banner */}
          {replyingTo && !partnerNotFound && (
            <div className="px-5 pb-2 flex-shrink-0">
              <div className="max-w-2xl mx-auto flex items-center justify-between rounded-xl px-3 py-2 border"
                style={{ background: '#f5f3ff', borderColor: '#ddd6fe' }}>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium" style={{ color: '#7c3aed' }}>↪ Replying</span>
                  <span className="text-xs text-gray-500 truncate max-w-[200px]">{replyingTo.message}</span>
                </div>
                <button onClick={() => setReplyingTo(null)} className="text-purple-400 hover:text-purple-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Input area */}
          <div className="flex-shrink-0 px-5 pb-5 pt-2 border-t" style={{ borderColor: '#f3f4f6', background: 'white' }}>
            <div className="max-w-2xl mx-auto">
              <form onSubmit={sendMessage}
                className="chat-input-form flex items-center gap-2 rounded-full px-3 py-2 border shadow-sm"
                style={{ border: '1.5px solid #ede9fe', background: 'white' }}>
                <button type="button" disabled={partnerNotFound}
                  className="w-8 h-8 sm:w-8 sm:h-8 w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center transition hover:opacity-80 disabled:opacity-30"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: 'white' }}>
                  <Plus className="w-4 h-4" />
                </button>
                <button type="button" disabled={partnerNotFound}
                  className="w-8 h-8 sm:w-8 sm:h-8 w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center disabled:opacity-30"
                  style={{ background: '#ede9fe', color: '#7c3aed' }}>
                  <Mic className="w-4 h-4" />
                </button>
                <input
                  ref={inputRef}
                  type="text"
                  value={newMessage}
                  onChange={e => { setNewMessage(e.target.value); handleTyping(); }}
                  placeholder={partnerNotFound ? "Cannot send messages" : "Type your message..."}
                  disabled={partnerNotFound}
                  className="flex-1 py-1.5 px-2 bg-transparent outline-none text-sm sm:text-sm text-base disabled:text-gray-400"
                  style={{ color: '#1f2937' }}
                />
                <button type="submit" disabled={!newMessage.trim() || partnerNotFound}
                  className="w-9 h-9 sm:w-9 sm:h-9 w-11 h-11 rounded-full flex-shrink-0 flex items-center justify-center transition hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: 'white' }}>
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <div className="flex items-center justify-center gap-1 mt-2">
                <Lock className="w-3 h-3" style={{ color: '#c4b5fd' }} />
                <p className="text-xs" style={{ color: '#c4b5fd' }}>End-to-end encrypted</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center" style={{ background: '#fafafa' }}>
          <div className="text-center">
            <div className="w-20 h-20 rounded-3xl rotate-12 mx-auto mb-4 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #ede9fe, #fce7f3)' }}>
              <Heart className="w-10 h-10" style={{ color: '#9333ea' }} fill="#ddd6fe" />
            </div>
            <p className="font-semibold text-gray-500">Select a conversation</p>
            <p className="text-sm text-gray-400 mt-1">to start messaging</p>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 640px) {
          .chat-input-form button {
            min-width: 44px;
            min-height: 44px;
          }
          .chat-input-form input {
            font-size: 16px;
            min-width: 80px;
          }
        }
      `}</style>
    </div>
  );
};

export default Chat;