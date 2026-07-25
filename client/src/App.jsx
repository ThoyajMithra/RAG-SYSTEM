import { ChatProvider } from './context/ChatContext';
import AppLayout from './components/Layout/AppLayout';

export default function App() {
  return (
    <ChatProvider>
      <AppLayout />
    </ChatProvider>
  );
}
