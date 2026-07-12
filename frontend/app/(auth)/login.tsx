import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Animated
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react-native';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import WelcomeModal from '@/components/WelcomeModal';
import { useToast } from '@/components/Toast';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  
  const { login, user, loginWithGoogle, requestConfig } = useAuth();
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

        <Animated.View style={[s.formCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={s.inputContainer}>
            <Text style={s.inputLabel}>Email Address</Text>
            <View style={[s.inputWrapper, errors.email && s.inputError]}>
              <Mail color="#64748B" size={20} style={s.inputIcon} />
              <TextInput
                style={s.inputField}
                placeholder="Enter your email"
                placeholderTextColor="#64748B"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            {errors.email && <Text style={s.errorText}>{errors.email}</Text>}
          </View>

          <View style={s.inputContainer}>
            <Text style={s.inputLabel}>Password</Text>
            <View style={[s.inputWrapper, errors.password && s.inputError]}>
              <Lock color="#64748B" size={20} style={s.inputIcon} />
              <TextInput
                style={s.inputField}
                placeholder="Enter your password"
                placeholderTextColor="#64748B"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={s.eyeBtn}>
                {showPassword ? <EyeOff color="#64748B" size={20} /> : <Eye color="#64748B" size={20} />}
              </TouchableOpacity>
            </View>
            {errors.password && <Text style={s.errorText}>{errors.password}</Text>}
          </View>

          <TouchableOpacity style={s.forgotBtn} onPress={() => router.push('/(auth)/forgot-password' as any)}>
            <Text style={s.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.primaryBtnWrapper}
            onPress={handleLogin}
            disabled={loading}
          >
            <LinearGradient
              colors={['#38BDF8', '#0284C7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={s.primaryBtn}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={s.primaryBtnText}>Sign In</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        <View style={{ marginTop: 24, alignItems: 'center' }}>
          <View style={s.sepRow}>
            <View style={s.sepLine} />
            <Text style={s.sepText}>OR CONTINUE WITH</Text>
            <View style={s.sepLine} />
          </View>

          <GoogleSignInButton />

          {/* MASSIVE OAUTH FORENSIC AUDIT ON-SCREEN */}
          <View style={{ marginTop: 20, padding: 10, backgroundColor: '#ffebee', borderRadius: 8 }}>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#c62828', marginBottom: 5 }}>RUNTIME FORENSIC DIAGNOSTICS</Text>
            <Text style={{ fontSize: 10, color: '#b71c1c' }}>
              NODE_ENV: {process.env.NODE_ENV}
            </Text>
            <Text style={{ fontSize: 10, color: '#b71c1c' }}>
              EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: {process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ? `'${process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID}'` : 'UNDEFINED'}
            </Text>
            <Text style={{ fontSize: 10, color: '#b71c1c' }}>
              Client ID Used by Request: {requestConfig?.clientId || 'Loading...'}
            </Text>
            <Text style={{ fontSize: 10, color: '#b71c1c' }}>
              Redirect URI: {requestConfig?.redirectUri || 'Loading...'}
            </Text>
            <Text style={{ fontSize: 10, color: '#b71c1c' }}>
              Scopes: {requestConfig?.scopes?.join(', ') || 'Loading...'}
            </Text>
          </View>

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
  
  formCard: { backgroundColor: '#1E293B', borderRadius: 32, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', shadowColor: '#000', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.3, shadowRadius: 30, elevation: 10 },
  
  inputContainer: { marginBottom: 20 },
  inputLabel: { color: '#94A3B8', fontSize: 13, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A', borderRadius: 16, height: 56, paddingHorizontal: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  inputError: { borderColor: '#EF4444', backgroundColor: 'rgba(239,68,68,0.05)' },
  inputIcon: { marginRight: 12 },
  inputField: { flex: 1, color: '#F8FAFC', fontSize: 16, fontWeight: '600' },
  eyeBtn: { padding: 4 },
  errorText: { color: '#EF4444', fontSize: 12, fontWeight: '600', marginTop: 8, marginLeft: 4 },

  forgotBtn: { alignSelf: 'flex-end', marginBottom: 24 },
  forgotText: { color: '#38BDF8', fontSize: 13, fontWeight: '800' },

  primaryBtnWrapper: { borderRadius: 16, overflow: 'hidden', marginBottom: 32 },
  primaryBtn: { height: 56, justifyContent: 'center', alignItems: 'center' },
  primaryBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },

  sepRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  sepLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.05)' },
  sepText: { color: '#64748B', fontSize: 10, fontWeight: '800', letterSpacing: 1, paddingHorizontal: 12 },



  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  footerLabel: { color: '#94A3B8', fontSize: 14, fontWeight: '500' },
  footerLink: { color: '#38BDF8', fontSize: 14, fontWeight: '800' }
});
