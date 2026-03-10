import ConversationItem from './ConversationItem';

// inside the return:
<ul className="space-y-1">
  {filteredConversations.map(conv => (
    <ConversationItem
      key={conv.user._id}
      conversation={conv}
      isActive={currentUserId === conv.user._id}
    />
  ))}
</ul>