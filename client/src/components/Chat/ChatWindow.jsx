import { useEffect, useRef } from 'react';
import EmptyState from './EmptyState';
import Message from './Message';
import TypingIndicator from './TypingIndicator';

export default function ChatWindow({ messages, isSending, onSuggestionClick }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isSending]);

  return (
    <div className="chat-scroll" ref={scrollRef}>
      <div className="chat-inner">
        {messages.length === 0 ? (
          <EmptyState onSuggestionClick={onSuggestionClick} />
        ) : (
          <>
            {messages.map((m, i) => (
              <Message key={i} role={m.role} content={m.content} isError={m.isError} videos={m.videos} />
            ))}
            {isSending && <TypingIndicator />}
          </>
        )}
      </div>
    </div>
  );
}
