import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Colors, SharedStyles, SPACING } from '@/constants/Theme';
import { 
  Dumbbell, 
  ArrowLeft, 
  CheckCircle2, 
  ShieldCheck, 
  Activity, 
  History, 
  Bell, 
  User,
  Zap
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { safeBack } from '@/utils/navigation';

/* ─── Feature Item Component ─── */
function FeatureItem({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <View style={styles.featureRow}>
      <View style={styles.featureIconBox}>
        <Icon size={16} color={Colors.primary} strokeWidth={2.5} />
      </View>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

export default function AboutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const features = [
    { text: "Workout Logging", icon: Activity },
    { text: "Workout History", icon: History },
    { text: "Progress Analytics", icon: Zap },
    { text: "Profile Management", icon: User },
    { text: "Reminders", icon: Bell },
  ];

  return (
    <View style={SharedStyles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity 
          onPress={() => safeBack()} 
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ArrowLeft size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView 
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + SPACING.xl }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero Section ── */}
        <View style={styles.heroCard}>
          <LinearGradient
            colors={[Colors.primary + '15', 'transparent']}
            style={styles.heroBg}
          />
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={[Colors.primary, Colors.secondary || Colors.primary]}
              style={styles.logoGradient}
            >
              <Dumbbell size={48} color="#000" strokeWidth={1.8} />
            </LinearGradient>
          </View>
          <Text style={styles.appName}>PeakPulse</Text>
          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>VERSION 1.0</Text>
          </View>
        </View>

        {/* ── Description ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Description</Text>
          <View style={styles.card}>
            <Text style={styles.descriptionText}>
              This mobile application helps users track workouts, monitor progress, and maintain fitness consistency. Built with modern technology to deliver a seamless fitness management experience.
            </Text>
          </View>
        </View>

        {/* ── Features ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Core Features</Text>
          <View style={styles.card}>
            <View style={styles.featuresGrid}>
              {features.map((feature, idx) => (
                <FeatureItem key={idx} icon={feature.icon} text={feature.text} />
              ))}
            </View>
          </View>
        </View>

        {/* ── Footer ── */}
        <View style={styles.footer}>
          <ShieldCheck size={20} color={Colors.textSecondary} opacity={0.5} />
          <Text style={styles.footerText}>
            Developed as a smart fitness management solution.
          </Text>
        </View>
      </ScrollView>
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
    backgroundColor: Colors.background,
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
  heroCard: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: Colors.card,
    borderRadius: 32,
    marginBottom: SPACING.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  heroBg: {
    ...StyleSheet.absoluteFillObject,
  },
  logoContainer: {
    marginBottom: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  logoGradient: {
    width: 100,
    height: 100,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -1,
    marginBottom: 10,
  },
  versionBadge: {
    backgroundColor: Colors.primary + '18',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary + '35',
  },
  versionText: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  descriptionText: {
    color: Colors.text,
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '500',
  },
  featuresGrid: {
    gap: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  featureIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.primary + '12',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: SPACING.md,
    gap: 12,
  },
  footerText: {
    color: Colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
    opacity: 0.7,
  },
});
