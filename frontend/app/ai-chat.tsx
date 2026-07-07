import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, StyleSheet, KeyboardAvoidingView, Platform, FlatList,
  ActivityIndicator, Alert, Modal, Pressable, TextInput, Text, TouchableOpacity
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChatService, Conversation, ChatMessage } from '@/services/chatService';
import { useAuth } from '@/context/AuthContext';

// Extracted Conversational Components
import ChatHeader from '@/components/chat/ChatHeader';
import ConversationCard from '@/components/chat/ConversationCard';
import EmptyChatState from '@/components/chat/EmptyChatState';
import MessageBubble from '@/components/chat/MessageBubble';
import ChatInput from '@/components/chat/ChatInput';
import TypingIndicator from '@/components/chat/TypingIndicator';

interface UIMessage {
  id: string;
  text: string;
  sender: 'ai' | 'user';
  timestamp: Date;
}

export default function AIChatScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [mode, setMode] = useState<'list' | 'chat'>('list');
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeChatTitle, setActiveChatTitle] = useState('New Chat');

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [errorConversations, setErrorConversations] = useState<string | null>(null);

  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [errorMessages, setErrorMessages] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [renameTarget, setRenameTarget] = useState<Conversation | null>(null);
  const [renameText, setRenameText] = useState('');

  const loadConversations = useCallback(async () => {
    setErrorConversations(null);
    try {
      setLoadingConversations(true);
      const data = await ChatService.getConversations();
      setConversations(data);
    } catch (err: any) {
      if (__DEV__) console.error('Failed to load conversations:', err);
      setErrorConversations(err.message || 'Failed to load conversations.');
    } finally {
      setLoadingConversations(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const openConversation = async (conv: Conversation) => {
    setActiveChatId(conv._id);
    setActiveChatTitle(conv.title);
    setMode('chat');
    setLoadingMessages(true);
    setErrorMessages(null);

    try {
      const data = await ChatService.getHistory(conv._id);
      if (data && data.messages) {
        const formatted: UIMessage[] = data.messages.map((m: ChatMessage, i: number) => ({
          id: m._id || `${i}-${Date.now()}`,
          text: m.text,
          sender: m.role,
          timestamp: new Date(m.timestamp || Date.now()),
        }));
        setMessages(formatted);
      } else {
        setMessages([]);
      }
    } catch (err: any) {
      if (__DEV__) console.error('Failed to load conversation:', err);
      setErrorMessages(err.message || 'Failed to load messages.');
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleNewChat = async () => {
    try {
      const conv = await ChatService.createConversation();
      setActiveChatId(conv._id);
      setActiveChatTitle(conv.title);
      setMessages([]);
      setMode('chat');
      loadConversations();
    } catch (err) {
      if (__DEV__) console.error('Failed to create conversation:', err);
      Alert.alert('Error', 'Failed to create new chat');
    }
  };

  const handleDelete = (conv: Conversation) => {
    Alert.alert(
      'Delete Chat',
      `Delete "${conv.title}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            try {
              await ChatService.deleteConversation(conv._id);
              setConversations(prev => prev.filter(c => c._id !== conv._id));
              if (activeChatId === conv._id) {
                setMode('list');
                setActiveChatId(null);
              }
            } catch (err) {
              if (__DEV__) console.error('Failed to delete conversation:', err);
              Alert.alert('Error', 'Failed to delete conversation');
            }
          },
        },
      ],
    );
  };

  const handleRenameStart = (conv: Conversation) => {
    setRenameTarget(conv);
    setRenameText(conv.title);
    setRenameModalVisible(true);
  };

  const handleRenameConfirm = async () => {
    if (!renameTarget || !renameText.trim()) return;
    try {
      await ChatService.renameConversation(renameTarget._id, renameText.trim());
      setConversations(prev =>
        prev.map(c => c._id === renameTarget._id ? { ...c, title: renameText.trim() } : c)
      );
      if (activeChatId === renameTarget._id) {
        setActiveChatTitle(renameText.trim());
      }
    } catch (err) {
      if (__DEV__) console.error('Failed to rename conversation:', err);
      Alert.alert('Error', 'Failed to rename conversation');
    } finally {
      setRenameModalVisible(false);
      setRenameTarget(null);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const currentInput = input.trim();
    const userMsg: UIMessage = {
      id: Date.now().toString(),
      text: currentInput,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const result = await ChatService.sendMessage(currentInput, activeChatId || undefined);

      if (!activeChatId && result.chatId) {
        setActiveChatId(result.chatId);
        setActiveChatTitle(result.title || currentInput.substring(0, 40));
      }

      const aiMsg: UIMessage = {
        id: (Date.now() + 1).toString(),
        text: result.reply,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error: any) {
      if (__DEV__) console.error('Failed to get AI response:', error);
      const errorMsg: UIMessage = {
        id: (Date.now() + 1).toString(),
        text: error?.message || 'AI is currently unavailable. Please try again.',
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handlePromptClick = async (promptText: string) => {
    if (isTyping) return;
    const userMsg: UIMessage = {
      id: Date.now().toString(),
      text: promptText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const result = await ChatService.sendMessage(promptText, activeChatId || undefined);

      if (!activeChatId && result.chatId) {
        setActiveChatId(result.chatId);
        setActiveChatTitle(result.title || promptText.substring(0, 40));
      }

      const aiMsg: UIMessage = {
        id: (Date.now() + 1).toString(),
        text: result.reply,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error: any) {
      if (__DEV__) console.error('Failed to get AI response:', error);
      const errorMsg: UIMessage = {
        id: (Date.now() + 1).toString(),
        text: error?.message || 'AI is currently unavailable. Please try again.',
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleBack = () => {
    if (mode === 'chat') {
      setMode('list');
      setActiveChatId(null);
      setMessages([]);
      loadConversations();
    } else {
      router.back();
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 120);
    }
  }, [messages, isTyping]);

  const formatRelativeTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return 'now';
    if (diffMin < 60) return `${diffMin}m`;
    if (diffHr < 24) return `${diffHr}h`;
    if (diffDay < 7) return `${diffDay}d`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {mode === 'list' ? (
        /* Conversation History list view */
        <View style={{ flex: 1 }}>
          <ChatHeader 
            title="FitAI Coach" 
            showBack
            onBackPress={() => router.back()}
            showNewChat
            onNewChatPress={handleNewChat}
          />

          {loadingConversations ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#7C4DFF" />
            </View>
          ) : errorConversations ? (
            <View style={styles.centerContainer}>
              <Text style={styles.errorText}>{errorConversations}</Text>
              <TouchableOpacity onPress={loadConversations} style={styles.retryBtn}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : conversations.length === 0 ? (
            <EmptyChatState onPromptPress={handlePromptClick} />
          ) : (
            <FlatList
              data={conversations}
              keyExtractor={item => item._id}
              contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: insets.bottom + 100 }}
              renderItem={({ item }) => (
                <ConversationCard
                  title={item.title}
                  preview={item.preview}
                  timestamp={formatRelativeTime(item.lastMessageAt)}
                  onPress={() => openConversation(item)}
                  onRenamePress={() => handleRenameStart(item)}
                  onDeletePress={() => handleDelete(item)}
                />
              )}
            />
          )}

          {/* Rename Modal */}
          <Modal
            visible={renameModalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setRenameModalVisible(false)}
          >
            <Pressable style={styles.modalOverlay} onPress={() => setRenameModalVisible(false)}>
              <Pressable style={styles.renameCard} onPress={() => {}}>
                <Text style={styles.renameTitle}>Rename Chat</Text>
                <TextInput
                  style={styles.renameInput}
                  value={renameText}
                  onChangeText={setRenameText}
                  placeholder="Enter new name..."
                  placeholderTextColor="#94A3B8"
                  autoFocus
                  maxLength={50}
                />
                <View style={styles.renameButtons}>
                  <TouchableOpacity
                    style={styles.renameCancelBtn}
                    onPress={() => setRenameModalVisible(false)}
                  >
                    <Text style={styles.renameCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.renameConfirmBtn}
                    onPress={handleRenameConfirm}
                  >
                    <LinearGradient
                      colors={['#7C4DFF', '#BD00FF']}
                      style={styles.renameConfirmGrad}
                    >
                      <Text style={styles.renameConfirmText}>Save</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </Pressable>
            </Pressable>
          </Modal>
        </View>
      ) : (
        /* Active conversational view */
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ChatHeader 
            title={activeChatTitle} 
            showBack
            onBackPress={handleBack}
            subtitle={isTyping ? 'typing...' : 'Online • FitAI'}
          />

          {loadingMessages ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#7C4DFF" />
            </View>
          ) : errorMessages ? (
            <View style={styles.centerContainer}>
              <Text style={styles.errorText}>{errorMessages}</Text>
              <TouchableOpacity 
                onPress={() => activeChatId && openConversation({ _id: activeChatId, title: activeChatTitle } as any)} 
                style={styles.retryBtn}
              >
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : messages.length === 0 ? (
            <EmptyChatState onPromptPress={handlePromptClick} />
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.chatContent}
              renderItem={({ item }) => (
                <MessageBubble message={item} />
              )}
              ListFooterComponent={() => isTyping ? <TypingIndicator /> : null}
            />
          )}

          <ChatInput 
            value={input}
            onChangeText={setInput}
            onSend={handleSend}
            disabled={isTyping}
            activeColor="#7C4DFF"
          />
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    color: '#FF4D4D',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryBtn: {
    backgroundColor: '#7C4DFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  chatContent: {
    padding: 16,
    paddingBottom: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  renameCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '85%',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
  },
  renameTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
  },
  renameInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '600',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  renameButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  renameCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  renameCancelText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '700',
  },
  renameConfirmBtn: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  renameConfirmGrad: {
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  renameConfirmText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
