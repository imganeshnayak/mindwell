import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, Moon, Footprints, Lightbulb } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';
import Svg, { Circle, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Colors } from '@/constants/colors';

function CircularProgress({
  value,
  max,
  size = 140,
}: {
  value: number;
  max: number;
  size?: number;
}) {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(value / max, 1);
  const strokeDashoffset = circumference * (1 - progress);
  const cx = size / 2;
  const cy = size / 2;

  return (
    <Svg width={size} height={size}>
      <Circle
        cx={cx}
        cy={cy}
        r={radius}
        stroke={Colors.border}
        strokeWidth={strokeWidth}
        fill="none"
      />
      <Circle
        cx={cx}
        cy={cy}
        r={radius}
        stroke={Colors.green[600]}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
      />
    </Svg>
  );
}

function SleepWaveChart() {
  const w = 280;
  const h = 60;
  return (
    <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <Defs>
        <LinearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={Colors.green[200]} stopOpacity="0.8" />
          <Stop offset="1" stopColor={Colors.green[100]} stopOpacity="0.1" />
        </LinearGradient>
      </Defs>
      <Path
        d={`M 0 ${h} L 0 ${h * 0.7} C 30 ${h * 0.7} 40 ${h * 0.2} 70 ${h * 0.25} C 100 ${h * 0.3} 110 ${h * 0.55} 140 ${h * 0.4} C 170 ${h * 0.25} 180 ${h * 0.1} 210 ${h * 0.2} C 240 ${h * 0.3} 260 ${h * 0.55} 280 ${h * 0.5} L ${w} ${h} Z`}
        fill="url(#sleepGrad)"
      />
      <Path
        d={`M 0 ${h * 0.7} C 30 ${h * 0.7} 40 ${h * 0.2} 70 ${h * 0.25} C 100 ${h * 0.3} 110 ${h * 0.55} 140 ${h * 0.4} C 170 ${h * 0.25} 180 ${h * 0.1} 210 ${h * 0.2} C 240 ${h * 0.3} 260 ${h * 0.55} 280 ${h * 0.5}`}
        fill="none"
        stroke={Colors.green[300]}
        strokeWidth="1.5"
      />
    </Svg>
  );
}

const VITALITY_DAYS = [
  { label: 'M', value: 0.45 },
  { label: 'T', value: 0.55 },
  { label: 'W', value: 0.65 },
  { label: 'T', value: 0.84, active: true },
  { label: 'F', value: 0.5 },
  { label: 'S', value: 0.4 },
  { label: 'S', value: 0.35 },
];

const BAR_MAX_HEIGHT = 80;

export default function BiometricsScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Image
          source={{ uri: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100' }}
          style={styles.avatar}
        />
        <Text style={styles.headerTitle}>Grounded Sanctuary</Text>
        <TouchableOpacity>
          <Settings size={22} color={Colors.textSecondary} strokeWidth={1.5} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Biometrics Overview</Text>
        <Text style={styles.pageSubtitle}>Listening to your body's natural rhythm.</Text>

        {/* Movement Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardLabel}>MOVEMENT</Text>
            <Footprints size={22} color={Colors.textSecondary} strokeWidth={1.5} />
          </View>
          <View style={styles.circleContainer}>
            <CircularProgress value={1200} max={10000} size={140} />
            <View style={styles.circleInner}>
              <Text style={styles.circleValue}>1,200</Text>
              <Text style={styles.circleMax}>/ 10,000</Text>
            </View>
          </View>
          <Text style={styles.cardStat}>Today's Steps: 1,200</Text>
        </View>

        {/* Sleep Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardLabel}>SLEEP</Text>
            <Moon size={22} color={Colors.textSecondary} strokeWidth={1.5} />
          </View>
          <Text style={styles.sleepDuration}>6h 30m</Text>
          <Text style={styles.sleepTagline}>Rest &amp; Recharge</Text>
          <View style={styles.chartArea}>
            <SleepWaveChart />
          </View>
          <View style={styles.sleepDetail}>
            <View style={styles.sleepDot} />
            <Text style={styles.sleepDetailText}>Deep Sleep: 2h 15m</Text>
          </View>
        </View>

        {/* Vitality Index Card */}
        <View style={styles.card}>
          <View style={styles.vitalityTop}>
            <View>
              <Text style={styles.vitalityTitle}>Vitality Index</Text>
              <Text style={styles.vitalitySubtitle}>Weekly Readiness Score</Text>
            </View>
            <View style={styles.vitalityBadge}>
              <Text style={styles.vitalityBadgePercent}>84%</Text>
              <Text style={styles.vitalityBadgeLabel}>Optimal</Text>
            </View>
          </View>
          <View style={styles.barChart}>
            {VITALITY_DAYS.map((day, i) => (
              <View key={i} style={styles.barColumn}>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: BAR_MAX_HEIGHT * day.value,
                        backgroundColor: day.active ? Colors.green[700] : Colors.bgDark,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.barLabel, day.active && styles.barLabelActive]}>
                  {day.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quote Card */}
        <View style={styles.quoteCard}>
          <Lightbulb size={20} color={Colors.green[500]} strokeWidth={1.5} />
          <Text style={styles.quoteText}>
            "Your heart rate variability indicates a high level of recovery today. A perfect time for a deep meditation or a creative project."
          </Text>
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
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.green[100],
  },
  headerTitle: {
    flex: 1,
    fontFamily: 'DMSans-Medium',
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 16,
  },
  pageTitle: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 30,
    color: Colors.text,
    marginTop: 4,
  },
  pageSubtitle: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardLabel: {
    fontFamily: 'DMSans-Medium',
    fontSize: 11,
    color: Colors.textSecondary,
    letterSpacing: 2,
  },
  circleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  circleInner: {
    position: 'absolute',
    alignItems: 'center',
  },
  circleValue: {
    fontFamily: 'DMSans-Bold',
    fontSize: 22,
    color: Colors.text,
  },
  circleMax: {
    fontFamily: 'DMSans-Regular',
    fontSize: 13,
    color: Colors.textSecondary,
  },
  cardStat: {
    fontFamily: 'DMSans-Bold',
    fontSize: 14,
    color: Colors.text,
    textAlign: 'center',
  },
  sleepDuration: {
    fontFamily: 'DMSans-Bold',
    fontSize: 28,
    color: Colors.text,
    marginBottom: 2,
  },
  sleepTagline: {
    fontFamily: 'DMSans-Regular',
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  chartArea: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: Colors.green[50],
  },
  sleepDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sleepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.green[400],
  },
  sleepDetailText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 13,
    color: Colors.textSecondary,
  },
  vitalityTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  vitalityTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 17,
    color: Colors.text,
    marginBottom: 2,
  },
  vitalitySubtitle: {
    fontFamily: 'DMSans-Regular',
    fontSize: 13,
    color: Colors.textSecondary,
  },
  vitalityBadge: {
    backgroundColor: Colors.green[100],
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
  },
  vitalityBadgePercent: {
    fontFamily: 'DMSans-Bold',
    fontSize: 18,
    color: Colors.green[700],
  },
  vitalityBadgeLabel: {
    fontFamily: 'DMSans-Regular',
    fontSize: 12,
    color: Colors.green[600],
  },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 8,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  barTrack: {
    height: BAR_MAX_HEIGHT,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '100%',
    borderRadius: 8,
    minHeight: 20,
  },
  barLabel: {
    fontFamily: 'DMSans-Regular',
    fontSize: 11,
    color: Colors.textSecondary,
  },
  barLabelActive: {
    fontFamily: 'DMSans-Bold',
    color: Colors.text,
  },
  quoteCard: {
    backgroundColor: Colors.green[50],
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  quoteText: {
    flex: 1,
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: Colors.green[700],
    lineHeight: 22,
    fontStyle: 'italic',
  },
});
