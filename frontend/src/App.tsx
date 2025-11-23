import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SocketProvider } from './contexts/SocketContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { Home } from './pages/Home';
import { JoinRoom } from './pages/JoinRoom';
import { Room } from './pages/Room';

function App() {
  return (
    <BrowserRouter>
      <NotificationProvider>
        <SocketProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/join/:joinCode" element={<JoinRoom />} />
            <Route path="/room/:roomId" element={<Room />} />
          </Routes>
        </SocketProvider>
      </NotificationProvider>
    </BrowserRouter>
  );
}

export default App;
