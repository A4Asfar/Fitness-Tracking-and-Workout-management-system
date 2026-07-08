import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Lock, Eye, EyeOff } from 'lucide-react-native';

interface PasswordFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  error?: string;
  editable?: boolean;
}

export default function PasswordField({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  editable = true
}: PasswordFieldProps) {
  const [focused, setFocused] = useState(false);
  const [showPass, setShowPass] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label.toUpperCase()}</Text>
      <View
        style={[
          styles.inputRow,
          focused && styles.inputRowFocused,
          !!error && styles.inputRowError
        ]}
      >
        <View style={styles.iconBox}>
          <Lock
            size={18}
            color={error ? '#EF4444' : focused ? '#10B981' : '#94A3B8'}
          />
        </View>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!showPass}
          autoCapitalize="none"
          editable={editable}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        <TouchableOpacity
          onPress={() => setShowPass(!showPass)}
          activeOpacity={0.7}
          style={styles.eyeBtn}
        >
          {showPass ? (
            <EyeOff size={18} color="#64748B" />
          ) : (
            <Eye size={18} color="#64748B" />
          )}
        </TouchableOpacity>
      </View>
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 6,
    marginLeft: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    height: 52,
    paddingHorizontal: 14,
  },
  inputRowFocused: {
    borderColor: '#10B981',
    backgroundColor: '#FFFFFF',
  },
  inputRowError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  iconBox: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '600',
  },
  eyeBtn: {
    padding: 4,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
    marginLeft: 4,
  },
});
