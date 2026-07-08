import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Image, Dimensions, TextInput, Clipboard
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Crown, ArrowLeft, Check, Copy, Upload, Camera, Trash2,
  Sparkles, Award, ShieldCheck, CreditCard, Image as ImageIcon,
  AlertCircle, Smartphone, X
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useToast } from '@/components/Toast';
import api from '@/services/api';
import { hapticSuccess, hapticError, hapticWarning } from '@/utils/haptics';

const { width } = Dimensions.get('window');

const BENEFITS = [
  'Unlimited AI Coach consultations',
  'Unlimited personalized workout programs',
  'Unlimited meal plans & nutrition diaries',
  'Advanced biometric & weight analytics',
  'Smart daily training recommendation cards',
  'No features limitations or restrictions',
  'Priority response from AI Engine',
  'Access to all future premium releases'
];

export default function PremiumMembershipScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [screenshotBase64, setScreenshotBase64] = useState<string | null>(null);
  const [paymentNumber, setPaymentNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'EasyPaisa' | 'JazzCash'>('EasyPaisa');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentLog, setPaymentLog] = useState<any>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  const isPremium = user?.membershipType === 'premium' || user?.membershipType === 'admin';

  const fetchPaymentStatus = async () => {
    try {
      const res = await api.get('/profile/payments/status');
      setPaymentLog(res.data);
    } catch (e) {
      console.log('Error fetching payment status:', e);
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    fetchPaymentStatus();
  }, [user]);

  const copyToClipboard = (text: string, provider: string) => {
    Clipboard.setString(text);
    showToast(`${provider} details copied to clipboard!`, 'success');
  };

  const handlePickImage = async (useCamera = false) => {
    const { status } = useCamera 
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      showToast('Permission required to upload payment screenshot.', 'error');
      return;
    }

    const result = useCamera
      ? await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          quality: 0.5,
          base64: true
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          quality: 0.5,
          base64: true
        });

    if (!result.canceled && result.assets[0].uri) {
      setScreenshot(result.assets[0].uri);
      if (result.assets[0].base64) {
        setScreenshotBase64(`data:image/jpeg;base64,${result.assets[0].base64}`);
      }
    }
  };

  const handleSubmitProof = async () => {
    if (!screenshotBase64) {
      hapticWarning();
      showToast('Please select or capture a payment receipt first.', 'error');
      return;
    }
    if (!paymentNumber.trim()) {
      hapticWarning();
      showToast('Please enter the sender account number.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/profile/payments/submit', {
        plan: 'Lifetime',
        paymentMethod,
        paymentNumber,
        screenshotUrl: screenshotBase64
      });
      hapticSuccess();
      showToast('Payment proof submitted successfully!', 'success');
      setScreenshot(null);
      setScreenshotBase64(null);
      setPaymentNumber('');
      fetchPaymentStatus();
    } catch (error) {
      console.error('Upgrade error:', error);
      hapticError();
      showToast('We couldn\'t complete your request right now. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingStatus) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Premium Membership</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* --- Crown Badge & Goal --- */}
        <View style={styles.heroSection}>
          <View style={styles.crownWrap}>
            <Crown size={32} color="#D4AF37" fill="#D4AF37" />
          </View>
          <Text style={styles.headline}>Unlock FitAI Premium</Text>
          <Text style={styles.subheadline}>
            Get full access to all elite coaching intelligence and customized workout tools.
          </Text>
        </View>

        {/* --- Dynamic Status Cards --- */}
        {paymentLog && paymentLog.status === 'Pending' && !isPremium ? (
          <View style={styles.pendingCard}>
            <View style={styles.pendingIconBox}>
              <AlertCircle size={28} color="#D4AF37" strokeWidth={2.5} />
            </View>
            <Text style={styles.pendingTitle}>Payment Verification Pending</Text>
            <Text style={styles.pendingDesc}>
              Your receipt submitted on {new Date(paymentLog.submittedAt).toLocaleDateString()} is under review by our admin team.
            </Text>
            <View style={styles.pendingDetails}>
              <Text style={styles.pendingDetailText}>Method: {paymentLog.paymentMethod}</Text>
              <Text style={styles.pendingDetailText}>Account: {paymentLog.paymentNumber}</Text>
              <Text style={styles.pendingDetailText}>Status: 🟡 Verification Pending</Text>
            </View>
            <Text style={styles.estimatedTime}>Estimated approval within 24 hours.</Text>
          </View>
        ) : paymentLog && paymentLog.status === 'Rejected' && !isPremium ? (
          <View style={styles.rejectedCard}>
            <View style={styles.rejectedIconBox}>
              <X size={28} color="#EF4444" strokeWidth={2.5} />
            </View>
            <Text style={styles.rejectedTitle}>Payment Verification Failed</Text>
            <Text style={styles.rejectedDesc}>
              Your request was rejected. Reason:{"\n"}
              <Text style={styles.rejectionReasonText}>"{paymentLog.adminRemarks || 'Invalid transaction receipt.'}"</Text>
            </Text>
            <Text style={styles.retryPrompt}>Please submit another payment proof below.</Text>
          </View>
        ) : isPremium ? (
          <View style={styles.activePlanCard}>
            <View style={styles.activePlanHeader}>
              <Award size={20} color="#D4AF37" fill="#D4AF37" />
              <Text style={styles.activePlanTitle}>FitAI PRO Active</Text>
            </View>
            <Text style={styles.activePlanDesc}>
              You have unlocked full premium access to all workout programs, nutrition tracking tools, and AI Coach assistance logs.
            </Text>
          </View>
        ) : null}

        {/* --- If Free & Not Pending, show Payment Portal --- */}
        {!isPremium && (!paymentLog || paymentLog.status !== 'Pending') && (
          <>
            {/* --- Pricing Cards --- */}
            <View style={styles.pricingSection}>
              <View style={styles.pricingCard}>
                <LinearGradient
                  colors={['#FFFDF6', '#FAF5E3']}
                  style={styles.pricingGrad}
                >
                  <View style={styles.priceBadge}>
                    <Text style={styles.priceBadgeText}>POPULAR PLAN</Text>
                  </View>
                  <Text style={styles.priceTitle}>Lifetime Membership</Text>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceCurrency}>PKR</Text>
                    <Text style={styles.priceAmount}>2,999</Text>
                    <Text style={styles.priceDuration}>/ lifetime</Text>
                  </View>
                  <Text style={styles.priceSubtext}>One-time payment. No recurring charges.</Text>
                </LinearGradient>
              </View>
            </View>

            {/* --- Features List Card --- */}
            <View style={styles.featuresCard}>
              <Text style={styles.cardSectionLabel}>Everything in FitAI PRO</Text>
              <View style={styles.benefitsContainer}>
                {BENEFITS.map((benefit, index) => (
                  <View key={index} style={styles.benefitRow}>
                    <View style={styles.checkCircle}>
                      <Check size={12} color="#D4AF37" strokeWidth={3} />
                    </View>
                    <Text style={styles.benefitText}>{benefit}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* --- Payment Methods Details --- */}
            <Text style={styles.mainSectionTitle}>Manual Payment Accounts</Text>
            
            <View style={styles.paymentContainer}>
              {/* EasyPaisa */}
              <TouchableOpacity 
                style={[styles.paymentCard, paymentMethod === 'EasyPaisa' && styles.paymentCardActive]}
                onPress={() => setPaymentMethod('EasyPaisa')}
                activeOpacity={0.9}
              >
                <View style={styles.paymentHeader}>
                  <CreditCard size={16} color={paymentMethod === 'EasyPaisa' ? '#D4AF37' : '#94A3B8'} />
                  <Text style={styles.paymentTitle}>EasyPaisa</Text>
                </View>
                <View style={styles.paymentDetails}>
                  <Text style={styles.paymentLabel}>NAME</Text>
                  <Text style={styles.paymentValue}>FitAI Payments Ltd</Text>
                  <Text style={[styles.paymentLabel, { marginTop: 8 }]}>NUMBER</Text>
                  <Text style={styles.paymentValue}>0300-1234567</Text>
                </View>
                <TouchableOpacity 
                  style={styles.copyBtn} 
                  onPress={() => copyToClipboard('03001234567', 'EasyPaisa')}
                  activeOpacity={0.7}
                >
                  <Copy size={12} color="#78350F" />
                  <Text style={styles.copyBtnText}>Copy</Text>
                </TouchableOpacity>
              </TouchableOpacity>

              {/* JazzCash */}
              <TouchableOpacity 
                style={[styles.paymentCard, paymentMethod === 'JazzCash' && styles.paymentCardActive]}
                onPress={() => setPaymentMethod('JazzCash')}
                activeOpacity={0.9}
              >
                <View style={styles.paymentHeader}>
                  <CreditCard size={16} color={paymentMethod === 'JazzCash' ? '#D4AF37' : '#94A3B8'} />
                  <Text style={styles.paymentTitle}>JazzCash</Text>
                </View>
                <View style={styles.paymentDetails}>
                  <Text style={styles.paymentLabel}>NAME</Text>
                  <Text style={styles.paymentValue}>FitAI Payments Ltd</Text>
                  <Text style={[styles.paymentLabel, { marginTop: 8 }]}>NUMBER</Text>
                  <Text style={styles.paymentValue}>0311-7654321</Text>
                </View>
                <TouchableOpacity 
                  style={styles.copyBtn} 
                  onPress={() => copyToClipboard('03117654321', 'JazzCash')}
                  activeOpacity={0.7}
                >
                  <Copy size={12} color="#78350F" />
                  <Text style={styles.copyBtnText}>Copy</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            </View>

            {/* --- QR Code Section --- */}
            <View style={styles.qrCard}>
              <Text style={styles.qrTitle}>Quick Pay with QR</Text>
              <View style={styles.qrPlaceholder}>
                <ImageIcon size={32} color="#94A3B8" style={{ marginBottom: 8 }} />
                <Text style={styles.qrText}>QR Code Coming Soon</Text>
              </View>
            </View>

            {/* --- Instructions Section --- */}
            <View style={styles.instructionsCard}>
              <Text style={styles.cardSectionLabel}>How to Activate Premium</Text>
              <View style={styles.stepsList}>
                <StepItem num="1" text="Transfer PKR 2,999 to our EasyPaisa or JazzCash account." />
                <StepItem num="2" text="Take a screenshot of the successful transfer receipt." />
                <StepItem num="3" text="Enter your sending mobile phone number below." />
                <StepItem num="4" text="Upload receipt screenshot and submit proof for verification." />
              </View>
            </View>

            {/* --- Upload Portal --- */}
            <View style={styles.uploadCard}>
              <Text style={styles.cardSectionLabel}>Submit Transaction Receipt</Text>
              
              {/* Phone Number Input */}
              <View style={styles.phoneInputContainer}>
                <Smartphone size={16} color="#94A3B8" style={{ marginRight: 10 }} />
                <TextInput
                  style={styles.phoneInput}
                  placeholder="Sender Mobile No (e.g. 03001234567)"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  value={paymentNumber}
                  onChangeText={setPaymentNumber}
                />
              </View>

              {screenshot ? (
                <View style={styles.previewContainer}>
                  <Image source={{ uri: screenshot }} style={styles.previewImg} />
                  <View style={styles.previewActions}>
                    <TouchableOpacity 
                      style={styles.actionIconBtn} 
                      onPress={() => { setScreenshot(null); setScreenshotBase64(null); }}
                      activeOpacity={0.7}
                    >
                      <Trash2 size={16} color="#EF4444" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.actionIconBtn} 
                      onPress={() => handlePickImage(false)}
                      activeOpacity={0.7}
                    >
                      <Upload size={16} color="#64748B" />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.uploadOptions}>
                  <TouchableOpacity 
                    style={styles.uploadOptionBox}
                    onPress={() => handlePickImage(false)}
                    activeOpacity={0.8}
                  >
                    <Upload size={24} color="#D4AF37" />
                    <Text style={styles.uploadOptionTitle}>Choose Receipt</Text>
                    <Text style={styles.uploadOptionSub}>Upload from library</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.uploadOptionBox}
                    onPress={() => handlePickImage(true)}
                    activeOpacity={0.8}
                  >
                    <Camera size={24} color="#D4AF37" />
                    <Text style={styles.uploadOptionTitle}>Capture Screen</Text>
                    <Text style={styles.uploadOptionSub}>Use device camera</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Submit Trigger */}
              <TouchableOpacity 
                style={[styles.submitBtn, (!screenshot || !paymentNumber.trim()) && styles.submitBtnDisabled]}
                onPress={handleSubmitProof}
                disabled={!screenshot || !paymentNumber.trim() || isSubmitting}
                activeOpacity={0.9}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <ShieldCheck size={18} color="#FFFFFF" />
                    <Text style={styles.submitBtnText}>Submit Payment Proof</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <Text style={styles.bottomNote}>
              ⚠️ Premium activates after manual ledger verification.
            </Text>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function StepItem({ num, text }: { num: string; text: string }) {
  return (
    <View style={styles.stepRow}>
      <View style={styles.stepNumBox}>
        <Text style={styles.stepNum}>{num}</Text>
      </View>
      <Text style={styles.stepText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create<Record<string, any>>({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1.5,
    borderColor: '#F1F5F9',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  headerTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  content: {
    padding: 20,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 10,
  },
  crownWrap: {
    width: 68,
    height: 68,
    borderRadius: 24,
    backgroundColor: '#FFFBEB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
  },
  headline: {
    color: '#0F172A',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  subheadline: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 8,
    paddingHorizontal: 20,
  },
  pricingSection: {
    marginBottom: 20,
  },
  pricingCard: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 2,
  },
  pricingGrad: {
    padding: 20,
    alignItems: 'center',
  },
  priceBadge: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 12,
  },
  priceBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  priceTitle: {
    color: '#78350F',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  priceCurrency: {
    color: '#78350F',
    fontSize: 14,
    fontWeight: '800',
  },
  priceAmount: {
    color: '#78350F',
    fontSize: 36,
    fontWeight: '950',
    letterSpacing: -1,
  },
  priceDuration: {
    color: '#92400E',
    fontSize: 13,
    fontWeight: '700',
  },
  priceSubtext: {
    color: '#92400E',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
  },
  featuresCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 28,
  },
  cardSectionLabel: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 16,
  },
  benefitsContainer: {
    gap: 12,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFBEB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  benefitText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '700',
  },
  mainSectionTitle: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 14,
    marginLeft: 4,
  },
  paymentContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  paymentCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  paymentCardActive: {
    borderColor: '#D4AF37',
    backgroundColor: '#FFFDF6',
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  paymentTitle: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '800',
  },
  paymentDetails: {
    marginBottom: 14,
  },
  paymentLabel: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '750',
    letterSpacing: 0.5,
  },
  paymentValue: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FFFBEB',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
  },
  copyBtnText: {
    color: '#78350F',
    fontSize: 11,
    fontWeight: '800',
  },
  qrCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 24,
  },
  qrTitle: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 12,
  },
  qrPlaceholder: {
    height: 120,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#E2E8F0',
  },
  qrText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
  },
  instructionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 24,
  },
  stepsList: {
    gap: 12,
  },
  stepRow: {
    flexDirection: 'row',
    gap: 12,
  },
  stepNumBox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFBEB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginTop: 2,
  },
  stepNum: {
    color: '#78350F',
    fontSize: 11,
    fontWeight: '900',
  },
  stepText: {
    color: '#64748B',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    flex: 1,
  },
  uploadCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    height: 48,
    marginBottom: 16,
  },
  phoneInput: {
    flex: 1,
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '600',
  },
  uploadOptions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  uploadOptionBox: {
    flex: 1,
    height: 100,
    borderRadius: 16,
    backgroundColor: '#FFFBEB',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#FDE68A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadOptionTitle: {
    color: '#78350F',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 8,
  },
  uploadOptionSub: {
    color: '#B45309',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  previewContainer: {
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
  },
  previewImg: {
    width: '100%',
    height: '100%',
  },
  previewActions: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    gap: 8,
  },
  actionIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  submitBtn: {
    flexDirection: 'row',
    height: 52,
    borderRadius: 16,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  submitBtnDisabled: {
    backgroundColor: '#94A3B8',
    shadowColor: 'transparent',
    elevation: 0,
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  bottomNote: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  activePlanCard: {
    backgroundColor: '#FFFDF6',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
  },
  activePlanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  activePlanTitle: {
    color: '#78350F',
    fontSize: 16,
    fontWeight: '900',
  },
  activePlanDesc: {
    color: '#92400E',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  pendingCard: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
  },
  pendingIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  pendingTitle: {
    color: '#78350F',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 6,
  },
  pendingDesc: {
    color: '#92400E',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  pendingDetails: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    marginBottom: 12,
    gap: 4,
  },
  pendingDetailText: {
    color: '#78350F',
    fontSize: 12,
    fontWeight: '700',
  },
  estimatedTime: {
    color: '#B45309',
    fontSize: 11,
    fontWeight: '800',
  },
  rejectedCard: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
  },
  rejectedIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  rejectedTitle: {
    color: '#991B1B',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 6,
  },
  rejectedDesc: {
    color: '#7F1D1D',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  rejectionReasonText: {
    fontWeight: '800',
    color: '#B91C1C',
  },
  retryPrompt: {
    color: '#B91C1C',
    fontSize: 12,
    fontWeight: '800',
  },
});
