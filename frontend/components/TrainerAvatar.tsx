import React, { useState } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Theme';
import { User } from 'lucide-react-native';

interface TrainerAvatarProps {
  uri?: string;
  name: string;
  size?: number;
  accentColor?: string;
  borderRadius?: number;
}

export function TrainerAvatar({ 
  uri, 
  name, 
  size = 80, 
  accentColor = Colors.primary,
  borderRadius = 20 
}: TrainerAvatarProps) {
  const [hasError, setHasError] = useState(false);
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <View style={[styles.container, { width: size, height: size, borderRadius }]}>
      {uri && !hasError ? (
        <Image
          source={{ uri }}
          style={[styles.image, { borderRadius }]}
          onError={() => setHasError(true)}
          resizeMode="cover"
        />
      ) : (
        <LinearGradient
          colors={[accentColor + '30', accentColor + '10']}
          style={[styles.fallback, { borderRadius }]}
        >
          <Text style={[styles.initials, { fontSize: size * 0.35, color: accentColor }]}>
            {initials}
          </Text>
          <View style={[styles.iconPos, { bottom: size * 0.1 }]}>
            <User size={size * 0.2} color={accentColor} opacity={0.5} />
          </View>
        </LinearGradient>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A1A1A',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fallback: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontWeight: '900',
    letterSpacing: -1,
  },
  iconPos: {
    position: 'absolute',
  }
});
