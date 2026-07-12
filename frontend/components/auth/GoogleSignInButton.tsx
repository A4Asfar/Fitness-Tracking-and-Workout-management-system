import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, ActivityIndicator, Image } from 'react-native';
import { useAuth } from '@/context/AuthContext';

interface Props {
  isLoading?: boolean;
}

export default function GoogleSignInButton({ isLoading = false }: Props) {
  const { loginWithGoogle } = useAuth();

  return (
    <TouchableOpacity
      style={[s.button, isLoading && s.buttonDisabled]}
      activeOpacity={0.8}
      onPress={loginWithGoogle}
      disabled={isLoading}
    >
      <View style={s.content}>
        {isLoading ? (
          <ActivityIndicator color="#F8FAFC" size="small" />
        ) : (
          <>
            <Image
              source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg' }}
              style={s.icon}
            />
            <Text style={s.text}>Continue with Google</Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  button: {
    height: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  icon: {
    width: 22,
    height: 22,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
