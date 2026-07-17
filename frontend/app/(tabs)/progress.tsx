import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Text, TouchableOpacity, Animated, Easing, useWindowDimensions } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { MealService } from '@/services/mealService';
import { generateIntelligence, IntelligenceResult } from '@/utils/intelligenceEngine';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Activity, Flame, Dumbbell, Sparkles, Target, HeartPulse, Zap, AlertTriangle, TrendingUp, TrendingDown, Crown, Calendar, CheckCircle2, AlertCircle, ArrowUpRight, ArrowDownRight, Scale
} from 'lucide-react-native';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import SkeletonCard from '@/components/SkeletonCard';
import { SharedStyles } from '@/constants/Theme';
import Svg, { Circle } from 'react-native-svg';
import { DietPlanService } from '@/services/dietPlanService';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function FitnessGauge({ score, grade, status }: { score: number; grade: string; status: string }) {
  const size = 180;
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
    if (score >= 90) return '#10B981'; 
    if (score >= 80) return '#38BDF8'; 
    if (score >= 65) return '#F59E0B'; 
    return '#EF4444'; 
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
        <Text style={{ color: '#F8FAFC', fontSize: 42, fontWeight: '900', letterSpacing: -1 }}>{score}</Text>
        <Text style={{ color: getColor(), fontSize: 12, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 }}>{status}</Text>
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
          <Text style={s.headerSubtitle}>Complete Fitness</Text>
          <Text style={s.headerTitle}>Intelligence</Text>
          
          <View style={[s.gaugeWrapper, isWide && { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }]}>
            <View style={{ alignItems: 'center', marginBottom: isWide ? 0 : 24 }}>
              <FitnessGauge score={data.fitnessScore} grade={data.healthGrade} status={data.aiStatus} />
            </View>

            <View style={[s.summaryGrid, isWide && { flex: 1, marginLeft: 40 }]}>
              <View style={s.sumCard}>
                <Text style={s.sumCardLab}>Discipline</Text>
                <Text style={s.sumCardVal}>{data.consistency.overallDiscipline}%</Text>
                <Text style={s.sumCardSub}>Overall Score</Text>
              </View>
              <View style={s.sumCard}>
                <Text style={s.sumCardLab}>Body Progress</Text>
                <Text style={s.sumCardVal}>{data.bodyProgressScore}%</Text>
                <Text style={s.sumCardSub}>On Track</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        <View style={s.content}>
          {/* AI COACH INSIGHT */}
          <View style={[SharedStyles.card, s.aiCard]}>
            <LinearGradient colors={['rgba(56,189,248,0.15)', 'rgba(15,23,42,0)']} style={s.aiGrad}>
              <View style={s.aiHeader}>
                <Sparkles size={20} color="#38BDF8" fill="#38BDF8" />
                <Text style={s.aiTitle}>AI Coach Assessment</Text>
              </View>
              {data.aiCoachMessages.map((msg, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 }}>
                   <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#38BDF8', marginTop: 8, marginRight: 8 }} />
                   <Text style={s.aiText}>{msg}</Text>
                </View>
              ))}
            </LinearGradient>
          </View>

          {/* GOAL ACHIEVEMENT WIDGET */}
          <Text style={s.sectionTitle}>Goal Achievement</Text>
          <View style={[SharedStyles.card, { padding: 24, marginBottom: 24 }]}>
             <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                   <View style={{ backgroundColor: 'rgba(245,158,11,0.1)', padding: 10, borderRadius: 12 }}>
                      <Target size={24} color="#F59E0B" />
                   </View>
                   <View>
                      <Text style={{ color: '#F8FAFC', fontSize: 18, fontWeight: '900' }}>{data.goalAchievement.currentGoal}</Text>
                      <Text style={{ color: '#94A3B8', fontSize: 13, fontWeight: '600' }}>Estimated: {data.goalAchievement.estimatedCompletion}</Text>
                   </View>
                </View>
                <Text style={{ color: '#F59E0B', fontSize: 24, fontWeight: '900' }}>{data.goalAchievement.progressPct}%</Text>
             </View>
             
             <View style={s.compBarBg}>
               <View style={[s.compBarFill, { width: `${data.goalAchievement.progressPct}%`, backgroundColor: '#F59E0B' }]} />
             </View>
             
             <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}>
                <View style={{ alignItems: 'center', flex: 1 }}>
                   <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700' }}>Remaining</Text>
                   <Text style={{ color: '#F8FAFC', fontSize: 16, fontWeight: '900', marginTop: 4 }}>{data.goalAchievement.remaining}</Text>
                </View>
                <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.05)' }} />
                <View style={{ alignItems: 'center', flex: 1 }}>
                   <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700' }}>Strength Trend</Text>
                   <Text style={{ color: data.goalAchievement.strengthTrend === 'Upward' ? '#10B981' : '#38BDF8', fontSize: 16, fontWeight: '900', marginTop: 4 }}>{data.goalAchievement.strengthTrend}</Text>
                </View>
                <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.05)' }} />
                <View style={{ alignItems: 'center', flex: 1 }}>
                   <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700' }}>Nutrition Trend</Text>
                   <Text style={{ color: data.goalAchievement.nutritionTrend === 'Optimized' ? '#10B981' : '#F59E0B', fontSize: 16, fontWeight: '900', marginTop: 4 }}>{data.goalAchievement.nutritionTrend}</Text>
                </View>
             </View>
          </View>

          {/* WEEKLY HEALTH REPORT & MONTHLY SUMMARY */}
          <View style={[isWide && { flexDirection: 'row', gap: 24 }]}>
             <View style={[isWide && { flex: 1 }]}>
               <Text style={s.sectionTitle}>Weekly Health Report</Text>
               <View style={[SharedStyles.card, { padding: 24, marginBottom: 24 }]}>
                  {data.weeklyReport.achievements.length > 0 && (
                     <View style={{ marginBottom: 16 }}>
                        <Text style={{ color: '#10B981', fontSize: 14, fontWeight: '800', marginBottom: 8, textTransform: 'uppercase' }}>Achievements</Text>
                        {data.weeklyReport.achievements.map((ach, i) => <Text key={i} style={{ color: '#F8FAFC', fontSize: 14, marginBottom: 4 }}>• {ach}</Text>)}
                     </View>
                  )}
                  {data.weeklyReport.warnings.length > 0 && (
                     <View style={{ marginBottom: 16 }}>
                        <Text style={{ color: '#EF4444', fontSize: 14, fontWeight: '800', marginBottom: 8, textTransform: 'uppercase' }}>Warnings</Text>
                        {data.weeklyReport.warnings.map((warn, i) => <Text key={i} style={{ color: '#F8FAFC', fontSize: 14, marginBottom: 4 }}>• {warn}</Text>)}
                     </View>
                  )}
                  <View style={{ flexDirection: 'row', gap: 16, marginTop: 8, paddingTop: 16, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}>
                     <View style={{ flex: 1 }}>
                        <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700', marginBottom: 4 }}>Top Strength</Text>
                        <Text style={{ color: '#F8FAFC', fontSize: 14, fontWeight: '800' }}>{data.weeklyReport.strengths[0] || 'Consistency'}</Text>
                     </View>
                     <View style={{ flex: 1 }}>
                        <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700', marginBottom: 4 }}>Weakness to Fix</Text>
                        <Text style={{ color: '#F8FAFC', fontSize: 14, fontWeight: '800' }}>{data.weeklyReport.weaknesses[0] || 'None Detected'}</Text>
                     </View>
                  </View>
               </View>
             </View>
             
             <View style={[isWide && { flex: 1 }]}>
               <Text style={s.sectionTitle}>Monthly Comparison</Text>
               <View style={[SharedStyles.card, { padding: 24, marginBottom: 24, justifyContent: 'center' }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                     <View style={{ alignItems: 'center' }}>
                        <Text style={{ color: '#94A3B8', fontSize: 13, fontWeight: '700', marginBottom: 8 }}>Last Month</Text>
                        <Text style={{ color: '#64748B', fontSize: 32, fontWeight: '900' }}>{data.monthlySummary.lastMonthScore}</Text>
                     </View>
                     <View style={{ alignItems: 'center', paddingHorizontal: 16 }}>
                        {data.monthlySummary.improvement >= 0 ? (
                           <ArrowUpRight size={32} color="#10B981" />
                        ) : (
                           <ArrowDownRight size={32} color="#EF4444" />
                        )}
                        <Text style={{ color: data.monthlySummary.improvement >= 0 ? '#10B981' : '#EF4444', fontSize: 16, fontWeight: '900', marginTop: 4 }}>
                           {data.monthlySummary.improvement >= 0 ? '+' : ''}{data.monthlySummary.improvement} pts
                        </Text>
                     </View>
                     <View style={{ alignItems: 'center' }}>
                        <Text style={{ color: '#94A3B8', fontSize: 13, fontWeight: '700', marginBottom: 8 }}>This Month</Text>
                        <Text style={{ color: '#F8FAFC', fontSize: 32, fontWeight: '900' }}>{data.monthlySummary.thisMonthScore}</Text>
                     </View>
                  </View>
                  <Text style={{ color: '#CBD5E1', fontSize: 14, textAlign: 'center', marginTop: 24, fontWeight: '600' }}>
                     {data.monthlySummary.summaryText}
                  </Text>
               </View>
             </View>
          </View>

          {/* THE 6 PILLARS OF INTELLIGENCE ANALYSIS */}
          <Text style={s.sectionTitle}>The 6 Pillars of Intelligence</Text>
          <View style={[isWide && { flexDirection: 'row', gap: 16, flexWrap: 'wrap' }]}>
            <View style={[SharedStyles.card, s.compCard, isWide && { flex: 1, minWidth: '45%' }]}>
              <View style={s.compHeader}>
                <Dumbbell size={20} color="#38BDF8" />
                <Text style={s.compTitle}>Workout Performance</Text>
                <Text style={{ color: '#94A3B8', fontSize: 12, marginLeft: 'auto' }}>30% Weight</Text>
              </View>
              <View style={s.compBarBg}>
                <View style={[s.compBarFill, { width: `${data.workoutScore}%`, backgroundColor: '#38BDF8' }]} />
              </View>
              <Text style={s.compVal}>{data.workoutScore} <Text style={s.compSub}>/ 100</Text></Text>
            </View>
            
            <View style={[SharedStyles.card, s.compCard, isWide && { flex: 1, minWidth: '45%' }]}>
              <View style={s.compHeader}>
                <Flame size={20} color="#F59E0B" />
                <Text style={s.compTitle}>Nutrition Quality</Text>
                <Text style={{ color: '#94A3B8', fontSize: 12, marginLeft: 'auto' }}>20% Weight</Text>
              </View>
              <View style={s.compBarBg}>
                <View style={[s.compBarFill, { width: `${data.nutritionScore}%`, backgroundColor: '#F59E0B' }]} />
              </View>
              <Text style={s.compVal}>{data.nutritionScore} <Text style={s.compSub}>/ 100</Text></Text>
            </View>

            <View style={[SharedStyles.card, s.compCard, isWide && { flex: 1, minWidth: '45%' }]}>
              <View style={s.compHeader}>
                <Target size={20} color="#10B981" />
                <Text style={s.compTitle}>Diet Adherence</Text>
                <Text style={{ color: '#94A3B8', fontSize: 12, marginLeft: 'auto' }}>20% Weight</Text>
              </View>
              <View style={s.compBarBg}>
                <View style={[s.compBarFill, { width: `${data.dietAdherence}%`, backgroundColor: '#10B981' }]} />
              </View>
              <Text style={s.compVal}>{data.dietAdherence}% <Text style={s.compSub}>Compliance</Text></Text>
            </View>

            <View style={[SharedStyles.card, s.compCard, isWide && { flex: 1, minWidth: '45%' }]}>
              <View style={s.compHeader}>
                <Zap size={20} color="#A855F7" />
                <Text style={s.compTitle}>Recovery Score</Text>
                <Text style={{ color: '#94A3B8', fontSize: 12, marginLeft: 'auto' }}>10% Weight</Text>
              </View>
              <View style={s.compBarBg}>
                <View style={[s.compBarFill, { width: `${data.recoveryScore}%`, backgroundColor: '#A855F7' }]} />
              </View>
              <Text style={s.compVal}>{data.recoveryScore} <Text style={s.compSub}>/ 100</Text></Text>
            </View>
            
            <View style={[SharedStyles.card, s.compCard, isWide && { flex: 1, minWidth: '45%' }]}>
              <View style={s.compHeader}>
                <Crown size={20} color="#F59E0B" />
                <Text style={s.compTitle}>Goal Achievement</Text>
                <Text style={{ color: '#94A3B8', fontSize: 12, marginLeft: 'auto' }}>10% Weight</Text>
              </View>
              <View style={s.compBarBg}>
                <View style={[s.compBarFill, { width: `${data.goalAchievementScore}%`, backgroundColor: '#F59E0B' }]} />
              </View>
              <Text style={s.compVal}>{data.goalAchievementScore} <Text style={s.compSub}>/ 100</Text></Text>
            </View>
            
            <View style={[SharedStyles.card, s.compCard, isWide && { flex: 1, minWidth: '45%' }]}>
              <View style={s.compHeader}>
                <Scale size={20} color="#8B5CF6" />
                <Text style={s.compTitle}>Body Progress</Text>
                <Text style={{ color: '#94A3B8', fontSize: 12, marginLeft: 'auto' }}>10% Weight</Text>
              </View>
              <View style={s.compBarBg}>
                <View style={[s.compBarFill, { width: `${data.bodyProgressScore}%`, backgroundColor: '#8B5CF6' }]} />
              </View>
              <Text style={s.compVal}>{data.bodyProgressScore} <Text style={s.compSub}>/ 100</Text></Text>
            </View>
          </View>

          {/* CONSISTENCY ANALYTICS */}
          <Text style={s.sectionTitle}>Consistency Analytics</Text>
          <View style={[SharedStyles.card, { padding: 24, marginBottom: 32 }]}>
             <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
                <Text style={{ color: '#F8FAFC', fontSize: 15, fontWeight: '800' }}>Workout Consistency</Text>
                <Text style={{ color: '#38BDF8', fontSize: 15, fontWeight: '900' }}>{data.consistency.workoutConsistency}%</Text>
             </View>
             <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
                <Text style={{ color: '#F8FAFC', fontSize: 15, fontWeight: '800' }}>Meal Consistency</Text>
                <Text style={{ color: '#10B981', fontSize: 15, fontWeight: '900' }}>{data.consistency.mealConsistency}%</Text>
             </View>
             <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: '#F8FAFC', fontSize: 15, fontWeight: '800' }}>Recovery Consistency</Text>
                <Text style={{ color: '#A855F7', fontSize: 15, fontWeight: '900' }}>{data.consistency.recoveryConsistency}%</Text>
             </View>
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
  
  gaugeWrapper: { alignItems: 'center' },
  scoreBadge: { marginTop: -16, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 100, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  scoreLabel: { fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  
  summaryGrid: { flexDirection: 'row', gap: 16, marginTop: 24, width: '100%' },
  sumCard: { flex: 1, backgroundColor: 'rgba(30,41,59,0.5)', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#334155' },
  sumCardLab: { color: '#94A3B8', fontSize: 12, fontWeight: '700', marginBottom: 4 },
  sumCardVal: { color: '#F8FAFC', fontSize: 22, fontWeight: '900', marginBottom: 2 },
  sumCardSub: { color: '#64748B', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },

  content: { padding: 24 },

  aiCard: { overflow: 'hidden', marginBottom: 24, borderColor: '#38BDF830', borderWidth: 1 },
  aiGrad: { padding: 20 },
  aiHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  aiTitle: { color: '#38BDF8', fontSize: 16, fontWeight: '900', marginLeft: 8, letterSpacing: 0.5 },
  aiText: { color: '#F8FAFC', fontSize: 15, lineHeight: 22, fontWeight: '600', flex: 1 },

  sectionTitle: { color: '#F8FAFC', fontSize: 20, fontWeight: '900', letterSpacing: -0.5, marginBottom: 16, marginTop: 8 },

  compCard: { padding: 20, marginBottom: 16 },
  compHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  compTitle: { color: '#F8FAFC', fontSize: 15, fontWeight: '800' },
  compBarBg: { height: 8, backgroundColor: '#0F172A', borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  compBarFill: { height: '100%', borderRadius: 4 },
  compVal: { color: '#F8FAFC', fontSize: 20, fontWeight: '900' },
  compSub: { color: '#64748B', fontSize: 12, fontWeight: '700' },
});
