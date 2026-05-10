import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform,
  Animated, FlatList, ActivityIndicator
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Colors, SharedStyles, SPACING } from '@/constants/Theme';
import { 
  Send, Bot, User, ArrowLeft, 
  Sparkles, Zap, Dumbbell, Apple, Droplets 
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChatService } from '@/services/chatService';

interface Message {
  id: string;
  text: string;
  sender: 'ai' | 'user';
  timestamp: Date;
}

export default function AIChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your AI Fitness Assistant. Ask me anything about workouts, nutrition, or recovery!",
      sender: 'ai',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);

  // Load history on mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await ChatService.getHistory();
        if (history && history.length > 0) {
          const formatted = history.reverse().map((h: any) => ([
            {
              id: `q-${h._id}`,
              text: h.question,
              sender: 'user',
              timestamp: new Date(h.timestamp),
            },
            {
              id: `r-${h._id}`,
              text: h.response,
              sender: 'ai',
              timestamp: new Date(h.timestamp),
            }
          ])).flat();
          setMessages(prev => [...prev, ...formatted]);
        }
      } catch (err) {
        console.error('Failed to load chat history:', err);
      }
    };
    fetchHistory();
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    const currentInput = input.trim();
    const userMsg: Message = {
      id: Date.now().toString(),
      text: currentInput,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    
    // Simulate AI thinking
    setIsTyping(true);
    try {
      // Get response from backend
      const chatRecord = await ChatService.sendMessage(currentInput);
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: chatRecord.response,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Failed to get AI response:', error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble connecting to the training center. Please try again in a moment!",
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages, isTyping]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <LinearGradient
          colors={[Colors.primary + '15', 'transparent']}
          style={StyleSheet.absoluteFill}
        />
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <View style={styles.botIconWrap}>
            <Bot size={20} color={Colors.primary} />
          </View>
          <View>
            <Text style={styles.headerTitle}>AI Assistant</Text>
            <Text style={styles.headerStatus}>Online & Ready</Text>
          </View>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.chatContent}
          renderItem={({ item }) => <MessageBubble message={item} />}
          ListFooterComponent={() => isTyping ? <TypingIndicator /> : null}
        />

        {/* ── Input Bar ── */}
        <View style={[styles.inputBar, { paddingBottom: insets.bottom + 12 }]}>
          <View style={styles.inputInner}>
            <TextInput
              style={styles.input}
              placeholder="Ask about fitness, food, water..."
              placeholderTextColor={Colors.textSecondary}
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={200}
            />
            <TouchableOpacity 
              style={[styles.sendBtn, !input.trim() && { opacity: 0.5 }]}
              onPress={handleSend}
              disabled={!input.trim() || isTyping}
            >
              <LinearGradient
                colors={[Colors.primary, '#9FE800']}
                style={styles.sendGrad}
              >
                <Send size={18} color="#000" strokeWidth={2.5} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isAI = message.sender === 'ai';
  return (
    <View style={[styles.bubbleWrap, isAI ? styles.aiWrap : styles.userWrap]}>
      {isAI && (
        <View style={styles.miniBotIcon}>
          <Bot size={12} color={Colors.primary} />
        </View>
      )}
      <View style={[styles.bubble, isAI ? styles.aiBubble : styles.userBubble]}>
        <Text style={[styles.bubbleText, isAI ? styles.aiText : styles.userText]}>
          {message.text}
        </Text>
        <Text style={styles.timeText}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );
}

function TypingIndicator() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (val: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(val, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
          Animated.timing(val, { toValue: 0, duration: 400, useNativeDriver: true }),
        ])
      ).start();
    };
    animate(dot1, 0);
    animate(dot2, 200);
    animate(dot3, 400);
  }, []);

  return (
    <View style={[styles.bubbleWrap, styles.aiWrap]}>
      <View style={styles.miniBotIcon}>
        <Bot size={12} color={Colors.primary} />
      </View>
      <View style={[styles.bubble, styles.aiBubble, styles.typingBubble]}>
        <Animated.View style={[styles.dot, { opacity: dot1 }]} />
        <Animated.View style={[styles.dot, { opacity: dot2 }]} />
        <Animated.View style={[styles.dot, { opacity: dot3 }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingBottom: 15,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: Colors.card, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  headerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: 15, gap: 12 },
  botIconWrap: { 
    width: 38, height: 38, borderRadius: 12, 
    backgroundColor: Colors.primary + '15', 
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: Colors.primary + '30',
  },
  headerTitle: { color: Colors.text, fontSize: 16, fontWeight: '900', letterSpacing: -0.3 },
  headerStatus: { color: Colors.primary, fontSize: 11, fontWeight: '700', marginTop: 1 },

  chatContent: { padding: 20, paddingBottom: 40 },
  bubbleWrap: { flexDirection: 'row', marginBottom: 20, maxWidth: '85%' },
  aiWrap: { alignSelf: 'flex-start', gap: 8 },
  userWrap: { alignSelf: 'flex-end', justifyContent: 'flex-end' },
  miniBotIcon: { 
    width: 24, height: 24, borderRadius: 8, 
    backgroundColor: Colors.card, justifyContent: 'center', alignItems: 'center',
    marginTop: 10, borderWidth: 1, borderColor: Colors.border,
  },
  bubble: { padding: 16, borderRadius: 22, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  aiBubble: { backgroundColor: Colors.card, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: Colors.border },
  userBubble: { backgroundColor: Colors.primary, borderBottomRightRadius: 4 },
  bubbleText: { fontSize: 15, lineHeight: 22, fontWeight: '500' },
  aiText: { color: Colors.text },
  userText: { color: '#000' },
  timeText: { fontSize: 9, opacity: 0.5, marginTop: 6, textAlign: 'right', fontWeight: '700' },

  typingBubble: { flexDirection: 'row', gap: 4, paddingVertical: 18, paddingHorizontal: 16 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary },

  inputBar: { 
    paddingHorizontal: 20, paddingTop: 12, 
    backgroundColor: Colors.background, 
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' 
  },
  inputInner: { 
    flexDirection: 'row', alignItems: 'flex-end', 
    backgroundColor: Colors.card, borderRadius: 24, 
    paddingHorizontal: 16, paddingVertical: 8,
    borderWidth: 1.5, borderColor: Colors.border,
  },
  input: { 
    flex: 1, color: Colors.text, fontSize: 15, 
    maxHeight: 100, paddingTop: 10, paddingBottom: 10,
    fontWeight: '500',
  },
  sendBtn: { marginLeft: 12, marginBottom: 4 },
  sendGrad: { 
    width: 44, height: 44, borderRadius: 22, 
    justifyContent: 'center', alignItems: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8,
  },
});
