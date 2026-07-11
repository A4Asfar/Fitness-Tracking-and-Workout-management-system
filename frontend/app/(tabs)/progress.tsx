import React, { useState, useEffect, useRef } from 'react';
import {
  View, StyleSheet, ScrollView, RefreshControl, Text, TouchableOpacity, Dimensions, Animated, ImageBackground
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Weight, Activity, Trophy, Flame, Dumbbell, Sparkles, TrendingDown, TrendingUp, Calendar, Medal, Crown, Target
} from 'lucide-react-native';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import SkeletonCard from '@/components/SkeletonCard';

const { width } = Dimensions.get('window');

const ACHIEVEMENTS = [
  { id: '1', title: '7-Day Streak', desc: 'Workout for 7 consecutive days', icon: Flame, color: '#FF4D4D', unlocked: true },
  { id: '2', title: 'Heavy Lifter', desc: 'Log over 10,000 kg volume', icon: Dumbbell, color: '#38BDF8', unlocked: true },
  { id: '3', title: 'Early Bird', desc: 'Complete 5 workouts before 8 AM', icon: Sparkles, color: '#F59E0B', unlocked: false },
  { id: '4', title: 'Century Club', desc: 'Burn 100,000 total calories', icon: Crown, color: '#A855F7', unlocked: false },
];

const PERSONAL_RECORDS = [
  { exercise: 'Barbell Squat', weight: '140 kg', date: 'Oct 12' },
  { exercise: 'Bench Press', weight: '100 kg', date: 'Nov 02' },
  { exercise: 'Deadlift', weight: '180 kg', date: 'Nov 15' },
];

export default function ProgressAnalyticsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<any>(null);
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly'>('weekly');
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [error, setError] = useState<string | null>(null);

  const fillAnim = useRef(new Animated.Value(0)).current;

  const fetchAnalytics = async () => {
    setError(null);
    try {
      const res = await api.get('/workouts/analytics');
      setData(res.data);
      
      Animated.timing(fillAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: false
      }).start();

    } catch (e: any) {

      setError(e.message || 'Failed to sync progress data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fillAnim.setValue(0);
    fetchAnalytics();
  };

  const weightKg = user?.weight || 75;
  const weightTrend = -1.2; // Mock weight loss trend

  if (loading && !refreshing) {
    return (
      <View style={[s.container, { paddingTop: insets.top }]}>
        <View style={{ padding: 24 }}><SkeletonCard /><SkeletonCard /><SkeletonCard /></View>
      </View>
    );
  }

  const goalCompletionPercent = 0.75; // Mock 75%
  const goalWidth = fillAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', `${goalCompletionPercent * 100}%`] });

  return (
    <View style={s.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#38BDF8" />}
      >
        {/* PREMIUM HEADER */}
        <LinearGradient colors={['#1E293B', '#0F172A']} style={[s.heroSection, { paddingTop: insets.top + 16 }]}>
          <Text style={s.headerSubtitle}>Performance Data</Text>
          <Text style={s.headerTitle}>Analytics</Text>

          {/* MAIN MACRO METRICS */}
          <View style={s.topMetricsGrid}>
            <View style={s.topMetricCard}>
              <View style={[s.iconBox, { backgroundColor: 'rgba(56,189,248,0.1)' }]}><Weight size={18} color="#38BDF8" /></View>
              <Text style={s.topMetricLabel}>Current Weight</Text>
              <View style={s.weightRow}>
                <Text style={s.topMetricVal}>{weightKg}<Text style={s.topMetricUnit}> kg</Text></Text>
                <View style={s.trendBadge}>
                  <TrendingDown size={12} color="#10B981" />
                  <Text style={s.trendText}>{Math.abs(weightTrend)}%</Text>
                </View>
              </View>
            </View>

            <View style={s.topMetricCard}>
              <View style={[s.iconBox, { backgroundColor: 'rgba(245,158,11,0.1)' }]}><Trophy size={18} color="#F59E0B" /></View>
              <Text style={s.topMetricLabel}>Workout Streak</Text>
              <Text style={s.topMetricVal}>{data?.streak ?? 5}<Text style={s.topMetricUnit}> Days</Text></Text>
            </View>
          </View>
        </LinearGradient>

        <View style={s.content}>
          {/* GOAL COMPLETION */}
          <View style={s.goalCard}>
            <View style={s.goalHeader}>
              <View style={s.goalTitleRow}>
                <Target size={20} color="#10B981" />
                <Text style={s.goalTitle}>Fat Loss Goal Progress</Text>
              </View>
              <Text style={s.goalPercent}>{Math.round(goalCompletionPercent * 100)}%</Text>
            </View>
            <View style={s.goalBarBg}>
              <Animated.View style={[s.goalBarFill, { width: goalWidth }]} />
            </View>
            <Text style={s.goalSub}>2.5 kg remaining to hit your target.</Text>
          </View>

          {/* TOGGLE TIMEFRAME */}
          <View style={s.toggleRow}>
            <TouchableOpacity 
              style={[s.toggleBtn, timeframe === 'weekly' && s.toggleActive]} 
              onPress={() => setTimeframe('weekly')}
            >
              <Text style={[s.toggleText, timeframe === 'weekly' && s.toggleTextActive]}>Weekly</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[s.toggleBtn, timeframe === 'monthly' && s.toggleActive]} 
              onPress={() => setTimeframe('monthly')}
            >
              <Text style={[s.toggleText, timeframe === 'monthly' && s.toggleTextActive]}>Monthly</Text>
            </TouchableOpacity>
          </View>

          {/* CALORIES CHART */}
          <Text style={s.sectionTitle}>Active Calories</Text>
          <View style={s.chartCard}>
            <View style={s.chartStatsRow}>
              <View>
                <Text style={s.chartLabel}>Average Burn</Text>
                <Text style={s.chartBigValue}>650<Text style={s.chartSmallValue}> kcal/day</Text></Text>
              </View>
              <Flame size={24} color="#EF4444" />
            </View>
            <View style={s.barsContainer}>
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => {
                const heights = [40, 80, 60, 100, 70, 30, 0]; 
                const h = heights[idx];
                const isToday = idx === 3; 
                return (
                  <View key={idx} style={s.barColumn}>
                    <View style={s.barTrack}>
                      <LinearGradient colors={isToday ? ['#EF4444', '#DC2626'] : ['#334155', '#1E293B']} style={[s.barFill, { height: `${h}%` }]} />
                    </View>
                    <Text style={[s.barLabel, isToday && { color: '#EF4444', fontWeight: '900' }]}>{day}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* WEIGHT TREND CHART */}
          <Text style={s.sectionTitle}>Weight Trend</Text>
          <View style={s.chartCard}>
            <View style={s.chartStatsRow}>
              <View>
                <Text style={s.chartLabel}>30-Day Change</Text>
                <Text style={s.chartBigValue}>-1.2<Text style={s.chartSmallValue}> kg</Text></Text>
              </View>
              <Activity size={24} color="#38BDF8" />
            </View>
            <View style={s.barsContainer}>
              {['W1', 'W2', 'W3', 'W4'].map((week, idx) => {
                const heights = [90, 85, 75, 65]; 
                const h = heights[idx];
                return (
                  <View key={idx} style={[s.barColumn, { flex: 1 }]}>
                    <View style={[s.barTrack, { width: 30, backgroundColor: 'transparent', justifyContent: 'flex-end' }]}>
                      <View style={[s.barFill, { height: `${h}%`, backgroundColor: '#38BDF8', width: 30, opacity: 0.8 }]} />
                    </View>
                    <Text style={s.barLabel}>{week}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* ACHIEVEMENTS TROPHY ROOM */}
          <View style={s.headerRow}>
            <Text style={s.sectionTitle}>Trophy Room</Text>
            <Text style={s.viewAllLink}>View All</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.achieveScroll}>
            {ACHIEVEMENTS.map(ach => (
              <View key={ach.id} style={[s.achieveCard, !ach.unlocked && s.achieveLocked]}>
                <View style={[s.achieveIconBox, { backgroundColor: ach.unlocked ? `${ach.color}20` : '#334155' }]}>
                  <ach.icon size={28} color={ach.unlocked ? ach.color : '#64748B'} />
                </View>
                <Text style={s.achieveTitle}>{ach.title}</Text>
                <Text style={s.achieveDesc} numberOfLines={2}>{ach.desc}</Text>
                {!ach.unlocked && (
                  <View style={s.lockOverlay}>
                    <Text style={s.lockText}>LOCKED</Text>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>

          {/* PERSONAL RECORDS */}
          <Text style={s.sectionTitle}>Personal Records</Text>
          <View style={s.prContainer}>
            {PERSONAL_RECORDS.map((pr, idx) => (
              <View key={idx} style={s.prCard}>
                <View style={s.prLeft}>
                  <View style={s.prIconBg}><Medal size={20} color="#FDE047" /></View>
                  <View>
                    <Text style={s.prEx}>{pr.exercise}</Text>
                    <Text style={s.prDate}>{pr.date}</Text>
                  </View>
                </View>
                <View style={s.prRight}>
                  <Text style={s.prWeight}>{pr.weight}</Text>
                  <Text style={s.prLab}>Max</Text>
                </View>
              </View>
            ))}
          </View>

        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  heroSection: { paddingHorizontal: 24, paddingBottom: 32, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },
  headerSubtitle: { color: '#94A3B8', fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  headerTitle: { color: '#F8FAFC', fontSize: 32, fontWeight: '900', letterSpacing: -1, marginBottom: 24 },

  topMetricsGrid: { flexDirection: 'row', gap: 16 },
  topMetricCard: { flex: 1, backgroundColor: '#1E293B', padding: 20, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  iconBox: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  topMetricLabel: { color: '#94A3B8', fontSize: 13, fontWeight: '700', marginBottom: 4 },
  weightRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  topMetricVal: { color: '#F8FAFC', fontSize: 24, fontWeight: '900' },
  topMetricUnit: { color: '#64748B', fontSize: 14, fontWeight: '700' },
  trendBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(16,185,129,0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  trendText: { color: '#10B981', fontSize: 11, fontWeight: '800', marginLeft: 2 },

  content: { padding: 24 },

  goalCard: { backgroundColor: '#1E293B', borderRadius: 24, padding: 20, marginBottom: 32, borderWidth: 1, borderColor: '#10B98130' },
  goalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  goalTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  goalTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: '800' },
  goalPercent: { color: '#10B981', fontSize: 18, fontWeight: '900' },
  goalBarBg: { height: 8, backgroundColor: '#0F172A', borderRadius: 4, overflow: 'hidden', marginBottom: 12 },
  goalBarFill: { height: '100%', backgroundColor: '#10B981', borderRadius: 4 },
  goalSub: { color: '#94A3B8', fontSize: 13, fontWeight: '600' },

  toggleRow: { flexDirection: 'row', backgroundColor: '#1E293B', borderRadius: 100, padding: 4, marginBottom: 24 },
  toggleBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 100 },
  toggleActive: { backgroundColor: '#38BDF8' },
  toggleText: { color: '#94A3B8', fontSize: 14, fontWeight: '700' },
  toggleTextActive: { color: '#0F172A', fontWeight: '900' },

  sectionTitle: { color: '#F8FAFC', fontSize: 20, fontWeight: '900', letterSpacing: -0.5, marginBottom: 16 },
  
  chartCard: { backgroundColor: '#1E293B', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', marginBottom: 32 },
  chartStatsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  chartLabel: { color: '#94A3B8', fontSize: 12, fontWeight: '700', marginBottom: 4 },
  chartBigValue: { color: '#F8FAFC', fontSize: 24, fontWeight: '900' },
  chartSmallValue: { color: '#64748B', fontSize: 14, fontWeight: '600' },
  barsContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 120 },
  barColumn: { alignItems: 'center', width: 32 },
  barTrack: { width: 12, height: 100, backgroundColor: '#0F172A', borderRadius: 6, justifyContent: 'flex-end', marginBottom: 12 },
  barFill: { width: '100%', borderRadius: 6 },
  barLabel: { color: '#64748B', fontSize: 12, fontWeight: '700' },

  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  viewAllLink: { color: '#38BDF8', fontSize: 14, fontWeight: '700' },

  achieveScroll: { gap: 16, marginBottom: 32, paddingRight: 24 },
  achieveCard: { width: 140, backgroundColor: '#1E293B', padding: 20, borderRadius: 24, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  achieveLocked: { opacity: 0.6 },
  achieveIconBox: { width: 64, height: 64, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  achieveTitle: { color: '#F8FAFC', fontSize: 14, fontWeight: '900', textAlign: 'center', marginBottom: 4 },
  achieveDesc: { color: '#94A3B8', fontSize: 11, textAlign: 'center', lineHeight: 16 },
  lockOverlay: { position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(15,23,42,0.8)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  lockText: { color: '#CBD5E1', fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },

  prContainer: { gap: 12 },
  prCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1E293B', padding: 16, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  prLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  prIconBg: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(253,224,71,0.1)', justifyContent: 'center', alignItems: 'center' },
  prEx: { color: '#F8FAFC', fontSize: 16, fontWeight: '800', marginBottom: 2 },
  prDate: { color: '#94A3B8', fontSize: 12, fontWeight: '600' },
  prRight: { alignItems: 'flex-end' },
  prWeight: { color: '#FDE047', fontSize: 18, fontWeight: '900' },
  prLab: { color: '#64748B', fontSize: 11, fontWeight: '700' },
});
