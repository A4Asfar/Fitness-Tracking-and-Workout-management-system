import React, { useEffect, useRef, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, Dimensions,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { Colors, SharedStyles, SPACING } from '@/constants/Theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { safeBack } from '@/utils/navigation';
import {
  ArrowLeft, Heart, Activity, TrendingUp,
  AlertTriangle, CheckCircle, Info, Scale,
  Ruler, Target, Sparkles, ChevronRight,
  ShieldCheck, Flame,
} from 'lucide-react-native';
import Svg, { Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');
const GAUGE_SIZE = 200;
const STROKE_WIDTH = 14;
const RADIUS = (GAUGE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/* ─── BMI Calculation Logic ─── */
function calcBMI(weightKg: number, heightCm: number) {
  if (!weightKg || !heightCm || heightCm <= 0) return null;
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

function getBMICategory(bmi: number): {
  label: string; color: string; icon: any; insight: string; tip: string;
} {
  if (bmi < 18.5) return {
    label: 'Underweight',
    color: '#00D1FF',
    icon: AlertTriangle,
    insight: 'Your BMI suggests you are underweight. Consider a nutrient-dense diet to support healthy mass gain.',
    tip: 'Focus on protein-rich meals and compound strength exercises to build lean mass safely.',
  };
  if (bmi < 25) return {
    label: 'Normal',
    color: '#39FF14',
    icon: CheckCircle,
    insight: 'You are within a healthy BMI range. Keep up the great work with your current fitness routine!',
    tip: 'Maintain your balanced diet and stay consistent with both strength and cardio training.',
  };
  if (bmi < 30) return {
    label: 'Overweight',
    color: '#FFD700',
    icon: Info,
    insight: 'A slight fat-loss goal is recommended. Small dietary adjustments can make a big difference.',
    tip: 'Try adding 20 minutes of daily walking and reducing processed foods for gradual improvement.',
  };
  return {
    label: 'Obese',
    color: '#FF4444',
    icon: AlertTriangle,
    insight: 'Your BMI indicates obesity. A structured fitness and nutrition plan is strongly recommended.',
    tip: 'Consult a professional and start with low-impact cardio. Small consistent changes lead to big results.',
  };
}

/* ─── Gauge progress (BMI 10–40 mapped to 0–1) ─── */
function bmiToProgress(bmi: number) {
  return Math.max(0, Math.min(1, (bmi - 10) / 30));
}

/* ─── Animated Stat Card ─── */
function StatCard({ icon: Icon, label, value, unit, accent, delay }: {
  icon: any; label: string; value: string; unit: string; accent: string; delay: number;
}) {
  const op = useRef(new Animated.Value(0)).current;
  const ty = useRef(new Animated.Value(20)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(op, { toValue: 1, duration: 500, delay, useNativeDriver: true }),
      Animated.timing(ty, { toValue: 0, duration: 500, delay, useNativeDriver: true }),
    ]).start();
  }, []);
  return (
    <Animated.View style={[s.statCard, { opacity: op, transform: [{ translateY: ty }] }]}>
      <View style={[s.statIconWrap, { backgroundColor: accent + '18' }]}>
        <Icon size={18} color={accent} strokeWidth={2} />
      </View>
      <Text style={s.statLabel}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
        <Text style={s.statValue}>{value}</Text>
        <Text style={[s.statUnit, { color: accent }]}>{unit}</Text>
      </View>
    </Animated.View>
  );
}

/* ─── Progress Bar ─── */
function ProgressBar({ label, value, maxValue, color, delay }: {
  label: string; value: number; maxValue: number; color: string; delay: number;
}) {
  const widthAnim = useRef(new Animated.Value(0)).current;
  const pct = Math.min(1, maxValue > 0 ? value / maxValue : 0);

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: pct,
      duration: 800,
      delay,
      useNativeDriver: false,
    }).start();
  }, [pct]);

  return (
    <View style={s.progressRow}>
      <View style={s.progressLabelRow}>
        <Text style={s.progressLabel}>{label}</Text>
        <Text style={[s.progressPct, { color }]}>{Math.round(pct * 100)}%</Text>
      </View>
      <View style={s.progressTrack}>
        <Animated.View
          style={[
            s.progressFill,
            {
              backgroundColor: color,
              width: widthAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
    </View>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN SCREEN
   ═══════════════════════════════════════════════════════ */
export default function BodyHealthScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const heroOp = useRef(new Animated.Value(0)).current;
  const heroTy = useRef(new Animated.Value(-16)).current;
  const gaugeOp = useRef(new Animated.Value(0)).current;
  const gaugeScale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.stagger(150, [
      Animated.parallel([
        Animated.timing(heroOp, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(heroTy, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(gaugeOp, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.spring(gaugeScale, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const weight = user?.weight || 0;
  const height = user?.height || 0;
  const bmi = useMemo(() => calcBMI(weight, height), [weight, height]);
  const category = useMemo(() => bmi ? getBMICategory(bmi) : null, [bmi]);
  const progress = bmi ? bmiToProgress(bmi) : 0;
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  const hasData = weight > 0 && height > 0;

  /* Derived body composition estimates */
  const idealWeightLow = hasData ? Math.round(18.5 * (height / 100) ** 2) : 0;
  const idealWeightHigh = hasData ? Math.round(24.9 * (height / 100) ** 2) : 0;
  const idealCenter = (idealWeightLow + idealWeightHigh) / 2;
  const weightToIdeal = hasData && bmi
    ? (weight > idealWeightHigh
        ? Math.round(weight - idealWeightHigh)
        : weight < idealWeightLow
          ? Math.round(weight - idealWeightLow)
          : 0)
    : 0;

  /* Health Score: 100 at ideal BMI center (21.7), decays smoothly with distance */
  const healthScore = useMemo(() => {
    if (!bmi) return 0;
    const idealBMI = 21.7;
    const distance = Math.abs(bmi - idealBMI);
    // Gaussian decay: score = 100 * e^(-0.035 * distance^2)
    return Math.round(100 * Math.exp(-0.035 * distance * distance));
  }, [bmi]);

  /* Ideal Weight Proximity: how close the user is to the ideal range (0-100%) */
  const idealProximity = useMemo(() => {
    if (!hasData) return 0;
    if (weight >= idealWeightLow && weight <= idealWeightHigh) return 100;
    const deviation = weight < idealWeightLow
      ? idealWeightLow - weight
      : weight - idealWeightHigh;
    const maxDeviation = idealCenter; // reasonable max deviation
    return Math.max(0, Math.round(100 * (1 - deviation / maxDeviation)));
  }, [weight, idealWeightLow, idealWeightHigh, idealCenter, hasData]);

  return (
    <View style={SharedStyles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* ── Header ── */}
      <View style={[s.header, { paddingTop: insets.top + SPACING.sm }]}>
        <LinearGradient
          colors={['#A855F720', 'transparent']}
          style={StyleSheet.absoluteFill}
        />
        <TouchableOpacity onPress={() => safeBack('/(tabs)/')} style={s.backBtn}>
          <ArrowLeft size={22} color={Colors.text} />
        </TouchableOpacity>
        <Animated.View style={{ opacity: heroOp, transform: [{ translateY: heroTy }] }}>
          <Text style={s.headerTitle}>Body Health Analyzer</Text>
        </Animated.View>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
      >
        {hasData ? (
          <>
            {/* ── Top Stats Hub (Horizontal Scroll) ── */}
            <View style={s.topHub}>
               <LinearGradient colors={['#A855F730', 'transparent']} style={StyleSheet.absoluteFill} />
               <ScrollView 
                 horizontal 
                 showsHorizontalScrollIndicator={false}
                 contentContainerStyle={s.hScrollContent}
                 snapToInterval={width * 0.75 + 16}
                 decelerationRate="fast"
               >
                 <View style={s.hStatCard}>
                   <Text style={s.hStatValue}>{weight} lbs</Text>
                   <Text style={s.hStatLabel}>Weight</Text>
                   <Text style={s.hStatSub}>Target: 160 lbs</Text>
                 </View>
                 <View style={s.hStatCard}>
                   <Text style={s.hStatValue}>5'10"</Text>
                   <Text style={s.hStatLabel}>Height</Text>
                   <Text style={s.hStatSub}>BMI: {bmi?.toFixed(1)}</Text>
                 </View>
                 <View style={s.hStatCard}>
                   <Text style={s.hStatValue}>28 yrs</Text>
                   <Text style={s.hStatLabel}>Age</Text>
                   <Text style={s.hStatSub}>Level: High</Text>
                 </View>
               </ScrollView>
            </View>

            {/* ── Your Goals ── */}
            <View style={s.sectionPad}>
               <Text style={s.sectionTitleLarge}>Your Goals</Text>
               <View style={s.goalCard}>
                  <View style={s.goalHeader}>
                    <Text style={s.goalTitle}>Lose Weight</Text>
                    <Text style={s.goalStatus}>3.5/5 lbs</Text>
                  </View>
                  <View style={s.goalTrack}>
                    <LinearGradient 
                      colors={[Colors.primary, Colors.secondary]} 
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                      style={[s.goalFill, { width: '70%' }]} 
                    />
                  </View>
               </View>

               <View style={s.goalCard}>
                  <View style={s.goalHeader}>
                    <Text style={s.goalTitle}>Body Fat</Text>
                    <Text style={s.goalStatus}>12/15 %</Text>
                  </View>
                  <View style={s.goalTrack}>
                    <LinearGradient 
                      colors={['#00D1FF', '#0095FF']} 
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                      style={[s.goalFill, { width: '80%' }]} 
                    />
                  </View>
               </View>
            </View>

            {/* ── Health Insight Card ── */}
            <View style={s.sectionPad}>
              <View style={s.sectionRow}>
                <Text style={s.sectionTitle}>Health Insight</Text>
                <Sparkles size={14} color={category?.color} style={{ marginLeft: 6 }} />
                <View style={s.sectionLine} />
              </View>

              <LinearGradient
                colors={[(category?.color || Colors.primary) + '14', (category?.color || Colors.primary) + '04']}
                style={s.insightCard}
              >
                <View style={[s.insightIconWrap, { backgroundColor: (category?.color || Colors.primary) + '1A' }]}>
                  <Heart size={22} color={category?.color || Colors.primary} strokeWidth={1.8} />
                </View>
                <Text style={s.insightText}>{category?.insight}</Text>
              </LinearGradient>
            </View>
          </>
        ) : (
          /* ── No Data State ── */
          <View style={s.emptyWrap}>
            <LinearGradient colors={['#A855F718', '#A855F706']} style={s.emptyCard}>
              <View style={s.emptyIconWrap}>
                <Scale size={40} color="#A855F7" strokeWidth={1.4} />
              </View>
              <Text style={s.emptyTitle}>Set Your Body Stats</Text>
              <Text style={s.emptySub}>
                Add your weight and height in your profile to unlock your Body Health Analysis.
              </Text>
              <TouchableOpacity
                style={s.emptyBtn}
                onPress={() => router.push('/settings/edit-profile' as any)}
              >
                <LinearGradient
                  colors={[Colors.primary, '#9FE800']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={s.emptyBtnGrad}
                >
                  <Text style={s.emptyBtnText}>UPDATE PROFILE</Text>
                  <ChevronRight size={18} color="#000" strokeWidth={2.5} />
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

/* ═══════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════ */
const s = StyleSheet.create({
  /* Top Stats Hub */
  topHub: {
    height: 180, justifyContent: 'center', marginBottom: 32,
    backgroundColor: '#0F0F1A', overflow: 'hidden',
  },
  hScrollContent: { paddingHorizontal: 24, alignItems: 'center', gap: 16 },
  hStatCard: {
    width: width * 0.75, height: 130, backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 28, padding: 24, justifyContent: 'center',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.08)',
  },
  hStatValue: { color: '#FFF', fontSize: 32, fontWeight: '900', letterSpacing: -1 },
  hStatLabel: { color: Colors.textSecondary, fontSize: 14, fontWeight: '700', marginTop: 4 },
  hStatSub: { color: Colors.primary, fontSize: 11, fontWeight: '800', marginTop: 8, textTransform: 'uppercase', letterSpacing: 0.5 },

  /* Goals */
  sectionTitleLarge: { color: '#FFF', fontSize: 24, fontWeight: '900', marginBottom: 24, letterSpacing: -0.5 },
  goalCard: {
    backgroundColor: '#161616', borderRadius: 24, padding: 24,
    borderWidth: 1.5, borderColor: '#222', marginBottom: 16,
  },
  goalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  goalTitle: { color: '#FFF', fontSize: 17, fontWeight: '800' },
  goalStatus: { color: Colors.textSecondary, fontSize: 13, fontWeight: '700' },
  goalTrack: { height: 10, backgroundColor: '#222', borderRadius: 5, overflow: 'hidden' },
  goalFill: { height: '100%', borderRadius: 5 },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    overflow: 'hidden',
  },
  backBtn: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: Colors.card,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  headerTitle: {
    color: Colors.text, fontSize: 20, fontWeight: '900', letterSpacing: -0.5,
  },

  /* Sections */
  sectionPad: { paddingHorizontal: SPACING.lg, marginBottom: 32 },
  sectionRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16,
  },
  sectionTitle: {
    color: Colors.text, fontSize: 13, fontWeight: '900',
    letterSpacing: 1.2, textTransform: 'uppercase', opacity: 0.8
  },
  sectionLine: { flex: 1, height: 1, backgroundColor: '#1C1C1C' },

  /* Insight Card */
  insightCard: {
    borderRadius: 28, padding: 24,
    borderWidth: 1.5, borderColor: '#1E1E1E',
    overflow: 'hidden',
    alignItems: 'center',
  },
  insightIconWrap: {
    width: 52, height: 52, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center', marginBottom: 18,
  },
  insightText: {
    color: Colors.text, fontSize: 15, fontWeight: '600',
    lineHeight: 24, textAlign: 'center', letterSpacing: 0.1,
  },

  /* Empty State */
  emptyWrap: {
    paddingHorizontal: SPACING.lg, paddingTop: 40,
  },
  emptyCard: {
    borderRadius: 32, padding: 36, alignItems: 'center',
    borderWidth: 1.5, borderColor: '#A855F730',
  },
  emptyIconWrap: {
    width: 90, height: 90, borderRadius: 30,
    backgroundColor: '#A855F718', justifyContent: 'center', alignItems: 'center',
    marginBottom: 24, borderWidth: 1.5, borderColor: '#A855F730',
  },
  emptyTitle: {
    color: Colors.text, fontSize: 22, fontWeight: '900',
    letterSpacing: -0.5, marginBottom: 10,
  },
  emptySub: {
    color: Colors.textSecondary, fontSize: 14, fontWeight: '500',
    textAlign: 'center', lineHeight: 22, marginBottom: 28,
  },
  emptyBtn: { width: '100%', borderRadius: 20, overflow: 'hidden' },
  emptyBtnGrad: {
    height: 58, borderRadius: 20, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  emptyBtnText: {
    color: '#000', fontSize: 15, fontWeight: '900', letterSpacing: 0.8,
  },
});
