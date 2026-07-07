import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { X, Flame, ShieldAlert, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface AddMealModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (name: string, type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack', calories: number, protein: number, carbs: number, fat: number) => void;
  defaultType?: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
}

export default function AddMealModal({
  visible,
  onClose,
  onAdd,
  defaultType = 'Breakfast'
}: AddMealModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'Breakfast' | 'Lunch' | 'Dinner' | 'Snack'>(defaultType);
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  // Sync default type when modal opens
  React.useEffect(() => {
    setType(defaultType);
  }, [defaultType, visible]);

  const handleSubmit = () => {
    if (!name.trim()) {
      alert('Please enter a food name.');
      return;
    }
    onAdd(
      name.trim(),
      type,
      parseFloat(calories) || 0,
      parseFloat(protein) || 0,
      parseFloat(carbs) || 0,
      parseFloat(fat) || 0
    );
    // Reset state
    setName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Log Food Item</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <X size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
            {/* Meal Type Toggles */}
            <Text style={styles.sectionLabel}>Meal Category</Text>
            <View style={styles.chipsRow}>
              {(['Breakfast', 'Lunch', 'Dinner', 'Snack'] as const).map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setType(t)}
                  activeOpacity={0.8}
                  style={[styles.chip, type === t && styles.chipActive]}
                >
                  <Text style={[styles.chipText, type === t && styles.chipTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Food Name */}
            <Text style={styles.sectionLabel}>Food Detail</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="e.g. Scrambled Eggs with Avocado"
                placeholderTextColor="#94A3B8"
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Macros Group */}
            <Text style={styles.sectionLabel}>Nutritional Metrics (Optional)</Text>
            <View style={styles.grid}>
              <View style={styles.gridCol}>
                <Text style={styles.macroLabel}>Calories</Text>
                <TextInput
                  style={styles.macroInput}
                  placeholder="kcal"
                  placeholderTextColor="#94A3B8"
                  value={calories}
                  onChangeText={setCalories}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.gridCol}>
                <Text style={styles.macroLabel}>Protein</Text>
                <TextInput
                  style={styles.macroInput}
                  placeholder="g"
                  placeholderTextColor="#94A3B8"
                  value={protein}
                  onChangeText={setProtein}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={[styles.grid, { marginTop: 12 }]}>
              <View style={styles.gridCol}>
                <Text style={styles.macroLabel}>Carbohydrates</Text>
                <TextInput
                  style={styles.macroInput}
                  placeholder="g"
                  placeholderTextColor="#94A3B8"
                  value={carbs}
                  onChangeText={setCarbs}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.gridCol}>
                <Text style={styles.macroLabel}>Fat</Text>
                <TextInput
                  style={styles.macroInput}
                  placeholder="g"
                  placeholderTextColor="#94A3B8"
                  value={fat}
                  onChangeText={setFat}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity onPress={handleSubmit} activeOpacity={0.85} style={styles.btnWrapper}>
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.btn}
              >
                <Text style={styles.btnText}>Log Item</Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 20,
    maxHeight: '85%',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: 1.5,
    borderBottomColor: '#F1F5F9',
    marginBottom: 20,
  },
  title: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '800',
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
  sectionLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 6,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  chip: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
  },
  chipActive: {
    backgroundColor: '#E6F4EA',
    borderColor: '#10B981',
  },
  chipText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '700',
  },
  chipTextActive: {
    color: '#10B981',
  },
  inputContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    height: 48,
    justifyContent: 'center',
    marginBottom: 20,
  },
  input: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    gap: 12,
  },
  gridCol: {
    flex: 1,
  },
  macroLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  macroInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    height: 48,
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '600',
  },
  btnWrapper: {
    marginTop: 28,
  },
  btn: {
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
