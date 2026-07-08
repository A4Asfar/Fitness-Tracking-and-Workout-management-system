import axios from 'axios';
import api from '@/services/api';

type RecoveryPayload = Record<string, string>;

const RECOVERY_TIMEOUT_MS = 20000;

/** Auth recovery calls should fail fast — no retry loops on OTP/email endpoints. */
export async function postAuthRecovery<T = unknown>(path: string, payload: RecoveryPayload) {
  const response = await api.post<T>(path, payload, {
    skipRetry: true,
    timeout: RECOVERY_TIMEOUT_MS,
  } as Parameters<typeof api.post>[2]);
  return response.data;
}

export function getRecoveryErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message || fallback;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}
