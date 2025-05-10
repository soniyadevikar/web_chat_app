import { Routes, Route } from 'react-router-dom';
import Homepage from './pages/Homepage';
import ChatPage from './pages/ChatPage';
import ChatProvider from './Context/ChatProvider';

function App() {
  return (
    <ChatProvider>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/chats" element={<ChatPage />} />
      </Routes>
    </ChatProvider>
  );
}

export default App;
