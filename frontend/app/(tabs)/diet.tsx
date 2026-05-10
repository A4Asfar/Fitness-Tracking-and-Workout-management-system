import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, FlatList, TouchableOpacity, Text, StyleSheet, 
  ActivityIndicator, Alert, TextInput, ScrollView, Dimensions, Modal 
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { MealService } from '@/services/mealService';
import { ContentService } from '@/services/contentService';
import { Colors, SharedStyles, SPACING } from '@/constants/Theme';
import { 
  Plus, Trash2, Utensils, Coffee, Sun, Moon, 
  Sparkles, ChevronRight, Apple, Zap, Flame, Target
} from 'lucide-react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { 
  NutritionSuggestion, 
  getIconComponent 
} from '@/services/recommendations';

const { width } = Dimensions.get('window');

interface Meal {
  _id: string;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  selectedMeal: string;
  calories: number;
}

export default function DietScreen() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [mealInput, setMealInput] = useState('');
  const [selectedType, setSelectedType] = useState<'Breakfast' | 'Lunch' | 'Dinner' | 'Snack'>('Breakfast');
  const [isAdding, setIsAdding] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<NutritionSuggestion | null>(null);
  const [suggestions, setSuggestions] = useState<NutritionSuggestion[]>([]);
  const { user } = useAuth();
  const { mealName } = useLocalSearchParams<{ mealName?: string }>();

  const currentGoal = user?.fitnessGoal || 'General Fitness';

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const data = await ContentService.getNutritionSuggestions(user?.fitnessGoal);
        setSuggestions(data);
      } catch (err) {
        console.error('Failed to fetch suggestions');
      }
    };
    fetchSuggestions();
  }, [user?.fitnessGoal]);

  // Handle deep-linked meal selection
  useEffect(() => {
    if (mealName) {
      const fetchMeal = async () => {
        try {
          const meal = await ContentService.getMealByName(mealName);
          if (meal) setSelectedMeal(meal);
        } catch (err) {
          console.error('Failed to fetch meal');
        }
      };
      fetchMeal();
    }
  }, [mealName]);

  const fetchMeals = useCallback(async () => {
    try {
      const data = await MealService.getMeals();
      setMeals(data);
    } catch (error: any) {
      console.error('Fetch meals error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMeals();
  }, [fetchMeals]);

  const addMeal = async (name?: string, type?: any, calories?: number, protein?: number, carbs?: number, fats?: number) => {
    const finalName = name || mealInput;
    const finalType = type || selectedType;

    if (!finalName.trim()) {
      Alert.alert('Error', 'Please enter meal name');
      return;
    }

    setIsAdding(true);
    try {
      const data = await MealService.logMeal({
        userId: user?._id || user?.id,
        mealType: finalType,
        selectedMeal: finalName,
        calories: calories || 0,
        protein: protein || 0,
        carbs: carbs || 0,
        fats: fats || 0,
        selectedAt: new Date().toISOString(),
      });
      setMeals([data, ...meals]);
      setMealInput('');
      setSelectedMeal(null);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add meal');
    } finally {
      setIsAdding(false);
    }
  };

  const deleteMeal = async (id: string) => {
    try {
      await MealService.deleteMeal(id);
      setMeals(meals.filter(m => m._id !== id));
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to delete meal');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'Breakfast': return <Coffee size={18} color={Colors.primary} />;
      case 'Lunch': return <Sun size={18} color={Colors.primary} />;
      case 'Dinner': return <Moon size={18} color={Colors.primary} />;
      case 'Snack': return <Apple size={18} color={Colors.primary} />;
      default: return <Utensils size={18} color={Colors.primary} />;
    }
  };

  if (loading) {
    return (
      <View style={[SharedStyles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <Stack.Screen 
        options={{ 
          title: 'Smart Nutrition',
          headerShown: true,
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.primary,
          headerShadowVisible: false,
        }} 
      />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* ── Smart Recommendation Banner ── */}
        <View style={styles.bannerContainer}>
          <LinearGradient
            colors={[Colors.primary + '25', Colors.primary + '05']}
            style={styles.banner}
          >
            <View style={styles.bannerContent}>
              <View style={styles.bannerTextContainer}>
                <View style={styles.bannerTag}>
                  <Sparkles size={12} color={Colors.primary} fill={Colors.primary} />
                  <Text style={styles.bannerTagText}>AI SUGGESTION</Text>
                </View>
                <Text style={styles.bannerTitle}>Recommended For Your Goal</Text>
                <View style={styles.goalBadge}>
                  <Target size={14} color={Colors.primary} />
                  <Text style={styles.goalText}>{currentGoal}</Text>
                </View>
              </View>
              <View style={styles.bannerIconBox}>
                <Flame size={40} color={Colors.primary} opacity={0.6} />
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* ── Horizontal Suggestions ── */}
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
                    <SuggestionIcon size={20} color={Colors.primary} />
                  </View>
                  <Text style={styles.suggestionType}>{item.type}</Text>
                </View>
                <Text style={styles.suggestionName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.suggestionNote} numberOfLines={2}>{item.note}</Text>
                <View style={styles.quickAdd}>
                  <Plus size={14} color="#000" />
                  <Text style={styles.quickAddText}>View Details</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── Meal Detail Modal ── */}
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
                      {React.createElement(getIconComponent(selectedMeal.icon), { size: 28, color: Colors.primary })}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.modalTitle}>{selectedMeal.name}</Text>
                      <Text style={styles.modalType}>{selectedMeal.type} • AI Suggestion</Text>
                    </View>
                    <TouchableOpacity onPress={() => setSelectedMeal(null)} style={styles.closeBtn}>
                      <Plus size={24} color={Colors.textSecondary} style={{ transform: [{ rotate: '45deg' }] }} />
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

                  <View style={[styles.detailSection, { backgroundColor: Colors.primary + '10', borderColor: Colors.primary + '20' }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <Target size={16} color={Colors.primary} />
                      <Text style={[styles.detailLabel, { color: Colors.primary, marginBottom: 0 }]}>Why it matches your goal</Text>
                    </View>
                    <Text style={[styles.detailText, { color: Colors.text }]}>
                      This meal is optimized for {currentGoal} by providing {selectedMeal.calories} clean calories with a high {selectedMeal.protein}g protein ratio.
                    </Text>
                  </View>

                  <TouchableOpacity 
                    style={[styles.logBtn, isAdding && { opacity: 0.7 }]}
                    onPress={() => addMeal(
                      selectedMeal.name, 
                      selectedMeal.type, 
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

        <View style={styles.dividerSection}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR LOG MANUALLY</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* ── Manual Input ── */}
        <View style={styles.inputSection}>
          <View style={styles.mealTypeButtons}>
            {(['Breakfast', 'Lunch', 'Dinner', 'Snack'] as const).map(type => (
              <TouchableOpacity
                key={type}
                style={[styles.typeButton, selectedType === type && styles.typeButtonActive]}
                onPress={() => setSelectedType(type)}
              >
                <Text style={[styles.typeButtonText, selectedType === type && styles.typeButtonTextActive]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="What did you eat?"
              placeholderTextColor={Colors.textSecondary}
              value={mealInput}
              onChangeText={setMealInput}
            />
            <TouchableOpacity 
              style={[styles.addButton, isAdding && { opacity: 0.7 }]} 
              onPress={() => addMeal()}
              disabled={isAdding}
            >
              {isAdding ? <ActivityIndicator size="small" color="#000" /> : <Plus color="#000" size={24} />}
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Daily Log ── */}
        <View style={styles.logHeader}>
          <Utensils size={18} color={Colors.primary} />
          <Text style={styles.logTitle}>Today&apos;s Nutrition Log</Text>
        </View>

        {meals.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Utensils size={48} color={Colors.textSecondary} opacity={0.3} />
            <Text style={styles.emptyText}>No meals logged today. Choose a suggestion above to get started!</Text>
          </View>
        ) : (
          meals.map(item => (
            <View key={item._id} style={styles.mealCard}>
              <View style={styles.iconBox}>
                {getIcon(item.mealType)}
              </View>
              <View style={{ flex: 1, marginLeft: 15 }}>
                <Text style={styles.mealTypeLabel}>{item.mealType}</Text>
                <Text style={styles.mealName}>{item.selectedMeal}</Text>
                {item.calories > 0 && <Text style={styles.mealCalories}>{item.calories} kcal</Text>}
              </View>
              <TouchableOpacity onPress={() => deleteMeal(item._id)}>
                <Trash2 color={Colors.error} size={20} opacity={0.6} />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

function MacroItem({ label, value, unit }: any) {
  return (
    <View style={styles.macroItem}>
      <Text style={styles.macroValue}>{value}<Text style={styles.macroUnit}>{unit}</Text></Text>
      <Text style={styles.macroLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.md,
  },
  banner: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    borderColor: Colors.primary + '30',
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
    color: Colors.primary,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  bannerTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  goalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '15',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
  },
  goalText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '800',
  },
  bannerIconBox: {
    marginLeft: 20,
  },
  suggestionScroll: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: 20,
    gap: 16,
  },
  suggestionCard: {
    width: width * 0.65,
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  suggestionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionType: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  suggestionName: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  suggestionNote: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    marginBottom: 16,
  },
  quickAdd: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: 'flex-start',
    gap: 6,
  },
  quickAddText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '900',
  },

  /* ── Modal Styles ── */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalHandle: {
    width: 40,
    height: 5,
    backgroundColor: Colors.border,
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
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  modalTitle: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  modalType: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  macroGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    marginTop: 8,
  },
  macroItem: {
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: 12,
    borderRadius: 20,
    width: (width - 48 - 36) / 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  macroValue: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  macroUnit: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  macroLabel: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: 4,
  },
  detailSection: {
    backgroundColor: Colors.card,
    padding: 20,
    borderRadius: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  detailLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  detailText: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
  },
  logBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 20,
  },
  logBtnText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  dividerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginVertical: 10,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
    opacity: 0.5,
  },
  dividerText: {
    color: Colors.textSecondary,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  inputSection: {
    padding: SPACING.lg,
    backgroundColor: Colors.card,
    marginHorizontal: SPACING.lg,
    marginTop: 10,
    marginBottom: SPACING.xl,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  mealTypeButtons: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 8,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typeButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  typeButtonText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textSecondary,
  },
  typeButtonTextActive: {
    color: '#000',
  },
  inputRow: {
    flexDirection: 'row',
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginRight: 10,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  addButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    width: 55,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    gap: 10,
    marginBottom: 16,
  },
  logTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  mealCard: {
    backgroundColor: Colors.card,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: SPACING.lg,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(204, 255, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mealTypeLabel: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  mealCalories: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 20,
    padding: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 30,
    borderStyle: 'dashed',
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginHorizontal: SPACING.lg,
  },
  emptyText: {
    color: Colors.textSecondary,
    marginTop: 15,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  }
});

