import { useEffect, useRef } from 'react';
import io from 'socket.io-client';

export const useSocket = (user, partnerId, callbacks) => {
  const socketRef = useRef(null);

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
        callbacks.onNewMessage?.(msg);
      }
    });

    socket.on('message-edited', ({ messageId, newMessage }) => {
      callbacks.onMessageEdited?.(messageId, { message: newMessage, edited: true });
    });

    socket.on('message-deleted', (messageId) => {
      callbacks.onMessageDeleted?.(messageId);
    });

    socket.on('user-online', (onlineUserId) => {
      if (onlineUserId === partnerId) callbacks.onUserOnline?.(true);
    });

    socket.on('user-offline', (offlineUserId) => {
      if (offlineUserId === partnerId) callbacks.onUserOnline?.(false);
    });

    socket.on('messages-read', ({ readerId }) => {
      if (readerId === partnerId) callbacks.onMessagesRead?.(readerId);
    });

    socket.on('user-typing', ({ userId: typingUserId, isTyping }) => {
      if (typingUserId === partnerId) callbacks.onTyping?.({ userId: typingUserId, isTyping });
    });

    return () => {
      socket.disconnect();
    };
  }, [user, partnerId, callbacks]);

  return socketRef.current;
};
