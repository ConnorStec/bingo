import { useSocket } from '../contexts/SocketContext';

export const ConnectionStatus = () => {
  const { isConnected } = useSocket();

  if (isConnected) {
    return null; // Don't show anything when connected
  }

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-yellow-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
        <span className="font-semibold">Reconnecting to server...</span>
      </div>
    </div>
  );
};
