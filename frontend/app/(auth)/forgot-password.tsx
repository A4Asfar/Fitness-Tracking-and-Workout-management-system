import React, { useState, useRef } from 'react';
import {
  View, TextInput, TouchableOpacity, Text,
  Alert, KeyboardAvoidingView, Platform,
  ScrollView, Animated, StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Theme';
import { Mail, ArrowLeft, Send, ShieldCheck } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import api from '@/services/api';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [focused, setFocused] = useState(false);
  const router = useRouter();

  const btnScale = useRef(new Animated.Value(1)).current;
  const pressIn  = () => Animated.spring(btnScale, { toValue: 0.97, useNativeDriver: true, speed: 40 }).start();
  const pressOut = () => Animated.spring(btnScale, { toValue: 1,    useNativeDriver: true, speed: 30 }).start();

  const handleReset = async () => {
    if (!email.trim()) { Alert.alert('Required', 'Please enter your email address.'); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { Alert.alert('Invalid Email', 'Enter a valid email address.'); return; }
    
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send reset link');
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
        colors={[Colors.primary + '15', Colors.primary + '05', 'transparent']}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 280 }}
      />

      {/* Back button */}
      <TouchableOpacity
        style={s.backBtn}
        onPress={() => router.back()}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <View style={s.backBtnInner}>
          <ArrowLeft size={20} color={Colors.primary} strokeWidth={2.2} />
        </View>
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {!sent ? (
          <>
            {/* Icon */}
            <View style={s.iconWrap}>
              <LinearGradient colors={[Colors.primary + '30', Colors.primary + '10']} style={s.iconRing}>
                <Mail size={42} color={Colors.primary} strokeWidth={1.6} />
              </LinearGradient>
            </View>

            <View style={s.card}>
              <Text style={s.title}>Reset Password</Text>
              <Text style={s.subtitle}>Enter your email and we'll send you instructions to reset your password.</Text>

              {/* Input */}
              <View style={[s.inputWrap, focused && s.inputWrapFocused]}>
                <View style={s.inputIcon}>
                  <Mail size={19} color={focused ? Colors.primary : Colors.textSecondary} strokeWidth={2} />
                </View>
                <TextInput
                  style={s.input}
                  placeholder="Email Address"
                  placeholderTextColor={Colors.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  selectionColor={Colors.primary}
                />
              </View>

              {/* Primary button */}
              <Animated.View style={{ transform: [{ scale: btnScale }] }}>
                <TouchableOpacity
                  onPressIn={pressIn} onPressOut={pressOut}
                  onPress={handleReset} disabled={loading} activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={[Colors.primary, '#9FE800']}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={[s.btn, loading && { opacity: 0.65 }]}
                  >
                    <Send size={18} color="#000" strokeWidth={2.5} />
                    <Text style={s.btnText}>{loading ? 'SENDING…' : 'SEND RESET LINK'}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>

              <TouchableOpacity style={s.backLink} onPress={() => router.back()}>
                <Text style={s.backLinkText}>Back to Sign In</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          /* ── Success state ── */
          <View style={s.card}>
            <View style={s.successIcon}>
              <ShieldCheck size={52} color={Colors.primary} strokeWidth={1.4} />
            </View>
            <Text style={s.title}>Email Sent!</Text>
            <Text style={s.subtitle}>
              If an account exists for{' '}
              <Text style={{ color: Colors.text, fontWeight: '700' }}>{email}</Text>
              {' '}you'll receive a reset link shortly. Check your inbox.
            </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <LinearGradient
                colors={[Colors.primary, '#9FE800']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={s.btn}
              >
                <ArrowLeft size={18} color="#000" strokeWidth={2.5} />
                <Text style={s.btnText}>BACK TO SIGN IN</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 80 },

  backBtn: { position: 'absolute', top: 56, left: 24, zIndex: 10 },
  backBtnInner: {
    width: 42, height: 42, borderRadius: 14,
    backgroundColor: Colors.primary + '18',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: Colors.primary + '35',
  },

  iconWrap: { alignItems: 'center', marginBottom: 28 },
  iconRing: {
    width: 100, height: 100, borderRadius: 32,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: Colors.primary + '35',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 20, elevation: 10,
  },

  card: {
    backgroundColor: '#161616', borderRadius: 32, padding: 28,
    borderWidth: 1, borderColor: '#242424',
    shadowColor: '#000', shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.5, shadowRadius: 32, elevation: 18,
  },
  title: {
    color: Colors.text, fontSize: 28, fontWeight: '900',
    letterSpacing: -0.8, textAlign: 'center', marginBottom: 10,
  },
  subtitle: {
    color: Colors.textSecondary, fontSize: 14, fontWeight: '500',
    textAlign: 'center', lineHeight: 22, marginBottom: 28,
  },

  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.inputBg, borderRadius: 18,
    paddingHorizontal: 16, marginBottom: 20,
    borderWidth: 1.5, borderColor: Colors.border, height: 58,
  },
  inputWrapFocused: { borderColor: Colors.primary + '70', backgroundColor: Colors.primary + '08' },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, color: Colors.text, fontSize: 16, fontWeight: '500', paddingVertical: 0 },

  btn: {
    height: 62, borderRadius: 20, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 12,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45, shadowRadius: 18, elevation: 12,
  },
  btnText: { color: '#000', fontSize: 15, fontWeight: '900', letterSpacing: 0.8 },

  backLink: { alignItems: 'center', marginTop: 20 },
  backLinkText: { color: Colors.primary, fontSize: 14, fontWeight: '700', letterSpacing: 0.2 },

  successIcon: {
    width: 100, height: 100, borderRadius: 32,
    backgroundColor: Colors.primary + '18',
    justifyContent: 'center', alignItems: 'center',
    alignSelf: 'center', marginBottom: 24,
    borderWidth: 1.5, borderColor: Colors.primary + '35',
  },
});
