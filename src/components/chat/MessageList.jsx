import React, { useRef, useEffect, useState } from "react";
import MessageBubble from "./MessageBubble";
import Avatar from "./Avatar";
import { Lock } from "lucide-react";

const MessageList = ({
  messages,
  loading,
  hasMore,
  onLoadMore,
  partner,
  currentUser,
  onReply,
  onEdit,
  onDelete,
  partnerTyping,
  partnerNotFound,
}) => {
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [showMessageMenu, setShowMessageMenu] = useState(null);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Infinite scroll handler
  const handleScroll = () => {
    if (!scrollContainerRef.current || loading || !hasMore) return;
    const { scrollTop } = scrollContainerRef.current;
    if (scrollTop === 0) {
      onLoadMore();
    }
  };

  const groupMessagesByDate = () => {
    const groups = [];
    let currentDate = null;
    messages.forEach((msg, index) => {
      const msgDate = new Date(msg.createdAt).toLocaleDateString();
      if (msgDate !== currentDate) {
        groups.push({
          type: "date",
          date: msgDate,
          uniqueKey: `date-${msgDate}-${index}`,
        });
        currentDate = msgDate;
      }
      // Create a truly unique key combining _id and index as fallback
      const uniqueKey = msg._id || `temp-${index}-${Date.now()}`;
      groups.push({ type: "message", data: msg, uniqueKey });
    });
    return groups;
  };

  const isToday = (dateString) =>
    dateString === new Date().toLocaleDateString();

  const isMessageEditable = (msg) => {
    const isSender =
      msg.sender._id === currentUser._id || msg.sender._id === currentUser.id;
    if (!isSender) return false;
    const diffMinutes = (new Date() - new Date(msg.createdAt)) / (1000 * 60);
    return diffMinutes <= 5;
  };

  if (partnerNotFound) {
    return (
      <div
        className="flex-1 flex items-center justify-center"
        style={{ background: "#fafafa" }}
      >
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl rotate-12 mb-4 flex items-center justify-center bg-gray-100">
            <Lock className="w-7 h-7 text-gray-400" />
          </div>
          <p className="font-semibold text-gray-600 mb-1">
            This user is no longer available
          </p>
          <p className="text-sm text-gray-400">
            You cannot send messages to a deleted account.
          </p>
        </div>
      </div>
    );
  }

  if (messages.length === 0 && !loading) {
    return (
      <div
        className="flex-1 flex items-center justify-center"
        style={{ background: "#fafafa" }}
      >
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-2xl rotate-12 mb-4 flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #ede9fe, #fce7f3)" }}
          >
            <Lock className="w-7 h-7" style={{ color: "#9333ea" }} />
          </div>
          <p className="font-semibold text-gray-600 mb-1">
            End-to-end encrypted
          </p>
          <p className="text-sm text-gray-400">
            Say something to start the conversation!
          </p>
        </div>
      </div>
    );
  }

  const grouped = groupMessagesByDate();

  return (
    <div
      ref={scrollContainerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto overflow-x-hidden px-5 py-4"
      style={{ background: "#fafafa" }}
    >
      <div className="max-w-2xl mx-auto">
        {loading && (
          <div className="flex justify-center py-4">
            <div className="w-8 h-8 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin" />
          </div>
        )}

        {grouped.map((item, index) => {
          if (item.type === "date") {
            return (
              <div key={item.uniqueKey} className="flex justify-center my-4">
                <span
                  className="px-4 py-1 text-xs rounded-full font-medium"
                  style={{ background: "#f3f4f6", color: "#9ca3af" }}
                >
                  {isToday(item.date) ? "Today" : item.date}
                </span>
              </div>
            );
          }

          const msg = item.data;
          const isMe =
            msg.sender._id === currentUser._id ||
            msg.sender._id === currentUser.id;
          const editable = isMe && isMessageEditable(msg);

          return (
            <MessageBubble
              key={item.uniqueKey}
              msg={msg}
              isMe={isMe}
              partner={partner}
              editable={editable}
              onEdit={onEdit}
              onDelete={onDelete}
              onReply={onReply}
              editingMessage={editingMessage}
              setEditingMessage={setEditingMessage}
              showMessageMenu={showMessageMenu}
              setShowMessageMenu={setShowMessageMenu}
            />
          );
        })}

        {partnerTyping && (
          <div className="flex items-end gap-2">
            <Avatar
              src={partner?.profilePic}
              name={partner?.username}
              size="sm"
            />
            <div
              className="px-4 py-3 rounded-2xl rounded-bl-md flex gap-1 items-center"
              style={{ background: "#f3f4f6" }}
            >
              <span
                className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <span
                className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <span
                className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessageList;
