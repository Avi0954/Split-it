import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const [status, setStatus] = useState('disconnected'); // connecting, connected, disconnected, reconnecting
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectInterval = 30000;
  
  // Custom event dispatcher to allow components to listen without re-rendering the provider
  const dispatchRealtimeEvent = useCallback((eventData) => {
    try {
      const parsedData = JSON.parse(eventData);
      // Dispatch a custom event on the window object
      const event = new CustomEvent('REALTIME_EVENT', { detail: parsedData });
      window.dispatchEvent(event);
      
      // Also dispatch specific event types for convenience
      if (parsedData.type) {
        const specificEvent = new CustomEvent(`REALTIME_${parsedData.type.toUpperCase()}`, { detail: parsedData });
        window.dispatchEvent(specificEvent);
      }
    } catch (e) {
      console.error('Failed to parse WebSocket message:', e);
    }
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    
    const token = localStorage.getItem('token');
    if (!token) {
      setStatus('disconnected');
      return;
    }

    setStatus(reconnectAttemptsRef.current > 0 ? 'reconnecting' : 'connecting');
    
    // Construct WS URL
    let wsUrl = '';
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    
    try {
      if (import.meta.env.VITE_API_URL) {
        if (import.meta.env.VITE_API_URL.startsWith('http')) {
          const apiHost = new URL(import.meta.env.VITE_API_URL).host;
          wsUrl = `${protocol}//${apiHost}/ws?token=${token}`;
        } else {
          wsUrl = `${protocol}//${window.location.host}/ws?token=${token}`;
        }
      } else {
        // Fallback for local development
        wsUrl = `${protocol}//localhost:8000/ws?token=${token}`;
      }
    } catch (e) {
      wsUrl = `${protocol}//localhost:8000/ws?token=${token}`;
    }
    
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setStatus('connected');
        reconnectAttemptsRef.current = 0;
        console.log('WebSocket connected');
        
        // Start heartbeat
        if (wsRef.current?.pingInterval) clearInterval(wsRef.current.pingInterval);
        wsRef.current.pingInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send('ping');
          }
        }, 30000);
      };

      ws.onmessage = (event) => {
        if (event.data === 'pong') return; // Ignore heartbeat responses
        dispatchRealtimeEvent(event.data);
      };

      ws.onclose = (event) => {
        if (wsRef.current?.pingInterval) clearInterval(wsRef.current.pingInterval);
        
        // 1008 is Policy Violation (Invalid Token)
        if (event.code === 1008) {
          setStatus('disconnected');
          // Dispatch auth error to trigger logout
          window.dispatchEvent(new CustomEvent('AUTH_ERROR'));
          return;
        }

        setStatus('disconnected');
        
        // Exponential backoff reconnect
        const baseDelay = 1000;
        const delay = Math.min(baseDelay * Math.pow(2, reconnectAttemptsRef.current), maxReconnectInterval);
        reconnectAttemptsRef.current += 1;
        
        console.log(`WebSocket disconnected. Reconnecting in ${delay}ms...`);
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, delay);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        // onclose will handle the reconnection
      };
      
    } catch (e) {
      console.error('WebSocket connection failed:', e);
      setStatus('disconnected');
    }
  }, [dispatchRealtimeEvent]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      if (wsRef.current.pingInterval) clearInterval(wsRef.current.pingInterval);
      wsRef.current.close();
      wsRef.current = null;
    }
    setStatus('disconnected');
  }, []);

  // Expose methods
  const value = {
    status,
    connect,
    disconnect,
    send: (data) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(data));
      }
    }
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (context === null) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
};
