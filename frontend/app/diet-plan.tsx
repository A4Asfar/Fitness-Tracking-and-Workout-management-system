import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Text, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DietPlanService, DietPlan } from '@/services/dietPlanService';
import SkeletonCard from '@/components/SkeletonCard';
import { SharedStyles } from '@/constants/Theme';
import { Flame, Droplet, ArrowLeft, HeartPulse, CheckCircle2 } from 'lucide-react-native';
import { MealService } from '@/services/mealService';

export default function UserDietPlanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
  
  // For completion % we will just look at how many meals were logged today in MealService matching the categories.
  const [completedMealsCount, setCompletedMealsCount] = useState(0);

  const fetchData = async () => {
    try {
      const [plan, allRecords] = await Promise.all([
        DietPlanService.getMyDietPlan(),
        MealService.getMeals()
      ]);
      setDietPlan(plan);

      // Simple completion logic: count how many distinct meal types logged today
      if (plan) {
        const today = new Date();
        today.setHours(0,0,0,0);
        
        const todayLogs = allRecords.filter((m: any) => {
           const d = new Date(m.selectedAt || m.createdAt || m.date);
           d.setHours(0,0,0,0);
           return d.getTime() === today.getTime();
        });
        
        // Count unique meal types logged today that match the plan's meal types
        const loggedTypes = new Set(todayLogs.map((m: any) => m.mealType));
        const plannedTypes = new Set(plan.meals.map(m => m.mealType));
        
        let count = 0;
        plannedTypes.forEach(pt => {
           if (loggedTypes.has(pt)) count++;
        });
        setCompletedMealsCount(count);
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

  const plannedTypesCount = new Set(dietPlan.meals.map(m => m.mealType)).size;
  const completionPct = plannedTypesCount === 0 ? 0 : Math.round((completedMealsCount / plannedTypesCount) * 100);

  return (
    <View style={s.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[s.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backButton}><ArrowLeft size={20} color="#F8FAFC" /></TouchableOpacity>
        <Text style={s.headerTitle}>{dietPlan.planName}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100, maxWidth: 1000, alignSelf: 'center', width: '100%' }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10B981" />}
      >
        <LinearGradient colors={['#1E293B', '#0F172A']} style={s.heroSection}>
           <Text style={s.heroSub}>Goal: {dietPlan.goal}</Text>
           
           <View style={s.targetsRow}>
             <View style={s.targetCard}>
               <Flame size={20} color="#F59E0B" />
               <Text style={s.tCardVal}>{dietPlan.targetCalories}</Text>
               <Text style={s.tCardLab}>Calories</Text>
             </View>
             <View style={s.targetCard}>
               <Droplet size={20} color="#38BDF8" />
               <Text style={s.tCardVal}>{dietPlan.waterTargetLiters}L</Text>
               <Text style={s.tCardLab}>Water</Text>
             </View>
           </View>
           
           <View style={s.macrosRow}>
             <View style={s.macroItem}>
               <Text style={s.macroName}>Protein</Text>
               <Text style={s.macroVal}>{dietPlan.targetProtein}g</Text>
               <View style={s.miniBarBg}><View style={[s.miniBarFill, { width: '100%', backgroundColor: '#10B981' }]} /></View>
             </View>
             <View style={s.macroItem}>
               <Text style={s.macroName}>Carbs</Text>
               <Text style={s.macroVal}>{dietPlan.targetCarbs}g</Text>
               <View style={s.miniBarBg}><View style={[s.miniBarFill, { width: '100%', backgroundColor: '#F59E0B' }]} /></View>
             </View>
             <View style={s.macroItem}>
               <Text style={s.macroName}>Fat</Text>
               <Text style={s.macroVal}>{dietPlan.targetFat}g</Text>
               <View style={s.miniBarBg}><View style={[s.miniBarFill, { width: '100%', backgroundColor: '#EF4444' }]} /></View>
             </View>
           </View>

           <View style={s.compRow}>
              <Text style={s.compLabel}>Today's Completion</Text>
              <Text style={s.compPct}>{completionPct}%</Text>
           </View>
           <View style={s.compBarBg}>
              <View style={[s.compBarFill, { width: `${completionPct}%` }]} />
           </View>
        </LinearGradient>

        <View style={s.content}>
           <Text style={s.sectionTitle}>Structured Meals</Text>
           {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map(type => {
              const meals = dietPlan.meals.filter(m => m.mealType === type);
              if (meals.length === 0) return null;
              return (
                 <View key={type} style={s.mealSection}>
                    <Text style={s.mealTypeTitle}>{type}</Text>
                    {meals.map((m, idx) => (
                       <View key={idx} style={[SharedStyles.card, s.mealCard]}>
                          <View style={s.mcInfo}>
                             <Text style={s.mcFood}>{m.foodName}</Text>
                             <Text style={s.mcServing}>{m.quantity}x {m.servingSize}</Text>
                             {m.notes ? <Text style={s.mcNotes}>Note: {m.notes}</Text> : null}
                          </View>
                          <CheckCircle2 size={24} color="#10B981" />
                       </View>
                    ))}
                 </View>
              );
           })}
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
  
  heroSection: { padding: 24, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  heroSub: { color: '#10B981', fontSize: 14, fontWeight: '800', textTransform: 'uppercase', marginBottom: 16 },
  
  targetsRow: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  targetCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 16, alignItems: 'center' },
  tCardVal: { color: '#F8FAFC', fontSize: 24, fontWeight: '900', marginVertical: 4 },
  tCardLab: { color: '#94A3B8', fontSize: 12, fontWeight: '700' },

  macrosRow: { flexDirection: 'row', gap: 16, marginBottom: 32 },
  macroItem: { flex: 1 },
  macroName: { color: '#94A3B8', fontSize: 12, fontWeight: '700', marginBottom: 4 },
  macroVal: { color: '#F8FAFC', fontSize: 16, fontWeight: '800', marginBottom: 8 },
  miniBarBg: { height: 6, backgroundColor: '#0F172A', borderRadius: 3, overflow: 'hidden' },
  miniBarFill: { height: '100%', borderRadius: 3 },

  compRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  compLabel: { color: '#F8FAFC', fontSize: 14, fontWeight: '800' },
  compPct: { color: '#10B981', fontSize: 14, fontWeight: '900' },
  compBarBg: { height: 8, backgroundColor: '#0F172A', borderRadius: 4, overflow: 'hidden' },
  compBarFill: { height: '100%', backgroundColor: '#10B981', borderRadius: 4 },

  content: { padding: 24 },
  sectionTitle: { color: '#F8FAFC', fontSize: 20, fontWeight: '900', marginBottom: 16 },
  
  mealSection: { marginBottom: 24 },
  mealTypeTitle: { color: '#94A3B8', fontSize: 14, fontWeight: '800', textTransform: 'uppercase', marginBottom: 12 },
  mealCard: { flexDirection: 'row', alignItems: 'center', padding: 16, marginBottom: 12 },
  mcInfo: { flex: 1 },
  mcFood: { color: '#F8FAFC', fontSize: 16, fontWeight: '800', marginBottom: 4 },
  mcServing: { color: '#38BDF8', fontSize: 13, fontWeight: '700', marginBottom: 4 },
  mcNotes: { color: '#94A3B8', fontSize: 12, fontStyle: 'italic' },
  
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyTitle: { color: '#F8FAFC', fontSize: 20, fontWeight: '900', marginTop: 16, marginBottom: 8 },
  emptySub: { color: '#94A3B8', fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  logBtn: { backgroundColor: '#10B981', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 100 },
  logBtnText: { color: '#0F172A', fontSize: 14, fontWeight: '900' }
});
