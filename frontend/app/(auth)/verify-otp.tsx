import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, RefreshCw } from 'lucide-react-native';
import { useToast } from '@/components/Toast';
import { getRecoveryErrorMessage, postAuthRecovery } from '@/services/authRecovery';

import LogoSection from '@/components/auth/LogoSection';
import OTPInput from '@/components/auth/OTPInput';
import PrimaryButton from '@/components/auth/PrimaryButton';

export default function VerifyOtpScreen() {
  const { email: emailParam } = useLocalSearchParams<{ email: string }>();
  const email = String(emailParam || '').trim().toLowerCase();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    if (!email) {
      showToast('Email is missing. Please start again.', 'error');
      router.replace('/(auth)/forgot-password');
    }
  }, [email, router, showToast]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer]);

  const handleVerify = async () => {
    const code = otp.replace(/\D/g, '');
    if (code.length < 6) {
      showToast('Please enter the complete 6-digit code', 'error');
      return;
    }

    setLoading(true);
    try {
      await postAuthRecovery('/auth/verify-reset-code', { email, otp: code });
      showToast('Code verified!', 'success');
      router.push({
        pathname: '/(auth)/reset-password',
        params: { email, otp: code },
      });
    } catch (err: unknown) {
      showToast(getRecoveryErrorMessage(err, 'Invalid OTP'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0 || !email) return;

    setLoading(true);
    try {
      const data = await postAuthRecovery<{ message: string; devOtp?: string }>(
        '/auth/forgot-password',
        { email }
      );
      if (__DEV__ && data.devOtp) {
        showToast(`Dev OTP: ${data.devOtp}`, 'info');
      } else {
        showToast('New code sent!', 'success');
      }
      setTimer(60);
      setOtp('');
    } catch (err: unknown) {
      showToast(getRecoveryErrorMessage(err, 'Failed to resend code'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color="#0F172A" />
        </TouchableOpacity>

        <LogoSection />

        <View style={styles.card}>
          <Text style={styles.title}>Verification Code</Text>
          <Text style={styles.subtitle}>Enter the 6-digit code sent to {email}</Text>

          <OTPInput value={otp} onChange={setOtp} />

          <TouchableOpacity
            onPress={handleResend}
            disabled={timer > 0 || loading}
            style={styles.resendBtn}
            activeOpacity={0.7}
          >
            {timer > 0 ? (
              <Text style={styles.resendText}>
                Resend code in <Text style={styles.timer}>{timer}s</Text>
              </Text>
            ) : (
              <View style={styles.resendActive}>
                <RefreshCw size={14} color="#10B981" />
                <Text style={[styles.resendText, { color: '#10B981' }]}>Resend OTP</Text>
              </View>
            )}
          </TouchableOpacity>

          <PrimaryButton
            title="Verify Code"
            onPress={handleVerify}
            loading={loading}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 36,
  },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 24,
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    zIndex: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 3,
  },
  title: {
    color: '#0F172A',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
    lineHeight: 18,
  },
  resendBtn: {
    alignSelf: 'center',
    marginBottom: 24,
  },
  resendText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },
  timer: {
    color: '#10B981',
    fontWeight: '800',
  },
  resendActive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
