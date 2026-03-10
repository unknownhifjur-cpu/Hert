import React, { useState, useRef, useEffect } from 'react';
import { Send, Plus, Mic, Lock, X } from 'lucide-react';

const MessageInput = ({ socket, userId, partnerNotFound, replyingTo, onReplyCancel, onTyping }) => {
  const [newMessage, setNewMessage] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (userId && inputRef.current) inputRef.current.focus();
  }, [userId]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !userId || !socket || partnerNotFound) return;
    socket.emit('send-message', {
      receiverId: userId,
      message: newMessage.trim(),
      replyTo: replyingTo?._id
    });
    setNewMessage('');
    onReplyCancel(); // clear reply
  };

  return (
    <div className="flex-shrink-0 px-5 pb-5 pt-2 border-t" style={{ borderColor: '#f3f4f6', background: 'white' }}>
      <div className="max-w-2xl mx-auto">
        {/* Reply banner */}
        {replyingTo && !partnerNotFound && (
          <div className="mb-2 flex items-center justify-between rounded-xl px-3 py-2 border" style={{ background: '#f5f3ff', borderColor: '#ddd6fe' }}>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium" style={{ color: '#7c3aed' }}>↪ Replying</span>
              <span className="text-xs text-gray-500 truncate max-w-[200px]">{replyingTo.message}</span>
            </div>
            <button onClick={onReplyCancel} className="text-purple-400 hover:text-purple-600">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <form
          onSubmit={sendMessage}
          className="chat-input-form flex items-center gap-2 rounded-full px-3 py-2 border shadow-sm"
          style={{ border: '1.5px solid #ede9fe', background: 'white' }}
        >
          <button
            type="button"
            disabled={partnerNotFound}
            className="w-8 h-8 sm:w-8 sm:h-8 w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center transition hover:opacity-80 disabled:opacity-30"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: 'white' }}
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            type="button"
            disabled={partnerNotFound}
            className="w-8 h-8 sm:w-8 sm:h-8 w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center disabled:opacity-30"
            style={{ background: '#ede9fe', color: '#7c3aed' }}
          >
            <Mic className="w-4 h-4" />
          </button>
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => { setNewMessage(e.target.value); onTyping(); }}
            placeholder={partnerNotFound ? "Cannot send messages" : "Type your message..."}
            disabled={partnerNotFound}
            className="flex-1 py-1.5 px-2 bg-transparent outline-none text-sm sm:text-sm text-base disabled:text-gray-400"
            style={{ color: '#1f2937' }}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || partnerNotFound}
            className="w-9 h-9 sm:w-9 sm:h-9 w-11 h-11 rounded-full flex-shrink-0 flex items-center justify-center transition hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: 'white' }}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <div className="flex items-center justify-center gap-1 mt-2">
          <Lock className="w-3 h-3" style={{ color: '#c4b5fd' }} />
          <p className="text-xs" style={{ color: '#c4b5fd' }}>End-to-end encrypted</p>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;