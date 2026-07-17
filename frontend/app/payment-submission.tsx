import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Upload, Camera, Trash2, CheckCircle, FileText, Hash } from 'lucide-react-native';
import { useToast } from '@/components/Toast';
import * as ImagePicker from 'expo-image-picker';
import api from '@/services/api';

export default function PaymentSubmissionScreen() {
  const { plan, amount, method } = useLocalSearchParams<{ plan: string, amount: string, method: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();

  const [transactionId, setTransactionId] = useState('');
  const [notes, setNotes] = useState('');
  const [screenshotBase64, setScreenshotBase64] = useState<string | null>(null);
  const [screenshotUri, setScreenshotUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePickImage = async (useCamera = false) => {
    const { status } = useCamera 
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      showToast('Permission required to upload payment screenshot.', 'error');
      return;
    }

    const result = useCamera
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.5, base64: true })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.5, base64: true });

    if (!result.canceled && result.assets[0].uri) {
      setScreenshotUri(result.assets[0].uri);
      if (result.assets[0].base64) {
        setScreenshotBase64(`data:image/jpeg;base64,${result.assets[0].base64}`);
      }
    }
  };

  const handleSubmit = async () => {
    if (!transactionId.trim() || !screenshotBase64) {
      showToast('Please provide both Transaction ID and a screenshot.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/premium/purchase', {
        plan,
        amount: Number(amount),
        paymentMethod: method,
        transactionId,
        paymentScreenshot: screenshotBase64,
        notes
      });
      router.push('/payment-success');
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to submit payment.';
      showToast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[s.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <ArrowLeft size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Submit Proof</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.infoCard}>
          <CheckCircle size={24} color="#059669" />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={s.infoTitle}>Payment of PKR {amount}</Text>
            <Text style={s.infoSub}>via {method}</Text>
          </View>
        </View>

        <Text style={s.sectionTitle}>Transaction ID</Text>
        <View style={s.inputContainer}>
          <Hash size={20} color="#94A3B8" style={{ marginRight: 12 }} />
          <TextInput
            style={s.input}
            placeholder="e.g. 123456789012"
            value={transactionId}
            onChangeText={setTransactionId}
            keyboardType="default"
          />
        </View>

        <Text style={s.sectionTitle}>Payment Screenshot</Text>
        {screenshotUri ? (
          <View style={s.previewContainer}>
            <Image source={{ uri: screenshotUri }} style={s.previewImg} />
            <TouchableOpacity style={s.deleteBtn} onPress={() => { setScreenshotUri(null); setScreenshotBase64(null); }}>
              <Trash2 size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={s.uploadOptions}>
            <TouchableOpacity style={s.uploadOption} onPress={() => handlePickImage(false)}>
              <Upload size={24} color="#38BDF8" />
              <Text style={s.uploadOptionText}>Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.uploadOption} onPress={() => handlePickImage(true)}>
              <Camera size={24} color="#38BDF8" />
              <Text style={s.uploadOptionText}>Camera</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={s.sectionTitle}>Additional Notes (Optional)</Text>
        <View style={[s.inputContainer, s.textAreaContainer]}>
          <FileText size={20} color="#94A3B8" style={{ marginRight: 12, marginTop: 4 }} />
          <TextInput
            style={s.textArea}
            placeholder="Account name used for transfer..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
          />
        </View>
      </ScrollView>

      <View style={[s.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity style={[s.submitBtn, (!transactionId || !screenshotUri) && s.submitBtnDisabled]} onPress={handleSubmit} disabled={isSubmitting || !transactionId || !screenshotUri}>
          {isSubmitting ? <ActivityIndicator color="#0F172A" /> : <Text style={s.submitBtnText}>Submit Verification</Text>}
        </TouchableOpacity>
      </View>
    </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16, backgroundColor: '#0F172A', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: '800' },
  content: { padding: 24, paddingBottom: 120, maxWidth: 600, width: '100%', alignSelf: 'center' },

  infoCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(56, 189, 248, 0.05)', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.2)', marginBottom: 24 },
  infoTitle: { fontSize: 15, fontWeight: '800', color: '#38BDF8' },
  infoSub: { fontSize: 13, color: '#94A3B8', fontWeight: '600' },

  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#F8FAFC', marginBottom: 12 },
  
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderRadius: 16, paddingHorizontal: 16, height: 56, marginBottom: 24 },
  input: { flex: 1, fontSize: 15, fontWeight: '600', color: '#F8FAFC' },
  
  textAreaContainer: { height: 120, alignItems: 'flex-start', paddingTop: 12 },
  textArea: { flex: 1, fontSize: 15, color: '#F8FAFC', textAlignVertical: 'top' },

  uploadOptions: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  uploadOption: { flex: 1, height: 100, backgroundColor: 'rgba(56, 189, 248, 0.05)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.2)', justifyContent: 'center', alignItems: 'center' },
  uploadOptionText: { color: '#38BDF8', fontSize: 14, fontWeight: '700', marginTop: 8 },

  previewContainer: { width: '100%', height: 200, borderRadius: 16, overflow: 'hidden', marginBottom: 24, position: 'relative', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  previewImg: { width: '100%', height: '100%' },
  deleteBtn: { position: 'absolute', top: 12, right: 12, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(239, 68, 68, 0.9)', justifyContent: 'center', alignItems: 'center' },

  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 24, paddingVertical: 16, backgroundColor: '#0F172A', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  submitBtn: { backgroundColor: '#38BDF8', height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', shadowColor: '#38BDF8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  submitBtnDisabled: { backgroundColor: 'rgba(56, 189, 248, 0.3)', shadowOpacity: 0 },
  submitBtnText: { color: '#F8FAFC', fontSize: 16, fontWeight: '900' }
});
