import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export const useWebSocket = (events = {}) => {
  const socketRef = useRef(null);

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    // Debug: show resolved API URL
    console.debug('[useWebSocket][admin] connecting to', API_URL);
    // Create socket connection
    socketRef.current = io(API_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    // Subscribe to rooms
    socketRef.current.emit('subscribe-posts');
    socketRef.current.emit('subscribe-menus');
    socketRef.current.emit('subscribe-downloads');
    socketRef.current.emit('subscribe-ads');
    socketRef.current.emit('subscribe-settings');

    // Setup event listeners (log received events for debugging)
    Object.entries(events).forEach(([event, handler]) => {
      socketRef.current.on(event, (payload) => {
        console.debug(`[useWebSocket][admin] event received: ${event}`, payload);
        try {
          handler(payload);
        } catch (err) {
          console.error(`[useWebSocket][admin] handler error for ${event}:`, err);
        }
      });
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  return socketRef.current;
};

export default useWebSocket;
