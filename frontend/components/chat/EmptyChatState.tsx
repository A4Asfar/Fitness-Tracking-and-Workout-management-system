import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Sparkles, Bot } from 'lucide-react-native';
import { AI_COACH_NAME } from '@/constants/Brand';
import { LinearGradient } from 'expo-linear-gradient';
import PromptChip from './PromptChip';

const { width } = Dimensions.get('window');

interface EmptyChatStateProps {
  onPromptPress: (prompt: string) => void;
}

const CHIPS_CONFIG = [
  "🏋 Create Workout split",
  "🥗 Plan High-Protein Meal",
  "🔥 Fat Loss tips",
  "💪 Muscle Gain advise",
  "😴 Recovery tips",
  "❤️ Healthy habit lists"
];

export default function EmptyChatState({
  onPromptPress
}: EmptyChatStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <LinearGradient
          colors={['#10B98120', '#BD00FF04']}
          style={styles.grad}
        >
          <Bot size={40} color="#10B981" strokeWidth={1.5} />
        </LinearGradient>
      </View>

      <Text style={styles.title}>{AI_COACH_NAME}</Text>
      <Text style={styles.subtitle}>
        Your personal AI Fitness Coach. Ask any questions about training splits, nutrition guidelines, meals prep, or recovery.
      </Text>

      <View style={styles.promptContainer}>
        <Text style={styles.sectionLabel}>Suggested Prompts</Text>
        <View style={styles.grid}>
          {CHIPS_CONFIG.map((label, idx) => (
            <View key={idx} style={styles.chipWrapper}>
              <PromptChip
                label={label}
                onPress={() => onPromptPress(label.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, "").trim())}
              />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    overflow: 'hidden',
    marginBottom: 20,
  },
  grad: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#0F172A',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 6,
    marginBottom: 36,
  },
  promptContainer: {
    width: '100%',
    alignItems: 'center',
  },
  sectionLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  chipWrapper: {
    marginBottom: 4,
  },
});
