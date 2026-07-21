import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getVapidPublicKey, subscribeToPush, unsubscribeFromPush } from './api';

const NotificationContext = createContext(null);

// Utility to convert Base64URL to Uint8Array
const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export const NotificationProvider = ({ children }) => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(supported);
    
    if (supported) {
      setPermission(Notification.permission);
      checkSubscriptionStatus();
    } else {
      setIsLoading(false);
    }
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('Error checking service worker/subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const enableNotifications = useCallback(async () => {
    if (!isSupported) return false;
    
    setIsLoading(true);
    try {
      const currentPermission = await Notification.requestPermission();
      setPermission(currentPermission);
      
      if (currentPermission !== 'granted') {
        setIsLoading(false);
        return false;
      }
      
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;
      
      const vapidKey = await getVapidPublicKey();
      const convertedVapidKey = urlBase64ToUint8Array(vapidKey);
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });
      
      // Save subscription to backend
      const subscriptionJson = subscription.toJSON();
      await subscribeToPush({
        endpoint: subscriptionJson.endpoint,
        keys: {
          p256dh: subscriptionJson.keys.p256dh,
          auth: subscriptionJson.keys.auth
        }
      });
      
      setIsSubscribed(true);
      return true;
    } catch (error) {
      console.error('Failed to enable notifications:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  const disableNotifications = useCallback(async () => {
    if (!isSupported) return false;
    
    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await unsubscribeFromPush(subscription.endpoint);
        await subscription.unsubscribe();
        setIsSubscribed(false);
      }
      return true;
    } catch (error) {
      console.error('Failed to disable notifications:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  return (
    <NotificationContext.Provider value={{
      isSupported,
      permission,
      isSubscribed,
      isLoading,
      enableNotifications,
      disableNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
