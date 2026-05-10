import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Dimensions, RefreshControl, ActivityIndicator, Animated, Pressable,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { Colors, SPACING } from '@/constants/Theme';
import api from '@/services/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Trophy, Calendar, Flame, PlusCircle,
  History as HistoryIcon, User as UserIcon,
  ChevronRight, TrendingUp, Settings, Dumbbell,
  Zap, Quote, Bell, Sparkles, Activity, ShieldCheck, Users, HeartPulse,
  Brain, ArrowUpRight, Scale
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import PremiumBadge from '@/components/PremiumBadge';
import { safeBack } from '@/utils/navigation';

const { width } = Dimensions.get('window');
const PAD = SPACING.lg;
const GAP = SPACING.md;
const HALF = (width - PAD * 2 - GAP) / 2;

/* ─── Animated Press Card ─── */
function PressCard({ onPress, children, style }: { onPress: () => void; children: React.ReactNode; style?: any }) {
  const scale = useRef(new Animated.Value(1)).current;
  const press = () => Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
  const release = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 5 }).start();
  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable onPressIn={press} onPressOut={release} onPress={onPress} style={{ flex: 1 }}>
        {children}
      </Pressable>
    </Animated.View>
  );
}

/* ─── Metric Pill ─── */
function MetricPill({ icon: Icon, value, label, accent, delay }: {
  icon: any; value: string; label: string; accent: string; delay: number;
}) {
  const op = useRef(new Animated.Value(0)).current;
  const ty = useRef(new Animated.Value(14)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(op, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
      Animated.timing(ty, { toValue: 0, duration: 400, delay, useNativeDriver: true }),
    ]).start();
  }, []);
  return (
    <Animated.View style={[mp.wrap, { opacity: op, transform: [{ translateY: ty }] }]}>
      <View style={[mp.icon, { backgroundColor: accent + '1A' }]}>
        <Icon size={16} color={accent} strokeWidth={2.2} />
      </View>
      <Text style={mp.value} numberOfLines={1}>{value}</Text>
      <Text style={mp.label}>{label}</Text>
    </Animated.View>
  );
}
const mp = StyleSheet.create({
  wrap: {
    flex: 1, backgroundColor: '#161616', borderRadius: 22, padding: 16,
    alignItems: 'center', borderWidth: 1.5, borderColor: '#1F1F1F',
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.45, shadowRadius: 16, elevation: 12,
  },
  icon: { width: 40, height: 40, borderRadius: 13, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  value: { color: Colors.text, fontSize: 20, fontWeight: '900', letterSpacing: -0.8 },
  label: { color: Colors.textSecondary, fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.2, marginTop: 5, textAlign: 'center' },
});

/* ─── Action cards data ─── */
const ACTIONS = [
  {
    title: 'Log Workout',
    desc: 'Start a new training session',
    icon: PlusCircle,
    route: '/create-workout',
    accent: Colors.primary,
    grad: [Colors.primary + '28', Colors.primary + '08'] as [string, string],
    full: true,
    premium: false,
  },
  {
    title: 'Workout History',
    desc: 'Review past sessions',
    icon: HistoryIcon,
    route: '/(tabs)/workouts',
    accent: '#00D1FF',
    grad: ['#00D1FF22', '#00D1FF06'] as [string, string],
    full: false,
    premium: false,
  },
  {
    title: 'Progress Analytics',
    desc: 'Charts & performance',
    icon: TrendingUp,
    route: '/(tabs)/progress',
    accent: '#A855F7',
    grad: ['#A855F722', '#A855F706'] as [string, string],
    full: false,
    premium: true,
  },
  {
    title: 'Progress Comparison',
    desc: 'This week vs Last week',
    icon: Activity,
    route: '/progress-comparison',
    accent: Colors.primary,
    grad: [Colors.primary + '22', Colors.primary + '06'] as [string, string],
    full: false,
    premium: false,
  },
  {
    title: 'AI Assistant',
    desc: 'Instant fitness advice',
    icon: Sparkles,
    route: '/ai-chat',
    accent: Colors.primary,
    grad: [Colors.primary + '22', Colors.primary + '06'] as [string, string],
    full: false,
    premium: false,
  },
  {
    title: 'Trainer Guidance',
    desc: 'AI coaching & tips',
    icon: Brain,
    route: '/trainer-guidance',
    accent: '#00D1FF',
    grad: ['#00D1FF22', '#00D1FF06'] as [string, string],
    full: false,
    premium: false,
  },
  {
    title: 'Workout Reminders',
    desc: 'Daily fitness alerts',
    icon: Bell,
    route: '/reminders',
    accent: '#FFD700',
    grad: ['#FFD70022', '#FFD70006'] as [string, string],
    full: false,
    premium: true,
  },
  {
    title: 'Find a Trainer',
    desc: 'Expert human coaching',
    icon: Users,
    route: '/trainers',
    accent: Colors.primary,
    grad: [Colors.primary + '22', Colors.primary + '06'] as [string, string],
    full: false,
    premium: false,
  },
  {
    title: 'Body Health',
    desc: 'BMI & body status',
    icon: HeartPulse,
    route: '/body-health',
    accent: '#A855F7',
    grad: ['#A855F722', '#A855F706'] as [string, string],
    full: false,
    premium: false,
  },
  {
    title: 'Weight Progress',
    desc: 'Log & track your weight',
    icon: Scale,
    route: '/weight-logger',
    accent: '#FFD700',
    grad: ['#FFD70022', '#FFD70006'] as [string, string],
    full: false,
    premium: false,
  },
  {
    title: 'Notifications',
    desc: 'View your recent alerts',
    icon: Bell,
    route: '/notifications',
    accent: Colors.primary,
    grad: [Colors.primary + '22', Colors.primary + '06'] as [string, string],
    full: false,
    premium: false,
  },
  {
    title: 'Edit Profile',
    desc: 'Goals & personal stats',
    icon: UserIcon,
    route: '/settings/edit-profile',
    accent: '#FF6B3B',
    grad: ['#FF6B3B22', '#FF6B3B06'] as [string, string],
    full: false,
    premium: false,
  },
];

const QUOTES = [
  { text: "Discipline beats motivation every single time.", author: "Proverb" },
  { text: "Push harder than yesterday if you want a different tomorrow.", author: "Elite Mindset" },
  { text: "Success starts with self-discipline and daily habits.", author: "High Performance" },
  { text: "Your body can stand almost anything. Convince your mind.", author: "Daily Growth" },
  { text: "Every rep counts, every drop of sweat is progress.", author: "Pro Athlete" },
  { text: "Don't stop when you're tired. Stop when you're done.", author: "David Goggins" },
  { text: "The only bad workout is the one that didn't happen.", author: "Consistency" },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export default function HomeDashboard() {
  const { user, isNewUser } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [stats, setStats] = useState<any>(null);
  const [recent, setRecent] = useState<any>(null);
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const heroOp = useRef(new Animated.Value(0)).current;
  const heroTy = useRef(new Animated.Value(-20)).current;

  const [quote, setQuote] = useState(QUOTES[0]);
  const quoteOp = useRef(new Animated.Value(0)).current;

  const fetchData = async () => {
    try {
      const [statsRes, workoutsRes] = await Promise.all([
        api.get('/workouts/stats'),
        api.get('/workouts'),
      ]);
      setStats(statsRes.data);
      if (workoutsRes.data?.length > 0) setRecent(workoutsRes.data[0]);

      // Fetch premium insights if applicable
      if (user?.membershipType === 'premium' || user?.membershipType === 'admin') {
        const insightsRes = await api.get('/workouts/home-insights');
        setInsights(insightsRes.data);
      }
    } catch (e) {
      console.log('Home fetch error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Randomize quote
    const randomIdx = Math.floor(Math.random() * QUOTES.length);
    setQuote(QUOTES[randomIdx]);

    Animated.parallel([
      Animated.timing(heroOp, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(heroTy, { toValue: 0, duration: 600, useNativeDriver: true }),
      Animated.timing(quoteOp, { toValue: 1, duration: 800, delay: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const fmt = (d: string) => {
    if (!d) return 'Never';
    const diff = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff < 7) return `${diff}d ago`;
    return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  if (loading && !refreshing) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <LinearGradient colors={[Colors.primary + '25', 'transparent']} style={StyleSheet.absoluteFill} />
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ color: Colors.textSecondary, marginTop: 14, fontSize: 14, fontWeight: '600' }}>Loading your dashboard…</Text>
      </View>
    );
  }

  const firstName = user?.name?.split(' ')[0] ?? 'Athlete';
  const isPremium = user?.membershipType === 'premium' || user?.membershipType === 'admin';
  const isAdmin   = user?.membershipType === 'admin';
  const filteredActions = ACTIONS.filter(a => !a.premium || isPremium);

  return (
    <ScrollView
      style={s.root}
      contentContainerStyle={{ paddingBottom: 64 }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
    >
        {/* ── Daily Plan Quick Access ── */}
        <TouchableOpacity 
          style={s.dailyPlanCard}
          onPress={() => router.push('/daily-plan' as any)}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[Colors.primary, '#9FE800']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.dailyPlanGrad}
          >
            <View style={s.dailyPlanContent}>
              <View style={{ flex: 1 }}>
                <View style={s.dailyPlanTag}>
                  <Sparkles size={12} color="#000" fill="#000" />
                  <Text style={s.dailyPlanTagText}>AI GENERATED</Text>
                </View>
                <Text style={s.dailyPlanTitle}>Today's Personalized Plan</Text>
                <Text style={s.dailyPlanSub}>Check your custom workout & meal plan</Text>
              </View>
              <View style={s.dailyPlanArrow}>
                <ChevronRight size={24} color="#000" strokeWidth={3} />
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* ── Progress Comparison Highlight ── */}
        <TouchableOpacity 
          style={s.progressHighlight}
          onPress={() => router.push('/progress-comparison' as any)}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#1A1A1A', '#121212']}
            style={s.progressHighlightGrad}
          >
            <View style={s.progressHighlightLeft}>
              <View style={s.progressIconWrap}>
                <TrendingUp size={24} color={Colors.primary} />
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.progressHighlightTitle}>Digital Progress Comparison</Text>
              <Text style={s.progressHighlightSub}>Monitor your weekly improvements</Text>
            </View>
            <View style={s.progressTrend}>
              <ArrowUpRight size={16} color={stats?.comparison?.percentage >= 0 ? Colors.primary : '#FF4B4B'} />
              <Text style={[s.progressTrendText, { color: stats?.comparison?.percentage >= 0 ? Colors.primary : '#FF4B4B' }]}>
                {stats?.comparison?.percentage !== undefined 
                  ? `${stats.comparison.percentage >= 0 ? '+' : ''}${Math.round(stats.comparison.percentage)}%`
                  : 'N/A'}
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

      {/* ── Hero Header ── */}
      <View style={s.heroWrap}>
        <LinearGradient
          colors={[Colors.primary + '25', Colors.primary + '08', 'transparent']}
          style={StyleSheet.absoluteFill}
        />
        <Animated.View style={[s.heroInner, { opacity: heroOp, transform: [{ translateY: heroTy }], paddingTop: insets.top + SPACING.md }]}>
          <View style={s.heroTop}>
            <View>
              <Text style={s.heroGreeting}>{isNewUser ? '👋 Welcome,' : getGreeting() + ','}</Text>
              <Text style={s.heroName}>{firstName}</Text>
              <Text style={s.heroSub}>Stay consistent. Stay strong. 💪</Text>
              <Text style={{ color: Colors.primary, fontSize: 10, fontWeight: '700', marginTop: 4, textTransform: 'uppercase', letterSpacing: 1 }}>
                Membership: {user?.membershipType}
              </Text>
            </View>
            <View style={s.headerActions}>
              <TouchableOpacity
                style={s.heroNotif}
                onPress={() => router.push('/notifications' as any)}
              >
                <LinearGradient colors={[Colors.primary + '30', Colors.primary + '10']} style={s.heroAvatarGrad}>
                  <Bell size={24} color={Colors.primary} strokeWidth={2} />
                  <View style={s.notifBadge} />
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.heroAvatar}
                onPress={() => router.push('/(tabs)/settings')}
              >
                <LinearGradient colors={[Colors.primary + '40', Colors.primary + '15']} style={s.heroAvatarGrad}>
                  <UserIcon size={26} color={Colors.primary} strokeWidth={1.8} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>

      <View style={s.body}>

        {/* ── Admin Control Center ── */}
        {isAdmin && (
          <>
            <View style={[s.sectionRow, { marginTop: 10 }]}>
              <Text style={s.sectionTitle}>Admin Control Center</Text>
              <ShieldCheck size={14} color="#FF3B30" style={{ marginLeft: 8 }} />
              <View style={s.sectionLine} />
            </View>

            <TouchableOpacity 
              style={s.adminCard} 
              activeOpacity={0.85}
              onPress={() => router.push('/admin-dashboard' as any)}
            >
              <LinearGradient colors={['#FF3B3020', '#FF3B3005']} style={s.adminCardGrad}>
                <View style={s.adminCardHeader}>
                <View style={s.adminIconBox}>
                  <Users size={24} color="#FF3B30" />
                </View>
                  <View style={s.adminTag}>
                    <Text style={s.adminTagText}>ROOT ACCESS</Text>
                  </View>
                </View>
                <Text style={s.adminCardTitle}>User Management System</Text>
                <Text style={s.adminCardDesc}>
                  Access system-wide analytics, manage user memberships, and monitor platform health metrics.
                </Text>
                <View style={s.adminFooter}>
                  <Text style={s.adminFooterText}>Launch Admin Console</Text>
                  <ChevronRight size={14} color="#FF3B30" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </>
        )}

        {/* ── Metrics Row ── */}
        <View style={s.metricsRow}>
          <MetricPill
            icon={Trophy} accent={Colors.primary}
            value={stats?.totalWorkouts?.toString() ?? '0'}
            label="Workouts" delay={0}
          />
          <MetricPill
            icon={Flame} accent="#FF6B3B"
            value={`${stats?.workoutsThisWeek ?? 0}`}
            label="This Week" delay={80}
          />
          <MetricPill
            icon={Calendar} accent="#00D1FF"
            value={fmt(stats?.lastWorkoutDate)}
            label="Last Session" delay={160}
          />
          {isPremium && (
            <MetricPill
              icon={TrendingUp} accent="#A855F7"
              value={stats?.totalVolume > 1000 ? `${(stats.totalVolume/1000).toFixed(1)}k` : stats?.totalVolume?.toString() ?? '0'}
              label="Volume (kg)" delay={240}
            />
          )}
        </View>

        {/* ── Section title ── */}
        <View style={s.sectionRow}>
          <Text style={s.sectionTitle}>Command Center</Text>
          <View style={s.sectionLine} />
        </View>

        {/* ── Full-width Log Workout card ── */}
        {(() => {
          const a = filteredActions[0];
          if (!a) return null;
          return (
            <PressCard onPress={() => router.push(a.route as any)} style={{ marginBottom: GAP }}>
              <LinearGradient colors={[Colors.primary + '30', Colors.primary + '0A']} style={s.fullCard}>
                <LinearGradient colors={[Colors.primary + '50', Colors.primary + '20']} style={s.fullCardIcon}>
                  <a.icon size={32} color={Colors.primary} strokeWidth={1.8} />
                </LinearGradient>
                <View style={s.fullCardBody}>
                  <Text style={s.fullCardTitle}>{a.title}</Text>
                  <Text style={s.fullCardDesc}>{a.desc}</Text>
                </View>
                <LinearGradient colors={[Colors.primary, '#9FE800']} style={s.fullCardChevron}>
                  <ChevronRight size={20} color="#000" strokeWidth={2.5} />
                </LinearGradient>
              </LinearGradient>
            </PressCard>
          );
        })()}

        {/* ── 2-column grid ── */}
        <View style={s.grid}>
          {filteredActions.slice(1).map((a, i) => (
            <PressCard key={i} onPress={() => router.push(a.route as any)} style={s.gridItem}>
              <LinearGradient colors={a.grad} style={s.gridCard}>
                {a.premium && (
                  <PremiumBadge style={s.badgePos} />
                )}
                <View style={[s.gridCardIcon, { backgroundColor: a.accent + '20' }]}>
                  <a.icon size={24} color={a.accent} strokeWidth={2} />
                </View>
                <Text style={s.gridCardTitle}>{a.title}</Text>
                <Text style={s.gridCardDesc}>{a.desc}</Text>
                <View style={[s.gridCardArrow, { backgroundColor: a.accent + '18' }]}>
                  <ChevronRight size={14} color={a.accent} />
                </View>
              </LinearGradient>
            </PressCard>
          ))}
        </View>

        {/* ── Premium Insights Section ── */}
        {isPremium && (
          <>
            <View style={[s.sectionRow, { marginTop: 20 }]}>
              <Text style={s.sectionTitle}>Premium Insights</Text>
              <PremiumBadge style={{ marginLeft: 8 }} />
              <View style={s.sectionLine} />
            </View>

            <TouchableOpacity 
              style={s.premiumCard} 
              activeOpacity={0.85}
              onPress={() => router.push('/insights' as any)}
            >
              <LinearGradient 
                colors={[Colors.primary + '20', Colors.primary + '05']} 
                style={s.premiumCardGrad}
              >
                <View style={s.premiumCardHeader}>
                  <View style={s.premiumIconBox}>
                    <Activity size={24} color={Colors.primary} />
                  </View>
                  <View style={s.premiumTag}>
                    <Text style={s.premiumTagText}>EXCLUSIVE</Text>
                  </View>
                </View>
                <Text style={s.premiumCardTitle}>Recovery: {insights?.recoveryScore ?? 'Analyzing...'}</Text>
                <Text style={s.premiumCardDesc}>
                  {insights?.advice ?? 'Gathering session data to provide tailored recovery advice...'}
                </Text>
                <View style={s.premiumFooter}>
                  <Text style={s.premiumFooterText}>Analyze {insights?.intensityLevel ?? 'Volume'} Trends</Text>
                  <ChevronRight size={14} color={Colors.primary} />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </>
        )}

        {/* ── Daily Motivation Banner ── */}
        <View style={s.sectionRow}>
          <Text style={s.sectionTitle}>Daily Motivation</Text>
          <View style={s.sectionLine} />
        </View>

        <Animated.View style={{ opacity: quoteOp }}>
          <LinearGradient
            colors={['#1A1A1A', '#161616']}
            style={s.quoteBanner}
          >
            <LinearGradient colors={[Colors.primary + '18', 'transparent']} style={StyleSheet.absoluteFill} />
            <View style={s.quoteIconWrap}>
              <Quote size={22} color={Colors.primary} strokeWidth={1.6} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.quoteText}>"{quote.text}"</Text>
              <Text style={s.quoteAuthor}>— {quote.author}</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* ── Recent Activity Preview ── */}
        {recent && (
          <>
            <View style={[s.sectionRow, { marginTop: 28 }]}>
              <Text style={s.sectionTitle}>Recent Activity</Text>
              <View style={s.sectionLine} />
              <TouchableOpacity onPress={() => router.push('/(tabs)/workouts' as any)}>
                <Text style={s.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={s.recentCard}
              onPress={() => router.push(`/workout/${recent._id}` as any)}
              activeOpacity={0.8}
            >
              {/* accent bar */}
              <View style={[s.recentAccentBar, { backgroundColor: Colors.primary }]} />
              <View style={[s.recentIconWrap, { backgroundColor: Colors.primary + '18' }]}>
                <Dumbbell size={22} color={Colors.primary} strokeWidth={1.8} />
              </View>
              <View style={s.recentBody}>
                <Text style={s.recentExercise}>{recent.exercise}</Text>
                <View style={s.recentMeta}>
                  <Text style={s.recentChip}>{recent.sets} sets</Text>
                  <Text style={s.recentChip}>{recent.reps} reps</Text>
                  {recent.weight > 0 && <Text style={s.recentChip}>{recent.weight} kg</Text>}
                </View>
              </View>
              <View style={s.recentRight}>
                <Text style={s.recentDate}>{fmt(recent.date)}</Text>
                <ChevronRight size={18} color={Colors.textSecondary} />
              </View>
            </TouchableOpacity>
          </>
        )}

        {/* No workouts yet nudge */}
        {!recent && !loading && (
          <TouchableOpacity
            style={s.emptyNudge}
            onPress={() => router.push('/create-workout' as any)}
            activeOpacity={0.8}
          >
            <LinearGradient colors={[Colors.primary + '18', Colors.primary + '06']} style={StyleSheet.absoluteFill} />
            <Zap size={24} color={Colors.primary} />
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={s.emptyNudgeTitle}>Start Your Journey</Text>
              <Text style={s.emptyNudgeDesc}>Log your first workout to unlock analytics and streaks.</Text>
            </View>
            <ChevronRight size={20} color={Colors.primary} />
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },

  /* ── Hero ── */
  heroWrap: { overflow: 'hidden', position: 'relative' },
  heroInner: { paddingBottom: 32, paddingHorizontal: PAD },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  heroGreeting: {
    color: Colors.textSecondary, fontSize: 13, fontWeight: '700',
    marginBottom: 6, letterSpacing: 0.3,
  },
  heroName: {
    color: Colors.text, fontSize: 34, fontWeight: '900',
    letterSpacing: -1.4, lineHeight: 38,
  },
  heroSub: {
    color: Colors.textSecondary, fontSize: 14, fontWeight: '500',
    marginTop: 10, letterSpacing: 0.1, lineHeight: 20,
  },
  heroAvatar: { marginTop: 2 },
  heroAvatarGrad: {
    width: 58, height: 58, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 16, elevation: 12,
    borderWidth: 1.5, borderColor: Colors.primary + '35',
  },

  /* ── Body ── */
  body: { paddingHorizontal: PAD, paddingTop: 24 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 },
  sectionTitle: {
    color: Colors.text, fontSize: 15, fontWeight: '900',
    letterSpacing: 0.2, textTransform: 'uppercase',
  },
  sectionLine: { flex: 1, height: 1, backgroundColor: '#1C1C1C' },
  seeAll: { color: Colors.primary, fontSize: 12, fontWeight: '800', letterSpacing: 0.3 },

  /* ── Metrics ── */
  metricsRow: { flexDirection: 'row', gap: GAP, marginBottom: SPACING.xl },

  /* ── Full-width Log Workout card ── */
  fullCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#141414', borderRadius: 24, padding: SPACING.lg,
    borderWidth: 1.5, borderColor: Colors.primary + '35',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.28, shadowRadius: 24, elevation: 14,
    overflow: 'hidden', gap: SPACING.md,
  },
  fullCardIcon: {
    width: 70, height: 70, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 6,
  },
  fullCardBody: { flex: 1 },
  fullCardTitle: {
    color: Colors.text, fontSize: 22, fontWeight: '900',
    letterSpacing: -0.7, lineHeight: 26,
  },
  fullCardDesc: {
    color: Colors.textSecondary, fontSize: 13, fontWeight: '500',
    marginTop: 5, lineHeight: 18,
  },
  fullCardChevron: {
    width: 44, height: 44, borderRadius: 15,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5, shadowRadius: 14, elevation: 8,
  },

  /* ── 2-col Grid ── */
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP, marginBottom: SPACING.xl },
  gridItem: { width: HALF },
  gridCard: {
    borderRadius: 24, padding: SPACING.md, minHeight: 162,
    backgroundColor: '#141414', borderWidth: 1.5, borderColor: '#1E1E1E',
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4, shadowRadius: 18, elevation: 12,
    overflow: 'hidden', justifyContent: 'space-between',
  },
  gridCardIcon: {
    width: 54, height: 54, borderRadius: 17,
    justifyContent: 'center', alignItems: 'center', marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2, shadowRadius: 6, elevation: 4,
  },
  gridCardTitle: {
    color: Colors.text, fontSize: 15, fontWeight: '900',
    letterSpacing: -0.4, lineHeight: 20,
  },
  gridCardDesc: {
    color: Colors.textSecondary, fontSize: 11, fontWeight: '500',
    marginTop: 5, lineHeight: 17,
  },
  gridCardArrow: {
    width: 32, height: 32, borderRadius: 11,
    justifyContent: 'center', alignItems: 'center',
    marginTop: 14, alignSelf: 'flex-end',
  },

  /* ── Quote Banner ── */
  quoteBanner: {
    borderRadius: 28, padding: 24, flexDirection: 'row',
    alignItems: 'flex-start', gap: 18,
    borderWidth: 1.5, borderColor: Colors.primary + '28', overflow: 'hidden',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12, shadowRadius: 18, elevation: 8, marginBottom: 4,
  },
  quoteIconWrap: {
    width: 50, height: 50, borderRadius: 16,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: Colors.primary + '30',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 10, elevation: 5,
  },
  quoteText: {
    color: Colors.text, fontSize: 14, fontWeight: '700',
    lineHeight: 23, fontStyle: 'italic', letterSpacing: 0.1,
  },
  quoteAuthor: {
    color: Colors.textSecondary, fontSize: 13, fontWeight: '700',
    marginTop: 12, letterSpacing: 0.5, textTransform: 'uppercase',
  },

  /* ── Recent Activity ── */
  recentCard: {
    backgroundColor: '#141414', borderRadius: 24, padding: 18,
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderWidth: 1.5, borderColor: '#1E1E1E', overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4, shadowRadius: 16, elevation: 12,
  },
  recentAccentBar: {
    position: 'absolute', left: 0, top: 0, bottom: 0,
    width: 4, borderRadius: 4,
  },
  recentIconWrap: {
    width: 50, height: 50, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
  },
  recentBody: { flex: 1 },
  recentExercise: {
    color: Colors.text, fontSize: 17, fontWeight: '900', letterSpacing: -0.4,
  },
  recentMeta: { flexDirection: 'row', gap: 6, marginTop: 8, flexWrap: 'wrap' },
  recentChip: {
    backgroundColor: '#222', borderRadius: 9, paddingHorizontal: 9,
    paddingVertical: 4, color: Colors.textSecondary, fontSize: 11, fontWeight: '700',
    borderWidth: 1, borderColor: '#2A2A2A',
  },
  recentRight: { alignItems: 'flex-end', gap: 8 },
  recentDate: { color: Colors.textSecondary, fontSize: 11, fontWeight: '700', letterSpacing: 0.2 },

  /* ── Empty State Nudge ── */
  emptyNudge: {
    borderRadius: 24, padding: 22, flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: Colors.primary + '40', overflow: 'hidden',
    marginTop: 24,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12, shadowRadius: 14, elevation: 6,
  },
  emptyNudgeTitle: {
    color: Colors.text, fontSize: 17, fontWeight: '900',
    marginLeft: 16, letterSpacing: -0.3,
  },
  emptyNudgeDesc: {
    color: Colors.textSecondary, fontSize: 12, fontWeight: '500',
    marginTop: 4, marginLeft: 16, lineHeight: 18,
  },

  /* ── Premium ── */
  premiumCard: {
    marginBottom: 28,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: Colors.primary + '40',
    backgroundColor: '#161616',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  premiumCardGrad: { padding: 20 },
  premiumCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  premiumIconBox: { width: 48, height: 48, borderRadius: 16, backgroundColor: Colors.primary + '18', justifyContent: 'center', alignItems: 'center' },
  premiumTag: { backgroundColor: Colors.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  premiumTagText: { color: '#000', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  premiumCardTitle: { color: Colors.text, fontSize: 20, fontWeight: '900', marginBottom: 8, letterSpacing: -0.5 },
  premiumCardDesc: { color: Colors.textSecondary, fontSize: 14, lineHeight: 22, fontWeight: '500', marginBottom: 16 },
  premiumFooter: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  premiumFooterText: { color: Colors.primary, fontSize: 14, fontWeight: '700' },
  badgePos: { position: 'absolute', top: 12, right: 12 },

  /* ── Admin ── */
  adminCard: {
    marginBottom: 28,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#FF3B3040',
    backgroundColor: '#161616',
  },
  adminCardGrad: { padding: 20 },
  adminCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  adminIconBox: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#FF3B3018', justifyContent: 'center', alignItems: 'center' },
  adminTag: { backgroundColor: '#FF3B30', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  adminTagText: { color: '#FFF', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  adminCardTitle: { color: Colors.text, fontSize: 20, fontWeight: '900', marginBottom: 8, letterSpacing: -0.5 },
  adminCardDesc: { color: Colors.textSecondary, fontSize: 14, lineHeight: 22, fontWeight: '500', marginBottom: 16 },
  adminFooter: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  adminFooterText: { color: '#FF3B30', fontSize: 14, fontWeight: '700' },

  /* ── Daily Plan ── */
  dailyPlanCard: {
    marginBottom: 24,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
  },
  dailyPlanGrad: {
    padding: 24,
  },
  dailyPlanContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dailyPlanTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    alignSelf: 'flex-start',
    gap: 6,
    marginBottom: 12,
  },
  dailyPlanTagText: {
    color: '#000',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  dailyPlanTitle: {
    color: '#000',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.6,
  },
  dailyPlanSub: {
    color: 'rgba(0,0,0,0.6)',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  dailyPlanArrow: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressHighlight: {
    marginBottom: 24,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: Colors.primary + '25',
    backgroundColor: '#161616',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  progressHighlightGrad: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  progressHighlightLeft: {},
  progressIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressHighlightTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  progressHighlightSub: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  progressTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 2,
  },
  progressTrendText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  heroNotif: {
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF3B30',
    borderWidth: 2,
    borderColor: Colors.background,
  },
});
