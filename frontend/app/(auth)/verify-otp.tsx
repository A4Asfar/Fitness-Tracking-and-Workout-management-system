import React, { useState, useRef, useEffect } from 'react';
import {
  View, TextInput, TouchableOpacity, Text,
  KeyboardAvoidingView, Platform,
  ScrollView, Animated, StyleSheet,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/Theme';
import { ShieldCheck, ArrowLeft, RefreshCw } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useToast } from '@/components/Toast';
import api from '@/services/api';

export default function VerifyOtpScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const router = useRouter();
  const { showToast } = useToast();
  
  const inputs = useRef<Array<TextInput | null>>([]);
  const btnScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value !== '' && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) {
      showToast('Please enter the complete 6-digit code', 'error');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/verify-reset-code', { email, otp: code });
      showToast('OTP verified!', 'success');
      router.push({
        pathname: '/(auth)/reset-password' as any,
        params: { email, otp: code }
      });
    } catch (err: any) {
      showToast(err.message || 'Invalid OTP', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      showToast('New code sent!', 'success');
      setTimer(60);
      setOtp(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } catch (err: any) {
      showToast(err.message || 'Failed to resend code', 'error');
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
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <ArrowLeft size={20} color={Colors.text} />
        </TouchableOpacity>

        <View style={s.logoWrap}>
          <LinearGradient colors={[Colors.primary + '30', Colors.primary + '10']} style={s.logoRing}>
            <ShieldCheck size={40} color={Colors.primary} strokeWidth={1.6} />
          </LinearGradient>
          <Text style={s.appName}>FITPRO AI</Text>
        </View>

        <View style={s.card}>
          <Text style={s.title}>Verification Code</Text>
          <Text style={s.subtitle}>Sent to <Text style={{ color: Colors.text }}>{email}</Text></Text>

          <View style={s.otpContainer}>
            {otp.map((digit, idx) => (
              <TextInput
                key={idx}
                ref={ref => { inputs.current[idx] = ref; }}
                style={[s.otpInput, digit !== '' && s.otpInputActive]}
                maxLength={1}
                keyboardType="number-pad"
                value={digit}
                onChangeText={(v) => handleOtpChange(v, idx)}
                onKeyPress={(e) => handleKeyPress(e, idx)}
                placeholder="0"
                placeholderTextColor="#333"
                selectionColor={Colors.primary}
              />
            ))}
          </View>

          <TouchableOpacity 
            onPress={handleResend}
            disabled={timer > 0 || loading}
            style={s.resendWrap}
          >
            {timer > 0 ? (
              <Text style={s.resendText}>Resend code in <Text style={s.timer}>{timer}s</Text></Text>
            ) : (
              <View style={s.resendActive}>
                <RefreshCw size={14} color={Colors.primary} />
                <Text style={[s.resendText, { color: Colors.primary }]}>Resend OTP</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleVerify} disabled={loading}
            activeOpacity={0.9}
            style={[s.btn, loading && { opacity: 0.6 }]}
          >
            <LinearGradient
              colors={[Colors.primary, '#9FE800']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={s.btnGrad}
            >
              <Text style={s.btnText}>{loading ? 'VERIFYING…' : 'VERIFY CODE'}</Text>
            </LinearGradient>
          </TouchableOpacity>
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
    textAlign: 'center', marginBottom: 32,
  },
  otpContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  otpInput: {
    width: 44, height: 56, backgroundColor: '#1C1C1C',
    borderRadius: 12, borderWidth: 1.5, borderColor: '#2A2A2A',
    color: Colors.text, fontSize: 22, fontWeight: 'bold',
    textAlign: 'center',
  },
  otpInputActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '08' },
  resendWrap: { alignSelf: 'center', marginBottom: 32 },
  resendText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  timer: { color: Colors.primary, fontWeight: 'bold' },
  resendActive: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  btn: { height: 62, borderRadius: 20, overflow: 'hidden' },
  btnGrad: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#000', fontSize: 16, fontWeight: '900', letterSpacing: 1 },
});
