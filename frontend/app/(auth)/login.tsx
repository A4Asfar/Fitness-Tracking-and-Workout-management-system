import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Animated
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react-native';

import WelcomeModal from '@/components/WelcomeModal';
import { useToast } from '@/components/Toast';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { SharedStyles } from '@/constants/Theme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  
  const { login, user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [showWelcome, setShowWelcome] = useState(false);
  const { showToast } = useToast();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true })
    ]).start();
  }, []);

  const handleLogin = async () => {
    const newErrors: any = {};
    if (!email) newErrors.email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Enter a valid email address';
    
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';

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
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient colors={['#0F172A', '#1E293B']} style={s.background} />
      
      <ScrollView 
        contentContainerStyle={[s.scroll, { paddingTop: Math.max(insets.top, 20) }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View style={{ alignItems: 'center', marginBottom: 40, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <View style={s.logoWrapper}>
            <ShieldCheck size={40} color="#38BDF8" />
          </View>
          <Text style={s.title}>Welcome Back</Text>
          <Text style={s.subtitle}>Sign in to continue your fitness journey</Text>
        </Animated.View>

        <Animated.View style={[SharedStyles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Input
            label="Email Address"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            icon={Mail}
            error={errors.email}
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            isPassword
            icon={Lock}
            error={errors.password}
          />

          <TouchableOpacity style={s.forgotBtn} onPress={() => router.push('/(auth)/forgot-password' as any)}>
            <Text style={s.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            style={{ marginBottom: 16 }}
          />
        </Animated.View>

        <View style={{ marginTop: 24, alignItems: 'center' }}>


          <View style={s.footer}>
            <Text style={s.footerLabel}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
              <Text style={s.footerLink}>Create Account</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>

      <WelcomeModal
        visible={showWelcome}
        onClose={() => { 
          setShowWelcome(false); 
          setTimeout(() => {
            if (user?.membershipType === 'admin') router.replace('/admin-dashboard' as any);
            else router.replace('/(tabs)/' as any);
          }, 350);
        }}
        userName={user?.name || 'Athlete'}
        isNewUser={false}
      />
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  background: { ...StyleSheet.absoluteFillObject },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40, justifyContent: 'center' , maxWidth: 450, width: '100%', alignSelf: 'center' },
  
  logoWrapper: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(56,189,248,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: 'rgba(56,189,248,0.2)' },
  title: { flexShrink: 1,  color: '#F8FAFC', fontSize: 28, fontWeight: '900', letterSpacing: -0.5, marginBottom: 8 },
  subtitle: { flexShrink: 1,  color: '#94A3B8', fontSize: 15, fontWeight: '500' },
  
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 24, marginTop: -8 },
  forgotText: { color: '#38BDF8', fontSize: 13, fontWeight: '800' },



  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  footerLabel: { color: '#94A3B8', fontSize: 14, fontWeight: '500' },
  footerLink: { color: '#38BDF8', fontSize: 14, fontWeight: '800' }
});
