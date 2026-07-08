import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Clipboard } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Copy, CreditCard, Landmark, Smartphone, Image as ImageIcon } from 'lucide-react-native';
import { useToast } from '@/components/Toast';
import { APP_NAME, PAYMENTS_LABEL } from '@/constants/Brand';

export default function PaymentMethodScreen() {
  const { plan, amount } = useLocalSearchParams<{ plan: string, amount: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();

  const [selectedMethod, setSelectedMethod] = useState('EasyPaisa');

  const methods = [
    { id: 'EasyPaisa', icon: Smartphone, color: '#10B981', title: PAYMENTS_LABEL, acc: '0300-1234567' },
    { id: 'JazzCash', icon: Smartphone, color: '#EF4444', title: PAYMENTS_LABEL, acc: '0311-7654321' },
    { id: 'Bank Transfer', icon: Landmark, color: '#3B82F6', title: `${APP_NAME} (Meezan Bank)`, acc: '01234567890123' },
  ];

  const handleCopy = (text: string) => {
    Clipboard.setString(text);
    showToast('Account copied to clipboard!', 'success');
  };

  const handleNext = () => {
    router.push(`/payment-submission?plan=${plan}&amount=${amount}&method=${selectedMethod}`);
  };

  return (
    <View style={s.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[s.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <ArrowLeft size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Select Payment Method</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.content}>
        <View style={s.summaryCard}>
          <Text style={s.summaryLabel}>Total Amount to Pay</Text>
          <Text style={s.summaryValue}>PKR {amount}</Text>
          <Text style={s.summaryPlan}>{plan}</Text>
        </View>

        <Text style={s.sectionTitle}>Transfer Details</Text>
        
        {methods.map(m => (
          <TouchableOpacity 
            key={m.id} 
            style={[s.methodCard, selectedMethod === m.id && s.methodCardActive]}
            onPress={() => setSelectedMethod(m.id)}
            activeOpacity={0.9}
          >
            <View style={s.methodHeader}>
              <View style={[s.iconBox, { backgroundColor: m.color + '15' }]}>
                <m.icon size={20} color={m.color} />
              </View>
              <Text style={s.methodName}>{m.id}</Text>
              <View style={[s.radio, selectedMethod === m.id && s.radioActive]}>
                {selectedMethod === m.id && <View style={s.radioInner} />}
              </View>
            </View>

            {selectedMethod === m.id && (
              <View style={s.detailsBox}>
                <View style={s.detailRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.detailLabel}>ACCOUNT TITLE</Text>
                    <Text style={s.detailValue}>{m.title}</Text>
                  </View>
                </View>
                <View style={s.detailRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.detailLabel}>ACCOUNT NUMBER</Text>
                    <Text style={s.detailValue}>{m.acc}</Text>
                  </View>
                  <TouchableOpacity style={s.copyBtn} onPress={() => handleCopy(m.acc.replace(/-/g, ''))}>
                    <Copy size={16} color="#0F172A" />
                    <Text style={s.copyBtnText}>Copy</Text>
                  </TouchableOpacity>
                </View>

                {/* QR Placeholder */}
                <View style={s.qrBox}>
                  <ImageIcon size={32} color="#CBD5E1" style={{ marginBottom: 8 }} />
                  <Text style={s.qrText}>Scan QR Code</Text>
                </View>
              </View>
            )}
          </TouchableOpacity>
        ))}

        <View style={s.instructionsBox}>
          <Text style={s.instTitle}>Instructions</Text>
          <Text style={s.instText}>1. Copy the account number above.</Text>
          <Text style={s.instText}>2. Transfer the exact amount (PKR {amount}) using your banking app.</Text>
          <Text style={s.instText}>3. Save the transfer receipt/screenshot.</Text>
          <Text style={s.instText}>4. Tap "Next" to submit your proof of payment.</Text>
        </View>

      </ScrollView>

      <View style={[s.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity style={s.nextBtn} onPress={handleNext}>
          <Text style={s.nextBtnText}>Next Step</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: '#0F172A', fontSize: 18, fontWeight: '800' },
  
  content: { padding: 24, paddingBottom: 120 },
  
  summaryCard: { backgroundColor: '#0F172A', borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 24 },
  summaryLabel: { color: '#94A3B8', fontSize: 13, fontWeight: '600', marginBottom: 4 },
  summaryValue: { color: '#FFF', fontSize: 32, fontWeight: '900', marginBottom: 4 },
  summaryPlan: { color: '#D4AF37', fontSize: 14, fontWeight: '800' },

  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#0F172A', marginBottom: 16 },

  methodCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 16, borderWidth: 2, borderColor: '#F1F5F9', marginBottom: 16 },
  methodCardActive: { borderColor: '#059669' },
  methodHeader: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  methodName: { flex: 1, fontSize: 16, fontWeight: '800', color: '#0F172A' },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#CBD5E1', justifyContent: 'center', alignItems: 'center' },
  radioActive: { borderColor: '#059669' },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#059669' },

  detailsBox: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  detailLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '700', letterSpacing: 0.5, marginBottom: 4 },
  detailValue: { fontSize: 16, color: '#0F172A', fontWeight: '800' },
  copyBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, gap: 6 },
  copyBtnText: { fontSize: 14, fontWeight: '700', color: '#0F172A' },

  qrBox: { height: 100, backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: '#CBD5E1', justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  qrText: { fontSize: 13, color: '#64748B', fontWeight: '600' },

  instructionsBox: { backgroundColor: '#FFFBEB', padding: 20, borderRadius: 16, marginTop: 16, borderWidth: 1, borderColor: '#FDE68A' },
  instTitle: { fontSize: 15, fontWeight: '800', color: '#92400E', marginBottom: 8 },
  instText: { fontSize: 14, color: '#B45309', lineHeight: 24, fontWeight: '500' },

  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF', paddingHorizontal: 24, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  nextBtn: { backgroundColor: '#059669', height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  nextBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' }
});
