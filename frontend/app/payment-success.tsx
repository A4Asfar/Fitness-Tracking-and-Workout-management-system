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
        <CheckCircle size={80} color="#059669" style={{ marginBottom: 24 }} />
        
        <Text style={s.title}>Payment Submitted!</Text>
        <Text style={s.subtitle}>Your payment has been submitted successfully.</Text>
        
        <View style={s.alertBox}>
          <Clock size={20} color="#B45309" />
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
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { flex: 1, alignItems: 'center', paddingHorizontal: 24 },
  title: { flexShrink: 1,  fontSize: 28, fontWeight: '900', color: '#0F172A', marginBottom: 8 },
  subtitle: { flexShrink: 1,  fontSize: 16, color: '#64748B', textAlign: 'center', marginBottom: 32 },
  
  alertBox: { flexDirection: 'row', backgroundColor: '#FFFBEB', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#FDE68A', alignItems: 'center' },
  alertText: { flex: 1, marginLeft: 12, fontSize: 14, color: '#92400E', lineHeight: 22, fontWeight: '500' },

  primaryBtn: { width: '100%', backgroundColor: '#059669', height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  primaryBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  
  secondaryBtn: { width: '100%', backgroundColor: '#F1F5F9', height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  secondaryBtnText: { color: '#0F172A', fontSize: 16, fontWeight: '700' },
});
