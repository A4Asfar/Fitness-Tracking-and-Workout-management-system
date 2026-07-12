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
    height: 52,
    backgroundColor: '#0F172A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  icon: {
    width: 20,
    height: 20,
  },
  text: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
  },
});
