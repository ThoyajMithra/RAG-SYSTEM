import NewChatButton from './NewChatButton';
import ConversationList from './ConversationList';
import { useChatContext } from '../../context/ChatContext';

export default function Sidebar({ collapsed, onToggle }) {
  const { conversations, activeId, createConversation, selectConversation } = useChatContext();

  return (
    <div className={`sidebar${collapsed ? ' collapsed' : ''}`}>
      <div className="sidebar-header">
        <NewChatButton onClick={createConversation} />
        <button className="icon-btn" onClick={onToggle} title="Toggle sidebar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="9" y1="3" x2="9" y2="21" />
          </svg>
        </button>
      </div>

      <ConversationList
        conversations={conversations}
        activeId={activeId}
        onSelect={selectConversation}
      />

      <div className="sidebar-footer">
        <h3>Get Started</h3>

        <p>
          Log in to get answers based on saved chats.
        </p>

        <button className="login-btn">Log in</button>
      </div>
    </div>
  );
}
