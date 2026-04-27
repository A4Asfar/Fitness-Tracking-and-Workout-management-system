import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Linking, SafeAreaView, Dimensions, BackHandler, Platform,
} from 'react-native';
import { Colors } from '@/constants/Theme';
import { useRouter, Stack } from 'expo-router';
import {
  CircleHelp, Mail, Phone, ArrowLeft, 
  Clock, ShieldCheck, ChevronDown, HelpCircle
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const FAQS = [
  { q: 'How do I log a workout?', a: 'Tap the "Log Workout" card on the Home dashboard or use the "Log" tab. Fill in your exercise name, sets, and reps to save your progress.' },
  { q: 'How is Total Volume calculated?', a: 'Total Volume = Sets × Reps × Weight (kg). For bodyweight exercises, volume is calculated based on reps and sets alone.' },
  { q: 'Can I edit or delete past workouts?', a: 'Yes. Navigate to the History tab, tap on any workout card, and you will find options to update or delete that entry.' },
];

export default function SupportScreen() {
  const router = useRouter();

  const handleBack = React.useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/settings-hub' as any);
    }
    return true; 
  }, [router]);

  // Handle Android hardware back button
  React.useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBack
    );
    return () => backHandler.remove();
  }, [handleBack]);

  return (
    <View style={s.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={s.safeArea}>
        
        {/* ── Standard Header ── */}
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={handleBack}>
            <ArrowLeft size={22} color={Colors.text} />
          </TouchableOpacity>
          <View style={s.headerTitleWrap}>
            <Text style={s.headerTitle}>Help & Support</Text>
            <Text style={s.headerSub}>We're here to help</Text>
          </View>
          <View style={s.headerRight} />
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={s.content}
          bounces={false}
        >
          
          {/* ── Centered Icon Card ── */}
          <View style={s.heroContainer}>
            <LinearGradient
              colors={[Colors.primary + '15', 'transparent']}
              style={s.heroCard}
            >
              <View style={s.iconCircle}>
                <CircleHelp size={42} color={Colors.primary} strokeWidth={1.5} />
              </View>
              <Text style={s.heroText}>Fitness Tracker Pro Support</Text>
            </LinearGradient>
          </View>

          {/* ── Support Cards (Vertical List) ── */}
          <View style={s.section}>
            
            {/* FAQ Card */}
            <TouchableOpacity style={s.supportCard} activeOpacity={0.8}>
              <View style={[s.cardIcon, { backgroundColor: '#FFD7001A' }]}>
                <HelpCircle size={22} color="#FFD700" />
              </View>
              <View style={s.cardBody}>
                <Text style={s.cardTitle}>View FAQ</Text>
                <Text style={s.cardDesc}>Browse common questions and answers</Text>
              </View>
              <ChevronDown size={20} color="#333" />
            </TouchableOpacity>

            {/* Email Card */}
            <TouchableOpacity 
              style={s.supportCard} 
              activeOpacity={0.8}
              onPress={() => Linking.openURL('mailto:support@fittrackerpro.com')}
            >
              <View style={[s.cardIcon, { backgroundColor: '#00D1FF1A' }]}>
                <Mail size={22} color="#00D1FF" />
              </View>
              <View style={s.cardBody}>
                <Text style={s.cardTitle}>Email Us</Text>
                <Text style={s.cardDesc}>support@fittrackerpro.com</Text>
              </View>
            </TouchableOpacity>

            {/* Phone Card */}
            <TouchableOpacity 
              style={s.supportCard} 
              activeOpacity={0.8}
              onPress={() => Linking.openURL('tel:+1800FITPRO')}
            >
              <View style={[s.cardIcon, { backgroundColor: '#A855F71A' }]}>
                <Phone size={22} color="#A855F7" />
              </View>
              <View style={s.cardBody}>
                <Text style={s.cardTitle}>Call Support</Text>
                <Text style={s.cardDesc}>+1 (800) FIT-PRO</Text>
              </View>
            </TouchableOpacity>

            {/* Hours Card */}
            <View style={s.supportCard}>
              <View style={[s.cardIcon, { backgroundColor: Colors.primary + '1A' }]}>
                <Clock size={22} color={Colors.primary} />
              </View>
              <View style={s.cardBody}>
                <Text style={s.cardTitle}>Support Hours</Text>
                <Text style={s.cardDesc}>Available 24/7 for Elite Members</Text>
              </View>
            </View>

          </View>

          {/* ── FAQ Details ── */}
          <View style={s.section}>
            <Text style={s.sectionLabel}>Top Questions</Text>
            {FAQS.map((faq, i) => (
              <View key={i} style={s.faqItem}>
                <Text style={s.faqQ}>{faq.q}</Text>
                <Text style={s.faqA}>{faq.a}</Text>
              </View>
            ))}
          </View>

          {/* ── Footer ── */}
          <View style={s.footer}>
            <ShieldCheck size={18} color={Colors.textSecondary} />
            <Text style={s.footerText}>Secure Channel · Fitness Tracker Pro v1.0.0</Text>
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  safeArea: { flex: 1, paddingTop: Platform.OS === 'android' ? 10 : 0 },
  
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#1A1A1A',
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#161616', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#222',
  },
  headerTitleWrap: { alignItems: 'center' },
  headerTitle: { color: Colors.text, fontSize: 17, fontWeight: '900', letterSpacing: -0.5 },
  headerSub: { color: Colors.textSecondary, fontSize: 11, fontWeight: '600', marginTop: 1 },
  headerRight: { width: 40 },
  
  content: { paddingBottom: 40, paddingTop: 20 },

  heroContainer: { paddingHorizontal: 20, marginBottom: 20 },
  heroCard: {
    borderRadius: 24, padding: 24, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.primary + '25',
    backgroundColor: '#141414',
  },
  iconCircle: {
    width: 72, height: 72, borderRadius: 24,
    backgroundColor: Colors.primary + '10', justifyContent: 'center', alignItems: 'center',
    marginBottom: 14, borderWidth: 1, borderColor: Colors.primary + '15',
  },
  heroText: { color: Colors.text, fontSize: 14, fontWeight: '800', letterSpacing: 0.2 },

  section: { paddingHorizontal: 20, marginBottom: 16 },
  sectionLabel: { color: Colors.textSecondary, fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12, marginLeft: 4 },

  supportCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#141414',
    borderRadius: 20, padding: 16, marginBottom: 10,
    borderWidth: 1, borderColor: '#1E1E1E',
  },
  cardIcon: {
    width: 44, height: 44, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  cardBody: { flex: 1 },
  cardTitle: { color: Colors.text, fontSize: 14, fontWeight: '800', marginBottom: 2 },
  cardDesc: { color: Colors.textSecondary, fontSize: 11, fontWeight: '500' },

  faqItem: {
    backgroundColor: '#141414', borderRadius: 18, padding: 18, marginBottom: 10,
    borderWidth: 1, borderColor: '#1E1E1E',
  },
  faqQ: { color: Colors.text, fontSize: 13, fontWeight: '800', marginBottom: 6, letterSpacing: -0.1 },
  faqA: { color: Colors.textSecondary, fontSize: 12, lineHeight: 19, fontWeight: '500' },

  footer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, marginTop: 15, opacity: 0.4,
  },
  footerText: { color: Colors.textSecondary, fontSize: 10, fontWeight: '700' },
});
