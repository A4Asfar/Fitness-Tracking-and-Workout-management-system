import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '@/context/AuthContext';

interface Workout {
  _id: string;
  name: string;
  completed: boolean;
}

export default function WorkoutsScreen() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/workouts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setWorkouts(data);
      } else {
        Alert.alert('Error', 'Failed to fetch workouts');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const toggleWorkout = async (id: string, completed: boolean) => {
    try {
      const response = await fetch(`http://localhost:5000/api/workouts/${id}/toggle`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ completed }),
      });

      if (response.ok) {
        const updatedWorkout = await response.json();
        setWorkouts(workouts.map(w => (w._id === id ? updatedWorkout : w)));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update workout');
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
      <FlatList
        data={workouts}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.workoutCard, item.completed && styles.completed]}
            onPress={() => toggleWorkout(item._id, item.completed)}
          >
            <Text style={styles.workoutName}>{item.name}</Text>
            <Text style={styles.status}>{item.completed ? '✓ Done' : 'Pending'}</Text>
          </TouchableOpacity>
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
  listContent: {
    padding: 15,
  },
  workoutCard: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  completed: {
    borderLeftColor: '#28a745',
    backgroundColor: '#f0f8f0',
  },
  workoutName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  status: {
    fontSize: 12,
    color: '#666',
  },
});
