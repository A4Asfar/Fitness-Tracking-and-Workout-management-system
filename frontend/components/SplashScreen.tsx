import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Dumbbell } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withRepeat,
  withSequence,
  Easing,
  runOnJS,
  useReducedMotion,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Theme';

interface SplashScreenProps {
  onFinish?: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();

  // Root screen values
  const screenOpacity = useSharedValue(1);
  const screenScale = useSharedValue(1);

  // Background floating elements
  const bgFloat1Y = useSharedValue(0);
  const bgFloat2Y = useSharedValue(0);

  // Logo values
  const logoScale = useSharedValue(reducedMotion ? 1 : 0.85);
  const logoOpacity = useSharedValue(reducedMotion ? 1 : 0);
  
  // Glow values
  const glowScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  // Typography values
  const titleY = useSharedValue(reducedMotion ? 0 : 20);
  const titleOpacity = useSharedValue(reducedMotion ? 1 : 0);
  const tagY = useSharedValue(reducedMotion ? 0 : 10);
  const tagOpacity = useSharedValue(reducedMotion ? 0.7 : 0);
  const aiOpacity = useSharedValue(reducedMotion ? 0.6 : 0);

  // Loading dots
  const dot1Y = useSharedValue(0);
  const dot2Y = useSharedValue(0);
  const dot3Y = useSharedValue(0);

  useEffect(() => {
    if (reducedMotion) {
      const finishTimeout = setTimeout(() => {
        if (onFinish) onFinish();
      }, 2500);
      return () => clearTimeout(finishTimeout);
    }

    // 0. Subtle background floating circles
    bgFloat1Y.value = withRepeat(withTiming(-30, { duration: 6000, easing: Easing.inOut(Easing.sin) }), -1, true);
    bgFloat2Y.value = withRepeat(withTiming(30, { duration: 7000, easing: Easing.inOut(Easing.sin) }), -1, true);

    // 1. Logo entrance & breathing
    logoOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });
    logoScale.value = withSequence(
      withSpring(1, { damping: 14, stiffness: 80 }),
      withRepeat(withTiming(1.03, { duration: 2500, easing: Easing.inOut(Easing.ease) }), -1, true)
    );

    // 2. Soft green radial glow pulse (every 2-3s)
    glowOpacity.value = withDelay(400, 
      withRepeat(withTiming(0.25, { duration: 2500, easing: Easing.inOut(Easing.ease) }), -1, true)
    );
    glowScale.value = withRepeat(withTiming(1.15, { duration: 2500, easing: Easing.inOut(Easing.ease) }), -1, true);

    // 3. Title entrance
    titleOpacity.value = withDelay(300, withTiming(1, { duration: 800 }));
    titleY.value = withDelay(300, withTiming(0, { duration: 800, easing: Easing.out(Easing.cubic) }));

    // 4. Tagline entrance
    tagOpacity.value = withDelay(600, withTiming(0.7, { duration: 800 }));
    tagY.value = withDelay(600, withTiming(0, { duration: 800, easing: Easing.out(Easing.cubic) }));

    // 5. AI Label entrance
    aiOpacity.value = withDelay(1000, withTiming(0.6, { duration: 800 }));

    // 6. Loader dots bounce loop
    const dotBounce = (val: any, delay: number) => {
      val.value = withDelay(delay, withRepeat(
        withSequence(
          withTiming(-6, { duration: 400, easing: Easing.out(Easing.cubic) }),
          withTiming(0, { duration: 400, easing: Easing.bounce }),
          withTiming(0, { duration: 400 })
        ), -1, false
      ));
    };
    dotBounce(dot1Y, 0);
    dotBounce(dot2Y, 150);
    dotBounce(dot3Y, 300);

    // 7. Exit sequence (seamless transition out)
    const finishTimeout = setTimeout(() => {
      screenOpacity.value = withTiming(0, { duration: 450, easing: Easing.out(Easing.ease) });
      screenScale.value = withTiming(1.03, { duration: 450, easing: Easing.out(Easing.ease) }, () => {
        if (onFinish) {
          runOnJS(onFinish)();
        }
      });
    }, 2800);

    return () => clearTimeout(finishTimeout);
  }, [reducedMotion]);

  // Animated styles
  const screenStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
    transform: [{ scale: screenScale.value }],
  }));

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: glowScale.value }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleY.value }],
  }));

  const tagStyle = useAnimatedStyle(() => ({
    opacity: tagOpacity.value,
    transform: [{ translateY: tagY.value }],
  }));
  
  const aiStyle = useAnimatedStyle(() => ({
    opacity: aiOpacity.value,
  }));

  const bgFloat1Style = useAnimatedStyle(() => ({ transform: [{ translateY: bgFloat1Y.value }] }));
  const bgFloat2Style = useAnimatedStyle(() => ({ transform: [{ translateY: bgFloat2Y.value }] }));
  
  const dot1Style = useAnimatedStyle(() => ({ transform: [{ translateY: dot1Y.value }] }));
  const dot2Style = useAnimatedStyle(() => ({ transform: [{ translateY: dot2Y.value }] }));
  const dot3Style = useAnimatedStyle(() => ({ transform: [{ translateY: dot3Y.value }] }));

  return (
    <Animated.View style={[styles.container, screenStyle]}>
      {/* Background Ambience */}
      <Animated.View style={[styles.bgCircle, styles.bgCircleTop, bgFloat1Style]} />
      <Animated.View style={[styles.bgCircle, styles.bgCircleBottom, bgFloat2Style]} />

      {/* Main Glow behind Logo */}
      <Animated.View style={[styles.glow, glowStyle]} />

      <View style={styles.centerContent}>
        {/* Logo */}
        <Animated.View style={[styles.logoContainer, logoStyle]}>
          <LinearGradient
            colors={[Colors.primary + '50', Colors.primary + '15', 'transparent']}
            style={styles.logoGradient}
          >
            <Dumbbell size={60} color={Colors.primary} strokeWidth={1.5} />
          </LinearGradient>
        </Animated.View>

        {/* Title */}
        <Animated.View style={[styles.titleContainer, titleStyle]}>
          <Text style={styles.title}>ELEVATEFIT</Text>
        </Animated.View>

        {/* Tagline */}
        <Animated.View style={[styles.taglineContainer, tagStyle]}>
          <Text style={styles.tagline}>Train Smarter.{'\n'}Live Stronger.</Text>
        </Animated.View>
        
        {/* AI Powered */}
        <Animated.View style={[styles.aiContainer, aiStyle]}>
          <Text style={styles.aiText}>Powered by AI</Text>
        </Animated.View>
      </View>

      {/* Loading Animation */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 40) }]}>
        <View style={styles.dotsContainer}>
          <Animated.View style={[styles.dot, dot1Style]} />
          <Animated.View style={[styles.dot, dot2Style]} />
          <Animated.View style={[styles.dot, dot3Style]} />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0F172A',
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bgCircle: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: Colors.primary,
    opacity: 0.03,
  },
  bgCircleTop: {
    top: -100,
    right: -100,
  },
  bgCircleBottom: {
    bottom: -150,
    left: -100,
  },
  glow: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: Colors.primary,
    opacity: 0.15,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    overflow: 'hidden',
    backgroundColor: '#1E293B',
    borderWidth: 1.5,
    borderColor: Colors.primary + '30',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
    marginBottom: 32,
  },
  logoGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: 4,
  },
  taglineContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  tagline: {
    fontSize: 18,
    fontWeight: '400',
    color: '#CBD5E1',
    letterSpacing: 1,
    textAlign: 'center',
    lineHeight: 26,
  },
  aiContainer: {
    marginTop: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: Colors.primary + '10',
    borderWidth: 1,
    borderColor: Colors.primary + '20',
  },
  aiText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    opacity: 0.8,
  },
});
