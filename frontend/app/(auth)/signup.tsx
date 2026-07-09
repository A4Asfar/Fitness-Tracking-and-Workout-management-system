import React, { useState } from 'react';
import {
  View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { Mail, User } from 'lucide-react-native';
import WelcomeModal from '@/components/WelcomeModal';
import { useToast } from '@/components/Toast';

// Extracted Auth Components
import LogoSection from '@/components/auth/LogoSection';
import InputField from '@/components/auth/InputField';
import PasswordField from '@/components/auth/PasswordField';
import PrimaryButton from '@/components/auth/PrimaryButton';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [membershipType, setMembershipType] = useState('free');
  const [errors, setErrors] = useState<any>({});
  const { signup, user } = useAuth();
  const router = useRouter();
  const [showWelcome, setShowWelcome] = useState(false);
  const { showToast } = useToast();

  const handleSignup = async () => {
    const newErrors: any = {};
    if (!name) newErrors.name = 'Full name is required';
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
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirm password is required';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast('Please correct the highlighted errors.', 'error'); 
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      await signup(name, email, password, membershipType);
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
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to customize your training plan</Text>

          <InputField 
            label="Full Name"
            icon={User}
            placeholder="e.g. John Doe"
            value={name}
            onChangeText={(txt) => {
              setName(txt);
              if (errors.name) setErrors({ ...errors, name: null });
            }}
            error={errors.name}
            editable={!loading}
          />

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
            placeholder="Min 6 characters"
            value={password}
            onChangeText={(txt) => {
              setPassword(txt);
              if (errors.password) setErrors({ ...errors, password: null });
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
              if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: null });
            }}
            error={errors.confirmPassword}
            editable={!loading}
          />

          {/* Membership tier selector */}
          <Text style={styles.tierLabel}>Select Membership Plan</Text>
          <View style={styles.planSelector}>
            <TouchableOpacity
              onPress={() => setMembershipType('free')}
              activeOpacity={0.8}
              style={[styles.planBtn, membershipType === 'free' && styles.planBtnActive]}
            >
              <Text style={[styles.planText, membershipType === 'free' && styles.planTextActive]}>Free Tier</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setMembershipType('premium')}
              activeOpacity={0.8}
              style={[styles.planBtn, membershipType === 'premium' && styles.planBtnActive]}
            >
              <Text style={[styles.planText, membershipType === 'premium' && styles.planTextActive]}>Premium Pro</Text>
            </TouchableOpacity>
          </View>

          <PrimaryButton 
            title="Create Account"
            onPress={handleSignup}
            loading={loading}
          />

          {/* Footer Switch */}
          <View style={styles.footer}>
            <Text style={styles.footerLabel}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.footerLink}>Sign In</Text>
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
        isNewUser={true}
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
  tierLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
  },
  planSelector: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    padding: 4,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  planBtn: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  planText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
  },
  planTextActive: {
    color: '#10B981',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 20,
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
