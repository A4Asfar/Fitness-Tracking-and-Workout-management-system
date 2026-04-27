import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ActivityIndicator, ScrollView, KeyboardAvoidingView,
  Platform, Modal, Animated, Pressable,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Colors } from '@/constants/Theme';
import api from '@/services/api';
import {
  Dumbbell, Calendar, Save, Trash2, ChevronLeft,
  Activity, Hash, Pencil, X, CheckCircle2,
  Weight as WeightIcon, RotateCcw, AlertTriangle,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

/* ─── Type badge colour map ─── */
const TYPE_COLORS: Record<string, string> = {
  Strength: Colors.primary,
  Cardio:   '#FF4B4B',
  HIIT:     '#00D1FF',
  Yoga:     '#BD00FF',
};

/* ─── Small animated field ─── */
function EditField({
  icon: Icon, label, value, onChange, keyboardType = 'numeric', suffix,
}: {
  icon: any; label: string; value: string;
  onChange: (v: string) => void; keyboardType?: any; suffix?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={ef.group}>
      <Text style={ef.label}>{label}</Text>
      <View style={[ef.wrapper, focused && ef.wrapperFocused]}>
        <View style={ef.iconBox}><Icon size={18} color={focused ? Colors.primary : Colors.textSecondary} strokeWidth={2} /></View>
        <TextInput
          style={ef.input}
          value={value}
          onChangeText={onChange}
          keyboardType={keyboardType}
          placeholderTextColor={Colors.textSecondary}
          placeholder="0"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          selectionColor={Colors.primary}
        />
        {suffix ? <Text style={ef.suffix}>{suffix}</Text> : null}
      </View>
    </View>
  );
}

const ef = StyleSheet.create({
  group: { marginBottom: 20 },
  label: {
    color: Colors.textSecondary, fontSize: 10, fontWeight: '800',
    textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10, marginLeft: 4,
  },
  wrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E1E1E',
    borderRadius: 18, paddingHorizontal: 16, borderWidth: 1.5, borderColor: '#2E2E2E',
  },
  wrapperFocused: { borderColor: Colors.primary + '90', backgroundColor: Colors.primary + '0A', shadowColor: Colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 4 },
  iconBox: { marginRight: 12 },
  input: { flex: 1, color: Colors.text, fontSize: 18, fontWeight: '700', paddingVertical: 16 },
  suffix: { color: Colors.primary, fontSize: 13, fontWeight: '800', marginLeft: 6 },
});

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

  /* editable fields */
  const [sets,   setSets]   = useState('');
  const [reps,   setReps]   = useState('');
  const [weight, setWeight] = useState('');

  /* animations */
  const editAnim    = useRef(new Animated.Value(0)).current;
  const successAnim = useRef(new Animated.Value(0)).current;
  const cardAnim    = useRef(new Animated.Value(0)).current;

  useEffect(() => { fetchWorkout(); }, [id]);

  useEffect(() => {
    Animated.spring(cardAnim, { toValue: 1, useNativeDriver: true, bounciness: 6 }).start();
  }, [loading]);

  const fetchWorkout = async () => {
    try {
      const res = await api.get(`/workouts/${id}`);
      setWorkout(res.data);
      setSets(res.data.sets?.toString() ?? '');
      setReps(res.data.reps?.toString() ?? '');
      setWeight(res.data.weight?.toString() ?? '');
    } catch {
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const toggleEdit = (on: boolean) => {
    setEditMode(on);
    Animated.spring(editAnim, { toValue: on ? 1 : 0, useNativeDriver: true, bounciness: 7 }).start();
    if (!on) {
      /* reset to saved values */
      setSets(workout.sets?.toString() ?? '');
      setReps(workout.reps?.toString() ?? '');
      setWeight(workout.weight?.toString() ?? '');
    }
  };

  const handleUpdate = async () => {
    if (!sets.trim() || !reps.trim()) {
      return;
    }
    setSaving(true);
    try {
      const updated = await api.put(`/workouts/${id}`, {
        sets: parseInt(sets),
        reps: parseInt(reps),
        weight: weight ? parseFloat(weight) : 0,
      });
      setWorkout(updated.data);
      toggleEdit(false);
      /* success flash */
      Animated.sequence([
        Animated.timing(successAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.delay(1800),
        Animated.timing(successAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    } catch (e: any) {
      /* no-op — interceptor logs it */
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/workouts/${id}`);
      setShowDelete(false);
      router.back();
    } catch {
      setDeleting(false);
      setShowDelete(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loaderText}>Loading workout…</Text>
      </View>
    );
  }

  const accentColor = TYPE_COLORS[workout?.type] ?? Colors.primary;
  const formattedDate = new Date(workout.date).toLocaleDateString(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const editTranslate = editAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: Colors.background }}
    >
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: Colors.background },
          headerShadowVisible: false,
          headerTitle: () => (
            <Text style={{ color: Colors.text, fontSize: 17, fontWeight: '800' }}>
              {editMode ? 'Edit Workout' : 'Workout Details'}
            </Text>
          ),
          headerLeft: () => (
            <TouchableOpacity onPress={() => editMode ? toggleEdit(false) : router.back()} style={{ padding: 4 }}>
              {editMode
                ? <X size={22} color={Colors.textSecondary} />
                : <ChevronLeft size={26} color={Colors.primary} />}
            </TouchableOpacity>
          ),
          headerRight: () => !editMode ? (
            <TouchableOpacity
              onPress={() => toggleEdit(true)}
              style={styles.headerEditBtn}
            >
              <Pencil size={16} color={Colors.primary} />
              <Text style={styles.headerEditText}>Edit</Text>
            </TouchableOpacity>
          ) : null,
        }}
      />

      {/* Success toast */}
      <Animated.View style={[styles.successToast, { opacity: successAnim, transform: [{ translateY: successAnim.interpolate({ inputRange: [0, 1], outputRange: [-60, 0] }) }] }]}>
        <CheckCircle2 size={18} color="#000" />
        <Text style={styles.successToastText}>Workout Updated!</Text>
      </Animated.View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero Card ── */}
        <Animated.View style={{ opacity: cardAnim, transform: [{ scale: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) }] }}>
          <View style={styles.heroCard}>
            <LinearGradient
              colors={[accentColor + '22', 'transparent']}
              style={StyleSheet.absoluteFill}
            />
            {/* Type badge */}
            <View style={[styles.typeBadge, { borderColor: accentColor + '40', backgroundColor: accentColor + '15' }]}>
              <Text style={[styles.typeText, { color: accentColor }]}>{workout.type?.toUpperCase()}</Text>
            </View>

            {/* Avatar */}
            <LinearGradient colors={[accentColor + '40', accentColor + '15']} style={styles.avatarRing}>
              <View style={[styles.avatar, { borderColor: accentColor + '30' }]}>
                <Dumbbell size={38} color={accentColor} strokeWidth={1.8} />
              </View>
            </LinearGradient>

            <Text style={styles.exerciseName}>{workout.exercise}</Text>

            <View style={styles.dateRow}>
              <Calendar size={13} color={Colors.textSecondary} />
              <Text style={styles.dateText}>{formattedDate}</Text>
            </View>

            {/* Stat pills */}
            <View style={styles.statRow}>
              {[
                { label: 'Sets',   value: workout.sets,              unit: '' },
                { label: 'Reps',   value: workout.reps,              unit: '' },
                { label: 'Weight', value: workout.weight ?? 0,        unit: 'kg' },
              ].map((s, i) => (
                <View key={i} style={styles.statPill}>
                  <Text style={[styles.statPillValue, { color: accentColor }]}>{s.value}<Text style={styles.statPillUnit}>{s.unit}</Text></Text>
                  <Text style={styles.statPillLabel}>{s.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </Animated.View>

        {/* ── Volume badge ── */}
        <View style={styles.volumeCard}>
          <Activity size={16} color={Colors.primary} />
          <Text style={styles.volumeText}>
            Total Volume:{' '}
            <Text style={{ color: Colors.primary, fontWeight: '800' }}>
              {((workout.sets ?? 0) * (workout.reps ?? 0) * (workout.weight ?? 0)).toLocaleString()} kg
            </Text>
          </Text>
        </View>

        {/* ── Edit Form ── */}
        {editMode && (
          <Animated.View style={[styles.editCard, { opacity: editAnim, transform: [{ translateY: editTranslate }] }]}>
            <View style={styles.editCardHeader}>
              <Pencil size={16} color={Colors.primary} />
              <Text style={styles.editCardTitle}>Edit Performance</Text>
            </View>

            <View style={styles.editRow}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <EditField icon={Hash}       label="Sets"       value={sets}   onChange={setSets}   />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <EditField icon={Activity}   label="Reps"       value={reps}   onChange={setReps}   />
              </View>
            </View>
            <EditField icon={WeightIcon} label="Weight" value={weight} onChange={setWeight} keyboardType="decimal-pad" suffix="kg" />

            {/* Save button */}
            <TouchableOpacity
              onPress={handleUpdate}
              disabled={saving || deleting}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[Colors.primary, '#9FE800']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={[styles.saveBtn, (saving || deleting) && { opacity: 0.6 }]}
              >
                {saving
                  ? <ActivityIndicator size="small" color="#000" />
                  : <Save size={20} color="#000" strokeWidth={2.5} />}
                <Text style={styles.saveBtnText}>{saving ? 'SAVING…' : 'SAVE CHANGES'}</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Reset */}
            <TouchableOpacity
              style={styles.resetBtn}
              onPress={() => {
                setSets(workout.sets?.toString() ?? '');
                setReps(workout.reps?.toString() ?? '');
                setWeight(workout.weight?.toString() ?? '');
              }}
            >
              <RotateCcw size={16} color={Colors.textSecondary} />
              <Text style={styles.resetBtnText}>Reset to original</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* ── Action buttons (view mode) ── */}
        {!editMode && (
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.editActionBtn} onPress={() => toggleEdit(true)}>
              <Pencil size={18} color={Colors.primary} />
              <Text style={styles.editActionText}>Edit Workout</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteActionBtn} onPress={() => setShowDelete(true)}>
              <Trash2 size={18} color={Colors.error} />
              <Text style={styles.deleteActionText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* ── Delete Confirmation Modal ── */}
      <Modal visible={showDelete} transparent animationType="fade" statusBarTranslucent>
        <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
        <Pressable style={styles.modalBackdrop} onPress={() => !deleting && setShowDelete(false)}>
          <Pressable style={styles.modalCard} onPress={e => e.stopPropagation()}>
            {/* Warning icon */}
            <View style={styles.modalIconRing}>
              <AlertTriangle size={32} color={Colors.error} strokeWidth={1.8} />
            </View>

            <Text style={styles.modalTitle}>Delete Workout?</Text>
            <Text style={styles.modalBody}>
              This will permanently remove{' '}
              <Text style={{ color: Colors.text, fontWeight: '700' }}>{workout.exercise}</Text>
              {' '}from your history. This action cannot be undone.
            </Text>

            <TouchableOpacity
              style={[styles.modalDeleteBtn, deleting && { opacity: 0.6 }]}
              onPress={handleDelete}
              disabled={deleting}
            >
              {deleting
                ? <ActivityIndicator size="small" color="#fff" />
                : <Trash2 size={18} color="#fff" />}
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
  loader: { flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center', gap: 14 },
  loaderText: { color: Colors.textSecondary, fontSize: 14, fontWeight: '600', letterSpacing: 0.3 },

  /* Success toast */
  successToast: {
    position: 'absolute', top: 12, left: 16, right: 16, zIndex: 99,
    backgroundColor: Colors.primary, borderRadius: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, paddingHorizontal: 20, gap: 10,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6, shadowRadius: 20, elevation: 16,
  },
  successToastText: { color: '#000', fontSize: 15, fontWeight: '900', letterSpacing: 0.3 },

  /* Header */
  headerEditBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.primary + '1A', paddingHorizontal: 14,
    paddingVertical: 8, borderRadius: 22, borderWidth: 1.5,
    borderColor: Colors.primary + '40',
  },
  headerEditText: { color: Colors.primary, fontSize: 13, fontWeight: '800' },

  /* Hero card */
  heroCard: {
    backgroundColor: '#161616', borderRadius: 32, padding: 28,
    alignItems: 'center', overflow: 'hidden',
    borderWidth: 1, borderColor: '#242424',
    shadowColor: '#000', shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.5, shadowRadius: 24, elevation: 16,
    marginBottom: 16,
  },
  typeBadge: {
    position: 'absolute', top: 20, right: 20,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 12, borderWidth: 1.5,
  },
  typeText: { fontSize: 9, fontWeight: '900', letterSpacing: 2 },
  avatarRing: {
    width: 110, height: 110, borderRadius: 34,
    justifyContent: 'center', alignItems: 'center', marginBottom: 20,
  },
  avatar: {
    width: 96, height: 96, borderRadius: 28,
    backgroundColor: '#1A1A1A', justifyContent: 'center',
    alignItems: 'center', borderWidth: 2,
  },
  exerciseName: {
    color: Colors.text, fontSize: 28, fontWeight: '900',
    letterSpacing: -1, textAlign: 'center', marginBottom: 10, lineHeight: 32,
  },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 28 },
  dateText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  statRow: { flexDirection: 'row', gap: 10, width: '100%' },
  statPill: {
    flex: 1, backgroundColor: '#1E1E1E', borderRadius: 22,
    paddingVertical: 16, alignItems: 'center',
    borderWidth: 1.5, borderColor: '#282828',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  statPillValue: { fontSize: 26, fontWeight: '900', letterSpacing: -0.8 },
  statPillUnit: { fontSize: 12, fontWeight: '800' },
  statPillLabel: { color: Colors.textSecondary, fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.2, marginTop: 6 },

  /* Volume card */
  volumeCard: {
    backgroundColor: Colors.primary + '0C', borderRadius: 20,
    paddingVertical: 16, paddingHorizontal: 20,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginBottom: 20, borderWidth: 1.5, borderColor: Colors.primary + '28',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 12, elevation: 3,
  },
  volumeText: { color: Colors.textSecondary, fontSize: 14, fontWeight: '700' },

  /* Edit card */
  editCard: {
    backgroundColor: '#161616', borderRadius: 32, padding: 24,
    borderWidth: 1.5, borderColor: '#242424', marginBottom: 20,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08, shadowRadius: 20, elevation: 10,
  },
  editCardHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 24,
    paddingBottom: 18, borderBottomWidth: 1, borderBottomColor: '#242424',
  },
  editCardTitle: { color: Colors.text, fontSize: 18, fontWeight: '900', letterSpacing: -0.3 },
  editRow: { flexDirection: 'row' },
  saveBtn: {
    height: 64, borderRadius: 22, flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center', gap: 12,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45, shadowRadius: 20, elevation: 12,
    marginTop: 4,
  },
  saveBtnText: { color: '#000', fontSize: 16, fontWeight: '900', letterSpacing: 1 },
  resetBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, marginTop: 16, paddingVertical: 12,
  },
  resetBtnText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },

  /* Action row (view mode) */
  actionRow: { flexDirection: 'row', gap: 14, marginTop: 8 },
  editActionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: Colors.primary + '12', borderRadius: 22, paddingVertical: 20,
    borderWidth: 1.5, borderColor: Colors.primary + '45',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12, shadowRadius: 10, elevation: 4,
  },
  editActionText: { color: Colors.primary, fontSize: 15, fontWeight: '900', letterSpacing: 0.3 },
  deleteActionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: Colors.error + '0E', borderRadius: 22, paddingVertical: 20,
    borderWidth: 1.5, borderColor: Colors.error + '38',
  },
  deleteActionText: { color: Colors.error, fontSize: 15, fontWeight: '900', letterSpacing: 0.3 },

  /* Delete modal */
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 0 },
  modalCard: {
    backgroundColor: '#191919', borderTopLeftRadius: 36, borderTopRightRadius: 36,
    borderBottomLeftRadius: 0, borderBottomRightRadius: 0,
    padding: 32, paddingBottom: 48, width: '100%', alignItems: 'center',
    borderWidth: 1, borderBottomWidth: 0, borderColor: '#2E2E2E',
    shadowColor: '#000', shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.6, shadowRadius: 32, elevation: 24,
  },
  modalIconRing: {
    width: 80, height: 80, borderRadius: 28, backgroundColor: Colors.error + '15',
    justifyContent: 'center', alignItems: 'center', marginBottom: 22,
    borderWidth: 1.5, borderColor: Colors.error + '35',
    shadowColor: Colors.error, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 12, elevation: 6,
  },
  modalTitle: { color: Colors.text, fontSize: 24, fontWeight: '900', marginBottom: 14, letterSpacing: -0.5 },
  modalBody: { color: Colors.textSecondary, fontSize: 15, textAlign: 'center', lineHeight: 24, marginBottom: 32, maxWidth: 300 },
  modalDeleteBtn: {
    backgroundColor: Colors.error, borderRadius: 22, width: '100%',
    height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, marginBottom: 14,
    shadowColor: Colors.error, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 16, elevation: 10,
  },
  modalDeleteText: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 0.3 },
  modalCancelBtn: {
    backgroundColor: '#252525', borderRadius: 22, width: '100%',
    height: 60, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: '#333',
  },
  modalCancelText: { color: Colors.text, fontSize: 16, fontWeight: '700' },
});
