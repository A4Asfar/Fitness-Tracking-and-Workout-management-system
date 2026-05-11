import React, { useState, useRef } from 'react';
import {
  View, TextInput, TouchableOpacity, Text,
  KeyboardAvoidingView, Platform,
  ScrollView, Animated, StyleSheet,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/Theme';
import { Lock, Eye, EyeOff, CheckCircle2, Dumbbell } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useToast } from '@/components/Toast';
import api from '@/services/api';

function AuthInput({
  icon: Icon, placeholder, value, onChangeText,
  secureTextEntry = false, editable = true,
  rightElement, label, error,
}: any) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={ai.container}>
      {label && <Text style={ai.label}>{label}</Text>}
      <View style={[
        ai.wrap, 
        focused && ai.wrapFocused,
        error && ai.wrapError
      ]}>
        <View style={ai.iconBox}>
          <Icon size={19} color={error ? '#FF4B4B' : (focused ? Colors.primary : Colors.textSecondary)} strokeWidth={2} />
        </View>
        <TextInput
          style={ai.input}
          placeholder={placeholder}
          placeholderTextColor={Colors.textSecondary}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          editable={editable}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          selectionColor={error ? '#FF4B4B' : Colors.primary}
        />
        {rightElement}
      </View>
      {error && <Text style={ai.errorText}>{error}</Text>}
    </View>
  );
}

const ai = StyleSheet.create({
  container: { marginBottom: 20 },
  label: { color: Colors.textSecondary, fontSize: 12, fontWeight: '700', letterSpacing: 0.5, marginBottom: 8, marginLeft: 4 },
  wrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1C1C1C', borderRadius: 18,
    paddingHorizontal: 16,
    borderWidth: 1.5, borderColor: '#2A2A2A',
    height: 58,
  },
  wrapFocused: { borderColor: Colors.primary + '70', backgroundColor: Colors.primary + '08' },
  wrapError: { borderColor: '#FF4B4B', backgroundColor: '#FF4B4B10' },
  iconBox: { marginRight: 12 },
  input: { flex: 1, color: Colors.text, fontSize: 16, fontWeight: '500' },
  errorText: { color: '#FF4B4B', fontSize: 11, fontWeight: '600', marginTop: 4, marginLeft: 8 },
});

export default function ResetPasswordScreen() {
  const { email, otp } = useLocalSearchParams<{ email: string, otp: string }>();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
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
        <View style={s.logoWrap}>
          <LinearGradient colors={[Colors.primary + '30', Colors.primary + '10']} style={s.logoRing}>
            <Lock size={40} color={Colors.primary} strokeWidth={1.6} />
          </LinearGradient>
          <Text style={s.appName}>FITPRO AI</Text>
        </View>

        <View style={s.card}>
          <Text style={s.title}>New Password</Text>
          <Text style={s.subtitle}>Set a strong password to protect your account.</Text>

          <AuthInput
            label="NEW PASSWORD"
            icon={Lock} placeholder="Min 6 characters"
            value={password} onChangeText={(t: string) => { setPassword(t); setErrors({}); }}
            secureTextEntry={!showPass} editable={!loading}
            error={errors.password}
            rightElement={
              <TouchableOpacity onPress={() => setShowPass(p => !p)}>
                {showPass ? <EyeOff size={18} color={Colors.textSecondary} /> : <Eye size={18} color={Colors.textSecondary} />}
              </TouchableOpacity>
            }
          />

          <AuthInput
            label="CONFIRM PASSWORD"
            icon={CheckCircle2} placeholder="Repeat password"
            value={confirmPassword} onChangeText={(t: string) => { setConfirmPassword(t); setErrors({}); }}
            secureTextEntry={!showPass} editable={!loading}
            error={errors.confirm}
          />

          <TouchableOpacity
            onPress={handleReset} disabled={loading}
            activeOpacity={0.9}
            style={[s.btn, loading && { opacity: 0.6 }]}
          >
            <LinearGradient
              colors={[Colors.primary, '#9FE800']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={s.btnGrad}
            >
              <Text style={s.btnText}>{loading ? 'UPDATING…' : 'RESET PASSWORD'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  },
  appName: {
    color: Colors.primary, fontSize: 11, fontWeight: '900',
    letterSpacing: 3, textTransform: 'uppercase',
  },
  card: {
    backgroundColor: '#161616', borderRadius: 32, padding: 28,
    borderWidth: 1, borderColor: '#242424',
  },
  title: {
    color: Colors.text, fontSize: 28, fontWeight: '900',
    letterSpacing: -0.8, textAlign: 'center', marginBottom: 8,
  },
  subtitle: {
    color: Colors.textSecondary, fontSize: 14, fontWeight: '500',
    textAlign: 'center', marginBottom: 28,
  },
  btn: { height: 62, borderRadius: 20, overflow: 'hidden', marginTop: 12 },
  btnGrad: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#000', fontSize: 16, fontWeight: '900', letterSpacing: 1 },
});
