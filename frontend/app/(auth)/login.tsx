import React, { useState, useRef } from 'react';
import {
  View, TextInput, TouchableOpacity, Text,
  Alert, KeyboardAvoidingView, Platform,
  ScrollView, Animated, StyleSheet,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Theme';
import { Mail, Lock, LogIn, Eye, EyeOff, Dumbbell } from 'lucide-react-native';
import WelcomeModal from '@/components/WelcomeModal';
import { LinearGradient } from 'expo-linear-gradient';

function AuthInput({
  icon: Icon, placeholder, value, onChangeText,
  secureTextEntry = false, keyboardType = 'default',
  autoCapitalize = 'none', editable = true,
  rightElement,
}: any) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[ai.wrap, focused && ai.wrapFocused]}>
      <View style={ai.iconBox}>
        <Icon size={19} color={focused ? Colors.primary : Colors.textSecondary} strokeWidth={2} />
      </View>
      <TextInput
        style={ai.input}
        placeholder={placeholder}
        placeholderTextColor={Colors.textSecondary}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        editable={editable}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        selectionColor={Colors.primary}
      />
      {rightElement}
    </View>
  );
}
const ai = StyleSheet.create({
  wrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.inputBg, borderRadius: 18,
    paddingHorizontal: 16, marginBottom: 14,
    borderWidth: 1.5, borderColor: Colors.border,
    height: 58,
  },
  wrapFocused: {
    borderColor: Colors.primary + '70',
    backgroundColor: Colors.primary + '08',
  },
  iconBox: { marginRight: 12 },
  input: {
    flex: 1, color: Colors.text, fontSize: 16,
    fontWeight: '500', paddingVertical: 0,
  },
});

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const router = useRouter();
  const [showWelcome, setShowWelcome] = useState(false);

  const btnScale = useRef(new Animated.Value(1)).current;
  const pressIn  = () => Animated.spring(btnScale, { toValue: 0.97, useNativeDriver: true, speed: 40 }).start();
  const pressOut = () => Animated.spring(btnScale, { toValue: 1,    useNativeDriver: true, speed: 30 }).start();

  const handleLogin = async () => {
    if (!email || !password) { Alert.alert('Required', 'Please enter email and password.'); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { Alert.alert('Invalid Email', 'Enter a valid email address.'); return; }
    if (password.length < 6) { Alert.alert('Too Short', 'Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      await login(email, password);
      setShowWelcome(true);
    } catch (error) {
      Alert.alert('Login Failed', (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: Colors.background }}
    >
      <LinearGradient
        colors={[Colors.primary + '18', Colors.primary + '06', 'transparent']}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 320 }}
      />
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo area */}
        <View style={s.logoWrap}>
          <LinearGradient colors={[Colors.primary + '30', Colors.primary + '10']} style={s.logoRing}>
            <Dumbbell size={40} color={Colors.primary} strokeWidth={1.6} />
          </LinearGradient>
          <Text style={s.appName}>FITNESS TRACKER PRO</Text>
        </View>

        {/* Card */}
        <View style={s.card}>
          <Text style={s.title}>Welcome Back</Text>
          <Text style={s.subtitle}>Sign in to continue your journey</Text>

          <AuthInput
            icon={Mail} placeholder="Email Address"
            value={email} onChangeText={setEmail}
            keyboardType="email-address" editable={!loading}
          />
          <AuthInput
            icon={Lock} placeholder="Password"
            value={password} onChangeText={setPassword}
            secureTextEntry={!showPass} editable={!loading}
            rightElement={
              <TouchableOpacity onPress={() => setShowPass(p => !p)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                {showPass
                  ? <EyeOff size={18} color={Colors.textSecondary} />
                  : <Eye    size={18} color={Colors.textSecondary} />}
              </TouchableOpacity>
            }
          />

          <TouchableOpacity
            onPress={() => router.push('/(auth)/forgot-password' as any)}
            style={s.forgotWrap}
          >
            <Text style={s.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Primary button */}
          <Animated.View style={{ transform: [{ scale: btnScale }] }}>
            <TouchableOpacity
              onPressIn={pressIn} onPressOut={pressOut}
              onPress={handleLogin} disabled={loading}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={[Colors.primary, '#9FE800']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={[s.btn, loading && { opacity: 0.65 }]}
              >
                <LogIn size={20} color="#000" strokeWidth={2.5} />
                <Text style={s.btnText}>{loading ? 'SIGNING IN…' : 'SIGN IN'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Divider */}
          <View style={s.divider}>
            <View style={s.divLine} />
            <Text style={s.divText}>OR</Text>
            <View style={s.divLine} />
          </View>

          {/* Sign-up link */}
          <View style={s.footerRow}>
            <Text style={s.footerLabel}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
              <Text style={s.footerLink}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <WelcomeModal
        visible={showWelcome}
        onClose={() => { setShowWelcome(false); router.replace('/(tabs)/' as any); }}
        userName={user?.name || 'Athlete'}
        isNewUser={false}
      />
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 },
  logoWrap: { alignItems: 'center', marginBottom: 32 },
  logoRing: {
    width: 88, height: 88, borderRadius: 28,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 16, borderWidth: 1.5, borderColor: Colors.primary + '35',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 16, elevation: 10,
  },
  appName: {
    color: Colors.primary, fontSize: 11, fontWeight: '900',
    letterSpacing: 3, textTransform: 'uppercase',
  },
  card: {
    backgroundColor: '#161616', borderRadius: 32, padding: 28,
    borderWidth: 1, borderColor: '#242424',
    shadowColor: '#000', shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.5, shadowRadius: 32, elevation: 18,
  },
  title: {
    color: Colors.text, fontSize: 28, fontWeight: '900',
    letterSpacing: -0.8, textAlign: 'center', marginBottom: 8,
  },
  subtitle: {
    color: Colors.textSecondary, fontSize: 14, fontWeight: '500',
    textAlign: 'center', marginBottom: 28, lineHeight: 21,
  },
  forgotWrap: { alignSelf: 'flex-end', marginBottom: 20, marginTop: 2 },
  forgotText: { color: Colors.primary, fontSize: 13, fontWeight: '700' },
  btn: {
    height: 62, borderRadius: 20, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 12,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45, shadowRadius: 18, elevation: 12,
  },
  btnText: { color: '#000', fontSize: 16, fontWeight: '900', letterSpacing: 1 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 24 },
  divLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  divText: { color: Colors.textSecondary, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  footerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  footerLabel: { color: Colors.textSecondary, fontSize: 14, fontWeight: '500' },
  footerLink: { color: Colors.primary, fontSize: 14, fontWeight: '800' },
});
