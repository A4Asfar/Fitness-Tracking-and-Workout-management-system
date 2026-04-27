import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, Text, StyleSheet, ActivityIndicator, Alert, TextInput, ScrollView } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { Colors, SharedStyles } from '@/constants/Theme';
import { Plus, Trash2, Utensils, Coffee, Sun, Moon } from 'lucide-react-native';
import { Stack } from 'expo-router';

interface Meal {
  _id: string;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner';
  mealName: string;
}

export default function DietScreen() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [mealInput, setMealInput] = useState('');
  const [selectedType, setSelectedType] = useState<'Breakfast' | 'Lunch' | 'Dinner'>('Breakfast');
  const [isAdding, setIsAdding] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    fetchMeals();
  }, []);

  const fetchMeals = async () => {
    try {
      const response = await api.get('/meals');
      setMeals(response.data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to fetch meals');
    } finally {
      setLoading(false);
    }
  };

  const addMeal = async () => {
    if (!mealInput.trim()) {
      Alert.alert('Error', 'Please enter meal name');
      return;
    }

    setIsAdding(true);
    try {
      const response = await api.post('/meals', {
        mealType: selectedType,
        mealName: mealInput,
      });
      setMeals([response.data, ...meals]);
      setMealInput('');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add meal');
    } finally {
      setIsAdding(false);
    }
  };

  const deleteMeal = async (id: string) => {
    try {
      await api.delete(`/meals/${id}`);
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
          title: 'Nutrition Tracker',
          headerShown: true,
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.primary,
          headerShadowVisible: false,
        }} 
      />

      <View style={styles.inputSection}>
        <View style={styles.headerContainer}>
          <Utensils size={20} color={Colors.primary} />
          <Text style={styles.sectionLabel}>Daily Nutrition</Text>
        </View>
        
        <View style={styles.mealTypeButtons}>
          {(['Breakfast', 'Lunch', 'Dinner'] as const).map(type => (
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
            placeholder="Log your meal..."
            placeholderTextColor={Colors.textSecondary}
            value={mealInput}
            onChangeText={setMealInput}
          />
          <TouchableOpacity 
            style={[styles.addButton, isAdding && { opacity: 0.7 }]} 
            onPress={addMeal}
            disabled={isAdding}
          >
            {isAdding ? <ActivityIndicator size="small" color="#000" /> : <Plus color="#000" size={24} />}
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={meals}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <View style={styles.mealCard}>
            <View style={styles.iconBox}>
              {getIcon(item.mealType)}
            </View>
            <View style={{ flex: 1, marginLeft: 15 }}>
              <Text style={styles.mealTypeLabel}>{item.mealType}</Text>
              <Text style={styles.mealName}>{item.mealName}</Text>
            </View>
            <TouchableOpacity onPress={() => deleteMeal(item._id)}>
              <Trash2 color={Colors.error} size={20} opacity={0.6} />
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Utensils size={48} color={Colors.textSecondary} opacity={0.3} />
            <Text style={styles.emptyText}>No meals logged today</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  inputSection: {
    padding: 20,
    backgroundColor: Colors.card,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionLabel: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  mealTypeButtons: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 10,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 15,
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
    fontSize: 12,
    fontWeight: '700',
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
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginRight: 10,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  addButton: {
    backgroundColor: Colors.primary,
    borderRadius: 15,
    width: 55,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  mealCard: {
    backgroundColor: Colors.card,
    padding: 15,
    marginBottom: 12,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconBox: {
    width: 45,
    height: 45,
    borderRadius: 15,
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
  },
  mealName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
    padding: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 30,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyText: {
    color: Colors.textSecondary,
    marginTop: 15,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  }
});
