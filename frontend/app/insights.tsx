import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, Animated, Easing } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Colors, SharedStyles, SPACING } from '@/constants/Theme';
import { 
  ArrowLeft, Activity, Flame, Utensils, MessageCircle, HeartPulse, Zap, Dumbbell
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { safeBack } from '@/utils/navigation';
import { useAuth } from '@/context/AuthContext';
import { getDashboardAnalytics } from '@/services/analyticsService';
import Svg, { Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');

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
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Normal BMI is ~18-25, let's say max gauge is 40
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
    if (category === 'Normal') return '#4CAF50';
    if (category === 'Underweight') return '#00D1FF';
    if (category === 'Overweight') return '#FF9800';
    return '#F44336';
  };

  return (
    <View style={styles.gaugeContainer}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background Circle */}
        <Circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke="#2A2A2A" strokeWidth={strokeWidth}
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
          colors={['#FF6B3B', '#FFD700']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

export default function AnalyticsDashboardScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (user && user.membershipType !== 'premium' && user.membershipType !== 'admin') {
      router.replace('/upgrade');
      return;
    }

    const fetchData = async () => {
      try {
        const stats = await getDashboardAnalytics();
        setData(stats);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true
        }).start();
      } catch (err) {
        console.error('Failed to load analytics', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  if (!user || loading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={SharedStyles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity onPress={() => safeBack()} style={styles.backButton}>
          <ArrowLeft size={22} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Analytics</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView 
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + SPACING.xl }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.subtitle}>Your Complete Fitness Overview</Text>

          {/* ── Stats Grid ── */}
          <View style={styles.grid}>
            {/* Workouts */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={[styles.iconWrap, { backgroundColor: Colors.primary + '15' }]}>
                  <Dumbbell size={20} color={Colors.primary} />
                </View>
                <Text style={styles.cardTitle}>Workouts</Text>
              </View>
              <Counter target={data?.totalWorkouts || 0} />
            </View>

            {/* Calories */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={[styles.iconWrap, { backgroundColor: '#FF6B3B15' }]}>
                  <Flame size={20} color="#FF6B3B" />
                </View>
                <Text style={styles.cardTitle}>Est. Burn</Text>
              </View>
              <Counter target={data?.caloriesBurnedEstimate || 0} suffix=" kcal" />
            </View>

            {/* Meals */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={[styles.iconWrap, { backgroundColor: '#00D1FF15' }]}>
                  <Utensils size={20} color="#00D1FF" />
                </View>
                <Text style={styles.cardTitle}>Meals Logged</Text>
              </View>
              <Counter target={data?.totalMeals || 0} />
            </View>

            {/* Consultations */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={[styles.iconWrap, { backgroundColor: '#A855F715' }]}>
                  <MessageCircle size={20} color="#A855F7" />
                </View>
                <Text style={styles.cardTitle}>Consults</Text>
              </View>
              <Counter target={data?.totalConsultations || 0} />
            </View>
          </View>

          {/* ── BMI & Body Health ── */}
          <View style={styles.largeCard}>
            <LinearGradient colors={['#161616', '#111']} style={StyleSheet.absoluteFill} />
            <Text style={styles.largeCardTitle}>Body Mass Index (BMI)</Text>
            <View style={styles.bmiContent}>
              <CircularGauge value={data?.bmi || 0} category={data?.bmiCategory || 'N/A'} />
              <View style={styles.bmiTextWrap}>
                <Text style={styles.bmiDesc}>
                  Based on your weight of <Text style={{ color: Colors.text, fontWeight: '800' }}>{data?.currentWeight || '--'} kg</Text>.
                </Text>
                <Text style={styles.bmiDesc}>
                  Target: Maintain a normal BMI (18.5 - 24.9) for optimal health.
                </Text>
              </View>
            </View>
          </View>

          {/* ── Activity Score ── */}
          <View style={styles.largeCard}>
            <LinearGradient colors={['#161616', '#111']} style={StyleSheet.absoluteFill} />
            <View style={styles.activityHeader}>
              <Text style={styles.largeCardTitle}>Weekly Activity Score</Text>
              <Text style={styles.scoreText}>{data?.activityScore || 0} / 100</Text>
            </View>
            <ActivityBar score={data?.activityScore || 0} />
            <Text style={styles.activityDesc}>
              Your score is derived from your workout frequency over the last 7 days. Consistency is key!
            </Text>
          </View>

          {/* ── Coach Insight ── */}
          <LinearGradient
            colors={[Colors.primary + '20', Colors.primary + '05']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.insightCard}
          >
            <View style={styles.insightHeader}>
              <Zap size={20} color={Colors.primary} fill={Colors.primary} />
              <Text style={styles.insightTitle}>AI Health Analysis</Text>
            </View>
            <Text style={styles.insightBody}>
              {data?.activityScore >= 80 
                ? "Excellent weekly activity! Your consistency is outstanding. Keep fueling your body with the right macros."
                : data?.activityScore >= 50
                ? "Good effort this week. Try to squeeze in one more session to hit your peak activity score."
                : "Your activity is a bit low this week. Let's get back on track! Remember, a short workout is better than no workout."}
            </Text>
          </LinearGradient>
        </Animated.View>
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
  headerCenter: { alignItems: 'center' },
  backButton: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: Colors.card, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  headerTitle: { color: Colors.text, fontSize: 18, fontWeight: '900', letterSpacing: -0.5 },
  subtitle: { color: Colors.textSecondary, fontSize: 14, textAlign: 'center', fontWeight: '500', marginBottom: 24 },
  content: { paddingHorizontal: SPACING.lg },
  
  // Grid
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 24 },
  card: {
    width: (width - SPACING.lg * 2 - 16) / 2,
    backgroundColor: Colors.card, borderRadius: 24, padding: 16,
    borderWidth: 1, borderColor: Colors.border,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  iconWrap: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  cardTitle: { color: Colors.textSecondary, fontSize: 12, fontWeight: '700', flex: 1 },
  cardValue: { color: Colors.text, fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },

  // Large Cards
  largeCard: {
    borderRadius: 24, padding: 24, marginBottom: 24, overflow: 'hidden',
    borderWidth: 1, borderColor: '#2A2A2A',
  },
  largeCardTitle: { color: Colors.text, fontSize: 16, fontWeight: '800', marginBottom: 20 },

  // BMI
  bmiContent: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  gaugeContainer: { position: 'relative', width: 120, height: 120, justifyContent: 'center', alignItems: 'center' },
  gaugeCenter: { position: 'absolute', alignItems: 'center' },
  gaugeValue: { color: Colors.text, fontSize: 26, fontWeight: '900' },
  gaugeCategory: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', marginTop: 2, letterSpacing: 0.5 },
  bmiTextWrap: { flex: 1, gap: 8 },
  bmiDesc: { color: Colors.textSecondary, fontSize: 13, lineHeight: 20, fontWeight: '500' },

  // Activity Bar
  activityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  scoreText: { color: Colors.primary, fontSize: 18, fontWeight: '900' },
  activityBarTrack: { height: 12, backgroundColor: '#252525', borderRadius: 6, overflow: 'hidden', marginBottom: 16 },
  activityBarFill: { height: '100%', borderRadius: 6 },
  activityDesc: { color: Colors.textSecondary, fontSize: 13, lineHeight: 20, fontWeight: '500' },

  // Insight Card
  insightCard: { borderRadius: 24, padding: 24, borderWidth: 1, borderColor: Colors.primary + '30', marginBottom: 30 },
  insightHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  insightTitle: { color: Colors.text, fontSize: 16, fontWeight: '800' },
  insightBody: { color: Colors.textSecondary, fontSize: 14, lineHeight: 22, fontWeight: '500' },
});
