import { useState, useRef } from 'react';

export default function MessageInput({ onSend, onSendfiles ,disabled, sidebarCollapsed }) {
  
  const [value, setValue] = useState('');
  const [files, setFiles] = useState([]);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setValue(e.target.value);
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 200) + 'px';
    }
  };

  const handleSend = () => {
    const trimmed = value.trim();

    // Nothing to send at all
    if (!trimmed && files.length === 0) return;

    if (files.length > 0) onSendfiles(files);
    if (trimmed) onSend(trimmed);

    setValue('');
    setFiles([]);

    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    if (fileInputRef.current) fileInputRef.current.value = '';
  };


  

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;

    const ALLOWED_TYPES = [
      'application/pdf',
      'text/plain',
      'text/markdown',
      'audio/mpeg',
      'audio/mp4',
      'audio/wav',
      'audio/x-wav',
      'audio/webm',
    ];
    const invalid = selectedFiles.find(file => !ALLOWED_TYPES.includes(file.type));
    if (invalid) {
      alert('Please select a PDF, TXT, MD, or audio file (mp3/wav/m4a).');
      return;
    }

    setFiles(prev => [...prev, ...selectedFiles]);
    e.target.value = '';
    setTimeout(() => {
    textareaRef.current?.focus();
    }, 0);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`input-area${sidebarCollapsed ? ' collapsed' : ''}`}>
      <div style={{ width: '100%', maxWidth: 720 }}>
        {files.length > 0 && (
            <div className="file-preview-container">
              {files.map((file, index) => (
                <div className="file-preview" key={index}>
                  <div className="file-icon">📄</div>

                  <div className="file-info">
                    <div className="file-name">{file.name}</div>
                    <div className="file-size">
                      {(file.size / 1024).toFixed(1)} KB
                    </div>
                  </div>

                  <button
                    type="button"
                    className="remove-file"
                    onClick={() => removeFile(index)}
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          )}

        <div className="input-wrapper">

          <button
            type="button"
            className="plus-btn"
            onClick={() => fileInputRef.current.click()}
          >
            +
          </button>
          <input
            type="file"
            accept=".pdf,.txt,.md,.mp3,.wav,.m4a"
            multiple
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
            onKeyDown={handleKeyDown}
          />

          <textarea
            ref={textareaRef}
            rows={1}
            placeholder="Message..."
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />
          
          <button className="send-btn" onClick={handleSend} disabled={disabled || !value.trim()}>
            <svg viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5">
              <line x1="12" y1="19" x2="12" y2="5" />
              <polyline points="5 12 12 5 19 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
