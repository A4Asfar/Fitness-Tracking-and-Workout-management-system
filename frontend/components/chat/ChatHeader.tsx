import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ArrowLeft, Plus, MoreVertical } from 'lucide-react-native';
import AIAvatar from './AIAvatar';

interface ChatHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  showNewChat?: boolean;
  onNewChatPress?: () => void;
  showMenu?: boolean;
  onMenuPress?: () => void;
}

export default function ChatHeader({
  title,
  subtitle = "Your AI Fitness Coach",
  showBack = false,
  onBackPress,
  showNewChat = false,
  onNewChatPress,
  showMenu = false,
  onMenuPress
}: ChatHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.leftRow}>
        {showBack && onBackPress && (
          <TouchableOpacity onPress={onBackPress} style={styles.backBtn} activeOpacity={0.7}>
            <ArrowLeft size={22} color="#0F172A" />
          </TouchableOpacity>
        )}
        <AIAvatar />
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        {showNewChat && onNewChatPress && (
          <TouchableOpacity onPress={onNewChatPress} style={styles.newChatBtn} activeOpacity={0.8}>
            <Plus size={16} color="#7C4DFF" strokeWidth={2.5} style={{ marginRight: 4 }} />
            <Text style={styles.newChatText}>New</Text>
          </TouchableOpacity>
        )}
        {showMenu && onMenuPress && (
          <TouchableOpacity onPress={onMenuPress} style={styles.menuBtn} activeOpacity={0.7}>
            <MoreVertical size={20} color="#475569" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1.5,
    borderBottomColor: '#E2E8F0',
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backBtn: {
    padding: 6,
    marginRight: 10,
    marginLeft: -6,
  },
  titleContainer: {
    marginLeft: 12,
    flex: 1,
  },
  title: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '800',
  },
  subtitle: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  newChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D8B4FE',
  },
  newChatText: {
    color: '#7C4DFF',
    fontSize: 12,
    fontWeight: '800',
  },
  menuBtn: {
    padding: 6,
  },
});
