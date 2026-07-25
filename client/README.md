# Chat App — Client

React + Vite frontend for the chat app.

## Setup

```bash
cd client
npm install
npm run dev
```

Runs at http://localhost:5173. API requests to `/api/*` are proxied to
`http://localhost:3001` (see `vite.config.js`), so make sure the backend
server is running on port 3001.

## What the backend needs to expose

- `POST /api/chat`
  Request body: `{ "messages": [{ "role": "user" | "assistant", "content": "..." }] }`
  Response body: `{ "reply": "..." }`

- `POST /api/chat/stream` (optional, for streaming responses)
  Same request body, responds with Server-Sent Events:
  `data: {"token": "..."}\n\n` per chunk, ending with `data: [DONE]\n\n`

- `GET /api/conversations` (optional, for persisted chat history)
  Response body: array of `{ id, title, messages }`

## Project structure

```
src/
├── api/           fetch calls to the backend — the only place that talks to the network
├── context/        ChatContext — shared state (conversations, active chat)
├── hooks/          useChat (send flow), useConversations (load from backend)
├── components/
│   ├── Sidebar/     conversation list, new chat button
│   ├── Chat/         message list, empty state, typing indicator
│   ├── Input/        message textarea + send button
│   └── Layout/       AppLayout — wires everything together
├── App.jsx
└── main.jsx
```

## Notes

- Currently conversations are held in memory (`ChatContext.jsx` seed data)
  and reset on page refresh. Swap in `useConversations` once
  `GET /api/conversations` is backed by a real database.
- `chatApi.js` exports both `sendMessage` (simple request/response) and
  `streamMessage` (SSE streaming) — `useChat.js` currently uses the
  non-streaming version. Swap it in once your backend route is ready.
"# RAG-SYSTEM" 
