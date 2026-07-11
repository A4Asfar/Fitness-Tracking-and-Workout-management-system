import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MessageSquare, Trash2, Edit3 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ConversationCardProps {
  title: string;
  preview: string;
  timestamp: string;
  onPress: () => void;
  onRenamePress: () => void;
  onDeletePress: () => void;
}

export default function ConversationCard({
  title,
  preview,
  timestamp,
  onPress,
  onRenamePress,
  onDeletePress
}: ConversationCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={styles.card}
    >
      <View style={styles.iconWrap}>
        <LinearGradient
          colors={['#10B98120', '#BD00FF04']}
          style={styles.iconGrad}
        >
          <MessageSquare size={18} color="#10B981" />
        </LinearGradient>
      </View>

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <Text style={styles.time}>{timestamp}</Text>
        </View>
        <Text style={styles.preview} numberOfLines={1}>
          {preview || 'No messages yet...'}
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity onPress={onRenamePress} style={styles.actionBtn} activeOpacity={0.7}>
          <Edit3 size={14} color="#64748B" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onDeletePress} style={styles.actionBtn} activeOpacity={0.7}>
          <Trash2 size={14} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  iconWrap: {
    marginRight: 12,
  },
  iconGrad: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginRight: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { flexShrink: 1, 
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '800',
    flex: 1,
    marginRight: 8,
  },
  time: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
  },
  preview: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 6,
  },
  actionBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
});
