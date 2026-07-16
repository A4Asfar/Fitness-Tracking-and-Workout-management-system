import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ActivityIndicator, ScrollView, KeyboardAvoidingView,
  Platform, Modal, Animated, Pressable, UIManager, LayoutAnimation,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import api from '@/services/api';
import {
  Dumbbell, Calendar, Save, Trash2, ChevronLeft,
  Activity, Pencil, X, CheckCircle2,
  AlertTriangle, Flame, Zap, Heart, RotateCcw
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { safeBack } from '@/utils/navigation';

const TYPE_COLORS: Record<string, string> = {
  Strength: '#10B981',
  Cardio:   '#FF4B4B',
  HIIT:     '#00B0FF',
  Yoga:     '#BD00FF',
};

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface FormFieldConfig {
  name: string;
  label: string;
  placeholder: string;
  required: boolean;
  type: 'text' | 'number';
  halfWidth?: boolean;
}

const workoutTypeConfig: Record<string, { fields: FormFieldConfig[] }> = {
  Strength: {
    fields: [
      { name: 'exercise', label: 'Exercise Name', placeholder: 'e.g. Bench Press', required: true, type: 'text' },
      { name: 'sets', label: 'Sets', placeholder: '0', required: true, type: 'number', halfWidth: true },
      { name: 'reps', label: 'Reps', placeholder: '0', required: true, type: 'number', halfWidth: true },
      { name: 'weight', label: 'Weight (kg)', placeholder: '0', required: true, type: 'number', halfWidth: true },
      { name: 'duration', label: 'Duration (min)', placeholder: '0', required: false, type: 'number', halfWidth: true },
    ]
  },
  Cardio: {
    fields: [
      { name: 'exercise', label: 'Exercise Name', placeholder: 'e.g. Running', required: true, type: 'text' },
      { name: 'duration', label: 'Duration (min)', placeholder: '0', required: true, type: 'number', halfWidth: true },
      { name: 'distance', label: 'Distance (km)', placeholder: '0.0', required: false, type: 'number', halfWidth: true },
      { name: 'calories', label: 'Calories Burned', placeholder: '0', required: false, type: 'number', halfWidth: true },
      { name: 'speed', label: 'Average Speed (km/h)', placeholder: '0.0', required: false, type: 'number', halfWidth: true },
    ]
  },
  HIIT: {
    fields: [
      { name: 'exercise', label: 'Exercise Name', placeholder: 'e.g. Tabata Circuit', required: true, type: 'text' },
      { name: 'rounds', label: 'Rounds', placeholder: '0', required: true, type: 'number', halfWidth: true },
      { name: 'workTime', label: 'Work Time (sec)', placeholder: '0', required: true, type: 'number', halfWidth: true },
      { name: 'restTime', label: 'Rest Time (sec)', placeholder: '0', required: true, type: 'number', halfWidth: true },
      { name: 'duration', label: 'Total Duration (min)', placeholder: '0', required: false, type: 'number', halfWidth: true },
    ]
  },
  Yoga: {
    fields: [
      { name: 'exercise', label: 'Pose Name', placeholder: 'e.g. Downward Dog', required: true, type: 'text' },
      { name: 'duration', label: 'Duration (min)', placeholder: '0', required: true, type: 'number', halfWidth: true },
      { name: 'difficulty', label: 'Difficulty', placeholder: 'e.g. Intermediate', required: false, type: 'text', halfWidth: true },
    ]
  }
};

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [workout,  setWorkout]  = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editType, setEditType] = useState('Strength');
  const [formValues, setFormValues] = useState<Record<string, string>>({
    exercise: '',
    sets: '',
    reps: '',
    weight: '',
    duration: '',
    distance: '',
    calories: '',
    speed: '',
    rounds: '',
    workTime: '',
    restTime: '',
    difficulty: '',
  });
  const [errors, setErrors] = useState<any>({});

  const editAnim    = useRef(new Animated.Value(0)).current;
  const successAnim = useRef(new Animated.Value(0)).current;
  const cardAnim    = useRef(new Animated.Value(0)).current;

  useEffect(() => { fetchWorkout(); }, [id]);

  useEffect(() => {
    Animated.spring(cardAnim, { toValue: 1, useNativeDriver: true, bounciness: 6 }).start();
  }, [loading]);

  const fetchWorkout = async () => {
    setError(null);
    try {
      const res = await api.get(`/workouts/${id}`);
      setWorkout(res.data);
      setEditType(res.data.type || 'Strength');
      setFormValues({
        exercise: res.data.exercise || '',
        sets: res.data.sets?.toString() ?? '',
        reps: res.data.reps?.toString() ?? '',
        weight: res.data.weight?.toString() ?? '',
        duration: res.data.duration?.toString() ?? '',
        distance: res.data.distance?.toString() ?? '',
        calories: res.data.calories?.toString() ?? '',
        speed: res.data.speed?.toString() ?? '',
        rounds: res.data.rounds?.toString() ?? '',
        workTime: res.data.workTime?.toString() ?? '',
        restTime: res.data.restTime?.toString() ?? '',
        difficulty: res.data.difficulty || '',
      });
    } catch (err: any) {
      console.error('Fetch workout failed:', err);
      setError(err.message || 'Failed to sync workout details.');
    } finally {
      setLoading(false);
    }
  };

  const toggleEdit = (on: boolean) => {
    setEditMode(on);
    Animated.spring(editAnim, { toValue: on ? 1 : 0, useNativeDriver: true, bounciness: 7 }).start();
    if (!on && workout) {
      setEditType(workout.type || 'Strength');
      setFormValues({
        exercise: workout.exercise || '',
        sets: workout.sets?.toString() ?? '',
        reps: workout.reps?.toString() ?? '',
        weight: workout.weight?.toString() ?? '',
        duration: workout.duration?.toString() ?? '',
        distance: workout.distance?.toString() ?? '',
        calories: workout.calories?.toString() ?? '',
        speed: workout.speed?.toString() ?? '',
        rounds: workout.rounds?.toString() ?? '',
        workTime: workout.workTime?.toString() ?? '',
        restTime: workout.restTime?.toString() ?? '',
        difficulty: workout.difficulty || '',
      });
      setErrors({});
    }
  };

  const handleTypeChange = (newType: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setEditType(newType);
    setErrors({});
    
    setFormValues(prev => ({
      exercise: prev.exercise,
      sets: '',
      reps: '',
      weight: '',
      duration: '',
      distance: '',
      calories: '',
      speed: '',
      rounds: '',
      workTime: '',
      restTime: '',
      difficulty: '',
    }));
  };

  const getWorkoutIcon = (typeStr: string) => {
    switch (typeStr) {
      case 'Strength': return Dumbbell;
      case 'Cardio': return Flame;
      case 'HIIT': return Zap;
      case 'Yoga': return Heart;
      default: return Dumbbell;
    }
  };

  const renderDetailPills = () => {
    if (!workout) return null;
    const activeType = workout.type || 'Strength';
    const pills = [];

    if (activeType === 'Strength') {
      pills.push({ label: 'Sets', value: workout.sets ?? 0, unit: '' });
      pills.push({ label: 'Reps', value: workout.reps ?? 0, unit: '' });
      pills.push({ label: 'Weight', value: workout.weight ?? 0, unit: ' kg' });
      if (workout.duration) {
        pills.push({ label: 'Duration', value: workout.duration, unit: ' min' });
      }
    } else if (activeType === 'Cardio') {
      pills.push({ label: 'Duration', value: workout.duration ?? 0, unit: ' min' });
      if (workout.distance) pills.push({ label: 'Distance', value: workout.distance, unit: ' km' });
      if (workout.calories) pills.push({ label: 'Calories', value: workout.calories, unit: ' kcal' });
      if (workout.speed) pills.push({ label: 'Speed', value: workout.speed, unit: ' km/h' });
    } else if (activeType === 'HIIT') {
      pills.push({ label: 'Rounds', value: workout.rounds ?? 0, unit: '' });
      pills.push({ label: 'Work Time', value: workout.workTime ?? 0, unit: 's' });
      pills.push({ label: 'Rest Time', value: workout.restTime ?? 0, unit: 's' });
      if (workout.duration) pills.push({ label: 'Duration', value: workout.duration, unit: ' min' });
    } else if (activeType === 'Yoga') {
      pills.push({ label: 'Duration', value: workout.duration ?? 0, unit: ' min' });
      if (workout.difficulty) pills.push({ label: 'Difficulty', value: workout.difficulty, unit: '' });
    }

    return (
      <View style={styles.statRow}>
        {pills.map((s, i) => (
          <View key={i} style={styles.statPill}>
            <Text style={[styles.statPillValue, { color: accentColor }]}>
              {s.value}
              <Text style={styles.statPillUnit}>{s.unit}</Text>
            </Text>
            <Text style={styles.statPillLabel}>{s.label}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderEditFields = () => {
    const fields = workoutTypeConfig[editType].fields;
    const rows: React.ReactNode[] = [];
    let i = 0;
    
    while (i < fields.length) {
      const field = fields[i];
      
      if (field.halfWidth && i + 1 < fields.length && fields[i + 1].halfWidth) {
        const nextField = fields[i + 1];
        rows.push(
          <View key={`row-${field.name}-${nextField.name}`} style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>{field.label}</Text>
              <View style={[styles.inputWrapper, errors[field.name] && styles.inputError]}>
                <TextInput
                  style={styles.input}
                  placeholder={field.placeholder}
                  placeholderTextColor="#94A3B8"
                  value={formValues[field.name]}
                  onChangeText={(val) => {
                    setFormValues((prev: Record<string, string>) => ({ ...prev, [field.name]: val }));
                    if (errors[field.name]) setErrors((prev: any) => ({ ...prev, [field.name]: null }));
                  }}
                  keyboardType={field.type === 'number' ? 'numeric' : 'default'}
                />
              </View>
              {errors[field.name] && <Text style={styles.formErrorText}>{errors[field.name]}</Text>}
            </View>

            <View style={styles.halfInput}>
              <Text style={styles.label}>{nextField.label}</Text>
              <View style={[styles.inputWrapper, errors[nextField.name] && styles.inputError]}>
                <TextInput
                  style={styles.input}
                  placeholder={nextField.placeholder}
                  placeholderTextColor="#94A3B8"
                  value={formValues[nextField.name]}
                  onChangeText={(val) => {
                    setFormValues((prev: Record<string, string>) => ({ ...prev, [nextField.name]: val }));
                    if (errors[nextField.name]) setErrors((prev: any) => ({ ...prev, [nextField.name]: null }));
                  }}
                  keyboardType={nextField.type === 'number' ? 'numeric' : 'default'}
                />
              </View>
              {errors[nextField.name] && <Text style={styles.formErrorText}>{errors[nextField.name]}</Text>}
            </View>
          </View>
        );
        i += 2;
      } else {
        rows.push(
          <View key={field.name} style={field.halfWidth ? styles.row : styles.inputGroup}>
            <View style={field.halfWidth ? styles.halfInput : { flex: 1, gap: 8 }}>
              <Text style={styles.label}>{field.label}</Text>
              <View style={[styles.inputWrapper, errors[field.name] && styles.inputError]}>
                <TextInput
                  style={styles.input}
                  placeholder={field.placeholder}
                  placeholderTextColor="#94A3B8"
                  value={formValues[field.name]}
                  onChangeText={(val) => {
                    setFormValues((prev: Record<string, string>) => ({ ...prev, [field.name]: val }));
                    if (errors[field.name]) setErrors((prev: any) => ({ ...prev, [field.name]: null }));
                  }}
                  keyboardType={field.type === 'number' ? 'numeric' : 'default'}
                />
              </View>
              {errors[field.name] && <Text style={styles.formErrorText}>{errors[field.name]}</Text>}
            </View>
            {field.halfWidth && <View style={styles.halfInput} />}
          </View>
        );
        i += 1;
      }
    }

    return <View style={styles.formSection}>{rows}</View>;
  };

  const handleUpdate = async () => {
    const newErrors: any = {};
    const currentConfig = workoutTypeConfig[editType];
    
    currentConfig.fields.forEach(field => {
      if (field.required) {
        const val = formValues[field.name];
        if (!val || !val.trim()) {
          newErrors[field.name] = `${field.label} is required.`;
        }
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setSaving(true);
    try {
      const payload: any = {
        type: editType,
        exercise: formValues.exercise.trim(),
      };

      currentConfig.fields.forEach(field => {
        const val = formValues[field.name];
        if (val !== undefined && val !== null && val !== '') {
          if (field.type === 'number') {
            payload[field.name] = val.toString().includes('.') ? parseFloat(val) : parseInt(val);
          } else {
            payload[field.name] = val;
          }
        }
      });

      const updated = await api.put(`/workouts/${id}`, payload);
      setWorkout(updated.data);
      toggleEdit(false);
      
      Animated.sequence([
        Animated.timing(successAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.delay(1800),
        Animated.timing(successAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    } catch (e: any) {
      const message = e.response?.data?.message || 'Failed to save changes.';
      Alert.alert('Validation Error', message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/workouts/${id}`);
      setShowDelete(false);
      safeBack();
    } catch {
      setDeleting(false);
      setShowDelete(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loaderText}>Loading workout…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>SYNC ERROR</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          onPress={() => { setLoading(true); fetchWorkout(); }} 
          style={styles.retryBtn}
          activeOpacity={0.8}
        >
          <Text style={styles.retryText}>RETRY SYNC</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!workout) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Workout Not Found</Text>
        <Text style={styles.errorText}>This session may have been deleted.</Text>
        <TouchableOpacity 
          onPress={() => safeBack()} 
          style={styles.retryBtn}
          activeOpacity={0.8}
        >
          <Text style={styles.retryText}>GO BACK</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const accentColor = TYPE_COLORS[workout?.type] ?? '#10B981';
  const formattedDate = new Date(workout.date).toLocaleDateString(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const editTranslate = editAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: '#F8FAFC' },
          headerShadowVisible: false,
          headerTitle: () => (
            <Text style={{ color: '#0F172A', fontSize: 17, fontWeight: '800' }}>
              {editMode ? 'Edit Workout' : 'Workout Details'}
            </Text>
          ),
          headerLeft: () => (
            <TouchableOpacity onPress={() => editMode ? toggleEdit(false) : safeBack()} style={{ padding: 4 }}>
              {editMode
                ? <X size={22} color="#64748B" />
                : <ChevronLeft size={26} color="#10B981" />}
            </TouchableOpacity>
          ),
          headerRight: () => !editMode ? (
            <TouchableOpacity
              onPress={() => toggleEdit(true)}
              style={[styles.headerEditBtn, { borderColor: accentColor + '40', backgroundColor: accentColor + '10' }]}
            >
              <Pencil size={16} color={accentColor} />
              <Text style={[styles.headerEditText, { color: accentColor }]}>Edit</Text>
            </TouchableOpacity>
          ) : null,
        }}
      />

      <Animated.View style={[styles.successToast, { opacity: successAnim, transform: [{ translateY: successAnim.interpolate({ inputRange: [0, 1], outputRange: [-60, 0] }) }] }]}>
        <CheckCircle2 size={18} color="#FFFFFF" />
        <Text style={styles.successToastText}>Workout Updated!</Text>
      </Animated.View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: cardAnim, transform: [{ scale: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) }] }}>
          <View style={styles.heroCard}>
            <LinearGradient
              colors={[accentColor + '08', 'transparent']}
              style={StyleSheet.absoluteFill}
            />
            <View style={[styles.typeBadge, { borderColor: accentColor + '40', backgroundColor: accentColor + '10' }]}>
              <Text style={[styles.typeText, { color: accentColor }]}>{workout.type?.toUpperCase()}</Text>
            </View>

            <LinearGradient colors={[accentColor + '15', accentColor + '05']} style={styles.avatarRing}>
              <View style={[styles.avatar, { borderColor: accentColor + '20' }]}>
                {React.createElement(getWorkoutIcon(workout.type), {
                  size: 38,
                  color: accentColor,
                  strokeWidth: 1.8
                })}
              </View>
            </LinearGradient>

            <Text style={styles.exerciseName}>{workout.exercise}</Text>

            <View style={styles.dateRow}>
              <Calendar size={14} color="#64748B" />
              <Text style={styles.dateText}>{formattedDate}</Text>
            </View>

            {renderDetailPills()}
          </View>
        </Animated.View>

        {workout.type === 'Strength' && (
          <View style={[styles.volumeCard, { backgroundColor: '#F5F3FF', borderColor: '#DDD6FE' }]}>
            <Activity size={16} color="#10B981" />
            <Text style={styles.volumeText}>
              Total Volume:{' '}
              <Text style={{ color: '#10B981', fontWeight: '800' }}>
                {((workout.sets ?? 0) * (workout.reps ?? 0) * (workout.weight ?? 0)).toLocaleString()} kg
              </Text>
            </Text>
          </View>
        )}

        {editMode && (
          <Animated.View style={[styles.editCard, { opacity: editAnim, transform: [{ translateY: editTranslate }] }]}>
            <View style={styles.editCardHeader}>
              <Pencil size={16} color="#10B981" />
              <Text style={styles.editCardTitle}>Edit Performance</Text>
            </View>

            <Text style={[styles.label, { marginBottom: 12, marginLeft: 4 }]}>Workout Type</Text>
            <View style={styles.typeGrid}>
              {[
                { id: 'Strength', icon: Dumbbell, color: '#10B981' },
                { id: 'Cardio', icon: Flame, color: '#FF4B4B' },
                { id: 'HIIT', icon: Zap, color: '#00B0FF' },
                { id: 'Yoga', icon: Heart, color: '#BD00FF' },
              ].map((t) => (
                <TouchableOpacity 
                  key={t.id} 
                  style={[
                    styles.typeCard, 
                    editType === t.id && { backgroundColor: t.color + '15', borderColor: t.color }
                  ]}
                  onPress={() => handleTypeChange(t.id)}
                  activeOpacity={0.8}
                >
                  {React.createElement(t.icon, {
                    size: 16,
                    color: editType === t.id ? t.color : '#94A3B8'
                  })}
                  <Text style={[
                    styles.typeTextBtn, 
                    editType === t.id && { color: t.color, fontWeight: '800' }
                  ]}>{t.id}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {renderEditFields()}

            <TouchableOpacity
              onPress={handleUpdate}
              disabled={saving || deleting}
              activeOpacity={0.85}
              style={{ marginTop: 24 }}
            >
              <LinearGradient
                colors={['#10B981', '#BD00FF']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={[styles.saveBtn, (saving || deleting) && { opacity: 0.6 }]}
              >
                {saving
                  ? <ActivityIndicator size="small" color="#FFFFFF" />
                  : <Save size={20} color="#FFFFFF" strokeWidth={2.5} />}
                <Text style={styles.saveBtnText}>{saving ? 'SAVING…' : 'SAVE CHANGES'}</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resetBtn}
              onPress={() => {
                if (workout) {
                  setEditType(workout.type || 'Strength');
                  setFormValues({
                    exercise: workout.exercise || '',
                    sets: workout.sets?.toString() ?? '',
                    reps: workout.reps?.toString() ?? '',
                    weight: workout.weight?.toString() ?? '',
                    duration: workout.duration?.toString() ?? '',
                    distance: workout.distance?.toString() ?? '',
                    calories: workout.calories?.toString() ?? '',
                    speed: workout.speed?.toString() ?? '',
                    rounds: workout.rounds?.toString() ?? '',
                    workTime: workout.workTime?.toString() ?? '',
                    restTime: workout.restTime?.toString() ?? '',
                    difficulty: workout.difficulty || '',
                  });
                  setErrors({});
                }
              }}
            >
              <RotateCcw size={16} color="#64748B" />
              <Text style={styles.resetBtnText}>Reset to original</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {!editMode && (
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.editActionBtn} onPress={() => toggleEdit(true)}>
              <Pencil size={18} color="#10B981" />
              <Text style={styles.editActionText}>Edit Workout</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteActionBtn} onPress={() => setShowDelete(true)}>
              <Trash2 size={18} color="#EF4444" />
              <Text style={styles.deleteActionText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <Modal visible={showDelete} transparent animationType="fade" statusBarTranslucent>
        {Platform.OS !== 'web' ? (
          <BlurView intensity={10} tint="dark" style={StyleSheet.absoluteFill} />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(15,23,42,0.85)' }]} />
        )}
        <Pressable style={styles.modalBackdrop} onPress={() => !deleting && setShowDelete(false)}>
          <Pressable style={styles.modalCard} onPress={e => e.stopPropagation()}>
            <View style={styles.modalIconRing}>
              <AlertTriangle size={32} color="#EF4444" strokeWidth={1.8} />
            </View>

            <Text style={styles.modalTitle}>Delete Workout?</Text>
            <Text style={styles.modalBody}>
              This will permanently remove{' '}
              <Text style={{ color: '#0F172A', fontWeight: '700' }}>{workout.exercise}</Text>
              {' '}from your history. This action cannot be undone.
            </Text>

            <TouchableOpacity
              style={[styles.modalDeleteBtn, deleting && { opacity: 0.6 }]}
              onPress={handleDelete}
              disabled={deleting}
            >
              {deleting
                ? <ActivityIndicator size="small" color="#FFFFFF" />
                : <Trash2 size={18} color="#FFFFFF" />}
              <Text style={styles.modalDeleteText}>{deleting ? 'Deleting…' : 'Yes, Delete'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancelBtn}
              onPress={() => setShowDelete(false)}
              disabled={deleting}
            >
              <Text style={styles.modalCancelText}>Keep Workout</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loader: {
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
  successToast: {
    position: 'absolute',
    top: 12,
    left: 16,
    right: 16,
    zIndex: 99,
    backgroundColor: '#10B981',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 10,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  successToastText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  headerEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 22,
    borderWidth: 1.5,
  },
  headerEditText: {
    fontSize: 13,
    fontWeight: '800',
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
    marginBottom: 16,
  },
  typeBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  typeText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
  },
  avatarRing: {
    width: 100,
    height: 100,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  exerciseName: {
    color: '#0F172A',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 28,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  dateText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },
  statRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  statPill: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  statPillValue: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  statPillUnit: {
    fontSize: 12,
    fontWeight: '800',
  },
  statPillLabel: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 4,
  },
  volumeCard: {
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    borderWidth: 1.5,
  },
  volumeText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '700',
  },
  editCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
  },
  editCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 24,
    paddingBottom: 18,
    borderBottomWidth: 1.5,
    borderBottomColor: '#F1F5F9',
  },
  editCardTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '900',
  },
  saveBtn: {
    height: 52,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
    paddingVertical: 10,
  },
  resetBtnText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  editActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F5F3FF',
    borderRadius: 16,
    paddingVertical: 16,
    borderWidth: 1.5,
    borderColor: '#DDD6FE',
  },
  editActionText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '800',
  },
  deleteActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
    borderRadius: 16,
    paddingVertical: 16,
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
  },
  deleteActionText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '800',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 40,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  modalIconRing: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
  },
  modalTitle: {
    color: '#0F172A',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  modalBody: {
    color: '#64748B',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
    maxWidth: 280,
  },
  modalDeleteBtn: {
    backgroundColor: '#EF4444',
    borderRadius: 16,
    width: '100%',
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  modalDeleteText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  modalCancelBtn: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    width: '100%',
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  modalCancelText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
  },
  typeGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  typeCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  typeTextBtn: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  halfInput: {
    flex: 1,
    gap: 6,
  },
  inputGroup: {
    gap: 6,
    marginBottom: 12,
  },
  inputWrapper: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    height: 50,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  input: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '600',
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  formErrorText: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
  formSection: {
    gap: 12,
  },
  label: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
