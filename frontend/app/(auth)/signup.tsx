import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Animated
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { Mail, Lock, Eye, EyeOff, User, Chrome, Github, UserPlus } from 'lucide-react-native';
import WelcomeModal from '@/components/WelcomeModal';
import { useToast } from '@/components/Toast';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  
  const { signup, user } = useAuth();
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

  const calculatePasswordStrength = (pass: string) => {
    let strength = 0;
    if (pass.length > 5) strength += 1;
    if (pass.length > 8) strength += 1;
    if (/[A-Z]/.test(pass)) strength += 1;
    if (/[0-9]/.test(pass)) strength += 1;
    if (/[^A-Za-z0-9]/.test(pass)) strength += 1;
    return Math.min(4, strength);
  };

  const strength = calculatePasswordStrength(password);
  const strengthColors = ['#334155', '#EF4444', '#F59E0B', '#10B981', '#10B981'];
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

  const handleSignup = async () => {
    const newErrors: any = {};
    if (!name) newErrors.name = 'Full name is required';
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
      await signup(name, email, password, 'user');
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
        
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], alignItems: 'center', marginBottom: 32 }}>
          <View style={s.logoWrapper}>
            <UserPlus size={36} color="#10B981" />
          </View>
          <Text style={s.title}>Join Elite Fitness</Text>
          <Text style={s.subtitle}>Create your account and transform your body</Text>
        </Animated.View>

        <Animated.View style={[s.formCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          
          {/* Name Input */}
          <View style={s.inputContainer}>
            <Text style={s.inputLabel}>Full Name</Text>
            <View style={[s.inputWrapper, errors.name && s.inputError]}>
              <User size={18} color="#64748B" style={s.inputIcon} />
              <TextInput
                style={s.inputField}
                placeholder="e.g. John Doe"
                placeholderTextColor="#64748B"
                value={name}
                onChangeText={t => { setName(t); if(errors.name) setErrors({...errors, name: null}); }}
                editable={!loading}
              />
            </View>
            {errors.name && <Text style={s.errorText}>{errors.name}</Text>}
          </View>

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
                placeholder="Create a password"
                placeholderTextColor="#64748B"
                value={password}
                onChangeText={t => { setPassword(t); if(errors.password) setErrors({...errors, password: null}); }}
                secureTextEntry={!showPassword}
                autoComplete="new-password"
                textContentType="newPassword"
                editable={!loading}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={s.eyeBtn}>
                {showPassword ? <EyeOff size={18} color="#64748B" /> : <Eye size={18} color="#64748B" />}
              </TouchableOpacity>
            </View>
            
            {/* Password Strength */}
            {password.length > 0 && (
              <View style={s.strengthContainer}>
                <View style={s.strengthBars}>
                  {[1,2,3,4].map(idx => (
                    <View key={idx} style={[s.strengthBar, { backgroundColor: strength >= idx ? strengthColors[strength] : '#334155' }]} />
                  ))}
                </View>
                <Text style={[s.strengthText, { color: strengthColors[strength] }]}>{strengthLabels[strength]}</Text>
              </View>
            )}
            {errors.password && <Text style={s.errorText}>{errors.password}</Text>}
          </View>

          <TouchableOpacity onPress={handleSignup} disabled={loading} activeOpacity={0.8} style={s.primaryBtnWrapper}>
            <LinearGradient colors={['#10B981', '#059669']} style={s.primaryBtn}>
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={s.primaryBtnText}>Create Account</Text>}
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
            <Text style={s.footerLabel}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={s.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </View>

        </Animated.View>
      </ScrollView>

      <WelcomeModal
        visible={showWelcome}
        onClose={() => { 
          setShowWelcome(false); 
          setTimeout(() => {
            router.replace('/(tabs)/' as any);
          }, 350);
        }}
        userName={name}
        isNewUser={true}
      />
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  background: { ...StyleSheet.absoluteFillObject },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40, justifyContent: 'center' , maxWidth: 450, width: '100%', alignSelf: 'center' },
  
  logoWrapper: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(16,185,129,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)' },
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

  strengthContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingHorizontal: 4 },
  strengthBars: { flexDirection: 'row', gap: 4, flex: 1, marginRight: 16 },
  strengthBar: { flex: 1, height: 4, borderRadius: 2 },
  strengthText: { fontSize: 11, fontWeight: '800', width: 40, textAlign: 'right', textTransform: 'uppercase' },

  primaryBtnWrapper: { borderRadius: 16, overflow: 'hidden', marginTop: 12, marginBottom: 32 },
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
  footerLink: { color: '#10B981', fontSize: 14, fontWeight: '800' }
});
