// app/(tabs)/tree.tsx
// "My Tree" — Personality Tree screen.
// The tree grows one frame for every wellness task completed across the app.

import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Pressable,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/lib/supabase';
import { fetchTreeProgress, completeTask, TreeProgress } from '@/lib/tree/treeApi';
import PersonalityTree from '@/components/PersonalityTree';
import { getPhaseForFrame, getPhaseProgress, TREE_PHASES } from '@/constants/treeFrames';
import { Colors } from '@/constants/colors';

export default function TreeScreen() {
  const [userId, setUserId] = useState<string | null>(null);
  const [progress, setProgress] = useState<TreeProgress>({ frame: 0, tasksCompleted: 0 });
  const [loading, setLoading] = useState(true);

  // Load user + tree progress on mount
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      const p = await fetchTreeProgress(user.id);
      setProgress(p);
      setLoading(false);
    }
    init();
  }, []);

  const handleCompleteTask = useCallback(async () => {
    if (!userId) return;
    const updated = await completeTask(userId);
    setProgress(updated);
  }, [userId]);

  const phase = getPhaseForFrame(progress.frame);

  // Gradient colors shift with the current phase
  const gradientColors: [string, string, string] = [
    phase.bgColor,
    '#FFFFFF',
    '#FAFFF8',
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.green[600]} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient
        colors={gradientColors}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>My Tree</Text>
            <Text style={styles.headerSubtitle}>Grows with every step you take</Text>
          </View>
          <InfoButton frame={progress.frame} tasksCompleted={progress.tasksCompleted} />
        </View>

        {/* DEV: manual task button — remove before production */}
        <TouchableOpacity
          style={[styles.devButton, { backgroundColor: phase.color }]}
          onPress={handleCompleteTask}
          activeOpacity={0.8}
        >
          <Text style={styles.devButtonText}>🌱 Complete a Task (Test)</Text>
        </TouchableOpacity>

        {/* The tree */}
        <View style={styles.treeContainer}>
          <PersonalityTree
            frame={progress.frame}
            size={300}
            showBadge={true}
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Info Button + Modal ──────────────────────────────────────────────────────

function InfoButton({ frame, tasksCompleted }: { frame: number; tasksCompleted: number }) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={styles.infoBtn}
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Text style={styles.infoBtnText}>ⓘ</Text>
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setVisible(false)}>
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            {/* Handle bar */}
            <View style={styles.handle} />

            <Text style={styles.modalTitle}>Growth Journey</Text>
            <Text style={styles.modalSubtitle}>
              {tasksCompleted} task{tasksCompleted !== 1 ? 's' : ''} completed · Frame {frame + 1} of 99
            </Text>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
              {TREE_PHASES.map((p) => {
                const currentPhase = getPhaseForFrame(frame);
                const isActive = currentPhase.name === p.name;
                const isPast = frame > p.endFrame;
                const phaseProgress = isActive ? getPhaseProgress(frame) : isPast ? 1 : 0;

                return (
                  <View
                    key={p.name}
                    style={[
                      styles.phaseRow,
                      isActive && { backgroundColor: p.bgColor, borderColor: p.color, borderWidth: 1.5 },
                    ]}
                  >
                    <View style={[styles.phaseIconBubble, { backgroundColor: isPast || isActive ? p.color : '#E0E0E0' }]}>
                      <Text style={styles.phaseIcon}>{p.emoji}</Text>
                    </View>
                    <View style={styles.phaseInfo}>
                      <View style={styles.phaseNameRow}>
                        <Text style={[styles.phaseLegendName, isActive && { color: p.color }]}>
                          {p.name}
                        </Text>
                        {isActive && (
                          <View style={[styles.hereBadge, { backgroundColor: p.color }]}>
                            <Text style={styles.hereBadgeText}>You're here</Text>
                          </View>
                        )}
                        {isPast && <Text style={styles.checkmark}>✓</Text>}
                      </View>
                      <Text style={styles.phaseLegendDesc}>{p.description}</Text>

                      {/* Progress bar — only shown for active or past phases */}
                      {(isActive || isPast) && (
                        <View style={styles.miniProgressTrack}>
                          <View
                            style={[
                              styles.miniProgressFill,
                              { width: `${Math.round(phaseProgress * 100)}%`, backgroundColor: p.color },
                            ]}
                          />
                        </View>
                      )}

                      <Text style={styles.phaseLegendRange}>
                        {p.endFrame - p.startFrame + 1} tasks to complete this phase
                      </Text>
                    </View>
                  </View>
                );
              })}
              <View style={{ height: 20 }} />
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.bg,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 24,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  headerCenter: {
    alignItems: 'center',
    gap: 4,
  },
  headerTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 28,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: Colors.textSecondary,
  },
  infoBtn: {
    position: 'absolute',
    right: 0,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  infoBtnText: {
    fontSize: 18,
    color: Colors.green[600],
    lineHeight: 22,
  },
  // Tree
  treeContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  // Dev button
  devButton: {
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  devButtonText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 15,
    color: '#fff',
    letterSpacing: 0.3,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.bg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingHorizontal: 20,
    maxHeight: '80%',
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 22,
    color: Colors.text,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontFamily: 'DMSans-Regular',
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  modalScroll: {
    flexGrow: 0,
  },
  // Phase rows inside modal
  phaseRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderRadius: 14,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  phaseIconBubble: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  phaseIcon: { fontSize: 20 },
  phaseInfo: { flex: 1, gap: 4 },
  phaseNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  phaseLegendName: {
    fontFamily: 'DMSans-Bold',
    fontSize: 15,
    color: Colors.text,
  },
  hereBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  hereBadgeText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 10,
    color: '#fff',
  },
  checkmark: {
    fontSize: 14,
    color: Colors.green[500],
    fontFamily: 'DMSans-Bold',
  },
  phaseLegendDesc: {
    fontFamily: 'DMSans-Regular',
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  miniProgressTrack: {
    height: 5,
    backgroundColor: '#E8E8E8',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 2,
  },
  miniProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  phaseLegendRange: {
    fontFamily: 'DMSans-Regular',
    fontSize: 11,
    color: Colors.textMuted,
  },
  devButton: {
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  devButtonText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 15,
    color: '#fff',
    letterSpacing: 0.3,
  },
});
