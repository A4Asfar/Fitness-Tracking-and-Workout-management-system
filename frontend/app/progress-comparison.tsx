import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Animated, Dimensions, RefreshControl
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Colors, SharedStyles, SPACING } from '@/constants/Theme';
import { 
  ArrowLeft, TrendingUp, Dumbbell, Weight, 
  Target, Sparkles, ChevronRight, ArrowUpRight, 
  ArrowDownRight, Zap, Activity
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';

const { width } = Dimensions.get('window');
const PAD = 24;

export default function ProgressComparisonScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const fetchData = async () => {
    try {
      const res = await api.get('/workouts/analytics');
      setData(res.data);
      
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]).start();
    } catch (error) {
      console.error('Progress Comparison Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading && !refreshing) {
    return (
      <View style={[SharedStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Real data from analytics
  const thisWeekCount = data?.weeklyStats?.count ?? 0;
  const lastWeekCount = data?.lastWeekStats?.count ?? 0;
  const improvementPct = lastWeekCount > 0 ? ((thisWeekCount - lastWeekCount) / lastWeekCount * 100) : (thisWeekCount > 0 ? 100 : 0);
  
  const thisVolume = data?.weeklyStats?.volume ?? 0;
  const lastVolume = data?.lastWeekStats?.volume ?? 0;
  const volumeDiff = thisVolume - lastVolume;

  const maxCount = Math.max(thisWeekCount, lastWeekCount, 1);
  const maxVolume = Math.max(thisVolume, lastVolume, 1);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <LinearGradient 
        colors={[Colors.primary + '15', 'transparent']} 
        style={styles.headerGlow} 
      />

      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fitness Progress</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView 
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          
          <View style={styles.introSection}>
            <Text style={styles.title}>Your Fitness Progress</Text>
            <Text style={styles.subtitle}>Digital monitoring beyond the gym walls</Text>
          </View>

          {/* Comparison Grid */}
          <View style={styles.grid}>
            <ComparisonCard 
              label="Last Week" 
              value={lastWeekCount} 
              subValue="Workouts"
              icon={Activity}
              color="#A855F7"
            />
            <ComparisonCard 
              label="This Week" 
              value={thisWeekCount} 
              subValue="Workouts"
              icon={TrendingUp}
              color={Colors.primary}
            />
          </View>

          {/* Stats Section */}
          <View style={styles.statsSection}>
            <StatRow 
              title="Workouts Comparison" 
              thisVal={thisWeekCount} 
              lastVal={lastWeekCount}
              max={maxCount}
              suffix=" sessions"
            />
            <StatRow 
              title="Total Weight Lifted" 
              thisVal={thisVolume} 
              lastVal={lastVolume}
              max={maxVolume}
              suffix=" kg"
              isWeight
            />
          </View>

          {/* Improvement & Change Cards */}
          <View style={styles.summaryRow}>
            <SummaryCard 
              title="Improvement"
              value={`${improvementPct > 0 ? '+' : ''}${improvementPct.toFixed(0)}%`}
              subTitle="vs Last Week"
              icon={improvementPct >= 0 ? ArrowUpRight : ArrowDownRight}
              color={improvementPct >= 0 ? Colors.primary : '#FF4B4B'}
            />
            <SummaryCard 
              title="Weight Change"
              value={`${volumeDiff > 0 ? '+' : ''}${Math.abs(volumeDiff / 1000).toFixed(1)}t`}
              subTitle="Total volume"
              icon={Zap}
              color="#00D1FF"
            />
          </View>

          {/* Smart Insight */}
          <LinearGradient
            colors={[Colors.primary + '20', Colors.primary + '05']}
            style={styles.insightCard}
          >
            <View style={styles.insightIconBox}>
              <Sparkles size={24} color={Colors.primary} />
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightBadge}>SMART INSIGHT</Text>
              <Text style={styles.insightText}>
                You completed {improvementPct.toFixed(0)}% more workouts than last week. Your consistency is driving significant strength gains!
              </Text>
            </View>
          </LinearGradient>

          <TouchableOpacity style={styles.detailedBtn} onPress={() => router.push('/(tabs)/progress')}>
            <Text style={styles.detailedBtnText}>View Detailed Analytics</Text>
            <ChevronRight size={18} color={Colors.primary} />
          </TouchableOpacity>

        </Animated.View>
      </ScrollView>
    </View>
  );
}

function ComparisonCard({ label, value, subValue, icon: Icon, color }: any) {
  return (
    <View style={styles.compareCard}>
      <Text style={styles.compareLabel}>{label}</Text>
      <View style={styles.compareMain}>
        <View style={[styles.compareIcon, { backgroundColor: color + '15' }]}>
          <Icon size={20} color={color} />
        </View>
        <View>
          <Text style={styles.compareValue}>{value}</Text>
          <Text style={styles.compareSub}>{subValue}</Text>
        </View>
      </View>
    </View>
  );
}

function SummaryCard({ title, value, subTitle, icon: Icon, color }: any) {
  return (
    <View style={styles.summaryCard}>
      <View style={styles.summaryTop}>
        <Text style={styles.summaryTitle}>{title}</Text>
        <Icon size={16} color={color} />
      </View>
      <Text style={[styles.summaryValue, { color }]}>{value}</Text>
      <Text style={styles.summarySub}>{subTitle}</Text>
    </View>
  );
}

function StatRow({ title, thisVal, lastVal, max, suffix, isWeight }: any) {
  const fmt = (v: number) => isWeight ? (v >= 1000 ? `${(v/1000).toFixed(1)}k` : v) : v;
  
  return (
    <View style={styles.statRowContainer}>
      <Text style={styles.statRowTitle}>{title}</Text>
      
      <View style={styles.barGroup}>
        <View style={styles.barHeader}>
          <Text style={styles.barLabel}>This Week</Text>
          <Text style={[styles.barValue, { color: Colors.primary }]}>{fmt(thisVal)}{suffix}</Text>
        </View>
        <View style={styles.track}>
          <LinearGradient
            colors={[Colors.primary, '#9FE800']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={[styles.fill, { width: `${(thisVal / max) * 100}%` }]}
          />
        </View>
      </View>

      <View style={styles.barGroup}>
        <View style={styles.barHeader}>
          <Text style={styles.barLabel}>Last Week</Text>
          <Text style={styles.barValue}>{fmt(lastVal)}{suffix}</Text>
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${(lastVal / max) * 100}%`, backgroundColor: '#333' }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  headerGlow: { position: 'absolute', top: 0, left: 0, right: 0, height: 300 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: PAD,
    paddingBottom: SPACING.md,
  },
  backBtn: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: Colors.card, justifyContent: 'center',
    alignItems: 'center', borderWidth: 1, borderColor: Colors.border,
  },
  headerTitle: { color: Colors.text, fontSize: 18, fontWeight: '900', letterSpacing: -0.5 },
  content: { padding: PAD },
  introSection: { marginBottom: 32 },
  title: { color: Colors.text, fontSize: 32, fontWeight: '900', letterSpacing: -1 },
  subtitle: { color: Colors.textSecondary, fontSize: 16, marginTop: 8, fontWeight: '500' },
  
  grid: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  compareCard: {
    flex: 1, backgroundColor: Colors.card, borderRadius: 24,
    padding: 20, borderWidth: 1, borderColor: Colors.border,
  },
  compareLabel: { color: Colors.textSecondary, fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 },
  compareMain: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  compareIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  compareValue: { color: Colors.text, fontSize: 24, fontWeight: '900' },
  compareSub: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600' },

  statsSection: { 
    backgroundColor: Colors.card, borderRadius: 24, padding: 24, 
    borderWidth: 1, borderColor: Colors.border, marginBottom: 16 
  },
  statRowContainer: { marginBottom: 24 },
  statRowTitle: { color: Colors.text, fontSize: 16, fontWeight: '800', marginBottom: 20 },
  barGroup: { marginBottom: 16 },
  barHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  barLabel: { color: Colors.textSecondary, fontSize: 12, fontWeight: '700' },
  barValue: { color: Colors.text, fontSize: 13, fontWeight: '800' },
  track: { height: 8, backgroundColor: '#222', borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },

  summaryRow: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  summaryCard: {
    flex: 1, backgroundColor: Colors.card, borderRadius: 24,
    padding: 20, borderWidth: 1, borderColor: Colors.border,
  },
  summaryTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  summaryTitle: { color: Colors.textSecondary, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  summaryValue: { fontSize: 24, fontWeight: '900', marginBottom: 4 },
  summarySub: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600' },

  insightCard: {
    borderRadius: 24, padding: 20, flexDirection: 'row', gap: 16,
    borderWidth: 1, borderColor: Colors.primary + '30', marginBottom: 32,
  },
  insightIconBox: { width: 50, height: 50, borderRadius: 16, backgroundColor: Colors.primary + '15', justifyContent: 'center', alignItems: 'center' },
  insightContent: { flex: 1 },
  insightBadge: { color: Colors.primary, fontSize: 10, fontWeight: '900', letterSpacing: 1.5, marginBottom: 6 },
  insightText: { color: Colors.text, fontSize: 14, fontWeight: '700', lineHeight: 22 },

  detailedBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 16,
  },
  detailedBtnText: { color: Colors.primary, fontSize: 15, fontWeight: '800' },
});
