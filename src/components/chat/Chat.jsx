import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';
import { Send, ArrowLeft, MoreVertical } from 'lucide-react';

const Chat = () => {
  const { userId } = useParams(); // optional: if chatting with a specific user
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [partner, setPartner] = useState(null);
  const [conversations, setConversations] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (userId) {
      fetchMessages(userId);
    } else {
      fetchConversations();
    }
  }, [userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async (otherUserId) => {
    try {
      const res = await api.get(`/chat/${otherUserId}`);
      setMessages(res.data);
      if (res.data.length > 0) {
        // Partner is either sender or receiver (whom we are chatting with)
        const partnerUser = res.data[0].sender._id === otherUserId ? res.data[0].sender : res.data[0].receiver;
        setPartner(partnerUser);
      }
      // Mark messages as read
      await api.put(`/chat/read/${otherUserId}`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchConversations = async () => {
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
    if (!newMessage.trim()) return;
    try {
      const res = await api.post('/chat', {
        receiverId: userId,
        message: newMessage
      });
      setMessages([...messages, res.data]);
      setNewMessage('');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-4 border-rose-500 border-t-transparent"></div></div>;

  if (!userId) {
    // Show list of conversations
    return (
      <div className="min-h-screen bg-gray-50 pt-16 pb-20">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex items-center space-x-3 mb-6">
            <button onClick={() => navigate(-1)} className="p-2 text-gray-600 hover:text-rose-600">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Chats</h1>
          </div>
          {conversations.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm">
              <p className="text-gray-400">No conversations yet</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {conversations.map(conv => (
                <li key={conv.user._id}>
                  <Link
                    to={`/chat/${conv.user._id}`}
                    className="flex items-center space-x-3 p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition"
                  >
                    <div className="h-12 w-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold text-lg">
                      {conv.user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800">{conv.user.username}</p>
                      <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(conv.lastTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    {conv.unread && <span className="w-2 h-2 bg-rose-500 rounded-full"></span>}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }

  // Chat with specific user
  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-20 flex flex-col">
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 flex flex-col">
        {/* Header */}
        <div className="bg-white rounded-t-2xl shadow-sm border border-gray-100 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button onClick={() => navigate('/chat')} className="p-1 text-gray-600 hover:text-rose-600">
              <ArrowLeft className="w-5 h-5" />
            </button>
            {partner && (
              <>
                <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold">
                  {partner.username.charAt(0).toUpperCase()}
                </div>
                <h2 className="font-semibold text-gray-800">{partner.username}</h2>
              </>
            )}
          </div>
          <button className="p-1 text-gray-400 hover:text-gray-600">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 bg-white border-x border-gray-100 p-4 overflow-y-auto max-h-[60vh]">
          {messages.length === 0 ? (
            <p className="text-center text-gray-400">No messages yet. Say hello!</p>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => {
                const isMe = msg.sender._id === user._id || msg.sender._id === user.id;
                return (
                  <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                        isMe
                          ? 'bg-rose-500 text-white rounded-br-none'
                          : 'bg-gray-100 text-gray-800 rounded-bl-none'
                      }`}
                    >
                      <p className="text-sm">{msg.message}</p>
                      <p className={`text-xs mt-1 ${isMe ? 'text-rose-100' : 'text-gray-400'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} className="bg-white rounded-b-2xl shadow-sm border border-gray-100 p-4 flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="p-2 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;