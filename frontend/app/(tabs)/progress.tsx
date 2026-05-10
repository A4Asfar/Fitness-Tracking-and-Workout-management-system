import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator, ScrollView,
  RefreshControl, Dimensions, Animated,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { Colors, SPACING } from '@/constants/Theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  TrendingUp, Activity, Trophy, Calendar, Zap,
  Dumbbell, ArrowUpRight, ArrowDownRight, Flame, Weight, Sparkles,
} from 'lucide-react-native';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const PAD = SPACING.lg;
const GAP = SPACING.md;
const CARD_W = (width - PAD * 2 - GAP) / 2;
const MAX_BAR_H = 110;

/* ─── Animated Counter ─── */
function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const anim = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState('0');
  useEffect(() => {
    Animated.timing(anim, { toValue: target, duration: 900, delay: 200, useNativeDriver: false }).start();
    const id = anim.addListener(({ value }) => setDisplay(Math.floor(value).toString()));
    return () => anim.removeListener(id);
  }, [target]);
  return <Text style={styles.statValue}>{display}{suffix}</Text>;
}

/* ─── Animated Bar ─── */
function Bar({ h, isActive, isToday, delay }: { h: number; isActive: boolean; isToday: boolean; delay: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(anim, { toValue: h, delay, useNativeDriver: false, bounciness: 4 }).start();
  }, [h]);
  return (
    <Animated.View style={{ height: anim, width: 18, borderRadius: 9, overflow: 'hidden' }}>
      {isToday ? (
        <LinearGradient colors={[Colors.primary, Colors.secondary]} style={{ flex: 1, borderRadius: 9 }} />
      ) : (
        <View style={{ flex: 1, borderRadius: 9, backgroundColor: isActive ? '#2E4010' : '#222' }} />
      )}
    </Animated.View>
  );
}

/* ─── Stat Card ─── */
function StatCard({ icon: Icon, rawValue, label, accent, suffix = '', delay }: {
  icon: any; rawValue: number; label: string; accent: string; suffix?: string; delay: number;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(16)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 450, delay, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 450, delay, useNativeDriver: true }),
    ]).start();
  }, []);
  return (
    <Animated.View style={[styles.statCard, { opacity, transform: [{ translateY: slide }] }]}>
      <View style={[styles.iconBox, { backgroundColor: accent + '1A' }]}>
        <Icon size={20} color={accent} strokeWidth={2} />
      </View>
      <Counter target={rawValue} suffix={suffix} />
      <Text style={styles.statLabel}>{label}</Text>
      <View style={[styles.statAccentLine, { backgroundColor: accent }]} />
    </Animated.View>
  );
}

/* ─── Weekly Pill ─── */
function WeekPill({ icon: Icon, value, label, accent }: { icon: any; value: string; label: string; accent: string }) {
  return (
    <View style={styles.weekPill}>
      <LinearGradient colors={[accent + '22', accent + '08']} style={styles.weekPillGrad}>
        <View style={[styles.weekPillIcon, { backgroundColor: accent + '22' }]}>
          <Icon size={18} color={accent} strokeWidth={2} />
        </View>
        <Text style={[styles.weekPillValue, { color: accent }]}>{value}</Text>
        <Text style={styles.weekPillLabel}>{label}</Text>
      </LinearGradient>
    </View>
  );
}

export default function ProgressAnalyticsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<any>(null);
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const heroSlide = useRef(new Animated.Value(-24)).current;
  const heroOpacity = useRef(new Animated.Value(0)).current;

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/workouts/analytics');
      setData(res.data);
    } catch (e: any) {
      console.log('Analytics error:', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    Animated.parallel([
      Animated.timing(heroSlide, { toValue: 0, duration: 600, useNativeDriver: true }),
      Animated.timing(heroOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const onRefresh = () => { setRefreshing(true); fetchAnalytics(); };

  const fmt = (v: number) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toString();
  const fmtDate = (s: string) => {
    if (!s) return 'Never';
    const d = new Date(s), now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (diff === 0) return 'Today'; if (diff === 1) return 'Yesterday';
    if (diff < 7) return `${diff}d ago`;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };
  const dayLabel = (s: string) => ['Su','Mo','Tu','We','Th','Fr','Sa'][new Date(s).getDay()];

  if (loading && !refreshing) {
    return (
      <View style={styles.loader}>
        <LinearGradient colors={[Colors.primary + '30', 'transparent']} style={styles.loaderGlow} />
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loaderText}>Crunching your stats…</Text>
      </View>
    );
  }

  const hasData = data?.totalWorkouts > 0;
  const isPos = (data?.comparison?.difference ?? 0) >= 0;
  const pct = Math.abs(data?.comparison?.percentage ?? 0).toFixed(0);
  const chartData: any[] = data?.chartData ?? [];
  const maxVol = Math.max(...chartData.map((d: any) => d.volume), 1);

  const thisVol = data?.weeklyStats?.volume ?? 0;
  const lastVol = data?.lastWeekStats?.volume ?? 0;
  const maxCompare = Math.max(thisVol, lastVol, 1);

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{ paddingBottom: 64 }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
    >
      <Stack.Screen options={{ headerShown: false }} />

      {/* ── Hero ── */}
      <View style={styles.heroWrap}>
        <LinearGradient colors={[Colors.primary + '28', Colors.primary + '08', 'transparent']} style={styles.heroGrad} />
        <Animated.View style={{ opacity: heroOpacity, transform: [{ translateY: heroSlide }], paddingHorizontal: PAD, paddingTop: insets.top + SPACING.md, paddingBottom: 36 }}>
          <View style={styles.heroBadge}>
            <TrendingUp size={12} color={Colors.primary} strokeWidth={2.5} />
            <Text style={styles.heroBadgeText}>ANALYTICS DASHBOARD</Text>
          </View>
          <Text style={styles.heroTitle}>Your Progress</Text>
          <Text style={styles.heroSub}>Track how far you've come, {user?.name?.split(' ')[0] || 'Athlete'}</Text>
        </Animated.View>
      </View>

      <View style={styles.body}>

        {/* ── All-Time Stats ── */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>All-Time Stats</Text>
          <View style={styles.sectionLine} />
        </View>

        <View style={styles.statsGrid}>
          <StatCard icon={Dumbbell} rawValue={data?.totalWorkouts ?? 0} label="Workouts" accent={Colors.primary} delay={0} />
          <StatCard icon={Zap} rawValue={data?.totalSets ?? 0} label="Total Sets" accent="#FFD700" delay={80} />
          <StatCard icon={Weight} rawValue={Math.round((data?.totalWeight ?? 0) / 1000)} label="Volume (t)" accent="#00D1FF" suffix="t" delay={160} />
          <StatCard icon={Trophy} rawValue={data?.streak ?? 0} label="Day Streak" accent="#FF6B3B" delay={240} />
        </View>

        {!hasData ? (
          /* ── Empty State ── */
          <View style={styles.emptyCard}>
            <LinearGradient colors={['#1E1E1E', '#161616']} style={styles.emptyInner}>
              <View style={styles.emptyIconRing}>
                <Activity size={40} color={Colors.textSecondary} strokeWidth={1.5} />
              </View>
              <Text style={styles.emptyTitle}>No Workouts Yet</Text>
              <Text style={styles.emptyText}>Log your first session to unlock charts and insights.</Text>
            </LinearGradient>
          </View>
        ) : (
          <>
            {/* ── Bar Chart ── */}
            <View style={styles.chartCard}>
              {/* Subtle horizontal grid lines */}
              {[0.25, 0.5, 0.75, 1].map(f => (
                <View key={f} style={[styles.gridLine, { bottom: f * MAX_BAR_H + 36 }]} />
              ))}

              <View style={styles.chartTopRow}>
                <View>
                  <Text style={styles.cardTitle}>Volume Chart</Text>
                  <Text style={styles.cardSub}>Last 7 days · kg lifted</Text>
                </View>
                <View style={[styles.trendBadge, { backgroundColor: isPos ? '#4CAF5018' : '#F4433618', borderColor: isPos ? '#4CAF5030' : '#F4433630' }]}>
                  {isPos ? <ArrowUpRight size={13} color="#4CAF50" /> : <ArrowDownRight size={13} color="#F44336" />}
                  <Text style={[styles.trendText, { color: isPos ? '#4CAF50' : '#F44336' }]}>{pct}%</Text>
                </View>
              </View>

              <View style={styles.chartBars}>
                {chartData.map((day: any, i: number) => {
                  const h = Math.max((day.volume / maxVol) * MAX_BAR_H, day.volume > 0 ? 8 : 3);
                  const isToday = i === chartData.length - 1;
                  return (
                    <View key={i} style={styles.barCol}>
                      <Bar h={h} isActive={day.volume > 0} isToday={isToday} delay={i * 55} />
                      {isToday && <View style={styles.barDot} />}
                      <Text style={[styles.barLabel, isToday && { color: Colors.primary, fontWeight: '700' }]}>
                        {dayLabel(day.date)}
                      </Text>
                    </View>
                  );
                })}
              </View>

              <View style={styles.chartFooter}>
                <Text style={styles.chartMeta}>Peak: {fmt(maxVol)} kg</Text>
                <Text style={styles.chartMeta}>Week total: {fmt(thisVol)} kg</Text>
              </View>
            </View>

            {/* ── This Week Pills ── */}
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>This Week</Text>
              <View style={styles.sectionLine} />
            </View>
            <View style={styles.weekRow}>
              <WeekPill icon={Dumbbell} value={String(data?.weeklyStats?.count ?? 0)} label="Sessions" accent={Colors.primary} />
              <WeekPill icon={TrendingUp} value={fmt(thisVol)} label="Volume kg" accent="#00D1FF" />
              <WeekPill icon={Flame} value={String(data?.streak ?? 0)} label="Streak" accent="#FF6B3B" />
            </View>

            {/* ── Week vs Last Week ── */}
            <View style={styles.compareCard}>
              <View style={styles.chartTopRow}>
                <Text style={styles.cardTitle}>Week Comparison</Text>
                <View style={[styles.trendBadge, { backgroundColor: isPos ? '#4CAF5018' : '#F4433618', borderColor: isPos ? '#4CAF5030' : '#F4433630' }]}>
                  {isPos ? <ArrowUpRight size={13} color="#4CAF50" /> : <ArrowDownRight size={13} color="#F44336" />}
                  <Text style={[styles.trendText, { color: isPos ? '#4CAF50' : '#F44336' }]}>{pct}%</Text>
                </View>
              </View>

              {/* This week bar */}
              <View style={styles.compareBlock}>
                <View style={styles.compareTopRow}>
                  <Text style={styles.compareLabel}>This Week</Text>
                  <Text style={[styles.compareKg, { color: Colors.primary }]}>{fmt(thisVol)} kg</Text>
                </View>
                <View style={styles.compareTrack}>
                  <LinearGradient
                    colors={[Colors.primary, Colors.secondary]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={[styles.compareFill, { width: `${(thisVol / maxCompare) * 100}%` }]}
                  />
                </View>
              </View>

              {/* Last week bar */}
              <View style={[styles.compareBlock, { marginBottom: 0 }]}>
                <View style={styles.compareTopRow}>
                  <Text style={styles.compareLabel}>Last Week</Text>
                  <Text style={styles.compareKg}>{fmt(lastVol)} kg</Text>
                </View>
                <View style={styles.compareTrack}>
                  <View style={[styles.compareFill, { width: `${(lastVol / maxCompare) * 100}%`, backgroundColor: '#3A3A3A' }]} />
                </View>
              </View>
            </View>

            {/* ── Coach Insight ── */}
            <LinearGradient
              colors={[Colors.primary + '25', Colors.primary + '06']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.insightCard}
            >
              <View style={styles.insightLeft}>
                <LinearGradient colors={[Colors.primary + '40', Colors.primary + '15']} style={styles.insightIconWrap}>
                  <Sparkles size={24} color={Colors.primary} strokeWidth={1.8} />
                </LinearGradient>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.insightBadge}>AI COACH INSIGHT</Text>
                <Text style={styles.insightText}>{data?.insight ?? 'Keep pushing your limits 💪'}</Text>
              </View>
            </LinearGradient>

            {/* ── Last Session + Streak ── */}
            <View style={styles.detailRow}>
              <View style={[styles.detailCard, { marginRight: GAP / 2 }]}>
                <LinearGradient colors={['#00D1FF18', 'transparent']} style={styles.detailGrad}>
                  <View style={[styles.iconBox, { backgroundColor: '#00D1FF1A' }]}>
                    <Calendar size={20} color="#00D1FF" strokeWidth={2} />
                  </View>
                  <Text style={styles.detailValue}>{fmtDate(data?.lastWorkoutDate)}</Text>
                  <Text style={styles.detailLabel}>Last Session</Text>
                </LinearGradient>
              </View>
              <View style={[styles.detailCard, { marginLeft: GAP / 2 }]}>
                <LinearGradient colors={[Colors.primary + '18', 'transparent']} style={styles.detailGrad}>
                  <View style={[styles.iconBox, { backgroundColor: Colors.primary + '1A' }]}>
                    <Trophy size={20} color={Colors.primary} strokeWidth={2} />
                  </View>
                  <Text style={styles.detailValue}>{data?.streak ?? 0} days</Text>
                  <Text style={styles.detailLabel}>Active Streak</Text>
                </LinearGradient>
              </View>
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },

  loader: { flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' },
  loaderGlow: { position: 'absolute', top: 0, left: 0, right: 0, height: 300 },
  loaderText: { color: Colors.textSecondary, fontSize: 14, fontWeight: '500', marginTop: 16 },

  /* Hero */
  heroWrap: { position: 'relative', overflow: 'hidden' },
  heroGrad: { ...StyleSheet.absoluteFillObject },
  heroBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.primary + '18', alignSelf: 'flex-start',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
    borderWidth: 1, borderColor: Colors.primary + '30', marginBottom: 14,
  },
  heroBadgeText: { color: Colors.primary, fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  heroTitle: { color: Colors.text, fontSize: 36, fontWeight: '900', letterSpacing: -1.2, lineHeight: 40 },
  heroSub: { color: Colors.textSecondary, fontSize: 15, fontWeight: '500', marginTop: 8 },

  /* Body */
  body: { paddingHorizontal: PAD, paddingTop: 24 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 12 },
  sectionTitle: { color: Colors.text, fontSize: 17, fontWeight: '800', letterSpacing: -0.2 },
  sectionLine: { flex: 1, height: 1, backgroundColor: '#222' },

  /* Stat Cards */
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP, marginBottom: SPACING.xl },
  statCard: {
    width: CARD_W, backgroundColor: '#181818', borderRadius: 24,
    padding: SPACING.md, overflow: 'hidden', position: 'relative',
    borderWidth: 1, borderColor: '#252525',
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 8,
  },
  iconBox: { width: 42, height: 42, borderRadius: 13, justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  statValue: { color: Colors.text, fontSize: 26, fontWeight: '900', letterSpacing: -0.8 },
  statLabel: { color: Colors.textSecondary, fontSize: 11, fontWeight: '700', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  statAccentLine: { position: 'absolute', bottom: 0, left: 18, right: 18, height: 2, borderRadius: 1, opacity: 0.5 },

  /* Empty */
  emptyCard: { borderRadius: 28, overflow: 'hidden', marginTop: 4, borderWidth: 1, borderColor: '#252525' },
  emptyInner: { padding: 48, alignItems: 'center' },
  emptyIconRing: {
    width: 80, height: 80, borderRadius: 24, backgroundColor: '#252525',
    justifyContent: 'center', alignItems: 'center', marginBottom: 20,
  },
  emptyTitle: { color: Colors.text, fontSize: 20, fontWeight: '800', marginBottom: 10 },
  emptyText: { color: Colors.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 21, maxWidth: 220 },

  /* Chart Card */
  chartCard: {
    backgroundColor: '#181818', borderRadius: 24, padding: SPACING.lg, marginBottom: SPACING.xl,
    borderWidth: 1, borderColor: '#252525', position: 'relative', overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 14, elevation: 10,
  },
  gridLine: { position: 'absolute', left: 22, right: 22, height: 1, backgroundColor: '#222' },
  chartTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  cardTitle: { color: Colors.text, fontSize: 17, fontWeight: '800' },
  cardSub: { color: Colors.textSecondary, fontSize: 12, marginTop: 3 },
  trendBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, borderWidth: 1,
  },
  trendText: { fontSize: 13, fontWeight: '900' },
  chartBars: { flexDirection: 'row', alignItems: 'flex-end', height: MAX_BAR_H + 24, paddingBottom: 8 },
  barCol: { flex: 1, alignItems: 'center' },
  barDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.primary, marginTop: 4, marginBottom: -4 },
  barLabel: { color: Colors.textSecondary, fontSize: 10, fontWeight: '600', marginTop: 8 },
  chartFooter: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 14, marginTop: 6, borderTopWidth: 1, borderTopColor: '#232323' },
  chartMeta: { color: Colors.textSecondary, fontSize: 11, fontWeight: '600' },

  /* Week Pills */
  weekRow: { flexDirection: 'row', gap: GAP, marginBottom: 28 },
  weekPill: { flex: 1, borderRadius: 22, overflow: 'hidden', borderWidth: 1, borderColor: '#252525' },
  weekPillGrad: { padding: 14, alignItems: 'center' },
  weekPillIcon: { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  weekPillValue: { fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
  weekPillLabel: { color: Colors.textSecondary, fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 3 },

  /* Compare */
  compareCard: {
    backgroundColor: '#181818', borderRadius: 24, padding: SPACING.lg, marginBottom: SPACING.lg,
    borderWidth: 1, borderColor: '#252525',
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6,
  },
  compareBlock: { marginBottom: 18 },
  compareTopRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  compareLabel: { color: Colors.textSecondary, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  compareKg: { color: Colors.text, fontSize: 13, fontWeight: '800' },
  compareTrack: { height: 10, backgroundColor: '#252525', borderRadius: 5, overflow: 'hidden' },
  compareFill: { height: 10, borderRadius: 5 },

  /* Insight */
  insightCard: {
    borderRadius: 24, padding: SPACING.md, flexDirection: 'row', alignItems: 'center',
    gap: 16, marginBottom: SPACING.lg, borderWidth: 1, borderColor: Colors.primary + '25',
  },
  insightLeft: {},
  insightIconWrap: { width: 54, height: 54, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  insightBadge: { color: Colors.primary, fontSize: 9, fontWeight: '900', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 },
  insightText: { color: Colors.text, fontSize: 14, fontWeight: '700', lineHeight: 21 },

  /* Detail Row */
  detailRow: { flexDirection: 'row', marginBottom: 8 },
  detailCard: {
    flex: 1, backgroundColor: '#181818', borderRadius: 22, overflow: 'hidden',
    borderWidth: 1, borderColor: '#252525',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 5,
  },
  detailGrad: { padding: 18 },
  detailValue: { color: Colors.text, fontSize: 18, fontWeight: '900', marginBottom: 4 },
  detailLabel: { color: Colors.textSecondary, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
});
