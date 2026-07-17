import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Text, TouchableOpacity, Animated, Easing, useWindowDimensions, LayoutAnimation, UIManager, Platform } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { MealService } from '@/services/mealService';
import { DietPlanService } from '@/services/dietPlanService';
import FitnessProgressEngine, { EngineResult } from '@/services/fitnessProgressEngine';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Activity, Flame, Dumbbell, Sparkles, Target, HeartPulse, Zap, AlertTriangle, Crown, History, Info, CheckCircle2, Circle as CircleIcon, ArrowRight
} from 'lucide-react-native';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import SkeletonCard from '@/components/SkeletonCard';
import { SharedStyles } from '@/constants/Theme';
import Svg, { Circle } from 'react-native-svg';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function MainGauge({ score, label }: { score: number; label: string }) {
  const size = 200;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, { toValue: score / 100, duration: 1500, easing: Easing.out(Easing.cubic), useNativeDriver: true, delay: 300 }).start();
  }, [score]);

  const strokeDashoffset = animatedValue.interpolate({ inputRange: [0, 1], outputRange: [circumference, 0] });
  const getColor = () => { if (score >= 90) return '#10B981'; if (score >= 80) return '#38BDF8'; if (score >= 65) return '#F59E0B'; return '#EF4444'; };

  return (
    <View style={{ position: 'relative', width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle cx={size/2} cy={size/2} r={radius} stroke="#1E293B" strokeWidth={strokeWidth} fill="none" />
        <AnimatedCircle cx={size/2} cy={size/2} r={radius} stroke={getColor()} strokeWidth={strokeWidth} fill="none" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`} />
      </Svg>
      <View style={{ position: 'absolute', alignItems: 'center' }}>
        <Text style={{ color: '#F8FAFC', fontSize: 48, fontWeight: '900', letterSpacing: -1 }}>{score}</Text>
        <Text style={{ color: getColor(), fontSize: 13, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 }}>{label}</Text>
      </View>
    </View>
  );
}

function PillarCard({ icon: Icon, title, score, weight, reasons, color }: any) {
  const [expanded, setExpanded] = useState(false);
  const toggle = () => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setExpanded(!expanded); };
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={toggle} style={[SharedStyles.card, s.compCard, { minWidth: '45%', flex: 1 }]}>
      <View style={s.compHeader}>
        <Icon size={20} color={color} />
        <Text style={s.compTitle}>{title}</Text>
        <Text style={{ color: '#94A3B8', fontSize: 12, marginLeft: 'auto' }}>{weight}% W</Text>
      </View>
      <View style={s.compBarBg}>
        <View style={[s.compBarFill, { width: `${score}%`, backgroundColor: color }]} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={s.compVal}>{score} <Text style={s.compSub}>/ 100</Text></Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Info size={14} color="#64748B" />
          <Text style={{ color: '#64748B', fontSize: 11, fontWeight: '700' }}>Why?</Text>
        </View>
      </View>
      {expanded && (
        <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.05)', gap: 8 }}>
          {reasons.map((r: string, i: number) => (
             <Text key={i} style={{ color: r.includes('✔') ? '#10B981' : (r.includes('✖') ? '#EF4444' : '#94A3B8'), fontSize: 13, fontWeight: '600' }}>{r}</Text>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function IntelligenceDashboardScreen() {
  const { width } = useWindowDimensions();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<EngineResult | null>(null);
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setError(null);
    try {
      const [analyticsRes, mealsRes, dietPlan, weightRes] = await Promise.all([
        api.get('/workouts/analytics'),
        MealService.getMeals(),
        DietPlanService.getMyDietPlan(),
        api.get('/weight').catch(() => ({ data: [] }))
      ]);
      
      const intelligence = FitnessProgressEngine.generate({
        user, analytics: analyticsRes.data, meals: mealsRes, dietPlan, weightLogs: weightRes.data
      });
      
      setData(intelligence);
    } catch (e: any) {
      setError(e.message || 'Failed to sync intelligence data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, [user]);
  const onRefresh = () => { setRefreshing(true); fetchData(); };

  if (loading && !refreshing) return <View style={[s.container, { paddingTop: insets.top }]}><View style={{ padding: 24 }}><SkeletonCard /><SkeletonCard /><SkeletonCard /></View></View>;
  if (error && !loading) return <View style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}><Text style={{ color: '#EF4444', fontSize: 16 }}>{error}</Text><TouchableOpacity onPress={fetchData} style={{ marginTop: 20, padding: 12, backgroundColor: '#38BDF8', borderRadius: 8 }}><Text style={{ color: '#fff', fontWeight: 'bold' }}>Retry</Text></TouchableOpacity></View>;
  if (!data) return null;

  const isWide = width > 768;

  return (
    <View style={s.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 100, maxWidth: 1000, width: '100%', alignSelf: 'center' }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#38BDF8" />}>
        {/* HERO SECTION */}
        <LinearGradient colors={['#1E293B', '#0F172A']} style={[s.heroSection, { paddingTop: insets.top + 16 }]}>
          <Text style={s.headerSubtitle}>ElevateFit Executive</Text>
          <Text style={s.headerTitle}>Decision Dashboard</Text>
          
          <View style={[s.gaugeWrapper, isWide && { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }]}>
            <View style={{ alignItems: 'center', marginBottom: isWide ? 0 : 24 }}>
              <MainGauge score={data.healthBalanceIndex} label="Health Balance Index" />
            </View>
            <View style={[s.summaryGrid, isWide && { flex: 1, marginLeft: 40 }]}>
              <View style={s.sumCard}>
                <Text style={s.sumCardLab}>Fitness Score</Text>
                <Text style={s.sumCardVal}>{data.scores.overall.value}</Text>
                <Text style={s.sumCardSub}>Overall Trajectory</Text>
              </View>
              <View style={s.sumCard}>
                <Text style={s.sumCardLab}>AI Status</Text>
                <Text style={[s.sumCardVal, { color: '#38BDF8', fontSize: 15 }]}>{data.status.primary}</Text>
                <Text style={s.sumCardSub}>System Assessment</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        <View style={s.content}>
          
          {/* SMART DAILY ACTION PLAN */}
          <Text style={s.sectionTitle}>Today's Action Plan</Text>
          <View style={[SharedStyles.card, { padding: 20, marginBottom: 24 }]}>
             <View style={{ gap: 16 }}>
                {data.recommendations.actionPlan.map((action, i) => (
                   <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      {action.completed ? <CheckCircle2 size={24} color="#10B981" /> : <CircleIcon size={24} color="#64748B" />}
                      <View style={{ flex: 1 }}>
                         <Text style={{ color: action.completed ? '#10B981' : '#F8FAFC', fontSize: 15, fontWeight: '800', textDecorationLine: action.completed ? 'line-through' : 'none' }}>{action.task}</Text>
                         <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '600', marginTop: 2 }}>{action.reason}</Text>
                      </View>
                   </View>
                ))}
             </View>
          </View>

          {/* GOAL ADJUSTMENT ASSISTANT */}
          {data.recommendations.goalAdjustment?.isUnrealistic && (
             <View style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', padding: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)', marginBottom: 24 }}>
                <Target size={24} color="#EF4444" />
                <View style={{ flex: 1 }}>
                   <Text style={{ color: '#EF4444', fontSize: 16, fontWeight: '900' }}>Unrealistic Goal Detected</Text>
                   <Text style={{ color: '#F8FAFC', fontSize: 13, fontWeight: '600', marginTop: 4 }}>{data.recommendations.goalAdjustment.reason}</Text>
                   <View style={{ backgroundColor: '#EF4444', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, alignSelf: 'flex-start', marginTop: 8 }}>
                      <Text style={{ color: '#fff', fontSize: 12, fontWeight: '800' }}>Safe Timeline: {data.recommendations.goalAdjustment.safeTimeline}</Text>
                   </View>
                </View>
             </View>
          )}

          {/* ADAPTIVE RECOMMENDATIONS */}
          {(data.recommendations.adaptiveDiet || data.recommendations.adaptiveWorkout) && (
            <View style={{ marginBottom: 24 }}>
               <Text style={s.sectionTitle}>Adaptive Coach Suggestions</Text>
               <View style={{ gap: 12 }}>
                  {data.recommendations.adaptiveDiet && (
                     <View style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(245, 158, 11, 0.3)' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                           <Flame size={18} color="#F59E0B" />
                           <Text style={{ color: '#F59E0B', fontSize: 14, fontWeight: '900', textTransform: 'uppercase' }}>Diet Intervention</Text>
                        </View>
                        <Text style={{ color: '#F8FAFC', fontSize: 18, fontWeight: '800' }}>Try: {data.recommendations.adaptiveDiet.recommendedMeal}</Text>
                        <Text style={{ color: '#94A3B8', fontSize: 13, fontWeight: '600', marginTop: 4, marginBottom: 8 }}>{data.recommendations.adaptiveDiet.reason}</Text>
                        <View style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4 }}>
                           <Text style={{ color: '#F59E0B', fontSize: 12, fontWeight: '800' }}>{data.recommendations.adaptiveDiet.targetMacro}</Text>
                        </View>
                     </View>
                  )}
                  {data.recommendations.adaptiveWorkout && (
                     <View style={{ backgroundColor: 'rgba(56, 189, 248, 0.15)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.3)' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                           <Dumbbell size={18} color="#38BDF8" />
                           <Text style={{ color: '#38BDF8', fontSize: 14, fontWeight: '900', textTransform: 'uppercase' }}>Workout Shift</Text>
                        </View>
                        <Text style={{ color: '#F8FAFC', fontSize: 18, fontWeight: '800' }}>Switch to: {data.recommendations.adaptiveWorkout.recommendedWorkout}</Text>
                        <Text style={{ color: '#94A3B8', fontSize: 13, fontWeight: '600', marginTop: 4 }}>{data.recommendations.adaptiveWorkout.reason}</Text>
                     </View>
                  )}
               </View>
            </View>
          )}

          {/* WEEKLY & MONTHLY EXECUTIVE REVIEWS */}
          <Text style={s.sectionTitle}>Executive AI Reviews</Text>
          <View style={[isWide && { flexDirection: 'row', gap: 16 }]}>
             <View style={[SharedStyles.card, { padding: 20, marginBottom: 16, flex: 1 }]}>
                <Text style={{ color: '#38BDF8', fontSize: 14, fontWeight: '900', textTransform: 'uppercase', marginBottom: 16 }}>Weekly Coach Summary</Text>
                <View style={{ gap: 12 }}>
                   <View><Text style={{ color: '#64748B', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' }}>Biggest Achievement</Text><Text style={{ color: '#10B981', fontSize: 14, fontWeight: '800' }}>{data.reports.weekly.biggestAchievement}</Text></View>
                   <View><Text style={{ color: '#64748B', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' }}>Critical Mistake</Text><Text style={{ color: '#EF4444', fontSize: 14, fontWeight: '800' }}>{data.reports.weekly.biggestMistake}</Text></View>
                   <View><Text style={{ color: '#64748B', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' }}>Strongest Habit</Text><Text style={{ color: '#F8FAFC', fontSize: 14, fontWeight: '800' }}>{data.reports.weekly.strongestHabit}</Text></View>
                   <View><Text style={{ color: '#64748B', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' }}>Weakest Habit</Text><Text style={{ color: '#F8FAFC', fontSize: 14, fontWeight: '800' }}>{data.reports.weekly.weakestHabit}</Text></View>
                   <View style={{ marginTop: 8, paddingTop: 12, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}><Text style={{ color: '#64748B', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' }}>Next Week Focus</Text><Text style={{ color: '#38BDF8', fontSize: 14, fontWeight: '800' }}>{data.reports.weekly.nextWeekFocus}</Text></View>
                </View>
             </View>
             
             <View style={[SharedStyles.card, { padding: 20, marginBottom: 24, flex: 1 }]}>
                <Text style={{ color: '#A855F7', fontSize: 14, fontWeight: '900', textTransform: 'uppercase', marginBottom: 16 }}>Monthly Analytics Report</Text>
                <View style={{ gap: 12 }}>
                   <View><Text style={{ color: '#64748B', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' }}>Overall Trajectory</Text><Text style={{ color: data.reports.monthly.overallImprovement.includes('+') ? '#10B981' : '#EF4444', fontSize: 14, fontWeight: '800' }}>{data.reports.monthly.overallImprovement}</Text></View>
                   <View><Text style={{ color: '#64748B', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' }}>Weight Change</Text><Text style={{ color: '#F8FAFC', fontSize: 14, fontWeight: '800' }}>{data.reports.monthly.weightChange}</Text></View>
                   <View style={{ flexDirection: 'row', gap: 16 }}>
                      <View style={{ flex: 1 }}><Text style={{ color: '#64748B', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' }}>Workout Consistency</Text><Text style={{ color: '#F8FAFC', fontSize: 14, fontWeight: '800' }}>{data.reports.monthly.workoutConsistency}</Text></View>
                      <View style={{ flex: 1 }}><Text style={{ color: '#64748B', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' }}>Nutrition Consistency</Text><Text style={{ color: '#F8FAFC', fontSize: 14, fontWeight: '800' }}>{data.reports.monthly.nutritionConsistency}</Text></View>
                   </View>
                   <View><Text style={{ color: '#64748B', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' }}>Goal Prediction</Text><Text style={{ color: '#F59E0B', fontSize: 14, fontWeight: '800' }}>{data.reports.monthly.goalPrediction}</Text></View>
                   <View style={{ marginTop: 8, paddingTop: 12, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}><Text style={{ color: '#64748B', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' }}>Conclusion</Text><Text style={{ color: '#A855F7', fontSize: 13, fontWeight: '800', lineHeight: 20 }}>{data.reports.monthly.coachConclusion}</Text></View>
                </View>
             </View>
          </View>

          {/* THE 6 PILLARS OF INTELLIGENCE ANALYSIS (EXPLAINABLE) */}
          <Text style={s.sectionTitle}>Diagnostic Core</Text>
          <Text style={{ color: '#94A3B8', fontSize: 13, fontWeight: '600', marginBottom: 16 }}>Tap any pillar to view the algorithmic calculation.</Text>
          
          <View style={[isWide && { flexDirection: 'row', gap: 16, flexWrap: 'wrap' }]}>
            <PillarCard icon={Dumbbell} title="Workout Performance" score={data.scores.workout.value} weight={30} reasons={data.scores.workout.reasons} color="#38BDF8" />
            <PillarCard icon={Flame} title="Nutrition Quality" score={data.scores.nutrition.value} weight={20} reasons={data.scores.nutrition.reasons} color="#F59E0B" />
            <PillarCard icon={Target} title="Diet Adherence" score={data.scores.adherence.value} weight={20} reasons={data.scores.adherence.reasons} color="#10B981" />
            <PillarCard icon={Zap} title="Recovery Score" score={data.scores.recovery.value} weight={10} reasons={data.scores.recovery.reasons} color="#A855F7" />
            <PillarCard icon={Crown} title="Goal Achievement" score={data.scores.goal.value} weight={10} reasons={data.scores.goal.reasons} color="#F59E0B" />
            <PillarCard icon={HeartPulse} title="Body Progress" score={data.scores.body.value} weight={10} reasons={data.scores.body.reasons} color="#8B5CF6" />
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
  sumCardVal: { color: '#F8FAFC', fontSize: 18, fontWeight: '900', marginBottom: 2 },
  sumCardSub: { color: '#64748B', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },

  content: { padding: 24 },

  sectionTitle: { color: '#F8FAFC', fontSize: 20, fontWeight: '900', letterSpacing: -0.5, marginBottom: 16, marginTop: 8 },

  compCard: { padding: 20, marginBottom: 16 },
  compHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  compTitle: { color: '#F8FAFC', fontSize: 15, fontWeight: '800' },
  compBarBg: { height: 8, backgroundColor: '#0F172A', borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  compBarFill: { height: '100%', borderRadius: 4 },
  compVal: { color: '#F8FAFC', fontSize: 20, fontWeight: '900' },
  compSub: { color: '#64748B', fontSize: 12, fontWeight: '700' },
});
