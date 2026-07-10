import * as Haptics from 'expo-haptics';

/**
 * Trigger a success haptic notification feedback pattern (e.g. action success, purchase verified).
 */
export async function hapticSuccess() {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch (error) {
    // Silently ignore feedback failures on unsupported devices
  }
}

/**
 * Trigger an error haptic notification feedback pattern (e.g. validation fails, connection drops).
 */
export async function hapticError() {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } catch (error) {
    // Silently ignore
  }
}

/**
 * Trigger a warning haptic notification feedback pattern.
 */
export async function hapticWarning() {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  } catch (error) {
    // Silently ignore
  }
}

/**
 * Trigger a light physical click impact haptic (best for general tab/button selection feedback).
 */
export async function hapticLight() {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch (error) {
    // Silently ignore
  }
}

/**
 * Trigger a medium physical click impact haptic (best for list selection or modal drag dismissals).
 */
export async function hapticMedium() {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch (error) {
    // Silently ignore
  }
}

/**
 * Trigger a heavy physical click impact haptic.
 */
export async function hapticHeavy() {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  } catch (error) {
    // Silently ignore
  }
}
