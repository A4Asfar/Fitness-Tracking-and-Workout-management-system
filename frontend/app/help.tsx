import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  LayoutAnimation, Platform, UIManager, Linking 
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Colors, SharedStyles, SPACING } from '@/constants/Theme';
import { 
  HelpCircle, ArrowLeft, ChevronDown, Mail, 
  MessageSquare, Clock, Globe, ShieldCheck,
  Search, ExternalLink
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { safeBack } from '@/utils/navigation';
import { LinearGradient } from 'expo-linear-gradient';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FAQS = [
  {
    q: "How do I log my workouts?",
    a: "Tap the '+' icon on the Home dashboard or go to the Training tab. Select your exercise, enter sets, reps, and weight, then hit 'Save Session'."
  },
  {
    q: "What is the Training Insight score?",
    a: "Our AI analyzes your volume, frequency, and recovery patterns to give you a score. High scores indicate optimal consistency and balanced training load."
  },
  {
    q: "How do I upgrade to Premium?",
    a: "Go to your Account tab and tap 'Upgrade to Premium'. Premium unlocks advanced analytics, daily reminders, and exclusive recovery insights."
  },
  {
    q: "Can I sync with other health apps?",
    a: "Currently, we support manual logging. We are working on Apple Health and Google Fit integrations for the next major release (v2.0)."
  },
  {
    q: "How do I reset my data?",
    a: "If you wish to clear your history, go to Account > Security & Privacy. There you will find an option to wipe your workout data."
  }
];

export default function HelpCenterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={SharedStyles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity onPress={() => safeBack()} style={styles.backButton}>
          <ArrowLeft size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help Center</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView 
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + SPACING.xl }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.intro}>
          <LinearGradient
            colors={[Colors.primary + '15', 'transparent']}
            style={styles.helpIconWrap}
          >
            <HelpCircle size={40} color={Colors.primary} strokeWidth={1.5} />
          </LinearGradient>
          <Text style={styles.introTitle}>How can we help?</Text>
          <Text style={styles.introSub}>Search our knowledge base or reach out to our dedicated support team.</Text>
        </View>

        {/* ── Contact Support Grid ── */}
        <View style={styles.supportGrid}>
          <SupportCard 
            icon={Mail} 
            label="Email" 
            value="support@fitpro.ai" 
            onPress={() => Linking.openURL('mailto:support@fitpro.ai')}
          />
          <SupportCard 
            icon={MessageSquare} 
            label="Live Chat" 
            value="Elite Members Only" 
            onPress={() => {}}
          />
        </View>

        {/* ── FAQ Section ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <Search size={18} color={Colors.textSecondary} />
        </View>
        
        <View style={styles.faqList}>
          {FAQS.map((faq, idx) => (
            <FAQItem key={idx} question={faq.q} answer={faq.a} />
          ))}
        </View>

        {/* ── System Status ── */}
        <View style={styles.statusBox}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>All systems operational</Text>
          <View style={{ flex: 1 }} />
          <Text style={styles.versionText}>v1.5.2</Text>
        </View>

        {/* ── Footer Info ── */}
        <View style={styles.footerInfo}>
          <View style={styles.infoRow}>
            <Clock size={16} color={Colors.textSecondary} />
            <Text style={styles.infoText}>Support: 9 AM - 6 PM EST (Mon-Fri)</Text>
          </View>
          <View style={styles.infoRow}>
            <Globe size={16} color={Colors.textSecondary} />
            <Text style={styles.infoText}>Global Community Support 24/7</Text>
          </View>
          <TouchableOpacity style={styles.termsLink}>
            <ShieldCheck size={16} color={Colors.primary} />
            <Text style={styles.termsText}>Privacy & Security Policy</Text>
            <ExternalLink size={12} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

function SupportCard({ icon: Icon, label, value, onPress }: any) {
  return (
    <TouchableOpacity style={styles.supportCard} activeOpacity={0.7} onPress={onPress}>
      <View style={styles.supportIconBox}>
        <Icon size={20} color={Colors.primary} />
      </View>
      <Text style={styles.supportLabel}>{label}</Text>
      <Text style={styles.supportValue} numberOfLines={1}>{value}</Text>
    </TouchableOpacity>
  );
}

function FAQItem({ question, answer }: any) {
  const [expanded, setExpanded] = useState(false);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <TouchableOpacity 
      style={[styles.faqItem, expanded && styles.faqExpanded]} 
      onPress={toggle} 
      activeOpacity={0.9}
    >
      <View style={styles.faqHeader}>
        <Text style={styles.faqQuestion}>{question}</Text>
        <View style={[styles.chevronBox, expanded && styles.chevronBoxActive]}>
          <ChevronDown 
            size={16} 
            color={expanded ? Colors.primary : Colors.textSecondary} 
            style={{ transform: [{ rotate: expanded ? '180deg' : '0deg' }] }} 
          />
        </View>
      </View>
      {expanded && (
        <View style={styles.answerWrap}>
          <View style={styles.answerLine} />
          <Text style={styles.faqAnswer}>{answer}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  intro: {
    alignItems: 'center',
    marginBottom: 32,
  },
  helpIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  introTitle: {
    color: Colors.text,
    fontSize: 26,
    fontWeight: '900',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  introSub: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
    fontWeight: '500',
  },
  supportGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 40,
  },
  supportCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  supportIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  supportLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  supportValue: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  faqList: {
    gap: 12,
  },
  faqItem: {
    backgroundColor: Colors.card,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  faqExpanded: {
    borderColor: Colors.primary + '30',
    backgroundColor: '#161616',
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '800',
    flex: 1,
    marginRight: 10,
    lineHeight: 20,
  },
  chevronBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chevronBoxActive: {
    borderColor: Colors.primary + '40',
    backgroundColor: Colors.primary + '10',
  },
  answerWrap: {
    flexDirection: 'row',
    marginTop: 16,
    paddingRight: 10,
  },
  answerLine: {
    width: 3,
    backgroundColor: Colors.primary,
    borderRadius: 2,
    marginRight: 14,
    opacity: 0.8,
  },
  faqAnswer: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
    flex: 1,
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 32,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00FF85',
    marginRight: 10,
    shadowColor: '#00FF85',
    shadowRadius: 4,
    shadowOpacity: 0.5,
  },
  statusText: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  versionText: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
    opacity: 0.5,
  },
  footerInfo: {
    marginTop: 40,
    gap: 16,
    alignItems: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  termsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    padding: 12,
    backgroundColor: Colors.primary + '08',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary + '15',
  },
  termsText: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
});
