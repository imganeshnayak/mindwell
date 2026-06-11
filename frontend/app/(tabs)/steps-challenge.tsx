import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, Award, MoreVertical, ChevronLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';

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
  const [activeTab, setActiveTab] = useState<'global' | 'friends'>('global');

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={{ uri: 'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=100' }}
          style={styles.avatar}
        />
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
                <Text style={styles.badgeText}>Trailblazer{'\n'}Level 5</Text>
              </View>
            </View>

            {/* Bar Chart */}
            <View style={styles.chartContainer}>
              {CHART_DATA.map((item, index) => (
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
                <Text style={styles.statValue}>8,432</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>TOTAL WEEKLY</Text>
                <Text style={styles.statValue}>59,024</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Leaderboard */}
        <View style={styles.section}>
          <View style={styles.leaderboardHeader}>
            <Text style={styles.sectionTitle}>Leaderboard</Text>
            
            {/* Toggle */}
            <View style={styles.toggleContainer}>
              <View
                style={[
                  styles.toggleIndicator,
                  activeTab === 'friends' && styles.toggleIndicatorRight,
                ]}
              />
              <TouchableOpacity
                style={styles.toggleBtn}
                onPress={() => setActiveTab('global')}
                activeOpacity={1}
              >
                <Text style={[styles.toggleText, activeTab === 'global' && styles.toggleTextActive]}>
                  Global
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.toggleBtn}
                onPress={() => setActiveTab('friends')}
                activeOpacity={1}
              >
                <Text style={[styles.toggleText, activeTab === 'friends' && styles.toggleTextActive]}>
                  Friends
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.leaderboardList}>
            {/* Top 3 */}
            {LEADERBOARD_DATA.map((user) => (
              <View key={user.id} style={styles.leaderboardCard}>
                <View style={styles.rankLeft}>
                  <View style={styles.medalContainer}>
                    <Award size={24} color={user.medalColor} fill={user.medalColor} />
                  </View>
                  <Image source={{ uri: user.avatar }} style={styles.userAvatar} />
                  <View>
                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.userTitle}>{user.title}</Text>
                  </View>
                </View>
                <View style={styles.rankRight}>
                  <Text style={styles.userSteps}>{user.steps}</Text>
                  <Text style={styles.stepsLabel}>STEPS</Text>
                </View>
              </View>
            ))}

            {/* Spacer */}
            <View style={styles.spacer}>
              <MoreVertical size={24} color={Colors.textMuted} />
            </View>

            {/* Current User */}
            <View style={[styles.leaderboardCard, styles.currentUserCard]}>
              <View style={styles.rankLeft}>
                <View style={styles.medalContainer}>
                  <Text style={styles.currentUserRank}>12</Text>
                </View>
                <Image
                  source={{ uri: 'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=100' }}
                  style={[styles.userAvatar, styles.currentUserAvatar]}
                />
                <View>
                  <Text style={styles.userName}>You</Text>
                  <Text style={styles.userTitle}>Top 5% this week</Text>
                </View>
              </View>
              <View style={styles.rankRight}>
                <Text style={styles.userSteps}>59,024</Text>
                <Text style={styles.stepsLabel}>STEPS</Text>
              </View>
            </View>
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
