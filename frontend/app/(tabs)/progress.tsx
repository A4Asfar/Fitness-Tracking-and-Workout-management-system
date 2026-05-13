import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator, ScrollView,
  RefreshControl, Dimensions, Animated, TouchableOpacity
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { Colors, SPACING, SharedStyles } from '@/constants/Theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  TrendingUp, Activity, Trophy, Calendar, Zap,
  Dumbbell, ArrowUpRight, ArrowDownRight, Flame, Weight, Sparkles,
  ChevronRight
} from 'lucide-react-native';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function ProgressAnalyticsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<any>(null);
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly'>('weekly');
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

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
  }, []);

  const onRefresh = () => { setRefreshing(true); fetchAnalytics(); };

  // Calculate real stats from user data and analytics
  const weightKg = user?.weight || 163.5; // Fallback for demo
  const weightLbs = Math.round(weightKg * 2.20462);
  
  // Mock trends for UI matching
  const trends = {
    weight: { value: '-3.5', isPos: false },
    calories: { value: '+200', isPos: true },
    workouts: { value: '+12', isPos: true }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={[SharedStyles.container, { backgroundColor: '#000' }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView 
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* ── Page Header ── */}
        <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
          <Text style={styles.headerTitle}>Progress</Text>
          <Text style={styles.headerSubtitle}>Track your fitness journey</Text>
        </View>

        {/* ── Weekly/Monthly Toggle ── */}
        <View style={styles.toggleContainer}>
          <View style={styles.toggleBackground}>
            <TouchableOpacity 
              style={[styles.toggleBtn, timeframe === 'weekly' && styles.toggleBtnActive]}
              onPress={() => setTimeframe('weekly')}
            >
              {timeframe === 'weekly' && (
                <LinearGradient
                  colors={['#33E1FF', '#4F33FF']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
              )}
              <Text style={[styles.toggleText, timeframe === 'weekly' && styles.toggleTextActive]}>Weekly</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.toggleBtn, timeframe === 'monthly' && styles.toggleBtnActive]}
              onPress={() => setTimeframe('monthly')}
            >
              {timeframe === 'monthly' && (
                <LinearGradient
                  colors={['#33E1FF', '#4F33FF']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
              )}
              <Text style={[styles.toggleText, timeframe === 'monthly' && styles.toggleTextActive]}>Monthly</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Stats Row ── */}
        <View style={styles.statsRow}>
          <ProgressStatCard 
            label="Current Weight" 
            value={String(weightLbs)} 
            trend={trends.weight.value} 
            isPositiveTrend={trends.weight.isPos}
          />
          <ProgressStatCard 
            label="Avg Calories" 
            value="2,400" 
            trend={trends.calories.value} 
            isPositiveTrend={trends.calories.isPos}
          />
          <ProgressStatCard 
            label="Total Workouts" 
            value={String(data?.totalWorkouts ?? 127)} 
            trend={trends.workouts.value} 
            isPositiveTrend={trends.workouts.isPos}
          />
        </View>

        {/* ── Charts Section ── */}
        <View style={styles.body}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Weight Progress</Text>
            <TouchableOpacity>
              <Text style={styles.seeMore}>See More</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.chartPlaceholder}>
             <LinearGradient
              colors={['#111', '#050505']}
              style={styles.chartInner}
            >
              <Activity size={32} color="rgba(255,255,255,0.1)" />
              <Text style={styles.chartText}>Chart visualization coming soon</Text>
            </LinearGradient>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Activity Insights</Text>
          </View>

          <View style={styles.insightCard}>
            <LinearGradient
              colors={['#CC33FF20', 'transparent']}
              style={styles.insightGrad}
            >
              <View style={styles.insightHeader}>
                <View style={styles.insightIconWrap}>
                  <Flame size={20} color="#CC33FF" />
                </View>
                <Text style={styles.insightLabel}>Calories Burned</Text>
              </View>
              <Text style={styles.insightValue}>{data?.totalCalories ?? '12,450'} kcal</Text>
              <Text style={styles.insightSub}>You've burned 15% more than last week!</Text>
            </LinearGradient>
          </View>

          <View style={styles.insightCard}>
            <LinearGradient
              colors={['#33E1FF20', 'transparent']}
              style={styles.insightGrad}
            >
              <View style={styles.insightHeader}>
                <View style={styles.insightIconWrap}>
                  <Dumbbell size={20} color="#33E1FF" />
                </View>
                <Text style={styles.insightLabel}>Training Intensity</Text>
              </View>
              <Text style={styles.insightValue}>High Volume</Text>
              <Text style={styles.insightSub}>Your average intensity is increasing steadily.</Text>
            </LinearGradient>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function ProgressStatCard({ label, value, trend, isPositiveTrend }: any) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      <View style={styles.trendRow}>
        {isPositiveTrend ? (
          <ArrowUpRight size={12} color="#39FF14" />
        ) : (
          <ArrowDownRight size={12} color="#39FF14" />
        )}
        <Text style={[styles.trendValue, { color: '#39FF14' }]}>{trend}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1,
  },
  headerSubtitle: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '500',
    marginTop: 4,
  },
  toggleContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  toggleBackground: {
    flexDirection: 'row',
    backgroundColor: '#111',
    borderRadius: 20,
    padding: 6,
    borderWidth: 1,
    borderColor: '#222',
  },
  toggleBtn: {
    flex: 1,
    height: 44,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  toggleBtnActive: {
    // Gradient is handled inside the component
  },
  toggleText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 15,
    fontWeight: '700',
  },
  toggleTextActive: {
    color: '#FFF',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 40,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#111',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#222',
  },
  statValue: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 8,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendValue: {
    fontSize: 12,
    fontWeight: '700',
  },
  body: {
    paddingHorizontal: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800',
  },
  seeMore: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  chartPlaceholder: {
    height: 200,
    marginBottom: 40,
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#222',
  },
  chartInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  chartText: {
    color: 'rgba(255, 255, 255, 0.2)',
    fontSize: 13,
    fontWeight: '500',
  },
  insightCard: {
    marginBottom: 16,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#222',
    backgroundColor: '#0A0A0A',
  },
  insightGrad: {
    padding: 20,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  insightIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  insightLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    fontWeight: '600',
  },
  insightValue: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  insightSub: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 12,
    fontWeight: '500',
  },
});
