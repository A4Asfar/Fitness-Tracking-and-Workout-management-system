import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Animated
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, ShieldCheck } from 'lucide-react-native';
import { useToast } from '@/components/Toast';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '@/services/api';

export default function VerifyOtpScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const inputs = useRef<Array<TextInput | null>>([]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true })
    ]).start();
  }, []);

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next
    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      showToast('Please enter the full 6-digit code', 'error');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/verify-otp', { email, otp: otpCode });
      showToast('Verification successful', 'success');
      router.push(`/(auth)/reset-password?email=${encodeURIComponent(email || '')}&otp=${encodeURIComponent(otpCode)}`);
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Invalid code', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.container}>
      <LinearGradient colors={['#0F172A', '#1E293B']} style={s.background} />
      
      <ScrollView contentContainerStyle={[s.scroll, { paddingTop: insets.top + 20 }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <ArrowLeft size={24} color="#F8FAFC" />
        </TouchableOpacity>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], alignItems: 'center', marginBottom: 40, marginTop: 20 }}>
          <View style={s.logoWrapper}>
            <ShieldCheck size={36} color="#38BDF8" />
          </View>
          <Text style={s.title}>Verification</Text>
          <Text style={s.subtitle}>Enter the 6-digit code sent to{'\n'}<Text style={{color: '#F8FAFC', fontWeight: '800'}}>{email}</Text></Text>
        </Animated.View>

        <Animated.View style={[s.formCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          
          <View style={s.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputs.current[index] = ref)}
                style={[s.otpBox, digit ? s.otpBoxFilled : null]}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(val) => handleOtpChange(val, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                selectTextOnFocus
              />
            ))}
          </View>

          <TouchableOpacity onPress={handleVerify} disabled={loading} activeOpacity={0.8} style={s.primaryBtnWrapper}>
            <LinearGradient colors={['#38BDF8', '#0284C7']} style={s.primaryBtn}>
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={s.primaryBtnText}>Verify Code</Text>}
            </LinearGradient>
          </TouchableOpacity>

        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  background: { ...StyleSheet.absoluteFillObject },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 , maxWidth: 450, width: '100%', alignSelf: 'center' },
  
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
  
  logoWrapper: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(56,189,248,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: 'rgba(56,189,248,0.2)' },
  title: { flexShrink: 1,  color: '#F8FAFC', fontSize: 28, fontWeight: '900', letterSpacing: -0.5, marginBottom: 8 },
  subtitle: { flexShrink: 1,  color: '#94A3B8', fontSize: 15, fontWeight: '500', textAlign: 'center', paddingHorizontal: 20, lineHeight: 22 },
  
  formCard: { backgroundColor: '#1E293B', borderRadius: 32, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', shadowColor: '#000', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.3, shadowRadius: 30, elevation: 10 },
  
  otpContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  otpBox: { width: 44, height: 56, backgroundColor: '#0F172A', borderRadius: 12, borderWidth: 2, borderColor: 'rgba(255,255,255,0.05)', color: '#F8FAFC', fontSize: 24, fontWeight: '900', textAlign: 'center' },
  otpBoxFilled: { borderColor: '#38BDF8', backgroundColor: 'rgba(56,189,248,0.05)' },

  primaryBtnWrapper: { borderRadius: 16, overflow: 'hidden' },
  primaryBtn: { height: 56, justifyContent: 'center', alignItems: 'center' },
  primaryBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' }
});
