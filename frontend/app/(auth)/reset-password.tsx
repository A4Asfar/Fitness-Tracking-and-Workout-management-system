import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useToast } from '@/components/Toast';
import { getRecoveryErrorMessage, postAuthRecovery } from '@/services/authRecovery';

import LogoSection from '@/components/auth/LogoSection';
import PasswordField from '@/components/auth/PasswordField';
import PrimaryButton from '@/components/auth/PrimaryButton';

export default function ResetPasswordScreen() {
  const { email: emailParam, otp: otpParam } = useLocalSearchParams<{ email: string; otp: string }>();
  const email = String(emailParam || '').trim().toLowerCase();
  const otp = String(otpParam || '').trim();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});

  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    if (!email || !otp) {
      showToast('Session expired. Please verify your email again.', 'error');
      router.replace('/(auth)/forgot-password');
    }
  }, [email, otp, router, showToast]);

  const handleReset = async () => {
    const newErrors: { password?: string; confirm?: string } = {};
    if (password.length < 6) newErrors.password = 'Minimum 6 characters required';
    if (password !== confirmPassword) newErrors.confirm = 'Passwords do not match';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await postAuthRecovery('/auth/reset-password', { email, otp, password });
      showToast('Password reset successful! Please sign in.', 'success');
      router.replace('/(auth)/login');
    } catch (err: unknown) {
      showToast(getRecoveryErrorMessage(err, 'Reset failed'), 'error');
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
          <Text style={styles.title}>Create New Password</Text>
          <Text style={styles.subtitle}>
            Set a new password for {email}
          </Text>

          <PasswordField
            label="New Password"
            placeholder="Min 6 characters"
            value={password}
            onChangeText={(txt) => {
              setPassword(txt);
              setErrors({});
            }}
            error={errors.password}
            editable={!loading}
          />

          <PasswordField
            label="Confirm New Password"
            placeholder="Re-enter new password"
            value={confirmPassword}
            onChangeText={(txt) => {
              setConfirmPassword(txt);
              setErrors({});
            }}
            error={errors.confirm}
            editable={!loading}
          />

          <PrimaryButton
            title="Update Password"
            onPress={handleReset}
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
    marginBottom: 24,
    lineHeight: 18,
  },
});
