// components/WellnessActionCard.tsx
// In-chat interactive wellness activity cards.
// Triggered by [ACTION:BREATHING] or [ACTION:STRETCH] tags in AI responses.

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Colors } from '@/constants/colors';
import { Wind, Activity, CheckCircle } from 'lucide-react-native';

export type ActionType = 'BREATHING' | 'STRETCH';

interface WellnessActionCardProps {
  type: ActionType;
  onDismiss: () => void;
}

// ─── Breathing Exercise ──────────────────────────────────────────────────────

const BREATHING_PHASES = [
  { label: 'Breathe in…', duration: 4, color: Colors.green[400] },
  { label: 'Hold…',       duration: 7, color: Colors.tan },
  { label: 'Breathe out…', duration: 8, color: Colors.green[300] },
];

function BreathingCard({ onDismiss }: { onDismiss: () => void }) {
  const [started, setStarted] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(BREATHING_PHASES[0].duration);
  const [cycleCount, setCycleCount] = useState(0);
  const [done, setDone] = useState(false);
  const circleAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseRef = useRef(0);
  const secondsRef = useRef(BREATHING_PHASES[0].duration);

  const MAX_CYCLES = 3;

  const animatePhase = (phase: number) => {
    const isInhale = phase === 0;
    const isHold = phase === 1;

    circleAnim.stopAnimation();
    if (isInhale) {
      // Expand
      Animated.timing(circleAnim, {
        toValue: 1,
        duration: BREATHING_PHASES[0].duration * 1000,
        useNativeDriver: false,
      }).start();
    } else if (isHold) {
      // Hold at expanded
      Animated.timing(circleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: false,
      }).start();
    } else {
      // Contract (exhale)
      Animated.timing(circleAnim, {
        toValue: 0,
        duration: BREATHING_PHASES[2].duration * 1000,
        useNativeDriver: false,
      }).start();
    }
  };

  const startBreathing = () => {
    setStarted(true);
    phaseRef.current = 0;
    secondsRef.current = BREATHING_PHASES[0].duration;
    setPhaseIndex(0);
    setSecondsLeft(BREATHING_PHASES[0].duration);
    animatePhase(0);

    timerRef.current = setInterval(() => {
      secondsRef.current -= 1;
      setSecondsLeft(secondsRef.current);

      if (secondsRef.current <= 0) {
        const nextPhase = (phaseRef.current + 1) % BREATHING_PHASES.length;

        if (nextPhase === 0) {
          // Completed one full cycle
          const newCycle = cycleCount + 1;
          setCycleCount(newCycle);
          if (newCycle >= MAX_CYCLES) {
            clearInterval(timerRef.current!);
            setDone(true);
            return;
          }
        }

        phaseRef.current = nextPhase;
        secondsRef.current = BREATHING_PHASES[nextPhase].duration;
        setPhaseIndex(nextPhase);
        setSecondsLeft(BREATHING_PHASES[nextPhase].duration);
        animatePhase(nextPhase);
      }
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const circleSize = circleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [80, 140],
  });

  const currentPhase = BREATHING_PHASES[phaseIndex];

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Wind size={16} color={Colors.green[500]} strokeWidth={1.5} />
        <Text style={styles.cardTitle}>4-7-8 Breathing</Text>
      </View>

      {!done ? (
        <>
          <View style={styles.circleWrapper}>
            <Animated.View
              style={[
                styles.breathCircle,
                {
                  width: started ? circleSize : 80,
                  height: started ? circleSize : 80,
                  borderColor: started ? currentPhase.color : Colors.green[200],
                },
              ]}
            />
            {started && (
              <View style={styles.circleTextWrapper}>
                <Text style={styles.circleSeconds}>{secondsLeft}</Text>
              </View>
            )}
          </View>

          <Text style={styles.phaseLabel}>
            {started ? currentPhase.label : 'Ready when you are'}
          </Text>

          {started && (
            <Text style={styles.cycleCounter}>
              Cycle {Math.min(cycleCount + 1, MAX_CYCLES)} of {MAX_CYCLES}
            </Text>
          )}

          {!started ? (
            <TouchableOpacity style={styles.startBtn} onPress={startBreathing}>
              <Text style={styles.startBtnText}>Start</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.skipBtn} onPress={onDismiss}>
              <Text style={styles.skipBtnText}>Skip</Text>
            </TouchableOpacity>
          )}
        </>
      ) : (
        <View style={styles.doneContainer}>
          <CheckCircle size={36} color={Colors.green[500]} strokeWidth={1.5} />
          <Text style={styles.doneTitle}>Great job! 🌿</Text>
          <Text style={styles.doneSubtitle}>You completed 3 full breathing cycles.</Text>
          <TouchableOpacity style={styles.startBtn} onPress={onDismiss}>
            <Text style={styles.startBtnText}>Done ✓</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ─── Stretch Exercise ────────────────────────────────────────────────────────

const STRETCH_STEPS = [
  { label: 'Neck rolls', desc: 'Slowly roll your head in a circle, 5 times each way.', duration: 30 },
  { label: 'Shoulder stretch', desc: 'Pull your left arm across your chest and hold. Then switch.', duration: 30 },
  { label: 'Deep forward fold', desc: 'Stand up, fold forward, let your head hang heavy.', duration: 30 },
];

function StretchCard({ onDismiss }: { onDismiss: () => void }) {
  const [started, setStarted] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(STRETCH_STEPS[0].duration);
  const [done, setDone] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const secondsRef = useRef(STRETCH_STEPS[0].duration);
  const stepRef = useRef(0);

  const animateProgress = (durationSec: number) => {
    progressAnim.setValue(0);
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: durationSec * 1000,
      useNativeDriver: false,
    }).start();
  };

  const startStretch = () => {
    setStarted(true);
    stepRef.current = 0;
    secondsRef.current = STRETCH_STEPS[0].duration;
    animateProgress(STRETCH_STEPS[0].duration);

    timerRef.current = setInterval(() => {
      secondsRef.current -= 1;
      setSecondsLeft(secondsRef.current);

      if (secondsRef.current <= 0) {
        const nextStep = stepRef.current + 1;
        if (nextStep >= STRETCH_STEPS.length) {
          clearInterval(timerRef.current!);
          setDone(true);
          return;
        }
        stepRef.current = nextStep;
        secondsRef.current = STRETCH_STEPS[nextStep].duration;
        setStepIndex(nextStep);
        setSecondsLeft(STRETCH_STEPS[nextStep].duration);
        animateProgress(STRETCH_STEPS[nextStep].duration);
      }
    }, 1000);
  };

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const currentStep = STRETCH_STEPS[stepIndex];

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Activity size={16} color={Colors.green[500]} strokeWidth={1.5} />
        <Text style={styles.cardTitle}>Quick Stretch</Text>
      </View>

      {!done ? (
        <>
          <Text style={styles.stretchStep}>
            Step {stepIndex + 1} of {STRETCH_STEPS.length}
          </Text>
          <Text style={styles.stretchLabel}>{currentStep.label}</Text>
          <Text style={styles.stretchDesc}>{currentStep.desc}</Text>

          {started && (
            <>
              <View style={styles.progressTrack}>
                <Animated.View
                  style={[styles.progressFill, { width: progressWidth }]}
                />
              </View>
              <Text style={styles.cycleCounter}>{secondsLeft}s remaining</Text>
            </>
          )}

          {!started ? (
            <TouchableOpacity style={styles.startBtn} onPress={startStretch}>
              <Text style={styles.startBtnText}>Start</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.skipBtn} onPress={onDismiss}>
              <Text style={styles.skipBtnText}>Skip</Text>
            </TouchableOpacity>
          )}
        </>
      ) : (
        <View style={styles.doneContainer}>
          <CheckCircle size={36} color={Colors.green[500]} strokeWidth={1.5} />
          <Text style={styles.doneTitle}>Nicely done! 💪</Text>
          <Text style={styles.doneSubtitle}>3 stretches complete. Your body thanks you.</Text>
          <TouchableOpacity style={styles.startBtn} onPress={onDismiss}>
            <Text style={styles.startBtnText}>Done ✓</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export default function WellnessActionCard({ type, onDismiss }: WellnessActionCardProps) {
  if (type === 'BREATHING') return <BreathingCard onDismiss={onDismiss} />;
  return <StretchCard onDismiss={onDismiss} />;
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.green[50],
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.green[200],
    alignItems: 'center',
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  cardTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 13,
    color: Colors.green[600],
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  circleWrapper: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breathCircle: {
    borderRadius: 999,
    borderWidth: 3,
    backgroundColor: 'rgba(79, 122, 85, 0.08)',
    position: 'absolute',
  },
  circleTextWrapper: {
    position: 'absolute',
    alignItems: 'center',
  },
  circleSeconds: {
    fontFamily: 'DMSans-Bold',
    fontSize: 36,
    color: Colors.green[600],
  },
  phaseLabel: {
    fontFamily: 'DMSans-Medium',
    fontSize: 16,
    color: Colors.green[700],
    textAlign: 'center',
  },
  cycleCounter: {
    fontFamily: 'DMSans-Regular',
    fontSize: 13,
    color: Colors.textSecondary,
  },
  startBtn: {
    backgroundColor: Colors.green[600],
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 30,
    marginTop: 4,
  },
  startBtnText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 15,
    color: Colors.white,
  },
  skipBtn: {
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  skipBtnText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: Colors.textMuted,
  },
  doneContainer: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  doneTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 18,
    color: Colors.green[700],
  },
  doneSubtitle: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  // Stretch
  stretchStep: {
    fontFamily: 'DMSans-Medium',
    fontSize: 12,
    color: Colors.textMuted,
    alignSelf: 'flex-start',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  stretchLabel: {
    fontFamily: 'DMSans-Bold',
    fontSize: 17,
    color: Colors.text,
    alignSelf: 'flex-start',
  },
  stretchDesc: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    alignSelf: 'flex-start',
  },
  progressTrack: {
    height: 6,
    width: '100%',
    backgroundColor: Colors.green[100],
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.green[500],
    borderRadius: 3,
  },
});
