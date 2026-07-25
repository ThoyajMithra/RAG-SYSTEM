const SUGGESTIONS = [
  { title: 'Explain a concept', desc: 'Break down something complex simply' },
  { title: 'Write something', desc: 'Draft an email, essay, or story' },
  { title: 'Debug code', desc: 'Find and fix an issue in your code' },
  { title: 'Brainstorm ideas', desc: 'Get suggestions for a project' }
];

export default function EmptyState({ onSuggestionClick }) {
  return (
    <div className="empty-state">
      <h1>What can I help with?</h1>
      <div className="suggestion-grid">
        {SUGGESTIONS.map((s) => (
          <div key={s.title} className="suggestion-card" onClick={() => onSuggestionClick(s.title)}>
            <div className="title">{s.title}</div>
            <div className="desc">{s.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
