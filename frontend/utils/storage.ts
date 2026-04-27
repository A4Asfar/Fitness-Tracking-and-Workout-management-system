import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

const Storage = {
  setItem: async (key: string, value: string) => {
    if (isWeb) {
      try {
        localStorage.setItem(key, value);
      } catch (e) {
        console.error('Error saving to localStorage', e);
      }
    } else {
      try {
        await SecureStore.setItemAsync(key, value);
      } catch (e) {
        console.error('Error saving to SecureStore', e);
      }
    }
  },

  getItem: async (key: string) => {
    if (isWeb) {
      try {
        return localStorage.getItem(key);
      } catch (e) {
        console.error('Error reading from localStorage', e);
        return null;
      }
    } else {
      try {
        return await SecureStore.getItemAsync(key);
      } catch (e) {
        console.error('Error reading from SecureStore', e);
        return null;
      }
    }
  },

  removeItem: async (key: string) => {
    if (isWeb) {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.error('Error removing from localStorage', e);
      }
    } else {
      try {
        await SecureStore.deleteItemAsync(key);
      } catch (e) {
        console.error('Error removing from SecureStore', e);
      }
    }
  }
};

export default Storage;
