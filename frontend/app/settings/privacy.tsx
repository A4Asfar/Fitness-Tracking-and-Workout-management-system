import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Colors, SharedStyles, SPACING } from '@/constants/Theme';
import { ShieldCheck, ArrowLeft, Lock, Eye, FileText } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { safeBack } from '@/utils/navigation';

export default function PrivacyScreen() {
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
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView 
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + SPACING.xl }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.shieldWrap}>
            <ShieldCheck size={48} color={Colors.primary} strokeWidth={1.5} />
          </View>
          <Text style={styles.heroTitle}>Your Privacy Matters</Text>
          <Text style={styles.heroSub}>Last updated: April 2026</Text>
        </View>

        <View style={styles.card}>
          <PrivacyItem 
            icon={Lock} 
            title="Data Security" 
            content="We use industry-standard encryption to protect your personal information and workout data. Your password is never stored in plain text." 
          />
          <View style={styles.divider} />
          <PrivacyItem 
            icon={Eye} 
            title="Data Usage" 
            content="Your fitness data is used exclusively to provide personalized insights and tracking. We do not sell your personal data to third parties." 
          />
          <View style={styles.divider} />
          <PrivacyItem 
            icon={FileText} 
            title="Legal Compliance" 
            content="We comply with GDPR and local privacy laws. You have the right to request a copy of your data or ask for its deletion at any time." 
          />
        </View>

        <Text style={styles.detailTitle}>Detailed Information</Text>
        <Text style={styles.detailText}>
          This Privacy Policy describes how we collect, use, and process your personal data when you use the Fitness Tracker Pro mobile application.{"\n\n"}
          1. Information We Collect: We collect your name, email address, weight, height, and fitness goals to personalize your experience.{"\n\n"}
          2. How We Use It: Your data helps our AI recommend workouts and track your consistency score.{"\n\n"}
          3. Sharing: We may share anonymized, aggregated data for research purposes, but never your identifiable personal information.
        </Text>
      </ScrollView>
    </View>
  );
}

function PrivacyItem({ icon: Icon, title, content }: any) {
  return (
    <View style={styles.item}>
      <View style={styles.iconBox}>
        <Icon size={20} color={Colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.itemTitle}>{title}</Text>
        <Text style={styles.itemContent}>{content}</Text>
      </View>
    </View>
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
  hero: {
    alignItems: 'center',
    marginBottom: 40,
  },
  shieldWrap: {
    width: 90,
    height: 90,
    borderRadius: 30,
    backgroundColor: Colors.primary + '12',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  heroTitle: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 6,
  },
  heroSub: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 32,
  },
  item: {
    flexDirection: 'row',
    padding: 20,
    gap: 16,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  itemContent: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 20,
  },
  detailTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
    marginLeft: 4,
  },
  detailText: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 24,
    fontWeight: '500',
    paddingHorizontal: 4,
  },
});
