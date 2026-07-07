import React, { useRef } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

interface OTPInputProps {
  value: string;
  onChange: (val: string) => void;
}

export default function OTPInput({
  value,
  onChange
}: OTPInputProps) {
  const inputsRef = useRef<TextInput[]>([]);
  const otpArray = value.split('');

  const handleChange = (text: string, index: number) => {
    const updatedOtp = [...otpArray];
    updatedOtp[index] = text;
    
    const finalVal = updatedOtp.join('');
    onChange(finalVal);

    if (text.length > 0 && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && otpArray[index] === '' && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      {Array.from({ length: 6 }).map((_, idx) => (
        <TextInput
          key={idx}
          ref={(ref) => {
            if (ref) inputsRef.current[idx] = ref;
          }}
          style={styles.input}
          placeholder="-"
          placeholderTextColor="#94A3B8"
          maxLength={1}
          keyboardType="number-pad"
          value={otpArray[idx] || ''}
          onChangeText={(txt) => handleChange(txt, idx)}
          onKeyPress={(e) => handleKeyPress(e, idx)}
          textAlign="center"
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
    gap: 8,
  },
  input: {
    width: 44,
    height: 52,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '800',
  },
});
