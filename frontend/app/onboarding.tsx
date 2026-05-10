import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, TouchableOpacity, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, SPACING } from '@/constants/Theme';
import { Activity, TrendingUp, Sparkles, ChevronRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Track Your Workouts',
    desc: 'Log every rep, set, and exercise with precision. Build custom workout routines tailored to your goals.',
    icon: Activity,
    color: Colors.primary,
    grad: [Colors.primary, '#0097A7'] as [string, string],
  },
  {
    id: '2',
    title: 'Monitor Your Progress',
    desc: 'Visualize your fitness journey with detailed analytics, charts, and performance metrics that matter.',
    icon: TrendingUp,
    color: Colors.secondary,
    grad: [Colors.secondary, '#C2185B'] as [string, string],
  },
  {
    id: '3',
    title: 'AI Fitness Suggestions',
    desc: 'Get personalized workout recommendations powered by AI. Adaptive plans that evolve with your progress.',
    icon: Sparkles,
    color: Colors.accent,
    grad: [Colors.accent, Colors.primary] as [string, string],
  },
];

export default function OnboardingScreen() {
  const [index, setIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleNext = () => {
    if (index < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: index + 1 });
    } else {
      router.replace('/login');
    }
  };

  const handleSkip = () => router.replace('/login');

  const renderItem = ({ item }: { item: typeof SLIDES[0] }) => (
    <View style={styles.slide}>
      <View style={styles.iconContainer}>
        <LinearGradient colors={item.grad} style={styles.iconGrad}>
           <item.icon size={64} color="#FFF" strokeWidth={2} />
        </LinearGradient>
        <View style={[styles.iconGlow, { backgroundColor: item.color }]} />
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.desc}>{item.desc}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.skip, { top: insets.top + 20 }]} 
        onPress={handleSkip}
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(e) => {
          setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
        }}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />

      <View style={styles.footer}>
        {/* Pagination Dots */}
        <View style={styles.pagination}>
          {SLIDES.map((_, i) => {
            const opacity = scrollX.interpolate({
              inputRange: [(i - 1) * width, i * width, (i + 1) * width],
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });
            const dotWidth = scrollX.interpolate({
              inputRange: [(i - 1) * width, i * width, (i + 1) * width],
              outputRange: [8, 24, 8],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View 
                key={i} 
                style={[styles.dot, { opacity, width: dotWidth, backgroundColor: SLIDES[index].color }]} 
              />
            );
          })}
        </View>

        {/* Action Button */}
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <LinearGradient
            colors={SLIDES[index].grad}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonGrad}
          >
            <Text style={styles.buttonText}>
              {index === SLIDES.length - 1 ? 'Get Started' : 'Next'}
            </Text>
            <ChevronRight size={20} color="#FFF" strokeWidth={3} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  skip: { position: 'absolute', right: 24, zIndex: 10 },
  skipText: { color: Colors.textSecondary, fontSize: 16, fontWeight: '600' },
  slide: { width, alignItems: 'center', justifyContent: 'center', padding: 40 },
  iconContainer: { marginBottom: 60, position: 'relative', width: 140, height: 140, justifyContent: 'center', alignItems: 'center' },
  iconGrad: { width: 120, height: 120, borderRadius: 35, justifyContent: 'center', alignItems: 'center', zIndex: 2 },
  iconGlow: { position: 'absolute', width: 140, height: 140, borderRadius: 50, opacity: 0.25, zIndex: 1 },
  title: { color: Colors.text, fontSize: 32, fontWeight: '900', textAlign: 'center', marginBottom: 20, letterSpacing: -1 },
  desc: { color: Colors.textSecondary, fontSize: 16, textAlign: 'center', lineHeight: 26, paddingHorizontal: 20 },
  footer: { padding: 40, paddingBottom: 60 },
  pagination: { flexDirection: 'row', justifyContent: 'center', marginBottom: 40, gap: 8 },
  dot: { height: 8, borderRadius: 4 },
  button: { width: '100%', height: 60, borderRadius: 20, overflow: 'hidden' },
  buttonGrad: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  buttonText: { color: '#FFF', fontSize: 18, fontWeight: '900', letterSpacing: 0.5 },
});
