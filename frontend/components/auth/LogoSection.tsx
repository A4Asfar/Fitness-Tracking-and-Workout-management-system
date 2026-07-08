import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Dumbbell } from 'lucide-react-native';
import { APP_NAME, APP_TAGLINE, AI_COACH_NAME } from '@/constants/Brand';

export default function LogoSection() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#10B981', '#BD00FF']}
        style={styles.logoBox}
      >
        <Dumbbell size={32} color="#FFFFFF" strokeWidth={2} />
      </LinearGradient>
      <Text style={styles.title}>{APP_NAME}</Text>
      <Text style={styles.tagline}>{APP_TAGLINE}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  title: {
    color: '#0F172A',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  tagline: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});
