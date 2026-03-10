import { useCallback, useRef, useEffect } from 'react';
import { debounce } from 'lodash';

export const useTyping = (socket, partnerId) => {
  const typingTimeoutRef = useRef();

  const emitTyping = useCallback(
    debounce((isTyping) => {
      socket?.emit('typing', { partnerId, isTyping });
    }, 300),
    [socket, partnerId]
  );

  const handleTyping = useCallback(() => {
    if (!socket) return;
    emitTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => emitTyping(false), 2000);
  }, [socket, emitTyping]);

  useEffect(() => {
    return () => {
      emitTyping.cancel();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [emitTyping]);

  return handleTyping;
};