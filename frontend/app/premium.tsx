import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Crown, ArrowLeft, CheckCircle, Zap, TrendingUp, HeartPulse, Sparkles, MessageCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import api from '@/services/api';

const BENEFITS = [
  { icon: MessageCircle, text: 'Unlimited AI Chat' },
  { icon: Zap, text: 'Unlimited Workout Plans' },
  { icon: HeartPulse, text: 'Unlimited Meal Plans' },
  { icon: TrendingUp, text: 'Advanced Analytics' },
  { icon: Sparkles, text: 'Priority Support' },
];

export default function PremiumScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  
  const [selectedPlan, setSelectedPlan] = useState('Monthly Plan');
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await api.get('/premium/my');
        setStatus(res.data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  const handleContinue = () => {
    const amount = selectedPlan === 'Monthly Plan' ? 1000 : 9000;
    router.push(`/payment-method?plan=${encodeURIComponent(selectedPlan)}&amount=${amount}`);
  };

  if (loading) {
    return <View style={[s.container, s.centered]}><ActivityIndicator size="large" color="#D4AF37" /></View>;
  }

  // Active Premium State
  if (status?.membershipType === 'premium') {
    return (
      <View style={s.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[s.header, { paddingTop: insets.top + 16 }]}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <ArrowLeft size={20} color="#FFF" />
          </TouchableOpacity>
          <Text style={s.headerTitleLight}>Premium Member</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={s.centeredContent}>
          <Crown size={80} color="#D4AF37" fill="#D4AF37" style={{ marginBottom: 24 }} />
          <Text style={s.activeTitle}>You are a Premium Member!</Text>
          <Text style={s.activeSub}>Your membership expires on: {new Date(status.membershipExpiresAt).toLocaleDateString()}</Text>
          <TouchableOpacity style={s.homeBtn} onPress={() => router.replace('/')}>
            <Text style={s.homeBtnText}>Return Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* HERO SECTION */}
        <LinearGradient colors={['#10B981', '#059669']} style={[s.heroSection, { paddingTop: insets.top + 16 }]}>
          <View style={s.heroHeader}>
            <TouchableOpacity onPress={() => router.back()} style={s.backBtnTrans}>
              <ArrowLeft size={24} color="#FFF" />
            </TouchableOpacity>
            <View style={s.premiumBadge}>
              <Crown size={14} color="#D4AF37" fill="#D4AF37" />
              <Text style={s.premiumBadgeText}>PREMIUM</Text>
            </View>
            <View style={{ width: 44 }} />
          </View>
          <Text style={s.heroTitle}>Unlock Your Full Potential</Text>
          <Text style={s.heroSub}>Get access to everything you need to transform your body and health.</Text>
        </LinearGradient>

        {/* PENDING NOTIFICATION */}
        {status?.latestPurchase?.status === 'Pending' && (
          <View style={s.pendingAlert}>
            <Text style={s.pendingAlertTitle}>Verification Pending ⏳</Text>
            <Text style={s.pendingAlertSub}>Your previous payment is currently being reviewed by an administrator. Please wait up to 24 hours.</Text>
          </View>
        )}

        <View style={s.content}>
          {/* BENEFITS */}
          <Text style={s.sectionTitle}>Premium Features</Text>
          <View style={s.benefitsCard}>
            {BENEFITS.map((item, idx) => (
              <View key={idx} style={s.benefitRow}>
                <View style={s.iconWrapper}>
                  <item.icon size={18} color="#059669" />
                </View>
                <Text style={s.benefitText}>{item.text}</Text>
              </View>
            ))}
          </View>

          {/* PLANS */}
          <Text style={s.sectionTitle}>Choose Your Plan</Text>
          
          <TouchableOpacity 
            style={[s.planCard, selectedPlan === 'Monthly Plan' && s.planCardActive]}
            onPress={() => setSelectedPlan('Monthly Plan')}
          >
            <View style={s.planInfo}>
              <Text style={s.planName}>Monthly Plan</Text>
              <Text style={s.planPrice}>PKR 1,000<Text style={s.planPriceSub}>/mo</Text></Text>
            </View>
            <View style={[s.radio, selectedPlan === 'Monthly Plan' && s.radioActive]}>
              {selectedPlan === 'Monthly Plan' && <View style={s.radioInner} />}
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[s.planCard, selectedPlan === 'Yearly Plan' && s.planCardActive]}
            onPress={() => setSelectedPlan('Yearly Plan')}
          >
            <View style={s.popularBadge}>
              <Text style={s.popularBadgeText}>MOST POPULAR</Text>
            </View>
            <View style={s.planInfo}>
              <Text style={s.planName}>Yearly Plan</Text>
              <Text style={s.planPrice}>PKR 9,000<Text style={s.planPriceSub}>/yr</Text></Text>
              <Text style={s.planDiscount}>Save PKR 3,000 annually</Text>
            </View>
            <View style={[s.radio, selectedPlan === 'Yearly Plan' && s.radioActive]}>
              {selectedPlan === 'Yearly Plan' && <View style={s.radioInner} />}
            </View>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* FOOTER */}
      {status?.latestPurchase?.status !== 'Pending' && (
        <View style={[s.footer, { paddingBottom: insets.bottom + 16 }]}>
          <TouchableOpacity style={s.buyBtn} onPress={handleContinue}>
            <Text style={s.buyBtnText}>Continue with {selectedPlan}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  centered: { justifyContent: 'center', alignItems: 'center' },
  centeredContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#0F172A' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16, backgroundColor: '#0F172A' },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  backBtnTrans: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitleLight: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  
  activeTitle: { fontSize: 24, fontWeight: '900', color: '#FFF', marginBottom: 8 },
  activeSub: { fontSize: 15, color: '#94A3B8', textAlign: 'center', marginBottom: 32 },
  homeBtn: { backgroundColor: '#D4AF37', paddingHorizontal: 32, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  homeBtnText: { color: '#0F172A', fontSize: 16, fontWeight: '800' },

  heroSection: { paddingHorizontal: 24, paddingBottom: 40, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  heroHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  premiumBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFBEB', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 4 },
  premiumBadgeText: { color: '#D4AF37', fontSize: 12, fontWeight: '900', letterSpacing: 0.5 },
  heroTitle: { fontSize: 32, fontWeight: '900', color: '#FFF', marginBottom: 12 },
  heroSub: { fontSize: 15, color: '#D1FAE5', lineHeight: 22 },

  pendingAlert: { margin: 24, marginBottom: 0, backgroundColor: '#FEF3C7', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#FDE68A' },
  pendingAlertTitle: { fontSize: 15, fontWeight: '800', color: '#92400E', marginBottom: 4 },
  pendingAlertSub: { fontSize: 13, color: '#B45309', lineHeight: 20 },

  content: { padding: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#0F172A', marginBottom: 16, marginTop: 8 },
  
  benefitsCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#F1F5F9', marginBottom: 32, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
  benefitRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  iconWrapper: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#ECFDF5', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  benefitText: { fontSize: 15, fontWeight: '600', color: '#334155' },

  planCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, borderWidth: 2, borderColor: '#F1F5F9', marginBottom: 16, flexDirection: 'row', alignItems: 'center', position: 'relative' },
  planCardActive: { borderColor: '#059669', backgroundColor: '#ECFDF5' },
  popularBadge: { position: 'absolute', top: -10, left: 20, backgroundColor: '#D4AF37', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  popularBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  planInfo: { flex: 1 },
  planName: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 4 },
  planPrice: { fontSize: 24, fontWeight: '900', color: '#059669' },
  planPriceSub: { fontSize: 14, color: '#64748B', fontWeight: '600' },
  planDiscount: { fontSize: 12, color: '#059669', fontWeight: '700', marginTop: 4 },
  
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#CBD5E1', justifyContent: 'center', alignItems: 'center' },
  radioActive: { borderColor: '#059669' },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#059669' },

  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF', paddingHorizontal: 24, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  buyBtn: { backgroundColor: '#059669', height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  buyBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' }
});
