import React, { useState } from 'react';
import {
  View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { Mail, Github, Chrome } from 'lucide-react-native';
import WelcomeModal from '@/components/WelcomeModal';
import { useToast } from '@/components/Toast';

// Extracted Auth Components
import LogoSection from '@/components/auth/LogoSection';
import InputField from '@/components/auth/InputField';
import PasswordField from '@/components/auth/PasswordField';
import PrimaryButton from '@/components/auth/PrimaryButton';
import SocialButton from '@/components/auth/SocialButton';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const router = useRouter();
  const [showWelcome, setShowWelcome] = useState(false);
  const { showToast } = useToast();

  const handleLogin = async () => {
    const newErrors: any = {};
    if (!email) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) { 
      newErrors.email = 'Enter a valid email address';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) { 
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast('Please correct the highlighted errors.', 'error'); 
      return; 
    }

    setErrors({});
    setLoading(true);
    try {
      await login(email, password);
      setShowWelcome(true);
    } catch (error) {
      showToast((error as Error).message, 'error');
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
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue your elite training</Text>

          <InputField 
            label="Email Address"
            icon={Mail}
            placeholder="e.g. champion@fitai.com"
            value={email}
            onChangeText={(txt) => {
              setEmail(txt);
              if (errors.email) setErrors({ ...errors, email: null });
            }}
            keyboardType="email-address"
            error={errors.email}
            editable={!loading}
          />

          <PasswordField 
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={(txt) => {
              setPassword(txt);
              if (errors.password) setErrors({ ...errors, password: null });
            }}
            error={errors.password}
            editable={!loading}
          />

          <TouchableOpacity
            onPress={() => router.push('/(auth)/forgot-password' as any)}
            style={styles.forgotBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <PrimaryButton 
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
          />

          {/* Social Sep */}
          <View style={styles.sepRow}>
            <View style={styles.sepLine} />
            <Text style={styles.sepText}>OR CONTINUE WITH</Text>
            <View style={styles.sepLine} />
          </View>

          <View style={styles.socialRow}>
            <SocialButton provider="Google" icon={Chrome} />
            <SocialButton provider="Apple" icon={Github} />
          </View>

          {/* Footer Switch */}
          <View style={styles.footer}>
            <Text style={styles.footerLabel}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
              <Text style={styles.footerLink}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <WelcomeModal
        visible={showWelcome}
        onClose={() => { 
          setShowWelcome(false); 
          setTimeout(() => {
            if (user?.membershipType === 'admin') {
              router.replace('/admin-dashboard' as any);
            } else {
              router.replace('/(tabs)/' as any);
            }
          }, 350); // Wait for native modal fade animation to finish
        }}
        userName={user?.name || 'Athlete'}
        isNewUser={false}
      />
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
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  forgotText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '800',
  },
  sepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 18,
  },
  sepLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: '#F1F5F9',
  },
  sepText: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 24,
  },
  footerLabel: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },
  footerLink: {
    color: '#10B981',
    fontSize: 13,
    fontWeight: '800',
  },
});
