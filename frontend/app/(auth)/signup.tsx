import React, { useState, useRef } from 'react';
import {
  View, TextInput, TouchableOpacity, Text,
  Alert, KeyboardAvoidingView, Platform,
  ScrollView, Animated, StyleSheet,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Theme';
import { Mail, Lock, User, UserPlus, Eye, EyeOff, Dumbbell } from 'lucide-react-native';
import WelcomeModal from '@/components/WelcomeModal';
import { LinearGradient } from 'expo-linear-gradient';

function AuthInput({
  icon: Icon, placeholder, value, onChangeText,
  secureTextEntry = false, keyboardType = 'default',
  autoCapitalize = 'sentences', editable = true, rightElement,
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
    borderWidth: 1.5, borderColor: Colors.border, height: 58,
  },
  wrapFocused: { borderColor: Colors.primary + '70', backgroundColor: Colors.primary + '08' },
  iconBox: { marginRight: 12 },
  input: { flex: 1, color: Colors.text, fontSize: 16, fontWeight: '500', paddingVertical: 0 },
});

export default function SignupScreen() {
  const [name,            setName]            = useState('');
  const [email,           setEmail]           = useState('');
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass,        setShowPass]        = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);
  const [loading,         setLoading]         = useState(false);
  const { signup } = useAuth();
  const router = useRouter();
  const [showWelcome, setShowWelcome] = useState(false);

  const btnScale = useRef(new Animated.Value(1)).current;
  const pressIn  = () => Animated.spring(btnScale, { toValue: 0.97, useNativeDriver: true, speed: 40 }).start();
  const pressOut = () => Animated.spring(btnScale, { toValue: 1,    useNativeDriver: true, speed: 30 }).start();

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Required', 'Please fill in all fields.'); return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Invalid Email', 'Enter a valid email address.'); return;
    }
    if (password.length < 6) {
      Alert.alert('Too Short', 'Password must be at least 6 characters.'); return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Mismatch', 'Passwords do not match.'); return;
    }
    setLoading(true);
    try {
      await signup(name, email, password);
      setShowWelcome(true);
    } catch (error) {
      Alert.alert('Registration Error', (error as Error).message);
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
        style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 300 }}
      />
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View style={s.logoWrap}>
          <LinearGradient colors={[Colors.primary + '30', Colors.primary + '10']} style={s.logoRing}>
            <Dumbbell size={40} color={Colors.primary} strokeWidth={1.6} />
          </LinearGradient>
          <Text style={s.appName}>FITNESS TRACKER PRO</Text>
        </View>

        <View style={s.card}>
          <Text style={s.title}>Create Account</Text>
          <Text style={s.subtitle}>Start your fitness journey today</Text>

          <AuthInput icon={User} placeholder="Full Name" value={name} onChangeText={setName} autoCapitalize="words" editable={!loading} />
          <AuthInput icon={Mail} placeholder="Email Address" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" editable={!loading} />
          <AuthInput
            icon={Lock} placeholder="Password" value={password} onChangeText={setPassword}
            secureTextEntry={!showPass} editable={!loading}
            rightElement={
              <TouchableOpacity onPress={() => setShowPass(p => !p)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                {showPass ? <EyeOff size={18} color={Colors.textSecondary} /> : <Eye size={18} color={Colors.textSecondary} />}
              </TouchableOpacity>
            }
          />
          <AuthInput
            icon={Lock} placeholder="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirm} editable={!loading}
            rightElement={
              <TouchableOpacity onPress={() => setShowConfirm(p => !p)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                {showConfirm ? <EyeOff size={18} color={Colors.textSecondary} /> : <Eye size={18} color={Colors.textSecondary} />}
              </TouchableOpacity>
            }
          />

          {/* Password strength hint */}
          <Text style={s.hint}>Password must be at least 6 characters</Text>

          <Animated.View style={{ transform: [{ scale: btnScale }] }}>
            <TouchableOpacity
              onPressIn={pressIn} onPressOut={pressOut}
              onPress={handleSignup} disabled={loading} activeOpacity={0.9}
            >
              <LinearGradient
                colors={[Colors.primary, '#9FE800']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={[s.btn, loading && { opacity: 0.65 }]}
              >
                <UserPlus size={20} color="#000" strokeWidth={2.5} />
                <Text style={s.btnText}>{loading ? 'CREATING ACCOUNT…' : 'CREATE ACCOUNT'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          <View style={s.divider}>
            <View style={s.divLine} />
            <Text style={s.divText}>ALREADY HAVE AN ACCOUNT?</Text>
            <View style={s.divLine} />
          </View>

          <TouchableOpacity style={s.loginBtn} onPress={() => router.push('/(auth)/login')}>
            <Text style={s.loginBtnText}>Sign In Instead</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <WelcomeModal
        visible={showWelcome}
        onClose={() => { setShowWelcome(false); router.replace('/(tabs)/' as any); }}
        userName={name}
      />
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 },
  logoWrap: { alignItems: 'center', marginBottom: 28 },
  logoRing: {
    width: 88, height: 88, borderRadius: 28,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 14, borderWidth: 1.5, borderColor: Colors.primary + '35',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 16, elevation: 10,
  },
  appName: { color: Colors.primary, fontSize: 11, fontWeight: '900', letterSpacing: 3, textTransform: 'uppercase' },
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
    textAlign: 'center', marginBottom: 24, lineHeight: 21,
  },
  hint: { color: Colors.textSecondary, fontSize: 11, fontWeight: '600', marginBottom: 16, marginTop: -6, marginLeft: 4 },
  btn: {
    height: 62, borderRadius: 20, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 12,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45, shadowRadius: 18, elevation: 12,
  },
  btnText: { color: '#000', fontSize: 15, fontWeight: '900', letterSpacing: 0.8 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 24 },
  divLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  divText: { color: Colors.textSecondary, fontSize: 9, fontWeight: '800', letterSpacing: 1.5 },
  loginBtn: {
    height: 58, borderRadius: 20, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: Colors.primary + '40', backgroundColor: Colors.primary + '0C',
  },
  loginBtnText: { color: Colors.primary, fontSize: 15, fontWeight: '800', letterSpacing: 0.5 },
});
