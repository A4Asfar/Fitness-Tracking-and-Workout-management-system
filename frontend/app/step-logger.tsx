import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Alert, Animated, Dimensions
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Colors, SharedStyles, SPACING } from '@/constants/Theme';
import { 
  ArrowLeft, Target, History, Plus, 
  ChevronRight, Calendar, Info, Sparkles
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { safeBack } from '@/utils/navigation';

const { width } = Dimensions.get('window');

interface StepLog {
  _id: string;
  steps: number;
  note: string;
  date: string;
}

export default function StepLoggerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  
  const [steps, setSteps] = useState('');
  const [note, setNote] = useState('');
  const [logs, setLogs] = useState<StepLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const fetchLogs = async () => {
    setError(null);
    try {
      const res = await api.get('/steps');
      setLogs(res.data);
    } catch (err: any) {
      console.error('Fetch step logs error:', err);
      setError(err.message || 'Failed to sync step logs.');
    } finally {
      setLoading(false);
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleSave = async () => {
    if (!steps || isNaN(Number(steps)) || Number(steps) <= 0) {
      Alert.alert('Invalid Steps', 'Please enter a valid positive number of steps.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await api.post('/steps', { 
        steps: Number(steps), 
        note 
      });
      setLogs([res.data, ...logs]);
      
      setSteps('');
      setNote('');
      Alert.alert('Success', 'Steps progress logged successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save step log.');
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const todaySteps = logs
    .filter(log => new Date(log.date).toDateString() === new Date().toDateString())
    .reduce((sum, log) => sum + log.steps, 0);

  const dailyGoal = 10000;
  const progressPercent = Math.min(100, Math.round((todaySteps / dailyGoal) * 100));

  return (
    <View style={SharedStyles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity onPress={() => safeBack()} style={styles.backBtn}>
          <ArrowLeft size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Step Logger</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView 
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          
          {/* ── Status Card ── */}
          <LinearGradient
            colors={[Colors.primary + '20', Colors.primary + '05']}
            style={styles.statusCard}
          >
            <View style={styles.statusInfo}>
              <View style={styles.statusIconBox}>
                <Target size={24} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.statusLabel}>STEPS TODAY</Text>
                <Text style={styles.statusValue}>{todaySteps.toLocaleString()} <Text style={styles.unit}>/ {dailyGoal.toLocaleString()}</Text></Text>
                <Text style={styles.goalProgressText}>{progressPercent}% of daily goal completed</Text>
              </View>
            </View>
            
            <Sparkles size={100} color={Colors.primary + '10'} style={styles.bgSparkle} />
          </LinearGradient>

          {/* ── Logger Section ── */}
          <View style={styles.sectionHeader}>
            <Plus size={18} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Log New Steps</Text>
          </View>

          <View style={styles.inputCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Step Count</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 5000"
                placeholderTextColor="#666"
                keyboardType="number-pad"
                value={steps}
                onChangeText={setSteps}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Activity Note (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Morning walk, treadmill run, park stroll..."
                placeholderTextColor="#666"
                multiline
                numberOfLines={3}
                value={note}
                onChangeText={setNote}
              />
            </View>

            <TouchableOpacity 
              style={[styles.saveBtn, isSaving && { opacity: 0.7 }]}
              onPress={handleSave}
              disabled={isSaving}
            >
              <LinearGradient
                colors={[Colors.primary, '#9FE800']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveBtnGrad}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#000" />
                ) : (
                  <>
                    <Text style={styles.saveBtnText}>LOG STEPS</Text>
                    <ChevronRight size={18} color="#000" strokeWidth={2.5} />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* ── History Section ── */}
          <View style={styles.sectionHeader}>
            <History size={18} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Log History</Text>
          </View>

          {loading ? (
            <ActivityIndicator size="small" color={Colors.primary} style={{ marginTop: 20 }} />
          ) : error ? (
            <View style={{ alignItems: 'center', padding: 20 }}>
              <Text style={{ color: '#FF4B4B', fontSize: 13, fontWeight: '600', marginBottom: 12, textAlign: 'center' }}>{error}</Text>
              <TouchableOpacity onPress={() => { setLoading(true); fetchLogs(); }} style={{ backgroundColor: Colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 }}>
                <Text style={{ color: '#000', fontSize: 12, fontWeight: '800' }}>Retry Sync</Text>
              </TouchableOpacity>
            </View>
          ) : logs.length === 0 ? (
            <View style={styles.emptyHistory}>
              <Info size={32} color="#333" />
              <Text style={styles.emptyText}>No logs yet. Log your steps to see history here!</Text>
            </View>
          ) : (
            <View style={styles.historyList}>
              {logs.map((item, idx) => (
                <View key={item._id} style={styles.historyCard}>
                  <View style={styles.historyHeader}>
                    <View style={styles.dateBox}>
                      <Calendar size={12} color={Colors.textSecondary} />
                      <Text style={styles.historyDate}>{formatDate(item.date)}</Text>
                    </View>
                    <Text style={styles.historySteps}>{item.steps.toLocaleString()} steps</Text>
                  </View>
                  {item.note ? (
                    <Text style={styles.historyNote}>{item.note}</Text>
                  ) : null}
                  {idx < logs.length - 1 && <View style={styles.historyLine} />}
                </View>
              ))}
            </View>
          )}

        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  backBtn: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: Colors.card, justifyContent: 'center',
    alignItems: 'center', borderWidth: 1, borderColor: Colors.border,
  },
  headerTitle: { color: Colors.text, fontSize: 18, fontWeight: '900', letterSpacing: -0.5 },
  content: { padding: SPACING.lg },
  
  statusCard: {
    borderRadius: 28, padding: 24, marginBottom: 32,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1, borderColor: Colors.primary + '30', overflow: 'hidden',
  },
  statusInfo: { flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 },
  statusIconBox: {
    width: 50, height: 50, borderRadius: 16,
    backgroundColor: Colors.primary + '15', justifyContent: 'center', alignItems: 'center'
  },
  statusLabel: { color: Colors.textSecondary, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  statusValue: { color: Colors.text, fontSize: 28, fontWeight: '900', marginTop: 2 },
  unit: { fontSize: 16, color: Colors.textSecondary, fontWeight: '600' },
  goalProgressText: { color: Colors.primary, fontSize: 12, fontWeight: '600', marginTop: 4 },
  
  bgSparkle: { position: 'absolute', right: -20, bottom: -20 },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  sectionTitle: { color: Colors.text, fontSize: 16, fontWeight: '800', letterSpacing: -0.3 },

  inputCard: {
    backgroundColor: Colors.card, borderRadius: 28, padding: 24,
    borderWidth: 1.5, borderColor: Colors.border, marginBottom: 32,
  },
  inputGroup: { marginBottom: 20 },
  inputLabel: { color: Colors.textSecondary, fontSize: 12, fontWeight: '700', marginBottom: 8, marginLeft: 4 },
  input: {
    backgroundColor: Colors.background, borderRadius: 16, padding: 16,
    color: Colors.text, fontSize: 16, fontWeight: '600',
    borderWidth: 1, borderColor: Colors.border,
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  
  saveBtn: { borderRadius: 20, overflow: 'hidden', marginTop: 8 },
  saveBtnGrad: {
    height: 60, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 10,
  },
  saveBtnText: { color: '#000', fontSize: 15, fontWeight: '900', letterSpacing: 1 },

  historyList: { backgroundColor: Colors.card, borderRadius: 28, padding: 20, borderWidth: 1.5, borderColor: Colors.border },
  historyCard: { paddingVertical: 16 },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  dateBox: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  historyDate: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  historySteps: { color: Colors.primary, fontSize: 18, fontWeight: '900' },
  historyNote: { color: Colors.textSecondary, fontSize: 14, lineHeight: 20, fontWeight: '500' },
  historyLine: { height: 1, backgroundColor: Colors.border, marginTop: 16, opacity: 0.5 },
  
  emptyHistory: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  emptyText: { color: Colors.textSecondary, fontSize: 14, fontWeight: '500', textAlign: 'center' },
});
