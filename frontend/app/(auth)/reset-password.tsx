import React, { useState } from 'react';
import {
  View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useToast } from '@/components/Toast';
import api from '@/services/api';

// Extracted Auth Components
import LogoSection from '@/components/auth/LogoSection';
import PasswordField from '@/components/auth/PasswordField';
import PrimaryButton from '@/components/auth/PrimaryButton';

export default function ResetPasswordScreen() {
  const { email, otp } = useLocalSearchParams<{ email: string, otp: string }>();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});
  
  const router = useRouter();
  const { showToast } = useToast();

  const handleReset = async () => {
    const newErrors: any = {};
    if (password.length < 6) newErrors.password = 'Minimum 6 characters required';
    if (password !== confirmPassword) newErrors.confirm = 'Passwords do not match';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, otp, password });
      showToast('Password reset successful! Please login.', 'success');
      router.replace('/(auth)/login' as any);
    } catch (err: any) {
      showToast(err.message || 'Reset failed', 'error');
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
        <LogoSection />

        <View style={styles.card}>
          <Text style={styles.title}>New Password</Text>
          <Text style={styles.subtitle}>Set a strong password to protect your account</Text>

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
            label="Confirm Password"
            placeholder="Re-enter password"
            value={confirmPassword}
            onChangeText={(txt) => {
              setConfirmPassword(txt);
              setErrors({});
            }}
            error={errors.confirm}
            editable={!loading}
          />

          <PrimaryButton 
            title="Reset Password"
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
