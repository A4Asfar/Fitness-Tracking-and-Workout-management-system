import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { Colors, SharedStyles, SPACING } from '@/constants/Theme';
import { getIconComponent } from '@/services/recommendations';
import { ContentService } from '@/services/contentService';
import { useToast } from '@/components/Toast';
import { 
  ArrowLeft, Flame, Zap, Droplets, Utensils, HeartPulse, 
  Dumbbell, Moon, Sunrise, Coffee, ChevronRight, RefreshCcw
} from 'lucide-react-native';
import { useRouter, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { safeBack } from '@/utils/navigation';

export default function DailyPlanScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();

  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPlan = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await ContentService.getDailyPlan({
        goal: user?.fitnessGoal,
        level: user?.trainingLevel,
        focus: user?.preferredWorkoutFocus
      });
      setPlan(data);
    } catch (err) {
      showToast('Failed to load daily plan', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadPlan();
  }, [loadPlan]);

  if (loading || !plan) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const dateStr = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <View style={SharedStyles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity onPress={() => safeBack()} style={styles.backButton}>
          <ArrowLeft size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Coaching</Text>
        <TouchableOpacity onPress={loadPlan} disabled={refreshing} style={styles.refreshIconBtn}>
          <RefreshCcw size={20} color={refreshing ? Colors.textSecondary : Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
      >
        {/* ── Hero ── */}
        <View style={styles.hero}>
          <Text style={styles.dateText}>{dateStr.toUpperCase()}</Text>
          <Text style={styles.greeting}>Today&apos;s Routine</Text>
          <Text style={styles.subGreeting}>Optimized for {user?.fitnessGoal?.replace('_', ' ') || 'General Fitness'}</Text>
        </View>

        {/* ── Top Summary Cards ── */}
        <View style={styles.summaryRow}>
          <LinearGradient colors={['#FF6B3B20', '#FF6B3B05']} style={styles.summaryCard}>
            <Flame size={24} color="#FF6B3B" style={{ marginBottom: 8 }} />
            <Text style={styles.summaryValue}>{plan.estimatedCalories}</Text>
            <Text style={styles.summaryLabel}>EST. CALORIES</Text>
          </LinearGradient>
          
          <LinearGradient colors={['#00D1FF20', '#00D1FF05']} style={styles.summaryCard}>
            <Droplets size={24} color="#00D1FF" style={{ marginBottom: 8 }} />
            <Text style={styles.summaryValue}>{plan.nutrition?.hydration}</Text>
            <Text style={styles.summaryLabel}>HYDRATION</Text>
          </LinearGradient>
        </View>

        {/* ── Motivation Quote ── */}
        <View style={styles.quoteBox}>
          <Text style={styles.quoteText}>&quot;{plan.motivation}&quot;</Text>
        </View>

        {/* ── Warmup Section ── */}
        <SectionHeader title="WARMUP PROTOCOL" icon={Sunrise} color="#FFD700" />
        <View style={styles.cardBlock}>
          {plan.warmup?.map((w: any, idx: number) => (
            <View key={idx} style={styles.warmupRow}>
              <View style={styles.dot} />
              <Text style={styles.warmupName}>{w.exercise}</Text>
              <Text style={styles.warmupTime}>{w.duration}</Text>
            </View>
          ))}
        </View>

        {/* ── Main Workout Section ── */}
        <SectionHeader title="MAIN EXERCISES" icon={Dumbbell} color={Colors.primary} />
        <View style={styles.workoutList}>
          {plan.exercises?.map((ex: any, idx: number) => {
            const IconComp = getIconComponent(ex.icon || 'Dumbbell');
            return (
              <View key={idx} style={styles.exerciseCard}>
                <View style={styles.exerciseHeader}>
                  <View style={styles.exIconBox}>
                    <IconComp size={20} color={Colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.exName}>{ex.name}</Text>
                    <Text style={styles.exNotes}>{ex.notes}</Text>
                  </View>
                </View>
                <View style={styles.exStatsRow}>
                  <View style={styles.exStat}>
                    <Text style={styles.exStatLabel}>SETS</Text>
                    <Text style={styles.exStatValue}>{ex.sets}</Text>
                  </View>
                  <View style={styles.exStat}>
                    <Text style={styles.exStatLabel}>REPS</Text>
                    <Text style={styles.exStatValue}>{ex.reps}</Text>
                  </View>
                  <View style={styles.exStat}>
                    <Text style={styles.exStatLabel}>REST</Text>
                    <Text style={styles.exStatValue}>{ex.rest}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* ── Nutrition Strategy ── */}
        <SectionHeader title="NUTRITION STRATEGY" icon={Utensils} color="#39FF14" />
        <View style={styles.cardBlock}>
          <View style={styles.nutritionTarget}>
            <Text style={styles.targetLabel}>Protein Target:</Text>
            <Text style={styles.targetValue}>{plan.nutrition?.proteinTarget}</Text>
          </View>
          <View style={styles.mealRow}>
            <Coffee size={16} color={Colors.textSecondary} />
            <Text style={styles.mealLabel}>Breakfast</Text>
            <Text style={styles.mealValue}>{plan.nutrition?.breakfast}</Text>
          </View>
          <View style={styles.mealRow}>
            <Utensils size={16} color={Colors.textSecondary} />
            <Text style={styles.mealLabel}>Lunch</Text>
            <Text style={styles.mealValue}>{plan.nutrition?.lunch}</Text>
          </View>
          <View style={styles.mealRow}>
            <Moon size={16} color={Colors.textSecondary} />
            <Text style={styles.mealLabel}>Dinner</Text>
            <Text style={styles.mealValue}>{plan.nutrition?.dinner}</Text>
          </View>
        </View>

        {/* ── Recovery ── */}
        <SectionHeader title="RECOVERY" icon={HeartPulse} color="#A855F7" />
        <LinearGradient colors={['#A855F720', 'transparent']} style={styles.recoveryBox}>
          <Text style={styles.recoveryText}>{plan.recovery}</Text>
        </LinearGradient>

      </ScrollView>
    </View>
  );
}

function SectionHeader({ title, icon: Icon, color }: any) {
  return (
    <View style={styles.sectionHeader}>
      <Icon size={18} color={color} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md,
  },
  backButton: {
    width: 44, height: 44, borderRadius: 14, backgroundColor: Colors.card,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Colors.border,
  },
  headerTitle: { color: Colors.text, fontSize: 18, fontWeight: '900', letterSpacing: -0.5 },
  refreshIconBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'flex-end' },
  
  content: { paddingHorizontal: SPACING.lg },
  
  hero: { marginTop: 10, marginBottom: 24 },
  dateText: { color: Colors.primary, fontSize: 11, fontWeight: '900', letterSpacing: 2, marginBottom: 8 },
  greeting: { color: Colors.text, fontSize: 32, fontWeight: '900', letterSpacing: -1, marginBottom: 4 },
  subGreeting: { color: Colors.textSecondary, fontSize: 15, fontWeight: '600', textTransform: 'capitalize' },

  summaryRow: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  summaryCard: {
    flex: 1, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: Colors.border,
  },
  summaryValue: { color: Colors.text, fontSize: 24, fontWeight: '900', marginBottom: 4 },
  summaryLabel: { color: Colors.textSecondary, fontSize: 10, fontWeight: '800', letterSpacing: 1 },

  quoteBox: {
    backgroundColor: '#1E1E1E', padding: 20, borderRadius: 20, marginBottom: 32,
    borderLeftWidth: 4, borderLeftColor: Colors.primary
  },
  quoteText: { color: Colors.text, fontSize: 15, fontWeight: '600', fontStyle: 'italic', lineHeight: 22 },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16, paddingLeft: 4 },
  sectionTitle: { color: Colors.textSecondary, fontSize: 12, fontWeight: '900', letterSpacing: 1.5 },

  cardBlock: { backgroundColor: Colors.card, borderRadius: 28, padding: 20, borderWidth: 1, borderColor: Colors.border, marginBottom: 32 },
  
  warmupRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFD700', marginRight: 12 },
  warmupName: { flex: 1, color: Colors.text, fontSize: 15, fontWeight: '600' },
  warmupTime: { color: Colors.textSecondary, fontSize: 14, fontWeight: '700' },

  workoutList: { gap: 16, marginBottom: 32 },
  exerciseCard: { backgroundColor: Colors.card, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: Colors.border },
  exerciseHeader: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 },
  exIconBox: { width: 44, height: 44, borderRadius: 14, backgroundColor: Colors.primary + '15', justifyContent: 'center', alignItems: 'center' },
  exName: { color: Colors.text, fontSize: 16, fontWeight: '800', marginBottom: 4 },
  exNotes: { color: Colors.textSecondary, fontSize: 13, fontWeight: '500' },
  exStatsRow: { flexDirection: 'row', backgroundColor: '#1A1A1A', borderRadius: 16, padding: 12, justifyContent: 'space-between' },
  exStat: { alignItems: 'center', flex: 1 },
  exStatLabel: { color: Colors.textSecondary, fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 4 },
  exStatValue: { color: Colors.text, fontSize: 15, fontWeight: '900' },

  nutritionTarget: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#252525' },
  targetLabel: { color: Colors.text, fontSize: 15, fontWeight: '800' },
  targetValue: { color: '#39FF14', fontSize: 18, fontWeight: '900' },
  mealRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  mealLabel: { color: Colors.textSecondary, fontSize: 14, fontWeight: '600', marginLeft: 12, width: 80 },
  mealValue: { flex: 1, color: Colors.text, fontSize: 15, fontWeight: '700', textAlign: 'right' },

  recoveryBox: { borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#A855F730', marginBottom: 40 },
  recoveryText: { color: Colors.text, fontSize: 15, lineHeight: 24, fontWeight: '600' }
});
