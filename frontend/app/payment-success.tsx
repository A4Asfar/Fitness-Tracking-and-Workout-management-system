import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { CheckCircle, Clock } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PaymentSuccessScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={s.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[s.content, { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 24 }]}>
        <CheckCircle size={80} color="#10B981" style={{ marginBottom: 24 }} />
        
        <Text style={s.title}>Payment Submitted!</Text>
        <Text style={s.subtitle}>Your payment has been submitted successfully.</Text>
        
        <View style={s.alertBox}>
          <Clock size={20} color="#38BDF8" />
          <Text style={s.alertText}>Verification usually takes less than 24 hours. You will be notified once approved.</Text>
        </View>

        <View style={{ flex: 1 }} />

        <TouchableOpacity style={s.primaryBtn} onPress={() => router.replace('/premium')}>
          <Text style={s.primaryBtnText}>Check Status</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={s.secondaryBtn} onPress={() => router.replace('/')}>
          <Text style={s.secondaryBtnText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  content: { flex: 1, alignItems: 'center', paddingHorizontal: 24, maxWidth: 600, width: '100%', alignSelf: 'center' },
  title: { flexShrink: 1,  fontSize: 28, fontWeight: '900', color: '#F8FAFC', marginBottom: 8 },
  subtitle: { flexShrink: 1,  fontSize: 16, color: '#94A3B8', textAlign: 'center', marginBottom: 32 },
  
  alertBox: { flexDirection: 'row', backgroundColor: 'rgba(56, 189, 248, 0.05)', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.2)', alignItems: 'center' },
  alertText: { flex: 1, marginLeft: 12, fontSize: 14, color: '#38BDF8', lineHeight: 22, fontWeight: '500' },

  primaryBtn: { width: '100%', backgroundColor: '#38BDF8', height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 16, shadowColor: '#38BDF8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  primaryBtnText: { color: '#0F172A', fontSize: 16, fontWeight: '900' },
  
  secondaryBtn: { width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  secondaryBtnText: { color: '#F8FAFC', fontSize: 16, fontWeight: '700' },
});
