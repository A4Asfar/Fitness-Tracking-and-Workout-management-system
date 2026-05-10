import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { Colors, SharedStyles, SPACING } from '@/constants/Theme';
import { getIconComponent } from '@/services/recommendations';
import { ContentService } from '@/services/contentService';
import { useToast } from '@/components/Toast';
import { 
  ArrowLeft, Coffee, Sun, Moon, Apple, 
  Dumbbell, Sparkles, Zap, ChevronRight,
  Quote, ShieldCheck, Calendar, RefreshCcw
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

  const [nutritionPlan, setNutritionPlan] = React.useState<any>(null);
  const [workoutPlan, setWorkoutPlan] = React.useState<any[]>([]);
  const [motivation, setMotivation] = React.useState('');
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const generatePlan = React.useCallback(async () => {
    setIsRefreshing(true);
    try {
      const data = await ContentService.getDailyPlan({
        goal: user?.fitnessGoal,
        level: user?.trainingLevel,
        focus: user?.preferredWorkoutFocus
      });
      setNutritionPlan(data.nutritionPlan);
      setWorkoutPlan(data.workoutSuggestions);
      setMotivation(data.motivation);
    } catch (err) {
      showToast('Failed to load daily plan', 'error');
    } finally {
      setIsRefreshing(false);
    }
  }, [user]);

  React.useEffect(() => {
    generatePlan();
  }, [generatePlan]);

  const dateStr = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

  if (!nutritionPlan) return null; // Wait for initial gen

  return (
    <View style={SharedStyles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity onPress={() => safeBack()} style={styles.backButton}>
          <ArrowLeft size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Daily Guidance</Text>
        <TouchableOpacity 
          onPress={generatePlan} 
          style={styles.refreshIconBtn}
          disabled={isRefreshing}
        >
          <RefreshCcw size={20} color={isRefreshing ? Colors.textSecondary : Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
      >
        {/* ── Greeting & Date ── */}
        <View style={styles.hero}>
          <View style={styles.dateRow}>
            <Calendar size={14} color={Colors.primary} />
            <Text style={styles.dateText}>{dateStr.toUpperCase()}</Text>
          </View>
          <View style={styles.greetingHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.greeting}>Today's Personalized Plan</Text>
              <Text style={styles.subGreeting}>A curated journey for your {user?.fitnessGoal || 'Fitness'} goals.</Text>
            </View>
          </View>
        </View>

        {/* ── Motivation Card ── */}
        <LinearGradient
          colors={[Colors.primary + '20', 'transparent']}
          style={styles.motivationCard}
        >
          <Quote size={24} color={Colors.primary} opacity={0.6} style={{ marginBottom: 12 }} />
          <Text style={styles.motivationText}>{motivation}</Text>
        </LinearGradient>

        {/* ── Nutrition Section ── */}
        <SectionHeader title="NUTRITION BLUEPRINT" icon={Apple} />
        <View style={styles.planBox}>
          <PlanRow 
            type="Breakfast" 
            name={nutritionPlan.Breakfast.name} 
            note={nutritionPlan.Breakfast.note} 
            icon={getIconComponent(nutritionPlan.Breakfast.icon)}
            onPress={() => router.push(`/(tabs)/diet?mealName=${encodeURIComponent(nutritionPlan.Breakfast.name)}` as any)}
          />
          <Divider />
          <PlanRow 
            type="Lunch" 
            name={nutritionPlan.Lunch.name} 
            note={nutritionPlan.Lunch.note} 
            icon={getIconComponent(nutritionPlan.Lunch.icon)}
            onPress={() => router.push(`/(tabs)/diet?mealName=${encodeURIComponent(nutritionPlan.Lunch.name)}` as any)}
          />
          <Divider />
          <PlanRow 
            type="Dinner" 
            name={nutritionPlan.Dinner.name} 
            note={nutritionPlan.Dinner.note} 
            icon={getIconComponent(nutritionPlan.Dinner.icon)}
            onPress={() => router.push(`/(tabs)/diet?mealName=${encodeURIComponent(nutritionPlan.Dinner.name)}` as any)}
          />
          <Divider />
          <PlanRow 
            type="Snack" 
            name={nutritionPlan.Snack.name} 
            note={nutritionPlan.Snack.note} 
            icon={getIconComponent(nutritionPlan.Snack.icon)}
            onPress={() => router.push(`/(tabs)/diet?mealName=${encodeURIComponent(nutritionPlan.Snack.name)}` as any)}
          />
        </View>

        {/* ── Workout Section ── */}
        <SectionHeader title="TRAINING TARGETS" icon={Dumbbell} />
        <View style={styles.workoutList}>
          {workoutPlan.map((rec, idx) => {
            const WorkoutIcon = getIconComponent(rec.icon);
            return (
              <TouchableOpacity 
                key={idx} 
                style={styles.workoutCard}
                onPress={() => router.push(`/create-workout?type=${rec.type}&exercise=${rec.exercise}` as any)}
              >
                <View style={styles.workoutIconBox}>
                  <WorkoutIcon size={20} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.workoutName}>{rec.exercise}</Text>
                  <Text style={styles.workoutReason}>{rec.reason}</Text>
                </View>
                <ChevronRight size={18} color={Colors.border} />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Action Buttons ── */}
        <TouchableOpacity 
          style={styles.refreshPlanBtn} 
          onPress={generatePlan}
          disabled={isRefreshing}
        >
          <RefreshCcw size={18} color="#000" style={{ marginRight: 10 }} />
          <Text style={styles.refreshPlanBtnText}>
            {isRefreshing ? 'REGENERATING...' : 'REFRESH TODAY\'S PLAN'}
          </Text>
        </TouchableOpacity>

        {/* ── Footer Advice ── */}
        <View style={styles.footerAdvice}>
          <ShieldCheck size={16} color={Colors.primary} />
          <Text style={styles.footerText}>Follow this plan to stay on track for your 90-day transformation.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

function SectionHeader({ title, icon: Icon }: any) {
  return (
    <View style={styles.sectionHeader}>
      <Icon size={16} color={Colors.textSecondary} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function PlanRow({ type, name, note, icon: Icon, onPress }: any) {
  return (
    <TouchableOpacity style={styles.planRow} onPress={onPress}>
      <View style={styles.iconBox}>
        <Icon size={18} color={Colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.planType}>{type}</Text>
        <Text style={styles.planName}>{name}</Text>
        <Text style={styles.planNote}>{note}</Text>
      </View>
      <ChevronRight size={16} color={Colors.border} />
    </TouchableOpacity>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  content: {
    paddingHorizontal: SPACING.lg,
  },
  hero: {
    marginTop: 20,
    marginBottom: 32,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  dateText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
  },
  greeting: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.8,
    marginBottom: 8,
  },
  subGreeting: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
  },
  motivationCard: {
    padding: 24,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginBottom: 40,
  },
  motivationText: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 26,
    letterSpacing: -0.2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
    paddingLeft: 4,
  },
  sectionTitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  planBox: {
    backgroundColor: Colors.card,
    borderRadius: 32,
    padding: 8,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginBottom: 40,
  },
  planRow: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  planType: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  planName: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  planNote: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 16,
    opacity: 0.5,
  },
  workoutList: {
    gap: 12,
    marginBottom: 40,
  },
  workoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  workoutIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: Colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  workoutName: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  workoutReason: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 18,
  },
  footerAdvice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '08',
    padding: 16,
    borderRadius: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.primary + '20',
  },
  footerText: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
  },
  refreshIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  greetingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  refreshPlanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  refreshPlanBtnText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
