import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';
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
  const [editingMessage, setEditingMessage] = useState(null); // { id, text }
  const [showMessageMenu, setShowMessageMenu] = useState(null); // id of message with open menu
  const [showChatMenu, setShowChatMenu] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (userId) {
      fetchMessages(userId);
    } else {
      fetchConversations();
    }
  }, [userId]);

  useEffect(() => {
    scrollToBottom();
    if (userId && inputRef.current) {
      inputRef.current.focus();
    }
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

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !userId) return;
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
    return diffMinutes <= 5; // editable within 5 minutes
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

  if (loading && !userId) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-4 border-rose-500 border-t-transparent"></div></div>;
  }

  // Conversations list view (unchanged, but you could add profile pictures here too)
  if (!userId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-16 pb-20">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex items-center space-x-3 mb-6">
            <button onClick={() => navigate(-1)} className="p-2 text-gray-600 hover:text-rose-600 rounded-full hover:bg-rose-50">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Messages</h1>
          </div>
          {conversations.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-gray-500 text-lg mb-2">No conversations yet</p>
              <p className="text-gray-400">Find someone to chat with from their profile</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {conversations.map(conv => (
                <li key={conv.user._id}>
                  <Link
                    to={`/chat/${conv.user._id}`}
                    className="flex items-center space-x-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-100"
                  >
                    <div className="h-14 w-14 rounded-full bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center text-white font-bold text-xl overflow-hidden">
                      {conv.user.profilePic ? (
                        <img src={conv.user.profilePic} alt={conv.user.username} className="w-full h-full object-cover" />
                      ) : (
                        conv.user.username.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <p className="font-semibold text-gray-800">{conv.user.username}</p>
                        <span className="text-xs text-gray-400">{formatMessageTime(conv.lastTime)}</span>
                      </div>
                      <p className="text-sm text-gray-500 truncate flex items-center">
                        {conv.unread && <span className="w-2 h-2 bg-rose-500 rounded-full mr-2"></span>}
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
    );
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-4 border-rose-500 border-t-transparent"></div></div>;
  }

  const groupedMessages = groupMessagesByDate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-16 pb-20 flex flex-col">
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 flex flex-col">
        {/* Header */}
        <div className="bg-white rounded-t-2xl shadow-sm border border-gray-100 p-4 flex items-center justify-between">
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
                  <p className="text-xs text-gray-400">{messages.length > 0 ? 'Active now' : ''}</p>
                </div>
              </>
            )}
          </div>
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowChatMenu(!showChatMenu)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            {showChatMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-10">
                <button
                  onClick={clearChat}
                  className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear chat</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 bg-white border-x border-gray-100 p-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 rounded-full bg-rose-100 flex items-center justify-center mb-4">
                <Send className="w-8 h-8 text-rose-400" />
              </div>
              <p className="text-gray-500 text-lg mb-2">No messages yet</p>
              <p className="text-gray-400">Send a message to start the conversation</p>
            </div>
          ) : (
            <div className="space-y-4">
              {groupedMessages.map((item, index) => {
                if (item.type === 'date') {
                  return (
                    <div key={`date-${index}`} className="flex justify-center">
                      <span className="px-3 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
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
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fadeIn relative`}
                  >
                    {editingMessage && editingMessage.id === msg._id ? (
                      // Edit mode
                      <div className="max-w-[70%] w-full bg-white border border-rose-200 rounded-2xl p-3 shadow-sm">
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
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <button
                            onClick={editMessage}
                            className="p-1 text-rose-500 hover:text-rose-600"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-col max-w-[70%]">
                          {!isMe && (
                            <span className="text-xs text-gray-400 ml-1 mb-1">{msg.sender.username}</span>
                          )}
                          <div
                            className={`relative px-4 py-2 rounded-2xl shadow-sm ${
                              isMe
                                ? 'bg-rose-500 text-white rounded-br-none'
                                : 'bg-gray-100 text-gray-800 rounded-bl-none'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                            <div className={`flex items-center justify-end space-x-1 mt-1 ${
                              isMe ? 'text-rose-100' : 'text-gray-400'
                            }`}>
                              <span className="text-xs">{formatMessageTime(msg.createdAt)}</span>
                              {msg.edited && <span className="text-xs">(edited)</span>}
                              {isMe && (
                                <span className="text-xs">
                                  {msg.read ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {/* Message menu (three dots) */}
                        {isMe && (
                          <div className="relative ml-2 self-center">
                            <button
                              onClick={() => setShowMessageMenu(showMessageMenu === msg._id ? null : msg._id)}
                              className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            {showMessageMenu === msg._id && (
                              <div className="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden z-10">
                                {editable && (
                                  <button
                                    onClick={() => {
                                      setEditingMessage({ id: msg._id, text: msg.message });
                                      setShowMessageMenu(null);
                                    }}
                                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-rose-50 transition flex items-center space-x-2"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                    <span>Edit</span>
                                  </button>
                                )}
                                <button
                                  onClick={() => unsendMessage(msg._id)}
                                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition flex items-center space-x-2"
                                >
                                  <Trash2 className="w-3 h-3" />
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

        {/* Input area */}
        <form onSubmit={sendMessage} className="bg-white rounded-b-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center space-x-2">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-3 border border-gray-200 rounded-full focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="p-3 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
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
          from { opacity: 0; transform: translateY(10px); }
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