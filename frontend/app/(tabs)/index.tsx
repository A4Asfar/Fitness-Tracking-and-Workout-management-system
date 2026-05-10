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
  Brain, ArrowUpRight, Scale, Target
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

/* ─── Activity Ring ─── */
function ActivityRing({ icon: Icon, value, label, color, progress }: any) {
  return (
    <View style={s.ringContainer}>
      <View style={[s.ringOuter, { borderColor: color + '20' }]}>
        <View style={[s.ringFill, { borderColor: color, transform: [{ rotate: '-90deg' }] }]} />
        <View style={s.ringIconInner}>
          <Icon size={20} color={color} />
        </View>
      </View>
      <Text style={s.ringValue}>{value}</Text>
      <Text style={s.ringLabel}>{label}</Text>
    </View>
  );
}

/* ─── Quick Stat Card ─── */
function QuickStat({ label, value, accent }: any) {
  return (
    <View style={s.statBox}>
      <Text style={s.statValueLarge}>{value}</Text>
      <Text style={s.statLabelSmall}>{label}</Text>
      <View style={[s.statAccent, { backgroundColor: accent }]} />
    </View>
  );
}

/* ─── Activity Item ─── */
function ActivityItem({ title, time, calories, duration, color }: any) {
  return (
    <View style={s.activityRow}>
      <View style={s.activityInfo}>
        <Text style={s.activityTitleText}>{title}</Text>
        <Text style={s.activityTimeText}>{time}</Text>
        <View style={s.activityStats}>
           <Flame size={12} color={Colors.textSecondary} />
           <Text style={s.activityStatText}>{calories} cal</Text>
           <Zap size={12} color={Colors.textSecondary} style={{ marginLeft: 8 }} />
           <Text style={s.activityStatText}>{duration}</Text>
        </View>
      </View>
      <View style={[s.activityDot, { backgroundColor: color }]} />
    </View>
  );
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
      {/* ── Hero Header ── */}
      <View style={[s.hero, { paddingTop: insets.top + 24 }]}>
        <Text style={s.heroGreeting}>Good Morning 👋</Text>
        <Text style={s.heroName}>{user?.name || 'Athlete'}</Text>
      </View>

      <View style={s.body}>
        {/* ── Daily Activity Hub ── */}
        <View style={s.activityHub}>
          <Text style={s.hubTitle}>Daily Activity</Text>
          <View style={s.ringsRow}>
            <ActivityRing 
              icon={Target} value="8,547" label="Steps" 
              color={Colors.primary} progress={0.7} 
            />
            <ActivityRing 
              icon={Flame} value="1,842" label="Calories" 
              color="#FF4B4B" progress={0.6} 
            />
            <ActivityRing 
              icon={Zap} value="45" label="Active Min" 
              color="#A855F7" progress={0.8} 
            />
          </View>
        </View>

        {/* ── Quick Stats Row ── */}
        <View style={s.quickStats}>
           <QuickStat label="Streak" value={stats?.streak?.toString() ?? '0'} accent={Colors.primary} />
           <QuickStat label="Workouts" value={stats?.totalWorkouts?.toString() ?? '0'} accent="#00D1FF" />
           <QuickStat label="Achievements" value="24" accent="#FFD700" />
        </View>

        {/* ── AI Insight Card ── */}
        <TouchableOpacity style={s.aiCard} activeOpacity={0.9}>
          <LinearGradient 
            colors={[Colors.primary + '25', Colors.primary + '05']} 
            style={s.aiGrad}
          >
            <View style={s.aiHeader}>
               <View style={s.aiIconWrap}>
                  <Brain size={24} color={Colors.primary} />
               </View>
               <View>
                 <View style={s.aiBadgeRow}>
                   <Text style={s.aiTitle}>AI Insight</Text>
                   <View style={s.newBadge}><Text style={s.newBadgeText}>NEW</Text></View>
                 </View>
                  <Text style={s.aiDesc}>You&apos;re 85% more active on weekdays. Consider adding a weekend workout.</Text>
               </View>
            </View>
            <Text style={s.aiLink}>View Recommendations →</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* ── Recent Activities ── */}
        <View style={s.sectionHeader}>
           <Text style={s.sectionTitleLarge}>Recent Activities</Text>
           <TouchableOpacity onPress={() => router.push('/(tabs)/workouts' as any)}>
             <Text style={s.viewAll}>View All</Text>
           </TouchableOpacity>
        </View>

        <View style={s.recentList}>
           <ActivityItem 
             title="Morning HIIT" time="2h ago" 
             calories="320" duration="30 min" color="#FF4B4B" 
           />
           <ActivityItem 
             title="Upper Body" time="1d ago" 
             calories="280" duration="45 min" color="#00D1FF" 
           />
        </View>
      </View>

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
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  hero: { paddingHorizontal: 24, paddingBottom: 16 },
  heroGreeting: { color: Colors.textSecondary, fontSize: 13, fontWeight: '700', marginBottom: 4 },
  heroName: { color: '#FFF', fontSize: 32, fontWeight: '900', letterSpacing: -1 },
  body: { paddingHorizontal: 24 },

  /* Hub */
  activityHub: { 
    backgroundColor: '#111118', borderRadius: 32, padding: 24,
    borderWidth: 1.5, borderColor: '#1A1A24', marginBottom: 20,
  },
  hubTitle: { color: '#FFF', fontSize: 18, fontWeight: '800', marginBottom: 24 },
  ringsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ringContainer: { alignItems: 'center' },
  ringOuter: { 
    width: 68, height: 68, borderRadius: 34, borderWidth: 4,
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  ringFill: {
    position: 'absolute', width: 68, height: 68, borderRadius: 34,
    borderWidth: 4, borderTopColor: 'transparent', borderLeftColor: 'transparent',
  },
  ringIconInner: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  ringValue: { color: '#FFF', fontSize: 15, fontWeight: '900' },
  ringLabel: { color: Colors.textSecondary, fontSize: 10, fontWeight: '700', marginTop: 2 },

  /* Quick Stats */
  quickStats: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statBox: { 
    flex: 1, height: 80, backgroundColor: '#111118', borderRadius: 20,
    padding: 16, justifyContent: 'center', overflow: 'hidden',
    borderWidth: 1.5, borderColor: '#1A1A24',
  },
  statValueLarge: { color: '#FFF', fontSize: 20, fontWeight: '900' },
  statLabelSmall: { color: Colors.textSecondary, fontSize: 11, fontWeight: '600', marginTop: 2 },
  statAccent: { position: 'absolute', right: -4, top: 20, bottom: 20, width: 8, borderRadius: 4 },

  /* AI Card */
  aiCard: { marginBottom: 32, borderRadius: 28, overflow: 'hidden' },
  aiGrad: { padding: 24 },
  aiHeader: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  aiIconWrap: { 
    width: 48, height: 48, borderRadius: 16, backgroundColor: Colors.primary + '20',
    justifyContent: 'center', alignItems: 'center',
  },
  aiBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  aiTitle: { color: '#FFF', fontSize: 17, fontWeight: '800' },
  newBadge: { backgroundColor: Colors.primary, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  newBadgeText: { color: '#000', fontSize: 9, fontWeight: '900' },
  aiDesc: { color: Colors.textSecondary, fontSize: 13, lineHeight: 20, fontWeight: '500' },
  aiLink: { color: Colors.primary, fontSize: 14, fontWeight: '800' },

  /* Activities */
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sectionTitleLarge: { color: '#FFF', fontSize: 20, fontWeight: '900' },
  viewAll: { color: Colors.primary, fontSize: 14, fontWeight: '700' },
  recentList: { gap: 12 },
  activityRow: { 
    backgroundColor: '#111118', borderRadius: 24, padding: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1.5, borderColor: '#1A1A24',
  },
  activityInfo: { flex: 1 },
  activityTitleText: { color: '#FFF', fontSize: 16, fontWeight: '800', marginBottom: 4 },
  activityTimeText: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 12 },
  activityStats: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  activityStatText: { color: Colors.textSecondary, fontSize: 12, fontWeight: '700' },
  activityDot: { width: 8, height: 8, borderRadius: 4 },

  emptyNudge: {
    borderRadius: 24, padding: 22, flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: Colors.primary + '40', overflow: 'hidden',
    marginTop: 24,
  },
  emptyNudgeTitle: {
    color: Colors.text, fontSize: 17, fontWeight: '900',
    marginLeft: 16,
  },
  emptyNudgeDesc: {
    color: Colors.textSecondary, fontSize: 12, fontWeight: '500',
    marginTop: 4, marginLeft: 16, lineHeight: 18,
  },
});
