import { useEffect } from 'react';

/**
 * Hook to listen to a specific realtime event type
 * @param {string} eventType - The type of event to listen for (e.g. 'expense_created')
 * @param {function} callback - Function to run when event is received
 * @param {Array} deps - Dependency array for the callback
 */
export const useRealtimeEvent = (eventType, callback, deps = []) => {
  useEffect(() => {
    if (!eventType || !callback) return;

    const eventName = `REALTIME_${eventType.toUpperCase()}`;
    
    const handleEvent = (event) => {
      // event.detail contains the parsed payload
      callback(event.detail);
    };

    window.addEventListener(eventName, handleEvent);
    
    return () => {
      window.removeEventListener(eventName, handleEvent);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventType, ...deps]);
};

/**
 * Hook to listen to all realtime events
 * @param {function} callback - Function to run when any event is received
 * @param {Array} deps - Dependency array for the callback
 */
export const useAllRealtimeEvents = (callback, deps = []) => {
  useEffect(() => {
    if (!callback) return;

    const handleEvent = (event) => {
      callback(event.detail);
    };

    window.addEventListener('REALTIME_EVENT', handleEvent);
    
    return () => {
      window.removeEventListener('REALTIME_EVENT', handleEvent);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};
