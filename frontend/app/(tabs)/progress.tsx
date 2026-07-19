import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Text, TouchableOpacity, Animated, Easing, useWindowDimensions, LayoutAnimation, UIManager, Platform, InteractionManager } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useRouter, Tabs } from 'expo-router';
import api from '@/services/api';
import { MealService } from '@/services/mealService';
import { DietPlanService } from '@/services/dietPlanService';
import { WorkoutService } from '@/services/workoutService';
import FitnessProgressEngine, { EngineResult } from '@/services/fitnessProgressEngine';
import PredictionEngine from '@/services/PredictionEngine';
import RecommendationEngine from '@/services/RecommendationEngine';
import GoalSimulationEngine from '@/services/GoalSimulationEngine';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Flame, Dumbbell, Target, HeartPulse, Zap, Crown, CheckCircle2, Circle as CircleIcon, Beaker, ShieldAlert, Check, ArrowRight
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import SkeletonCard from '@/components/SkeletonCard';
import ErrorBoundary from '@/components/ErrorBoundary';
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
    Animated.timing(animatedValue, { toValue: score / 100, duration: 1500, easing: Easing.out(Easing.cubic), useNativeDriver: false, delay: 300 }).start();
  }, [score]);

  const strokeDashoffset = animatedValue.interpolate({ inputRange: [0, 1], outputRange: [circumference, 0] });
  const getColor = () => { if (score >= 90) return '#10B981'; if (score >= 80) return '#38BDF8'; if (score >= 65) return '#F59E0B'; return '#EF4444'; };

  const innerSize = size - strokeWidth * 2;

  return (
    <View style={{ position: 'relative', width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ position: 'absolute', width: innerSize, height: innerSize, borderRadius: innerSize / 2, backgroundColor: getColor(), opacity: 0.15, transform: [{ scale: 1.3 }] }} />
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
  
  // Sandbox State
  const [simDays, setSimDays] = useState(3);
  const [simPro, setSimPro] = useState(150);
  const [simCal, setSimCal] = useState(2500);

  // Daily Calorie Balance State
  const [dailyCalorieBalance, setDailyCalorieBalance] = useState({ consumed: 0, burned: 0, net: 0, status: 'Near Maintenance', statusColor: '#F59E0B', goalFeedback: '', goalFeedbackColor: '' });
  const [proteinAnalysis, setProteinAnalysis] = useState({ consumed: 0, target: 150, remaining: 150, isAchieved: false });
  const [workoutAnalysis, setWorkoutAnalysis] = useState({ burned: 0, duration: 0, efficiency: '0.0', status: 'N/A', color: '#94A3B8' });
  const [mealVsWorkoutAnalysis, setMealVsWorkoutAnalysis] = useState({ consumed: 0, burned: 0, difference: 0, analysis: 'N/A', color: '#94A3B8' });

  const { user } = useAuth();

  useEffect(() => {
    if (!rawData || !rawData.meals || !rawData.workouts) return;
    
    const todayStr = new Date().toDateString();
    
    // Calculate consumed
    let consumed = 0;
    let consumedPro = 0;
    rawData.meals.forEach((m: any) => {
       const mDate = new Date(m.date || m.createdAt).toDateString();
       if (mDate === todayStr) {
           consumed += (m.calories || 0);
           consumedPro += (m.protein || 0);
       }
    });

    // Calculate burned
    let burned = 0;
    let duration = 0;
    rawData.workouts.forEach((w: any) => {
       const wDate = new Date(w.date || w.createdAt).toDateString();
       if (wDate === todayStr) {
           burned += (w.caloriesBurned || 0);
           duration += (w.durationMinutes || w.duration || 0);
       }
    });

    const net = consumed - burned;
    let status = 'Near Maintenance';
    let statusColor = '#F59E0B'; // Orange
    
    if (net > 100) {
       status = 'Calorie Surplus';
       statusColor = '#10B981'; // Green
    } else if (net < -100) {
       status = 'Calorie Deficit';
       statusColor = '#38BDF8'; // Blue
    }

    let goalFeedback = '';
    let goalFeedbackColor = '';
    const userGoal = user?.fitnessGoal || 'Maintain Fitness';

    if (userGoal === 'Weight Loss') {
       if (net < -100) { goalFeedback = '✓ Perfect for Weight Loss'; goalFeedbackColor = '#10B981'; }
       else if (net > 100) { goalFeedback = '⚠ Eating too much'; goalFeedbackColor = '#EF4444'; }
       else { goalFeedback = '⚠ Need more deficit'; goalFeedbackColor = '#F59E0B'; }
    } else if (userGoal === 'Muscle Gain') {
       if (net > 100) { goalFeedback = '✓ Good for Muscle Gain'; goalFeedbackColor = '#10B981'; }
       else if (net < -100) { goalFeedback = '⚠ Eating too little'; goalFeedbackColor = '#EF4444'; }
       else { goalFeedback = '⚠ Need more calories'; goalFeedbackColor = '#F59E0B'; }
    } else {
       if (net >= -100 && net <= 100) { goalFeedback = '✓ Perfect for Maintenance'; goalFeedbackColor = '#10B981'; }
       else if (net > 100) { goalFeedback = '⚠ Eating too much'; goalFeedbackColor = '#EF4444'; }
       else if (net < -100) { goalFeedback = '⚠ Eating too little'; goalFeedbackColor = '#EF4444'; }
    }

    setDailyCalorieBalance({ consumed, burned, net, status, statusColor, goalFeedback, goalFeedbackColor });

    const targetPro = rawData.dietPlan?.protein || 150;
    const remainingPro = Math.max(0, targetPro - consumedPro);
    const isAchieved = consumedPro >= targetPro;
    setProteinAnalysis({ consumed: consumedPro, target: targetPro, remaining: remainingPro, isAchieved });

    const efficiency = duration > 0 ? (burned / duration) : 0;
    let effStatus = 'N/A';
    let effColor = '#94A3B8';
    if (duration > 0) {
        if (efficiency >= 10) { effStatus = 'Excellent'; effColor = '#10B981'; } // > 10
        else if (efficiency >= 7) { effStatus = 'Good'; effColor = '#38BDF8'; } // 7-10
        else if (efficiency >= 4) { effStatus = 'Average'; effColor = '#F59E0B'; } // 4-7
        else { effStatus = 'Poor'; effColor = '#EF4444'; } // < 4
    }
    setWorkoutAnalysis({ burned, duration, efficiency: efficiency.toFixed(1), status: effStatus, color: effColor });

    const diff = consumed - burned;
    let aiAnalysis = 'N/A';
    let aiColor = '#94A3B8';
    if (diff > 700) {
        aiAnalysis = '⚠ You consumed much more calories than you burned today.';
        aiColor = '#EF4444';
    } else if (diff > 300) {
        aiAnalysis = 'Good surplus. Suitable for muscle gain.';
        aiColor = '#10B981';
    } else if (diff >= -300) {
        aiAnalysis = 'Excellent calorie balance.';
        aiColor = '#38BDF8';
    } else if (diff >= -800) {
        aiAnalysis = 'Healthy calorie deficit.';
        aiColor = '#10B981';
    } else {
        aiAnalysis = 'Warning: Large calorie deficit may affect recovery.';
        aiColor = '#EF4444';
    }
    setMealVsWorkoutAnalysis({ consumed, burned, difference: diff, analysis: aiAnalysis, color: aiColor });

  }, [rawData, user]);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const fetchData = useCallback(async () => {
    try {
      console.log('[Lifecycle] Core Started');
      const [analyticsRes, mealsRes, dietPlan, weightRes, workouts] = await Promise.all([
        api.get('/workouts/analytics').catch(e => { console.error('Analytics failed', e); return { data: null }; }),
        MealService.getMeals().catch(e => { console.error('Meals failed', e); return []; }),
        DietPlanService.getMyDietPlan().catch(e => { console.error('DietPlan failed', e); return null; }),
        api.get('/weight').catch(e => { console.error('Weight failed', e); return { data: [] }; }),
        WorkoutService.getWorkouts().catch(e => { console.error('Workouts failed', e); return []; })
      ]);
      
      setRawData({
        analytics: analyticsRes?.data ?? null,
        meals: mealsRes ?? [],
        dietPlan: dietPlan ?? null,
        weightLogs: weightRes?.data ?? [],
        workouts: workouts ?? []
      });
      console.log('[Lifecycle] Core Finished');
    } catch (e: any) {
      console.error('[Lifecycle] Core Critical Failure', e);
      setRawData({ analytics: null, meals: [], dietPlan: null, weightLogs: [], workouts: [] });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);
  const onRefresh = useCallback(() => { setRefreshing(true); fetchData(); }, [fetchData]);

  const [overallState, setOverallState] = useState<{ data: any; loading: boolean; error: any }>({ data: null, loading: true, error: null });
  const [workoutState, setWorkoutState] = useState<{ data: any; loading: boolean; error: any }>({ data: null, loading: true, error: null });
  const [nutritionState, setNutritionState] = useState<{ data: any; loading: boolean; error: any }>({ data: null, loading: true, error: null });
  const [recoveryState, setRecoveryState] = useState<{ data: any; loading: boolean; error: any }>({ data: null, loading: true, error: null });
  const [goalState, setGoalState] = useState<{ data: any; loading: boolean; error: any }>({ data: null, loading: true, error: null });
  const [bodyState, setBodyState] = useState<{ data: any; loading: boolean; error: any }>({ data: null, loading: true, error: null });
  const [adherenceState, setAdherenceState] = useState<{ data: any; loading: boolean; error: any }>({ data: null, loading: true, error: null });
  const [predState, setPredState] = useState<{ data: any; loading: boolean; error: any }>({ data: null, loading: true, error: null });
  const [recState, setRecState] = useState<{ data: any; loading: boolean; error: any }>({ data: null, loading: true, error: null });
  const [chartState, setChartState] = useState<{ data: any; loading: boolean; error: any }>({ data: null, loading: true, error: null });
  const [weeklyReportState, setWeeklyReportState] = useState<{ data: any; loading: boolean; error: any }>({ data: null, loading: true, error: null });
  const [monthlyReportState, setMonthlyReportState] = useState<{ data: any; loading: boolean; error: any }>({ data: null, loading: true, error: null });
  const [achState, setAchState] = useState<{ data: any; loading: boolean; error: any }>({ data: null, loading: true, error: null });

  const overallData = overallState.data;
  const predictionData = predState.data;
  const recommendationData = recState.data;
  const chartData = chartState.data;
  const achievementData = achState.data;

  useEffect(() => {
    if (!rawData || !user) return;
    let isCancelled = false;

    const yieldToUI = () => new Promise<void>(resolve => {
      InteractionManager.runAfterInteractions(() => {
        requestAnimationFrame(() => resolve());
      });
    });

    const params = { user, analytics: rawData.analytics, meals: rawData.meals, dietPlan: rawData.dietPlan, weightLogs: rawData.weightLogs, workouts: rawData.workouts };

    const runWorkout = async () => {
      await yieldToUI();
      if (isCancelled) return null;
      try { const res = FitnessProgressEngine.generateWorkout(params); if (!isCancelled) setWorkoutState({ data: res, loading: false, error: null }); return res; }
      catch (e) { if (!isCancelled) setWorkoutState({ data: null, loading: false, error: e }); throw e; }
    };
    const runNutrition = async () => {
      await yieldToUI();
      if (isCancelled) return null;
      try { const res = FitnessProgressEngine.generateNutrition(params); if (!isCancelled) setNutritionState({ data: res, loading: false, error: null }); return res; }
      catch (e) { if (!isCancelled) setNutritionState({ data: null, loading: false, error: e }); throw e; }
    };
    const runAdherence = async () => {
      await yieldToUI();
      if (isCancelled) return null;
      try { const res = FitnessProgressEngine.generateAdherence(params); if (!isCancelled) setAdherenceState({ data: res, loading: false, error: null }); return res; }
      catch (e) { if (!isCancelled) setAdherenceState({ data: null, loading: false, error: e }); throw e; }
    };
    const runBody = async () => {
      await yieldToUI();
      if (isCancelled) return null;
      try { const res = FitnessProgressEngine.generateBody(params); if (!isCancelled) setBodyState({ data: res, loading: false, error: null }); return res; }
      catch (e) { if (!isCancelled) setBodyState({ data: null, loading: false, error: e }); throw e; }
    };
    const runRecovery = async (nutPromise: Promise<any>) => {
      try {
        let nut = await nutPromise;
        await yieldToUI();
        if (isCancelled) return null;
        const res = FitnessProgressEngine.generateRecovery(params, nut.value);
        if (!isCancelled) setRecoveryState({ data: res, loading: false, error: null });
        return res;
      } catch (e) {
        if (!isCancelled) setRecoveryState({ data: null, loading: false, error: e });
        throw e;
      }
    };
    const runGoal = async (bodyPromise: Promise<any>, workPromise: Promise<any>, nutPromise: Promise<any>) => {
      try {
        let body = await bodyPromise;
        let work = await workPromise;
        let nut = await nutPromise;
        await yieldToUI();
        if (isCancelled) return null;
        const res = FitnessProgressEngine.generateGoal(params, body.bodyData, work.value, nut.value);
        if (!isCancelled) setGoalState({ data: res, loading: false, error: null });
        return res;
      } catch (e) {
        if (!isCancelled) setGoalState({ data: null, loading: false, error: e });
        throw e;
      }
    };
    const runOverall = async (workPromise: Promise<any>, nutPromise: Promise<any>, recPromise: Promise<any>, adhPromise: Promise<any>, goalPromise: Promise<any>, bodyPromise: Promise<any>) => {
      try {
        let work = await workPromise;
        let nut = await nutPromise;
        let rec = await recPromise;
        let adh = await adhPromise;
        let goal = await goalPromise;
        let body = await bodyPromise;
        await yieldToUI();
        if (isCancelled) return null;
        const res = FitnessProgressEngine.generateOverallScore(params, work.value, nut.value, rec.value, adh.value, goal.value, body.value, nut.netCalsLabel, body.bodyData, adh.weeklyPct);
        if (!isCancelled) setOverallState({ data: res, loading: false, error: null });
        return res;
      } catch (e) {
        if (!isCancelled) setOverallState({ data: null, loading: false, error: e });
        throw e;
      }
    };
    const runPred = async () => {
      await yieldToUI();
      if (isCancelled) return null;
      try { const res = PredictionEngine.generate(user, rawData.analytics, rawData.meals, rawData.weightLogs, rawData.dietPlan, rawData.workouts); if (!isCancelled) setPredState({ data: res, loading: false, error: null }); return res; }
      catch (e) { if (!isCancelled) setPredState({ data: null, loading: false, error: e }); throw e; }
    };
    const runRec = async (predPromise: Promise<any>) => {
      let pred; try { pred = await predPromise; } catch (e) {}
      await yieldToUI();
      if (isCancelled) return null;
      try { const res = RecommendationEngine.generate(user, rawData.analytics, rawData.meals, pred || {}, rawData.workouts); if (!isCancelled) setRecState({ data: res, loading: false, error: null }); return res; }
      catch (e) { if (!isCancelled) setRecState({ data: null, loading: false, error: e }); throw e; }
    };
    const runChart = async (workPromise: Promise<any>, nutPromise: Promise<any>, overPromise: Promise<any>) => {
      try {
        let work = await workPromise;
        let nut = await nutPromise;
        let over = await overPromise;
        await yieldToUI();
        if (isCancelled) return null;
        const res = FitnessProgressEngine.generateCharts(params, work.value, nut.value, over.value);
        if (!isCancelled) setChartState({ data: res, loading: false, error: null });
        return res;
      } catch (e) {
        if (!isCancelled) setChartState({ data: null, loading: false, error: e });
        throw e;
      }
    };
    const runWeekly = async (overPromise: Promise<any>, workPromise: Promise<any>, nutPromise: Promise<any>, recPromise: Promise<any>, adhPromise: Promise<any>, predPromise: Promise<any>) => {
      try {
        let over = await overPromise;
        let work = await workPromise;
        let nut = await nutPromise;
        let rec = await recPromise;
        let adh = await adhPromise;
        let pred = await predPromise;
        if (!over || !work || !nut || !rec || !adh || !pred) {
          if (!isCancelled) setWeeklyReportState({ data: null, loading: false, error: new Error('Missing dependencies') });
          return null;
        }
        await yieldToUI();
        if (isCancelled) return null;
        const res = FitnessProgressEngine.generateWeeklyReport(over.value, work.value, nut.value, rec.value, adh.value, over.consistency, pred);
        if (!isCancelled) setWeeklyReportState({ data: res, loading: false, error: null });
        return res;
      } catch (e) {
        if (!isCancelled) setWeeklyReportState({ data: null, loading: false, error: e });
        throw e;
      }
    };
    const runMonthly = async (overPromise: Promise<any>, workPromise: Promise<any>, nutPromise: Promise<any>, recPromise: Promise<any>, adhPromise: Promise<any>, bodyPromise: Promise<any>, predPromise: Promise<any>) => {
      try {
        let over = await overPromise;
        let work = await workPromise;
        let nut = await nutPromise;
        let rec = await recPromise;
        let adh = await adhPromise;
        let body = await bodyPromise;
        let pred = await predPromise;
        if (!over || !work || !nut || !rec || !adh || !body || !pred) {
          if (!isCancelled) setMonthlyReportState({ data: null, loading: false, error: new Error('Missing dependencies') });
          return null;
        }
        await yieldToUI();
        if (isCancelled) return null;
        const res = FitnessProgressEngine.generateMonthlyReport(over.value, work.value, nut.value, rec.value, adh.value, over.consistency, pred, body.bodyData);
        if (!isCancelled) setMonthlyReportState({ data: res, loading: false, error: null });
        return res;
      } catch (e) {
        if (!isCancelled) setMonthlyReportState({ data: null, loading: false, error: e });
        throw e;
      }
    };
    const runAch = async (workPromise: Promise<any>, nutPromise: Promise<any>, recPromise: Promise<any>, adhPromise: Promise<any>, overPromise: Promise<any>) => {
      try {
        let work = await workPromise;
        let nut = await nutPromise;
        let rec = await recPromise;
        let adh = await adhPromise;
        let over = await overPromise;
        await yieldToUI();
        if (isCancelled) return null;
        const res = FitnessProgressEngine.generateAchievements(work.value, nut.value, rec.value, adh.value, over.consistency.streak);
        if (!isCancelled) setAchState({ data: res, loading: false, error: null });
        return res;
      } catch (e) {
        if (!isCancelled) setAchState({ data: null, loading: false, error: e });
        throw e;
      }
    };

    const startTime = Date.now();

    const workP = runWorkout();
    const nutP = runNutrition();
    const adhP = runAdherence();
    const bodyP = runBody();
    const predP = runPred();

    const recovP = runRecovery(nutP);
    const goalP = runGoal(bodyP, workP, nutP);
    const recP = runRec(predP);
    
    const overP = runOverall(workP, nutP, recovP, adhP, goalP, bodyP);
    
    const chartP = runChart(workP, nutP, overP);
    const weeklyP = runWeekly(overP, workP, nutP, recovP, adhP, predP);
    const monthlyP = runMonthly(overP, workP, nutP, recovP, adhP, bodyP, predP);
    const achP = runAch(workP, nutP, recovP, adhP, overP);

    Promise.allSettled([workP, nutP, adhP, bodyP, predP, recovP, goalP, recP, overP, chartP, weeklyP, monthlyP, achP]).then(() => {
      const totalTime = Date.now() - startTime;
      console.log(`[Performance] Fully streaming dashboard hydrated in ${Math.round(totalTime)}ms.`);
    });

    return () => { isCancelled = true; };
  }, [user, rawData]);

  const simResult = useMemo(() => {
     if (!overallData) return null;
     try {
       return GoalSimulationEngine.simulate(
          user?.weight || 70, (user as any)?.targetWeight || 75, user?.fitnessGoal || 'Gain Muscle',
          simDays, simCal, simPro, (user?.weight || 70) * 24 * 1.2
       );
     } catch (e) {
       console.error("Simulation error", e);
       return null;
     }
  }, [user, simDays, simCal, simPro, overallData]);

  const toggleActionPlanItem = useCallback((index: number) => {
    setRecState(prev => {
      if (!prev.data || !prev.data.actionPlan) return prev;
      const newPlan = [...prev.data.actionPlan];
      newPlan[index] = { ...newPlan[index], completed: !newPlan[index].completed };
      return { ...prev, data: { ...prev.data, actionPlan: newPlan } };
    });
  }, []);

  if (loading && !refreshing) return <View style={[s.container, { paddingTop: insets.top }]}><View style={{ padding: 24 }}><SkeletonCard /><SkeletonCard /><SkeletonCard /></View></View>;

  const isWide = width > 768;

  console.log('[Lifecycle] Final Render');

  return (
    <View style={s.container}>
      <Tabs.Screen options={{ headerShown: false }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 100, maxWidth: 1000, width: '100%', alignSelf: 'center' }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#38BDF8" />}>
        <ErrorBoundary fallbackMessage="The dashboard core engine encountered an error.">
        {/* HERO SECTION */}
        {overallState.loading ? (
          <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 24, paddingBottom: 24 }}><SkeletonCard /></View>
        ) : overallData ? (
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
              <MainGauge score={overallData?.healthBalanceIndex ?? 0} label="Health Balance Index" />
            </View>
            <View style={[s.summaryGrid, isWide && { flex: 1, marginLeft: 40 }]}>
              <View style={s.sumCard}>
                <Text style={s.sumCardLab}>Fitness Score</Text>
                <Text style={s.sumCardVal}>{overallData?.value ?? 0}</Text>
                <Text style={s.sumCardSub}>Overall Trajectory</Text>
              </View>
              <View style={s.sumCard}>
                <Text style={s.sumCardLab}>AI Status</Text>
                <Text style={[s.sumCardVal, { color: '#38BDF8', fontSize: 15 }]}>{overallData?.status?.primary ?? 'N/A'}</Text>
                <Text style={s.sumCardSub}>System Assessment</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
        ) : null}

        <View style={s.content}>

          {/* DAILY CALORIE BALANCE */}
          <Text style={s.sectionTitle}>Daily Calorie Balance</Text>
          <View style={[SharedStyles.card, { padding: 20, marginBottom: 24 }]}>
             <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
                <View style={{ alignItems: 'center', flex: 1 }}>
                   <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase' }}>Calories Consumed</Text>
                   <Text style={{ color: '#F8FAFC', fontSize: 18, fontWeight: '900', marginTop: 4 }}>{dailyCalorieBalance.consumed} kcal</Text>
                </View>
                <View style={{ width: 1, height: '100%', backgroundColor: 'rgba(255,255,255,0.1)' }} />
                <View style={{ alignItems: 'center', flex: 1 }}>
                   <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase' }}>Calories Burned</Text>
                   <Text style={{ color: '#F8FAFC', fontSize: 18, fontWeight: '900', marginTop: 4 }}>{dailyCalorieBalance.burned} kcal</Text>
                </View>
             </View>
             <View style={{ backgroundColor: 'rgba(15,23,42,0.6)', padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}>
                <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase' }}>Net Calories</Text>
                <Text style={{ color: '#F8FAFC', fontSize: 24, fontWeight: '900', marginVertical: 4 }}>{dailyCalorieBalance.net} kcal</Text>
                <Text style={{ color: dailyCalorieBalance.statusColor, fontSize: 14, fontWeight: '800', textTransform: 'uppercase', marginBottom: 8 }}>{dailyCalorieBalance.status}</Text>
                {dailyCalorieBalance.goalFeedback ? (
                   <View style={{ backgroundColor: 'rgba(0,0,0,0.3)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100 }}>
                      <Text style={{ color: dailyCalorieBalance.goalFeedbackColor, fontSize: 13, fontWeight: '800' }}>{dailyCalorieBalance.goalFeedback}</Text>
                   </View>
                ) : null}
             </View>
          </View>

          {/* PROTEIN ANALYSIS */}
          <Text style={s.sectionTitle}>Protein Analysis</Text>
          <View style={[SharedStyles.card, { padding: 20, marginBottom: 24 }]}>
             <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
                <View style={{ alignItems: 'center', flex: 1 }}>
                   <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase' }}>Consumed</Text>
                   <Text style={{ color: '#F8FAFC', fontSize: 18, fontWeight: '900', marginTop: 4 }}>{proteinAnalysis.consumed}g</Text>
                </View>
                <View style={{ width: 1, height: '100%', backgroundColor: 'rgba(255,255,255,0.1)' }} />
                <View style={{ alignItems: 'center', flex: 1 }}>
                   <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase' }}>Target</Text>
                   <Text style={{ color: '#F8FAFC', fontSize: 18, fontWeight: '900', marginTop: 4 }}>{proteinAnalysis.target}g</Text>
                </View>
                <View style={{ width: 1, height: '100%', backgroundColor: 'rgba(255,255,255,0.1)' }} />
                <View style={{ alignItems: 'center', flex: 1 }}>
                   <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase' }}>Remaining</Text>
                   <Text style={{ color: '#F8FAFC', fontSize: 18, fontWeight: '900', marginTop: 4 }}>{proteinAnalysis.remaining}g</Text>
                </View>
             </View>
             <View style={{ backgroundColor: 'rgba(15,23,42,0.6)', padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}>
                {proteinAnalysis.isAchieved ? (
                   <Text style={{ color: '#10B981', fontSize: 14, fontWeight: '800', textTransform: 'uppercase' }}>✓ Protein Goal Achieved</Text>
                ) : (
                   <Text style={{ color: '#F59E0B', fontSize: 14, fontWeight: '800', textTransform: 'uppercase' }}>Need {proteinAnalysis.remaining}g more protein today</Text>
                )}
             </View>
          </View>

          {/* WORKOUT EFFICIENCY ANALYSIS */}
          <Text style={s.sectionTitle}>Workout Efficiency</Text>
          <View style={[SharedStyles.card, { padding: 20, marginBottom: 24 }]}>
             <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
                <View style={{ alignItems: 'center', flex: 1 }}>
                   <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', textAlign: 'center' }}>Burned</Text>
                   <Text style={{ color: '#F8FAFC', fontSize: 18, fontWeight: '900', marginTop: 4 }}>{workoutAnalysis.burned} kcal</Text>
                </View>
                <View style={{ width: 1, height: '100%', backgroundColor: 'rgba(255,255,255,0.1)' }} />
                <View style={{ alignItems: 'center', flex: 1 }}>
                   <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', textAlign: 'center' }}>Duration</Text>
                   <Text style={{ color: '#F8FAFC', fontSize: 18, fontWeight: '900', marginTop: 4 }}>{workoutAnalysis.duration} min</Text>
                </View>
                <View style={{ width: 1, height: '100%', backgroundColor: 'rgba(255,255,255,0.1)' }} />
                <View style={{ alignItems: 'center', flex: 1 }}>
                   <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', textAlign: 'center' }}>Efficiency</Text>
                   <Text style={{ color: '#F8FAFC', fontSize: 18, fontWeight: '900', marginTop: 4 }}>{workoutAnalysis.efficiency} c/m</Text>
                </View>
             </View>
             <View style={{ backgroundColor: 'rgba(15,23,42,0.6)', padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}>
                <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase' }}>Efficiency Rating</Text>
                <Text style={{ color: workoutAnalysis.color, fontSize: 16, fontWeight: '800', textTransform: 'uppercase', marginTop: 4 }}>{workoutAnalysis.status}</Text>
             </View>
          </View>

          {/* MEAL VS WORKOUT ANALYSIS */}
          <Text style={s.sectionTitle}>Meal vs Workout</Text>
          <View style={[SharedStyles.card, { padding: 20, marginBottom: 24 }]}>
             <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
                <View style={{ alignItems: 'center', flex: 1 }}>
                   <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', textAlign: 'center' }}>Calories Eaten</Text>
                   <Text style={{ color: '#F8FAFC', fontSize: 18, fontWeight: '900', marginTop: 4 }}>{mealVsWorkoutAnalysis.consumed} kcal</Text>
                </View>
                <View style={{ width: 1, height: '100%', backgroundColor: 'rgba(255,255,255,0.1)' }} />
                <View style={{ alignItems: 'center', flex: 1 }}>
                   <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', textAlign: 'center' }}>Calories Burned</Text>
                   <Text style={{ color: '#F8FAFC', fontSize: 18, fontWeight: '900', marginTop: 4 }}>{mealVsWorkoutAnalysis.burned} kcal</Text>
                </View>
                <View style={{ width: 1, height: '100%', backgroundColor: 'rgba(255,255,255,0.1)' }} />
                <View style={{ alignItems: 'center', flex: 1 }}>
                   <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', textAlign: 'center' }}>Difference</Text>
                   <Text style={{ color: '#F8FAFC', fontSize: 18, fontWeight: '900', marginTop: 4 }}>{mealVsWorkoutAnalysis.difference} kcal</Text>
                </View>
             </View>
             <View style={{ backgroundColor: 'rgba(15,23,42,0.6)', padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}>
                <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase' }}>AI Analysis</Text>
                <Text style={{ color: mealVsWorkoutAnalysis.color, fontSize: 14, fontWeight: '800', textAlign: 'center', marginTop: 4 }}>{mealVsWorkoutAnalysis.analysis}</Text>
             </View>
          </View>

          {/* AI ACHIEVEMENTS */}
          {achState.loading ? <SkeletonCard /> : achievementData && achievementData.length > 0 ? (
             <View style={{ marginBottom: 24 }}>
                <Text style={[s.sectionTitle, { fontSize: 16 }]}>AI Unlocked Achievements</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ maxWidth: 800, width: '100%', alignSelf: 'center',  gap: 12 }}>
                   {achievementData?.map((ach: any, i: number) => (
                      <View key={i} style={{ backgroundColor: 'rgba(56,189,248,0.1)', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 100, borderWidth: 1, borderColor: 'rgba(56,189,248,0.3)', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                         <Crown size={16} color="#38BDF8" />
                         <Text style={{ color: '#38BDF8', fontSize: 13, fontWeight: '800' }}>{ach}</Text>
                      </View>
                   ))}
                </ScrollView>
             </View>
          ) : null}

          {/* SMART DAILY ACTION PLAN */}
          {recState.loading ? <SkeletonCard /> : recommendationData ? (
          <>
          <Text style={s.sectionTitle}>Today's Action Plan</Text>
          <View style={[SharedStyles.card, { padding: 20, marginBottom: 24 }]}>
             <View style={{ gap: 16 }}>
                {recommendationData?.actionPlan?.map((action: any, i: number) => (
                   <TouchableOpacity key={i} activeOpacity={0.7} onPress={() => toggleActionPlanItem(i)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      {action.completed ? <CheckCircle2 size={24} color="#10B981" /> : <CircleIcon size={24} color="#64748B" />}
                      <View style={{ flex: 1 }}>
                         <Text style={{ color: action.completed ? '#10B981' : '#F8FAFC', fontSize: 15, fontWeight: '800', textDecorationLine: action.completed ? 'line-through' : 'none' }}>{action.task}</Text>
                         <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '600', marginTop: 2 }}>{action.reason}</Text>
                      </View>
                   </TouchableOpacity>
                ))}
             </View>
          </View>
          </>
          ) : null}

          {/* XAI ADAPTIVE RECOMMENDATIONS */}
          {recommendationData ? (
             (recommendationData?.adaptiveDiet || recommendationData?.adaptiveWorkout) && (
             <View style={{ marginBottom: 24 }}>
                <Text style={s.sectionTitle}>AI Decision Support</Text>
                <View style={{ gap: 12 }}>
                   {recommendationData?.adaptiveDiet && (
                      <View style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(245, 158, 11, 0.3)' }}>
                         <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <Flame size={18} color="#F59E0B" />
                            <Text style={{ color: '#F59E0B', fontSize: 14, fontWeight: '900', textTransform: 'uppercase' }}>Adaptive Diet Recommendation</Text>
                         </View>
                         <Text style={{ color: '#F8FAFC', fontSize: 18, fontWeight: '800', marginBottom: 16 }}>Try: {recommendationData?.adaptiveDiet?.recommendedMeal ?? 'N/A'}</Text>
                         
                         <View style={{ backgroundColor: 'rgba(15,23,42,0.6)', padding: 12, borderRadius: 8, gap: 8, marginBottom: 16 }}>
                            <View><Text style={{ color: '#94A3B8', fontSize: 11, fontWeight: '700' }}>Reason</Text><Text style={{ color: '#F8FAFC', fontSize: 13, fontWeight: '600' }}>{recommendationData?.adaptiveDiet?.reason}</Text></View>
                            <View><Text style={{ color: '#94A3B8', fontSize: 11, fontWeight: '700' }}>Evidence</Text><Text style={{ color: '#EF4444', fontSize: 13, fontWeight: '600' }}>{recommendationData?.adaptiveDiet?.evidence}</Text></View>
                            <View><Text style={{ color: '#94A3B8', fontSize: 11, fontWeight: '700' }}>Expected Outcome</Text><Text style={{ color: '#10B981', fontSize: 13, fontWeight: '600' }}>{recommendationData?.adaptiveDiet?.expectedOutcome}</Text></View>
                         </View>

                         <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <View style={{ flex: 1, alignItems: 'center' }}>
                               <Text style={{ color: '#94A3B8', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' }}>Current Diet</Text>
                               <Text style={{ color: '#EF4444', fontSize: 14, fontWeight: '800', marginTop: 4, textAlign: 'center' }}>{recommendationData?.adaptiveDiet?.originalMacro}</Text>
                            </View>
                            <ArrowRight size={20} color="#F8FAFC" />
                            <View style={{ flex: 1, alignItems: 'center' }}>
                               <Text style={{ color: '#94A3B8', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' }}>Recommended</Text>
                               <Text style={{ color: '#10B981', fontSize: 14, fontWeight: '800', marginTop: 4, textAlign: 'center' }}>{recommendationData?.adaptiveDiet?.targetMacro}</Text>
                            </View>
                         </View>
                      </View>
                   )}

                   {recommendationData?.adaptiveWorkout && (
                      <View style={{ backgroundColor: 'rgba(56, 189, 248, 0.1)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.3)' }}>
                         <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <Dumbbell size={18} color="#38BDF8" />
                            <Text style={{ color: '#38BDF8', fontSize: 14, fontWeight: '900', textTransform: 'uppercase' }}>Adaptive Workout Override</Text>
                         </View>
                         <Text style={{ color: '#F8FAFC', fontSize: 18, fontWeight: '800', marginBottom: 16 }}>Switch to: {recommendationData?.adaptiveWorkout?.recommendedWorkout ?? 'N/A'}</Text>
                         
                         <View style={{ backgroundColor: 'rgba(15,23,42,0.6)', padding: 12, borderRadius: 8, gap: 8 }}>
                            <View><Text style={{ color: '#94A3B8', fontSize: 11, fontWeight: '700' }}>Reason</Text><Text style={{ color: '#F8FAFC', fontSize: 13, fontWeight: '600' }}>{recommendationData?.adaptiveWorkout?.reason}</Text></View>
                            <View><Text style={{ color: '#94A3B8', fontSize: 11, fontWeight: '700' }}>Evidence</Text><Text style={{ color: '#EF4444', fontSize: 13, fontWeight: '600' }}>{recommendationData?.adaptiveWorkout?.evidence}</Text></View>
                            <View><Text style={{ color: '#94A3B8', fontSize: 11, fontWeight: '700' }}>Expected Outcome</Text><Text style={{ color: '#10B981', fontSize: 13, fontWeight: '600' }}>{recommendationData?.adaptiveWorkout?.expectedOutcome}</Text></View>
                         </View>
                      </View>
                   )}
                </View>
             </View>
             )
          ) : null}

          {/* GOAL SIMULATION ENGINE (SANDBOX) */}
          {overallState.loading ? <SkeletonCard /> : overallData ? (
          <>
          <Text style={s.sectionTitle}>Goal Simulation Engine</Text>
          <Text style={{ color: '#94A3B8', fontSize: 13, fontWeight: '600', marginBottom: 16 }}>Simulate changes to your routine to predict future physiological outcomes. This does not alter your actual data.</Text>
          <View style={[SharedStyles.card, { padding: 20, marginBottom: 24 }]}>
             <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <Beaker size={20} color="#A855F7" />
                <Text style={{ color: '#A855F7', fontSize: 16, fontWeight: '900' }}>Predictive Sandbox</Text>
             </View>

             <View style={[isWide && { flexDirection: 'row', gap: 16 }, { marginBottom: 24 }]}>
                <View style={[{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(30,41,59,0.5)', padding: 8, borderRadius: 12, marginBottom: isWide ? 0 : 12 }, isWide && { flex: 1 }]}>
                   <TouchableOpacity activeOpacity={0.7} onPress={() => setSimDays(Math.max(0, simDays-1))} style={[s.simBtn, { paddingHorizontal: 16 }]}><Text style={s.simBtnTxt}>-</Text></TouchableOpacity>
                   <View style={{ flex: 1, alignItems: 'center' }}>
                      <Text style={{ color: '#94A3B8', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', marginBottom: 2 }}>Workouts</Text>
                      <Text style={{ color: '#F8FAFC', fontSize: 15, fontWeight: '900' }}>{simDays} / Wk</Text>
                   </View>
                   <TouchableOpacity activeOpacity={0.7} onPress={() => setSimDays(Math.min(7, simDays+1))} style={[s.simBtn, { paddingHorizontal: 16 }]}><Text style={s.simBtnTxt}>+</Text></TouchableOpacity>
                </View>

                <View style={[{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(30,41,59,0.5)', padding: 8, borderRadius: 12, marginBottom: isWide ? 0 : 12 }, isWide && { flex: 1 }]}>
                   <TouchableOpacity activeOpacity={0.7} onPress={() => setSimCal(Math.max(1000, simCal-250))} style={[s.simBtn, { paddingHorizontal: 16 }]}><Text style={s.simBtnTxt}>-</Text></TouchableOpacity>
                   <View style={{ flex: 1, alignItems: 'center' }}>
                      <Text style={{ color: '#94A3B8', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', marginBottom: 2 }}>Calories</Text>
                      <Text style={{ color: '#F8FAFC', fontSize: 15, fontWeight: '900' }}>{simCal} kcal</Text>
                   </View>
                   <TouchableOpacity activeOpacity={0.7} onPress={() => setSimCal(Math.min(5000, simCal+250))} style={[s.simBtn, { paddingHorizontal: 16 }]}><Text style={s.simBtnTxt}>+</Text></TouchableOpacity>
                </View>

                <View style={[{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(30,41,59,0.5)', padding: 8, borderRadius: 12, marginBottom: isWide ? 0 : 12 }, isWide && { flex: 1 }]}>
                   <TouchableOpacity activeOpacity={0.7} onPress={() => setSimPro(Math.max(50, simPro-25))} style={[s.simBtn, { paddingHorizontal: 16 }]}><Text style={s.simBtnTxt}>-</Text></TouchableOpacity>
                   <View style={{ flex: 1, alignItems: 'center' }}>
                      <Text style={{ color: '#94A3B8', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', marginBottom: 2 }}>Protein</Text>
                      <Text style={{ color: '#F8FAFC', fontSize: 15, fontWeight: '900' }}>{simPro} g</Text>
                   </View>
                   <TouchableOpacity activeOpacity={0.7} onPress={() => setSimPro(Math.min(300, simPro+25))} style={[s.simBtn, { paddingHorizontal: 16 }]}><Text style={s.simBtnTxt}>+</Text></TouchableOpacity>
                </View>
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
                      <Text style={{ color: simResult?.metabolicRisk?.includes('High') || simResult?.metabolicRisk?.includes('Critical') ? '#EF4444' : '#10B981', fontSize: 13, fontWeight: '900' }}>{simResult.metabolicRisk}</Text>
                   </View>
                   </>
                ) : (
                   <Text style={{ color: '#94A3B8', fontSize: 13 }}>Simulating...</Text>
                )}
             </View>
          </View>
          </>
          ) : null}

          {/* EXPLAINABLE PILLAR SCORECARDS */}
          {overallState.loading || workoutState.loading || nutritionState.loading || adherenceState.loading || recoveryState.loading || goalState.loading || bodyState.loading ? <SkeletonCard /> : overallData ? (
             <>
             <Text style={s.sectionTitle}>XAI Diagnostic Core</Text>
             <Text style={{ color: '#94A3B8', fontSize: 13, fontWeight: '600', marginBottom: 16 }}>Tap any pillar to reveal transparent AI reasoning, impact weights, and expected outcomes.</Text>
             
             <View style={[isWide && { flexDirection: 'row', gap: 16, flexWrap: 'wrap' }]}>
               <PillarCard icon={Dumbbell} title="Workout Performance" data={workoutState.data} color="#38BDF8" />
               <PillarCard icon={Flame} title="Nutrition Quality" data={nutritionState.data} color="#F59E0B" />
               <PillarCard icon={Target} title="Diet Adherence" data={adherenceState.data} color="#10B981" />
               <PillarCard icon={Zap} title="Recovery Score" data={recoveryState.data} color="#A855F7" />
               <PillarCard icon={Crown} title="Goal Achievement" data={goalState.data} color="#F59E0B" />
               <PillarCard icon={HeartPulse} title="Body Progress" data={bodyState.data} color="#8B5CF6" />
             </View>
             </>
          ) : null}

          {/* VISUAL ANALYTICS */}
          {chartState.loading ? <SkeletonCard /> : chartData ? (
             <>
             <Text style={s.sectionTitle}>Visual Analytics Trends</Text>
             <View style={[isWide && { flexDirection: 'row', gap: 16, flexWrap: 'wrap' }]}>
                <MiniBarChart title="Overall Fitness Trend" data={chartData?.overall ?? []} color="#10B981" />
                <MiniBarChart title="Workout Consistency" data={chartData?.workout ?? []} color="#38BDF8" />
                <MiniBarChart title="Nutrition Quality" data={chartData?.nutrition ?? []} color="#F59E0B" />
                <MiniBarChart title="Recovery Index" data={chartData?.recovery ?? []} color="#A855F7" />
             </View>
             </>
          ) : null}

          {/* EXECUTIVE REVIEWS */}
          {weeklyReportState.loading || monthlyReportState.loading ? <SkeletonCard /> : (weeklyReportState.data && monthlyReportState.data) ? (
             <>
             <Text style={s.sectionTitle}>Executive AI Reviews</Text>
             <View style={[isWide && { flexDirection: 'row', gap: 16 }]}>
                <LinearGradient colors={['rgba(56, 189, 248, 0.15)', 'rgba(15,23,42,0.8)']} style={[SharedStyles.card, { backgroundColor: 'transparent', padding: 20, marginBottom: 16, flex: 1, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.2)' }]}>
                   <Text style={{ color: '#38BDF8', fontSize: 14, fontWeight: '900', textTransform: 'uppercase', marginBottom: 16 }}>Weekly Coach Summary</Text>
                   <View style={{ gap: 12 }}>
                      <View><Text style={{ color: '#64748B', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' }}>Biggest Achievement</Text><Text style={{ color: '#10B981', fontSize: 14, fontWeight: '800' }}>{weeklyReportState.data?.biggestAchievement ?? 'N/A'}</Text></View>
                      <View><Text style={{ color: '#64748B', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' }}>Critical Mistake</Text><Text style={{ color: '#EF4444', fontSize: 14, fontWeight: '800' }}>{weeklyReportState.data?.biggestMistake ?? 'N/A'}</Text></View>
                      <View><Text style={{ color: '#64748B', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' }}>Strongest Habit</Text><Text style={{ color: '#F8FAFC', fontSize: 14, fontWeight: '800' }}>{weeklyReportState.data?.strongestHabit ?? 'N/A'}</Text></View>
                      <View><Text style={{ color: '#64748B', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' }}>Weakest Habit</Text><Text style={{ color: '#F8FAFC', fontSize: 14, fontWeight: '800' }}>{weeklyReportState.data?.weakestHabit ?? 'N/A'}</Text></View>
                      <View style={{ marginTop: 8, paddingTop: 12, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}><Text style={{ color: '#64748B', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' }}>Next Week Focus</Text><Text style={{ color: '#38BDF8', fontSize: 14, fontWeight: '800' }}>{weeklyReportState.data?.nextWeekFocus ?? 'N/A'}</Text></View>
                   </View>
                </LinearGradient>
                
                <LinearGradient colors={['rgba(168, 85, 247, 0.15)', 'rgba(15,23,42,0.8)']} style={[SharedStyles.card, { backgroundColor: 'transparent', padding: 20, marginBottom: 24, flex: 1, borderWidth: 1, borderColor: 'rgba(168, 85, 247, 0.2)' }]}>
                   <Text style={{ color: '#A855F7', fontSize: 14, fontWeight: '900', textTransform: 'uppercase', marginBottom: 16 }}>Monthly Analytics Report</Text>
                   <View style={{ gap: 12 }}>
                      <View><Text style={{ color: '#64748B', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' }}>Overall Trajectory</Text><Text style={{ color: monthlyReportState.data?.overallImprovement?.includes('+') ? '#10B981' : '#EF4444', fontSize: 14, fontWeight: '800' }}>{monthlyReportState.data?.overallImprovement ?? 'N/A'}</Text></View>
                      <View><Text style={{ color: '#64748B', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' }}>Weight Change</Text><Text style={{ color: '#F8FAFC', fontSize: 14, fontWeight: '800' }}>{monthlyReportState.data?.weightChange ?? 'N/A'}</Text></View>
                      <View style={{ flexDirection: 'row', gap: 16 }}>
                         <View style={{ flex: 1 }}><Text style={{ color: '#64748B', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' }}>Workout Consistency</Text><Text style={{ color: '#F8FAFC', fontSize: 14, fontWeight: '800' }}>{monthlyReportState.data?.workoutConsistency ?? 'N/A'}</Text></View>
                         <View style={{ flex: 1 }}><Text style={{ color: '#64748B', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' }}>Nutrition Consistency</Text><Text style={{ color: '#F8FAFC', fontSize: 14, fontWeight: '800' }}>{monthlyReportState.data?.nutritionConsistency ?? 'N/A'}</Text></View>
                      </View>
                      <View><Text style={{ color: '#64748B', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' }}>Goal Prediction</Text><Text style={{ color: '#F59E0B', fontSize: 14, fontWeight: '800' }}>{monthlyReportState.data?.goalPrediction ?? 'N/A'}</Text></View>
                      <View style={{ marginTop: 8, paddingTop: 12, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}><Text style={{ color: '#64748B', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' }}>Conclusion</Text><Text style={{ color: '#A855F7', fontSize: 13, fontWeight: '800', lineHeight: 20 }}>{monthlyReportState.data?.coachConclusion ?? 'N/A'}</Text></View>
                   </View>
                </LinearGradient>
             </View>
             </>
          ) : null}
          
        </View>
        </ErrorBoundary>
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

  sectionTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: '900', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 20, marginTop: 12 },

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
