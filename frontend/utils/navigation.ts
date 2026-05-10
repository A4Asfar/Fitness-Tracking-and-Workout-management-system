import { router } from 'expo-router';

/**
 * Safely navigates back. If there is no history to go back to,
 * it will navigate to the provided fallback route.
 */
export const safeBack = (fallback: string = '/') => {
  try {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(fallback as any);
    }
  } catch (error) {
    console.warn('[Navigation] safeBack failed, using fallback:', error);
    router.replace(fallback as any);
  }
};
