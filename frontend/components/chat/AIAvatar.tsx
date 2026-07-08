import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Bot } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function AIAvatar() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#10B981', '#BD00FF']}
        style={styles.avatar}
      >
        <Bot size={18} color="#FFFFFF" strokeWidth={2} />
      </LinearGradient>
      <View style={styles.badge} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: 36,
    height: 36,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});
