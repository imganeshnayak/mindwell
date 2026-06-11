import { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, ArrowUp } from 'lucide-react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { fetchAIResponse, buildSystemPrompt } from '@/utils/aiClient';
import { getGuideSettings, subscribeToSettings } from '@/utils/guideSettings';
import { detectMood, MOOD_ICONS, Mood } from '@/utils/moodDetector';
import { getIdleTimeout, getProactivePrompt } from '@/utils/proactiveMessages';
import WellnessActionCard, { ActionType } from '@/components/WellnessActionCard';

// ─── Types ───────────────────────────────────────────────────────────────────

type MessageFrom = 'ai' | 'user';

interface ChatMessage {
  id: string;
  text: string;
  from: MessageFrom;
  timestamp: string;
}

interface ActionMessage {
  id: string;
  from: 'action';
  actionType: ActionType;
  timestamp: string;
}

type Message = ChatMessage | ActionMessage;

// ─── Constants ───────────────────────────────────────────────────────────────

const API_KEY = 'freellmapi-69ff287cd06690047ae31fca8f5d1b424ae932e1edc85c87';
const API_WINDOW = 12; // Max messages sent to AI per request
const WORDS_PER_MIN = 40; // Simulated human typing speed
const MAX_TYPING_DELAY = 3500; // Cap typing delay at 3.5 seconds per bubble

// Action tag that the AI appends to trigger wellness cards
const ACTION_PATTERN = /\[ACTION:(BREATHING|STRETCH)\]/i;

// Context-aware quick reply chips
function getQuickReplies(settings: ReturnType<typeof getGuideSettings>): string[] {
  const hour = new Date().getHours();
  const isMorning = hour >= 5 && hour < 12;
  const isEvening = hour >= 17;

  const chips: string[] = [];

  if (isMorning) {
    chips.push("Good morning! How do I start my day?", "Set an intention with me");
  } else if (isEvening) {
    chips.push("Help me wind down tonight", "Let's reflect on my day");
  } else {
    chips.push("How am I doing today?", "I need some motivation");
  }

  if (settings.focus.includes('Better Sleep')) chips.push("I need sleep tips");
  if (settings.focus.includes('Stress Relief')) chips.push("I'm feeling stressed");
  if (settings.focus.includes('Daily Movement')) chips.push("Motivate me to move");
  if (settings.focus.includes('Mindful Breathing')) chips.push("Let's do breathing");

  return chips.slice(0, 4);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function makeId() {
  return Date.now().toString() + Math.random().toString(36).slice(2);
}

function getTypingDelay(text: string): number {
  const wordCount = text.trim().split(/\s+/).length;
  return Math.min((wordCount / WORDS_PER_MIN) * 60_000, MAX_TYPING_DELAY);
}

function getInitialMessage(personality: string, uName: string): string {
  switch (personality) {
    case 'Empathetic':
      return `Hey ${uName}! 💙 ||| I'm here for you. ||| How are you feeling right now?`;
    case 'Analytical':
      return `Hello ${uName}. ||| Profile loaded — ready to optimize your wellness routine. ||| What's on your mind?`;
    case 'Playful':
      return `Hey ${uName}! 🌟 ||| Great to see you! ||| What kind of energy are we bringing today?`;
    default:
      return `Hey! ||| How's it going? ||| I'm here whenever you need me.`;
  }
}

/** Strip [ACTION:...] tags from visible text */
function stripActionTag(text: string): string {
  return text.replace(ACTION_PATTERN, '').trim();
}

/** Extract action type from AI response if present */
function extractAction(text: string): ActionType | null {
  const match = text.match(ACTION_PATTERN);
  if (!match) return null;
  return match[1].toUpperCase() as ActionType;
}

// ─── Animated Typing Dots ────────────────────────────────────────────────────

function TypingDots() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const bounce = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: -6, duration: 250, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 250, useNativeDriver: true }),
          Animated.delay(500),
        ])
      );

    const a1 = bounce(dot1, 0);
    const a2 = bounce(dot2, 150);
    const a3 = bounce(dot3, 300);
    a1.start(); a2.start(); a3.start();

    return () => { a1.stop(); a2.stop(); a3.stop(); };
  }, []);

  return (
    <View style={styles.dotsContainer}>
      {[dot1, dot2, dot3].map((dot, i) => (
        <Animated.View
          key={i}
          style={[styles.dot, { transform: [{ translateY: dot }] }]}
        />
      ))}
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function SanctuaryScreen() {
  const now = new Date();
  const [guideSettings, setLocalSettings] = useState(getGuideSettings());
  const [currentMood, setCurrentMood] = useState<Mood>('neutral');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const scrollRef = useRef<ScrollView>(null);
  const proactiveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSendingRef = useRef(false);

  // ── Initialise messages when settings change ──
  const initMessages = useCallback((settings: ReturnType<typeof getGuideSettings>) => {
    const raw = getInitialMessage(settings.personality, settings.userName);
    const bubbles = raw.split('|||').map(s => s.trim()).filter(Boolean);
    const now = new Date();
    setMessages(
      bubbles.map((text, i) => ({
        id: `init-${i}`,
        text,
        from: 'ai' as const,
        timestamp: formatTime(now),
      }))
    );
    setShowQuickReplies(true);
    setCurrentMood('neutral');
  }, []);

  useEffect(() => {
    initMessages(getGuideSettings());
    return subscribeToSettings(() => {
      const updated = getGuideSettings();
      setLocalSettings(updated);
      initMessages(updated);
    });
  }, [initMessages]);

  // ── Proactive timer management ──
  const resetProactiveTimer = useCallback(() => {
    if (proactiveTimerRef.current) clearTimeout(proactiveTimerRef.current);
    const timeout = getIdleTimeout(guideSettings.frequency);
    if (!timeout) return;

    proactiveTimerRef.current = setTimeout(async () => {
      if (isSendingRef.current) return;
      const overridePrompt = getProactivePrompt(
        guideSettings.userName,
        guideSettings.focus,
        guideSettings.guideName,
      );
      await sendAIBubbles([], overridePrompt);
    }, timeout);
  }, [guideSettings]);

  useEffect(() => {
    resetProactiveTimer();
    return () => { if (proactiveTimerRef.current) clearTimeout(proactiveTimerRef.current); };
  }, [resetProactiveTimer]);

  // ── Scroll to bottom ──
  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages, isTyping]);

  // ── Core: send AI bubbles sequentially ──
  const sendAIBubbles = useCallback(async (
    chatHistory: { role: 'user' | 'assistant' | 'system'; content: string }[],
    overridePrompt?: string,
  ) => {
    isSendingRef.current = true;
    const settings = getGuideSettings();

    const systemPrompt = buildSystemPrompt({
      guideName: settings.guideName,
      userName: settings.userName,
      personality: settings.personality,
      voice: settings.voice,
      frequency: settings.frequency,
      focus: settings.focus,
      gender: settings.gender,
      role: settings.role,
      mood: currentMood,
      overridePrompt,
    });

    // Window trimming: only send last 12 messages to API
    const trimmed = chatHistory.slice(-API_WINDOW);

    setIsTyping(true);
    const rawResponse = await fetchAIResponse(trimmed, API_KEY, systemPrompt);
    setIsTyping(false);

    // Detect and extract action tag before splitting
    const detectedAction = extractAction(rawResponse);
    const cleanedResponse = stripActionTag(rawResponse);

    // Split into bubbles
    const bubbles = cleanedResponse.split('|||').map(s => s.trim()).filter(Boolean);

    // Send each bubble with its own typing delay
    for (let i = 0; i < bubbles.length; i++) {
      const bubble = bubbles[i];
      const delay = getTypingDelay(bubble);

      // Show typing dots between bubbles
      if (i > 0) {
        setIsTyping(true);
        await new Promise(r => setTimeout(r, delay));
        setIsTyping(false);
      } else {
        // First bubble: hold briefly for realism
        await new Promise(r => setTimeout(r, Math.min(delay, 1500)));
      }

      const aiMsg: ChatMessage = {
        id: makeId(),
        text: bubble,
        from: 'ai',
        timestamp: formatTime(new Date()),
      };
      setMessages(prev => [...prev, aiMsg]);
    }

    // Inject wellness action card if action was detected
    if (detectedAction) {
      await new Promise(r => setTimeout(r, 600));
      const actionMsg: ActionMessage = {
        id: makeId(),
        from: 'action',
        actionType: detectedAction,
        timestamp: formatTime(new Date()),
      };
      setMessages(prev => [...prev, actionMsg]);
    }

    isSendingRef.current = false;
    resetProactiveTimer();
  }, [currentMood, resetProactiveTimer]);

  // ── Handle user send ──
  const handleSend = async (text?: string) => {
    const msgText = (text || inputText).trim();
    if (!msgText || isSendingRef.current) return;

    // Hide quick replies after first user message
    setShowQuickReplies(false);
    setInputText('');

    // Detect mood from user's message
    const detectedMood = detectMood(msgText);
    setCurrentMood(detectedMood);

    // Reset proactive timer
    if (proactiveTimerRef.current) clearTimeout(proactiveTimerRef.current);

    const userMsg: ChatMessage = {
      id: makeId(),
      text: msgText,
      from: 'user',
      timestamp: formatTime(new Date()),
    };
    setMessages(prev => [...prev, userMsg]);

    // Build chat history from current messages (exclude action cards)
    setMessages(prev => {
      const chatOnly = prev
        .filter((m): m is ChatMessage => m.from !== 'action')
        .map(m => ({
          role: m.from === 'ai' ? 'assistant' : 'user' as 'user' | 'assistant',
          content: m.text,
        }));

      // Add the new user message
      const history = [...chatOnly, { role: 'user' as const, content: msgText }];

      // Fire async
      sendAIBubbles(history);
      return prev;
    });
  };

  // ── Handle wellness card dismiss ──
  const handleActionDismiss = useCallback(async (msgId: string) => {
    // Remove the action card
    setMessages(prev => prev.filter(m => m.id !== msgId));

    // AI follows up naturally
    const followUp: { role: 'user' | 'assistant'; content: string }[] = [
      { role: 'user', content: '[The user just completed a wellness exercise.]' }
    ];
    await sendAIBubbles(followUp);
  }, [sendAIBubbles]);

  // ─── Render ───────────────────────────────────────────────────────────────

  const quickReplies = getQuickReplies(guideSettings);
  const userMessageCount = messages.filter(m => m.from === 'user').length;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={{ uri: guideSettings.avatar }}
          style={styles.avatar}
        />
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{guideSettings.guideName}</Text>
          <Text style={styles.moodIndicator}>
            {MOOD_ICONS[currentMood]} {currentMood === 'neutral' ? 'Here for you' : `Feeling ${currentMood}`}
          </Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/guide-settings')}>
          <Settings size={22} color={Colors.textSecondary} strokeWidth={1.5} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.messageList}
          contentContainerStyle={styles.messageContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Date stamp */}
          <Text style={styles.datestamp}>
            TODAY • {formatTime(now).toUpperCase()}
          </Text>

          {/* Messages */}
          {messages.map((msg) => {
            // Wellness action card
            if (msg.from === 'action') {
              return (
                <View key={msg.id} style={styles.actionCardWrapper}>
                  <WellnessActionCard
                    type={(msg as ActionMessage).actionType}
                    onDismiss={() => handleActionDismiss(msg.id)}
                  />
                </View>
              );
            }

            // Regular chat bubble
            const chatMsg = msg as ChatMessage;
            return (
              <View
                key={chatMsg.id}
                style={[
                  styles.bubbleWrapper,
                  chatMsg.from === 'user' ? styles.bubbleRight : styles.bubbleLeft,
                ]}
              >
                <View
                  style={[
                    styles.bubble,
                    chatMsg.from === 'ai' ? styles.aiBubble : styles.userBubble,
                  ]}
                >
                  <Text
                    style={[
                      styles.bubbleText,
                      chatMsg.from === 'user' && styles.userBubbleText,
                    ]}
                  >
                    {chatMsg.text}
                  </Text>
                </View>
              </View>
            );
          })}

          {/* Animated typing indicator */}
          {isTyping && (
            <View style={[styles.bubbleWrapper, styles.bubbleLeft]}>
              <View style={[styles.bubble, styles.aiBubble]}>
                <TypingDots />
              </View>
            </View>
          )}

          {/* Quick Reply Chips */}
          {showQuickReplies && userMessageCount === 0 && (
            <View style={styles.quickRepliesContainer}>
              {quickReplies.map((reply) => (
                <TouchableOpacity
                  key={reply}
                  style={styles.quickReplyChip}
                  onPress={() => handleSend(reply)}
                  activeOpacity={0.75}
                >
                  <Text style={styles.quickReplyText}>{reply}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            placeholder={`Message ${guideSettings.guideName}…`}
            placeholderTextColor={Colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={() => handleSend()}
            returnKeyType="send"
            multiline
          />
          <TouchableOpacity
            style={[styles.sendBtn, inputText.trim() && styles.sendBtnActive]}
            onPress={() => handleSend()}
            disabled={!inputText.trim() || isSendingRef.current}
          >
            <ArrowUp
              size={18}
              color={inputText.trim() ? Colors.white : Colors.textMuted}
              strokeWidth={2}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.green[100],
  },
  headerCenter: {
    flex: 1,
    gap: 1,
  },
  headerTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
    color: Colors.text,
  },
  moodIndicator: {
    fontFamily: 'DMSans-Regular',
    fontSize: 12,
    color: Colors.textSecondary,
  },
  messageList: { flex: 1 },
  messageContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
    gap: 8,
  },
  datestamp: {
    fontFamily: 'DMSans-Medium',
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
    letterSpacing: 1,
    marginVertical: 8,
  },
  bubbleWrapper: {
    maxWidth: '80%',
  },
  bubbleLeft: { alignSelf: 'flex-start' },
  bubbleRight: { alignSelf: 'flex-end' },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  aiBubble: {
    backgroundColor: Colors.green[100],
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderBottomRightRadius: 4,
  },
  bubbleText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
  },
  userBubbleText: {
    color: Colors.text,
  },
  // Typing dots
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.green[400],
  },
  // Quick replies
  quickRepliesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  quickReplyChip: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  quickReplyText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 13,
    color: Colors.textSecondary,
  },
  // Action card
  actionCardWrapper: {
    alignSelf: 'flex-start',
    width: '92%',
    marginVertical: 4,
  },
  // Input bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginHorizontal: 16,
    marginBottom: Platform.OS === 'ios' ? 16 : 12,
    backgroundColor: Colors.bgDark,
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 12,
  },
  textInput: {
    flex: 1,
    fontFamily: 'DMSans-Regular',
    fontSize: 15,
    color: Colors.text,
    padding: 0,
    maxHeight: 100,
  },
  sendBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnActive: {
    backgroundColor: Colors.green[600],
  },
});
