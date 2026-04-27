import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, Dimensions, Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Dumbbell } from 'lucide-react-native';
import { Colors } from '@/constants/Theme';

const { width, height } = Dimensions.get('window');

/* ─── Orbital dot ─── */
function OrbitalDot({ angle, radius, delay, anim }: {
  angle: number; radius: number; delay: number; anim: Animated.Value;
}) {
  const rad = (angle * Math.PI) / 180;
  const x = Math.cos(rad) * radius;
  const y = Math.sin(rad) * radius;
  const op = anim.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 1, 0.25] });
  const sc = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 1.4, 0.8] });
  return (
    <Animated.View style={[
      orb.dot,
      { left: 50 + x - 5, top: 50 + y - 5, opacity: op, transform: [{ scale: sc }] },
    ]} />
  );
}
const orb = StyleSheet.create({
  dot: {
    position: 'absolute', width: 8, height: 8,
    borderRadius: 4, backgroundColor: Colors.primary,
  },
});

const DOTS = [0, 45, 90, 135, 180, 225, 270, 315];

export default function SplashScreen() {
  /* ── Animation values ── */
  const screenOp    = useRef(new Animated.Value(1)).current;   // full-screen fade-out

  const bgGlow      = useRef(new Animated.Value(0)).current;   // background radial pulse
  const logoOp      = useRef(new Animated.Value(0)).current;   // logo fade
  const logoScale   = useRef(new Animated.Value(0.5)).current; // logo spring in
  const logoRotate  = useRef(new Animated.Value(-15)).current; // logo entry tilt
  const ringScale   = useRef(new Animated.Value(0.6)).current; // outer ring grow
  const ringOp      = useRef(new Animated.Value(0)).current;   // outer ring fade
  const pulseScale  = useRef(new Animated.Value(1)).current;   // infinite ring pulse
  const pulseOp     = useRef(new Animated.Value(0.6)).current;
  const orbitalAnim = useRef(new Animated.Value(0)).current;   // dots
  const titleOp     = useRef(new Animated.Value(0)).current;   // title
  const titleTy     = useRef(new Animated.Value(20)).current;
  const subOp       = useRef(new Animated.Value(0)).current;   // subtitle
  const subTy       = useRef(new Animated.Value(16)).current;
  const tagOp       = useRef(new Animated.Value(0)).current;   // tagline
  const tagTy       = useRef(new Animated.Value(12)).current;
  const barWidth    = useRef(new Animated.Value(0)).current;   // progress bar
  const footerOp    = useRef(new Animated.Value(0)).current;   // footer

  useEffect(() => {
    const easeOut  = Easing.bezier(0.33, 1, 0.68, 1); // Premium easeOutCubic
    const easeBack = Easing.back(1.6);

    /* Phase 1: Logo entrance — spring with back easing for premium feel */
    Animated.parallel([
      Animated.timing(logoOp,     { toValue: 1, duration: 700, easing: easeOut,  useNativeDriver: true }),
      Animated.timing(logoScale,  { toValue: 1, duration: 900, easing: easeBack, useNativeDriver: true }),
      Animated.timing(logoRotate, { toValue: 0, duration: 850, easing: easeOut,  useNativeDriver: true }),
      Animated.timing(ringOp,     { toValue: 1, duration: 800, delay: 200, easing: easeOut, useNativeDriver: true }),
      Animated.timing(ringScale,  { toValue: 1, duration: 900, delay: 100, easing: easeBack, useNativeDriver: true }),
      Animated.timing(bgGlow,     { toValue: 1, duration: 1100, easing: easeOut, useNativeDriver: true }),
    ]).start();

    /* Phase 2: Orbital dots cascade */
    Animated.timing(orbitalAnim, { toValue: 1, duration: 1200, delay: 250, easing: easeOut, useNativeDriver: true }).start();

    /* Phase 3: Text cascade — wider stagger for drama */
    Animated.parallel([
      Animated.timing(titleOp, { toValue: 1, duration: 600, delay: 500, easing: easeOut, useNativeDriver: true }),
      Animated.timing(titleTy, { toValue: 0, duration: 650, delay: 500, easing: easeBack, useNativeDriver: true }),
      Animated.timing(subOp,   { toValue: 1, duration: 550, delay: 750, easing: easeOut, useNativeDriver: true }),
      Animated.timing(subTy,   { toValue: 0, duration: 600, delay: 750, easing: easeBack, useNativeDriver: true }),
      Animated.timing(tagOp,   { toValue: 1, duration: 550, delay: 1000, easing: easeOut, useNativeDriver: true }),
      Animated.timing(tagTy,   { toValue: 0, duration: 600, delay: 1000, easing: easeBack, useNativeDriver: true }),
    ]).start();

    /* Phase 4: Footer + progress bar */
    Animated.parallel([
      Animated.timing(footerOp, { toValue: 1, duration: 500, delay: 800, easing: easeOut, useNativeDriver: true }),
      Animated.timing(barWidth, {
        toValue: width * 0.55,
        duration: 1800, delay: 950,
        easing: Easing.bezier(0.33, 1, 0.68, 1),
        useNativeDriver: false,
      }),
    ]).start();

    /* Phase 5: Smooth breathing pulse */
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseScale, { toValue: 1.1,  duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(pulseScale, { toValue: 1,    duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(pulseOp, { toValue: 0.15, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(pulseOp, { toValue: 0.55, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  const logoRotateDeg = logoRotate.interpolate({ inputRange: [-15, 0], outputRange: ['-15deg', '0deg'] });
  const bgGlowOp      = bgGlow.interpolate({ inputRange: [0, 1], outputRange: [0, 0.55] });
  const bgGlowScale   = bgGlow.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.4] });

  return (
    <Animated.View style={[s.root, { opacity: screenOp }]}>
      {/* Deep gradient background */}
      <LinearGradient
        colors={['#050505', '#080808', '#03120A', '#050505']}
        locations={[0, 0.4, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Radial background glow */}
      <Animated.View style={[
        s.bgGlow,
        { opacity: bgGlowOp, transform: [{ scale: bgGlowScale }] },
      ]} />

      {/* Secondary corner glows */}
      <View style={[s.cornerGlow, { top: -80, right: -80, backgroundColor: Colors.primary + '0A' }]} />
      <View style={[s.cornerGlow, { bottom: -80, left: -80, backgroundColor: Colors.primary + '07' }]} />

      {/* ── Main Content ── */}
      <View style={s.center}>

        {/* Orbital ring + dots */}
        <Animated.View style={[s.orbitalWrap, { opacity: ringOp, transform: [{ scale: ringScale }] }]}>
          {/* Pulse ring */}
          <Animated.View style={[
            s.pulseRing,
            { opacity: pulseOp, transform: [{ scale: pulseScale }] },
          ]} />
          {/* Outer dashed ring */}
          <View style={s.outerRing} />
          {/* Orbital dots */}
          <View style={s.dotsContainer}>
            {DOTS.map((angle, i) => (
              <OrbitalDot key={i} angle={angle} radius={62} delay={i * 60} anim={orbitalAnim} />
            ))}
          </View>
        </Animated.View>

        {/* Logo container */}
        <Animated.View style={[
          s.logoWrap,
          {
            opacity: logoOp,
            transform: [
              { scale: logoScale },
              { rotate: logoRotateDeg },
            ],
          },
        ]}>
          <LinearGradient
            colors={[Colors.primary + '35', Colors.primary + '15', Colors.primary + '08']}
            style={s.logoGrad}
          >
            <Dumbbell size={72} color={Colors.primary} strokeWidth={1.6} />
          </LinearGradient>
        </Animated.View>

        {/* App title */}
        <Animated.View style={[s.titleWrap, { opacity: titleOp, transform: [{ translateY: titleTy }] }]}>
          <Text style={s.title}>FITNESS TRACKER</Text>
          <LinearGradient
            colors={[Colors.primary, '#9FE800', Colors.primary]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={s.titleAccentLine}
          />
        </Animated.View>

        {/* PRO badge */}
        <Animated.View style={[s.proBadgeWrap, { opacity: subOp, transform: [{ translateY: subTy }] }]}>
          <LinearGradient
            colors={[Colors.primary + '30', Colors.primary + '10']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={s.proBadge}
          >
            <Text style={s.proBadgeText}>PRO</Text>
          </LinearGradient>
          <Text style={s.proLabel}>EDITION</Text>
        </Animated.View>

        {/* Tagline */}
        <Animated.Text style={[s.tagline, { opacity: tagOp, transform: [{ translateY: tagTy }] }]}>
          Your journey starts here
        </Animated.Text>
      </View>

      {/* ── Footer ── */}
      <Animated.View style={[s.footer, { opacity: footerOp }]}>
        {/* Progress bar */}
        <View style={s.barTrack}>
          <Animated.View style={[s.barFill, { width: barWidth }]}>
            <LinearGradient
              colors={[Colors.primary + '80', Colors.primary, '#9FE800']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
          {/* Bar glow dot */}
          <Animated.View style={[s.barDot, { left: barWidth }]} />
        </View>

        <Text style={s.footerText}>SYNCING YOUR PROGRESS</Text>
        <View style={s.footerDots}>
          {[0, 1, 2].map(i => <FooterDot key={i} delay={i * 280} />)}
        </View>
      </Animated.View>
    </Animated.View>
  );
}

/* Bouncing footer dots */
function FooterDot({ delay }: { delay: number }) {
  const y = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(y, { toValue: -6, duration: 400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(y, { toValue: 0,  duration: 400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])
      ).start();
    }, delay);
  }, []);
  return <Animated.View style={[s.footerDot, { transform: [{ translateY: y }] }]} />;
}

const LOGO_SIZE    = 152;
const ORBITAL_SIZE = 200;

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#050505' },

  bgGlow: {
    position: 'absolute',
    width: width * 1.3, height: width * 1.3,
    borderRadius: width * 0.65,
    top: height / 2 - width * 0.65,
    left: -width * 0.15,
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1, shadowRadius: 100,
  },
  cornerGlow: {
    position: 'absolute',
    width: 320, height: 320, borderRadius: 160,
  },

  /* Center block */
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  /* Orbital system */
  orbitalWrap: {
    position: 'absolute',
    width: ORBITAL_SIZE, height: ORBITAL_SIZE,
    justifyContent: 'center', alignItems: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: ORBITAL_SIZE + 52, height: ORBITAL_SIZE + 52,
    borderRadius: (ORBITAL_SIZE + 52) / 2,
    borderWidth: 1.5,
    borderColor: Colors.primary + '55',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5, shadowRadius: 16,
  },
  outerRing: {
    position: 'absolute',
    width: ORBITAL_SIZE, height: ORBITAL_SIZE,
    borderRadius: ORBITAL_SIZE / 2,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
    borderStyle: 'dashed',
  },
  dotsContainer: {
    position: 'absolute',
    width: 100, height: 100,
  },

  /* Logo */
  logoWrap: {
    width: LOGO_SIZE, height: LOGO_SIZE,
    borderRadius: LOGO_SIZE / 2,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9, shadowRadius: 50, elevation: 24,
    borderWidth: 2, borderColor: Colors.primary + '50',
  },
  logoGrad: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
  },

  /* Title */
  titleWrap: { marginTop: ORBITAL_SIZE / 2 + 28, alignItems: 'center' },
  title: {
    color: '#FFFFFF', fontSize: 26, fontWeight: '900',
    letterSpacing: 8, textAlign: 'center',
  },
  titleAccentLine: {
    height: 3, width: 140, borderRadius: 2, marginTop: 14,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1, shadowRadius: 12,
  },

  /* Pro badge */
  proBadgeWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 18 },
  proBadge: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10,
    borderWidth: 1.5, borderColor: Colors.primary + '55',
  },
  proBadgeText: {
    color: Colors.primary, fontSize: 12, fontWeight: '900', letterSpacing: 4,
  },
  proLabel: {
    color: Colors.primary + '70', fontSize: 11, fontWeight: '800', letterSpacing: 5,
  },

  /* Tagline */
  tagline: {
    color: 'rgba(255,255,255,0.38)', fontSize: 15, fontWeight: '300',
    letterSpacing: 2, marginTop: 22, fontStyle: 'italic',
  },

  /* Footer */
  footer: {
    position: 'absolute', bottom: 58, left: 0, right: 0,
    alignItems: 'center', gap: 16,
  },
  barTrack: {
    width: width * 0.55, height: 3, borderRadius: 2,
    backgroundColor: Colors.primary + '15', overflow: 'visible',
  },
  barFill: { height: 3, borderRadius: 2, overflow: 'hidden' },
  barDot: {
    position: 'absolute', top: -4.5,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1, shadowRadius: 10,
  },
  footerText: {
    color: Colors.primary + '45', fontSize: 9, fontWeight: '900',
    letterSpacing: 4, textTransform: 'uppercase',
  },
  footerDots: { flexDirection: 'row', gap: 10, alignItems: 'flex-end', height: 22 },
  footerDot: {
    width: 7, height: 7, borderRadius: 3.5,
    backgroundColor: Colors.primary + '55',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6, shadowRadius: 4,
  },
});
