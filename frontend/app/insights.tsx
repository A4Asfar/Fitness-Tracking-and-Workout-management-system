import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Colors, SharedStyles, SPACING } from '@/constants/Theme';
import { 
  Sparkles, 
  ArrowLeft, 
  Crown,
  TrendingUp, 
  Activity,
  Zap,
  Target,
  ChevronRight,
  Flame,
  Award
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { safeBack } from '@/utils/navigation';
import { useAuth } from '@/context/AuthContext';

const { width } = Dimensions.get('window');

function InsightCard({ icon: Icon, title, value, subtext, color }: { icon: any; title: string; value: string; subtext: string; color: string }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconWrap, { backgroundColor: color + '15' }]}>
          <Icon size={20} color={color} strokeWidth={2.5} />
        </View>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <Text style={[styles.cardValue, { color: color }]}>{value}</Text>
      <Text style={styles.cardSubtext}>{subtext}</Text>
    </View>
  );
}

function RecommendationItem({ text }: { text: string }) {
  return (
    <View style={styles.recRow}>
      <View style={styles.recDot} />
      <Text style={styles.recText}>{text}</Text>
    </View>
  );
}

export default function PremiumInsightsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (user && user.membershipType !== 'premium') {
      router.replace('/upgrade');
    }
  }, [user]);

  if (!user) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (user.membershipType !== 'premium' && user.membershipType !== 'admin') {
    return null;
  }

  return (
    <View style={SharedStyles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity 
          onPress={() => safeBack()} 
          style={styles.backButton}
        >
          <ArrowLeft size={22} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.premiumBadge}>
            <Crown size={10} color="#000" fill="#000" />
            <Text style={styles.premiumBadgeText}>PREMIUM</Text>
          </View>
          <Text style={styles.headerTitle}>Premium Insights</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView 
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + SPACING.xl }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>Advanced performance recommendations</Text>

        {/* ── Insights Grid ── */}
        <View style={styles.grid}>
          <InsightCard 
            icon={Flame} 
            title="Consistency Score" 
            value="94%" 
            subtext="Highest this month"
            color="#FFD700" 
          />
          <InsightCard 
            icon={TrendingUp} 
            title="Strength Progress" 
            value="+12.4%" 
            subtext="Volume vs last week"
            color="#9FE800" 
          />
          <InsightCard 
            icon={Award} 
            title="Improvement" 
            value="Exceeding" 
            subtext="Above peer average"
            color="#00D1FF" 
          />
          <InsightCard 
            icon={Target} 
            title="Focus Area" 
            value="Hypertrophy" 
            subtext="Next phase recommendation"
            color="#FF6B3B" 
          />
        </View>

        {/* ── Smart Recommendations ── */}
        <View style={styles.section}>
          <LinearGradient
            colors={['#1A1A1A', '#111']}
            style={styles.recCard}
          >
            <View style={styles.recHeader}>
              <Zap size={20} color={Colors.primary} fill={Colors.primary} />
              <Text style={styles.recHeaderTitle}>Smart Recommendations</Text>
            </View>
            <View style={styles.recList}>
              <RecommendationItem text="Increase lower body training frequency by 15%." />
              <RecommendationItem text="Your workout consistency improved significantly this week." />
              <RecommendationItem text="Try increasing resistance gradually in your next bench session." />
              <RecommendationItem text="Optimal recovery detected. Intensity can be increased today." />
            </View>
          </LinearGradient>
        </View>

        {/* ── Visual Exclusive Footer ── */}
        <View style={styles.footer}>
          <Sparkles size={24} color={Colors.primary} opacity={0.4} />
          <Text style={styles.footerText}>Powered by Performance AI</Text>
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
  },
  headerCenter: {
    alignItems: 'center',
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
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
    marginBottom: 4,
  },
  premiumBadgeText: {
    color: '#000',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  headerTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 28,
  },
  content: {
    paddingHorizontal: SPACING.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 32,
  },
  card: {
    width: (width - SPACING.lg * 2 - 16) / 2,
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  cardValue: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  cardSubtext: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '500',
  },
  section: {
    marginBottom: 32,
  },
  recCard: {
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  recHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  recHeaderTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  recList: {
    gap: 16,
  },
  recRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  recDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginTop: 8,
  },
  recText: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
    flex: 1,
  },
  footer: {
    alignItems: 'center',
    marginTop: 8,
    gap: 12,
    opacity: 0.6,
  },
  footerText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
