import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Animated
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { Mail, Lock, Eye, EyeOff, Github, Chrome, ShieldCheck } from 'lucide-react-native';
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
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.container}>
      <LinearGradient colors={['#0F172A', '#1E293B']} style={s.background} />
      
      <ScrollView contentContainerStyle={[s.scroll, { paddingTop: insets.top + 40 }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], alignItems: 'center', marginBottom: 40 }}>
          <View style={s.logoWrapper}>
            <ShieldCheck size={40} color="#38BDF8" />
          </View>
          <Text style={s.title}>Welcome Back</Text>
          <Text style={s.subtitle}>Sign in to continue your elite training</Text>
        </Animated.View>

        <Animated.View style={[s.formCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          
          {/* Email Input */}
          <View style={s.inputContainer}>
            <Text style={s.inputLabel}>Email Address</Text>
            <View style={[s.inputWrapper, errors.email && s.inputError]}>
              <Mail size={18} color="#64748B" style={s.inputIcon} />
              <TextInput
                style={s.inputField}
                placeholder="Enter your email"
                placeholderTextColor="#64748B"
                value={email}
                onChangeText={t => { setEmail(t); if(errors.email) setErrors({...errors, email: null}); }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
                editable={!loading}
              />
            </View>
            {errors.email && <Text style={s.errorText}>{errors.email}</Text>}
          </View>

          {/* Password Input */}
          <View style={s.inputContainer}>
            <Text style={s.inputLabel}>Password</Text>
            <View style={[s.inputWrapper, errors.password && s.inputError]}>
              <Lock size={18} color="#64748B" style={s.inputIcon} />
              <TextInput
                style={s.inputField}
                placeholder="Enter your password"
                placeholderTextColor="#64748B"
                value={password}
                onChangeText={t => { setPassword(t); if(errors.password) setErrors({...errors, password: null}); }}
                secureTextEntry={!showPassword}
                autoComplete="password"
                textContentType="password"
                editable={!loading}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={s.eyeBtn}>
                {showPassword ? <EyeOff size={18} color="#64748B" /> : <Eye size={18} color="#64748B" />}
              </TouchableOpacity>
            </View>
            {errors.password && <Text style={s.errorText}>{errors.password}</Text>}
          </View>

          <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password' as any)} style={s.forgotBtn} activeOpacity={0.7}>
            <Text style={s.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleLogin} disabled={loading} activeOpacity={0.8} style={s.primaryBtnWrapper}>
            <LinearGradient colors={['#38BDF8', '#0284C7']} style={s.primaryBtn}>
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={s.primaryBtnText}>Sign In</Text>}
            </LinearGradient>
          </TouchableOpacity>

          {/* Social Separator */}
          <View style={s.sepRow}>
            <View style={s.sepLine} />
            <Text style={s.sepText}>OR CONTINUE WITH</Text>
            <View style={s.sepLine} />
          </View>

          <View style={s.socialRow}>
            <TouchableOpacity style={s.socialBtn} activeOpacity={0.7}>
              <Chrome size={20} color="#F8FAFC" />
              <Text style={s.socialBtnText}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.socialBtn} activeOpacity={0.7}>
              <Github size={20} color="#F8FAFC" />
              <Text style={s.socialBtnText}>Apple</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={s.footer}>
            <Text style={s.footerLabel}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
              <Text style={s.footerLink}>Create Account</Text>
            </TouchableOpacity>
          </View>

        </Animated.View>
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

  socialRow: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  socialBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 52, backgroundColor: '#0F172A', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', gap: 8 },
  socialBtnText: { color: '#F8FAFC', fontSize: 14, fontWeight: '700' },

  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  footerLabel: { color: '#94A3B8', fontSize: 14, fontWeight: '500' },
  footerLink: { color: '#38BDF8', fontSize: 14, fontWeight: '800' }
});
