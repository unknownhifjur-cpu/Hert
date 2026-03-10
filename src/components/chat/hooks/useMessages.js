import { useState, useCallback, useRef, useEffect } from 'react';
import api from '../../../utils/api'; // adjust path if needed

export const useMessages = (conversationId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const oldestMessageIdRef = useRef();

  const loadMore = useCallback(async () => {
    if (loading || !hasMore || !conversationId) return;
    setLoading(true);
    try {
      const params = { limit: 20 };
      if (oldestMessageIdRef.current) {
        params.before = oldestMessageIdRef.current;
      }
      const res = await api.get(`/chat/${conversationId}`, { params });
      const newMessages = res.data;
      if (newMessages.length) {
        oldestMessageIdRef.current = newMessages[0]._id;
        setMessages(prev => [...newMessages, ...prev]);
        if (newMessages.length < 20) setHasMore(false);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Failed to load messages', error);
    } finally {
      setLoading(false);
    }
  }, [conversationId, loading, hasMore]);

  useEffect(() => {
    if (conversationId) {
      setMessages([]);
      oldestMessageIdRef.current = null;
      setHasMore(true);
      loadMore();
    }
  }, [conversationId]);

  const addMessage = (msg) => {
    setMessages(prev => [...prev, msg]);
  };

  const updateMessage = (messageId, updates) => {
    setMessages(prev => prev.map(m => m._id === messageId ? { ...m, ...updates } : m));
  };

  const removeMessage = (messageId) => {
    setMessages(prev => prev.filter(m => m._id !== messageId));
  };

  return { messages, loading, hasMore, loadMore, addMessage, updateMessage, removeMessage };
};