import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, Award, MoreVertical, ChevronLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { supabase } from '@/lib/supabase';
import { fetchWeeklyLeaderboard, syncWeeklySteps, LeaderboardEntry } from '@/lib/leaderboard/leaderboardApi';

// Helper for the bar chart
const CHART_DATA = [
  { day: 'M', height: '60%' },
  { day: 'T', height: '85%' },
  { day: 'W', height: '45%' },
  { day: 'T', height: '95%', isToday: true },
  { day: 'F', height: '30%' },
  { day: 'S', height: '70%' },
  { day: 'S', height: '55%' },
];

const LEADERBOARD_DATA = [
  {
    id: '1',
    rank: 1,
    name: 'Elena Gilbert',
    title: 'Top Trailblazer',
    steps: '82,410',
    avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=100',
    medalColor: '#d4af37',
  },
  {
    id: '2',
    rank: 2,
    name: 'Marcus Thorne',
    title: 'Consistent Walker',
    steps: '79,905',
    avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=100',
    medalColor: '#aaa9ad',
  },
  {
    id: '3',
    rank: 3,
    name: 'Sasha Lee',
    title: 'Daily Streaker',
    steps: '76,211',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
    medalColor: '#cd7f32',
  },
];

export default function StepsChallengeScreen() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [myEntry, setMyEntry] = useState<LeaderboardEntry | null>(null);
  const [myRank, setMyRank] = useState<number>(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [avgDaily, setAvgDaily] = useState<number>(0);
  const [chartData, setChartData] = useState<Array<{ day: string; height: string; isToday?: boolean }>>([
    { day: 'M', height: '10%' },
    { day: 'T', height: '10%' },
    { day: 'W', height: '10%' },
    { day: 'T', height: '10%' },
    { day: 'F', height: '10%' },
    { day: 'S', height: '10%' },
    { day: 'S', height: '10%' },
  ]);

  const getLevelInfo = (steps: number) => {
    if (steps <= 5000) return { level: 1, name: 'Novice' };
    if (steps <= 15000) return { level: 2, name: 'Walker' };
    if (steps <= 30000) return { level: 3, name: 'Stride' };
    if (steps <= 50000) return { level: 4, name: 'Pacer' };
    return { level: 5, name: 'Trailblazer' };
  };

  const levelInfo = getLevelInfo(myEntry?.total_steps || 0);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUserId(user.id);
      
      // Ensure user steps are synced to the weekly leaderboard
      await syncWeeklySteps(user.id);
      
      const lb = await fetchWeeklyLeaderboard();
      setLeaderboard(lb);

      const index = lb.findIndex((entry) => entry.user_id === user.id);
      if (index !== -1) {
        setMyEntry(lb[index]);
        setMyRank(index + 1);
      }

      // Load real 7-day biometrics history
      const dates: string[] = [];
      const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
      const tempChartDays: Array<{ day: string; dateStr: string; height: string; isToday?: boolean }> = [];
      
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        dates.push(dateStr);
        tempChartDays.push({
          day: daysOfWeek[d.getDay()],
          dateStr,
          height: '10%',
          isToday: i === 0,
        });
      }

      const { data: bioData } = await supabase
        .from('biometrics')
        .select('date, steps, step_goal')
        .eq('user_id', user.id)
        .in('date', dates);

      if (bioData && bioData.length > 0) {
        const bioMap = new Map(bioData.map(b => [b.date, b]));
        let sumSteps = 0;
        let countDays = 0;

        tempChartDays.forEach(day => {
          const matched = bioMap.get(day.dateStr);
          if (matched) {
            const pct = Math.min(Math.round((matched.steps / matched.step_goal) * 100), 100);
            day.height = `${Math.max(pct, 10)}%`;
            sumSteps += matched.steps;
            countDays++;
          }
        });

        setChartData(tempChartDays.map(({ day, height, isToday }) => ({ day, height, isToday })));
        setAvgDaily(countDays > 0 ? Math.round(sumSteps / countDays) : 0);
      }
    }
    loadData();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <ChevronLeft size={28} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Steps Challenge</Text>
        </View>
        <TouchableOpacity>
          <Settings size={22} color={Colors.textSecondary} strokeWidth={1.5} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Your Weekly Progress */}
        <View style={styles.section}>
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <View>
                <Text style={styles.progressTitle}>Your Weekly Progress</Text>
                <Text style={styles.progressSubtitle}>Consistent momentum this week.</Text>
              </View>
              <View style={styles.badge}>
                <Award size={18} color={Colors.green[600]} style={styles.badgeIcon} />
                <Text style={styles.badgeText}>{levelInfo.name}{'\n'}Level {levelInfo.level}</Text>
              </View>
            </View>

            {/* Bar Chart */}
            <View style={styles.chartContainer}>
              {chartData.map((item, index) => (
                <View key={index} style={styles.barColumn}>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        { height: item.height as any },
                        item.isToday && styles.barFillToday,
                      ]}
                    />
                  </View>
                  <Text style={[styles.barLabel, item.isToday && styles.barLabelToday]}>
                    {item.day}
                  </Text>
                </View>
              ))}
            </View>

            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>AVG DAILY</Text>
                <Text style={styles.statValue}>{avgDaily.toLocaleString()}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>TOTAL WEEKLY</Text>
                <Text style={styles.statValue}>{(myEntry?.total_steps || 0).toLocaleString()}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Leaderboard */}
        <View style={styles.section}>
          <View style={styles.leaderboardHeader}>
            <Text style={styles.sectionTitle}>Leaderboard</Text>
          </View>

          <View style={styles.leaderboardList}>
            {/* Top Rankers */}
            {leaderboard.length > 0 ? (
              leaderboard.slice(0, 10).map((user, index) => {
                let medalColor = Colors.bgDark;
                if (index === 0) medalColor = '#d4af37';
                if (index === 1) medalColor = '#aaa9ad';
                if (index === 2) medalColor = '#cd7f32';

                const isMe = user.user_id === currentUserId;

                return (
                  <View key={user.id} style={[styles.leaderboardCard, isMe && styles.currentUserCard]}>
                    <View style={styles.rankLeft}>
                      <View style={styles.medalContainer}>
                        {index < 3 ? (
                          <Award size={24} color={medalColor} fill={medalColor} />
                        ) : (
                          <Text style={styles.currentUserRank}>{index + 1}</Text>
                        )}
                      </View>
                      <Image source={{ uri: user.avatar_url || 'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=100' }} style={[styles.userAvatar, isMe && styles.currentUserAvatar]} />
                      <View>
                        <Text style={styles.userName}>{isMe ? 'You' : (user.display_name || 'Anonymous')}</Text>
                        <Text style={styles.userTitle}>{index === 0 ? 'Top Trailblazer' : isMe ? 'Keep going!' : 'Walker'}</Text>
                      </View>
                    </View>
                    <View style={styles.rankRight}>
                      <Text style={styles.userSteps}>{(user.total_steps || 0).toLocaleString()}</Text>
                      <Text style={styles.stepsLabel}>STEPS</Text>
                    </View>
                  </View>
                );
              })
            ) : (
              <Text style={{ textAlign: 'center', color: Colors.textSecondary }}>No entries yet this week.</Text>
            )}

            {/* Spacer */}
            {myRank > 10 && (
              <View style={styles.spacer}>
                <MoreVertical size={24} color={Colors.textMuted} />
              </View>
            )}

            {/* Current User (if not in top 10) */}
            {myEntry && myRank > 10 && (
              <View style={[styles.leaderboardCard, styles.currentUserCard]}>
                <View style={styles.rankLeft}>
                  <View style={styles.medalContainer}>
                    <Text style={styles.currentUserRank}>{myRank}</Text>
                  </View>
                  <Image
                    source={{ uri: myEntry.avatar_url || 'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=100' }}
                    style={[styles.userAvatar, styles.currentUserAvatar]}
                  />
                  <View>
                    <Text style={styles.userName}>You</Text>
                    <Text style={styles.userTitle}>Keep going!</Text>
                  </View>
                </View>
                <View style={styles.rankRight}>
                  <Text style={styles.userSteps}>{(myEntry.total_steps || 0).toLocaleString()}</Text>
                  <Text style={styles.stepsLabel}>STEPS</Text>
                </View>
              </View>
            )}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.green[100],
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
    color: Colors.text,
    letterSpacing: 0.5,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 8,
    gap: 32,
  },
  section: {
    gap: 16,
  },
  progressCard: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#1C2A22',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 30,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(143, 179, 147, 0.1)',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  progressTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 18,
    color: Colors.text,
    marginBottom: 4,
  },
  progressSubtitle: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: Colors.textSecondary,
  },
  badge: {
    backgroundColor: 'rgba(206, 233, 218, 0.3)', // Secondary container with opacity
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  badgeIcon: {
    marginBottom: 4,
  },
  badgeText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 10,
    color: Colors.green[600],
    textAlign: 'center',
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    paddingHorizontal: 8,
    marginBottom: 24,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
    height: '100%',
  },
  barTrack: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    paddingHorizontal: 6,
  },
  barFill: {
    width: '100%',
    backgroundColor: Colors.green[100],
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  barFillToday: {
    backgroundColor: Colors.green[500],
  },
  barLabel: {
    fontFamily: 'DMSans-Medium',
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 8,
  },
  barLabelToday: {
    color: Colors.text,
    fontFamily: 'DMSans-Bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.bgDark,
    padding: 16,
    borderRadius: 16,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  statLabel: {
    fontFamily: 'DMSans-Bold',
    fontSize: 11,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statValue: {
    fontFamily: 'DMSans-Bold',
    fontSize: 24,
    color: Colors.text,
  },
  leaderboardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 20,
    color: Colors.text,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.bgDark,
    borderRadius: 20,
    padding: 4,
    width: 160,
    position: 'relative',
  },
  toggleIndicator: {
    position: 'absolute',
    left: 4,
    top: 4,
    bottom: 4,
    width: '50%',
    backgroundColor: Colors.white,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleIndicatorRight: {
    left: '50%',
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    zIndex: 1,
  },
  toggleText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 13,
    color: Colors.textSecondary,
  },
  toggleTextActive: {
    color: Colors.text,
  },
  leaderboardList: {
    gap: 12,
  },
  leaderboardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 1,
    borderWidth: 1,
    borderColor: 'rgba(143, 179, 147, 0.05)',
  },
  currentUserCard: {
    backgroundColor: Colors.green[50], // Solid color to avoid shadow bleed on Android
    borderColor: Colors.green[200],
    elevation: 0, // Remove shadow for this highlighted card to prevent dark box
  },
  rankLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  medalContainer: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentUserRank: {
    fontFamily: 'DMSans-Bold',
    fontSize: 20,
    color: Colors.green[600],
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  currentUserAvatar: {
    borderWidth: 2,
    borderColor: Colors.green[400],
  },
  userName: {
    fontFamily: 'DMSans-Bold',
    fontSize: 15,
    color: Colors.text,
    marginBottom: 2,
  },
  userTitle: {
    fontFamily: 'DMSans-Regular',
    fontSize: 12,
    color: Colors.textSecondary,
  },
  rankRight: {
    alignItems: 'flex-end',
  },
  userSteps: {
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
    color: Colors.text,
  },
  stepsLabel: {
    fontFamily: 'DMSans-Bold',
    fontSize: 10,
    color: Colors.textSecondary,
  },
  spacer: {
    alignItems: 'center',
    paddingVertical: 8,
    opacity: 0.2,
  },
});
