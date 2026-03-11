import { useEffect, useRef, useLayoutEffect } from 'react';
import io from 'socket.io-client';

export const useSocket = (user, partnerId, callbacks) => {
  const socketRef = useRef(null);
  const callbacksRef = useRef(callbacks);

  // Update callbacks ref when they change (without triggering reconnection)
  useLayoutEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  useEffect(() => {
    if (!user || !partnerId) return;

    const token = localStorage.getItem('token');
    const socket = io(import.meta.env.VITE_API_URL, {
      auth: { token },
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join-conversation', { partnerId });
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
