import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { ShieldCheck, ArrowLeft, Lock, Eye, FileText } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { APP_NAME } from '@/constants/Brand';

export default function PrivacyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
          <ArrowLeft size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.shieldWrap}>
            <ShieldCheck size={36} color="#10B981" strokeWidth={1.5} />
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
          <Divider />
          <PrivacyItem 
            icon={Eye} 
            title="Data Usage" 
            content="Your fitness data is used exclusively to provide personalized insights and tracking. We do not sell your personal data to third parties." 
          />
          <Divider />
          <PrivacyItem 
            icon={FileText} 
            title="Legal Compliance" 
            content="We comply with GDPR and local privacy laws. You have the right to request a copy of your data or ask for its deletion at any time." 
          />
        </View>

        <Text style={styles.detailTitle}>Detailed Information</Text>
        <Text style={styles.detailText}>
          This Privacy Policy describes how we collect, use, and process your personal data when you use the {APP_NAME} mobile application.{"\n\n"}
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
        <Icon size={18} color="#10B981" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.itemTitle}>{title}</Text>
        <Text style={styles.itemContent}>{content}</Text>
      </View>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#0F172A',
    borderBottomWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  content: {
    padding: 20,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 10,
  },
  shieldWrap: {
    width: 76,
    height: 76,
    borderRadius: 26,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
  },
  heroTitle: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 6,
  },
  heroSub: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#0F172A',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    marginBottom: 28,
  },
  item: {
    flexDirection: 'row',
    padding: 20,
    gap: 16,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  itemTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  itemContent: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
  },
  divider: {
    height: 1.5,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginHorizontal: 16,
  },
  detailTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 12,
    marginLeft: 4,
  },
  detailText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 20,
    marginLeft: 4,
  },
});
