import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Text, TouchableOpacity, Animated, Easing, useWindowDimensions } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { MealService } from '@/services/mealService';
import { generateIntelligence, IntelligenceResult } from '@/utils/intelligenceEngine';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Activity, Flame, Dumbbell, Sparkles, Target, HeartPulse, Zap, AlertTriangle, TrendingUp, TrendingDown, Crown
} from 'lucide-react-native';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import SkeletonCard from '@/components/SkeletonCard';
import { SharedStyles } from '@/constants/Theme';
import Svg, { Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function FitnessGauge({ score, grade }: { score: number; grade: string }) {
  const size = 160;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: score / 100,
      duration: 1500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
      delay: 300
    }).start();
  }, [score]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0]
  });

  const getColor = () => {
    if (score >= 90) return '#10B981'; // Green
    if (score >= 80) return '#38BDF8'; // Blue
    if (score >= 65) return '#F59E0B'; // Orange
    return '#EF4444'; // Red
  };

  return (
    <View style={{ position: 'relative', width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle cx={size/2} cy={size/2} r={radius} stroke="#1E293B" strokeWidth={strokeWidth} fill="none" />
        <AnimatedCircle
          cx={size/2} cy={size/2} r={radius}
          stroke={getColor()} strokeWidth={strokeWidth}
          fill="none" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
          strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`}
        />
      </Svg>
      <View style={{ position: 'absolute', alignItems: 'center' }}>
        <Text style={{ color: '#F8FAFC', fontSize: 36, fontWeight: '900' }}>{score}</Text>
        <Text style={{ color: getColor(), fontSize: 16, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 }}>{grade}</Text>
      </View>
    </View>
  );
}

function IconSelector({ name, color, size }: { name: string; color: string; size: number }) {
  if (name === 'Flame') return <Flame color={color} size={size} />;
  if (name === 'Dumbbell') return <Dumbbell color={color} size={size} />;
  if (name === 'Target') return <Target color={color} size={size} />;
  if (name === 'Activity') return <Activity color={color} size={size} />;
  if (name === 'HeartPulse') return <HeartPulse color={color} size={size} />;
  return <Crown color={color} size={size} />;
}

import { DietPlanService } from '@/services/dietPlanService';

export default function IntelligenceDashboardScreen() {
  const { width } = useWindowDimensions();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<IntelligenceResult | null>(null);
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setError(null);
    try {
      const [analyticsRes, mealsRes, dietPlan] = await Promise.all([
        api.get('/workouts/analytics'),
        MealService.getMeals(),
        DietPlanService.getMyDietPlan()
      ]);
      
      const intelligence = generateIntelligence({
        user,
        analytics: analyticsRes.data,
        meals: mealsRes,
        dietPlan
      });
      
      setData(intelligence);
    } catch (e: any) {
      if (__DEV__) console.log('Intelligence error:', e.message);
      setError(e.message || 'Failed to sync intelligence data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading && !refreshing) {
    return (
      <View style={[s.container, { paddingTop: insets.top }]}>
        <View style={{ padding: 24 }}><SkeletonCard /><SkeletonCard /><SkeletonCard /></View>
      </View>
    );
  }

  if (error && !loading) {
    return (
      <View style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#EF4444', fontSize: 16 }}>{error}</Text>
        <TouchableOpacity onPress={fetchData} style={{ marginTop: 20, padding: 12, backgroundColor: '#38BDF8', borderRadius: 8 }}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!data) return null;

  const isWide = width > 768;

  return (
    <View style={s.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100, maxWidth: 1000, width: '100%', alignSelf: 'center' }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#38BDF8" />}
      >
        {/* HERO SECTION */}
        <LinearGradient colors={['#1E293B', '#0F172A']} style={[s.heroSection, { paddingTop: insets.top + 16 }]}>
          <Text style={s.headerSubtitle}>Fitness Intelligence</Text>
          <Text style={s.headerTitle}>Engine</Text>
          
          <View style={[s.gaugeWrapper, isWide && { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }]}>
            <View style={{ alignItems: 'center', marginBottom: isWide ? 0 : 24 }}>
              <FitnessGauge score={data.fitnessScore} grade={data.healthGrade} />
              <View style={[s.scoreBadge, { backgroundColor: `${data.netCaloriesColor}20` }]}>
                <Text style={[s.scoreLabel, { color: data.netCaloriesColor }]}>{data.scoreLabel} Overall</Text>
              </View>
            </View>

            <View style={[s.summaryGrid, isWide && { flex: 1, marginLeft: 40 }]}>
              <View style={s.sumCard}>
                <Text style={s.sumCardLab}>Net Calories</Text>
                <Text style={[s.sumCardVal, { color: data.netCaloriesColor }]}>
                  {data.netCalories > 0 ? '+' : ''}{data.netCalories}
                </Text>
                <Text style={[s.sumCardSub, { color: data.netCaloriesColor }]}>{data.netCaloriesLabel}</Text>
              </View>
              <View style={s.sumCard}>
                <Text style={s.sumCardLab}>Weekly Effort</Text>
                <Text style={s.sumCardVal}>{data.comparison.workoutEffort}%</Text>
                <Text style={s.sumCardSub}>vs Last Week</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        <View style={s.content}>
          {/* AI COACH INSIGHT */}
          {(data.goalInsight || data.aiCoachMessages.length > 0) && (
            <View style={[SharedStyles.card, s.aiCard]}>
              <LinearGradient colors={['rgba(16,185,129,0.15)', 'rgba(15,23,42,0)']} style={s.aiGrad}>
                <View style={s.aiHeader}>
                  <Sparkles size={20} color="#10B981" fill="#10B981" />
                  <Text style={s.aiTitle}>AI Coach Assessment</Text>
                </View>
                {data.goalInsight ? (
                  <View style={s.warningRow}>
                    <AlertTriangle size={18} color="#F59E0B" />
                    <Text style={s.warningText}>{data.goalInsight}</Text>
                  </View>
                ) : null}
                {data.aiCoachMessages.map((msg, i) => (
                  <Text key={i} style={s.aiText}>• {msg}</Text>
                ))}
              </LinearGradient>
            </View>
          )}

          {/* NUTRITION VS WORKOUT COMPARISON */}
          {data.dietPlanComparison && (
            <>
              <Text style={s.sectionTitle}>Diet Plan Adherence</Text>
              <View style={[SharedStyles.card, { padding: 20, marginBottom: 24 }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
                  <Text style={{ color: '#F8FAFC', fontSize: 16, fontWeight: '800' }}>Completion: {data.dietPlanComparison.completionPct}%</Text>
                  <Text style={{ color: data.dietPlanComparison.statusLabel === 'On Track' ? '#10B981' : '#F59E0B', fontWeight: '800' }}>{data.dietPlanComparison.statusLabel}</Text>
                </View>
                
                <View style={{ gap: 12 }}>
                  <View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700' }}>Calories</Text>
                      <Text style={{ color: '#F8FAFC', fontSize: 12, fontWeight: '800' }}>{data.dietPlanComparison.caloriesConsumed} / {data.dietPlanComparison.caloriesPlanned}</Text>
                    </View>
                    <View style={s.compBarBg}>
                      <View style={[s.compBarFill, { width: `${Math.min((data.dietPlanComparison.caloriesConsumed / (data.dietPlanComparison.caloriesPlanned || 1)) * 100, 100)}%`, backgroundColor: '#F59E0B' }]} />
                    </View>
                  </View>

                  <View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700' }}>Protein</Text>
                      <Text style={{ color: '#F8FAFC', fontSize: 12, fontWeight: '800' }}>{data.dietPlanComparison.proteinConsumed}g / {data.dietPlanComparison.proteinPlanned}g</Text>
                    </View>
                    <View style={s.compBarBg}>
                      <View style={[s.compBarFill, { width: `${Math.min((data.dietPlanComparison.proteinConsumed / (data.dietPlanComparison.proteinPlanned || 1)) * 100, 100)}%`, backgroundColor: '#10B981' }]} />
                    </View>
                  </View>
                </View>
              </View>
            </>
          )}

          <Text style={s.sectionTitle}>Intelligence Analysis</Text>
          <View style={[isWide && { flexDirection: 'row', gap: 16 }]}>
            <View style={[SharedStyles.card, s.compCard, isWide && { flex: 1 }]}>
              <View style={s.compHeader}>
                <Dumbbell size={20} color="#38BDF8" />
                <Text style={s.compTitle}>Workout Effort</Text>
              </View>
              <View style={s.compBarBg}>
                <View style={[s.compBarFill, { width: `${data.comparison.workoutEffort}%`, backgroundColor: '#38BDF8' }]} />
              </View>
              <Text style={s.compVal}>{data.comparison.workoutEffort}% <Text style={s.compSub}>Capacity</Text></Text>
            </View>
            
            <View style={[SharedStyles.card, s.compCard, isWide && { flex: 1 }]}>
              <View style={s.compHeader}>
                <Flame size={20} color="#F59E0B" />
                <Text style={s.compTitle}>Nutrition Quality</Text>
              </View>
              <View style={s.compBarBg}>
                <View style={[s.compBarFill, { width: `${data.comparison.nutritionQuality}%`, backgroundColor: '#F59E0B' }]} />
              </View>
              <Text style={s.compVal}>{data.comparison.nutritionQuality}% <Text style={s.compSub}>Optimization</Text></Text>
            </View>
          </View>

          {/* TRENDS CHART */}
          <Text style={s.sectionTitle}>Caloric Trend</Text>
          <View style={[SharedStyles.card, s.chartCard]}>
            <View style={s.chartStatsRow}>
              <View style={s.chartLegend}>
                <View style={s.legendItem}>
                  <View style={[s.legendDot, { backgroundColor: '#EF4444' }]} />
                  <Text style={s.legendText}>Consumed</Text>
                </View>
                <View style={s.legendItem}>
                  <View style={[s.legendDot, { backgroundColor: '#38BDF8' }]} />
                  <Text style={s.legendText}>Burned</Text>
                </View>
              </View>
            </View>
            <View style={s.barsContainer}>
              {data.weeklyTrends.labels.map((label, idx) => {
                const consumed = data.weeklyTrends.caloriesConsumed[idx] || 0;
                const burned = data.weeklyTrends.caloriesBurned[idx] || 0;
                
                // For a dynamic look, we'll size everything relative to 3500 max cap
                const cHeight = Math.min((consumed / 3500) * 100, 100);
                const bHeight = Math.min((burned / 1000) * 100, 100);
                
                return (
                  <View key={idx} style={s.barColumn}>
                    <View style={s.multiBarWrap}>
                      <View style={[s.barTrack, { marginRight: 4 }]}>
                        <View style={[s.barFill, { height: `${Math.max(cHeight, 5)}%`, backgroundColor: '#EF4444' }]} />
                      </View>
                      <View style={s.barTrack}>
                        <View style={[s.barFill, { height: `${Math.max(bHeight, 5)}%`, backgroundColor: '#38BDF8' }]} />
                      </View>
                    </View>
                    <Text style={s.barLabel}>{label}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* ACHIEVEMENTS */}
          <Text style={s.sectionTitle}>Smart Achievements</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.achieveScroll}>
            {data.achievements.map((ach) => (
              <View key={ach.id} style={[SharedStyles.card, s.achieveCard, !ach.unlocked && s.achieveLocked]}>
                <View style={[s.achieveIconBox, { backgroundColor: ach.unlocked ? 'rgba(56,189,248,0.15)' : '#334155' }]}>
                  <IconSelector name={ach.icon} color={ach.unlocked ? '#38BDF8' : '#64748B'} size={28} />
                </View>
                <Text style={s.achieveTitle}>{ach.title}</Text>
                {!ach.unlocked && (
                  <View style={s.lockOverlay}>
                    <Text style={s.lockText}>LOCKED</Text>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>

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
  
  gaugeWrapper: { alignItems: 'center' },
  scoreBadge: { marginTop: -16, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 100, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  scoreLabel: { fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  
  summaryGrid: { flexDirection: 'row', gap: 16, marginTop: 24, width: '100%' },
  sumCard: { flex: 1, backgroundColor: 'rgba(30,41,59,0.5)', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#334155' },
  sumCardLab: { color: '#94A3B8', fontSize: 12, fontWeight: '700', marginBottom: 4 },
  sumCardVal: { color: '#F8FAFC', fontSize: 22, fontWeight: '900', marginBottom: 2 },
  sumCardSub: { color: '#64748B', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },

  content: { padding: 24 },

  aiCard: { overflow: 'hidden', marginBottom: 24, borderColor: '#10B98130' },
  aiGrad: { padding: 20 },
  aiHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  aiTitle: { color: '#10B981', fontSize: 15, fontWeight: '900', marginLeft: 8, letterSpacing: 0.5 },
  warningRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(245,158,11,0.1)', padding: 12, borderRadius: 12, marginBottom: 12 },
  warningText: { color: '#F59E0B', fontSize: 13, fontWeight: '800', marginLeft: 8, flex: 1 },
  aiText: { color: '#94A3B8', fontSize: 14, lineHeight: 22, marginBottom: 6, fontWeight: '600' },

  sectionTitle: { color: '#F8FAFC', fontSize: 20, fontWeight: '900', letterSpacing: -0.5, marginBottom: 16 },

  compCard: { padding: 20, marginBottom: 16 },
  compHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  compTitle: { color: '#F8FAFC', fontSize: 15, fontWeight: '800' },
  compBarBg: { height: 8, backgroundColor: '#0F172A', borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  compBarFill: { height: '100%', borderRadius: 4 },
  compVal: { color: '#F8FAFC', fontSize: 20, fontWeight: '900' },
  compSub: { color: '#64748B', fontSize: 12, fontWeight: '700' },

  chartCard: { padding: 24, marginBottom: 32 },
  chartStatsRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 24 },
  chartLegend: { flexDirection: 'row', gap: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: '#94A3B8', fontSize: 12, fontWeight: '700' },
  
  barsContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 140 },
  barColumn: { alignItems: 'center', flex: 1, minWidth: 0 },
  multiBarWrap: { flexDirection: 'row', height: 110, alignItems: 'flex-end', marginBottom: 8 },
  barTrack: { width: 8, height: '100%', backgroundColor: '#0F172A', borderRadius: 4, justifyContent: 'flex-end' },
  barFill: { width: '100%', borderRadius: 4 },
  barLabel: { color: '#64748B', fontSize: 11, fontWeight: '800' },

  achieveScroll: { gap: 16, marginBottom: 32, paddingRight: 24 },
  achieveCard: { width: 130, padding: 20, alignItems: 'center' },
  achieveLocked: { opacity: 0.5 },
  achieveIconBox: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  achieveTitle: { color: '#F8FAFC', fontSize: 13, fontWeight: '900', textAlign: 'center', lineHeight: 18 },
  lockOverlay: { position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(15,23,42,0.8)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  lockText: { color: '#CBD5E1', fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
});
