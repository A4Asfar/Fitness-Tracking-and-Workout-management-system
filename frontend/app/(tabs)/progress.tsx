import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Text, TouchableOpacity, Animated, Easing, useWindowDimensions, LayoutAnimation, UIManager, Platform } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { MealService } from '@/services/mealService';
import { DietPlanService } from '@/services/dietPlanService';
import { WorkoutService } from '@/services/workoutService';
import FitnessProgressEngine, { EngineResult } from '@/services/fitnessProgressEngine';
import GoalSimulationEngine from '@/services/GoalSimulationEngine';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Flame, Dumbbell, Target, HeartPulse, Zap, Crown, CheckCircle2, Circle as CircleIcon, Beaker, ShieldAlert, Check, ArrowRight
} from 'lucide-react-native';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import SkeletonCard from '@/components/SkeletonCard';
import { SharedStyles } from '@/constants/Theme';
import Svg, { Circle } from 'react-native-svg';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const MainGauge = React.memo(function MainGauge({ score, label }: { score: number; label: string }) {
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
});

const PillarCard = React.memo(function PillarCard({ icon: Icon, title, data, color }: any) {
  const [expanded, setExpanded] = useState(false);
  const toggle = () => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setExpanded(!expanded); };
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={toggle} style={[SharedStyles.card, s.compCard, { minWidth: '45%', flex: 1 }]}>
      <View style={s.compHeader}>
        <Icon size={20} color={color} />
        <Text style={s.compTitle}>{title}</Text>
        <Text style={{ color: '#94A3B8', fontSize: 12, marginLeft: 'auto', fontWeight: '700' }}>{expanded ? 'HIDE XAI' : 'VIEW XAI'}</Text>
      </View>
      <View style={s.compBarBg}>
        <View style={[s.compBarFill, { width: `${data.value}%`, backgroundColor: color }]} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={s.compVal}>{data.value} <Text style={s.compSub}>/ 100</Text></Text>
      </View>
      
      {expanded && (
        <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}>
          <Text style={{ color: color, fontSize: 12, fontWeight: '900', textTransform: 'uppercase', marginBottom: 12 }}>Explainable AI (XAI) Model</Text>
          <View style={{ gap: 8, marginBottom: 16 }}>
             {data.reasons.map((r: any, i: number) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                   {r.type === 'positive' ? <Check size={14} color="#10B981" /> : <ShieldAlert size={14} color="#EF4444" />}
                   <View style={{ flex: 1 }}>
                      <Text style={{ color: r.type === 'positive' ? '#10B981' : '#EF4444', fontSize: 13, fontWeight: '600' }}>{r.reason}</Text>
                      <Text style={{ color: '#64748B', fontSize: 11, fontWeight: '700' }}>Impact Weight: {r.weight}</Text>
                   </View>
                </View>
             ))}
          </View>
          <View style={{ backgroundColor: 'rgba(15,23,42,0.5)', padding: 12, borderRadius: 8, gap: 8 }}>
             <View><Text style={{ color: '#94A3B8', fontSize: 11, fontWeight: '700' }}>Historical Trend</Text><Text style={{ color: '#F8FAFC', fontSize: 13, fontWeight: '800' }}>{data.historicalTrend}</Text></View>
             <View><Text style={{ color: '#94A3B8', fontSize: 11, fontWeight: '700' }}>How to Improve</Text><Text style={{ color: '#F8FAFC', fontSize: 13, fontWeight: '800' }}>{data.howToImprove}</Text></View>
             <View><Text style={{ color: '#94A3B8', fontSize: 11, fontWeight: '700' }}>Expected Improvement</Text><Text style={{ color: '#38BDF8', fontSize: 13, fontWeight: '800' }}>{data.expectedImprovement}</Text></View>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
});

const MiniBarChart = React.memo(function MiniBarChart({ title, data, color }: { title: string, data: number[], color: string }) {
  const max = Math.max(...data, 100);
  return (
    <View style={[SharedStyles.card, { padding: 16, flex: 1, minWidth: 200, marginBottom: 16 }]}>
       <Text style={{ color: '#F8FAFC', fontSize: 14, fontWeight: '900', marginBottom: 16 }}>{title}</Text>
       <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 80, gap: 8 }}>
          {data.map((val, i) => (
             <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                <View style={{ width: '100%', height: `${(val / max) * 100}%`, backgroundColor: color, borderRadius: 4, minHeight: 4 }} />
                <Text style={{ color: '#94A3B8', fontSize: 10, fontWeight: '700', marginTop: 8 }}>W{i+1}</Text>
             </View>
          ))}
       </View>
    </View>
  );
});

export default function IntelligenceDashboardScreen() {
  const { width } = useWindowDimensions();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rawData, setRawData] = useState<any>(null);
  const [renderStage, setRenderStage] = useState(0);
  
  // Sandbox State
  const [simDays, setSimDays] = useState(3);
  const [simPro, setSimPro] = useState(150);
  const [simCal, setSimCal] = useState(2500);

  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const fetchData = useCallback(async () => {
    try {
      setRenderStage(0);
      const [analyticsRes, mealsRes, dietPlan, weightRes, workouts] = await Promise.all([
        api.get('/workouts/analytics'),
        MealService.getMeals(),
        DietPlanService.getMyDietPlan(),
        api.get('/weight').catch(() => ({ data: [] })),
        WorkoutService.getWorkouts().catch(() => ([]))
      ]);
      
      setRawData({
        analytics: analyticsRes.data,
        meals: mealsRes,
        dietPlan,
        weightLogs: weightRes.data,
        workouts
      });
    } catch (e: any) {
      console.log(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);
  const onRefresh = useCallback(() => { setRefreshing(true); fetchData(); }, [fetchData]);

  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!rawData || !user) return;
    const t = setTimeout(() => {
      try {
        const intelligence = FitnessProgressEngine.generate({
          user, 
          analytics: rawData.analytics, 
          meals: rawData.meals, 
          dietPlan: rawData.dietPlan, 
          weightLogs: rawData.weightLogs, 
          workouts: rawData.workouts
        });
        setData(intelligence);
      } catch (e) {
        console.error("Engine crash:", e);
      }
    }, 50);
    return () => clearTimeout(t);
  }, [user, rawData]);

  useEffect(() => {
    if (data) {
      const s1 = setTimeout(() => setRenderStage(1), 50);
      const s2 = setTimeout(() => setRenderStage(2), 150);
      const s3 = setTimeout(() => setRenderStage(3), 250);
      const s4 = setTimeout(() => setRenderStage(4), 350);
      return () => { clearTimeout(s1); clearTimeout(s2); clearTimeout(s3); clearTimeout(s4); };
    }
  }, [data]);

  if (loading && !refreshing) return <View style={[s.container, { paddingTop: insets.top }]}><View style={{ padding: 24 }}><SkeletonCard /><SkeletonCard /><SkeletonCard /></View></View>;
  if (!data) return <View style={s.container} />;

  const isWide = width > 768;

  const simResult = useMemo(() => {
     if (renderStage < 3) return null;
     try {
       return GoalSimulationEngine.simulate(
          user?.weight || 70, (user as any)?.targetWeight || 75, user?.fitnessGoal || 'Gain Muscle',
          simDays, simCal, simPro, (user?.weight || 70) * 24 * 1.2
       );
     } catch (e) {
       console.error("Simulation error", e);
       return null;
     }
  }, [user, simDays, simCal, simPro, renderStage]);

  return (
    <View style={s.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 100, maxWidth: 1000, width: '100%', alignSelf: 'center' }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#38BDF8" />}>
        
        {/* HERO SECTION */}
        <LinearGradient colors={['#1E293B', '#0F172A']} style={[s.heroSection, { paddingTop: insets.top + 16 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
             <View>
                <Text style={s.headerSubtitle}>ElevateFit Executive</Text>
                <Text style={s.headerTitle}>Intelligence V5</Text>
             </View>
             <TouchableOpacity style={{ backgroundColor: '#38BDF820', padding: 12, borderRadius: 100, borderWidth: 1, borderColor: '#38BDF850' }} onPress={() => router.push('/trainer-dashboard' as any)}>
                <Crown size={20} color="#38BDF8" />
             </TouchableOpacity>
          </View>
          
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

          {/* AI ACHIEVEMENTS */}
          {renderStage >= 1 && data.achievements.length > 0 && (
             <View style={{ marginBottom: 24 }}>
                <Text style={[s.sectionTitle, { fontSize: 16 }]}>AI Unlocked Achievements</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ maxWidth: 800, width: '100%', alignSelf: 'center',  gap: 12 }}>
                   {data.achievements.map((ach, i) => (
                      <View key={i} style={{ backgroundColor: 'rgba(56,189,248,0.1)', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 100, borderWidth: 1, borderColor: 'rgba(56,189,248,0.3)', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                         <Crown size={16} color="#38BDF8" />
                         <Text style={{ color: '#38BDF8', fontSize: 13, fontWeight: '800' }}>{ach}</Text>
                      </View>
                   ))}
                </ScrollView>
             </View>
          )}

          {/* SMART DAILY ACTION PLAN */}
          {renderStage >= 1 ? (
          <>
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
          </>
          ) : <SkeletonCard />}

          {/* XAI ADAPTIVE RECOMMENDATIONS */}
          {renderStage >= 4 ? (
             (data.recommendations.adaptiveDiet || data.recommendations.adaptiveWorkout) && (
             <View style={{ marginBottom: 24 }}>
                <Text style={s.sectionTitle}>AI Decision Support</Text>
                <View style={{ gap: 12 }}>
                   {data.recommendations.adaptiveDiet && (
                      <View style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(245, 158, 11, 0.3)' }}>
                         <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <Flame size={18} color="#F59E0B" />
                            <Text style={{ color: '#F59E0B', fontSize: 14, fontWeight: '900', textTransform: 'uppercase' }}>Adaptive Diet Recommendation</Text>
                         </View>
                         <Text style={{ color: '#F8FAFC', fontSize: 18, fontWeight: '800', marginBottom: 16 }}>Try: {data.recommendations.adaptiveDiet.recommendedMeal}</Text>
                         
                         <View style={{ backgroundColor: 'rgba(15,23,42,0.6)', padding: 12, borderRadius: 8, gap: 8, marginBottom: 16 }}>
                            <View><Text style={{ color: '#94A3B8', fontSize: 11, fontWeight: '700' }}>Reason</Text><Text style={{ color: '#F8FAFC', fontSize: 13, fontWeight: '600' }}>{data.recommendations.adaptiveDiet.reason}</Text></View>
                            <View><Text style={{ color: '#94A3B8', fontSize: 11, fontWeight: '700' }}>Evidence</Text><Text style={{ color: '#EF4444', fontSize: 13, fontWeight: '600' }}>{data.recommendations.adaptiveDiet.evidence}</Text></View>
                            <View><Text style={{ color: '#94A3B8', fontSize: 11, fontWeight: '700' }}>Expected Outcome</Text><Text style={{ color: '#10B981', fontSize: 13, fontWeight: '600' }}>{data.recommendations.adaptiveDiet.expectedOutcome}</Text></View>
                         </View>

                         <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <View style={{ flex: 1, alignItems: 'center' }}>
                               <Text style={{ color: '#94A3B8', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' }}>Current Diet</Text>
                               <Text style={{ color: '#EF4444', fontSize: 14, fontWeight: '800', marginTop: 4, textAlign: 'center' }}>{data.recommendations.adaptiveDiet.originalMacro}</Text>
                            </View>
                            <ArrowRight size={20} color="#F8FAFC" />
                            <View style={{ flex: 1, alignItems: 'center' }}>
                               <Text style={{ color: '#94A3B8', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' }}>Recommended</Text>
                               <Text style={{ color: '#10B981', fontSize: 14, fontWeight: '800', marginTop: 4, textAlign: 'center' }}>{data.recommendations.adaptiveDiet.targetMacro}</Text>
                            </View>
                         </View>
                      </View>
                   )}

                   {data.recommendations.adaptiveWorkout && (
                      <View style={{ backgroundColor: 'rgba(56, 189, 248, 0.1)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.3)' }}>
                         <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <Dumbbell size={18} color="#38BDF8" />
                            <Text style={{ color: '#38BDF8', fontSize: 14, fontWeight: '900', textTransform: 'uppercase' }}>Adaptive Workout Override</Text>
                         </View>
                         <Text style={{ color: '#F8FAFC', fontSize: 18, fontWeight: '800', marginBottom: 16 }}>Switch to: {data.recommendations.adaptiveWorkout.recommendedWorkout}</Text>
                         
                         <View style={{ backgroundColor: 'rgba(15,23,42,0.6)', padding: 12, borderRadius: 8, gap: 8 }}>
                            <View><Text style={{ color: '#94A3B8', fontSize: 11, fontWeight: '700' }}>Reason</Text><Text style={{ color: '#F8FAFC', fontSize: 13, fontWeight: '600' }}>{data.recommendations.adaptiveWorkout.reason}</Text></View>
                            <View><Text style={{ color: '#94A3B8', fontSize: 11, fontWeight: '700' }}>Evidence</Text><Text style={{ color: '#EF4444', fontSize: 13, fontWeight: '600' }}>{data.recommendations.adaptiveWorkout.evidence}</Text></View>
                            <View><Text style={{ color: '#94A3B8', fontSize: 11, fontWeight: '700' }}>Expected Outcome</Text><Text style={{ color: '#10B981', fontSize: 13, fontWeight: '600' }}>{data.recommendations.adaptiveWorkout.expectedOutcome}</Text></View>
                         </View>
                      </View>
                   )}
                </View>
             </View>
             )
          ) : null}

          {/* GOAL SIMULATION ENGINE (SANDBOX) */}
          <Text style={s.sectionTitle}>Goal Simulation Engine</Text>
          <Text style={{ color: '#94A3B8', fontSize: 13, fontWeight: '600', marginBottom: 16 }}>Simulate changes to your routine to predict future physiological outcomes. This does not alter your actual data.</Text>
          <View style={[SharedStyles.card, { padding: 20, marginBottom: 24 }]}>
             <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <Beaker size={20} color="#A855F7" />
                <Text style={{ color: '#A855F7', fontSize: 16, fontWeight: '900' }}>Predictive Sandbox</Text>
             </View>

             <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
                <TouchableOpacity onPress={() => setSimDays(Math.max(0, simDays-1))} style={s.simBtn}><Text style={s.simBtnTxt}>- Days</Text></TouchableOpacity>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#F8FAFC', fontSize: 15, fontWeight: '800' }}>{simDays} Days/Wk</Text></View>
                <TouchableOpacity onPress={() => setSimDays(Math.min(7, simDays+1))} style={s.simBtn}><Text style={s.simBtnTxt}>+ Days</Text></TouchableOpacity>
             </View>

             <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
                <TouchableOpacity onPress={() => setSimCal(Math.max(1000, simCal-250))} style={s.simBtn}><Text style={s.simBtnTxt}>- 250 kcal</Text></TouchableOpacity>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#F8FAFC', fontSize: 15, fontWeight: '800' }}>{simCal} kcal/d</Text></View>
                <TouchableOpacity onPress={() => setSimCal(Math.min(5000, simCal+250))} style={s.simBtn}><Text style={s.simBtnTxt}>+ 250 kcal</Text></TouchableOpacity>
             </View>

             <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
                <TouchableOpacity onPress={() => setSimPro(Math.max(50, simPro-25))} style={s.simBtn}><Text style={s.simBtnTxt}>- 25g Pro</Text></TouchableOpacity>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#F8FAFC', fontSize: 15, fontWeight: '800' }}>{simPro}g Pro/d</Text></View>
                <TouchableOpacity onPress={() => setSimPro(Math.min(300, simPro+25))} style={s.simBtn}><Text style={s.simBtnTxt}>+ 25g Pro</Text></TouchableOpacity>
             </View>

             <View style={{ backgroundColor: 'rgba(15,23,42,0.6)', padding: 16, borderRadius: 12, gap: 12, borderWidth: 1, borderColor: '#334155' }}>
                <Text style={{ color: '#38BDF8', fontSize: 13, fontWeight: '900', textTransform: 'uppercase' }}>Simulated Outcome</Text>
                {simResult ? (
                   <>
                   <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ color: '#94A3B8', fontSize: 13, fontWeight: '700' }}>Estimated Completion</Text>
                      <Text style={{ color: '#F8FAFC', fontSize: 13, fontWeight: '900' }}>{typeof simResult.estimatedCompletionDays === 'number' ? `${simResult.estimatedCompletionDays} Days` : simResult.estimatedCompletionDays}</Text>
                   </View>
                   <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ color: '#94A3B8', fontSize: 13, fontWeight: '700' }}>Muscle Gain Potential</Text>
                      <Text style={{ color: '#F8FAFC', fontSize: 13, fontWeight: '900' }}>{simResult.muscleGainPotential}</Text>
                   </View>
                   <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ color: '#94A3B8', fontSize: 13, fontWeight: '700' }}>Fat Loss Potential</Text>
                      <Text style={{ color: '#F8FAFC', fontSize: 13, fontWeight: '900' }}>{simResult.fatLossPotential}</Text>
                   </View>
                   <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ color: '#94A3B8', fontSize: 13, fontWeight: '700' }}>Metabolic Risk</Text>
                      <Text style={{ color: simResult.metabolicRisk.includes('High') || simResult.metabolicRisk.includes('Critical') ? '#EF4444' : '#10B981', fontSize: 13, fontWeight: '900' }}>{simResult.metabolicRisk}</Text>
                   </View>
                   </>
                ) : (
                   <Text style={{ color: '#94A3B8', fontSize: 13 }}>Simulating...</Text>
                )}
             </View>
          </View>

          {/* EXPLAINABLE PILLAR SCORECARDS */}
          {renderStage >= 3 ? (
             <>
             <Text style={s.sectionTitle}>XAI Diagnostic Core</Text>
             <Text style={{ color: '#94A3B8', fontSize: 13, fontWeight: '600', marginBottom: 16 }}>Tap any pillar to reveal transparent AI reasoning, impact weights, and expected outcomes.</Text>
             
             <View style={[isWide && { flexDirection: 'row', gap: 16, flexWrap: 'wrap' }]}>
               <PillarCard icon={Dumbbell} title="Workout Performance" data={data.scores.workout} color="#38BDF8" />
               <PillarCard icon={Flame} title="Nutrition Quality" data={data.scores.nutrition} color="#F59E0B" />
               <PillarCard icon={Target} title="Diet Adherence" data={data.scores.adherence} color="#10B981" />
               <PillarCard icon={Zap} title="Recovery Score" data={data.scores.recovery} color="#A855F7" />
               <PillarCard icon={Crown} title="Goal Achievement" data={data.scores.goal} color="#F59E0B" />
               <PillarCard icon={HeartPulse} title="Body Progress" data={data.scores.body} color="#8B5CF6" />
             </View>
             </>
          ) : <SkeletonCard />}

          {/* VISUAL ANALYTICS */}
          {renderStage >= 2 ? (
             <>
             <Text style={s.sectionTitle}>Visual Analytics Trends</Text>
             <View style={[isWide && { flexDirection: 'row', gap: 16, flexWrap: 'wrap' }]}>
                <MiniBarChart title="Overall Fitness Trend" data={data.charts.overall} color="#10B981" />
                <MiniBarChart title="Workout Consistency" data={data.charts.workout} color="#38BDF8" />
                <MiniBarChart title="Nutrition Quality" data={data.charts.nutrition} color="#F59E0B" />
                <MiniBarChart title="Recovery Index" data={data.charts.recovery} color="#A855F7" />
             </View>
             </>
          ) : <SkeletonCard />}

          {/* EXECUTIVE REVIEWS */}
          {renderStage >= 4 ? (
             <>
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
             </>
          ) : <SkeletonCard />}
          
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
  
  summaryGrid: { flexDirection: 'row', gap: 16, marginTop: 24, width: '100%' },
  sumCard: { flex: 1, backgroundColor: 'rgba(30,41,59,0.5)', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#334155' },
  sumCardLab: { color: '#94A3B8', fontSize: 12, fontWeight: '700', marginBottom: 4 },
  sumCardVal: { color: '#F8FAFC', fontSize: 18, fontWeight: '900', marginBottom: 2 },
  sumCardSub: { color: '#64748B', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },

  content: { padding: 24 },

  sectionTitle: { color: '#F8FAFC', fontSize: 20, fontWeight: '900', letterSpacing: -0.5, marginBottom: 16, marginTop: 8 },

  simBtn: { backgroundColor: '#1E293B', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: '#334155' },
  simBtnTxt: { color: '#F8FAFC', fontSize: 14, fontWeight: '800' },

  compCard: { padding: 20, marginBottom: 16 },
  compHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  compTitle: { color: '#F8FAFC', fontSize: 15, fontWeight: '800' },
  compBarBg: { height: 8, backgroundColor: '#0F172A', borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  compBarFill: { height: '100%', borderRadius: 4 },
  compVal: { color: '#F8FAFC', fontSize: 20, fontWeight: '900' },
  compSub: { color: '#64748B', fontSize: 12, fontWeight: '700' },
});
