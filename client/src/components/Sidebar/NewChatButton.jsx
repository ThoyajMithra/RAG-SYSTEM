export default function NewChatButton({ onClick }) {
  return (
    <button className="new-chat-btn" onClick={onClick}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 5v14M5 12h14" />
      </svg>
      New chat
    </button>
  );
}
