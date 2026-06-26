import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ChevronLeft, Sparkles, RotateCcw } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Svg, { Path, Circle } from 'react-native-svg';
import { getDailyCard, drawRandomCard, generateInterpretation } from '@/lib/tarot';
import type { TarotCard, Interpretation } from '@/lib/tarot';
import { TarotCardImage } from '@/lib/tarot/cardImage';

const { width, height } = Dimensions.get('window');
const CARD_W = width * 0.7;
const CARD_H = CARD_W * 1.55;

function getTodayStr(): string {
  const d = new Date();
  const opts: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
  return d.toLocaleDateString('en-US', opts);
}

const SECTION_ICONS: Record<string, string> = {
  todayMessage: '✨',
  relationships: '❤️',
  workStudies: '💼',
  personalGrowth: '🌱',
  reflectionQuestion: '💭',
  affirmation: '☀️',
};

const SECTION_TITLES: Record<string, string> = {
  todayMessage: "Today's Message",
  relationships: 'Relationships',
  workStudies: 'Work & Studies',
  personalGrowth: 'Personal Growth',
  reflectionQuestion: 'Reflection Question',
  affirmation: 'Positive Affirmation',
};

function ParticlesBackground() {
  const particles = useRef(
    Array.from({ length: 20 }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height * 0.8,
      size: 1.5 + Math.random() * 2,
      anim: new Animated.Value(0),
      delay: Math.random() * 4000,
      duration: 2000 + Math.random() * 3000,
    }))
  ).current;

  useEffect(() => {
    particles.forEach((p) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(p.delay),
          Animated.timing(p.anim, {
            toValue: 1,
            duration: p.duration,
            useNativeDriver: true,
          }),
          Animated.timing(p.anim, {
            toValue: 0,
            duration: p.duration,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
    return () => particles.forEach((p) => p.anim.stopAnimation());
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((p, i) => (
        <Animated.View
          key={i}
          style={[
            styles.particle,
            {
              left: p.x,
              top: p.y,
              width: p.size,
              height: p.size,
              borderRadius: p.size / 2,
              opacity: p.anim,
            },
          ]}
        />
      ))}
    </View>
  );
}

function InterpretationCard({
  icon,
  title,
  text,
  delay,
}: {
  icon: string;
  title: string;
  text: string;
  delay: number;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.interpretationCard,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <View style={styles.interpretationHeader}>
        <Text style={styles.interpretationIcon}>{icon}</Text>
        <Text style={styles.interpretationTitle}>{title}</Text>
      </View>
      <Text style={styles.interpretationText}>{text}</Text>
    </Animated.View>
  );
}

export default function TarotReadingScreen() {
  const [card, setCard] = useState<TarotCard | null>(null);
  const [isReversed, setIsReversed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [interpretation, setInterpretation] = useState<Interpretation | null>(null);
  const [interpLoading, setInterpLoading] = useState(false);

  const flipAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1.2, duration: 2000, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.8, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (flipped) {
      Animated.spring(flipAnim, {
        toValue: 180,
        friction: 8,
        tension: 14,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(flipAnim, {
        toValue: 0,
        friction: 8,
        tension: 14,
        useNativeDriver: true,
      }).start();
    }
  }, [flipped]);

  useEffect(() => {
    if (interpLoading) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 0.3, duration: 900, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [interpLoading]);

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });
  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });
  const frontOpacity = flipAnim.interpolate({
    inputRange: [0, 90, 180],
    outputRange: [1, 0, 0],
  });
  const backOpacity = flipAnim.interpolate({
    inputRange: [0, 90, 180],
    outputRange: [0, 0, 1],
  });

  const initCard = useCallback(async (forceNew: boolean = false) => {
    setLoading(true);
    setError(null);
    setFlipped(false);
    setInterpretation(null);
    setInterpLoading(false);

    try {
      const result = forceNew ? await drawRandomCard() : await getDailyCard();
      setCard(result.card);
      setIsReversed(result.isReversed);
    } catch (err: any) {
      setError(err?.message || 'Could not load your card');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initCard(false);
  }, [initCard]);

  const handleFlip = useCallback(async () => {
    if (flipped || !card || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setFlipped(true);

    setInterpLoading(true);
    setTimeout(async () => {
      try {
        const keywords = isReversed ? card.reversed : card.upright;
        const result = await generateInterpretation(card.name, isReversed, keywords);
        setInterpretation(result);
      } catch {
        // handled inside generateInterpretation
      } finally {
        setInterpLoading(false);
      }
    }, 700);
  }, [flipped, card, loading, isReversed]);

  const glowSize = glowAnim.interpolate({
    inputRange: [0.8, 1.2],
    outputRange: [CARD_W + 50, CARD_W + 80],
  });

  const frontFace = useMemo(() => card ? (
    <Animated.View
      style={[
        styles.cardFace,
        {
          transform: [{ perspective: 1200 }, { rotateY: frontInterpolate }],
          opacity: frontOpacity,
        },
      ]}
    >
      <LinearGradient
        colors={['rgba(26, 10, 46, 0.95)', 'rgba(20, 8, 40, 0.98)']}
        style={styles.cardInner}
      >
        <View style={styles.cardBackContent}>
          <View style={styles.cardBackMandala}>
            <SvgIcon />
          </View>
          <Text style={styles.tapReveal}>Tap to reveal</Text>
          <Text style={styles.tapRevealSub}>Your daily card is waiting</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  ) : null, [card, frontInterpolate, frontOpacity]);

  const backFace = useMemo(() => card ? (
    <Animated.View
      style={[
        styles.cardFace,
        styles.cardFaceBack,
        {
          transform: [{ perspective: 1200 }, { rotateY: backInterpolate }],
          opacity: backOpacity,
        },
      ]}
    >
      <TarotCardImage card={card} isReversed={isReversed} width={CARD_W} height={CARD_H} />
    </Animated.View>
  ) : null, [card, isReversed, backInterpolate, backOpacity]);

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient
        colors={['#0F0A1A', '#1A102E', '#150C24']}
        style={StyleSheet.absoluteFill}
      />
      <ParticlesBackground />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={22} color="#C4B5E3" strokeWidth={1.5} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Daily Tarot</Text>
          <Text style={styles.headerDate}>{getTodayStr()}</Text>
        </View>
        <View style={styles.backBtn}>
          <Sparkles size={16} color="#C4B5E3" opacity={0.5} />
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cardSection}>
          {loading ? (
            <View style={styles.cardPlaceholder}>
              <Text style={styles.loadingText}>Drawing your card...</Text>
              <ActivityIndicator size="small" color="#7C6FAA" style={{ marginTop: 16 }} />
            </View>
          ) : error ? (
            <View style={styles.cardPlaceholder}>
              <Sparkles size={28} color="#7C6FAA" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={() => initCard(false)}>
                <Text style={styles.retryText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : card ? (
            <TouchableOpacity activeOpacity={0.95} onPress={handleFlip}>
              <View style={styles.cardGlowWrap}>
                <Animated.View
                  style={[
                    styles.cardGlow,
                    { width: glowSize, height: glowSize, borderRadius: glowSize },
                  ]}
                />
              </View>
              <View style={styles.cardContainer}>
                {frontFace}
                {backFace}
              </View>
            </TouchableOpacity>
          ) : null}
        </View>

        {card && flipped && (
          <View style={styles.interpretationsContainer}>
            <View style={styles.orientationBadge}>
              <View
                style={[
                  styles.orientationDot,
                  { backgroundColor: isReversed ? '#C4A44A' : '#7C6FAA' },
                ]}
              />
              <Text style={styles.orientationText}>
                {isReversed ? 'Reversed' : 'Upright'}
              </Text>
            </View>

            {interpLoading ? (
              <View style={styles.loadingInterp}>
                <Animated.Text style={[styles.loadingInterpText, { opacity: pulseAnim }]}>
                  Preparing your reading...
                </Animated.Text>
                <Text style={styles.loadingInterpSub}>Just a moment</Text>
              </View>
            ) : interpretation ? (
              <>
                {(Object.keys(SECTION_ICONS) as Array<keyof Interpretation>).map((key, idx) => (
                  <InterpretationCard
                    key={key}
                    icon={SECTION_ICONS[key]}
                    title={SECTION_TITLES[key]}
                    text={interpretation[key]}
                    delay={idx * 100}
                  />
                ))}
              </>
            ) : null}
          </View>
        )}

        {card && flipped && !interpLoading && interpretation && (
          <>
            <View style={styles.disclaimer}>
              <Text style={styles.disclaimerText}>
                Take this as a gentle reflection, not a prediction. You already have everything you need.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.newCardBtn}
              onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                initCard(true);
              }}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['rgba(107, 91, 156, 0.3)', 'rgba(74, 63, 107, 0.2)']}
                style={StyleSheet.absoluteFill}
              />
              <RotateCcw size={16} color="#C4B5E3" />
              <Text style={styles.newCardText}>New Card</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={{ height: 50 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SvgIcon() {
  return (
    <Svg width={64} height={64} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke="#6B5B9C" strokeWidth="1.2" />
      <Path d="M12 2 L12 22" stroke="#6B5B9C" strokeWidth="0.8" opacity={0.4} />
      <Path d="M2 12 L22 12" stroke="#6B5B9C" strokeWidth="0.8" opacity={0.4} />
      <Circle cx="12" cy="12" r="3" stroke="#6B5B9C" strokeWidth="1" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0F0A1A',
  },
  particle: {
    position: 'absolute',
    backgroundColor: '#D4AF37',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(196, 181, 227, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 18,
    color: '#E4D5F5',
  },
  headerDate: {
    fontFamily: 'DMSans-Regular',
    fontSize: 11,
    color: '#7C6FAA',
    marginTop: 3,
  },
  scroll: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  cardSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
    minHeight: CARD_H + 50,
  },
  cardGlowWrap: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: CARD_W + 100,
    height: CARD_H + 100,
  },
  cardGlow: {
    backgroundColor: 'rgba(107, 91, 156, 0.08)',
  },
  cardPlaceholder: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: 20,
    backgroundColor: 'rgba(26, 16, 46, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(107, 91, 156, 0.3)',
  },
  loadingText: {
    fontFamily: 'PlayfairDisplay-Regular',
    fontSize: 15,
    color: '#7C6FAA',
  },
  errorText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: '#C4B5E3',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  retryBtn: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(107, 91, 156, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(107, 91, 156, 0.5)',
  },
  retryText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: '#C4B5E3',
  },
  cardContainer: {
    width: CARD_W,
    height: CARD_H,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardFace: {
    position: 'absolute',
    width: CARD_W,
    height: CARD_H,
    borderRadius: 20,
    overflow: 'hidden',
    backfaceVisibility: 'hidden',
    shadowColor: '#6B5B9C',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 14,
  },
  cardFaceBack: {
    shadowColor: '#D4AF37',
    shadowOpacity: 0.35,
  },
  cardInner: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(107, 91, 156, 0.4)',
  },
  cardBackContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
  cardBackMandala: {
    opacity: 0.7,
  },
  tapReveal: {
    fontFamily: 'DMSans-Medium',
    fontSize: 12,
    color: '#8B7BB8',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 8,
  },
  tapRevealSub: {
    fontFamily: 'DMSans-Regular',
    fontSize: 11,
    color: '#6B5B9C',
    marginTop: 2,
  },
  interpretationsContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 28,
    gap: 12,
  },
  orientationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 7,
    backgroundColor: 'rgba(107, 91, 156, 0.15)',
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 20,
    marginBottom: 4,
  },
  orientationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  orientationText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 12,
    color: '#C4B5E3',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  interpretationCard: {
    backgroundColor: 'rgba(45, 30, 74, 0.45)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(107, 91, 156, 0.2)',
  },
  interpretationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  interpretationIcon: {
    fontSize: 15,
  },
  interpretationTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 13,
    color: '#D4AF37',
    letterSpacing: 0.3,
  },
  interpretationText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 15,
    color: '#D4C9E8',
    lineHeight: 22,
  },
  loadingInterp: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  loadingInterpText: {
    fontFamily: 'PlayfairDisplay-Regular',
    fontSize: 16,
    color: '#C4B5E3',
  },
  loadingInterpSub: {
    fontFamily: 'DMSans-Regular',
    fontSize: 13,
    color: '#6B5B9C',
  },
  disclaimer: {
    paddingHorizontal: 28,
    paddingVertical: 24,
    alignItems: 'center',
  },
  disclaimerText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 12,
    color: '#6B5B9C',
    textAlign: 'center',
    lineHeight: 18,
    fontStyle: 'italic',
  },
  newCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(107, 91, 156, 0.4)',
    marginTop: 4,
    overflow: 'hidden',
  },
  newCardText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: '#C4B5E3',
  },
});
