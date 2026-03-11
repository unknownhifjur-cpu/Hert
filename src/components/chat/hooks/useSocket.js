import { useEffect, useRef, useLayoutEffect } from 'react';
import io from 'socket.io-client';

export const useSocket = (user, partnerId, callbacks) => {
  const socketRef = useRef(null);
  const callbacksRef = useRef(callbacks);

  // Keep callbacks fresh without reconnecting
  useLayoutEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  useEffect(() => {
    if (!user || !partnerId) return;

    const token = localStorage.getItem('token');
    // Use environment variable or fallback to production backend
    let backendUrl = import.meta.env.VITE_API_URL || 'https://hert-backend.onrender.com';
    // Remove any trailing '/api' because socket.io needs the root URL
    backendUrl = backendUrl.replace(/\/api$/, '');

    const socket = io(backendUrl, {
      auth: { token },
      transports: ['websocket'], // optional, helps with some hosts
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Socket connected with id:', socket.id);
      socket.emit('join-conversation', { partnerId });
      callbacksRef.current.onConnect?.(); // notify parent
    });

    socket.on('connect_error', (err) => {
      console.error('❌ Socket connection error:', err.message);
      callbacksRef.current.onConnectError?.(err.message);
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
      callbacksRef.current.onDisconnect?.(reason);
    });

    socket.on('new-message', (msg) => {
      if (msg.sender._id === partnerId || msg.receiver._id === partnerId) {
        callbacksRef.current.onNewMessage?.(msg);
      }
    });

    socket.on('message-edited', ({ messageId, newMessage }) => {
      callbacksRef.current.onMessageEdited?.(messageId, { message: newMessage, edited: true });
    });

    socket.on('message-deleted', (messageId) => {
      callbacksRef.current.onMessageDeleted?.(messageId);
    });

    socket.on('user-online', (onlineUserId) => {
      if (onlineUserId === partnerId) callbacksRef.current.onUserOnline?.(true);
    });

    socket.on('user-offline', (offlineUserId) => {
      if (offlineUserId === partnerId) callbacksRef.current.onUserOnline?.(false);
    });

    socket.on('messages-read', ({ readerId }) => {
      if (readerId === partnerId) callbacksRef.current.onMessagesRead?.(readerId);
    });

    socket.on('user-typing', ({ userId: typingUserId, isTyping }) => {
      if (typingUserId === partnerId) callbacksRef.current.onTyping?.({ userId: typingUserId, isTyping });
    });

    return () => {
      socket.disconnect();
    };
  }, [user, partnerId]);

  return socketRef.current;
};