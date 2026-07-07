import React from 'react';
import { Text, StyleSheet, TouchableOpacity, View, Alert } from 'react-native';

interface SocialButtonProps {
  provider: 'Google' | 'Apple' | 'Facebook';
  icon: any;
}

export default function SocialButton({
  provider,
  icon: IconComponent
}: SocialButtonProps) {
  const handlePress = () => {
    Alert.alert('Coming Soon', `${provider} authentication is coming in a future update.`);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      style={styles.btn}
    >
      <View style={styles.iconWrap}>
        <IconComponent size={18} color="#0F172A" />
      </View>
      <Text style={styles.text}>{provider}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    height: 48,
    gap: 8,
  },
  iconWrap: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '700',
  },
});
