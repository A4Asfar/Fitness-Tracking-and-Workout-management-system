import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Animated
} from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, ArrowLeft, KeyRound } from 'lucide-react-native';
import { useToast } from '@/components/Toast';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '@/services/api';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { SharedStyles } from '@/constants/Theme';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true })
    ]).start();
  }, []);

  const handleSendOtp = async () => {
    if (!email) {
      showToast('Please enter your email address', 'error');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      showToast('OTP sent to your email', 'success');
      router.push(`/(auth)/verify-otp?email=${encodeURIComponent(email)}`);
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to send OTP', 'error');
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
            <KeyRound size={36} color="#8B5CF6" />
          </View>
          <Text style={s.title}>Password Recovery</Text>
          <Text style={s.subtitle}>Enter your email to receive a secure reset code</Text>
        </Animated.View>

        <Animated.View style={[SharedStyles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          
          <Input
            label="Registered Email"
            placeholder="e.g. champion@fitai.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
            icon={Mail}
          />

          <Button
            title="Send Recovery Code"
            onPress={handleSendOtp}
            loading={loading}
          />

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
  
  logoWrapper: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(139,92,246,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: 'rgba(139,92,246,0.2)' },
  title: { flexShrink: 1,  color: '#F8FAFC', fontSize: 28, fontWeight: '900', letterSpacing: -0.5, marginBottom: 8 },
  subtitle: { flexShrink: 1,  color: '#94A3B8', fontSize: 15, fontWeight: '500', textAlign: 'center', paddingHorizontal: 20 },
  
  formCard: { backgroundColor: '#1E293B', borderRadius: 32, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', shadowColor: '#000', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.3, shadowRadius: 30, elevation: 10 },
  
  inputContainer: { marginBottom: 24 },
  inputLabel: { color: '#94A3B8', fontSize: 13, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A', borderRadius: 16, height: 56, paddingHorizontal: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  inputIcon: { marginRight: 12 },
  inputField: { flex: 1, color: '#F8FAFC', fontSize: 16, fontWeight: '600' },

  primaryBtnWrapper: { borderRadius: 16, overflow: 'hidden' },
  primaryBtn: { height: 56, justifyContent: 'center', alignItems: 'center' },
  primaryBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' }
});
