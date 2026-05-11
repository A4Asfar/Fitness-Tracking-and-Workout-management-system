import React, { useState, useRef } from 'react';
import {
  View, TextInput, TouchableOpacity, Text,
  Alert, KeyboardAvoidingView, Platform,
  ScrollView, Animated, StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Theme';
import { Mail, ArrowRight, ArrowLeft, Dumbbell } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useToast } from '@/components/Toast';
import api from '@/services/api';

function AuthInput({
  icon: Icon, placeholder, value, onChangeText,
  keyboardType = 'default', autoCapitalize = 'none',
  editable = true, label, required, error,
}: any) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={ai.container}>
      {label && (
        <View style={ai.labelRow}>
          <Text style={ai.label}>{label}</Text>
          {required && <Text style={ai.asterisk}>*</Text>}
        </View>
      )}
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
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={editable}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          selectionColor={error ? '#FF4B4B' : Colors.primary}
        />
      </View>
      {error && <Text style={ai.errorText}>{error}</Text>}
    </View>
  );
}

const ai = StyleSheet.create({
  container: { marginBottom: 24 },
  labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, marginLeft: 4 },
  label: { color: Colors.textSecondary, fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  asterisk: { color: '#FF4B4B', fontSize: 14, fontWeight: 'bold', marginLeft: 4 },
  wrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1C1C1C', borderRadius: 18,
    paddingHorizontal: 16,
    borderWidth: 1.5, borderColor: '#2A2A2A',
    height: 58,
  },
  wrapFocused: {
    borderColor: Colors.primary + '70',
    backgroundColor: Colors.primary + '08',
  },
  wrapError: { borderColor: '#FF4B4B', backgroundColor: '#FF4B4B10' },
  iconBox: { marginRight: 12 },
  input: {
    flex: 1, color: Colors.text, fontSize: 16,
    fontWeight: '500', paddingVertical: 0,
  },
  errorText: { color: '#FF4B4B', fontSize: 11, fontWeight: '600', marginTop: 4, marginLeft: 8 },
});

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { showToast } = useToast();

  const btnScale = useRef(new Animated.Value(1)).current;
  const pressIn  = () => Animated.spring(btnScale, { toValue: 0.97, useNativeDriver: true, speed: 40 }).start();
  const pressOut = () => Animated.spring(btnScale, { toValue: 1,    useNativeDriver: true, speed: 30 }).start();

  const handleRequestOTP = async () => {
    if (!email) {
      setError('Email address is required');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Enter a valid email address');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      showToast('Reset code sent to your email!', 'success');
      router.push({
        pathname: '/(auth)/verify-otp' as any,
        params: { email }
      });
    } catch (err: any) {
      showToast(err.message || 'Failed to send OTP', 'error');
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
        <TouchableOpacity 
          onPress={() => router.back()}
          style={s.backBtn}
        >
          <ArrowLeft size={20} color={Colors.text} />
        </TouchableOpacity>

        <View style={s.logoWrap}>
          <LinearGradient colors={[Colors.primary + '30', Colors.primary + '10']} style={s.logoRing}>
            <Mail size={40} color={Colors.primary} strokeWidth={1.6} />
          </LinearGradient>
          <Text style={s.appName}>FITPRO AI</Text>
        </View>

        <View style={s.card}>
          <Text style={s.title}>Reset Password</Text>
          <Text style={s.subtitle}>Enter your email to receive a 6-digit verification code.</Text>

          <AuthInput
            label="EMAIL ADDRESS" required
            icon={Mail} placeholder="name@example.com"
            value={email} onChangeText={(t: string) => { setEmail(t); if (error) setError(null); }}
            keyboardType="email-address" editable={!loading}
            error={error}
          />

          <Animated.View style={{ transform: [{ scale: btnScale }] }}>
            <TouchableOpacity
              onPressIn={pressIn} onPressOut={pressOut}
              onPress={handleRequestOTP} disabled={loading}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={[Colors.primary, '#9FE800']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={[s.btn, loading && { opacity: 0.65 }]}
              >
                <Text style={s.btnText}>{loading ? 'SENDING CODE…' : 'SEND CODE'}</Text>
                {!loading && <ArrowRight size={20} color="#000" strokeWidth={2.5} />}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 },
  backBtn: {
    position: 'absolute', top: 50, left: 24,
    width: 44, height: 44, borderRadius: 15,
    backgroundColor: '#161616', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#2A2A2A', zIndex: 10,
  },
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
    textAlign: 'center', marginBottom: 28, lineHeight: 21,
  },
  btn: {
    height: 62, borderRadius: 20, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 12,
  },
  btnText: { color: '#000', fontSize: 16, fontWeight: '900', letterSpacing: 1 },
});
