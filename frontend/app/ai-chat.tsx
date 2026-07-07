import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform,
  Animated, FlatList, ActivityIndicator, Dimensions,
  Alert, Modal, Pressable,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Colors, SPACING } from '@/constants/Theme';
import {
  Send, Bot, ArrowLeft,
  Sparkles, Plus, Trash2, Edit3,
  MessageCircle, MoreVertical,
  CheckCheck, ChevronRight, X,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChatService, Conversation, ChatMessage } from '@/services/chatService';
import { useAuth } from '@/context/AuthContext';

const { width } = Dimensions.get('window');

/* ═══════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════ */
interface UIMessage {
  id: string;
  text: string;
  sender: 'ai' | 'user';
  timestamp: Date;
}

/* ═══════════════════════════════════════════════════
   Smooth Message Entrance Animation
   ═══════════════════════════════════════════════════ */
function FadeInMessage({ children }: { children: React.ReactNode }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1, duration: 250, useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0, duration: 250, useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      {children}
    </Animated.View>
  );
}

/* ═══════════════════════════════════════════════════
   Main Screen — Two Modes
   ═══════════════════════════════════════════════════ */
export default function AIChatScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // View mode: 'list' = conversation list, 'chat' = active conversation
  const [mode, setMode] = useState<'list' | 'chat'>('list');
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeChatTitle, setActiveChatTitle] = useState('New Chat');

  // Conversation list state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [errorConversations, setErrorConversations] = useState<string | null>(null);

  // Active chat state
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [errorMessages, setErrorMessages] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Rename modal state
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [renameTarget, setRenameTarget] = useState<Conversation | null>(null);
  const [renameText, setRenameText] = useState('');

  // Context menu state
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuTarget, setMenuTarget] = useState<Conversation | null>(null);

  /* ── Load Conversations ── */
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

  /* ── Open a Conversation ── */
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

  /* ── New Chat ── */
  const handleNewChat = async () => {
    try {
      const conv = await ChatService.createConversation();
      setActiveChatId(conv._id);
      setActiveChatTitle(conv.title);
      setMessages([]);
      setMode('chat');
      // Refresh list in background
      loadConversations();
    } catch (err) {
      if (__DEV__) console.error('Failed to create conversation:', err);
      Alert.alert('Error', 'Failed to create new chat');
    }
  };

  /* ── Delete Chat ── */
  const handleDelete = (conv: Conversation) => {
    setMenuVisible(false);
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

  /* ── Rename Chat ── */
  const handleRenameStart = (conv: Conversation) => {
    setMenuVisible(false);
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

  /* ── Send Message ── */
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

      // Update chatId if this was a new conversation
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

  /* ── Go Back ── */
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

  /* ── Auto Scroll ── */
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 120);
    }
  }, [messages, isTyping]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {mode === 'list' ? (
        /* ════════════════════════════════════════
           MODE 1: Conversation List
           ════════════════════════════════════════ */
        <View style={{ flex: 1 }}>
          {/* Header */}
          <View style={[styles.listHeader, { paddingTop: insets.top + SPACING.xs }]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <ArrowLeft size={22} color={Colors.text} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.listHeaderTitle}>AI Coach</Text>
              <Text style={styles.listHeaderSub}>Your fitness conversations</Text>
            </View>
            <View style={styles.headerBotIcon}>
              <LinearGradient
                colors={[Colors.primary, Colors.secondary]}
                style={styles.headerBotGrad}
              >
                <Bot size={18} color="#FFF" />
              </LinearGradient>
            </View>
          </View>

          {/* Conversation List */}
          {loadingConversations ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          ) : errorConversations ? (
            <View style={styles.centerContainer}>
              <Text style={{ color: '#FF4B4B', fontSize: 14, fontWeight: '700', textAlign: 'center', marginBottom: 12 }}>{errorConversations}</Text>
              <TouchableOpacity 
                onPress={loadConversations} 
                style={{ backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 }}
              >
                <Text style={{ color: '#000', fontWeight: '900', fontSize: 13 }}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : conversations.length === 0 ? (
            /* Empty State */
            <View style={styles.centerContainer}>
              <View style={styles.emptyIconCircle}>
                <LinearGradient
                  colors={[Colors.primary + '20', Colors.secondary + '20']}
                  style={styles.emptyGrad}
                >
                  <Sparkles size={42} color={Colors.primary} />
                </LinearGradient>
              </View>
              <Text style={styles.emptyTitle}>Start a Conversation</Text>
              <Text style={styles.emptySubtitle}>
                Tap the + button to chat with your AI Fitness Coach
              </Text>
              <View style={styles.emptyTips}>
                <Text style={styles.emptyTipText}>💪 "Create a 4-day workout split"</Text>
                <Text style={styles.emptyTipText}>🥗 "Plan a high-protein meal prep"</Text>
                <Text style={styles.emptyTipText}>📊 "Analyze my BMI and suggest goals"</Text>
                <Text style={styles.emptyTipText}>🏠 "Design a home workout routine"</Text>
              </View>
            </View>
          ) : (
            <FlatList
              data={conversations}
              keyExtractor={item => item._id}
              contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 100 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.convCard}
                  onPress={() => openConversation(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.convIconWrap}>
                    <LinearGradient
                      colors={[Colors.primary + '30', Colors.secondary + '30']}
                      style={styles.convIconGrad}
                    >
                      <MessageCircle size={18} color={Colors.primary} />
                    </LinearGradient>
                  </View>
                  <View style={styles.convContent}>
                    <Text style={styles.convTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.convPreview} numberOfLines={1}>{item.preview}</Text>
                  </View>
                  <View style={styles.convRight}>
                    <Text style={styles.convTime}>
                      {formatRelativeTime(item.lastMessageAt)}
                    </Text>
                    <TouchableOpacity
                      style={styles.convMenuBtn}
                      onPress={() => { setMenuTarget(item); setMenuVisible(true); }}
                    >
                      <MoreVertical size={16} color={Colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}

          {/* Floating New Chat Button */}
          <TouchableOpacity
            style={[styles.fab, { bottom: insets.bottom + 24 }]}
            onPress={handleNewChat}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.secondary]}
              style={styles.fabGrad}
            >
              <Plus size={26} color="#FFF" strokeWidth={2.5} />
            </LinearGradient>
          </TouchableOpacity>

          {/* Context Menu Modal */}
          <Modal
            visible={menuVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setMenuVisible(false)}
          >
            <Pressable style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
              <View style={styles.menuCard}>
                <Text style={styles.menuTitle} numberOfLines={1}>
                  {menuTarget?.title}
                </Text>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => menuTarget && handleRenameStart(menuTarget)}
                >
                  <Edit3 size={18} color={Colors.primary} />
                  <Text style={styles.menuItemText}>Rename</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => menuTarget && handleDelete(menuTarget)}
                >
                  <Trash2 size={18} color={Colors.error} />
                  <Text style={[styles.menuItemText, { color: Colors.error }]}>Delete</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.menuItem, styles.menuCancel]}
                  onPress={() => setMenuVisible(false)}
                >
                  <X size={18} color={Colors.textSecondary} />
                  <Text style={[styles.menuItemText, { color: Colors.textSecondary }]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Modal>

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
                  placeholderTextColor={Colors.textSecondary}
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
                      colors={[Colors.primary, Colors.secondary]}
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
        /* ════════════════════════════════════════
           MODE 2: Active Chat
           ════════════════════════════════════════ */
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          {/* Chat Header */}
          <View style={[styles.chatHeader, { paddingTop: insets.top + SPACING.xs }]}>
            <View style={styles.chatHeaderLeft}>
              <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
                <ArrowLeft size={22} color={Colors.text} />
              </TouchableOpacity>
              <View style={styles.avatarWrap}>
                <LinearGradient
                  colors={[Colors.primary, Colors.secondary]}
                  style={styles.avatarGrad}
                >
                  <Bot size={20} color="#FFF" />
                </LinearGradient>
                <View style={styles.onlineBadge} />
              </View>
              <View style={styles.nameContainer}>
                <Text style={styles.chatHeaderTitle} numberOfLines={1}>
                  {activeChatTitle}
                </Text>
                <Text style={[styles.chatHeaderStatus, isTyping && styles.typingTextGreen]}>
                  {isTyping ? 'typing...' : 'Online • FitAI'}
                </Text>
              </View>
            </View>
          </View>

          {/* Messages */}
          {loadingMessages ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          ) : errorMessages ? (
            <View style={styles.centerContainer}>
              <Text style={{ color: '#FF4B4B', fontSize: 14, fontWeight: '700', textAlign: 'center', marginBottom: 12 }}>{errorMessages}</Text>
              <TouchableOpacity 
                onPress={() => activeChatId && openConversation({ _id: activeChatId, title: activeChatTitle } as any)} 
                style={{ backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 }}
              >
                <Text style={{ color: '#000', fontWeight: '900', fontSize: 13 }}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : messages.length === 0 ? (
            <View style={styles.centerContainer}>
              <View style={styles.emptyIconCircle}>
                <LinearGradient
                  colors={[Colors.primary + '20', Colors.secondary + '20']}
                  style={styles.emptyGrad}
                >
                  <Sparkles size={42} color={Colors.primary} />
                </LinearGradient>
              </View>
              <Text style={styles.emptyTitle}>FitAI Coach</Text>
              <Text style={styles.emptySubtitle}>Ask anything about fitness</Text>
              <View style={styles.emptyTips}>
                <Text style={styles.emptyTipText}>💪 "Plan a strength workout for today"</Text>
                <Text style={styles.emptyTipText}>🥗 "What foods are high in protein?"</Text>
                <Text style={styles.emptyTipText}>📊 "How many calories should I eat?"</Text>
              </View>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.chatContent}
              renderItem={({ item }) => (
                <FadeInMessage>
                  <MessageBubble message={item} />
                </FadeInMessage>
              )}
              ListFooterComponent={() => isTyping ? (
                <FadeInMessage>
                  <TypingIndicator />
                </FadeInMessage>
              ) : null}
            />
          )}

          {/* Input Bar */}
          <View style={[styles.inputBar, { paddingBottom: insets.bottom + 12 }]}>
            <View style={styles.inputRow}>
              <View style={styles.inputInner}>
                <TextInput
                  style={styles.input}
                  placeholder="Ask FitAI..."
                  placeholderTextColor={Colors.textSecondary}
                  value={input}
                  onChangeText={setInput}
                  multiline
                  maxLength={500}
                  onSubmitEditing={handleSend}
                />
              </View>
              <TouchableOpacity
                style={[styles.sendCircleBtn, !input.trim() && styles.sendCircleDisabled]}
                onPress={handleSend}
                disabled={!input.trim() || isTyping}
              >
                <LinearGradient
                  colors={input.trim() ? [Colors.primary, Colors.secondary] : [Colors.border, Colors.border]}
                  style={styles.sendCircleGrad}
                >
                  <Send size={18} color={input.trim() ? '#FFF' : Colors.textSecondary} strokeWidth={2.5} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

/* ═══════════════════════════════════════════════════
   Message Bubble Component
   ═══════════════════════════════════════════════════ */
function MessageBubble({ message }: { message: UIMessage }) {
  const isAI = message.sender === 'ai';
  return (
    <View style={[styles.bubbleWrap, isAI ? styles.aiWrap : styles.userWrap]}>
      <View style={[styles.bubble, isAI ? styles.aiBubble : styles.userBubble]}>
        <Text style={[styles.bubbleText, isAI ? styles.aiText : styles.userText]}>
          {message.text}
        </Text>
        <View style={styles.metaRow}>
          <Text style={[styles.timeText, !isAI && { color: 'rgba(255,255,255,0.5)' }]}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
          {!isAI && (
            <CheckCheck size={13} color="rgba(255,255,255,0.5)" style={styles.ticks} />
          )}
        </View>
      </View>
    </View>
  );
}

/* ═══════════════════════════════════════════════════
   Typing Indicator with Bouncing Dots
   ═══════════════════════════════════════════════════ */
function TypingIndicator() {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animate = (val: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(val, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
          Animated.timing(val, { toValue: 0.3, duration: 400, useNativeDriver: true }),
        ])
      ).start();
    };
    animate(dot1, 0);
    animate(dot2, 200);
    animate(dot3, 400);
  }, []);

  return (
    <View style={[styles.bubbleWrap, styles.aiWrap]}>
      <View style={[styles.bubble, styles.aiBubble, styles.typingBubble]}>
        <Animated.View style={[styles.dot, { opacity: dot1 }]} />
        <Animated.View style={[styles.dot, { opacity: dot2 }]} />
        <Animated.View style={[styles.dot, { opacity: dot3 }]} />
      </View>
    </View>
  );
}

/* ═══════════════════════════════════════════════════
   Utility: Relative Time Formatting
   ═══════════════════════════════════════════════════ */
function formatRelativeTime(dateStr: string): string {
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
}

/* ═══════════════════════════════════════════════════
   Styles
   ═══════════════════════════════════════════════════ */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  /* ── List Header ── */
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    backgroundColor: Colors.card,
  },
  listHeaderTitle: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  listHeaderSub: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  headerBotIcon: {
    marginLeft: 12,
  },
  headerBotGrad: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* ── Conversation Cards ── */
  convCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  convIconWrap: {
    marginRight: 12,
  },
  convIconGrad: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  convContent: {
    flex: 1,
    marginRight: 8,
  },
  convTitle: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 3,
  },
  convPreview: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  convRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  convTime: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  convMenuBtn: {
    padding: 4,
  },

  /* ── FAB ── */
  fab: {
    position: 'absolute',
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    elevation: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  fabGrad: {
    width: '100%',
    height: '100%',
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* ── Context Menu Modal ── */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 20,
    width: width * 0.75,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  menuTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 16,
    textAlign: 'center',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    gap: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  menuItemText: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  menuCancel: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 16,
  },

  /* ── Rename Modal ── */
  renameCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 24,
    width: width * 0.85,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  renameTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
  },
  renameInput: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: Colors.text,
    fontSize: 15,
    fontWeight: '500',
    borderWidth: 1.5,
    borderColor: Colors.border,
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
    borderWidth: 1,
    borderColor: Colors.border,
  },
  renameCancelText: {
    color: Colors.textSecondary,
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
    borderRadius: 12,
  },
  renameConfirmText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },

  /* ── Chat Header ── */
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    backgroundColor: Colors.card,
  },
  chatHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backBtn: {
    padding: 8,
    marginRight: 2,
  },
  avatarWrap: {
    position: 'relative',
    marginRight: 10,
  },
  avatarGrad: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00FF85',
    borderWidth: 1.5,
    borderColor: Colors.card,
  },
  nameContainer: {
    justifyContent: 'center',
    flex: 1,
  },
  chatHeaderTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  chatHeaderStatus: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  typingTextGreen: {
    color: '#00FF85',
  },

  /* ── Center / Empty State ── */
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    overflow: 'hidden',
    marginBottom: 20,
  },
  emptyGrad: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  emptySubtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 28,
    textAlign: 'center',
  },
  emptyTips: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 18,
    width: '100%',
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyTipText: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.85,
  },

  /* ── Chat Feed ── */
  chatContent: { padding: 16, paddingBottom: 32 },

  /* ── Chat Bubbles ── */
  bubbleWrap: { flexDirection: 'row', marginBottom: 14, maxWidth: '82%' },
  aiWrap: { alignSelf: 'flex-start' },
  userWrap: { alignSelf: 'flex-end' },
  bubble: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 6,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  aiBubble: {
    backgroundColor: Colors.card,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  userBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '500',
  },
  aiText: { color: Colors.text },
  userText: { color: '#FFF' },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    gap: 4,
  },
  timeText: {
    fontSize: 9,
    opacity: 0.5,
    fontWeight: '700',
  },
  ticks: {
    opacity: 0.65,
  },

  /* ── Typing Dots ── */
  typingBubble: {
    flexDirection: 'row',
    gap: 4,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },

  /* ── Input Bar ── */
  inputBar: {
    paddingHorizontal: 10,
    paddingTop: 8,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  inputInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: Colors.card,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  input: {
    flex: 1,
    color: Colors.text,
    fontSize: 16,
    maxHeight: 100,
    paddingTop: 10,
    paddingBottom: 10,
    fontWeight: '500',
  },
  sendCircleBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  sendCircleDisabled: {
    opacity: 0.5,
  },
  sendCircleGrad: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
