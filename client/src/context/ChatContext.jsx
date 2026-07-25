import { createContext, useContext, useState, useCallback } from 'react';

const ChatContext = createContext(null);

let nextConvId = 5; // seed data below uses 1-4


const SEED_CONVERSATIONS = [
  { id: 4, title: 'Building a chat interface', messages: [] },
  { id: 3, title: 'Weekend trip ideas', messages: [] },
  { id: 2, title: 'Recipe for banana bread', messages: [] },
  { id: 1, title: 'Explain quicksort', messages: [] }
];

export function ChatProvider({ children }) {
  const [conversations, setConversations] = useState(SEED_CONVERSATIONS);
  const [activeId, setActiveId] = useState('');

  const activeConversation = conversations.find((c) => c.id === activeId) ?? null;

  const createConversation = useCallback(() => {
    console.log("created");
    const id = nextConvId++;
    const conv = { id, title: 'New chat', messages: [] };
    setConversations((prev) => [conv, ...prev]);
    setActiveId(id);
    return id;
  }, []);




  const selectConversation = useCallback((id) => {
    console.log(id);
    setActiveId(id);
  }, []);
  

  const appendMessage = useCallback((convId, message) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === convId
          ? {
              ...c,
              messages: [...c.messages, message],
              // Auto-title the conversation from the first user message
              title:
                c.title === 'New chat' && message.role === 'user'
                  ? message.content.slice(0, 40)
                  : c.title
            }
          : c
      )
    );
  }, []);


  const value = {
    conversations,
    activeId,
    activeConversation,
    createConversation,
    selectConversation,
    appendMessage
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChatContext() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChatContext must be used within a ChatProvider');
  return ctx;
}
