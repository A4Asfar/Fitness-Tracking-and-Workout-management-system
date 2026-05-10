import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * Clean Storage Utility
 * Handles persistence across Web and Native platforms
 */
const Storage = {
  /**
   * Set item in persistent storage
   */
  setItem: async (key: string, value: string) => {
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem(key, value);
      } else {
        await AsyncStorage.setItem(key, value);
      }
    } catch (error) {
      console.error(`[Storage] Error saving ${key}:`, error);
    }
  },

  /**
   * Get item from persistent storage
   */
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (Platform.OS === 'web') {
        return localStorage.getItem(key);
      } else {
        return await AsyncStorage.getItem(key);
      }
    } catch (error) {
      console.error(`[Storage] Error reading ${key}:`, error);
      return null;
    }
  },

  /**
   * Remove item from persistent storage
   */
  removeItem: async (key: string) => {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(key);
      } else {
        await AsyncStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`[Storage] Error removing ${key}:`, error);
    }
  },

  /**
   * Clear all app-related storage
   */
  clear: async () => {
    try {
      if (Platform.OS === 'web') {
        localStorage.clear();
      } else {
        await AsyncStorage.clear();
      }
    } catch (error) {
      console.error('[Storage] Error clearing storage:', error);
    }
  }
};

export default Storage;
