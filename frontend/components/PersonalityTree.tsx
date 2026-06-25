// components/PersonalityTree.tsx
// Animated personality tree that cross-fades between frames on growth.
// Uses React Native Animated API on the UI thread for 60fps smoothness.

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Image,
  Text,
  Animated,
  StyleSheet,
  Easing,
} from 'react-native';
import { TREE_FRAMES, getPhaseForFrame, getPhaseProgress } from '@/constants/treeFrames';

interface PersonalityTreeProps {
  /** Frame index 0–98. Controls which image is shown. */
  frame: number;
  /** Tree display size in dp (default 280) */
  size?: number;
  /** Whether to show the phase badge + progress bar below the tree */
  showBadge?: boolean;
}

export default function PersonalityTree({
  frame,
  size = 280,
  showBadge = true,
}: PersonalityTreeProps) {
  // Track the currently displayed frame vs the incoming frame
  const [displayedFrame, setDisplayedFrame] = useState(frame);
  const [incomingFrame, setIncomingFrame] = useState<number | null>(null);
  const [showXpToast, setShowXpToast] = useState(false);

  // Animated values
  const currentOpacity  = useRef(new Animated.Value(1)).current;
  const incomingOpacity = useRef(new Animated.Value(0)).current;
  const scaleAnim       = useRef(new Animated.Value(1)).current;
  const glowOpacity     = useRef(new Animated.Value(0)).current;
  const xpTranslateY    = useRef(new Animated.Value(0)).current;
  const xpOpacity       = useRef(new Animated.Value(0)).current;

  const isAnimating = useRef(false);

  const runTransition = useCallback((nextFrame: number) => {
    if (isAnimating.current) return;
    isAnimating.current = true;

    // Set up incoming frame (starts invisible)
    setIncomingFrame(nextFrame);
    incomingOpacity.setValue(0);
    currentOpacity.setValue(1);
    scaleAnim.setValue(1);
    glowOpacity.setValue(0);
    xpTranslateY.setValue(0);
    xpOpacity.setValue(0);

    setShowXpToast(true);

    Animated.parallel([
      // Cross-fade: current out, incoming in (600ms)
      Animated.timing(currentOpacity, {
        toValue: 0,
        duration: 600,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(incomingOpacity, {
        toValue: 1,
        duration: 600,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      // Spring scale bounce (starts at 200ms delay)
      Animated.sequence([
        Animated.delay(200),
        Animated.spring(scaleAnim, {
          toValue: 1.06,
          useNativeDriver: true,
          tension: 180,
          friction: 5,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 120,
          friction: 8,
        }),
      ]),
      // Glow pulse
      Animated.sequence([
        Animated.timing(glowOpacity, {
          toValue: 0.7,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(glowOpacity, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
      // XP toast floats up then fades
      Animated.sequence([
        Animated.parallel([
          Animated.timing(xpOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(xpTranslateY, {
            toValue: -40,
            duration: 800,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(xpOpacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      // Swap: incoming becomes current
      setDisplayedFrame(nextFrame);
      setIncomingFrame(null);
      currentOpacity.setValue(1);
      incomingOpacity.setValue(0);
      setShowXpToast(false);
      isAnimating.current = false;
    });
  }, [currentOpacity, incomingOpacity, scaleAnim, glowOpacity, xpOpacity, xpTranslateY]);

  // Trigger animation whenever `frame` prop changes
  useEffect(() => {
    if (frame !== displayedFrame && !isAnimating.current) {
      runTransition(frame);
    }
  }, [frame, displayedFrame, runTransition]);

  const phase = getPhaseForFrame(frame);
  const phaseProgress = getPhaseProgress(frame);
  const progressPercent = Math.round(phaseProgress * 100);

  const imageSize = { width: size, height: size };

  return (
    <View style={styles.container}>
      {/* Glow ring behind the tree */}
      <Animated.View
        style={[
          styles.glowRing,
          {
            width: size * 0.85,
            height: size * 0.85,
            borderRadius: (size * 0.85) / 2,
            backgroundColor: phase.color,
            opacity: glowOpacity,
          },
        ]}
      />

      {/* Tree container with spring scale */}
      <Animated.View style={[styles.treeWrapper, { transform: [{ scale: scaleAnim }] }]}>
        {/* Current frame */}
        <Animated.Image
          source={TREE_FRAMES[displayedFrame]}
          style={[imageSize, styles.treeImage, { opacity: currentOpacity }]}
          resizeMode="contain"
        />

        {/* Incoming frame (cross-fades in on top) */}
        {incomingFrame !== null && (
          <Animated.Image
            source={TREE_FRAMES[incomingFrame]}
            style={[imageSize, styles.treeImage, styles.incomingImage, { opacity: incomingOpacity }]}
            resizeMode="contain"
          />
        )}
      </Animated.View>

      {/* XP toast */}
      {showXpToast && (
        <Animated.View
          style={[
            styles.xpToast,
            {
              opacity: xpOpacity,
              transform: [{ translateY: xpTranslateY }],
            },
          ]}
          pointerEvents="none"
        >
          <Text style={styles.xpToastText}>+1 {phase.emoji}</Text>
        </Animated.View>
      )}

      {/* Phase badge + progress bar */}
      {showBadge && (
        <View style={styles.badgeContainer}>
          <View style={[styles.phaseBadge, { backgroundColor: phase.bgColor }]}>
            <Text style={styles.phaseEmoji}>{phase.emoji}</Text>
            <Text style={[styles.phaseName, { color: phase.color }]}>{phase.name}</Text>
          </View>
          <Text style={styles.phaseDescription}>{phase.description}</Text>

          {/* Progress bar */}
          <View style={styles.progressBarTrack}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  width: `${progressPercent}%`,
                  backgroundColor: phase.color,
                },
              ]}
            />
          </View>
          <Text style={styles.progressLabel}>
            {frame - phase.startFrame + 1} / {phase.endFrame - phase.startFrame + 1} in this phase
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    alignSelf: 'center',
    // Blur-like glow via shadow (iOS) + elevation (Android)
    shadowColor: '#3A9A3A',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 40,
    shadowOpacity: 1,
    elevation: 12,
  },
  treeWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  treeImage: {
    // White background is transparent in PNG — just renders the tree
  },
  incomingImage: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  xpToast: {
    position: 'absolute',
    top: '20%',
    alignSelf: 'center',
    backgroundColor: 'rgba(58, 154, 58, 0.92)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    shadowOpacity: 0.2,
    elevation: 6,
  },
  xpToastText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 18,
    color: '#fff',
  },
  badgeContainer: {
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
    width: '100%',
  },
  phaseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 6,
  },
  phaseEmoji: {
    fontSize: 18,
  },
  phaseName: {
    fontFamily: 'DMSans-Bold',
    fontSize: 15,
    letterSpacing: 0.3,
  },
  phaseDescription: {
    fontFamily: 'DMSans-Regular',
    fontSize: 13,
    color: '#777',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  progressBarTrack: {
    width: 200,
    height: 6,
    backgroundColor: '#E8E8E8',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressLabel: {
    fontFamily: 'DMSans-Regular',
    fontSize: 11,
    color: '#AAA',
    letterSpacing: 0.2,
  },
});
