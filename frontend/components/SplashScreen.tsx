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
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Theme';

interface SplashScreenProps {
  onFinish?: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const insets = useSafeAreaInsets();

  // Shared values
  const screenOpacity = useSharedValue(1);
  const logoScale = useSharedValue(0.8);
  const logoOpacity = useSharedValue(0);
  const glowScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);
  const titleY = useSharedValue(20);
  const titleOpacity = useSharedValue(0);
  const tagOpacity = useSharedValue(0);
  const loaderX = useSharedValue(-200);

  useEffect(() => {
    // 1. Logo entrance
    logoOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
    logoScale.value = withSpring(1, { damping: 12, stiffness: 90 });

    // 2. Glow pulse (infinite)
    glowOpacity.value = withTiming(0.4, { duration: 800 }, () => {
      glowOpacity.value = withRepeat(
        withTiming(0.2, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    });
    glowScale.value = withRepeat(
      withTiming(1.3, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    // 3. Title entrance
    titleOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
    titleY.value = withDelay(400, withSpring(0, { damping: 14, stiffness: 100 }));

    // 4. Tagline entrance
    tagOpacity.value = withDelay(800, withTiming(1, { duration: 600 }));

    // 5. Loader loop
    loaderX.value = withRepeat(
      withTiming(200, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      -1,
      false
    );

    // 6. Exit sequence
    const finishTimeout = setTimeout(() => {
      screenOpacity.value = withTiming(0, { duration: 400 }, () => {
        if (onFinish) {
          runOnJS(onFinish)();
        }
      });
    }, 2500);

    return () => clearTimeout(finishTimeout);
  }, []);

  // Animated styles
  const screenStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
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
  }));

  const loaderStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: loaderX.value }],
  }));

  return (
    <Animated.View style={[styles.container, screenStyle]}>
      {/* Background Glow */}
      <Animated.View style={[styles.glow, glowStyle]} />

      <View style={styles.centerContent}>
        {/* Logo */}
        <Animated.View style={[styles.logoContainer, logoStyle]}>
          <LinearGradient
            colors={[Colors.primary + '40', Colors.primary + '10', 'transparent']}
            style={styles.logoGradient}
          >
            <Dumbbell size={64} color={Colors.primary} strokeWidth={1.5} />
          </LinearGradient>
        </Animated.View>

        {/* Title */}
        <Animated.View style={[styles.titleContainer, titleStyle]}>
          <Text style={styles.title}>ElevateFit</Text>
        </Animated.View>

        {/* Tagline */}
        <Animated.View style={tagStyle}>
          <Text style={styles.tagline}>Train Smarter. Live Stronger.</Text>
        </Animated.View>
      </View>

      {/* Loading Animation */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 40) }]}>
        <View style={styles.loaderTrack}>
          <Animated.View style={[styles.loaderFill, loaderStyle]}>
            <LinearGradient
              colors={['transparent', Colors.primary, 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0F172A',
    zIndex: 9999, // Ensure it sits on top of everything
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: Colors.primary,
    opacity: 0.1,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 50,
    elevation: 10,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: Colors.primary + '40',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
    marginBottom: 30,
  },
  logoGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    marginBottom: 12,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 16,
    fontWeight: '400',
    color: '#94A3B8',
    letterSpacing: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  loaderTrack: {
    width: 150,
    height: 2,
    backgroundColor: '#1E293B',
    borderRadius: 1,
    overflow: 'hidden',
  },
  loaderFill: {
    width: '100%',
    height: '100%',
  },
});
