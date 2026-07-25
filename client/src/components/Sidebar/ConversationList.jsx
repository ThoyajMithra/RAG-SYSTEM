export default function ConversationList({ conversations, activeId, onSelect }) {
  return (
    <div className="conversation-list">
      <div className="conv-section-label">Chats</div>
      {conversations.map((conv) => (
        <div
          key={conv.id}
          className={`conv-item${conv.id === activeId ? ' active' : ''}`}
          onClick={() => onSelect(conv.id)}
        >
          {conv.title}
        </div>
      ))}
    </div>
  );
}
