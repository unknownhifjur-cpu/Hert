import React, { useState } from 'react';
import { Check, CheckCheck, MoreVertical, Edit2, Trash2, X, CheckCircle } from 'lucide-react';
import Avatar from './Avatar';

const MessageBubble = ({
  msg,
  isMe,
  partner,
  editable,
  onEdit,
  onDelete,
  onReply,
  editingMessage,
  setEditingMessage,
  showMessageMenu,
  setShowMessageMenu
}) => {
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleEditSubmit = async () => {
    if (!editingMessage.text.trim()) return;
    try {
      const res = await api.put(`/chat/${editingMessage.id}`, { message: editingMessage.text.trim() });
      onEdit(editingMessage.id, res.data);
      setEditingMessage(null);
      setShowMessageMenu(null);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to edit message');
    }
  };

  if (editingMessage && editingMessage.id === msg._id) {
    return (
      <div className="max-w-[65%] w-full bg-white border-2 border-purple-200 rounded-2xl p-3 shadow-lg">
        <textarea
          value={editingMessage.text}
          onChange={e => setEditingMessage({ ...editingMessage, text: e.target.value })}
          className="w-full p-2 border border-purple-100 rounded-xl text-sm focus:ring-2 focus:ring-purple-200 resize-none outline-none"
          rows="2"
          autoFocus
        />
        <div className="flex justify-end gap-2 mt-2">
          <button
            onClick={() => setEditingMessage(null)}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
          <button
            onClick={handleEditSubmit}
            className="p-1.5 rounded-full transition"
            style={{ color: '#9333ea', background: '#ede9fe' }}
          >
            <CheckCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'} group`}>
      {!isMe && <Avatar src={partner?.profilePic} name={partner?.username} size="sm" />}

      <div className={`flex flex-col max-w-[65%] ${isMe ? 'items-end' : 'items-start'}`}>
        {msg.replyTo && (
          <div
            className="mb-1 px-3 py-1 rounded-lg text-xs max-w-[200px] truncate border"
            style={{ background: '#f5f3ff', color: '#7c3aed', borderColor: '#ddd6fe' }}
          >
            ↪ {msg.replyTo.message}
          </div>
        )}

        <div
          className={`px-4 py-2.5 rounded-2xl shadow-sm ${isMe ? 'rounded-br-md' : 'rounded-bl-md'}`}
          style={isMe
            ? { background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: 'white' }
            : { background: '#f3f4f6', color: '#1f2937' }}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.message}</p>
          <div className={`flex items-center gap-1 mt-1 text-xs ${isMe ? 'text-purple-200 justify-end' : 'text-gray-400'}`}>
            <span>✓ {formatTime(msg.createdAt)}</span>
            {isMe && msg.read && <CheckCheck className="w-3 h-3" />}
            {msg.edited && <span className="text-[10px]">(edited)</span>}
          </div>
        </div>
      </div>

      {isMe && (
        <div className="relative self-center opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setShowMessageMenu(showMessageMenu === msg._id ? null : msg._id)}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>
          {showMessageMenu === msg._id && (
            <div className="absolute right-0 bottom-7 w-36 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-10">
              {editable && (
                <button
                  onClick={() => { setEditingMessage({ id: msg._id, text: msg.message }); setShowMessageMenu(null); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 flex items-center gap-2 transition"
                >
                  <Edit2 className="w-3.5 h-3.5 text-purple-500" />
                  Edit
                </button>
              )}
              <button
                onClick={() => onDelete(msg._id)}
                className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Unsend
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MessageBubble;