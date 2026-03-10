import { useState, useCallback, useRef, useEffect } from 'react';
import api from '../../../utils/api';

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
      let newMessages = res.data;

      if (newMessages.length) {
        // Use functional update to get the latest messages and avoid stale closure
        setMessages(prevMessages => {
          // Filter out any messages that already exist in the current state
          const existingIds = new Set(prevMessages.map(m => m._id));
          const uniqueNewMessages = newMessages.filter(m => !existingIds.has(m._id));

          if (uniqueNewMessages.length) {
            oldestMessageIdRef.current = uniqueNewMessages[0]._id;
            // Return unique messages sorted by date (oldest first)
            const combined = [...prevMessages, ...uniqueNewMessages];
            // Sort by createdAt to ensure proper order
            return combined.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          }
          return prevMessages;
        });
        
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
    setMessages(prev => {
      // Prevent duplicate messages
      if (prev.some(m => m._id === msg._id)) return prev;
      return [...prev, msg];
    });
  };

  const updateMessage = (messageId, updates) => {
    setMessages(prev => prev.map(m => m._id === messageId ? { ...m, ...updates } : m));
  };

  const removeMessage = (messageId) => {
    setMessages(prev => prev.filter(m => m._id !== messageId));
  };

  return { messages, loading, hasMore, loadMore, addMessage, updateMessage, removeMessage };
};