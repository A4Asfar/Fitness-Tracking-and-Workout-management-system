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
  const [weeklyCalorieBalance, setWeeklyCalorieBalance] = useState({ chartData: [] as any[], analysis: 'N/A', color: '#94A3B8', average: 0 });
  const [caloriesInOutAnalysis, setCaloriesInOutAnalysis] = useState({ calIn: 0, calOut: 0, netInOut: 0, color: '#10B981', msg: '' });
  const [nutritionQuality, setNutritionQuality] = useState({ protein: 0, carbs: 0, fats: 0, calories: 0, score: 0, feedback: 'No nutrition data available today.', color: '#94A3B8' });
  const [aiCoachInsights, setAiCoachInsights] = useState<{text: string, type: 'positive' | 'suggestion' | 'warning', icon: string}[]>([]);
  const [predictionAnalysis, setPredictionAnalysis] = useState<{ progress: number, estWeeks: number, pace: string, probability: number, probColor: string, trend: string, text: string } | null>(null);
  const [healthRiskAnalysis, setHealthRiskAnalysis] = useState<{ level: string, color: string, risks: { name: string, reason: string, fix: string }[] } | null>(null);
  const [weeklyPerformanceReport, setWeeklyPerformanceReport] = useState<{ grade: string, gradeColor: string, achievement: string, mistake: string, strongHabit: string, weakHabit: string, nextFocus: string, summary: string } | null>(null);
  const [aiFitnessDashboard, setAiFitnessDashboard] = useState<any>(null);
  const [aiDailyCoach, setAiDailyCoach] = useState<any>(null);
  const [detailedCaloriesBalance, setDetailedCaloriesBalance] = useState<any>(null);
  const [recoveryEnergyBalance, setRecoveryEnergyBalance] = useState<any>(null);

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

    // Calculate last 7 days
    const weekData: { [key: string]: { dayName: string, net: number } } = {};
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Initialize last 7 days (including today)
    const now = new Date();
    const last7Days = Array.from({length: 7}).map((_, i) => {
        const d = new Date(now);
        d.setDate(d.getDate() - (6 - i));
        return d;
    });

    // Populate weekData map
    last7Days.forEach(d => {
        const dStr = d.toDateString();
        weekData[dStr] = { dayName: dayNames[d.getDay()], net: 0 };
    });

    // Consumed
    rawData.meals.forEach((m: any) => {
       const mDate = new Date(m.date || m.createdAt).toDateString();
       if (weekData[mDate]) {
           weekData[mDate].net += (m.calories || 0);
       }
    });

    // Burned
    rawData.workouts.forEach((w: any) => {
       const wDate = new Date(w.date || w.createdAt).toDateString();
       if (weekData[wDate]) {
           weekData[wDate].net -= (w.caloriesBurned || 0);
       }
    });

    const weeklyChartData = last7Days.map(d => {
        const dStr = d.toDateString();
        return {
           day: weekData[dStr].dayName,
           net: weekData[dStr].net
        };
    });

    const totalWeeklyNet = weeklyChartData.reduce((acc, curr) => acc + curr.net, 0);
    const avgWeeklyNet = totalWeeklyNet / 7;

    let weeklyAnalysis = '';
    let weeklyColor = '#94A3B8';
    if (avgWeeklyNet > 300) {
        weeklyAnalysis = 'Weekly calorie surplus detected.\nSuitable for muscle gain.';
        weeklyColor = '#10B981';
    } else if (avgWeeklyNet < -300) {
        weeklyAnalysis = 'Weekly calorie deficit detected.\nSuitable for fat loss.';
        weeklyColor = '#38BDF8';
    } else {
        weeklyAnalysis = 'Excellent calorie balance maintained this week.';
        weeklyColor = '#10B981';
    }

    setWeeklyCalorieBalance({ chartData: weeklyChartData, analysis: weeklyAnalysis, color: weeklyColor, average: avgWeeklyNet });

    const calIn = consumed || 0;
    const calOut = burned || 0;
    const netInOut = calIn - calOut;
    let inOutColor = '#10B981';
    let inOutMsg = '✅ Excellent balance between food intake and exercise.';
    if (userGoal === 'Weight Loss') {
       if (netInOut < -800) { inOutColor = '#EF4444'; inOutMsg = '⚠ Your calorie deficit is too aggressive.'; }
       else if (netInOut <= -300) { inOutColor = '#10B981'; inOutMsg = '⚡ Perfect fat-loss range.'; }
       else if (netInOut < 0) { inOutColor = '#F59E0B'; inOutMsg = '⚠ Small deficit, consider increasing activity.'; }
       else { inOutColor = '#EF4444'; inOutMsg = "⚠ You're eating more than you're burning today."; }
    } else if (userGoal === 'Muscle Gain') {
       if (netInOut > 800) { inOutColor = '#EF4444'; inOutMsg = "⚠ You're eating too much today."; }
       else if (netInOut >= 300) { inOutColor = '#10B981'; inOutMsg = '⚡ Great muscle-gain surplus.'; }
       else if (netInOut > 0) { inOutColor = '#F59E0B'; inOutMsg = '⚠ Small surplus, consider eating a bit more.'; }
       else { inOutColor = '#EF4444'; inOutMsg = '⚠ You are in a deficit, bad for muscle gain.'; }
    } else {
       if (netInOut > 300) { inOutColor = '#EF4444'; inOutMsg = "⚠ You're eating more than you're burning today."; }
       else if (netInOut < -300) { inOutColor = '#EF4444'; inOutMsg = '⚠ Your calorie deficit is too aggressive.'; }
       else { inOutColor = '#10B981'; inOutMsg = '✅ Excellent balance between food intake and exercise.'; }
    }
    setCaloriesInOutAnalysis({ calIn, calOut, netInOut, color: inOutColor, msg: inOutMsg });

    // Nutrition Quality Analysis
    let totalP = 0;
    let totalC = 0;
    let totalF = 0;
    let totalCal = 0;
    let mealsLogged = 0;
    
    rawData.meals.forEach((m: any) => {
       const mDate = new Date(m.date || m.createdAt).toDateString();
       if (mDate === todayStr) {
           totalP += (m.protein || 0);
           totalC += (m.carbs || 0);
           totalF += (m.fats || 0);
           totalCal += (m.calories || 0);
           mealsLogged++;
       }
    });

    const targetP = rawData.dietPlan?.protein || 150;
    const targetCal = rawData.dietPlan?.calories || 2500;
    const targetC = rawData.dietPlan?.carbs || 250;
    const targetF = rawData.dietPlan?.fats || 70;

    let score = 0;
    let aiFeedback = '';
    let aiFeedbackColor = '#94A3B8';

    if (mealsLogged === 0) {
        aiFeedback = 'No nutrition data available today.';
    } else {
        // Scoring Rules
        if (totalP >= targetP * 0.8) score += 40;
        if (totalCal >= targetCal * 0.85 && totalCal <= targetCal * 1.15) score += 25;
        if (totalC > 0) score += 15;
        if (totalF > 0) score += 10;
        if (mealsLogged > 0) score += 10;
        
        score = Math.min(100, Math.max(0, score));

        // Feedback Logic
        if (score >= 90) { aiFeedback = '✅ Excellent nutrition quality today.'; aiFeedbackColor = '#10B981'; }
        else if (totalP < targetP * 0.5) { aiFeedback = '⚠ Increase your protein intake.'; aiFeedbackColor = '#F59E0B'; }
        else if (totalCal < targetCal * 0.5) { aiFeedback = '⚠ Calories are too low for recovery.'; aiFeedbackColor = '#EF4444'; }
        else if (totalF > targetF * 1.3) { aiFeedback = '⚠ Fat intake is higher than recommended.'; aiFeedbackColor = '#EF4444'; }
        else if (totalC < targetC * 0.5) { aiFeedback = '⚠ Carbohydrates are insufficient for workout performance.'; aiFeedbackColor = '#F59E0B'; }
        else { aiFeedback = '⚡ Protein intake is excellent.'; aiFeedbackColor = '#38BDF8'; }
    }

    setNutritionQuality({ protein: totalP, carbs: totalC, fats: totalF, calories: totalCal, score, feedback: aiFeedback, color: aiFeedbackColor });

    // AI Coach Insights
    const insights: { text: string, type: 'positive' | 'suggestion' | 'warning', icon: string }[] = [];
    const recentWorkouts = rawData.workouts.filter((w: any) => {
        const d = new Date(w.date || w.createdAt);
        return (new Date().getTime() - d.getTime()) < 7 * 24 * 60 * 60 * 1000;
    });

    if (rawData.workouts.length === 0 && rawData.meals.length === 0) {
        // Not enough data
    } else {
        // Insight 1: Workout consistency
        if (recentWorkouts.length >= 4) {
            insights.push({ text: 'You trained consistently this week. Great job!', type: 'positive', icon: '🏋️' });
        } else if (recentWorkouts.length >= 1) {
            insights.push({ text: 'You had a few workouts this week. Try to increase frequency.', type: 'suggestion', icon: '⚡' });
        } else {
            insights.push({ text: 'No workouts recorded this week. Time to get moving!', type: 'warning', icon: '⚠' });
        }

        // Insight 2: Protein
        if (totalP >= targetP * 0.9) {
            insights.push({ text: 'Protein intake is excellent today. Ideal for muscle recovery.', type: 'positive', icon: '🥩' });
        } else if (totalP >= targetP * 0.5) {
            insights.push({ text: 'Your protein intake is okay, but could be higher.', type: 'suggestion', icon: '💡' });
        } else {
            insights.push({ text: 'Your protein intake needs improvement today.', type: 'warning', icon: '⚠' });
        }

        // Insight 3: Calorie Balance
        if (userGoal === 'Weight Loss') {
            if (avgWeeklyNet < -800) insights.push({ text: 'Your weekly calorie deficit is very aggressive. Watch your recovery.', type: 'warning', icon: '⚠' });
            else if (avgWeeklyNet <= -200) insights.push({ text: 'Your calorie deficit is ideal for fat loss.', type: 'positive', icon: '🔥' });
            else insights.push({ text: 'You need a larger calorie deficit for effective weight loss.', type: 'suggestion', icon: '💡' });
        } else if (userGoal === 'Muscle Gain') {
            if (avgWeeklyNet >= 200 && avgWeeklyNet <= 600) insights.push({ text: 'Great muscle-gain surplus maintained this week.', type: 'positive', icon: '⚡' });
            else if (avgWeeklyNet > 600) insights.push({ text: 'Weekly surplus is quite high. Watch for excessive fat gain.', type: 'warning', icon: '⚠' });
            else insights.push({ text: 'You need a calorie surplus to effectively build muscle.', type: 'suggestion', icon: '💡' });
        } else {
            if (Math.abs(avgWeeklyNet) < 200) insights.push({ text: 'Excellent calorie balance maintained this week.', type: 'positive', icon: '🎯' });
            else insights.push({ text: 'Try to align your calorie intake closer to maintenance.', type: 'suggestion', icon: '💡' });
        }

        // Insight 4: Progress Status
        if (score >= 80 && recentWorkouts.length >= 3) {
            insights.push({ text: "You're on track to achieve your goal. Keep it up!", type: 'positive', icon: '🎯' });
        } else if (score < 50) {
            insights.push({ text: "Nutrition quality is low. Try focusing on whole foods.", type: 'suggestion', icon: '🥗' });
        }

        // Insight 5: Recovery
        if (recentWorkouts.length >= 6) {
            insights.push({ text: 'High workout volume detected. Consider taking a rest day for recovery.', type: 'warning', icon: '😴' });
        } else {
            insights.push({ text: 'Recovery seems adequate based on training volume.', type: 'positive', icon: '🔋' });
        }
    }
    setAiCoachInsights(insights.slice(0, 5));

    // AI Progress Prediction
    const currentWeight = user?.weight || 0;
    const targetWeight = user?.targetWeight || 0;
    const startWeight = user?.startWeight || (currentWeight > 0 ? currentWeight + (userGoal === 'Weight Loss' ? 5 : -5) : 0);

    let currentProgress = 0;
    if (startWeight > 0 && targetWeight > 0 && startWeight !== targetWeight) {
        currentProgress = Math.max(0, Math.min(100, Math.abs((startWeight - currentWeight) / (startWeight - targetWeight)) * 100));
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const workouts30d = rawData.workouts.filter((w: any) => new Date(w.date || w.createdAt) >= thirtyDaysAgo);
    const meals30d = rawData.meals.filter((m: any) => new Date(m.date || m.createdAt) >= thirtyDaysAgo);

    if (workouts30d.length === 0 && meals30d.length === 0) {
        setPredictionAnalysis(null);
    } else {
        let pace = 'Slow';
        let probability = 40;
        let trend = 'Stable';
        let estWeeks = 12;

        if (workouts30d.length >= 15 && meals30d.length >= 45) {
            pace = 'Excellent'; probability = 95; trend = 'Improving'; estWeeks = 4;
        } else if (workouts30d.length >= 8 && meals30d.length >= 20) {
            pace = 'Good'; probability = 80; trend = 'Improving'; estWeeks = 8;
        } else if (workouts30d.length >= 4 && meals30d.length >= 10) {
            pace = 'Average'; probability = 60; trend = 'Stable'; estWeeks = 16;
        } else {
            pace = 'Slow'; probability = 45; trend = 'Declining'; estWeeks = 24;
        }

        let probColor = '#EF4444';
        if (probability >= 90) probColor = '#10B981';
        else if (probability >= 70) probColor = '#38BDF8';
        else if (probability >= 50) probColor = '#F59E0B';

        let aiPredictionText = '';
        if (probability >= 90) aiPredictionText = '✅ You are likely to reach your goal within 8 weeks if you maintain your current routine.';
        else if (probability >= 70) aiPredictionText = '⚡ Your consistency has improved significantly this month.';
        else if (probability >= 50) aiPredictionText = '⚠ Your current pace is slower than required to reach your goal on time.';
        else aiPredictionText = '⚠ Missing workouts are delaying your progress.';

        setPredictionAnalysis({
            progress: Math.round(currentProgress) || 0,
            estWeeks,
            pace,
            probability,
            probColor,
            trend,
            text: aiPredictionText
        });
    }

    // Health Risk Detection
    const healthRisks: { name: string, reason: string, fix: string }[] = [];
    const recoveryScore = Math.max(0, 100 - (workouts30d.length * 2.5));

    if (workouts30d.length === 0 && meals30d.length === 0) {
        setHealthRiskAnalysis(null);
    } else {
        if (workouts30d.length >= 24 && recoveryScore < 50) {
            healthRisks.push({ name: 'Overtraining Risk', reason: `Workout frequency is very high (${workouts30d.length} this month).`, fix: 'Take 1–2 rest days to allow muscle recovery.' });
        }
        if (avgWeeklyNet > 600) {
            healthRisks.push({ name: 'Overeating Risk', reason: 'Calories are consistently above maintenance level.', fix: 'Reduce daily calorie intake slightly or increase activity.' });
        }
        if (totalP < targetP * 0.7) {
            healthRisks.push({ name: 'Low Protein Risk', reason: `Protein intake (${totalP}g) is below 70% of target.`, fix: 'Add more lean meats, eggs, or protein supplements.' });
        }
        if (avgWeeklyNet < -600 && totalP < targetP * 0.7) {
            healthRisks.push({ name: 'Muscle Loss Risk', reason: 'Large calorie deficit combined with low protein.', fix: 'Reduce calorie deficit and prioritize protein intake.' });
        }
        if (recoveryScore < 40) {
            healthRisks.push({ name: 'Poor Recovery', reason: `Recovery score is estimated at ${Math.round(recoveryScore)}%.`, fix: 'Improve sleep quality and schedule mandatory rest days.' });
        }
        if (workouts30d.length < 10) {
            healthRisks.push({ name: 'Inconsistent Routine', reason: `Only ${workouts30d.length} workouts logged in the last 30 days.`, fix: 'Try to schedule at least 3 workouts per week.' });
        }

        const topRisks = healthRisks.slice(0, 5);

        let riskLevel = 'Low';
        let riskColor = '#10B981'; // Green
        if (topRisks.length >= 4) { riskLevel = 'Critical'; riskColor = '#EF4444'; } // Red
        else if (topRisks.length === 3) { riskLevel = 'High'; riskColor = '#F97316'; } // Orange
        else if (topRisks.length >= 1) { riskLevel = 'Moderate'; riskColor = '#EAB308'; } // Yellow

        setHealthRiskAnalysis({
            level: riskLevel,
            color: riskColor,
            risks: topRisks
        });
    }

    // AI Weekly Performance Report
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const workouts7d = rawData.workouts.filter((w: any) => new Date(w.date || w.createdAt) >= sevenDaysAgo);
    const meals7d = rawData.meals.filter((m: any) => new Date(m.date || m.createdAt) >= sevenDaysAgo);

    if (workouts7d.length === 0 && meals7d.length === 0) {
        setWeeklyPerformanceReport(null);
    } else {
        let reportScore = (workouts7d.length * 10) + (meals7d.length * 2);
        let grade = 'F';
        let gradeColor = '#EF4444';
        if (reportScore >= 60) { grade = 'A+'; gradeColor = '#10B981'; }
        else if (reportScore >= 50) { grade = 'A'; gradeColor = '#10B981'; }
        else if (reportScore >= 40) { grade = 'B'; gradeColor = '#38BDF8'; }
        else if (reportScore >= 30) { grade = 'C'; gradeColor = '#F59E0B'; }
        else if (reportScore >= 15) { grade = 'D'; gradeColor = '#F97316'; }

        let achievement = 'Maintained consistent meal logging.';
        if (workouts7d.length >= 4) achievement = `Completed ${workouts7d.length} workouts this week.`;
        else if (avgWeeklyNet <= -200 && userGoal === 'Weight Loss') achievement = 'Maintained perfect calorie deficit.';

        let mistake = 'Did not log meals consistently.';
        if (workouts7d.length < 2) mistake = 'Skipped workouts most of the week.';
        else if (totalP < targetP * 0.6) mistake = 'Protein intake remained below target.';

        let strongHabit = 'Meal tracking consistency.';
        if (workouts7d.length >= 3) strongHabit = 'Consistent workout routine.';

        let weakHabit = 'Irregular meal logging.';
        if (workouts7d.length < 3) weakHabit = 'Irregular workouts.';
        else if (totalP < targetP * 0.7) weakHabit = 'Low daily protein intake.';

        let nextFocus = 'Try to log all your meals this week.';
        if (workouts7d.length < 3) nextFocus = 'Train one extra day.';
        else if (totalP < targetP * 0.8) nextFocus = 'Increase protein by 20g daily.';

        let summary = `This week you logged ${workouts7d.length} workouts and ${meals7d.length} meals. `;
        if (reportScore >= 50) summary += 'Excellent consistency overall. Keep maintaining this routine to reach your goal faster.';
        else summary += 'There is room for improvement. Focus on building daily habits for better results next week.';

        setWeeklyPerformanceReport({
            grade, gradeColor, achievement, mistake, strongHabit, weakHabit, nextFocus, summary
        });
    }

    // AI Fitness Dashboard (Top Level Summary)
    const workoutScore = Math.min(100, Math.round((workouts30d.length / 20) * 100));
    const workoutStatus = workoutScore >= 80 ? 'Excellent' : workoutScore >= 50 ? 'Good' : 'Needs Work';
    const recoveryStatus = recoveryScore >= 80 ? 'Optimal' : recoveryScore >= 50 ? 'Adequate' : 'Poor';
    const healthBalanceIndex = Math.round((workoutScore + score + recoveryScore) / 3) || 0;
    const workoutCompletedToday = rawData.workouts.some((w: any) => new Date(w.date || w.createdAt).toDateString() === todayStr);

    let probabilitySafe = 50; 
    if (workouts30d.length >= 8 && meals30d.length >= 20) probabilitySafe = 80;

    let aiSummaryText = '';
    if (workoutScore >= 70) aiSummaryText += '• Excellent consistency in training.\n';
    else aiSummaryText += '• Training frequency needs improvement.\n';

    if (totalP >= targetP * 0.8) aiSummaryText += '• Protein intake is well aligned with target.\n';
    else aiSummaryText += '• Focus on increasing daily protein.\n';

    if (recoveryScore >= 70) aiSummaryText += '• Recovery status is looking good.\n';
    else aiSummaryText += '• Consider taking more rest for recovery.\n';

    if (probabilitySafe >= 70) aiSummaryText += '• Goal completion probability is high.';
    else aiSummaryText += '• Adjust routine to stay on track for your goal.';

    setAiFitnessDashboard({
        workoutScore, workoutStatus,
        nutritionScore: score,
        recoveryScore, recoveryStatus,
        goalProgress: Math.round(currentProgress) || 0, goalRemaining: 100 - (Math.round(currentProgress) || 0),
        currentWeight: currentWeight || '--', weeklyWeightChange: '--',
        healthBalanceIndex, riskLevel,
        workoutCompletedToday,
        caloriesConsumed: totalCal, targetCal,
        proteinConsumed: totalP, targetP,
        aiSummaryText
    });

    // AI Daily Coach
    const hour = new Date().getHours();
    let greeting = 'Good Evening';
    if (hour < 12) greeting = 'Good Morning';
    else if (hour < 18) greeting = 'Good Afternoon';

    if (totalCal === 0 && !workoutCompletedToday) {
        setAiDailyCoach(null);
    } else {
        let mission = 'Complete your daily workout to stay on track.';
        if (workoutCompletedToday) {
            if (totalP < targetP) mission = `Eat at least ${targetP}g protein.`;
            else mission = 'Maintain your excellent calorie balance today.';
        } else if (recoveryScore < 50) {
            mission = 'Take a recovery day to optimize muscle repair.';
        }

        const priorities: { text: string, done: boolean }[] = [];
        
        priorities.push({ text: 'Finish workout', done: workoutCompletedToday });
        priorities.push({ text: 'Reach protein target', done: totalP >= targetP * 0.9 });
        priorities.push({ text: 'Stay under calorie target', done: totalCal > 0 && totalCal <= targetCal });
        priorities.push({ text: 'Stay hydrated', done: totalCal > 0 }); 
        priorities.push({ text: 'Get enough sleep', done: recoveryScore >= 60 });

        let motivation = 'Consistency beats perfection. Keep showing up.';
        if (workoutCompletedToday) motivation = "You're one step closer to becoming stronger. Great job today!";
        else if (probabilitySafe > 80) motivation = "Small daily improvements create massive long-term results.";

        let warning = "✅ You're doing great today.";
        if (recoveryScore < 40) warning = '⚠ Recovery score is low.';
        else if (totalP < targetP * 0.5 && totalCal > targetCal * 0.5) warning = '⚠ Protein intake is below target.';
        else if (totalCal > targetCal * 1.15) warning = '⚠ Calories are exceeding maintenance.';
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const dayBefore = new Date();
        dayBefore.setDate(dayBefore.getDate() - 2);
        
        const wrkYesterday = rawData.workouts.some((w: any) => new Date(w.date || w.createdAt).toDateString() === yesterday.toDateString());
        const wrkDayBefore = rawData.workouts.some((w: any) => new Date(w.date || w.createdAt).toDateString() === dayBefore.toDateString());
        
        if (!workoutCompletedToday && !wrkYesterday && !wrkDayBefore) {
            warning = '⚠ You have skipped workouts for 2 days.';
        }

        let expectedResult = "Meeting today's targets will maintain your positive momentum.";
        if (!workoutCompletedToday) expectedResult = `If today's workout is completed, your consistency will increase and boost goal probability.`;
        else if (totalP >= targetP * 0.9) expectedResult = "Meeting today's nutrition target increases goal success probability by 3%.";

        setAiDailyCoach({
            greeting: `${greeting}, ${user?.name?.split(' ')[0] || 'Athlete'} 👋`,
            mission,
            priorities: priorities.slice(0, 5),
            motivation,
            warning,
            expectedResult
        });
    }

    // Detailed Calories Balance
    if (totalCal === 0 && workoutBurnedToday === 0) {
        setDetailedCaloriesBalance(null);
    } else {
        const netCals = totalCal - workoutBurnedToday;
        const remainingCals = targetCal - netCals;
        let progressPct = (netCals / targetCal) * 100;
        if (progressPct < 0) progressPct = 0;
        
        let barColor = '#10B981';
        let analysisMsg = '';

        if (progressPct <= 85) {
            barColor = '#10B981';
            analysisMsg = 'Excellent calorie balance today.';
        } else if (progressPct <= 100) {
            barColor = '#38BDF8';
            analysisMsg = "You're still within your calorie goal.";
        } else if (progressPct <= 115) {
            barColor = '#F59E0B';
            analysisMsg = 'You are exceeding today\'s calorie target.';
        } else {
            barColor = '#EF4444';
            analysisMsg = 'You are far above your calorie target.';
        }

        if (workoutBurnedToday > 0 && progressPct <= 100 && totalCal > 0) {
            analysisMsg = 'Workout helped offset today\'s intake. Great job!';
        }

        setDetailedCaloriesBalance({
            calIn: totalCal,
            calOut: workoutBurnedToday,
            net: netCals,
            target: targetCal,
            remaining: remainingCals,
            progressPct: Math.min(100, progressPct),
            barColor,
            analysisMsg
        });
    }

    // Recovery & Energy Balance
    if (totalCal === 0 && workoutBurnedToday === 0) {
        setRecoveryEnergyBalance(null);
    } else {
        const netCals = totalCal - workoutBurnedToday;
        
        let recoveryStateStatus = 'Rest Day';
        let recoveryColor = '#94A3B8';
        if (workoutCompletedToday) {
            if (totalP >= targetP * 0.9) {
                recoveryStateStatus = 'Excellent';
                recoveryColor = '#10B981';
            } else if (totalCal < targetCal * 0.6) {
                recoveryStateStatus = 'Poor';
                recoveryColor = '#EF4444';
            } else {
                recoveryStateStatus = 'Moderate';
                recoveryColor = '#F59E0B';
            }
        }

        const diff = netCals - targetCal;
        let energyStatus = 'Balanced';
        let energyColor = '#10B981';
        if (diff > 300) {
            energyStatus = 'Calorie Surplus';
            energyColor = '#F59E0B';
        } else if (diff < -300) {
            energyStatus = 'Calorie Deficit';
            energyColor = '#38BDF8';
        }

        let aiMessage = "Excellent balance between nutrition and training.";
        if (recoveryStateStatus === 'Poor') {
            aiMessage = "Your calorie deficit is high today. Increase protein intake and prioritize recovery.";
        } else if (workoutCompletedToday && totalCal > 0) {
            aiMessage = `You burned ${workoutBurnedToday} kcal and consumed ${totalCal} kcal. Recovery looks good. Keep protein high for muscle repair.`;
        }

        setRecoveryEnergyBalance({
            consumed: totalCal,
            burned: workoutBurnedToday,
            net: netCals,
            recoveryStatus: recoveryStateStatus,
            recoveryColor,
            energyStatus,
            energyColor,
            aiMessage
        });
    }

  }, [rawData, user]);

  const getColor = (val: number | string) => {
      if (typeof val !== 'number') return '#94A3B8';
      if (val >= 90) return '#10B981';
      if (val >= 70) return '#38BDF8';
      if (val >= 50) return '#F59E0B';
      return '#EF4444';
  };

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

        {/* AI FITNESS DASHBOARD */}
        {aiFitnessDashboard && (
           <View style={{ marginBottom: 32 }}>
              <Text style={[s.sectionTitle, { fontSize: 22, color: '#38BDF8', textAlign: 'center', marginBottom: 16 }]}>AI Fitness Dashboard</Text>
              
              {/* 6 Summary Cards */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
                  {/* Workout */}
                  <View style={{ flex: 1, minWidth: '45%', backgroundColor: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}>
                      <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 8 }}>🏋 Workout</Text>
                      <Text style={{ color: getColor(aiFitnessDashboard.workoutScore), fontSize: 24, fontWeight: '900' }}>{aiFitnessDashboard.workoutScore}%</Text>
                      <Text style={{ color: '#F8FAFC', fontSize: 14, fontWeight: '600', marginTop: 4 }}>{aiFitnessDashboard.workoutStatus}</Text>
                  </View>

                  {/* Nutrition */}
                  <View style={{ flex: 1, minWidth: '45%', backgroundColor: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}>
                      <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 8 }}>🥗 Nutrition</Text>
                      <Text style={{ color: getColor(aiFitnessDashboard.nutritionScore), fontSize: 24, fontWeight: '900' }}>{aiFitnessDashboard.nutritionScore}%</Text>
                      <Text style={{ color: '#F8FAFC', fontSize: 12, fontWeight: '600', marginTop: 4 }}>Cal: {aiFitnessDashboard.caloriesConsumed} / {aiFitnessDashboard.targetCal}</Text>
                      <Text style={{ color: '#F8FAFC', fontSize: 12, fontWeight: '600' }}>Pro: {aiFitnessDashboard.proteinConsumed} / {aiFitnessDashboard.targetP}g</Text>
                  </View>

                  {/* Recovery */}
                  <View style={{ flex: 1, minWidth: '45%', backgroundColor: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}>
                      <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 8 }}>😴 Recovery</Text>
                      <Text style={{ color: getColor(aiFitnessDashboard.recoveryScore), fontSize: 24, fontWeight: '900' }}>{Math.round(aiFitnessDashboard.recoveryScore)}%</Text>
                      <Text style={{ color: '#F8FAFC', fontSize: 14, fontWeight: '600', marginTop: 4 }}>{aiFitnessDashboard.recoveryStatus}</Text>
                  </View>

                  {/* Goal */}
                  <View style={{ flex: 1, minWidth: '45%', backgroundColor: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}>
                      <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 8 }}>🎯 Goal</Text>
                      <Text style={{ color: getColor(aiFitnessDashboard.goalProgress), fontSize: 24, fontWeight: '900' }}>{aiFitnessDashboard.goalProgress}%</Text>
                      <Text style={{ color: '#F8FAFC', fontSize: 14, fontWeight: '600', marginTop: 4 }}>Remaining: {aiFitnessDashboard.goalRemaining}%</Text>
                  </View>

                  {/* Body */}
                  <View style={{ flex: 1, minWidth: '45%', backgroundColor: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}>
                      <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 8 }}>⚖ Body</Text>
                      <Text style={{ color: '#F8FAFC', fontSize: 24, fontWeight: '900' }}>{aiFitnessDashboard.currentWeight} kg</Text>
                      <Text style={{ color: '#94A3B8', fontSize: 14, fontWeight: '600', marginTop: 4 }}>Change: {aiFitnessDashboard.weeklyWeightChange}</Text>
                  </View>

                  {/* Health */}
                  <View style={{ flex: 1, minWidth: '45%', backgroundColor: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}>
                      <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 8 }}>❤️ Health</Text>
                      <Text style={{ color: getColor(aiFitnessDashboard.healthBalanceIndex), fontSize: 24, fontWeight: '900' }}>{aiFitnessDashboard.healthBalanceIndex}</Text>
                      <Text style={{ color: '#F8FAFC', fontSize: 14, fontWeight: '600', marginTop: 4 }}>Risk: {aiFitnessDashboard.riskLevel}</Text>
                  </View>
              </View>

              {/* Today's Summary */}
              <View style={[SharedStyles.card, { padding: 20, marginBottom: 20 }]}>
                  <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 16 }}>Today's Summary</Text>
                  
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                      <Text style={{ color: '#F8FAFC', fontSize: 16, fontWeight: '700' }}>Workout Completed</Text>
                      <Text style={{ fontSize: 16 }}>{aiFitnessDashboard.workoutCompletedToday ? '✅' : '❌'}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                      <Text style={{ color: '#F8FAFC', fontSize: 16, fontWeight: '700' }}>Calories</Text>
                      <Text style={{ color: '#38BDF8', fontSize: 16, fontWeight: '900' }}>{aiFitnessDashboard.caloriesConsumed} <Text style={{ color: '#94A3B8', fontSize: 14 }}>/ {aiFitnessDashboard.targetCal}</Text></Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                      <Text style={{ color: '#F8FAFC', fontSize: 16, fontWeight: '700' }}>Protein</Text>
                      <Text style={{ color: '#10B981', fontSize: 16, fontWeight: '900' }}>{aiFitnessDashboard.proteinConsumed} <Text style={{ color: '#94A3B8', fontSize: 14 }}>/ {aiFitnessDashboard.targetP}g</Text></Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                      <Text style={{ color: '#F8FAFC', fontSize: 16, fontWeight: '700' }}>Recovery</Text>
                      <Text style={{ color: getColor(aiFitnessDashboard.recoveryScore), fontSize: 16, fontWeight: '900' }}>{Math.round(aiFitnessDashboard.recoveryScore)}%</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ color: '#F8FAFC', fontSize: 16, fontWeight: '700' }}>Goal Progress</Text>
                      <Text style={{ color: getColor(aiFitnessDashboard.goalProgress), fontSize: 16, fontWeight: '900' }}>{aiFitnessDashboard.goalProgress}%</Text>
                  </View>
              </View>

              {/* AI Summary */}
              <View style={{ backgroundColor: 'rgba(56, 189, 248, 0.1)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.2)' }}>
                  <Text style={{ color: '#38BDF8', fontSize: 12, fontWeight: '900', textTransform: 'uppercase', marginBottom: 8 }}>🤖 AI Summary</Text>
                  <Text style={{ color: '#F8FAFC', fontSize: 14, fontWeight: '700', lineHeight: 24 }}>{aiFitnessDashboard.aiSummaryText}</Text>
              </View>
           </View>
        )}

        {/* AI DAILY COACH */}
        <Text style={s.sectionTitle}>🤖 AI Daily Coach</Text>
        <View style={[SharedStyles.card, { padding: 20, marginBottom: 24 }]}>
           {!aiDailyCoach ? (
               <View style={{ alignItems: 'center', padding: 20 }}>
                   <Text style={{ color: '#94A3B8', fontSize: 14, fontWeight: '700', textAlign: 'center' }}>Track today's meals and workouts to receive your personalized AI Daily Coach.</Text>
               </View>
           ) : (
               <>
                   <Text style={{ color: '#38BDF8', fontSize: 20, fontWeight: '900', marginBottom: 24 }}>{aiDailyCoach.greeting}</Text>

                   <View style={{ marginBottom: 24 }}>
                       <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 8 }}>🎯 Today's Mission</Text>
                       <View style={{ backgroundColor: 'rgba(56, 189, 248, 0.1)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.2)' }}>
                           <Text style={{ color: '#38BDF8', fontSize: 16, fontWeight: '800' }}>{aiDailyCoach.mission}</Text>
                       </View>
                   </View>

                   <View style={{ marginBottom: 24 }}>
                       <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 12 }}>📋 Today's Priorities</Text>
                       <View style={{ gap: 12 }}>
                           {aiDailyCoach.priorities.map((item: any, i: number) => (
                               <View key={i} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: item.done ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.05)' }}>
                                   <Text style={{ fontSize: 20, marginRight: 12 }}>{item.done ? '☑' : '☐'}</Text>
                                   <Text style={{ color: item.done ? '#10B981' : '#F8FAFC', fontSize: 14, fontWeight: '700' }}>{item.text}</Text>
                               </View>
                           ))}
                       </View>
                   </View>

                   <View style={{ marginBottom: 24 }}>
                       <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 8 }}>🔥 Today's Motivation</Text>
                       <Text style={{ color: '#F8FAFC', fontSize: 14, fontWeight: '700', fontStyle: 'italic', lineHeight: 22 }}>"{aiDailyCoach.motivation}"</Text>
                   </View>

                   <View style={{ marginBottom: 24 }}>
                       <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 8 }}>⚡ Warning / Status</Text>
                       <View style={{ backgroundColor: aiDailyCoach.warning.includes('⚠') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: aiDailyCoach.warning.includes('⚠') ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)' }}>
                           <Text style={{ color: aiDailyCoach.warning.includes('⚠') ? '#EF4444' : '#10B981', fontSize: 14, fontWeight: '800' }}>{aiDailyCoach.warning}</Text>
                       </View>
                   </View>

                   <View style={{ backgroundColor: 'rgba(15,23,42,0.6)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}>
                       <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 8 }}>📈 Today's Expected Result</Text>
                       <Text style={{ color: '#F8FAFC', fontSize: 14, fontWeight: '700', lineHeight: 22 }}>{aiDailyCoach.expectedResult}</Text>
                   </View>
               </>
           )}
        </View>

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
<Text style={{ color: mealVsWorkoutAnalysis.color, fontSize: 14, fontWeight: '800', textAlign: 'center', marginTop: 4 }}>{mealVsWorkoutAnalysis.analysis}</Text>
             </View>
          </View>

          {/* DETAILED CALORIES BALANCE */}
          <Text style={s.sectionTitle}>🔥 Calories Balance</Text>
          <View style={[SharedStyles.card, { padding: 20, marginBottom: 24 }]}>
             {!detailedCaloriesBalance ? (
                 <View style={{ alignItems: 'center', padding: 20 }}>
                     <Text style={{ color: '#94A3B8', fontSize: 14, fontWeight: '700', textAlign: 'center' }}>No meals or workouts logged today.</Text>
                 </View>
             ) : (
                 <>
                     <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
                         <View style={{ flex: 1, minWidth: '30%', backgroundColor: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}>
                             <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 }}>Calories In</Text>
                             <Text style={{ color: '#F8FAFC', fontSize: 20, fontWeight: '900' }}>{detailedCaloriesBalance.calIn} kcal</Text>
                         </View>
                         <View style={{ flex: 1, minWidth: '30%', backgroundColor: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}>
                             <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 }}>Calories Out</Text>
                             <Text style={{ color: '#F8FAFC', fontSize: 20, fontWeight: '900' }}>{detailedCaloriesBalance.calOut} kcal</Text>
                         </View>
                         <View style={{ flex: 1, minWidth: '30%', backgroundColor: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}>
                             <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 }}>Net Calories</Text>
                             <Text style={{ color: '#F8FAFC', fontSize: 20, fontWeight: '900' }}>{detailedCaloriesBalance.net} kcal</Text>
                         </View>
                         <View style={{ flex: 1, minWidth: '45%', backgroundColor: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}>
                             <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 }}>Target Calories</Text>
                             <Text style={{ color: '#F8FAFC', fontSize: 20, fontWeight: '900' }}>{detailedCaloriesBalance.target} kcal</Text>
                         </View>
                         <View style={{ flex: 1, minWidth: '45%', backgroundColor: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}>
                             <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 }}>Remaining</Text>
                             <Text style={{ color: detailedCaloriesBalance.remaining >= 0 ? '#10B981' : '#EF4444', fontSize: 20, fontWeight: '900' }}>
                                 {detailedCaloriesBalance.remaining >= 0 ? `${detailedCaloriesBalance.remaining} kcal remaining` : `+${Math.abs(detailedCaloriesBalance.remaining)} kcal over target`}
                             </Text>
                         </View>
                     </View>

                     <View style={{ marginBottom: 24 }}>
                         <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                             <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase' }}>Target Progress</Text>
                             <Text style={{ color: detailedCaloriesBalance.barColor, fontSize: 14, fontWeight: '900' }}>{Math.round((detailedCaloriesBalance.net / detailedCaloriesBalance.target) * 100)}%</Text>
                         </View>
                         <View style={{ width: '100%', height: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' }}>
                            <View style={{ width: `${detailedCaloriesBalance.progressPct}%`, height: '100%', backgroundColor: detailedCaloriesBalance.barColor, borderRadius: 4 }} />
                         </View>
                     </View>

                     <View style={{ backgroundColor: 'rgba(15,23,42,0.6)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}>
                         <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 8 }}>AI Analysis</Text>
                         <Text style={{ color: '#F8FAFC', fontSize: 14, fontWeight: '700', lineHeight: 22 }}>{detailedCaloriesBalance.analysisMsg}</Text>
                     </View>
                 </>
             )}
          </View>

          {/* RECOVERY & ENERGY BALANCE */}
          <Text style={s.sectionTitle}>🔋 Recovery & Energy Balance</Text>
          <View style={[SharedStyles.card, { padding: 20, marginBottom: 24 }]}>
             {!recoveryEnergyBalance ? (
                 <View style={{ alignItems: 'center', padding: 20 }}>
                     <Text style={{ color: '#94A3B8', fontSize: 14, fontWeight: '700', textAlign: 'center' }}>No nutrition or workout data available today.</Text>
                 </View>
             ) : (
                 <>
                     <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
                         <View style={{ flex: 1, minWidth: '45%', backgroundColor: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}>
                             <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 }}>Calories Consumed</Text>
                             <Text style={{ color: '#F8FAFC', fontSize: 20, fontWeight: '900' }}>{recoveryEnergyBalance.consumed} kcal</Text>
                         </View>
                         <View style={{ flex: 1, minWidth: '45%', backgroundColor: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}>
                             <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 }}>Calories Burned</Text>
                             <Text style={{ color: '#F8FAFC', fontSize: 20, fontWeight: '900' }}>{recoveryEnergyBalance.burned} kcal</Text>
                         </View>
                         <View style={{ flex: 1, minWidth: '45%', backgroundColor: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}>
                             <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 }}>Net Calories</Text>
                             <Text style={{ color: '#F8FAFC', fontSize: 20, fontWeight: '900' }}>{recoveryEnergyBalance.net} kcal</Text>
                         </View>
                         <View style={{ flex: 1, minWidth: '45%', backgroundColor: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}>
                             <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 }}>Energy Status</Text>
                             <Text style={{ color: recoveryEnergyBalance.energyColor, fontSize: 18, fontWeight: '900' }}>{recoveryEnergyBalance.energyStatus}</Text>
                         </View>
                         <View style={{ flex: 1, minWidth: '100%', backgroundColor: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}>
                             <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 }}>Recovery Status</Text>
                             <Text style={{ color: recoveryEnergyBalance.recoveryColor, fontSize: 20, fontWeight: '900' }}>{recoveryEnergyBalance.recoveryStatus}</Text>
                         </View>
                     </View>

                     <View style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.2)' }}>
                         <Text style={{ color: '#10B981', fontSize: 12, fontWeight: '900', textTransform: 'uppercase', marginBottom: 8 }}>🤖 AI Coach Message</Text>
                         <Text style={{ color: '#F8FAFC', fontSize: 14, fontWeight: '700', lineHeight: 22 }}>"{recoveryEnergyBalance.aiMessage}"</Text>
                     </View>
                 </>
             )}
          </View>

          {/* WEEKLY CALORIE BALANCE */}
          <Text style={s.sectionTitle}>Weekly Calorie Balance</Text>
          <View style={[SharedStyles.card, { padding: 20, marginBottom: 24 }]}>
             <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 120, gap: 8, marginBottom: 24 }}>
                {weeklyCalorieBalance.chartData.map((data, i) => {
                   const maxAbs = Math.max(...weeklyCalorieBalance.chartData.map(d => Math.abs(d.net)), 1000);
                   const barHeight = Math.max(10, (Math.abs(data.net) / maxAbs) * 100);
                   const isSurplus = data.net >= 0;
                   const barColor = isSurplus ? '#10B981' : '#38BDF8';
                   return (
                      <View key={i} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                         <Text style={{ color: '#F8FAFC', fontSize: 10, fontWeight: '800', marginBottom: 4 }}>{data.net}</Text>
                         <View style={{ width: '100%', height: `${barHeight}%`, backgroundColor: barColor, borderRadius: 4, minHeight: 4 }} />
                         <Text style={{ color: '#94A3B8', fontSize: 10, fontWeight: '700', marginTop: 8 }}>{data.day}</Text>
                      </View>
                   );
                })}
             </View>
             <View style={{ backgroundColor: 'rgba(15,23,42,0.6)', padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}>
                <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 8 }}>Weekly AI Analysis</Text>
                <Text style={{ color: weeklyCalorieBalance.color, fontSize: 14, fontWeight: '800', textAlign: 'center' }}>{weeklyCalorieBalance.analysis}</Text>
             </View>
          </View>

          {/* CALORIES IN VS OUT */}
          <Text style={s.sectionTitle}>Calories In vs Calories Out</Text>
          <View style={[SharedStyles.card, { padding: 20, marginBottom: 24 }]}>
             <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
                <View style={{ alignItems: 'center', flex: 1 }}>
                   <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', textAlign: 'center' }}>Calories In</Text>
                   <Text style={{ color: '#F8FAFC', fontSize: 18, fontWeight: '900', marginTop: 4 }}>{caloriesInOutAnalysis.calIn} kcal</Text>
                </View>
                <View style={{ width: 1, height: '100%', backgroundColor: 'rgba(255,255,255,0.1)' }} />
                <View style={{ alignItems: 'center', flex: 1 }}>
                   <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', textAlign: 'center' }}>Calories Out</Text>
                   <Text style={{ color: '#F8FAFC', fontSize: 18, fontWeight: '900', marginTop: 4 }}>{caloriesInOutAnalysis.calOut} kcal</Text>
                </View>
                <View style={{ width: 1, height: '100%', backgroundColor: 'rgba(255,255,255,0.1)' }} />
                <View style={{ alignItems: 'center', flex: 1 }}>
                   <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', textAlign: 'center' }}>Net</Text>
                   <Text style={{ color: '#F8FAFC', fontSize: 18, fontWeight: '900', marginTop: 4 }}>{caloriesInOutAnalysis.netInOut} kcal</Text>
                </View>
             </View>

             <View style={{ width: '100%', height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3, marginVertical: 16, overflow: 'hidden' }}>
                <View style={{ width: `${Math.min(100, Math.max(0, (caloriesInOutAnalysis.calIn / ((caloriesInOutAnalysis.calIn + caloriesInOutAnalysis.calOut) || 1)) * 100))}%`, height: '100%', backgroundColor: caloriesInOutAnalysis.color, borderRadius: 3 }} />
             </View>

             <View style={{ backgroundColor: 'rgba(15,23,42,0.6)', padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}>
                <Text style={{ color: caloriesInOutAnalysis.color, fontSize: 14, fontWeight: '800', textAlign: 'center' }}>{caloriesInOutAnalysis.msg}</Text>
             </View>
          </View>

          {/* NUTRITION QUALITY ANALYSIS */}
          <Text style={s.sectionTitle}>Nutrition Quality Analysis</Text>
          <View style={[SharedStyles.card, { padding: 20, marginBottom: 24 }]}>
             <View style={{ alignItems: 'center', marginBottom: 16 }}>
                 <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase' }}>Nutrition Quality</Text>
                 <Text style={{ color: '#F8FAFC', fontSize: 32, fontWeight: '900', marginTop: 4 }}>{nutritionQuality.score} <Text style={{ fontSize: 18, color: '#64748B' }}>/ 100</Text></Text>
             </View>

             <View style={{ width: '100%', height: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4, marginBottom: 24, overflow: 'hidden' }}>
                <View style={{ width: `${nutritionQuality.score}%`, height: '100%', backgroundColor: nutritionQuality.score >= 80 ? '#10B981' : nutritionQuality.score >= 50 ? '#F59E0B' : '#EF4444', borderRadius: 4 }} />
             </View>

             <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
                 <View style={{ flex: 1, minWidth: '45%', backgroundColor: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 8 }}>
                     <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700' }}>🥩 Protein</Text>
                     <Text style={{ color: '#F8FAFC', fontSize: 16, fontWeight: '900', marginTop: 4 }}>{nutritionQuality.protein} g</Text>
                 </View>
                 <View style={{ flex: 1, minWidth: '45%', backgroundColor: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 8 }}>
                     <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700' }}>🍚 Carbs</Text>
                     <Text style={{ color: '#F8FAFC', fontSize: 16, fontWeight: '900', marginTop: 4 }}>{nutritionQuality.carbs} g</Text>
                 </View>
                 <View style={{ flex: 1, minWidth: '45%', backgroundColor: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 8 }}>
                     <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700' }}>🥑 Fats</Text>
                     <Text style={{ color: '#F8FAFC', fontSize: 16, fontWeight: '900', marginTop: 4 }}>{nutritionQuality.fats} g</Text>
                 </View>
                 <View style={{ flex: 1, minWidth: '45%', backgroundColor: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 8 }}>
                     <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700' }}>🔥 Calories</Text>
                     <Text style={{ color: '#F8FAFC', fontSize: 16, fontWeight: '900', marginTop: 4 }}>{nutritionQuality.calories} kcal</Text>
                 </View>
             </View>

             <View style={{ backgroundColor: 'rgba(15,23,42,0.6)', padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}>
                <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 }}>AI Feedback</Text>
                <Text style={{ color: nutritionQuality.color, fontSize: 14, fontWeight: '800', textAlign: 'center' }}>{nutritionQuality.feedback}</Text>
             </View>
          </View>

          {/* AI COACH INSIGHTS */}
          <Text style={s.sectionTitle}>AI Coach Insights</Text>
          <View style={[SharedStyles.card, { padding: 20, marginBottom: 24 }]}>
             {aiCoachInsights.length === 0 ? (
                <View style={{ alignItems: 'center', padding: 20 }}>
                   <Text style={{ color: '#94A3B8', fontSize: 14, fontWeight: '700' }}>Not enough data to generate AI insights yet.</Text>
                </View>
             ) : (
                <View style={{ gap: 12 }}>
                   {aiCoachInsights.map((insight, index) => {
                      let bgColor = 'rgba(255,255,255,0.03)';
                      let borderColor = 'rgba(255,255,255,0.05)';
                      let textColor = '#F8FAFC';
                      
                      if (insight.type === 'positive') {
                          bgColor = 'rgba(16, 185, 129, 0.1)';
                          borderColor = 'rgba(16, 185, 129, 0.2)';
                          textColor = '#10B981';
                      } else if (insight.type === 'warning') {
                          bgColor = 'rgba(239, 68, 68, 0.1)';
                          borderColor = 'rgba(239, 68, 68, 0.2)';
                          textColor = '#EF4444';
                      } else if (insight.type === 'suggestion') {
                          bgColor = 'rgba(245, 158, 11, 0.1)';
                          borderColor = 'rgba(245, 158, 11, 0.2)';
                          textColor = '#F59E0B';
                      }

                      return (
                         <View key={index} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: bgColor, padding: 16, borderRadius: 12, borderWidth: 1, borderColor }}>
                            <Text style={{ fontSize: 20, marginRight: 16 }}>{insight.icon}</Text>
                            <Text style={{ color: textColor, fontSize: 14, fontWeight: '700', flex: 1, lineHeight: 20 }}>{insight.text}</Text>
                         </View>
                      );
                   })}
                </View>
             )}
          </View>

          {/* AI PROGRESS PREDICTION */}
          <Text style={s.sectionTitle}>AI Progress Prediction</Text>
          <View style={[SharedStyles.card, { padding: 20, marginBottom: 24 }]}>
             {!predictionAnalysis ? (
                 <View style={{ alignItems: 'center', padding: 20 }}>
                     <Text style={{ color: '#94A3B8', fontSize: 14, fontWeight: '700', textAlign: 'center' }}>Not enough historical data to predict future progress.</Text>
                 </View>
             ) : (
                 <>
                     <View style={{ marginBottom: 20 }}>
                         <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 8 }}>🎯 Goal Progress</Text>
                         <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                             <Text style={{ color: '#F8FAFC', fontSize: 24, fontWeight: '900' }}>Current Progress</Text>
                             <Text style={{ color: '#10B981', fontSize: 24, fontWeight: '900' }}>{predictionAnalysis.progress}%</Text>
                         </View>
                         <View style={{ width: '100%', height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3, marginTop: 12, overflow: 'hidden' }}>
                            <View style={{ width: `${predictionAnalysis.progress}%`, height: '100%', backgroundColor: '#10B981', borderRadius: 3 }} />
                         </View>
                     </View>

                     <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
                         <View style={{ flex: 1, minWidth: '45%', backgroundColor: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 8 }}>
                             <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700' }}>Estimated Goal Completion</Text>
                             <Text style={{ color: '#F8FAFC', fontSize: 16, fontWeight: '900', marginTop: 4 }}>{predictionAnalysis.estWeeks} Weeks</Text>
                         </View>
                         <View style={{ flex: 1, minWidth: '45%', backgroundColor: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 8 }}>
                             <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700' }}>Current Pace</Text>
                             <Text style={{ color: '#F8FAFC', fontSize: 16, fontWeight: '900', marginTop: 4 }}>{predictionAnalysis.pace}</Text>
                         </View>
                         <View style={{ flex: 1, minWidth: '45%', backgroundColor: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 8 }}>
                             <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700' }}>Success Probability</Text>
                             <Text style={{ color: predictionAnalysis.probColor, fontSize: 16, fontWeight: '900', marginTop: 4 }}>{predictionAnalysis.probability}%</Text>
                         </View>
                         <View style={{ flex: 1, minWidth: '45%', backgroundColor: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 8 }}>
                             <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700' }}>Progress Trend</Text>
                             <Text style={{ color: '#F8FAFC', fontSize: 16, fontWeight: '900', marginTop: 4 }}>{predictionAnalysis.trend}</Text>
                         </View>
                     </View>

                     <View style={{ backgroundColor: 'rgba(15,23,42,0.6)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}>
                         <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 8 }}>AI Coach Prediction</Text>
                         <Text style={{ color: '#F8FAFC', fontSize: 14, fontWeight: '700', lineHeight: 22 }}>{predictionAnalysis.text}</Text>
                     </View>
                 </>
             )}
          </View>

          {/* HEALTH RISK DETECTION */}
          <Text style={s.sectionTitle}>Health Risk Detection</Text>
          <View style={[SharedStyles.card, { padding: 20, marginBottom: 24 }]}>
             {!healthRiskAnalysis ? (
                 <View style={{ alignItems: 'center', padding: 20 }}>
                     <Text style={{ color: '#94A3B8', fontSize: 14, fontWeight: '700', textAlign: 'center' }}>Not enough data to evaluate health risks.</Text>
                 </View>
             ) : (
                 <>
                     <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                         <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase' }}>Overall Risk Level</Text>
                         <View style={{ backgroundColor: `${healthRiskAnalysis.color}20`, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100, borderWidth: 1, borderColor: `${healthRiskAnalysis.color}50` }}>
                             <Text style={{ color: healthRiskAnalysis.color, fontSize: 14, fontWeight: '900', textTransform: 'uppercase' }}>{healthRiskAnalysis.level}</Text>
                         </View>
                     </View>

                     {healthRiskAnalysis.risks.length === 0 ? (
                         <View style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.2)' }}>
                             <Text style={{ color: '#10B981', fontSize: 14, fontWeight: '700', lineHeight: 22 }}>✅ No major health risks detected. Keep following your current routine.</Text>
                         </View>
                     ) : (
                         <View style={{ gap: 16 }}>
                             {healthRiskAnalysis.risks.map((risk, index) => (
                                 <View key={index} style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}>
                                     <Text style={{ color: '#F8FAFC', fontSize: 16, fontWeight: '800', marginBottom: 8 }}>⚠ {risk.name}</Text>
                                     <Text style={{ color: '#94A3B8', fontSize: 13, fontWeight: '700', marginBottom: 4 }}>Reason:</Text>
                                     <Text style={{ color: '#F8FAFC', fontSize: 14, fontWeight: '600', marginBottom: 12 }}>{risk.reason}</Text>
                                     <Text style={{ color: '#94A3B8', fontSize: 13, fontWeight: '700', marginBottom: 4 }}>Recommendation:</Text>
                                     <Text style={{ color: '#10B981', fontSize: 14, fontWeight: '600' }}>{risk.fix}</Text>
                                 </View>
                             ))}
                         </View>
                     )}
                 </>
             )}
          </View>

          {/* AI WEEKLY PERFORMANCE REPORT */}
          <Text style={s.sectionTitle}>AI Weekly Performance Report</Text>
          <View style={[SharedStyles.card, { padding: 20, marginBottom: 40 }]}>
             {!weeklyPerformanceReport ? (
                 <View style={{ alignItems: 'center', padding: 20 }}>
                     <Text style={{ color: '#94A3B8', fontSize: 14, fontWeight: '700', textAlign: 'center' }}>Complete one week of tracking to receive your AI Weekly Report.</Text>
                 </View>
             ) : (
                 <>
                     <View style={{ alignItems: 'center', marginBottom: 24, padding: 16, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}>
                         <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 }}>Overall Grade</Text>
                         <Text style={{ color: weeklyPerformanceReport.gradeColor, fontSize: 48, fontWeight: '900' }}>{weeklyPerformanceReport.grade}</Text>
                     </View>

                     <View style={{ gap: 12, marginBottom: 20 }}>
                         <View style={{ flexDirection: 'row', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.2)' }}>
                             <Text style={{ fontSize: 24, marginRight: 16 }}>🏆</Text>
                             <View style={{ flex: 1 }}>
                                 <Text style={{ color: '#10B981', fontSize: 12, fontWeight: '800', textTransform: 'uppercase', marginBottom: 4 }}>Biggest Achievement</Text>
                                 <Text style={{ color: '#F8FAFC', fontSize: 14, fontWeight: '700', lineHeight: 20 }}>{weeklyPerformanceReport.achievement}</Text>
                             </View>
                         </View>

                         <View style={{ flexDirection: 'row', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                             <Text style={{ fontSize: 24, marginRight: 16 }}>⚠</Text>
                             <View style={{ flex: 1 }}>
                                 <Text style={{ color: '#EF4444', fontSize: 12, fontWeight: '800', textTransform: 'uppercase', marginBottom: 4 }}>Biggest Mistake</Text>
                                 <Text style={{ color: '#F8FAFC', fontSize: 14, fontWeight: '700', lineHeight: 20 }}>{weeklyPerformanceReport.mistake}</Text>
                             </View>
                         </View>

                         <View style={{ flexDirection: 'row', backgroundColor: 'rgba(56, 189, 248, 0.1)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.2)' }}>
                             <Text style={{ fontSize: 24, marginRight: 16 }}>💪</Text>
                             <View style={{ flex: 1 }}>
                                 <Text style={{ color: '#38BDF8', fontSize: 12, fontWeight: '800', textTransform: 'uppercase', marginBottom: 4 }}>Strongest Habit</Text>
                                 <Text style={{ color: '#F8FAFC', fontSize: 14, fontWeight: '700', lineHeight: 20 }}>{weeklyPerformanceReport.strongHabit}</Text>
                             </View>
                         </View>

                         <View style={{ flexDirection: 'row', backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(245, 158, 11, 0.2)' }}>
                             <Text style={{ fontSize: 24, marginRight: 16 }}>📉</Text>
                             <View style={{ flex: 1 }}>
                                 <Text style={{ color: '#F59E0B', fontSize: 12, fontWeight: '800', textTransform: 'uppercase', marginBottom: 4 }}>Weakest Habit</Text>
                                 <Text style={{ color: '#F8FAFC', fontSize: 14, fontWeight: '700', lineHeight: 20 }}>{weeklyPerformanceReport.weakHabit}</Text>
                             </View>
                         </View>

                         <View style={{ flexDirection: 'row', backgroundColor: 'rgba(168, 85, 247, 0.1)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(168, 85, 247, 0.2)' }}>
                             <Text style={{ fontSize: 24, marginRight: 16 }}>🎯</Text>
                             <View style={{ flex: 1 }}>
                                 <Text style={{ color: '#A855F7', fontSize: 12, fontWeight: '800', textTransform: 'uppercase', marginBottom: 4 }}>Focus For Next Week</Text>
                                 <Text style={{ color: '#F8FAFC', fontSize: 14, fontWeight: '700', lineHeight: 20 }}>{weeklyPerformanceReport.nextFocus}</Text>
                             </View>
                         </View>
                     </View>

                     <View style={{ backgroundColor: 'rgba(15,23,42,0.6)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}>
                         <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 8 }}>Overall Summary</Text>
                         <Text style={{ color: '#F8FAFC', fontSize: 14, fontWeight: '700', lineHeight: 22 }}>{weeklyPerformanceReport.summary}</Text>
                     </View>
                 </>
             )}
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
