function VideoRecommendations({ videos }) {
  if (!videos || videos.length === 0) return null;

  return (
    <div className="video-recommendations">
      {videos.map((v) => (
        <a
          key={v.video_id}
          href={v.url}
          target="_blank"
          rel="noopener noreferrer"
          className="video-card"
        >
          {v.thumbnail_url && <img src={v.thumbnail_url} alt={v.title} />}
          <div className="video-card-info">
            <div className="video-card-title">{v.title}</div>
            <div className="video-card-channel">{v.channel}</div>
          </div>
        </a>
      ))}
    </div>
  );
}

export default function Message({ role, content, isError, videos }) {
  if (role === 'user') {
    return (
      <div className="message user">
        <div className="bubble">{content}</div>
      </div>
    );
  }
  
  if (role === 'user-file') {
    return (
      <div className="message user">
        <div className="pdf">{content}</div>
      </div>
    );
  }
  if (role === "assistant-file") {
    return (
      <div className="message assistant">
        <div className="msg-avatar-pdf">📄</div>
        <div className="pdf">{content}</div>
      </div>
    );
  }

  return (
    <div className="message assistant">
      <div className="msg-avatar">✦</div>
      <div className={`msg-content${isError ? ' msg-error' : ''}`}>
        {content}
        <VideoRecommendations videos={videos} />
      </div>
    </div>
  );
}
