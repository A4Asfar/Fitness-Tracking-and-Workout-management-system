import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, Animated, Easing, useWindowDimensions } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { 
  ArrowLeft, Flame, Utensils, MessageCircle, Dumbbell, Sparkles, RefreshCw
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/context/AuthContext';
import { getDashboardAnalytics } from '@/services/analyticsService';
import Svg, { Circle } from 'react-native-svg';
import { PremiumGate } from '@/components/PremiumGate';

// --- Animated Counter ---
function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const anim = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    Animated.timing(anim, {
      toValue: target,
      duration: 1200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false
    }).start();
    const id = anim.addListener(({ value }) => setDisplay(Math.floor(value).toString()));
    return () => anim.removeListener(id);
  }, [target]);

  return <Text style={styles.cardValue}>{display}{suffix}</Text>;
}

// --- Circular Gauge (BMI) ---
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function CircularGauge({ value, category }: { value: number; category: string }) {
  const size = 120;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const targetProgress = Math.min(value / 40, 1);
    Animated.timing(animatedValue, {
      toValue: targetProgress,
      duration: 1500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
      delay: 300
    }).start();
  }, [value]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0]
  });

  const getColor = () => {
    if (category === 'Normal') return '#10B981';
    if (category === 'Underweight') return '#3B82F6';
    if (category === 'Overweight') return '#F59E0B';
    return '#EF4444';
  };

  return (
    <View style={styles.gaugeContainer}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background Circle */}
        <Circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke="#F1F5F9" strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Foreground Circle */}
        <AnimatedCircle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={getColor()} strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`}
        />
      </Svg>
      <View style={styles.gaugeCenter}>
        <Text style={styles.gaugeValue}>{value.toFixed(1)}</Text>
        <Text style={[styles.gaugeCategory, { color: getColor() }]}>{category}</Text>
      </View>
    </View>
  );
}

// --- Activity Score Bar ---
function ActivityBar({ score }: { score: number }) {
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: score,
      duration: 1200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
      delay: 500
    }).start();
  }, [score]);

  return (
    <View style={styles.activityBarTrack}>
      <Animated.View style={[styles.activityBarFill, { 
        width: widthAnim.interpolate({
          inputRange: [0, 100],
          outputRange: ['0%', '100%']
        })
      }]}>
        <LinearGradient
          colors={['#10B981', '#059669']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

export default function AnalyticsDashboardScreen() {
  const { width } = useWindowDimensions();
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const fetchData = async () => {
    setError(null);
    setLoading(true);
    try {
      const stats = await getDashboardAnalytics();
      setData(stats);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true
      }).start();
    } catch (err: any) {
      if (__DEV__) console.error('Failed to load analytics', err);
      setError(err.message || 'Failed to sync analytics data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  if (!user || loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  if (error && !loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Text style={{ color: '#EF4444', fontSize: 16, fontWeight: '800', textAlign: 'center', marginBottom: 8 }}>SYNC ERROR</Text>
        <Text style={{ color: '#64748B', fontSize: 14, fontWeight: '500', textAlign: 'center', marginBottom: 28, lineHeight: 22 }}>{error}</Text>
        <TouchableOpacity 
          onPress={fetchData} 
          style={{ height: 50, width: 160, borderRadius: 16, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center' }}
          activeOpacity={0.8}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '900' }}>Retry Sync</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
          <ArrowLeft size={20} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>AI Coach Insights</Text>
        </View>
        <TouchableOpacity onPress={fetchData} style={styles.refreshButton} activeOpacity={0.7}>
          <RefreshCw size={18} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.subtitle}>Fitness overview last updated today</Text>

          {/* ── Stats Grid ── */}
          <View style={styles.grid}>
            {/* Workouts */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={[styles.iconWrap, { backgroundColor: '#ECFDF5' }]}>
                  <Dumbbell size={16} color="#10B981" />
                </View>
                <Text style={styles.cardTitle}>Workouts</Text>
              </View>
              <Counter target={data?.totalWorkouts || 0} />
            </View>

            {/* Calories */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={[styles.iconWrap, { backgroundColor: '#FEF2F2' }]}>
                  <Flame size={16} color="#EF4444" />
                </View>
                <Text style={styles.cardTitle}>Est. Burn</Text>
              </View>
              <Counter target={data?.caloriesBurnedEstimate || 0} suffix=" kcal" />
            </View>

            {/* Meals */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={[styles.iconWrap, { backgroundColor: '#FEF3C7' }]}>
                  <Utensils size={16} color="#F59E0B" />
                </View>
                <Text style={styles.cardTitle}>Meals Logged</Text>
              </View>
              <Counter target={data?.totalMeals || 0} />
            </View>

            {/* Consultations */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={[styles.iconWrap, { backgroundColor: '#F5F3FF' }]}>
                  <MessageCircle size={16} color="#10B981" />
                </View>
                <Text style={styles.cardTitle}>Consultations</Text>
              </View>
              <Counter target={data?.totalConsultations || 0} />
            </View>
          </View>

          <PremiumGate
            featureTitle="Premium Insights"
            featureDescription="Unlock progressive AI coach assessments, body metrics gauges, and workout activity consistency scores."
            style={{ marginTop: 10 }}
          >
            {/* ── Coach Analysis (AI Section Highlighted) ── */}
            <View style={styles.insightCard}>
              <View style={styles.insightHeader}>
                <Sparkles size={20} color="#10B981" fill="#10B981" />
                <Text style={styles.insightTitle}>Weekly AI Coach Assessment</Text>
              </View>
              <Text style={styles.insightBody}>
                {data?.activityScore >= 80 
                  ? "Outstanding weekly activity! Your workout consistency exceeds 80% of personal targets. Keep feeding your body with clean protein macros."
                  : data?.activityScore >= 50
                  ? "Good effort this week. You are building solid habits. Let's aim to schedule one additional active recovery session to optimize your stats."
                  : "Your activity level is slightly below target this week. Remember, consistency beats intensity. Try starting a 15-minute bodyweight routine today!"}
              </Text>
            </View>

            {/* ── BMI & Body Health ── */}
            <View style={styles.largeCard}>
              <Text style={styles.largeCardTitle}>Body Mass Index (BMI)</Text>
              <View style={styles.bmiContent}>
                <CircularGauge value={data?.bmi || 0} category={data?.bmiCategory || 'Normal'} />
                <View style={styles.bmiTextWrap}>
                  <Text style={styles.bmiDesc}>
                    Calculated using your logged profile height and weight of <Text style={{ color: '#0F172A', fontWeight: '800' }}>{data?.currentWeight || '--'} kg</Text>.
                  </Text>
                  <Text style={styles.bmiDesc}>
                    Target Range: Maintain a normal BMI (18.5 - 24.9) for optimal metabolic and heart health.
                  </Text>
                </View>
              </View>
            </View>

            {/* ── Activity Score ── */}
            <View style={styles.largeCard}>
              <View style={styles.activityHeader}>
                <Text style={styles.largeCardTitle}>Weekly Activity Score</Text>
                <Text style={styles.scoreText}>{data?.activityScore || 0} / 100</Text>
              </View>
              <ActivityBar score={data?.activityScore || 0} />
              <Text style={styles.activityDesc}>
                This score is dynamically calculated from your training frequency and workout consistency over the last 7 days.
              </Text>
            </View>
          </PremiumGate>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create<Record<string, any>>({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1.5,
    borderColor: '#F1F5F9',
  },
  headerCenter: { alignItems: 'center' },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  headerTitle: { color: '#0F172A', fontSize: 18, fontWeight: '900', letterSpacing: -0.5 },
  subtitle: { color: '#64748B', fontSize: 12, textAlign: 'center', fontWeight: '700', marginBottom: 24, marginTop: 16 },
  content: { padding: 20 },
  
  // Grid
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  card: {
    flex: 1, minWidth: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  iconWrap: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  cardTitle: { color: '#64748B', fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5, flex: 1 },
  cardValue: { color: '#0F172A', fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },

  // Large Cards
  largeCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  largeCardTitle: { color: '#0F172A', fontSize: 15, fontWeight: '800', marginBottom: 16 },

  // BMI
  bmiContent: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  gaugeContainer: { position: 'relative', width: 120, height: 120, justifyContent: 'center', alignItems: 'center' },
  gaugeCenter: { position: 'absolute', alignItems: 'center' },
  gaugeValue: { color: '#0F172A', fontSize: 24, fontWeight: '900' },
  gaugeCategory: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', marginTop: 2, letterSpacing: 0.5 },
  bmiTextWrap: { flex: 1, gap: 6 },
  bmiDesc: { color: '#64748B', fontSize: 12, lineHeight: 18, fontWeight: '600' },

  // Activity Bar
  activityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  scoreText: { color: '#10B981', fontSize: 16, fontWeight: '800' },
  activityBarTrack: { height: 10, backgroundColor: '#F1F5F9', borderRadius: 5, overflow: 'hidden', marginBottom: 16 },
  activityBarFill: { height: '100%', borderRadius: 5 },
  activityDesc: { color: '#64748B', fontSize: 12, lineHeight: 18, fontWeight: '600' },

  // Insight Card (Highlighted AI section)
  insightCard: {
    borderRadius: 24,
    padding: 20,
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    marginBottom: 20,
  },
  insightHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  insightTitle: { color: '#059669', fontSize: 15, fontWeight: '800' },
  insightBody: { color: '#047857', fontSize: 13, lineHeight: 20, fontWeight: '600' },
});
