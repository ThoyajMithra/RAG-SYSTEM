import { useEffect, useState } from 'react';
import { fetchConversations } from '../api/chatApi';

/**
 * Loads saved conversations from the backend on mount.
 * Not wired into ChatContext by default (the demo uses in-memory seed data) —
 * plug this in once you have a real /api/conversations endpoint backed by a database.
 */
export function useConversations() {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    fetchConversations()
      .then((data) => {
        if (!cancelled) setConversations(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { conversations, isLoading, error };
}
