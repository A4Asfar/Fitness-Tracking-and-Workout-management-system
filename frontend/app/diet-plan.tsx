import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Text, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DietPlanService, DietPlan, DietPlanDay, DietPlanMeal } from '@/services/dietPlanService';
import SkeletonCard from '@/components/SkeletonCard';
import { SharedStyles } from '@/constants/Theme';
import { Flame, Droplet, ArrowLeft, HeartPulse, CheckCircle2, Circle, AlertCircle, PlusCircle } from 'lucide-react-native';
import { MealService } from '@/services/mealService';
import { generateIntelligence } from '@/utils/intelligenceEngine';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
type DayName = typeof DAYS_OF_WEEK[number];

export default function UserDietPlanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
  
  const todayIndex = new Date().getDay(); // 0 = Sunday, 1 = Monday
  const currentDayName = DAYS_OF_WEEK[todayIndex === 0 ? 6 : todayIndex - 1];
  
  const [selectedDay, setSelectedDay] = useState<DayName>(currentDayName);
  const [allRecords, setAllRecords] = useState<any[]>([]);
  const [intelligence, setIntelligence] = useState<any>(null);

  const fetchData = async () => {
    try {
      const [plan, records] = await Promise.all([
        DietPlanService.getMyDietPlan(),
        MealService.getMeals()
      ]);
      setDietPlan(plan);
      setAllRecords(records);
      
      if (plan) {
         const intel = generateIntelligence({ user: {}, analytics: {}, meals: records, dietPlan: plan });
         setIntelligence(intel);
      }
    } catch (error) {
      console.error('Failed to load diet plan:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const selectedDayData = useMemo(() => {
    if (!dietPlan) return null;
    return dietPlan.days.find(d => d.dayOfWeek === selectedDay);
  }, [dietPlan, selectedDay]);

  const adherence = useMemo(() => {
    if (!dietPlan || !selectedDayData) return null;
    
    // Only calculate actual consumed for TODAY to avoid complexity of historic date matching
    const today = new Date();
    today.setHours(0,0,0,0);
    const isToday = selectedDay === currentDayName;
    
    let consumedCals = 0;
    let consumedPro = 0;
    let consumedCarbs = 0;
    let consumedFat = 0;
    const loggedMeals = new Set<string>();

    if (isToday) {
       const todayLogs = allRecords.filter((m: any) => {
         const d = new Date(m.selectedAt || m.createdAt || m.date);
         d.setHours(0,0,0,0);
         return d.getTime() === today.getTime();
       });
       
       todayLogs.forEach(m => {
          consumedCals += m.calories || 0;
          consumedPro += m.protein || 0;
          consumedCarbs += m.carbs || 0;
          consumedFat += m.fats || 0;
          loggedMeals.add(m.category || m.mealType);
       });
    }

    return {
      isToday,
      consumedCals, consumedPro, consumedCarbs, consumedFat,
      loggedMeals
    };
  }, [dietPlan, selectedDayData, allRecords, selectedDay, currentDayName]);

  const getMealStatusUI = (mealKey: string, isExtra: boolean = false) => {
     if (!adherence?.isToday || !intelligence?.dietPlanComparison?.mealStatuses) {
        return { text: 'Remaining', color: '#94A3B8', Icon: Circle };
     }
     const status = intelligence.dietPlanComparison.mealStatuses[mealKey];
     if (isExtra) return { text: 'Extra Meal', color: '#38BDF8', Icon: PlusCircle };
     
     switch (status) {
       case 'Completed': return { text: 'Completed', color: '#10B981', Icon: CheckCircle2 };
       case 'Partially Followed': return { text: 'Partially Followed', color: '#F59E0B', Icon: AlertCircle };
       case 'Skipped': return { text: 'Skipped', color: '#EF4444', Icon: AlertCircle };
       default: return { text: 'Remaining', color: '#94A3B8', Icon: Circle };
     }
  };

  if (loading && !refreshing) {
    return (
      <View style={[s.container, { paddingTop: insets.top }]}>
        <View style={{ padding: 24 }}><SkeletonCard /><SkeletonCard /></View>
      </View>
    );
  }

  if (!dietPlan) {
    return (
      <View style={s.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[s.header, { paddingTop: insets.top + 16 }]}>
          <TouchableOpacity onPress={() => router.back()} style={s.backButton}><ArrowLeft size={20} color="#F8FAFC" /></TouchableOpacity>
          <Text style={s.headerTitle}>My Diet Plan</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={s.emptyState}>
          <HeartPulse size={48} color="#64748B" />
          <Text style={s.emptyTitle}>No Diet Plan Assigned</Text>
          <Text style={s.emptySub}>Your trainer hasn't assigned a structured plan yet. Continue using Food Records to track your meals manually.</Text>
          <TouchableOpacity style={s.logBtn} onPress={() => router.push('/(tabs)/diet')}>
             <Text style={s.logBtnText}>Go to Food Records</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[s.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backButton}><ArrowLeft size={20} color="#F8FAFC" /></TouchableOpacity>
        <Text style={s.headerTitle}>{dietPlan.title}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={s.daysTabs}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
           {DAYS_OF_WEEK.map(day => (
              <TouchableOpacity key={day} onPress={() => setSelectedDay(day)} style={[s.dayTab, selectedDay === day && s.dayTabActive]}>
                 <Text style={[s.dayTabText, selectedDay === day && s.dayTabTextActive]}>{day.substring(0, 3)}</Text>
              </TouchableOpacity>
           ))}
        </ScrollView>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100, maxWidth: 1000, alignSelf: 'center', width: '100%' }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10B981" />}
      >
        <LinearGradient colors={['#1E293B', '#0F172A']} style={s.heroSection}>
           <Text style={s.heroSub}>Goal: {dietPlan.goal} • {dietPlan.durationWeeks} Weeks</Text>
           
           <View style={s.targetsRow}>
             <View style={s.targetCard}>
               <Flame size={20} color="#F59E0B" />
               <Text style={s.tCardVal}>{dietPlan.dailyCalories}</Text>
               <Text style={s.tCardLab}>Calories</Text>
             </View>
             <View style={s.targetCard}>
               <Droplet size={20} color="#38BDF8" />
               <Text style={s.tCardVal}>{dietPlan.waterTarget}L</Text>
               <Text style={s.tCardLab}>Water Target</Text>
             </View>
           </View>

           {adherence?.isToday && (
              <View style={s.adherenceBox}>
                 <Text style={s.adTitle}>Today's Adherence</Text>
                 <View style={s.adRow}>
                    <Text style={s.adLab}>Calories: {adherence.consumedCals} / {dietPlan.dailyCalories}</Text>
                    <Text style={[s.adDiff, { color: adherence.consumedCals > dietPlan.dailyCalories ? '#EF4444' : '#10B981' }]}>
                       {Math.abs(dietPlan.dailyCalories - adherence.consumedCals)} {adherence.consumedCals > dietPlan.dailyCalories ? 'Surplus' : 'Remaining'}
                    </Text>
                 </View>
              </View>
           )}
        </LinearGradient>

        <View style={s.content}>
           {!selectedDayData ? (
             <Text style={s.emptyText}>No plan configured for {selectedDay}</Text>
           ) : (
             <>
               {['breakfast', 'snack1', 'lunch', 'snack2', 'dinner'].map((mealKey) => {
                  const meal: DietPlanMeal = (selectedDayData as any)[mealKey];
                  if (!meal || !meal.foods || meal.foods.length === 0) return null;
                  
                  const logCat = mealKey.includes('snack') ? 'Snack' : mealKey.charAt(0).toUpperCase() + mealKey.slice(1);
                  const statusUI = getMealStatusUI(mealKey);

                  return (
                     <View key={mealKey} style={[SharedStyles.card, s.mealCard, { borderColor: statusUI.color === '#94A3B8' ? 'transparent' : `${statusUI.color}40`, borderWidth: 1 }]}>
                        <View style={s.mealHeader}>
                           <Text style={s.mealTitle}>{meal.mealName || logCat}</Text>
                           <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                             <Text style={[s.mealStatus, { color: statusUI.color }]}>{statusUI.text}</Text>
                             <statusUI.Icon size={20} color={statusUI.color} />
                           </View>
                        </View>
                        
                        <View style={s.mealMacrosRow}>
                           <Text style={s.mmText}><Flame size={12} color="#F59E0B" /> {meal.calories} kcal</Text>
                           <Text style={s.mmText}>P: {meal.protein}g</Text>
                           <Text style={s.mmText}>C: {meal.carbs}g</Text>
                           <Text style={s.mmText}>F: {meal.fat}g</Text>
                        </View>

                        <View style={s.foodsList}>
                           {meal.foods.map((food, idx) => (
                             <Text key={idx} style={s.foodItem}>• {food.quantity}x {food.serving} {food.name}</Text>
                           ))}
                        </View>
                     </View>
                  );
               })}
               
               {/* Show Extra Meals if any */}
               {adherence?.isToday && intelligence?.dietPlanComparison?.mealStatuses && (
                  Object.keys(intelligence.dietPlanComparison.mealStatuses)
                    .filter(k => k.startsWith('extra_'))
                    .map(extraKey => {
                       const extraName = extraKey.replace('extra_', '');
                       const statusUI = getMealStatusUI(extraKey, true);
                       return (
                         <View key={extraKey} style={[SharedStyles.card, s.mealCard, { borderColor: `${statusUI.color}40`, borderWidth: 1 }]}>
                            <View style={s.mealHeader}>
                               <Text style={s.mealTitle}>{extraName}</Text>
                               <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                 <Text style={[s.mealStatus, { color: statusUI.color }]}>{statusUI.text}</Text>
                                 <statusUI.Icon size={20} color={statusUI.color} />
                               </View>
                            </View>
                            <Text style={{ color: '#94A3B8', fontSize: 13, marginTop: 4 }}>You logged this meal but it wasn't in your plan.</Text>
                         </View>
                       );
                    })
               )}
             </>
           )}
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16, backgroundColor: '#1E293B' },
  backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: '800' },
  
  daysTabs: { backgroundColor: '#1E293B', paddingVertical: 12 },
  dayTab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 100, marginRight: 8, backgroundColor: 'rgba(255,255,255,0.05)' },
  dayTabActive: { backgroundColor: '#38BDF8' },
  dayTabText: { color: '#94A3B8', fontSize: 14, fontWeight: '700' },
  dayTabTextActive: { color: '#0F172A', fontWeight: '900' },

  heroSection: { padding: 24, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  heroSub: { color: '#38BDF8', fontSize: 14, fontWeight: '800', textTransform: 'uppercase', marginBottom: 16 },
  
  targetsRow: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  targetCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 16, alignItems: 'center' },
  tCardVal: { color: '#F8FAFC', fontSize: 24, fontWeight: '900', marginVertical: 4 },
  tCardLab: { color: '#94A3B8', fontSize: 12, fontWeight: '700' },

  adherenceBox: { backgroundColor: 'rgba(15,23,42,0.5)', padding: 16, borderRadius: 16 },
  adTitle: { color: '#F8FAFC', fontSize: 14, fontWeight: '800', marginBottom: 8 },
  adRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  adLab: { color: '#CBD5E1', fontSize: 13, fontWeight: '600' },
  adDiff: { fontSize: 13, fontWeight: '800' },

  content: { padding: 24 },
  emptyText: { color: '#94A3B8', textAlign: 'center', marginTop: 40, fontSize: 15 },
  
  mealCard: { padding: 20, marginBottom: 16 },
  mealHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  mealTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: '900' },
  mealStatus: { fontSize: 13, fontWeight: '800' },
  
  mealMacrosRow: { flexDirection: 'row', gap: 12, marginBottom: 16, backgroundColor: 'rgba(15,23,42,0.5)', padding: 8, borderRadius: 8 },
  mmText: { color: '#CBD5E1', fontSize: 12, fontWeight: '700' },
  
  foodsList: { gap: 6 },
  foodItem: { color: '#94A3B8', fontSize: 14, fontWeight: '500' },
  
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyTitle: { color: '#F8FAFC', fontSize: 20, fontWeight: '900', marginTop: 16, marginBottom: 8 },
  emptySub: { color: '#94A3B8', fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  logBtn: { backgroundColor: '#38BDF8', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 100 },
  logBtnText: { color: '#0F172A', fontSize: 14, fontWeight: '900' }
});
