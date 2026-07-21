import api from '../services/api';

export const getVapidPublicKey = async () => {
  try {
    const response = await api.get('/notifications/vapid-public-key');
    return response.data.publicKey;
  } catch (error) {
    console.error('Error fetching VAPID public key:', error);
    throw error;
  }
};

export const subscribeToPush = async (subscription) => {
  try {
    const response = await api.post('/notifications/subscribe', subscription);
    return response.data;
  } catch (error) {
    console.error('Error saving subscription to backend:', error);
    throw error;
  }
};

export const unsubscribeFromPush = async (endpoint) => {
  try {
    const response = await api.delete(`/notifications/unsubscribe?endpoint=${encodeURIComponent(endpoint)}`);
    return response.data;
  } catch (error) {
    console.error('Error removing subscription from backend:', error);
    throw error;
  }
};
