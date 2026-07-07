import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

interface InputFieldProps {
  label: string;
  icon: any;
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  keyboardType?: 'default' | 'email-address' | 'numeric';
  autoCapitalize?: 'none' | 'sentences' | 'words';
  error?: string;
  editable?: boolean;
}

export default function InputField({
  label,
  icon: IconComponent,
  placeholder,
  value,
  onChangeText,
  keyboardType = 'default',
  autoCapitalize = 'none',
  error,
  editable = true
}: InputFieldProps) {
  const [focused, setFocused] = useState(false);

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
          <IconComponent
            size={18}
            color={error ? '#EF4444' : focused ? '#7C4DFF' : '#94A3B8'}
          />
        </View>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={editable}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
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
    borderColor: '#7C4DFF',
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
  errorText: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
    marginLeft: 4,
  },
});
