import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Animated 
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  Crown, ArrowLeft, Zap, TrendingUp, HeartPulse, Sparkles, MessageCircle, CheckCircle2 
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import api from '@/services/api';

const BENEFITS = [
  { icon: MessageCircle, text: 'Unlimited AI Chat', desc: 'Ask anything, anytime.' },
  { icon: Zap, text: 'Unlimited Workout Plans', desc: 'Generate infinite smart routines.' },
  { icon: HeartPulse, text: 'Unlimited Meal Plans', desc: 'Custom macros and diet tracking.' },
  { icon: TrendingUp, text: 'Advanced Analytics', desc: 'Deep progress visualization.' },
  { icon: Sparkles, text: 'Priority Support', desc: 'Skip the line, get help instantly.' },
];

export default function PremiumScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  
  const [selectedPlan, setSelectedPlan] = useState('Yearly Plan');
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await api.get('/premium/my');
        setStatus(res.data);
      } catch (err) {

      } finally {
        setLoading(false);
      }
    };
    fetchStatus();

    // CTA Pulse Animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true })
      ])
    ).start();
  }, [pulseAnim]);

  const handleContinue = () => {
    const amount = selectedPlan === 'Monthly Plan' ? 1000 : 9000;
    router.push(`/payment-method?plan=${encodeURIComponent(selectedPlan)}&amount=${amount}`);
  };

  if (loading) {
    return <View style={[s.container, s.centered]}><ActivityIndicator size="large" color="#D4AF37" /></View>;
  }

  // ACTIVE PREMIUM DASHBOARD STATE
  if (status?.membershipType === 'premium') {
    return (
      <View style={s.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <LinearGradient colors={['#1E293B', '#0F172A']} style={{ flex: 1 }}>
          <View style={[s.header, { paddingTop: insets.top + 16 }]}>
            <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
              <ArrowLeft size={24} color="#F8FAFC" />
            </TouchableOpacity>
            <Text style={s.headerTitleLight}>PRO Status</Text>
            <View style={{ width: 44 }} />
          </View>
          
          <View style={s.activeDash}>
            <View style={s.activeGlow}>
              <Crown size={80} color="#D4AF37" fill="#D4AF37" />
            </View>
            <Text style={s.activeTitle}>Active PRO Member</Text>
            <View style={s.activeCard}>
              <View style={s.activeRow}>
                <Text style={s.activeLabel}>Status</Text>
                <View style={s.activeBadge}><Text style={s.activeBadgeText}>ACTIVE</Text></View>
              </View>
              <View style={s.activeDivider} />
              <View style={s.activeRow}>
                <Text style={s.activeLabel}>Expires On</Text>
                <Text style={s.activeVal}>{new Date(status.membershipExpiresAt).toLocaleDateString()}</Text>
              </View>
            </View>
            <TouchableOpacity style={s.manageBtn} onPress={() => router.replace('/')}>
              <Text style={s.manageBtnText}>Return to Dashboard</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
        
        {/* HERO SECTION */}
        <LinearGradient colors={['#1E293B', '#0F172A']} style={[s.heroSection, { paddingTop: insets.top + 16 }]}>
          <View style={s.heroHeader}>
            <TouchableOpacity onPress={() => router.back()} style={s.backBtnTrans}>
              <ArrowLeft size={24} color="#F8FAFC" />
            </TouchableOpacity>
            <View style={s.premiumBadge}>
              <Crown size={14} color="#D4AF37" fill="#D4AF37" />
              <Text style={s.premiumBadgeText}>ELEVATE PRO</Text>
            </View>
            <View style={{ width: 44 }} />
          </View>
          <Text style={s.heroTitle}>Unlock Your Full Potential</Text>
          <Text style={s.heroSub}>Join the elite tier and get access to unlimited AI coaching, plans, and deep analytics.</Text>
        </LinearGradient>

        {/* PENDING NOTIFICATION */}
        {status?.latestPurchase?.status === 'Pending' && (
          <View style={s.pendingAlert}>
            <Text style={s.pendingAlertTitle}>Verification Pending ⏳</Text>
            <Text style={s.pendingAlertSub}>Your previous payment is currently being reviewed by an administrator. Please wait up to 24 hours.</Text>
          </View>
        )}

        <View style={s.content}>
          {/* PRICING PLANS */}
          <Text style={s.sectionTitle}>Choose Your Plan</Text>
          
          <TouchableOpacity 
            style={[s.planCard, selectedPlan === 'Yearly Plan' && s.planCardActive]}
            onPress={() => setSelectedPlan('Yearly Plan')}
            activeOpacity={0.9}
          >
            {selectedPlan === 'Yearly Plan' && (
              <LinearGradient colors={['#D4AF37', '#FBBF24']} style={s.cardGradBg} />
            )}
            <View style={s.popularBadge}>
              <Text style={s.popularBadgeText}>MOST POPULAR</Text>
            </View>
            <View style={[s.planContent, selectedPlan === 'Yearly Plan' && { backgroundColor: '#1E293B' }]}>
              <View style={s.planInfo}>
                <Text style={s.planName}>Annual PRO</Text>
                <Text style={s.planPrice}>PKR 9,000<Text style={s.planPriceSub}> / yr</Text></Text>
                <View style={s.discountBadge}><Text style={s.discountText}>Save PKR 3,000 annually</Text></View>
              </View>
              <View style={[s.radio, selectedPlan === 'Yearly Plan' && s.radioActive]}>
                {selectedPlan === 'Yearly Plan' && <View style={s.radioInner} />}
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[s.planCard, selectedPlan === 'Monthly Plan' && s.planCardActive]}
            onPress={() => setSelectedPlan('Monthly Plan')}
            activeOpacity={0.9}
          >
            {selectedPlan === 'Monthly Plan' && (
              <LinearGradient colors={['#38BDF8', '#0EA5E9']} style={s.cardGradBg} />
            )}
            <View style={[s.planContent, selectedPlan === 'Monthly Plan' && { backgroundColor: '#1E293B' }]}>
              <View style={s.planInfo}>
                <Text style={s.planName}>Monthly PRO</Text>
                <Text style={s.planPrice}>PKR 1,000<Text style={s.planPriceSub}> / mo</Text></Text>
              </View>
              <View style={[s.radio, selectedPlan === 'Monthly Plan' && s.radioActive]}>
                {selectedPlan === 'Monthly Plan' && <View style={s.radioInnerBlue} />}
              </View>
            </View>
          </TouchableOpacity>

          {/* FEATURES CHECKLIST */}
          <Text style={[s.sectionTitle, { marginTop: 24 }]}>What's Included</Text>
          <View style={s.benefitsCard}>
            {BENEFITS.map((item, idx) => (
              <View key={idx} style={s.benefitRow}>
                <View style={s.iconWrapper}>
                  <item.icon size={20} color="#D4AF37" />
                </View>
                <View style={s.benefitTextWrap}>
                  <Text style={s.benefitText}>{item.text}</Text>
                  <Text style={s.benefitDesc}>{item.desc}</Text>
                </View>
                <CheckCircle2 size={20} color="#10B981" style={{ marginLeft: 'auto' }} />
              </View>
            ))}
          </View>

        </View>
      </ScrollView>

      {/* STICKY FOOTER */}
      {status?.latestPurchase?.status !== 'Pending' && (
        <View style={[s.footer, { paddingBottom: insets.bottom + 16 }]}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity style={s.buyBtn} onPress={handleContinue} activeOpacity={0.8}>
              <LinearGradient colors={['#D4AF37', '#B48A28']} style={s.buyBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Text style={s.buyBtnText}>Subscribe Now</Text>
                <Text style={s.buyBtnSub}>Cancel anytime</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  centered: { justifyContent: 'center', alignItems: 'center' },
  
  // Header / Hero
  heroSection: { paddingHorizontal: 24, paddingBottom: 40, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },
  heroHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  premiumBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(212,175,55,0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 4, borderWidth: 1, borderColor: 'rgba(212,175,55,0.3)' },
  premiumBadgeText: { color: '#D4AF37', fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  heroTitle: { fontSize: 36, fontWeight: '900', color: '#F8FAFC', marginBottom: 12, letterSpacing: -1 },
  heroSub: { fontSize: 15, color: '#94A3B8', lineHeight: 24, fontWeight: '500' },
  
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center' },
  backBtnTrans: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16 },
  headerTitleLight: { color: '#F8FAFC', fontSize: 18, fontWeight: '800' },

  // Active State
  activeDash: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  activeGlow: { width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(212,175,55,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 32, shadowColor: '#D4AF37', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 30, elevation: 20 },
  activeTitle: { fontSize: 28, fontWeight: '900', color: '#F8FAFC', marginBottom: 32 },
  activeCard: { width: '100%', backgroundColor: '#1E293B', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', marginBottom: 32 },
  activeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  activeLabel: { color: '#94A3B8', fontSize: 15, fontWeight: '600' },
  activeVal: { color: '#F8FAFC', fontSize: 16, fontWeight: '800' },
  activeBadge: { backgroundColor: 'rgba(16,185,129,0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  activeBadgeText: { color: '#10B981', fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  activeDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginVertical: 16 },
  manageBtn: { backgroundColor: '#1E293B', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 100, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  manageBtnText: { color: '#F8FAFC', fontSize: 16, fontWeight: '800' },

  // Alerts
  pendingAlert: { margin: 24, marginBottom: 0, backgroundColor: 'rgba(245,158,11,0.1)', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)' },
  pendingAlertTitle: { fontSize: 15, fontWeight: '800', color: '#F59E0B', marginBottom: 4 },
  pendingAlertSub: { fontSize: 13, color: '#FDE68A', lineHeight: 20 },

  // Content
  content: { padding: 24 },
  sectionTitle: { fontSize: 20, fontWeight: '900', color: '#F8FAFC', marginBottom: 16, letterSpacing: -0.5 },
  
  // Plans
  planCard: { borderRadius: 24, marginBottom: 16, position: 'relative', overflow: 'hidden' },
  planCardActive: { transform: [{ scale: 1.02 }] },
  cardGradBg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.5 },
  planContent: { backgroundColor: '#1E293B', borderRadius: 22, margin: 2, padding: 20, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  
  popularBadge: { position: 'absolute', top: -10, left: 24, backgroundColor: '#D4AF37', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, zIndex: 10, shadowColor: '#D4AF37', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8 },
  popularBadgeText: { color: '#0F172A', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  
  planInfo: { flex: 1 },
  planName: { fontSize: 18, fontWeight: '800', color: '#F8FAFC', marginBottom: 4 },
  planPrice: { fontSize: 28, fontWeight: '900', color: '#F8FAFC' },
  planPriceSub: { fontSize: 14, color: '#94A3B8', fontWeight: '600' },
  discountBadge: { backgroundColor: 'rgba(16,185,129,0.15)', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginTop: 8 },
  discountText: { fontSize: 11, color: '#10B981', fontWeight: '800' },
  
  radio: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: '#334155', justifyContent: 'center', alignItems: 'center' },
  radioActive: { borderColor: '#D4AF37' },
  radioInner: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#D4AF37' },
  radioInnerBlue: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#38BDF8' },

  // Benefits
  benefitsCard: { backgroundColor: '#1E293B', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  benefitRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  iconWrapper: { width: 44, height: 44, borderRadius: 16, backgroundColor: 'rgba(212,175,55,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  benefitTextWrap: { flex: 1 },
  benefitText: { fontSize: 16, fontWeight: '800', color: '#F8FAFC', marginBottom: 2 },
  benefitDesc: { fontSize: 13, color: '#94A3B8', fontWeight: '500' },

  // Footer
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#0F172A', paddingHorizontal: 24, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  buyBtn: { borderRadius: 100, overflow: 'hidden' },
  buyBtnGrad: { height: 60, justifyContent: 'center', alignItems: 'center' },
  buyBtnText: { color: '#0F172A', fontSize: 18, fontWeight: '900' },
  buyBtnSub: { color: 'rgba(15,23,42,0.7)', fontSize: 11, fontWeight: '700', marginTop: 2 }
});
