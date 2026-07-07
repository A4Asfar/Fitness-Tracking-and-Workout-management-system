import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Keyboard } from 'react-native';
import { Send, Paperclip, Mic } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ChatInputProps {
  value: string;
  onChangeText: (v: string) => void;
  onSend: () => void;
  disabled?: boolean;
  activeColor?: string;
}

export default function ChatInput({
  value,
  onChangeText,
  onSend,
  disabled = false,
  activeColor = '#7C4DFF'
}: ChatInputProps) {
  const hasText = value.trim().length > 0;

  const handleSendPress = () => {
    onSend();
    Keyboard.dismiss();
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <View style={styles.inputCard}>
          {/* Future attachment button */}
          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
            <Paperclip size={18} color="#64748B" />
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Type your message..."
            placeholderTextColor="#94A3B8"
            value={value}
            onChangeText={onChangeText}
            multiline
            maxLength={1000}
            selectionColor={activeColor}
          />

          {/* Future voice note button */}
          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
            <Mic size={18} color="#64748B" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handleSendPress}
          disabled={!hasText || disabled}
          activeOpacity={0.85}
          style={[styles.sendBtn, !hasText && styles.sendBtnDisabled]}
        >
          <LinearGradient
            colors={hasText ? [activeColor, activeColor + 'CC'] : ['#E2E8F0', '#E2E8F0']}
            style={styles.sendGrad}
          >
            <Send size={18} color={hasText ? '#FFFFFF' : '#94A3B8'} strokeWidth={2.5} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1.5,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  inputCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  input: {
    flex: 1,
    color: '#0F172A',
    fontSize: 15,
    maxHeight: 120,
    paddingTop: 10,
    paddingBottom: 10,
    fontWeight: '500',
    marginHorizontal: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  sendBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  sendBtnDisabled: {
    opacity: 0.8,
  },
  sendGrad: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
