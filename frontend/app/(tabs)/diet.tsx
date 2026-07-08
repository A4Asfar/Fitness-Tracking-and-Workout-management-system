import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, StyleSheet, ActivityIndicator, Alert, ScrollView, Dimensions, Modal, Text, TouchableOpacity
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { MealService } from '@/services/mealService';
import { ContentService } from '@/services/contentService';
import { Colors } from '@/constants/Theme';
import { 
  Plus, ChevronRight, Apple, Zap, Flame, Target, Sparkles
} from 'lucide-react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import SkeletonCard, { SkeletonItem } from '@/components/SkeletonCard';

import { 
  NutritionSuggestion, 
  getIconComponent 
} from '@/services/recommendations';
import { PremiumGate } from '@/components/PremiumGate';

// Extracted Premium Components
import NutritionHeader from '@/components/nutrition/NutritionHeader';
import NutritionSummary from '@/components/nutrition/NutritionSummary';
import WaterTracker from '@/components/nutrition/WaterTracker';
import MealSection from '@/components/nutrition/MealSection';
import AddMealModal from '@/components/nutrition/AddMealModal';
import EmptyState from '@/components/workout/EmptyState';

const { width } = Dimensions.get('window');

interface Meal {
  _id: string;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  selectedMeal: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fats?: number;
}

export default function DietScreen() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeDefaultType, setActiveDefaultType] = useState<'Breakfast' | 'Lunch' | 'Dinner' | 'Snack'>('Breakfast');
  
  const [selectedMeal, setSelectedMeal] = useState<NutritionSuggestion | null>(null);
  const [suggestions, setSuggestions] = useState<NutritionSuggestion[]>([]);
  const { user } = useAuth();
  const { mealName } = useLocalSearchParams<{ mealName?: string }>();
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const currentGoal = user?.fitnessGoal || 'General Fitness';

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const data = await ContentService.getNutritionSuggestions(user?.fitnessGoal);
        setSuggestions(data);
      } catch (err) {
        if (__DEV__) console.error('Failed to fetch suggestions:', err);
      }
    };
    fetchSuggestions();
  }, [user?.fitnessGoal]);

  useEffect(() => {
    if (mealName) {
      const fetchMeal = async () => {
        try {
          const meal = await ContentService.getMealByName(mealName);
          if (meal) setSelectedMeal(meal);
        } catch (err) {
          if (__DEV__) console.error('Failed to fetch meal:', err);
        }
      };
      fetchMeal();
    }
  }, [mealName]);

  const fetchMeals = useCallback(async () => {
    setError(null);
    try {
      const data = await MealService.getMeals();
      setMeals(data);
    } catch (err: any) {
      if (__DEV__) console.error('Fetch meals error:', err);
      setError(err.message || 'Failed to fetch meals');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMeals();
  }, [fetchMeals]);

  const handleAddMeal = async (
    name: string,
    type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack',
    calories: number,
    protein: number,
    carbs: number,
    fats: number
  ) => {
    setIsAdding(true);
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
      setSelectedMeal(null);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to add meal');
    } finally {
      setIsAdding(false);
    }
  };

  const deleteMeal = async (id: string) => {
    try {
      await MealService.deleteMeal(id);
      setMeals(meals.filter(m => m._id !== id));
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to delete meal');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: 60, paddingHorizontal: 20 }]}>
        <View style={{ marginBottom: 24 }}>
          <SkeletonItem width="40%" height={24} style={{ marginBottom: 8 }} />
          <SkeletonItem width="60%" height={16} />
        </View>
        <SkeletonCard style={{ height: 180, marginBottom: 20 }} />
        <SkeletonCard style={{ height: 120, marginBottom: 20 }} />
        <SkeletonCard style={{ height: 120 }} />
      </View>
    );
  }

  if (error && !refreshing) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>SYNC ERROR</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          onPress={() => { setLoading(true); fetchMeals(); }} 
          style={styles.retryBtn}
          activeOpacity={0.8}
        >
          <Text style={styles.retryText}>RETRY SYNC</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Calculate Aggregates
  const totalCalories = meals.reduce((sum, m) => sum + (m.calories || 0), 0);
  const totalProtein = meals.reduce((sum, m) => sum + (m.protein || 0), 0);
  const totalCarbs = meals.reduce((sum, m) => sum + (m.carbs || 0), 0);
  const totalFat = meals.reduce((sum, m) => sum + (m.fats || 0), 0);

  const breakfastMeals = meals.filter(m => m.mealType === 'Breakfast');
  const lunchMeals = meals.filter(m => m.mealType === 'Lunch');
  const dinnerMeals = meals.filter(m => m.mealType === 'Dinner');
  const snackMeals = meals.filter(m => m.mealType === 'Snack');

  const triggerAddFood = (type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack') => {
    setActiveDefaultType(type);
    setIsModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Smart Nutrition',
          headerShown: true,
          headerStyle: { backgroundColor: '#F8FAFC' },
          headerTintColor: '#0F172A',
          headerShadowVisible: false,
        }} 
      />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Customized header showing goal info */}
        <NutritionHeader goalName={currentGoal} />

        {/* Energy Summary + Macro indicators */}
        <NutritionSummary 
          consumed={totalCalories}
          target={(user as any)?.dailyCalorieTarget || 2000}
          protein={totalProtein}
          carbs={totalCarbs}
          fat={totalFat}
        />

        {/* Water / Hydration Tracker */}
        <WaterTracker />

        <PremiumGate
          featureTitle="AI Nutrition Planner"
          featureDescription="Unlock progressive AI meal suggestions custom-designed to hit your macro targets, food choices, and fitness goals."
          style={{ marginHorizontal: 20, marginBottom: 20 }}
        >
          {/* AI Suggestions Section */}
          <View style={styles.bannerContainer}>
            <LinearGradient
              colors={['#10B98115', '#10B98103']}
              style={styles.banner}
            >
              <View style={styles.bannerContent}>
                <View style={styles.bannerTextContainer}>
                  <View style={styles.bannerTag}>
                    <Sparkles size={12} color="#10B981" fill="#10B981" />
                    <Text style={styles.bannerTagText}>AI COACH RECOMMENDATIONS</Text>
                  </View>
                  <Text style={styles.bannerTitle}>Daily Meal suggestions</Text>
                  <Text style={styles.bannerSubtitle}>Based on your {currentGoal} target goal.</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Horizontal Suggestions Carousel */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestionScroll}
          >
            {suggestions.map((item, idx) => {
              const SuggestionIcon = getIconComponent(item.icon);
              return (
                <TouchableOpacity 
                  key={idx} 
                  style={styles.suggestionCard}
                  onPress={() => setSelectedMeal(item)}
                  activeOpacity={0.8}
                >
                  <View style={styles.suggestionHeader}>
                    <View style={styles.suggestionIconBox}>
                      <SuggestionIcon size={18} color="#10B981" />
                    </View>
                    <Text style={styles.suggestionType}>{item.type}</Text>
                  </View>
                  <Text style={styles.suggestionName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.suggestionNote} numberOfLines={2}>{item.note}</Text>
                  <View style={styles.quickAdd}>
                    <Plus size={12} color="#FFFFFF" strokeWidth={2.5} />
                    <Text style={styles.quickAddText}>View details</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </PremiumGate>

        {/* Expandable Meal Sections */}
        <View style={styles.mealSectionsContainer}>
          <MealSection 
            type="Breakfast"
            meals={breakfastMeals}
            onAddPress={() => triggerAddFood('Breakfast')}
            onDeleteMeal={deleteMeal}
          />
          <MealSection 
            type="Lunch"
            meals={lunchMeals}
            onAddPress={() => triggerAddFood('Lunch')}
            onDeleteMeal={deleteMeal}
          />
          <MealSection 
            type="Dinner"
            meals={dinnerMeals}
            onAddPress={() => triggerAddFood('Dinner')}
            onDeleteMeal={deleteMeal}
          />
          <MealSection 
            type="Snack"
            meals={snackMeals}
            onAddPress={() => triggerAddFood('Snack')}
            onDeleteMeal={deleteMeal}
          />
        </View>

        {/* Large Empty state when logs are completely blank */}
        {meals.length === 0 && (
          <EmptyState 
            title="Log Your Nutrition"
            description="Keep track of your breakfast, lunch, and dinner to hit your daily macro budget targets."
            buttonLabel="Add Custom Meal"
            onButtonPress={() => triggerAddFood('Breakfast')}
            accentColor="#10B981"
          />
        )}

        {/* Meal Detail Modal */}
        <Modal
          visible={!!selectedMeal}
          transparent
          animationType="slide"
          onRequestClose={() => setSelectedMeal(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHandle} />
              {selectedMeal && (
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={styles.modalHeader}>
                    <View style={styles.modalIconBox}>
                      {React.createElement(getIconComponent(selectedMeal.icon), { size: 28, color: '#10B981' })}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.modalTitle}>{selectedMeal.name}</Text>
                      <Text style={styles.modalType}>{selectedMeal.type} • Recommendation</Text>
                    </View>
                    <TouchableOpacity onPress={() => setSelectedMeal(null)} style={styles.closeBtn} activeOpacity={0.7}>
                      <Plus size={24} color="#64748B" style={{ transform: [{ rotate: '45deg' }] }} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.macroGrid}>
                    <MacroItem label="Calories" value={selectedMeal.calories} unit="kcal" />
                    <MacroItem label="Protein" value={selectedMeal.protein} unit="g" />
                    <MacroItem label="Carbs" value={selectedMeal.carbs} unit="g" />
                    <MacroItem label="Fats" value={selectedMeal.fats} unit="g" />
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Health Benefit</Text>
                    <Text style={styles.detailText}>{selectedMeal.benefit}</Text>
                  </View>

                  <View style={[styles.detailSection, { backgroundColor: '#E6F4EA', borderColor: '#A7F3D0' }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <Target size={16} color="#10B981" />
                      <Text style={[styles.detailLabel, { color: '#10B981', marginBottom: 0 }]}>Why it matches your goal</Text>
                    </View>
                    <Text style={[styles.detailText, { color: '#0F172A' }]}>
                      This meal is optimized for {currentGoal} by providing {selectedMeal.calories} clean calories with a high {selectedMeal.protein}g protein ratio.
                    </Text>
                  </View>

                  <TouchableOpacity 
                    style={[styles.logBtn, isAdding && { opacity: 0.7 }]}
                    onPress={() => handleAddMeal(
                      selectedMeal.name, 
                      selectedMeal.type as any, 
                      selectedMeal.calories, 
                      selectedMeal.protein, 
                      selectedMeal.carbs, 
                      selectedMeal.fats
                    )}
                    disabled={isAdding}
                  >
                    <Text style={styles.logBtnText}>{isAdding ? 'Logging...' : 'Log This Meal'}</Text>
                  </TouchableOpacity>
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>

        {/* Global Manual Food Logger Modal */}
        <AddMealModal 
          visible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          onAdd={handleAddMeal}
          defaultType={activeDefaultType}
        />
      </ScrollView>
    </View>
  );
}

function MacroItem({ label, value, unit }: any) {
  return (
    <View style={styles.macroGridItem}>
      <Text style={styles.macroValue}>{value}<Text style={styles.macroUnit}>{unit}</Text></Text>
      <Text style={styles.macroLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loaderContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14,
  },
  loaderText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    color: '#FF4D4D',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 8,
  },
  errorText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
  },
  retryBtn: {
    height: 52,
    width: 160,
    borderRadius: 16,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  bannerContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  banner: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#10B98130',
  },
  bannerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  bannerTagText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  bannerTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  bannerSubtitle: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '500',
  },
  suggestionScroll: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  suggestionCard: {
    width: width * 0.65,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  suggestionIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#E6F4EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionType: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  suggestionName: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  suggestionNote: {
    color: '#64748B',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    marginBottom: 14,
  },
  quickAdd: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    alignSelf: 'flex-start',
    gap: 6,
  },
  quickAddText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  mealSectionsContainer: {
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    maxHeight: '85%',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  modalHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#CBD5E1',
    borderRadius: 10,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalIconBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#E6F4EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  modalTitle: {
    color: '#0F172A',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  modalType: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  macroGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
    marginTop: 8,
  },
  macroGridItem: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 16,
    width: (width - 48 - 30) / 4,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  macroValue: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '800',
  },
  macroUnit: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  macroLabel: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginTop: 4,
  },
  detailSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  detailLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  detailText: {
    color: '#64748B',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  logBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  logBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
