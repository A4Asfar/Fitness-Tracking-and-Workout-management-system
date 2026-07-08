import React, { useState, useEffect } from 'react';
import {
  View, StyleSheet, ActivityIndicator, ScrollView, RefreshControl, Text, TouchableOpacity
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Weight, Activity, Trophy, Flame, Dumbbell, Sparkles
} from 'lucide-react-native';
import { Stack } from 'expo-router';
import SkeletonCard, { SkeletonItem } from '@/components/SkeletonCard';

import AnalyticsHeader from '@/components/analytics/AnalyticsHeader';
import MetricCard from '@/components/analytics/MetricCard';
import DateFilter from '@/components/analytics/DateFilter';
import ChartCard from '@/components/analytics/ChartCard';
import AIInsightCard from '@/components/analytics/AIInsightCard';
import { PremiumGate } from '@/components/PremiumGate';

export default function ProgressAnalyticsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<any>(null);
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly'>('weekly');
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setError(null);
    try {
      const res = await api.get('/workouts/analytics');
      setData(res.data);
    } catch (e: any) {
      if (__DEV__) console.log('Analytics error:', e.message);
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
    fetchAnalytics();
  };

  const weightKg = user?.weight || 0;
  const weightLbs = Math.round(weightKg * 2.20462);

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 16, paddingHorizontal: 20 }]}>
        <View style={{ marginBottom: 24 }}>
          <SkeletonItem width="40%" height={24} style={{ marginBottom: 8 }} />
          <SkeletonItem width="60%" height={16} />
        </View>
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
          <SkeletonCard style={{ flex: 1, height: 100 }} />
          <SkeletonCard style={{ flex: 1, height: 100 }} />
        </View>
        <SkeletonCard style={{ height: 180, marginBottom: 20 }} />
        <SkeletonCard style={{ height: 140 }} />
      </View>
    );
  }

  if (error && !refreshing) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>SYNC ERROR</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          onPress={() => { setLoading(true); fetchAnalytics(); }} 
          style={styles.retryBtn}
          activeOpacity={0.8}
        >
          <Text style={styles.retryText}>RETRY SYNC</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView 
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7C4DFF" />
        }
      >
        {/* Dynamic header welcome */}
        <AnalyticsHeader onSharePress={() => Alert.alert('Share Progress', 'Share sheet will open in production build.')} />

        {/* Date Filter Toggles */}
        <DateFilter selected={timeframe} onChange={setTimeframe} />

        {/* Metrics Grid Row */}
        <View style={styles.metricsGrid}>
          <MetricCard 
            label="Current Weight"
            value={weightKg > 0 ? `${weightLbs} lbs` : '--'}
            sub={weightKg > 0 ? `${weightKg} kg` : 'Not set'}
            isPositive={false}
            accentColor="#FF6B3B"
            icon={Weight}
          />
          <MetricCard 
            label="BMI Index"
            value={data?.bmi ? String(data.bmi) : '--'}
            sub={data?.bmiCategory || 'N/A'}
            isPositive={true}
            accentColor="#00B0FF"
            icon={Activity}
          />
        </View>
        <View style={[styles.metricsGrid, { marginTop: 12, marginBottom: 20 }]}>
          <MetricCard 
            label="Total Sessions"
            value={String(data?.totalWorkouts ?? 0)}
            sub="All-time log"
            isPositive={true}
            accentColor="#7C4DFF"
            icon={Dumbbell}
          />
          <MetricCard 
            label="Current Streak"
            value={String(data?.streak ?? 0)}
            sub="Consecutive"
            isPositive={true}
            accentColor="#FF6B00"
            icon={Trophy}
          />
        </View>

        <PremiumGate
          featureTitle="Advanced Progress Analytics"
          featureDescription="Unlock progressive workout volume charts, fitness streaks history, and deep weight progression analysis."
          style={{ marginHorizontal: 20, marginBottom: 20 }}
        >
          {/* Workout Volume Chart */}
          <View style={styles.chartWrapper}>
            <ChartCard title="Daily Training Volume">
              <View style={styles.chartBarWrapper}>
                {(data?.chartData || []).map((day: any, idx: number) => {
                  const maxVolume = Math.max(...(data?.chartData || []).map((d: any) => d.volume), 100);
                  const barHeight = Math.round((day.volume / maxVolume) * 110) + 10;
                  const dayName = new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' }).substring(0, 3);
                  return (
                    <View key={idx} style={styles.barCol}>
                      <View style={styles.barTrack}>
                        <View style={[styles.barFill, { height: barHeight }]} />
                      </View>
                      <Text style={styles.barLabel}>{dayName}</Text>
                    </View>
                  );
                })}
              </View>
            </ChartCard>
          </View>
        </PremiumGate>

        <PremiumGate
          featureTitle="Premium Insights"
          featureDescription="Get daily personalized progressive overload recommendations, active calories trends, and consistency feedback from the AI coach."
          style={{ marginHorizontal: 20, marginBottom: 20 }}
        >
          {/* AI Coaching insights list */}
          <View style={styles.insightsSection}>
            <View style={styles.sectionHeader}>
              <Sparkles size={16} color="#7C4DFF" style={{ marginRight: 6 }} />
              <Text style={styles.sectionTitle}>AI Analytics Coach</Text>
            </View>

            <AIInsightCard 
              title="Calories Burned"
              value={`${data?.totalCalories ?? 0} kcal`}
              sub="You've burned 15% more calories than last week! Keep burning active minutes."
              icon={Flame}
              color="#FF4D4D"
            />

            <AIInsightCard 
              title="Training Intensity"
              value="High Volume Focus"
              sub="Your overall volume and average sets count is increasing steadily. Superb progression!"
              icon={Dumbbell}
              color="#7C4DFF"
            />
          </View>
        </PremiumGate>
      </ScrollView>
    </View>
  );
}

import { Alert } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loaderContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14,
  },
  loaderText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    color: '#FF4D4D',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 8,
  },
  errorText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
  },
  retryBtn: {
    height: 52,
    width: 160,
    borderRadius: 16,
    backgroundColor: '#7C4DFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7C4DFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  metricsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  chartWrapper: {
    paddingHorizontal: 20,
  },
  chartBarWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 140,
    width: '100%',
  },
  barCol: {
    alignItems: 'center',
    flex: 1,
  },
  barTrack: {
    height: 110,
    width: 14,
    backgroundColor: '#F1F5F9',
    borderRadius: 7,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    backgroundColor: '#7C4DFF',
    borderRadius: 7,
  },
  barLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 8,
  },
  insightsSection: {
    paddingHorizontal: 20,
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingLeft: 4,
  },
  sectionTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '800',
  },
});
