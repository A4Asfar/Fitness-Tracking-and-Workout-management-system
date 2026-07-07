import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { ChevronDown, ChevronUp, Coffee, Sun, Moon, Apple, Plus } from 'lucide-react-native';

interface FoodItem {
  _id: string;
  mealType: string;
  selectedMeal: string;
  calories: number;
}

interface MealSectionProps {
  type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  meals: FoodItem[];
  onAddPress: () => void;
  onDeleteMeal: (id: string) => void;
}

export default function MealSection({
  type,
  meals,
  onAddPress,
  onDeleteMeal
}: MealSectionProps) {
  const [expanded, setExpanded] = useState(true);

  const getMealHeader = () => {
    switch (type) {
      case 'Breakfast': return { label: 'Breakfast', icon: Coffee, color: '#10B981', bg: '#E6F4EA' };
      case 'Lunch': return { label: 'Lunch', icon: Sun, color: '#3B82F6', bg: '#EBF5FF' };
      case 'Dinner': return { label: 'Dinner', icon: Moon, color: '#A855F7', bg: '#FAF5FF' };
      case 'Snack': return { label: 'Snacks', icon: Apple, color: '#F59E0B', bg: '#FEF3C7' };
    }
  };

  const config = getMealHeader();
  const Icon = config.icon;
  const totalCalories = meals.reduce((sum, item) => sum + (item.calories || 0), 0);

  return (
    <View style={styles.card}>
      <TouchableOpacity
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.8}
        style={styles.header}
      >
        <View style={styles.leftRow}>
          <View style={[styles.iconBox, { backgroundColor: config.bg }]}>
            <Icon size={18} color={config.color} />
          </View>
          <View>
            <Text style={styles.label}>{config.label}</Text>
            <Text style={styles.sub}>{meals.length} item{meals.length === 1 ? '' : 's'}</Text>
          </View>
        </View>

        <View style={styles.rightRow}>
          <Text style={styles.calories}>{totalCalories} kcal</Text>
          {expanded ? (
            <ChevronUp size={16} color="#94A3B8" />
          ) : (
            <ChevronDown size={16} color="#94A3B8" />
          )}
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.body}>
          {meals.length > 0 ? (
            meals.map((meal) => (
              <View key={meal._id} style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{meal.selectedMeal}</Text>
                  {meal.calories > 0 && (
                    <Text style={styles.itemCalories}>{meal.calories} kcal</Text>
                  )}
                </View>
                <TouchableOpacity
                  onPress={() => onDeleteMeal(meal._id)}
                  activeOpacity={0.7}
                  style={styles.deleteBtn}
                >
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No food logged yet.</Text>
            </View>
          )}

          <TouchableOpacity
            onPress={onAddPress}
            activeOpacity={0.8}
            style={[styles.addBtn, { borderColor: config.color + '40' }]}
          >
            <Plus size={14} color={config.color} style={{ marginRight: 6 }} />
            <Text style={[styles.addBtnText, { color: config.color }]}>Add Food</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
    marginHorizontal: 20,
    marginBottom: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '800',
  },
  sub: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  calories: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '800',
  },
  body: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  itemInfo: {
    flex: 1,
    marginRight: 10,
  },
  itemName: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
  },
  itemCalories: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  deleteBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
  },
  deleteText: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '800',
  },
  empty: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  addBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 14,
    height: 44,
    marginTop: 14,
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: '800',
  },
});
