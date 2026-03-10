// Chat.jsx – entry point
import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { Heart } from "lucide-react";
import ConversationSidebar from "./ConversationSidebar";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { useSocket } from "./hooks/useSocket";
import { useMessages } from "./hooks/useMessages";
import { useTyping } from "./hooks/useTyping";
import api from "../../utils/api";

const Chat = () => {
  const { userId } = useParams();
  const { user } = useContext(AuthContext);
  const [partner, setPartner] = useState(null);
  const [partnerNotFound, setPartnerNotFound] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [isPartnerOnline, setIsPartnerOnline] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);

  const {
    messages,
    loading,
    hasMore,
    loadMore,
    addMessage,
    updateMessage,
    removeMessage,
  } = useMessages(userId);

  const socket = useSocket(user, userId, {
    onNewMessage: (msg) => {
      addMessage(msg);
      // If this message is from the partner, mark it as read immediately
      if (msg.sender._id === userId) {
        api.put(`/chat/read/${userId}`).catch(console.error);
      }
    },
    onMessageEdited: (messageId, updates) => updateMessage(messageId, updates),
    onMessageDeleted: (messageId) => removeMessage(messageId),
    onUserOnline: (online) => setIsPartnerOnline(online),
    onUserOffline: () => setIsPartnerOnline(false),
    onMessagesRead: (readerId) => {
      if (readerId === userId) {
        updateMessage(null, { read: true }); // you may need to update all messages from you that are unread
      }
    },
    onTyping: ({ userId: typingUserId, isTyping }) => {
      if (typingUserId === userId) setPartnerTyping(isTyping);
    },
  });

  const handleTyping = useTyping(socket, userId);

  // Fetch partner info
  useEffect(() => {
    if (!userId) return;
    const fetchPartner = async () => {
      try {
        const res = await api.get(`/users/id/${userId}`);
        setPartner(res.data);
        setPartnerNotFound(false);
      } catch (err) {
        if (err.response?.status === 404) setPartnerNotFound(true);
      }
    };
    fetchPartner();
  }, [userId]);

  // Mark messages as read when entering chat
  useEffect(() => {
    if (userId) {
      api.put(`/chat/read/${userId}`).catch(console.error);
    }
  }, [userId]);

  const handleEditMessage = async (messageId, newContent) => {
    try {
      const res = await api.put(`/chat/${messageId}`, { message: newContent });
      updateMessage(messageId, res.data);
    } catch (err) {
      alert(err.response?.data?.error || "Edit failed");
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm("Unsend this message?")) return;
    try {
      await api.delete(`/chat/${messageId}`);
      removeMessage(messageId);
    } catch (err) {
      alert("Failed to unsend");
    }
  };

  const handleClearChat = async () => {
    if (!userId || !window.confirm("Delete entire conversation?")) return;
    try {
      await api.delete(`/chat/conversation/${userId}`);
      // Clear messages locally
      messages.forEach((msg) => removeMessage(msg._id)); // crude – better to setMessages([])
    } catch (err) {
      alert("Failed to clear chat");
    }
  };

  return (
    <div
      className="h-screen flex overflow-hidden"
      style={{ background: "#e8e0f5" }}
    >
      <ConversationSidebar currentUserId={userId} />
      {userId ? (
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          <ChatHeader
            partner={partner}
            isOnline={isPartnerOnline}
            partnerNotFound={partnerNotFound}
            onClearChat={handleClearChat}
          />
          <MessageList
            messages={messages}
            loading={loading}
            hasMore={hasMore}
            onLoadMore={loadMore}
            partner={partner}
            currentUser={user}
            onReply={setReplyingTo}
            onEdit={handleEditMessage}
            onDelete={handleDeleteMessage}
            partnerTyping={partnerTyping}
            partnerNotFound={partnerNotFound}
          />
          <MessageInput
            socket={socket}
            userId={userId}
            partnerNotFound={partnerNotFound}
            replyingTo={replyingTo}
            onReplyCancel={() => setReplyingTo(null)}
            onTyping={handleTyping}
          />
        </div>
      ) : (
        <div
          className="hidden md:flex flex-1 items-center justify-center"
          style={{ background: "#fafafa" }}
        >
          <div className="text-center">
            <div
              className="w-20 h-20 rounded-3xl rotate-12 mx-auto mb-4 flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #ede9fe, #fce7f3)",
              }}
            >
              <Heart
                className="w-10 h-10"
                style={{ color: "#9333ea" }}
                fill="#ddd6fe"
              />
            </div>
            <p className="font-semibold text-gray-500">Select a conversation</p>
            <p className="text-sm text-gray-400 mt-1">to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
