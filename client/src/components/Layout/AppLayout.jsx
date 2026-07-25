
import { useState } from 'react';
import Sidebar from '../Sidebar/Sidebar';
import ChatWindow from '../Chat/ChatWindow';
import MessageInput from '../Input/MessageInput';
import { useChatContext } from '../../context/ChatContext';
import { useChat } from '../../hooks/useChat';

export default function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { activeConversation } = useChatContext();
  const { send, sendfiles, isSending } = useChat();


  const messages = activeConversation ? activeConversation.messages : [];

  return (
    <div className="app">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((v) => !v)} />

      <div className="main">
        <div className="top-bar">
          {sidebarCollapsed && (
            <button className="icon-btn" onClick={() => setSidebarCollapsed(false)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="9" y1="3" x2="9" y2="21" />
              </svg>
            </button>
          )}
          <div className="model-selector">
            Assistant <span className="sub">4.0</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>

        <ChatWindow messages={messages} isSending={isSending} onSuggestionClick={send} />

        <MessageInput onSend={send} onSendfiles={sendfiles} disabled={isSending} sidebarCollapsed={sidebarCollapsed} />
      </div>
    </div>
  );
}
