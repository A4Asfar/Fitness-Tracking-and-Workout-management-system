import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, Alert, ScrollView, Dimensions, Text, TouchableOpacity, ImageBackground, Animated, useWindowDimensions } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { MealService } from '@/services/mealService';
import { 
  Plus, Target, Sparkles, Flame, Droplet, Activity, CheckCircle2, Leaf, HeartPulse, ChevronRight, Utensils
} from 'lucide-react-native';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SkeletonCard from '@/components/SkeletonCard';
import AddMealModal from '@/components/nutrition/AddMealModal';

interface Meal {
  _id: string;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  selectedMeal: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fats?: number;
}

// Mock image mapping for premium UI
const getMealImage = (name: string, type: string) => {
  const lower = name.toLowerCase();
  if (lower.includes('salad') || lower.includes('veg')) return 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80';
  if (lower.includes('chicken') || lower.includes('steak') || lower.includes('meat')) return 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=800&q=80';
  if (lower.includes('oat') || lower.includes('pancake') || type === 'Breakfast') return 'https://images.unsplash.com/photo-1494390248081-4e521a5940db?w=800&q=80';
  if (lower.includes('smoothie') || lower.includes('shake')) return 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=800&q=80';
  return 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80'; // Default healthy food
};

// Check for badges
const isVegetarian = (name: string) => {
  const lower = name.toLowerCase();
  return lower.includes('veg') || lower.includes('salad') || lower.includes('tofu') || lower.includes('oat') || lower.includes('smoothie');
};

export default function DietScreen() {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeType, setActiveType] = useState<'Breakfast' | 'Lunch' | 'Dinner' | 'Snack'>('Breakfast');

  const progressAnim = useRef(new Animated.Value(0)).current;

  const currentGoal = user?.fitnessGoal || 'Fat Loss';
  const calorieTarget = (user as any)?.dailyCalorieTarget || 2200;

  const fetchMeals = useCallback(async () => {
    setError(null);
    try {
      const data = await MealService.getMeals();
      setMeals(data);
      
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false
      }).start();

    } catch (err: any) {
      setError(err.message || 'Failed to fetch meals');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMeals();
  }, [fetchMeals]);

  const onRefresh = () => {
    setRefreshing(true);
    progressAnim.setValue(0);
    fetchMeals();
  };

  const handleDelete = async (id: string) => {
    Alert.alert('Delete Entry', 'Are you sure you want to remove this meal?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await MealService.deleteMeal(id);
            setMeals(meals.filter(m => m._id !== id));
          } catch (err) {
            Alert.alert('Error', 'Failed to delete meal');
          }
      }}
    ]);
  };

  const handleAddMeal = async (name: string, type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack', calories: number, protein: number, carbs: number, fats: number) => {
    try {
      const data = await MealService.logMeal({
        userId: user?._id || user?.id,
        mealType: type,
        selectedMeal: name,
        calories: calories || 0,
        protein: protein || 0,
        carbs: carbs || 0,
        fats: fats || 0,
        selectedAt: new Date().toISOString(),
      });
      setMeals(prev => [data, ...prev]);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to log meal');
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={[s.container, { paddingTop: insets.top }]}>
        <View style={{ padding: 24 }}><SkeletonCard /><SkeletonCard /><SkeletonCard /></View>
      </View>
    );
  }

  const totalCalories = meals.reduce((sum, m) => sum + (m.calories || 0), 0);
  const totalProtein = meals.reduce((sum, m) => sum + (m.protein || 0), 0);
  const totalCarbs = meals.reduce((sum, m) => sum + (m.carbs || 0), 0);
  const totalFat = meals.reduce((sum, m) => sum + (m.fats || 0), 0);

  const calPercent = Math.min(totalCalories / calorieTarget, 1);
  const proPercent = Math.min(totalProtein / 150, 1); // Mock targets
  const carbPercent = Math.min(totalCarbs / 250, 1);
  const fatPercent = Math.min(totalFat / 70, 1);

  const calWidth = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', `${calPercent * 100}%`] });
  const proWidth = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', `${proPercent * 100}%`] });
  const carbWidth = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', `${carbPercent * 100}%`] });
  const fatWidth = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', `${fatPercent * 100}%`] });

  return (
    <View style={s.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 , maxWidth: 1000, width: '100%', alignSelf: 'center' }}
      >
        {/* HEADER */}
        <LinearGradient colors={['#1E293B', '#0F172A']} style={[s.heroSection, { paddingTop: insets.top + 16 }]}>
          <Text style={s.headerSubtitle}>Nutrition Center</Text>
          <Text style={s.headerTitle}>Diet Plan</Text>

          {/* DAILY NUTRITION SUMMARY */}
          <View style={s.summaryCard}>
            <View style={s.calRow}>
              <View style={s.calLeft}>
                <Flame size={24} color="#38BDF8" style={{ marginBottom: 8 }} />
                <Text style={s.calLabel}>Calories Eaten</Text>
                <Text style={s.calValue}>{totalCalories} <Text style={s.calTarget}>/ {calorieTarget}</Text></Text>
              </View>
              <View style={s.calRight}>
                <Text style={s.calRemaining}>{(calorieTarget - totalCalories) > 0 ? (calorieTarget - totalCalories) : 0}</Text>
                <Text style={s.calRemainingLabel}>Left Today</Text>
              </View>
            </View>
            
            <View style={s.macroBarBg}>
              <Animated.View style={[s.macroBarFill, { width: calWidth, backgroundColor: '#38BDF8' }]} />
            </View>

            <View style={s.macrosRow}>
              <View style={s.macroItem}>
                <Text style={s.macroName}>Protein</Text>
                <Text style={s.macroVal}>{totalProtein}g</Text>
                <View style={s.miniBarBg}><Animated.View style={[s.miniBarFill, { width: proWidth, backgroundColor: '#10B981' }]} /></View>
              </View>
              <View style={s.macroItem}>
                <Text style={s.macroName}>Carbs</Text>
                <Text style={s.macroVal}>{totalCarbs}g</Text>
                <View style={s.miniBarBg}><Animated.View style={[s.miniBarFill, { width: carbWidth, backgroundColor: '#F59E0B' }]} /></View>
              </View>
              <View style={s.macroItem}>
                <Text style={s.macroName}>Fat</Text>
                <Text style={s.macroVal}>{totalFat}g</Text>
                <View style={s.miniBarBg}><Animated.View style={[s.miniBarFill, { width: fatWidth, backgroundColor: '#EF4444' }]} /></View>
              </View>
            </View>
          </View>
        </LinearGradient>

        <View style={s.content}>
          {/* AI RECOMMENDATION CARD */}
          <View style={s.aiCard}>
            <LinearGradient colors={['#10B98115', 'rgba(15,23,42,0)']} style={s.aiGrad}>
              <View style={s.aiHeader}>
                <Sparkles size={20} color="#10B981" fill="#10B981" />
                <Text style={s.aiTitle}>AI Coach Suggestion</Text>
              </View>
              <Text style={s.aiText}>Based on your <Text style={{ color: '#F8FAFC', fontWeight: '800' }}>{currentGoal}</Text> goal, try adding a <Text style={{ color: '#10B981', fontWeight: '800' }}>High-Protein Quinoa Bowl</Text> for dinner to hit your remaining macro targets today.</Text>
              <TouchableOpacity style={s.aiBtn}>
                <Text style={s.aiBtnText}>View Recipe</Text>
                <ChevronRight size={16} color="#0F172A" />
              </TouchableOpacity>
            </LinearGradient>
          </View>

          {/* WEEKLY NUTRITION CHART */}
          <Text style={s.sectionTitle}>Weekly Average</Text>
          <View style={s.chartCard}>
            <View style={s.chartStatsRow}>
              <View>
                <Text style={s.chartLabel}>Avg. Caloric Intake</Text>
                <Text style={s.chartBigValue}>2,150<Text style={s.chartSmallValue}> /day</Text></Text>
              </View>
              <Activity size={24} color="#38BDF8" />
            </View>
            <View style={s.barsContainer}>
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => {
                const heights = [60, 80, 50, 95, 75, 40, 100]; // Mock chart data
                const h = heights[idx];
                const isToday = idx === 3; 
                return (
                  <View key={idx} style={s.barColumn}>
                    <View style={s.barTrack}>
                      <LinearGradient colors={isToday ? ['#38BDF8', '#0EA5E9'] : ['#334155', '#1E293B']} style={[s.barFill, { height: `${h}%` }]} />
                    </View>
                    <Text style={[s.barLabel, isToday && s.barLabelToday]}>{day}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* MEAL LOGS */}
          <View style={s.mealsHeaderRow}>
            <Text style={s.sectionTitle}>Today's Meals</Text>
            <TouchableOpacity onPress={() => { setActiveType('Breakfast'); setIsModalVisible(true); }}>
              <Text style={s.addMealLink}>+ Add Log</Text>
            </TouchableOpacity>
          </View>

          {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map(mealType => {
            const typedMeals = meals.filter(m => m.mealType === mealType);
            const totalCal = typedMeals.reduce((s, m) => s + (m.calories || 0), 0);
            
            return (
              <View key={mealType} style={s.mealSection}>
                <View style={s.mealSecHeader}>
                  <Text style={s.mealSecTitle}>{mealType}</Text>
                  <Text style={s.mealSecCal}>{totalCal} cal</Text>
                </View>

                {typedMeals.length === 0 ? (
                  <TouchableOpacity style={s.emptyMealAdd} onPress={() => { setActiveType(mealType as any); setIsModalVisible(true); }}>
                    <Plus size={20} color="#64748B" />
                    <Text style={s.emptyMealText}>Add {mealType}</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={s.mealList}>
                    {typedMeals.map(m => (
                      <View key={m._id} style={s.premiumMealCard}>
                        <ImageBackground source={{ uri: getMealImage(m.selectedMeal, m.mealType) }} style={s.mealImg} imageStyle={{ borderTopLeftRadius: 20, borderBottomLeftRadius: 20 }}>
                          <View style={s.mealImgOverlay}>
                            {isVegetarian(m.selectedMeal) && (
                              <View style={s.vegBadge}>
                                <Leaf size={10} color="#10B981" fill="#10B981" />
                                <Text style={s.vegBadgeText}>VEG</Text>
                              </View>
                            )}
                          </View>
                        </ImageBackground>
                        
                        <View style={s.mealCardInfo}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Text style={s.mealCardTitle}>{m.selectedMeal}</Text>
                            <TouchableOpacity onPress={() => handleDelete(m._id)} style={{ padding: 4 }}>
                              <Text style={s.mealDelText}>✕</Text>
                            </TouchableOpacity>
                          </View>

                          <View style={s.mealHealthyBadge}>
                            <HeartPulse size={12} color="#F59E0B" />
                            <Text style={s.mealHealthyText}>Healthy Choice</Text>
                          </View>

                          <View style={s.mealCardMacros}>
                            <View style={s.mCardMacro}><Text style={s.mCardVal}>{m.calories}</Text><Text style={s.mCardLab}>cal</Text></View>
                            <View style={s.mCardMacro}><Text style={s.mCardVal}>{m.protein || 0}g</Text><Text style={s.mCardLab}>P</Text></View>
                            <View style={s.mCardMacro}><Text style={s.mCardVal}>{m.carbs || 0}g</Text><Text style={s.mCardLab}>C</Text></View>
                            <View style={s.mCardMacro}><Text style={s.mCardVal}>{m.fats || 0}g</Text><Text style={s.mCardLab}>F</Text></View>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })}

        </View>
      </ScrollView>

      <AddMealModal{...{onAddMeal: handleAddMeal} as any} 
        defaultType={activeType} 
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  heroSection: { paddingHorizontal: 24, paddingBottom: 32, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },
  headerSubtitle: { color: '#94A3B8', fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  headerTitle: { color: '#F8FAFC', fontSize: 32, fontWeight: '900', letterSpacing: -1, marginBottom: 24 },

  summaryCard: { backgroundColor: '#1E293B', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  calRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 },
  calLeft: { flex: 1 },
  calLabel: { color: '#94A3B8', fontSize: 14, fontWeight: '700', marginBottom: 4 },
  calValue: { color: '#F8FAFC', fontSize: 36, fontWeight: '900', letterSpacing: -1 },
  calTarget: { color: '#64748B', fontSize: 18, fontWeight: '600' },
  calRight: { alignItems: 'flex-end' },
  calRemaining: { color: '#38BDF8', fontSize: 24, fontWeight: '900' },
  calRemainingLabel: { color: '#94A3B8', fontSize: 12, fontWeight: '700' },

  macroBarBg: { height: 12, backgroundColor: '#0F172A', borderRadius: 6, overflow: 'hidden', marginBottom: 24 },
  macroBarFill: { height: '100%', borderRadius: 6 },

  macrosRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 16 },
  macroItem: { flex: 1 },
  macroName: { color: '#94A3B8', fontSize: 12, fontWeight: '700', marginBottom: 4 },
  macroVal: { color: '#F8FAFC', fontSize: 16, fontWeight: '800', marginBottom: 8 },
  miniBarBg: { height: 6, backgroundColor: '#0F172A', borderRadius: 3, overflow: 'hidden' },
  miniBarFill: { height: '100%', borderRadius: 3 },

  content: { padding: 24 },

  aiCard: { backgroundColor: '#1E293B', borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: '#10B98130', marginBottom: 32 },
  aiGrad: { padding: 20 },
  aiHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  aiTitle: { color: '#10B981', fontSize: 15, fontWeight: '900', marginLeft: 8, letterSpacing: 0.5 },
  aiText: { color: '#94A3B8', fontSize: 14, lineHeight: 22, marginBottom: 16 },
  aiBtn: { backgroundColor: '#10B981', alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 100, flexDirection: 'row', alignItems: 'center' },
  aiBtnText: { color: '#0F172A', fontSize: 13, fontWeight: '900', marginRight: 4 },

  sectionTitle: { color: '#F8FAFC', fontSize: 20, fontWeight: '900', letterSpacing: -0.5, marginBottom: 16 },
  
  chartCard: { backgroundColor: '#1E293B', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', marginBottom: 32 },
  chartStatsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  chartLabel: { color: '#94A3B8', fontSize: 12, fontWeight: '700', marginBottom: 4 },
  chartBigValue: { color: '#F8FAFC', fontSize: 24, fontWeight: '900' },
  chartSmallValue: { color: '#64748B', fontSize: 14, fontWeight: '600' },
  barsContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 120 },
  barColumn: { alignItems: 'center', width: 32 },
  barTrack: { width: 12, height: 100, backgroundColor: '#0F172A', borderRadius: 6, justifyContent: 'flex-end', marginBottom: 12 },
  barFill: { width: 12, borderRadius: 6 },
  barLabel: { color: '#64748B', fontSize: 12, fontWeight: '700' },
  barLabelToday: { color: '#38BDF8', fontWeight: '900' },

  mealsHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  addMealLink: { color: '#38BDF8', fontSize: 14, fontWeight: '800' },

  mealSection: { marginBottom: 24 },
  mealSecHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  mealSecTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: '800' },
  mealSecCal: { color: '#94A3B8', fontSize: 14, fontWeight: '700' },
  
  emptyMealAdd: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(30,41,59,0.5)', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderStyle: 'dashed' },
  emptyMealText: { color: '#94A3B8', fontSize: 14, fontWeight: '600', marginLeft: 8 },

  mealList: { gap: 12 },
  premiumMealCard: { flexDirection: 'row', backgroundColor: '#1E293B', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  mealImg: { width: 100, height: '100%' },
  mealImgOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.2)', padding: 8, alignItems: 'flex-start' },
  vegBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(15,23,42,0.8)', paddingHorizontal: 6, paddingVertical: 4, borderRadius: 6 },
  vegBadgeText: { color: '#10B981', fontSize: 9, fontWeight: '900', marginLeft: 4, letterSpacing: 0.5 },
  
  mealCardInfo: { flex: 1, padding: 16 },
  mealCardTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: '800', marginBottom: 6, flex: 1, marginRight: 8 },
  mealDelText: { color: '#EF4444', fontSize: 12, fontWeight: '800' },
  mealHealthyBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(245,158,11,0.1)', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: 12 },
  mealHealthyText: { color: '#F59E0B', fontSize: 10, fontWeight: '800', marginLeft: 4 },
  
  mealCardMacros: { flexDirection: 'row', gap: 16 },
  mCardMacro: { flexDirection: 'row', alignItems: 'baseline' },
  mCardVal: { color: '#F8FAFC', fontSize: 14, fontWeight: '900' },
  mCardLab: { color: '#64748B', fontSize: 11, fontWeight: '700', marginLeft: 2 },
});
