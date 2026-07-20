import { useWebSocketContext } from '../providers/WebSocketProvider';

export const useWebSocket = () => {
  return useWebSocketContext();
};
