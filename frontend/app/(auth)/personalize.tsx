import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Animated, Dimensions, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Heart, Brain, Sparkles, MessageSquare, MessageSquareOff, MessagesSquare, Moon, Activity, Wind, Leaf, ChevronLeft, ChevronRight, Check, Volume2, User, } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { getGuideSettings, setGuideSettings } from '@/utils/guideSettings';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const NAME_SUGGESTIONS = ['Aura', 'Zen', 'Sage', 'Solace', 'Sanctuary AI', 'Lotus'];

export default function PersonalizeScreen() {
  const settings = getGuideSettings();
  const userName = settings.userName || 'Avery';

  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const [guideName, setGuideName] = useState('Sanctuary AI');
  const [selectedVoice, setSelectedVoice] = useState('Gentle & Nurturing');
  const [selectedPersonality, setSelectedPersonality] = useState<'Empathetic' | 'Analytical' | 'Playful'>('Empathetic');
  const [selectedFrequency, setSelectedFrequency] = useState<'Low' | 'Balanced' | 'Proactive'>('Balanced');
  const [selectedFocus, setSelectedFocus] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<'Guide' | 'Mom' | 'Dad' | 'Friend' | 'Bestie'>('Guide');

  // Animation Refs
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const progressBarWidth = useRef(new Animated.Value(0.2)).current;

  // Sync progress bar
  useEffect(() => {
    Animated.timing(progressBarWidth, {
      toValue: currentStep / 6,
      duration: 350,
      useNativeDriver: false,
    }).start();
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < 6) {
      goToStep(currentStep + 1);
    } else {
      // Save settings & redirect to home
      setGuideSettings({
        guideName: guideName.trim() || 'Sanctuary AI',
        voice: selectedVoice,
        personality: selectedPersonality,
        frequency: selectedFrequency,
        focus: selectedFocus,
        role: selectedRole,
      });
      router.replace('/(tabs)');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      goToStep(currentStep - 1);
    }
  };

  const goToStep = (nextStep: number) => {
    // Transition slide/fade
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: nextStep > currentStep ? -30 : 30,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentStep(nextStep);
      slideAnim.setValue(nextStep > currentStep ? 30 : -30);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const toggleFocus = (item: string) => {
    if (selectedFocus.includes(item)) {
      setSelectedFocus(selectedFocus.filter((f) => f !== item));
    } else {
      setSelectedFocus([...selectedFocus, item]);
    }
  };

  // Get dynamic personality quote
  const getPersonalityQuote = () => {
    switch (selectedPersonality) {
      case 'Empathetic':
        return `"Hello ${userName}, I'm here for you. Take a deep breath and let's take this moment together."`;
      case 'Analytical':
        return `"Hello ${userName}. Profile loaded. Ready to analyze today's patterns and optimize your wellness routine."`;
      case 'Playful':
        return `"Hey ${userName}! Great to see you. Ready to shake things up and bring some positive energy to your day?"`;
      default:
        return `"Hello ${userName}, how are you feeling today?"`;
    }
  };

  // Step render functions
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Name Your Guide</Text>
            <Text style={styles.subtitle}>Give your companion a name that resonates with you.</Text>
            
            <View style={styles.inputWrapper}>
              <User size={20} color={Colors.green[500]} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                value={guideName}
                onChangeText={setGuideName}
                placeholder="Sanctuary AI"
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="words"
              />
            </View>

            <Text style={styles.sectionLabel}>Suggestions</Text>
            <View style={styles.tagContainer}>
              {NAME_SUGGESTIONS.map((name) => (
                <TouchableOpacity
                  key={name}
                  style={[
                    styles.tagChip,
                    guideName === name && styles.tagChipActive
                  ]}
                  onPress={() => setGuideName(name)}
                >
                  <Text style={[
                    styles.tagText,
                    guideName === name && styles.tagTextActive
                  ]}>
                    {name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Select a Voice</Text>
            <Text style={styles.subtitle}>Choose the tone that best supports your focus.</Text>

            <View style={styles.listContainer}>
              {[
                { name: 'Gentle & Nurturing', desc: 'Soft, patient, and emotionally warm tones.' },
                { name: 'Focused & Calm', desc: 'Steady, grounded, and clear presence.' },
                { name: 'Bright & Motivating', desc: 'Uplifting, optimistic, and energizing guidance.' }
              ].map((voice) => (
                <TouchableOpacity
                  key={voice.name}
                  style={[
                    styles.selectionCard,
                    selectedVoice === voice.name && styles.selectionCardActive
                  ]}
                  onPress={() => setSelectedVoice(voice.name)}
                >
                  <View style={[
                    styles.iconCircle,
                    selectedVoice === voice.name ? styles.iconCircleActive : styles.iconCircleMuted
                  ]}>
                    <Volume2 size={20} color={selectedVoice === voice.name ? Colors.white : Colors.green[500]} />
                  </View>
                  <View style={styles.selectionTextContainer}>
                    <Text style={[styles.selectionLabelText, selectedVoice === voice.name && styles.selectionTextActiveBold]}>
                      {voice.name}
                    </Text>
                    <Text style={styles.selectionDescText}>{voice.desc}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Guide Personality</Text>
            <Text style={styles.subtitle}>How should your guide interact with you?</Text>

            <View style={styles.listContainer}>
              {[
                {
                  id: 'Empathetic',
                  title: 'Empathetic',
                  desc: 'Warm, understanding, and emotionally supportive.',
                  icon: Heart,
                  color: Colors.success,
                },
                {
                  id: 'Analytical',
                  title: 'Analytical',
                  desc: 'Direct, data-driven, and logic-focused.',
                  icon: Brain,
                  color: Colors.tan,
                },
                {
                  id: 'Playful',
                  title: 'Playful',
                  desc: 'Lighthearted, encouraging, and spirited.',
                  icon: Sparkles,
                  color: Colors.warning,
                },
              ].map((p) => {
                const IconComponent = p.icon;
                const isActive = selectedPersonality === p.id;
                return (
                  <TouchableOpacity
                    key={p.id}
                    style={[
                      styles.selectionCard,
                      isActive && styles.selectionCardActive,
                    ]}
                    onPress={() => setSelectedPersonality(p.id as any)}
                  >
                    <View style={[
                      styles.iconCircle,
                      isActive ? { backgroundColor: p.color } : styles.iconCircleMuted
                    ]}>
                      <IconComponent size={20} color={isActive ? Colors.white : p.color} />
                    </View>
                    <View style={styles.selectionTextContainer}>
                      <Text style={[styles.selectionLabelText, isActive && styles.selectionTextActiveBold]}>
                        {p.title}
                      </Text>
                      <Text style={styles.selectionDescText}>{p.desc}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Dynamic Personality Preview */}
            <View style={styles.previewContainer}>
              <View style={styles.previewHeader}>
                <Sparkles size={14} color={Colors.tan} />
                <Text style={styles.previewTitle}>Personality Preview</Text>
              </View>
              <View style={styles.chatBubble}>
                <Text style={styles.chatBubbleText}>{getPersonalityQuote()}</Text>
              </View>
            </View>
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Interaction Frequency</Text>
            <Text style={styles.subtitle}>Decide how often you'd like to hear from your guide.</Text>

            <View style={styles.frequencyGrid}>
              {[
                { id: 'Low', title: 'Low', desc: 'Only when asked', icon: MessageSquareOff },
                { id: 'Balanced', title: 'Balanced', desc: 'Natural flow', icon: MessageSquare },
                { id: 'Proactive', title: 'Proactive', desc: 'Regular check-ins', icon: MessagesSquare }
              ].map((freq) => {
                const IconComponent = freq.icon;
                const isActive = selectedFrequency === freq.id;
                return (
                  <TouchableOpacity
                    key={freq.id}
                    style={[
                      styles.freqCard,
                      isActive && styles.freqCardActive
                    ]}
                    onPress={() => setSelectedFrequency(freq.id as any)}
                  >
                    <IconComponent size={24} color={isActive ? Colors.white : Colors.green[500]} style={styles.freqIcon} />
                    <Text style={[styles.freqTitle, isActive && styles.freqTitleActive]}>{freq.title}</Text>
                    <Text style={[styles.freqDesc, isActive && styles.freqDescActive]}>{freq.desc}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );

      case 5:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Core Focus</Text>
            <Text style={styles.subtitle}>Select your primary wellness objectives.</Text>

            <View style={styles.focusGrid}>
              {[
                { id: 'Better Sleep', title: 'Better Sleep', desc: 'Guided wind-downs and soundscapes.', icon: Moon },
                { id: 'Daily Movement', title: 'Daily Movement', desc: 'Gentle stretches and flows.', icon: Activity },
                { id: 'Stress Relief', title: 'Stress Relief', desc: 'Immediate calm techniques.', icon: Wind },
                { id: 'Mindful Breathing', title: 'Mindful Breathing', desc: 'Synchronize your biological pace.', icon: Leaf }
              ].map((focus) => {
                const IconComponent = focus.icon;
                const isSelected = selectedFocus.includes(focus.id);
                return (
                  <TouchableOpacity
                    key={focus.id}
                    style={[
                      styles.focusCard,
                      isSelected && styles.focusCardActive
                    ]}
                    onPress={() => toggleFocus(focus.id)}
                  >
                    <View style={styles.focusHeader}>
                      <View style={[
                        styles.focusIconWrapper,
                        isSelected ? styles.focusIconWrapperActive : styles.focusIconWrapperMuted
                      ]}>
                        <IconComponent size={20} color={isSelected ? Colors.white : Colors.green[600]} />
                      </View>
                      {isSelected && (
                        <View style={styles.checkBadge}>
                          <Check size={10} color={Colors.white} strokeWidth={3} />
                        </View>
                      )}
                    </View>
                    <Text style={[styles.focusTitle, isSelected && styles.focusTitleActive]}>{focus.title}</Text>
                    <Text style={styles.focusDesc}>{focus.desc}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );

      case 6:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Guide Role</Text>
            <Text style={styles.subtitle}>How should the AI relate to you?</Text>

            <View style={styles.listContainer}>
              {[
                { id: 'Guide', title: 'Wellness Guide', desc: 'A supportive, professional companion', icon: Sparkles },
                { id: 'Friend', title: 'Close Friend', desc: 'Casual, warm, and supportive', icon: MessageSquare },
                { id: 'Bestie', title: 'Bestie', desc: 'Fun, informal, and deeply loyal', icon: MessagesSquare },
                { id: 'Mom', title: 'Mom', desc: 'Nurturing, caring, and protective', icon: Heart },
                { id: 'Dad', title: 'Dad', desc: 'Grounding, practical, and encouraging', icon: User }
              ].map((roleOpt) => {
                const IconComponent = roleOpt.icon;
                const isSelected = selectedRole === roleOpt.id;
                return (
                  <TouchableOpacity
                    key={roleOpt.id}
                    style={[
                      styles.selectionCard,
                      isSelected && styles.selectionCardActive
                    ]}
                    onPress={() => setSelectedRole(roleOpt.id as any)}
                  >
                    <View style={[
                      styles.iconCircle,
                      isSelected ? styles.iconCircleActive : styles.iconCircleMuted
                    ]}>
                      <IconComponent size={20} color={isSelected ? Colors.white : Colors.green[500]} />
                    </View>
                    <View style={styles.selectionTextContainer}>
                      <Text style={[styles.selectionLabelText, isSelected && styles.selectionTextActiveBold]}>
                        {roleOpt.title}
                      </Text>
                      <Text style={styles.selectionDescText}>{roleOpt.desc}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  const progressPercentage = progressBarWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Onboarding Header & Progress Tracker */}
        <View style={styles.header}>
          <Text style={styles.stepCounter}>STEP {currentStep} OF 6</Text>
          <View style={styles.progressBarBg}>
            <Animated.View style={[styles.progressBarFill, { width: progressPercentage }]} />
          </View>
        </View>

        {/* Content Panel (Animated) */}
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={[
              styles.animatedWrapper,
              {
                opacity: fadeAnim,
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            {renderStepContent()}
          </Animated.View>
        </ScrollView>

        {/* Sticky Onboarding Action Controls */}
        <View style={styles.footer}>
          <View style={styles.actionRow}>
            {currentStep > 1 ? (
              <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
                <ChevronLeft size={20} color={Colors.textSecondary} />
                <Text style={styles.backBtnText}>Back</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.emptyBack} />
            )}

            <TouchableOpacity style={styles.nextBtn} onPress={handleNext} activeOpacity={0.85}>
              <Text style={styles.nextBtnText}>
                {currentStep === 6 ? 'Save & Enter Sanctuary' : 'Next'}
              </Text>
              {currentStep < 6 && <ChevronRight size={18} color={Colors.white} />}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  flex: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 8,
  },
  stepCounter: {
    fontFamily: 'DMSans-Bold',
    fontSize: 12,
    color: Colors.green[600],
    letterSpacing: 1,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.tan,
    borderRadius: 3,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  animatedWrapper: {
    width: '100%',
  },
  stepContainer: {
    gap: 16,
  },
  title: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 26,
    color: Colors.text,
  },
  subtitle: {
    fontFamily: 'DMSans-Regular',
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 8,
  },
  // Step 1: Input Wrapper
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  inputIcon: {
    marginRight: 4,
  },
  textInput: {
    flex: 1,
    fontFamily: 'DMSans-Medium',
    fontSize: 16,
    color: Colors.text,
    padding: 0,
  },
  sectionLabel: {
    fontFamily: 'DMSans-Bold',
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tagChipActive: {
    backgroundColor: Colors.green[100],
    borderColor: Colors.green[500],
  },
  tagText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: Colors.textSecondary,
  },
  tagTextActive: {
    color: Colors.green[700],
  },
  // Selection List
  listContainer: {
    gap: 12,
  },
  selectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
    gap: 16,
  },
  selectionCardActive: {
    borderColor: Colors.tan,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleActive: {
    backgroundColor: Colors.tan,
  },
  iconCircleMuted: {
    backgroundColor: Colors.green[50],
  },
  selectionTextContainer: {
    flex: 1,
    gap: 2,
  },
  selectionLabelText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
    color: Colors.text,
  },
  selectionTextActiveBold: {
    color: Colors.text,
  },
  selectionDescText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  // Personality Preview Bubble
  previewContainer: {
    backgroundColor: Colors.cardMuted,
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  previewTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 12,
    color: Colors.tan,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  chatBubble: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderBottomLeftRadius: 2,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chatBubbleText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  // Frequency Selection Grid
  frequencyGrid: {
    gap: 12,
  },
  freqCard: {
    padding: 20,
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  freqCardActive: {
    backgroundColor: Colors.green[600],
    borderColor: Colors.green[600],
  },
  freqIcon: {
    marginBottom: 8,
  },
  freqTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
    color: Colors.text,
    marginBottom: 4,
  },
  freqTitleActive: {
    color: Colors.white,
  },
  freqDesc: {
    fontFamily: 'DMSans-Regular',
    fontSize: 13,
    color: Colors.textSecondary,
  },
  freqDescActive: {
    color: Colors.green[50],
  },
  // Core Focus Objective Cards Grid (2x2)
  focusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  focusCard: {
    width: (SCREEN_WIDTH - 60) / 2, // Account for page container padding
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
    justifyContent: 'space-between',
    minHeight: 150,
  },
  focusCardActive: {
    borderColor: Colors.tan,
    borderWidth: 1.5,
  },
  focusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  focusIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  focusIconWrapperActive: {
    backgroundColor: Colors.tan,
  },
  focusIconWrapperMuted: {
    backgroundColor: Colors.green[50],
  },
  checkBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.tan,
    alignItems: 'center',
    justifyContent: 'center',
  },
  focusTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 15,
    color: Colors.text,
    marginBottom: 4,
  },
  focusTitleActive: {
    color: Colors.tan,
  },
  focusDesc: {
    fontFamily: 'DMSans-Regular',
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  // Navigation Footer controls
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    borderTopWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bg,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 56,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingRight: 16,
    gap: 4,
  },
  backBtnText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 16,
    color: Colors.textSecondary,
  },
  emptyBack: {
    width: 80,
  },
  nextBtn: {
    flex: 1,
    maxWidth: SCREEN_WIDTH - 140,
    height: 50,
    backgroundColor: Colors.tan,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: Colors.tan,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  nextBtnText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
    color: Colors.white,
  },
});
