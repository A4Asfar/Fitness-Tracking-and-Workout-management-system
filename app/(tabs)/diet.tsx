import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, Text, StyleSheet, ActivityIndicator, Alert, TextInput } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { Plus, Trash2 } from 'lucide-react-native';

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
  const { token } = useAuth();

  useEffect(() => {
    fetchMeals();
  }, []);

  const fetchMeals = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/meals', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setMeals(data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch meals');
    } finally {
      setLoading(false);
    }
  };

  const addMeal = async () => {
    if (!mealInput.trim()) {
      Alert.alert('Error', 'Please enter meal name');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/meals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mealType: selectedType,
          mealName: mealInput,
        }),
      });

      if (response.ok) {
        const newMeal = await response.json();
        setMeals([newMeal, ...meals]);
        setMealInput('');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add meal');
    }
  };

  const deleteMeal = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/meals/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setMeals(meals.filter(m => m._id !== id));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to delete meal');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.inputSection}>
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
            placeholder="Enter meal name"
            value={mealInput}
            onChangeText={setMealInput}
          />
          <TouchableOpacity style={styles.addButton} onPress={addMeal}>
            <Plus color="#fff" size={24} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={meals}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <View style={styles.mealCard}>
            <View>
              <Text style={styles.mealType}>{item.mealType}</Text>
              <Text style={styles.mealName}>{item.mealName}</Text>
            </View>
            <TouchableOpacity onPress={() => deleteMeal(item._id)}>
              <Trash2 color="#ff4444" size={20} />
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  inputSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  mealTypeButtons: {
    flexDirection: 'row',
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  typeButton: {
    flex: 1,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#007AFF',
  },
  typeButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  inputRow: {
    flexDirection: 'row',
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 8,
  },
  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 6,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  listContent: {
    padding: 15,
  },
  mealCard: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mealType: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
});
