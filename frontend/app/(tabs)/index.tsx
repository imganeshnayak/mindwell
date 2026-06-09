import { useState, useRef, useEffect } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, ArrowUp } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { fetchAIResponse } from '@/utils/aiClient';

type Message = {
  id: string;
  text: string;
  from: 'ai' | 'user';
  timestamp: string;
};

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function SanctuaryScreen() {
  const now = new Date();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hey! How's it going today?",
      from: 'ai',
      timestamp: formatTime(now),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const handleSend = async (text?: string) => {
    const msgText = text || inputText.trim();
    if (!msgText) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: msgText,
      from: 'user',
      timestamp: formatTime(new Date()),
    };
    setInputText('');
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    // Convert history for API
    const chatHistory = [...messages, userMsg].map((m) => ({
      role: m.from === 'ai' ? 'assistant' : 'user',
      content: m.text,
    })) as { role: 'user' | 'assistant' | 'system'; content: string }[];

    // Replace this with the actual Unified API Key from the FreeLLMAPI dashboard once created
    const responseText = await fetchAIResponse(
      chatHistory,
      'freellmapi-69ff287cd06690047ae31fca8f5d1b424ae932e1edc85c87'
    );

    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      text: responseText,
      from: 'ai',
      timestamp: formatTime(new Date()),
    };

    setMessages((prev) => [...prev, aiMsg]);
    setIsLoading(false);
  };

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages, isLoading]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Image
          source={{ uri: 'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=100' }}
          style={styles.avatar}
        />
        <Text style={styles.headerTitle}>Sanctuary</Text>
        <TouchableOpacity>
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
          <Text style={styles.datestamp}>
            TODAY • {formatTime(now).toUpperCase()}
          </Text>

          {messages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.bubbleWrapper,
                msg.from === 'user' ? styles.bubbleRight : styles.bubbleLeft,
              ]}
            >
              <View
                style={[
                  styles.bubble,
                  msg.from === 'ai' ? styles.aiBubble : styles.userBubble,
                ]}
              >
                <Text
                  style={[
                    styles.bubbleText,
                    msg.from === 'user' && styles.userBubbleText,
                  ]}
                >
                  {msg.text}
                </Text>
              </View>
            </View>
          ))}

          {isLoading && (
            <View style={[styles.bubbleWrapper, styles.bubbleLeft]}>
              <View style={[styles.bubble, styles.aiBubble]}>
                <Text style={styles.bubbleText}>Typing...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            placeholder="Message Sanctuary..."
            placeholderTextColor={Colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={() => handleSend()}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[styles.sendBtn, inputText.trim() && styles.sendBtnActive]}
            onPress={() => handleSend()}
            disabled={!inputText.trim()}
          >
            <ArrowUp size={18} color={inputText.trim() ? Colors.text : Colors.textMuted} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.green[100],
  },
  headerTitle: {
    flex: 1,
    fontFamily: 'DMSans-Bold',
    fontSize: 18,
    color: Colors.text,
  },
  messageList: {
    flex: 1,
  },
  messageContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
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
  bubbleLeft: {
    alignSelf: 'flex-start',
  },
  bubbleRight: {
    alignSelf: 'flex-end',
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  actionSection: {
    alignItems: 'center',
    marginVertical: 24,
    gap: 10,
  },
  actionBtn: {
    backgroundColor: Colors.tan,
    borderRadius: 30,
    paddingVertical: 18,
    paddingHorizontal: 40,
    width: '100%',
    alignItems: 'center',
  },
  actionBtnText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 17,
    color: Colors.white,
    letterSpacing: 0.2,
  },
  actionSubtext: {
    fontFamily: 'DMSans-Regular',
    fontSize: 13,
    color: Colors.textSecondary,
  },
  quickReplies: {
    gap: 8,
    marginBottom: 8,
  },
  quickReplyBtn: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignSelf: 'flex-end',
    backgroundColor: Colors.white,
  },
  quickReplyText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: Colors.textSecondary,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: Platform.OS === 'ios' ? 16 : 12,
    backgroundColor: Colors.bgDark,
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  textInput: {
    flex: 1,
    fontFamily: 'DMSans-Regular',
    fontSize: 15,
    color: Colors.text,
    padding: 0,
  },
  sendBtn: {
    opacity: 0.5,
  },
  sendBtnActive: {
    opacity: 1,
  },
});
