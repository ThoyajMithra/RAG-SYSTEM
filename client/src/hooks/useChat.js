import { useState, useCallback } from 'react';
import { sendMessage,sendMessageWithFiles } from '../api/chatApi';
import { useChatContext } from '../context/ChatContext';


/**
 * Encapsulates the "send a message, show typing indicator, append reply"
 * flow for the active conversation. Components just call `send(text)`.
 */
export function useChat() {
  const { conversations,activeId, activeConversation, appendMessage, createConversation,selectConversation,SM } = useChatContext();
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);

  const send = useCallback(
    async (text) => {

      const trimmed = text.trim();
      if (!trimmed || isSending) return;

      // If there's no active conversation yet, create one first
      let convId = activeId;

      if (activeId === '') {
        convId = createConversation(); 
        selectConversation(convId);   
      }

      const userMessage = { role: 'user', content: trimmed };
      appendMessage(convId, userMessage);

      setIsSending(true);
      setError(null);

      try {
        const priorMessages = activeConversation ? activeConversation.messages : [];
        const { answer, videos } = await sendMessage([...priorMessages, userMessage]);

        appendMessage(convId, { role: 'assistant', content: answer, videos });

      } catch (err) {
        setError(err.message || 'Something went wrong');
        appendMessage(convId, {
          role: 'assistant',
          content: 'Sorry, something went wrong reaching the server.',
          isError: true
        });
      } finally {
        setIsSending(false);
        // console.log(conversations.find(conv => conv.id === convId)?.messages);
      }
    },
    [activeId, activeConversation, appendMessage, createConversation, isSending]
  );

  const sendfiles =useCallback(
    async (file) => {

      if (!file || isSending) return;

      let convId = activeId;

      if (activeId === '') {
        convId = createConversation();
        selectConversation(convId);
      }

      file.forEach((val) => {
        const userMessage = {
          role: "user-file",
          content: `📄${val.name}`
        };
        appendMessage(convId, userMessage);
      });

      setIsSending(true);
      setError(null);

      try {
        const reply = await sendMessageWithFiles(file);
        console.log(reply);
        appendMessage(convId, { role: 'assistant-file', content: reply });
    }catch (err) {
        setError(err.message || 'Something went wrong');
        appendMessage(convId, {
          role: 'assistant',
          content: 'Sorry, something went wrong reaching the server.',
          isError: true
        });
      } finally {
        setIsSending(false);
      }
    },
    [activeId, activeConversation, appendMessage, createConversation, isSending]
  );




  return { send, sendfiles ,isSending, error };
}
