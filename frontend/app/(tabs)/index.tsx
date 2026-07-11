import React, { useState, useEffect, useRef } from 'react';
import {
  View, StyleSheet, ScrollView, RefreshControl, Text, TouchableOpacity,
  Animated, Dimensions, ImageBackground, Image
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Plus, History as HistoryIcon, Users, Settings, Bell,
  HeartPulse, Scale, Target, Flame, Droplet, Play, ChevronRight, Activity, Calendar, Zap, CheckCircle2, Dumbbell
} from 'lucide-react-native';
import { useRouter, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Storage from '@/utils/storage';
import PremiumOnboardingModal from '@/components/dashboard/PremiumOnboardingModal';
import FloatingChatButton from '@/components/dashboard/FloatingChatButton';

const { width } = Dimensions.get('window');

// Premium Skeleton Loader
const SkeletonBlock = ({ width, height, style, borderRadius = 16 }: any) => {
  const anim = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.3, duration: 800, useNativeDriver: true })
      ])
    ).start();
  }, []);
  return (
    <Animated.View style={[{ width, height, backgroundColor: '#1E293B', borderRadius, opacity: anim }, style]} />
  );
};

export default function HomeDashboard() {
  const { user, isNewUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [stats, setStats] = useState<any>(null);
  const [recent, setRecent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Premium UI Local States for Demo
  const [waterGlasses, setWaterGlasses] = useState(4);
  const totalWaterGoal = 8;
  const quote = "Discipline is doing what you hate to do, but doing it like you love it.";

  const fillAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const checkOnboarding = async () => {
      if (user) {
        const flag = await Storage.getItem(`hasSeenOnboarding_${user.id}`);
        if (!flag && isNewUser) {
          setShowOnboarding(true);
        }
      }
    };
    checkOnboarding();
  }, [user, isNewUser]);

  const fetchData = async () => {
    setError(null);
    try {
      const [analyticsRes, workoutsRes] = await Promise.all([
        api.get('/workouts/analytics'),
        api.get('/workouts'),
      ]);
      setStats(analyticsRes.data);
      setRecent(workoutsRes.data.slice(0, 3));

      // Trigger metric animations
      Animated.timing(fillAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: false,
      }).start();

    } catch (e: any) {
      if (__DEV__) console.log('Home fetch error:', e);
      setError(e.message || 'Failed to sync dashboard.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (user) fetchData();
    else setLoading(false);
  }, [user, authLoading]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  if (loading && !refreshing) {
    return (
      <View style={[s.container, { paddingTop: insets.top }]}>
        <View style={{ padding: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 }}>
            <View>
              <SkeletonBlock width={120} height={16} style={{ marginBottom: 8 }} />
              <SkeletonBlock width={180} height={28} />
            </View>
            <SkeletonBlock width={48} height={48} borderRadius={24} />
          </View>
          <SkeletonBlock width="100%" height={200} style={{ marginBottom: 24 }} borderRadius={32} />
          <View style={{ flexDirection: 'row', gap: 16, marginBottom: 24 }}>
            <SkeletonBlock width={(width - 64) / 2} height={140} borderRadius={24} />
            <SkeletonBlock width={(width - 64) / 2} height={140} borderRadius={24} />
          </View>
          <SkeletonBlock width="100%" height={100} borderRadius={24} />
        </View>
      </View>
    );
  }

  if (error && !refreshing) {
    return (
      <View style={s.errorContainer}>
        <Activity size={48} color="#EF4444" style={{ marginBottom: 16 }} />
        <Text style={s.errorTitle}>CONNECTION ERROR</Text>
        <Text style={s.errorText}>{error}</Text>
        <TouchableOpacity onPress={() => { setLoading(true); fetchData(); }} style={s.retryBtn}>
          <Text style={s.retryText}>RETRY SYNC</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const calBurned = stats?.todayCalories || stats?.weeklyStats?.[6]?.calories || 0;
  const calGoal = 600; 

  return (
    <View style={s.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#38BDF8" />}
      >
        {/* PREMIUM HERO HEADER */}
        <LinearGradient colors={['#1E293B', '#0F172A']} style={[s.heroSection, { paddingTop: insets.top + 16 }]}>
          <View style={s.headerRow}>
            <View>
              <Text style={s.greetingText}>{getGreeting()},</Text>
              <Text style={s.userName}>{user?.name?.split(' ')[0] || 'Athlete'}</Text>
            </View>
            <View style={s.headerIcons}>
              <TouchableOpacity style={s.iconBtn} onPress={() => router.push('/notifications' as any)}>
                <Bell size={22} color="#F8FAFC" />
                <View style={s.notificationDot} />
              </TouchableOpacity>
              <TouchableOpacity style={s.iconBtn} onPress={() => router.push('/settings' as any)}>
                <Image source={{ uri: user?.avatar || 'https://via.placeholder.com/150' }} style={s.avatarImg} />
              </TouchableOpacity>
            </View>
          </View>

          {/* MOTIVATIONAL QUOTE */}
          <View style={s.quoteBox}>
            <Zap size={16} color="#FDE047" fill="#FDE047" style={{ marginRight: 8 }} />
            <Text style={s.quoteText}>{quote}</Text>
          </View>

          {/* MAIN STATS OVERVIEW */}
          <View style={s.heroStatsRow}>
            <View style={s.heroStatItem}>
              <View style={[s.heroStatIconBox, { backgroundColor: 'rgba(239,68,68,0.15)' }]}>
                <Flame size={20} color="#EF4444" />
              </View>
              <Text style={s.heroStatValue}>{calBurned}</Text>
              <Text style={s.heroStatLabel}>Kcal Burned</Text>
            </View>
            
            <View style={s.heroStatDivider} />
            
            <View style={s.heroStatItem}>
              <View style={[s.heroStatIconBox, { backgroundColor: 'rgba(56,189,248,0.15)' }]}>
                <Activity size={20} color="#38BDF8" />
              </View>
              <Text style={s.heroStatValue}>{stats?.todaySteps || 0}</Text>
              <Text style={s.heroStatLabel}>Steps Today</Text>
            </View>

            <View style={s.heroStatDivider} />
            
            <View style={s.heroStatItem}>
              <View style={[s.heroStatIconBox, { backgroundColor: 'rgba(245,158,11,0.15)' }]}>
                <Target size={20} color="#F59E0B" />
              </View>
              <Text style={s.heroStatValue}>{stats?.streak || 0}</Text>
              <Text style={s.heroStatLabel}>Day Streak</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={s.mainContent}>
          {/* TODAY'S WORKOUT ACTION CARD */}
          <TouchableOpacity style={s.todaysWorkoutCard} activeOpacity={0.9} onPress={() => router.push('/create-workout')}>
            <ImageBackground source={{ uri: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80' }} style={s.workoutBg} imageStyle={{ borderRadius: 28 }}>
              <LinearGradient colors={['transparent', 'rgba(15,23,42,0.95)']} style={s.workoutGradient}>
                <View style={s.workoutTag}><Text style={s.workoutTagText}>TODAY'S PLAN</Text></View>
                <Text style={s.workoutTitle}>Full Body Power</Text>
                <View style={s.workoutMetaRow}>
                  <Text style={s.workoutMetaText}>45 Min</Text>
                  <Text style={s.workoutMetaDot}>•</Text>
                  <Text style={s.workoutMetaText}>Intermediate</Text>
                  <Text style={s.workoutMetaDot}>•</Text>
                  <Text style={s.workoutMetaText}>Strength</Text>
                </View>
                <View style={s.playBtn}>
                  <Play size={20} color="#0F172A" fill="#0F172A" style={{ marginLeft: 3 }} />
                  <Text style={s.playBtnText}>Start Workout</Text>
                </View>
              </LinearGradient>
            </ImageBackground>
          </TouchableOpacity>

          {/* DUAL METRICS GRID */}
          <View style={s.metricsGrid}>
            {/* WATER TRACKER */}
            <TouchableOpacity style={s.metricCard} onPress={() => setWaterGlasses(Math.min(waterGlasses + 1, 10))}>
              <View style={s.metricCardHeader}>
                <View style={[s.metricIconBox, { backgroundColor: 'rgba(56,189,248,0.15)' }]}><Droplet size={18} color="#38BDF8" /></View>
                <Text style={s.metricCardTitle}>Hydration</Text>
              </View>
              <Text style={s.metricMainValue}>{waterGlasses}<Text style={s.metricSubValue}> / {totalWaterGoal}</Text></Text>
              <View style={s.progressBarBg}>
                <Animated.View style={[s.progressBarFill, { backgroundColor: '#38BDF8', width: `${Math.min((waterGlasses / totalWaterGoal) * 100, 100)}%` }]} />
              </View>
              <Text style={s.metricActionText}>+ Tap to log water</Text>
            </TouchableOpacity>

            {/* WEIGHT PROGRESS */}
            <TouchableOpacity style={s.metricCard} onPress={() => router.push('/weight-logger' as any)}>
              <View style={s.metricCardHeader}>
                <View style={[s.metricIconBox, { backgroundColor: 'rgba(16,185,129,0.15)' }]}><Scale size={18} color="#10B981" /></View>
                <Text style={s.metricCardTitle}>Weight</Text>
              </View>
              <Text style={s.metricMainValue}>72.5<Text style={s.metricSubValue}> kg</Text></Text>
              <View style={s.progressBarBg}>
                <Animated.View style={[s.progressBarFill, { backgroundColor: '#10B981', width: '65%' }]} />
              </View>
              <Text style={s.metricActionText}>2.5 kg to goal</Text>
            </TouchableOpacity>
          </View>

          {/* WEEKLY PROGRESS CHART */}
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Weekly Progress</Text>
            <TouchableOpacity><Text style={s.sectionAction}>Details</Text></TouchableOpacity>
          </View>
          <View style={s.chartCard}>
            <View style={s.chartStatsRow}>
              <View>
                <Text style={s.chartLabel}>Avg. Calories</Text>
                <Text style={s.chartBigValue}>420<Text style={s.chartSmallValue}> /day</Text></Text>
              </View>
              <View>
                <Text style={s.chartLabel}>Total Workouts</Text>
                <Text style={s.chartBigValue}>{stats?.weeklyStats?.length || 4}</Text>
              </View>
            </View>
            <View style={s.barsContainer}>
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => {
                const heights = [40, 70, 30, 85, 50, 0, 0];
                const h = heights[idx];
                const isToday = idx === 3; // Mock Thursday for visual
                return (
                  <View key={idx} style={s.barColumn}>
                    <View style={s.barTrack}>
                      <LinearGradient colors={isToday ? ['#38BDF8', '#0EA5E9'] : ['#334155', '#1E293B']} style={[s.barFill, { height: `${h}%` }]} />
                    </View>
                    <Text style={[s.barLabel, isToday && s.barLabelToday]}>{day}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* QUICK ACTIONS */}
          <Text style={s.sectionTitle}>Quick Actions</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.quickActionsScroll}>
            {[
              { title: 'Log Workout', icon: Plus, color: '#10B981', route: '/create-workout' },
              { title: 'Find Coach', icon: Users, color: '#38BDF8', route: '/(tabs)/trainers' },
              { title: 'My Bookings', icon: HistoryIcon, color: '#A855F7', route: '/my-bookings' },
              { title: 'Diet Plan', icon: Target, color: '#F59E0B', route: '/(tabs)/diet' },
            ].map((act, i) => (
              <TouchableOpacity key={i} style={s.quickActionCard} onPress={() => router.push(act.route as any)}>
                <View style={[s.qaIconBox, { backgroundColor: `${act.color}15` }]}>
                  <act.icon size={24} color={act.color} />
                </View>
                <Text style={s.qaTitle}>{act.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* RECENT ACTIVITY */}
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/workouts' as any)}><Text style={s.sectionAction}>View All</Text></TouchableOpacity>
          </View>
          
          <View style={s.recentContainer}>
            {recent && recent.length > 0 ? recent.map((item: any, i: number) => {
              const dateObj = new Date(item.date);
              return (
                <TouchableOpacity key={item._id || i} style={s.recentCard} onPress={() => router.push(`/workout/${item._id}`)}>
                  <View style={s.recentIconBox}>
                    <Dumbbell size={20} color="#F8FAFC" />
                  </View>
                  <View style={s.recentInfo}>
                    <Text style={s.recentTitle}>{item.exercise}</Text>
                    <Text style={s.recentMeta}>{item.duration || 30} Min • {Math.round((item.duration || 30) * 8.5)} Kcal</Text>
                  </View>
                  <Text style={s.recentDate}>{dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</Text>
                </TouchableOpacity>
              );
            }) : (
              <View style={s.emptyStateBox}>
                <Activity size={32} color="#334155" style={{ marginBottom: 12 }} />
                <Text style={s.emptyStateTitle}>No Recent Workouts</Text>
                <Text style={s.emptyStateSub}>Your fitness journey starts today. Log your first session to see it here.</Text>
                <TouchableOpacity style={s.emptyStateBtn} onPress={() => router.push('/create-workout')}>
                  <Text style={s.emptyStateBtnText}>Log Workout</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

        </View>
      </ScrollView>

      {user && (
        <PremiumOnboardingModal
          visible={showOnboarding}
          onClose={() => setShowOnboarding(false)}
          userId={user.id}
        />
      )}
      <FloatingChatButton />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  heroSection: { borderBottomLeftRadius: 32, borderBottomRightRadius: 32, paddingHorizontal: 24, paddingBottom: 32, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  greetingText: { fontSize: 16, color: '#94A3B8', fontWeight: '600', letterSpacing: 0.5 },
  userName: { fontSize: 32, color: '#F8FAFC', fontWeight: '900', letterSpacing: -1, marginTop: 4 },
  headerIcons: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  iconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  notificationDot: { position: 'absolute', top: 12, right: 12, width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444', borderWidth: 2, borderColor: '#1E293B' },
  avatarImg: { width: 44, height: 44, borderRadius: 22 },
  
  quoteBox: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 16, alignItems: 'center', marginBottom: 32, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  quoteText: { flex: 1, color: '#CBD5E1', fontSize: 13, fontStyle: 'italic', fontWeight: '500', lineHeight: 20 },

  heroStatsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroStatItem: { alignItems: 'center', flex: 1 },
  heroStatIconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  heroStatValue: { fontSize: 20, color: '#F8FAFC', fontWeight: '900', letterSpacing: -0.5 },
  heroStatLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '700', marginTop: 4, textTransform: 'uppercase' },
  heroStatDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.1)' },

  mainContent: { paddingHorizontal: 20, paddingTop: 24 },
  
  todaysWorkoutCard: { height: 200, borderRadius: 28, overflow: 'hidden', marginBottom: 24, shadowColor: '#38BDF8', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 8 },
  workoutBg: { width: '100%', height: '100%' },
  workoutGradient: { flex: 1, padding: 24, justifyContent: 'flex-end' },
  workoutTag: { alignSelf: 'flex-start', backgroundColor: '#38BDF8', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, marginBottom: 12 },
  workoutTagText: { color: '#0F172A', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  workoutTitle: { color: '#F8FAFC', fontSize: 28, fontWeight: '900', letterSpacing: -1, marginBottom: 8 },
  workoutMetaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  workoutMetaText: { color: '#CBD5E1', fontSize: 13, fontWeight: '600' },
  workoutMetaDot: { color: '#64748B', fontSize: 14, marginHorizontal: 8 },
  playBtn: { flexDirection: 'row', backgroundColor: '#F8FAFC', alignSelf: 'flex-start', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 100, alignItems: 'center' },
  playBtnText: { color: '#0F172A', fontSize: 14, fontWeight: '900', marginLeft: 8 },

  metricsGrid: { flexDirection: 'row', gap: 16, marginBottom: 32 },
  metricCard: { flex: 1, backgroundColor: '#1E293B', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  metricCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  metricIconBox: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  metricCardTitle: { color: '#94A3B8', fontSize: 13, fontWeight: '700' },
  metricMainValue: { color: '#F8FAFC', fontSize: 24, fontWeight: '900', marginBottom: 12 },
  metricSubValue: { color: '#64748B', fontSize: 14, fontWeight: '600' },
  progressBarBg: { height: 6, backgroundColor: '#0F172A', borderRadius: 3, overflow: 'hidden', marginBottom: 12 },
  progressBarFill: { height: '100%', borderRadius: 3 },
  metricActionText: { color: '#94A3B8', fontSize: 12, fontWeight: '600' },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { color: '#F8FAFC', fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
  sectionAction: { color: '#38BDF8', fontSize: 14, fontWeight: '700' },

  chartCard: { backgroundColor: '#1E293B', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', marginBottom: 32 },
  chartStatsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  chartLabel: { color: '#94A3B8', fontSize: 12, fontWeight: '700', marginBottom: 4 },
  chartBigValue: { color: '#F8FAFC', fontSize: 24, fontWeight: '900' },
  chartSmallValue: { color: '#64748B', fontSize: 14, fontWeight: '600' },
  barsContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 120 },
  barColumn: { alignItems: 'center', width: 32 },
  barTrack: { width: 12, height: 100, backgroundColor: '#0F172A', borderRadius: 6, justifyContent: 'flex-end', marginBottom: 12 },
  barFill: { width: 12, borderRadius: 6 },
  barLabel: { color: '#64748B', fontSize: 12, fontWeight: '700' },
  barLabelToday: { color: '#38BDF8', fontWeight: '900' },

  quickActionsScroll: { gap: 16, marginBottom: 32, paddingRight: 20 },
  quickActionCard: { width: 110, height: 120, backgroundColor: '#1E293B', borderRadius: 24, padding: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  qaIconBox: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  qaTitle: { color: '#CBD5E1', fontSize: 12, fontWeight: '700', textAlign: 'center' },

  recentContainer: { gap: 12, marginBottom: 20 },
  recentCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', padding: 16, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  recentIconBox: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#38BDF8', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  recentInfo: { flex: 1 },
  recentTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: '800', marginBottom: 4 },
  recentMeta: { color: '#94A3B8', fontSize: 13, fontWeight: '600' },
  recentDate: { color: '#64748B', fontSize: 12, fontWeight: '700' },
  
  emptyStateBox: { backgroundColor: '#1E293B', borderRadius: 24, padding: 32, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderStyle: 'dashed' },
  emptyStateTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: '900', marginBottom: 8 },
  emptyStateSub: { color: '#94A3B8', fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  emptyStateBtn: { backgroundColor: '#38BDF8', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 100 },
  emptyStateBtnText: { color: '#0F172A', fontSize: 14, fontWeight: '900' },

  errorContainer: { flex: 1, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center', padding: 24 },
  errorTitle: { color: '#EF4444', fontSize: 18, fontWeight: '900', marginBottom: 8, letterSpacing: 0.5 },
  errorText: { color: '#94A3B8', fontSize: 15, textAlign: 'center', marginBottom: 32, lineHeight: 22 },
  retryBtn: { backgroundColor: '#1E293B', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 16, borderWidth: 1, borderColor: '#334155' },
  retryText: { color: '#F8FAFC', fontWeight: '800', fontSize: 14 },
});
