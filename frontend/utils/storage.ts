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
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error(`[Storage] Error saving ${key}:`, error);
    }
  },

  /**
   * Get item from persistent storage
   */
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(key);
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
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`[Storage] Error removing ${key}:`, error);
    }
  },

  /**
   * Clear all app-related storage
   */
  clear: async () => {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('[Storage] Error clearing storage:', error);
    }
  }
};

export default Storage;
