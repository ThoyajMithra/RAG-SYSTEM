// All network calls to the backend live here. Nothing else in the app
// should call fetch() directly — keeps the API surface in one place
// so it's easy to change the base URL, add auth headers, retries, etc.


const BASE_URL = 'https://rag-system-production-fd2a.up.railway.app'; 

/**
 * Sends a full conversation to the backend and returns the assistant's reply.
 * @param {Array<{role: 'user'|'assistant', content: string}>} messages
 * @returns {Promise<string>} assistant reply text
 */
export async function sendMessage(messages) {

  const question = messages[messages.length - 1].content;
  console.log(messages);
  console.log(JSON.stringify({ question }));

  const res = await fetch(`${BASE_URL}/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }) 
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || `Request failed with status ${res.status}`);
  }

  const data = await res.json();
  return { answer: data.answer, videos: data.videos || [] };
}


/**
 * @param {Array<File>} files
 * @returns {Promise<string>} assistant reply text
 */
export async function sendMessageWithFiles(files) {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("files", file);
  });

  const res = await fetch(`${BASE_URL}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || `Request failed with status ${res.status}`);
  }

  const data = await res.json();
  console.log(data);
  return data;
}









//-------------------------------------------------------------------------------------------------------------------------------------// 

/**
 * Streaming version — reads Server-Sent Events from the backend and calls
 * onToken for each chunk as it arrives. Use this once you want responses
 * to appear token-by-token instead of all at once.
 * @param {Array<{role: string, content: string}>} messages
 * @param {(token: string) => void} onToken
 */
export async function streamMessage(messages, onToken) {
  const res = await fetch(`${BASE_URL}/chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages })
  });

  if (!res.ok || !res.body) {
    throw new Error(`Stream request failed with status ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n\n');
    buffer = lines.pop(); // keep incomplete chunk for next read

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const payload = line.slice(6);
      if (payload === '[DONE]') return;
      try {
        const parsed = JSON.parse(payload);
        if (parsed.token) onToken(parsed.token);
      } catch {
        // ignore malformed chunk
      }
    }
  }
}

export async function fetchConversations() {
  const res = await fetch(`${BASE_URL}/conversations`);
  if (!res.ok) throw new Error('Failed to load conversations');
  return res.json();
}
