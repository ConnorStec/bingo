import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SocketProvider } from './contexts/SocketContext';
import { ActivityProvider } from './contexts/ActivityContext';
import { Home } from './pages/Home';
import { JoinRoom } from './pages/JoinRoom';
import { Room } from './pages/Room';

function App() {
  return (
    <BrowserRouter>
      <SocketProvider>
        <ActivityProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/join/:joinCode" element={<JoinRoom />} />
            <Route path="/room/:roomId" element={<Room />} />
          </Routes>
        </ActivityProvider>
      </SocketProvider>
    </BrowserRouter>
  );
}

export default App;
