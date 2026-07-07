import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  ScrollView, KeyboardAvoidingView, Platform, Alert, Dimensions,
  ActivityIndicator, LayoutAnimation, UIManager
} from 'react-native';
import { Colors, SharedStyles, SPACING } from '@/constants/Theme';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  Dumbbell, Clock, Flame, Save, ArrowLeft, Zap, 
  Trophy, Activity, Timer, ChevronRight, Check
} from 'lucide-react-native';
import { WorkoutService } from '@/services/workoutService';
import SuccessModal from '@/components/SuccessModal';
import { safeBack } from '@/utils/navigation';
import { useAuth } from '@/context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

const TYPES = [
  { id: 'Strength', icon: Dumbbell, color: '#CCFF00' },
  { id: 'Cardio', icon: Flame, color: '#FF4B4B' },
  { id: 'HIIT', icon: Zap, color: '#00D1FF' },
  { id: 'Yoga', icon: Trophy, color: '#BD00FF' },
];

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
      { name: 'exercise', label: 'Pose / Exercise Name', placeholder: 'e.g. Downward Dog', required: true, type: 'text' },
      { name: 'duration', label: 'Duration (min)', placeholder: '0', required: true, type: 'number', halfWidth: true },
      { name: 'difficulty', label: 'Difficulty', placeholder: 'e.g. Intermediate', required: false, type: 'text', halfWidth: true },
    ]
  }
};

export default function CreateWorkoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  
  const [type, setType] = useState((params.type as string) || 'Strength');
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
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (params.type) setType(params.type as string);
    if (params.exercise) {
      setFormValues(prev => ({ ...prev, exercise: params.exercise as string }));
    }
  }, [params.type, params.exercise]);

  const handleTypeChange = (newType: string) => {
    // Smooth layout transitions without jumps
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setType(newType);
    setErrors({});
    
    // Clear irrelevant fields, preserving shared exercise name
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

  const handleSave = async () => {
    const newErrors: any = {};
    const currentConfig = workoutTypeConfig[type];
    
    currentConfig.fields.forEach(field => {
      if (field.required) {
        const val = formValues[field.name];
        if (!val || !val.trim()) {
          newErrors[field.name] = `${field.label} is required`;
        }
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      const payload: any = {
        userId: user?._id || user?.id,
        type,
        exercise: formValues.exercise.trim(),
        date: new Date().toISOString(),
      };

      currentConfig.fields.forEach(field => {
        const val = formValues[field.name];
        if (val !== undefined && val !== null && val !== '') {
          if (field.type === 'number') {
            payload[field.name] = val.includes('.') ? parseFloat(val) : parseInt(val);
          } else {
            payload[field.name] = val;
          }
        }
      });

      await WorkoutService.logWorkout(payload);
      setShowSuccess(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to save workout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const activeColor = TYPES.find(t => t.id === type)?.color || Colors.primary;

  const renderFields = () => {
    const fields = workoutTypeConfig[type].fields;
    const rows: React.ReactNode[] = [];
    let i = 0;
    
    while (i < fields.length) {
      const field = fields[i];
      
      // Group consecutive half-width fields into rows
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
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  value={formValues[field.name]}
                  onChangeText={(val) => {
                    setFormValues((prev: Record<string, string>) => ({ ...prev, [field.name]: val }));
                    if (errors[field.name]) setErrors((prev: any) => ({ ...prev, [field.name]: null }));
                  }}
                  keyboardType={field.type === 'number' ? 'numeric' : 'default'}
                />
              </View>
              {errors[field.name] && <Text style={styles.errorText}>{errors[field.name]}</Text>}
            </View>

            <View style={styles.halfInput}>
              <Text style={styles.label}>{nextField.label}</Text>
              <View style={[styles.inputWrapper, errors[nextField.name] && styles.inputError]}>
                <TextInput
                  style={styles.input}
                  placeholder={nextField.placeholder}
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  value={formValues[nextField.name]}
                  onChangeText={(val) => {
                    setFormValues((prev: Record<string, string>) => ({ ...prev, [nextField.name]: val }));
                    if (errors[nextField.name]) setErrors((prev: any) => ({ ...prev, [nextField.name]: null }));
                  }}
                  keyboardType={nextField.type === 'number' ? 'numeric' : 'default'}
                />
              </View>
              {errors[nextField.name] && <Text style={styles.errorText}>{errors[nextField.name]}</Text>}
            </View>
          </View>
        );
        i += 2;
      } else {
        // Render single/full-width field
        rows.push(
          <View key={field.name} style={field.halfWidth ? styles.row : styles.inputGroup}>
            <View style={field.halfWidth ? styles.halfInput : { flex: 1, gap: 8 }}>
              <Text style={styles.label}>{field.label}</Text>
              <View style={[styles.inputWrapper, errors[field.name] && styles.inputError]}>
                <TextInput
                  style={styles.input}
                  placeholder={field.placeholder}
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  value={formValues[field.name]}
                  onChangeText={(val) => {
                    setFormValues((prev: Record<string, string>) => ({ ...prev, [field.name]: val }));
                    if (errors[field.name]) setErrors((prev: any) => ({ ...prev, [field.name]: null }));
                  }}
                  keyboardType={field.type === 'number' ? 'numeric' : 'default'}
                />
              </View>
              {errors[field.name] && <Text style={styles.errorText}>{errors[field.name]}</Text>}
            </View>
            {field.halfWidth && <View style={styles.halfInput} />}
          </View>
        );
        i += 1;
      }
    }

    return <View style={styles.formSection}>{rows}</View>;
  };

  return (
    <View style={[SharedStyles.container, { backgroundColor: '#000' }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* ── Immersive Header ── */}
        <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
          <LinearGradient
            colors={[activeColor + '40', 'transparent']}
            style={StyleSheet.absoluteFill}
          />
          
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => safeBack()} style={styles.backBtn}>
              <ArrowLeft size={22} color="#FFF" />
            </TouchableOpacity>
            <View style={styles.headerBadge}>
              <View style={[styles.dot, { backgroundColor: activeColor }]} />
              <Text style={styles.headerBadgeText}>ACTIVE SESSION</Text>
            </View>
            <View style={{ width: 44 }} />
          </View>

          <Text style={styles.headerTitle}>Log Workout</Text>
          <Text style={styles.headerSub}>Record your training progress</Text>
        </View>

        <View style={styles.content}>
          {/* ── Type Selection ── */}
          <Text style={styles.sectionTitle}>Workout Type</Text>
          <View style={styles.typeGrid}>
            {TYPES.map((t) => (
              <TouchableOpacity 
                key={t.id} 
                style={[
                  styles.typeCard, 
                  type === t.id && { backgroundColor: t.color + '20', borderColor: t.color }
                ]}
                onPress={() => handleTypeChange(t.id)}
              >
                <t.icon size={20} color={type === t.id ? t.color : 'rgba(255,255,255,0.4)'} />
                <Text style={[
                  styles.typeText, 
                  type === t.id && { color: t.color, fontWeight: '800' }
                ]}>{t.id}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Dynamic Config-driven Fields ── */}
          {renderFields()}
        </View>
      </ScrollView>

      {/* ── Bottom Action ── */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity 
          style={styles.saveBtn}
          onPress={handleSave}
          disabled={loading}
        >
          <LinearGradient
            colors={[activeColor, activeColor + 'CC']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.saveGrad}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <>
                <Check size={20} color="#000" strokeWidth={3} />
                <Text style={styles.saveBtnText}>Complete Session</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <SuccessModal 
        visible={showSuccess} 
        message="Your workout has been logged successfully."
        onComplete={() => {
          setShowSuccess(false);
          safeBack('/(tabs)/');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    marginBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  headerBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1,
  },
  headerSub: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 4,
  },
  content: {
    paddingHorizontal: 24,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
  },
  typeGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 32,
  },
  typeCard: {
    flex: 1,
    backgroundColor: '#111',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#222',
  },
  typeText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
  },
  formSection: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 4,
  },
  inputWrapper: {
    backgroundColor: '#111',
    borderRadius: 20,
    height: 60,
    borderWidth: 1.5,
    borderColor: '#222',
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  input: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  inputError: {
    borderColor: '#FF4B4B',
    backgroundColor: 'rgba(255, 75, 75, 0.05)',
  },
  errorText: {
    color: '#FF4B4B',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  halfInput: {
    flex: 1,
    gap: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingTop: 16,
  },
  saveBtn: {
    height: 64,
    borderRadius: 20,
    overflow: 'hidden',
  },
  saveGrad: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  saveBtnText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
});
