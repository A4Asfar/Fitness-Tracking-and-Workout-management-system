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
            {/* ── BMI Gauge ── */}
            <Animated.View style={[s.gaugeSection, { opacity: gaugeOp, transform: [{ scale: gaugeScale }] }]}>
              <View style={s.gaugeContainer}>
                <Svg width={GAUGE_SIZE} height={GAUGE_SIZE} style={{ transform: [{ rotate: '-90deg' }] }}>
                  {/* Track */}
                  <Circle
                    cx={GAUGE_SIZE / 2}
                    cy={GAUGE_SIZE / 2}
                    r={RADIUS}
                    stroke="#1C1C1C"
                    strokeWidth={STROKE_WIDTH}
                    fill="none"
                  />
                  {/* Filled arc */}
                  <Circle
                    cx={GAUGE_SIZE / 2}
                    cy={GAUGE_SIZE / 2}
                    r={RADIUS}
                    stroke={category?.color || Colors.primary}
                    strokeWidth={STROKE_WIDTH}
                    fill="none"
                    strokeDasharray={`${CIRCUMFERENCE}`}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                  />
                </Svg>
                {/* Center content */}
                <View style={s.gaugeCenter}>
                  <Text style={[s.gaugeBMI, { color: category?.color }]}>
                    {bmi!.toFixed(1)}
                  </Text>
                  <Text style={s.gaugeBMILabel}>BMI</Text>
                </View>
              </View>

              {/* Category badge */}
              <View style={[s.categoryBadge, { borderColor: category?.color + '50', backgroundColor: category?.color + '12' }]}>
                {category && React.createElement(category.icon, { size: 14, color: category.color })}
                <Text style={[s.categoryText, { color: category?.color }]}>{category?.label}</Text>
              </View>
            </Animated.View>

            {/* ── Stats Row ── */}
            <View style={s.statsRow}>
              <StatCard icon={Scale} label="Weight" value={weight.toString()} unit="kg" accent="#FF6B3B" delay={200} />
              <StatCard icon={Ruler} label="Height" value={height.toString()} unit="cm" accent="#00D1FF" delay={300} />
              <StatCard icon={Target} label="Ideal" value={`${idealWeightLow}–${idealWeightHigh}`} unit="kg" accent={Colors.primary} delay={400} />
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
                <View style={s.insightDivider} />
                <View style={s.tipRow}>
                  <View style={[s.tipDot, { backgroundColor: category?.color }]} />
                  <Text style={s.tipText}>{category?.tip}</Text>
                </View>
              </LinearGradient>
            </View>

            {/* ── Body Progress Indicators ── */}
            <View style={s.sectionPad}>
              <View style={s.sectionRow}>
                <Text style={s.sectionTitle}>Body Status</Text>
                <Activity size={14} color="#A855F7" style={{ marginLeft: 6 }} />
                <View style={s.sectionLine} />
              </View>

              <View style={s.progressCard}>
                <ProgressBar
                  label="BMI Position"
                  value={bmi || 0}
                  maxValue={40}
                  color={category?.color || Colors.primary}
                  delay={300}
                />
                <ProgressBar
                  label="Ideal Weight Proximity"
                  value={idealProximity}
                  maxValue={100}
                  color={idealProximity >= 80 ? '#39FF14' : idealProximity >= 50 ? '#FFD700' : '#FF4444'}
                  delay={450}
                />
                <ProgressBar
                  label="Health Score"
                  value={healthScore}
                  maxValue={100}
                  color={healthScore >= 75 ? '#39FF14' : healthScore >= 50 ? '#FFD700' : '#FF4444'}
                  delay={600}
                />
              </View>
            </View>

            {/* ── Weight Delta Card ── */}
            {weightToIdeal !== 0 && (
              <View style={s.sectionPad}>
                <TouchableOpacity
                  style={s.deltaCard}
                  activeOpacity={0.85}
                  onPress={() => router.push('/settings/edit-profile' as any)}
                >
                  <LinearGradient
                    colors={[weightToIdeal > 0 ? '#FFD70015' : '#00D1FF15', 'transparent']}
                    style={StyleSheet.absoluteFill}
                  />
                  <View style={[s.deltaIconWrap, { backgroundColor: weightToIdeal > 0 ? '#FFD70018' : '#00D1FF18' }]}>
                    <TrendingUp size={22} color={weightToIdeal > 0 ? '#FFD700' : '#00D1FF'} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 16 }}>
                    <Text style={s.deltaTitle}>
                      {weightToIdeal > 0 ? `${weightToIdeal} kg above ideal range` : `${Math.abs(weightToIdeal)} kg below ideal range`}
                    </Text>
                    <Text style={s.deltaSub}>
                      {weightToIdeal > 0
                        ? 'A caloric deficit with cardio can help you reach your goal.'
                        : 'A caloric surplus with strength training is recommended.'}
                    </Text>
                  </View>
                  <ChevronRight size={18} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
            )}

            {/* ── BMI Scale Reference ── */}
            <View style={s.sectionPad}>
              <View style={s.sectionRow}>
                <Text style={s.sectionTitle}>BMI Scale Reference</Text>
                <ShieldCheck size={14} color={Colors.textSecondary} style={{ marginLeft: 6 }} />
                <View style={s.sectionLine} />
              </View>

              <View style={s.scaleCard}>
                {[
                  { range: '< 18.5', label: 'Underweight', color: '#00D1FF' },
                  { range: '18.5 – 24.9', label: 'Normal', color: '#39FF14' },
                  { range: '25.0 – 29.9', label: 'Overweight', color: '#FFD700' },
                  { range: '≥ 30.0', label: 'Obese', color: '#FF4444' },
                ].map((item, i) => (
                  <View key={i} style={[s.scaleRow, i < 3 && s.scaleRowBorder]}>
                    <View style={[s.scaleDot, { backgroundColor: item.color }]} />
                    <Text style={s.scaleLabel}>{item.label}</Text>
                    <Text style={s.scaleRange}>{item.range}</Text>
                  </View>
                ))}
              </View>
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

  /* Gauge */
  gaugeSection: {
    alignItems: 'center', paddingTop: 28, paddingBottom: 16,
  },
  gaugeContainer: {
    width: GAUGE_SIZE, height: GAUGE_SIZE,
    justifyContent: 'center', alignItems: 'center',
  },
  gaugeCenter: {
    position: 'absolute', justifyContent: 'center', alignItems: 'center',
  },
  gaugeBMI: {
    fontSize: 42, fontWeight: '900', letterSpacing: -2,
  },
  gaugeBMILabel: {
    fontSize: 12, fontWeight: '800', color: Colors.textSecondary,
    letterSpacing: 2, textTransform: 'uppercase', marginTop: 2,
  },
  categoryBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 18, paddingVertical: 8, borderRadius: 14,
    borderWidth: 1.5, marginTop: 18,
  },
  categoryText: {
    fontSize: 14, fontWeight: '900', letterSpacing: 0.5,
  },

  /* Stats Row */
  statsRow: {
    flexDirection: 'row', gap: 12,
    paddingHorizontal: SPACING.lg, marginTop: 24,
  },
  statCard: {
    flex: 1, backgroundColor: '#161616', borderRadius: 22, padding: 16,
    alignItems: 'center', borderWidth: 1.5, borderColor: '#1F1F1F',
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45, shadowRadius: 16, elevation: 12,
  },
  statIconWrap: {
    width: 38, height: 38, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', marginBottom: 10,
  },
  statLabel: {
    color: Colors.textSecondary, fontSize: 9, fontWeight: '800',
    textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 6,
  },
  statValue: {
    color: Colors.text, fontSize: 18, fontWeight: '900', letterSpacing: -0.5,
  },
  statUnit: {
    fontSize: 10, fontWeight: '800', marginLeft: 3, letterSpacing: 0.5,
  },

  /* Sections */
  sectionPad: { paddingHorizontal: SPACING.lg, marginTop: 28 },
  sectionRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16,
  },
  sectionTitle: {
    color: Colors.text, fontSize: 15, fontWeight: '900',
    letterSpacing: 0.2, textTransform: 'uppercase',
  },
  sectionLine: { flex: 1, height: 1, backgroundColor: '#1C1C1C' },

  /* Insight Card */
  insightCard: {
    borderRadius: 28, padding: 24,
    borderWidth: 1.5, borderColor: '#1E1E1E',
    overflow: 'hidden',
  },
  insightIconWrap: {
    width: 52, height: 52, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center', marginBottom: 18,
    alignSelf: 'center',
  },
  insightText: {
    color: Colors.text, fontSize: 15, fontWeight: '600',
    lineHeight: 24, textAlign: 'center', letterSpacing: 0.1,
  },
  insightDivider: {
    height: 1, backgroundColor: '#222', marginVertical: 18,
  },
  tipRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
  },
  tipDot: {
    width: 8, height: 8, borderRadius: 4, marginTop: 6,
  },
  tipText: {
    flex: 1, color: Colors.textSecondary, fontSize: 13,
    fontWeight: '500', lineHeight: 21,
  },

  /* Progress Bars */
  progressCard: {
    backgroundColor: '#161616', borderRadius: 24, padding: 22,
    borderWidth: 1.5, borderColor: '#1F1F1F', gap: 20,
  },
  progressRow: {},
  progressLabelRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    color: Colors.textSecondary, fontSize: 12, fontWeight: '700',
  },
  progressPct: {
    fontSize: 12, fontWeight: '900',
  },
  progressTrack: {
    height: 8, borderRadius: 4, backgroundColor: '#222', overflow: 'hidden',
  },
  progressFill: {
    height: '100%', borderRadius: 4,
  },

  /* Delta Card */
  deltaCard: {
    backgroundColor: '#161616', borderRadius: 24, padding: 20,
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#1F1F1F', overflow: 'hidden',
  },
  deltaIconWrap: {
    width: 50, height: 50, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
  },
  deltaTitle: {
    color: Colors.text, fontSize: 15, fontWeight: '800', letterSpacing: -0.3,
  },
  deltaSub: {
    color: Colors.textSecondary, fontSize: 12, fontWeight: '500',
    marginTop: 4, lineHeight: 18,
  },

  /* BMI Scale Reference */
  scaleCard: {
    backgroundColor: '#161616', borderRadius: 24, padding: 20,
    borderWidth: 1.5, borderColor: '#1F1F1F',
  },
  scaleRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 14,
  },
  scaleRowBorder: {
    borderBottomWidth: 1, borderBottomColor: '#222',
  },
  scaleDot: {
    width: 10, height: 10, borderRadius: 5, marginRight: 14,
  },
  scaleLabel: {
    flex: 1, color: Colors.text, fontSize: 14, fontWeight: '700',
  },
  scaleRange: {
    color: Colors.textSecondary, fontSize: 13, fontWeight: '600',
  },

  /* Empty State */
  emptyWrap: {
    paddingHorizontal: SPACING.lg, paddingTop: 60,
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
