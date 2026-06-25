import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, Moon, Footprints, Lightbulb, Utensils, Croissant, Sandwich, Soup, Cookie, Plus, Check } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';
import Svg, { Circle, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Colors } from '@/constants/colors';
import { router, useFocusEffect } from 'expo-router';
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { fetchTodayBiometrics, upsertBiometrics, BiometricsData } from '@/lib/biometrics/biometricsApi';
import { fetchTodayMeals, MealData } from '@/lib/nutrition/nutritionApi';
import { Pedometer } from 'expo-sensors';
import * as FileSystem from 'expo-file-system/legacy';
import { completeTask } from '@/lib/tree/treeApi';

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

const getTipFilePath = (userId: string) => `${FileSystem.documentDirectory}daily_tip_${userId}.json`;

const getOrGenerateDailyTip = async (
  userId: string,
  currentSteps: number,
  currentGoal: number,
  hasMealFn: (type: string) => boolean
): Promise<string> => {
  const today = new Date().toISOString().split('T')[0];
  const path = getTipFilePath(userId);
  
  try {
    const info = await FileSystem.getInfoAsync(path);
    if (info.exists) {
      const content = await FileSystem.readAsStringAsync(path);
      const parsed = JSON.parse(content);
      if (parsed.date === today && parsed.tip) {
        return parsed.tip;
      }
    }
  } catch (err) {
    console.error('Error reading daily tip:', err);
  }

  const stepPct = currentSteps / currentGoal;
  const mealsLogged = [hasMealFn('breakfast'), hasMealFn('lunch'), hasMealFn('dinner'), hasMealFn('snacks')].filter(Boolean).length;
  let tip = "";

  if (currentSteps >= currentGoal) {
    if (mealsLogged >= 3) {
      tip = "Fantastic! You've met your daily steps goal and logged all your core meals today. Your physical exertion is perfectly balanced with healthy nutrition.";
    } else {
      tip = "Great job hitting your steps goal today! Make sure to log your meals as well, so you can track how you are refueling your body.";
    }
  } else if (stepPct >= 0.8) {
    if (mealsLogged >= 2) {
      tip = "Almost there! You're very close to your daily steps goal, and your nutrition logs look steady. A short evening walk will get you across the finish line!";
    } else {
      tip = "You are close to your steps goal! Take a brief stroll to finish it, and remember to log your food habits so we can align your physical activity with nutrition.";
    }
  } else if (currentSteps > 0 && stepPct < 0.4) {
    if (mealsLogged > 0) {
      tip = "You've started logging your food habits, but daily movement is lower than usual. Try taking a quick 15-minute walk to aid digestion and boost your step count.";
    } else {
      tip = "Take a light walk and log your first meal of the day to keep your active habits and nutrition tracking on target.";
    }
  } else if (mealsLogged >= 3) {
    tip = "Excellent food tracking consistency! Keep building momentum by adding a light walk after dinner to close the gap on your steps goal.";
  } else {
    tip = "Consistent daily steps combined with balanced, logged meals form the foundation of peak health. Keep tracking your movement and food habits!";
  }

  try {
    await FileSystem.writeAsStringAsync(path, JSON.stringify({ date: today, tip }));
  } catch (err) {
    console.error('Error writing daily tip:', err);
  }

  return tip;
};

export default function BiometricsScreen() {
  const [biometrics, setBiometrics] = useState<BiometricsData | null>(null);
  const [totalCalories, setTotalCalories] = useState(0);
  const [meals, setMeals] = useState<MealData[]>([]);
  const [dailyTip, setDailyTip] = useState<string>("Consistent daily steps combined with balanced, logged meals form the foundation of peak health. Keep tracking your movement and food habits!");

  useFocusEffect(
    useCallback(() => {
      let subscription: { remove: () => void } | null = null;
      let isMounted = true;

      async function loadDataAndSetupPedometer() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !isMounted) return;

        let stepsFromSensor = 0;
        let isPedometerAvailable = false;

        try {
          isPedometerAvailable = await Pedometer.isAvailableAsync();
          if (isPedometerAvailable) {
            const permission = await Pedometer.requestPermissionsAsync();
            if (permission.granted) {
              const start = new Date();
              start.setHours(0, 0, 0, 0);
              const end = new Date();
              const sensorData = await Pedometer.getStepCountAsync(start, end);
              stepsFromSensor = sensorData.steps;
            }
          }
        } catch (err) {
          console.error('Error fetching steps from Pedometer sensor:', err);
        }

        if (stepsFromSensor > 0 && isMounted) {
          await upsertBiometrics(user.id, { steps: stepsFromSensor });
        }

        if (isMounted) {
          const bio = await fetchTodayBiometrics(user.id);
          setBiometrics(bio);

          const mealsData = await fetchTodayMeals(user.id);
          setMeals(mealsData);
          const cals = mealsData.reduce((sum, m) => sum + m.calories, 0);
          setTotalCalories(cals);

          const resolvedTip = await getOrGenerateDailyTip(
            user.id,
            stepsFromSensor || bio?.steps || 0,
            bio?.step_goal || 10000,
            (type: string) => (mealsData || []).some(m => m.meal_type.toLowerCase() === type.toLowerCase())
          );
          setDailyTip(resolvedTip);
        }

        // Subscribe to real-time updates
        if (isPedometerAvailable && isMounted) {
          subscription = Pedometer.watchStepCount(async () => {
            try {
              const start = new Date();
              start.setHours(0, 0, 0, 0);
              const end = new Date();
              const sensorData = await Pedometer.getStepCountAsync(start, end);
              if (sensorData.steps > 0 && isMounted) {
                await upsertBiometrics(user.id, { steps: sensorData.steps });
                const updatedBio = await fetchTodayBiometrics(user.id);
                setBiometrics(updatedBio);
              }
            } catch (e) {
              console.error('Error in pedometer real-time subscription update:', e);
            }
          });
        }
      }

      loadDataAndSetupPedometer();

      return () => {
        isMounted = false;
        if (subscription) {
          subscription.remove();
        }
      };
    }, [])
  );

  const steps = biometrics?.steps || 0;
  const stepGoal = biometrics?.step_goal || 10000;
  const vitality = biometrics?.vitality_score || 50;

  const hasMeal = (type: string) => meals.some(m => m.meal_type.toLowerCase() === type.toLowerCase());

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
        <TouchableOpacity style={styles.card} onPress={() => router.push('/steps-challenge')} activeOpacity={0.85}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardLabel}>MOVEMENT</Text>
            <Footprints size={22} color={Colors.textSecondary} strokeWidth={1.5} />
          </View>
          <View style={styles.circleContainer}>
            <CircularProgress value={steps} max={stepGoal} size={140} />
            <View style={styles.circleInner}>
              <Text style={styles.circleValue}>{steps.toLocaleString()}</Text>
              <Text style={styles.circleMax}>/ {stepGoal.toLocaleString()}</Text>
            </View>
          </View>
          <Text style={styles.cardStat}>Today's Steps: {steps.toLocaleString()}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10, marginTop: 12 }}>
            <TouchableOpacity 
              style={{ backgroundColor: Colors.bgDark, borderHeight: 1, borderColor: Colors.border, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}
              onPress={async (e) => {
                e.stopPropagation();
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                  const newSteps = Math.max(0, steps - 1000);
                  await upsertBiometrics(user.id, { steps: newSteps });
                  const bio = await fetchTodayBiometrics(user.id);
                  setBiometrics(bio);
                }
              }}
            >
              <Text style={{ fontFamily: 'DMSans-Medium', fontSize: 13, color: Colors.textSecondary }}>-1,000</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={{ backgroundColor: Colors.green[600], paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}
              onPress={async (e) => {
                e.stopPropagation();
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                  const newSteps = steps + 1000;
                  await upsertBiometrics(user.id, { steps: newSteps });
                  const bio = await fetchTodayBiometrics(user.id);
                  setBiometrics(bio);
                  // Logging steps = one task for tree growth
                  completeTask(user.id); // fire-and-forget
                }
              }}
            >
              <Text style={{ fontFamily: 'DMSans-Medium', fontSize: 13, color: Colors.white }}>+1,000 Steps</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        {/* Food Habits Card */}
        <TouchableOpacity style={styles.card} onPress={() => router.push('/nutrition-detail')} activeOpacity={0.85}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardLabel}>FOOD HABITS</Text>
            <Utensils size={22} color={Colors.textSecondary} strokeWidth={1.5} />
          </View>

          <View style={styles.circleContainer}>
            <CircularProgress value={totalCalories} max={2200} size={140} />
            <View style={styles.circleInner}>
              <Text style={styles.circleValue}>{totalCalories.toLocaleString()}</Text>
              <Text style={styles.circleMax}>/ 2,200 kcal</Text>
            </View>
          </View>

          <Text style={styles.nutritionTitle}>Daily Nutrition Summary</Text>

          <View style={styles.mealGrid}>
            <View style={styles.mealRow}>
              <TouchableOpacity style={styles.mealButton} onPress={() => router.push('/nutrition-detail')}>
                <View style={styles.mealLeft}>
                  <Croissant size={18} color={Colors.green[600]} strokeWidth={1.5} style={styles.mealIcon} />
                  <Text style={styles.mealText}>Breakfast</Text>
                </View>
                <View style={[styles.plusCircle, hasMeal('Breakfast') && { backgroundColor: Colors.green[600] }]}>
                  {hasMeal('Breakfast') ? (
                    <Check size={10} color={Colors.white} strokeWidth={3} />
                  ) : (
                    <Plus size={12} color={Colors.green[600]} strokeWidth={2.5} />
                  )}
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.mealButton} onPress={() => router.push('/nutrition-detail')}>
                <View style={styles.mealLeft}>
                  <Sandwich size={18} color={Colors.green[600]} strokeWidth={1.5} style={styles.mealIcon} />
                  <Text style={styles.mealText}>Lunch</Text>
                </View>
                <View style={[styles.plusCircle, hasMeal('Lunch') && { backgroundColor: Colors.green[600] }]}>
                  {hasMeal('Lunch') ? (
                    <Check size={10} color={Colors.white} strokeWidth={3} />
                  ) : (
                    <Plus size={12} color={Colors.green[600]} strokeWidth={2.5} />
                  )}
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.mealRow}>
              <TouchableOpacity style={styles.mealButton} onPress={() => router.push('/nutrition-detail')}>
                <View style={styles.mealLeft}>
                  <Soup size={18} color={Colors.green[600]} strokeWidth={1.5} style={styles.mealIcon} />
                  <Text style={styles.mealText}>Dinner</Text>
                </View>
                <View style={[styles.plusCircle, hasMeal('Dinner') && { backgroundColor: Colors.green[600] }]}>
                  {hasMeal('Dinner') ? (
                    <Check size={10} color={Colors.white} strokeWidth={3} />
                  ) : (
                    <Plus size={12} color={Colors.green[600]} strokeWidth={2.5} />
                  )}
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.mealButton} onPress={() => router.push('/nutrition-detail')}>
                <View style={styles.mealLeft}>
                  <Cookie size={18} color={Colors.green[600]} strokeWidth={1.5} style={styles.mealIcon} />
                  <Text style={styles.mealText}>Snacks</Text>
                </View>
                <View style={[styles.plusCircle, hasMeal('Snacks') && { backgroundColor: Colors.green[600] }]}>
                  {hasMeal('Snacks') ? (
                    <Check size={10} color={Colors.white} strokeWidth={3} />
                  ) : (
                    <Plus size={12} color={Colors.green[600]} strokeWidth={2.5} />
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>

        {/* Sleep Card commented out
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardLabel}>SLEEP</Text>
            <Moon size={22} color={Colors.textSecondary} strokeWidth={1.5} />
          </View>
          <Text style={styles.sleepDuration}>{sleepHours}h {sleepMins}m</Text>
          <Text style={styles.sleepTagline}>Rest &amp; Recharge</Text>
          <View style={styles.chartArea}>
            <SleepWaveChart />
          </View>
          <View style={styles.sleepDetail}>
            <View style={styles.sleepDot} />
            <Text style={styles.sleepDetailText}>Deep Sleep: {Math.floor(sleepHours * 0.3)}h {Math.floor(sleepMins * 0.3)}m</Text>
          </View>
        </View>
        */}


        {/* Quote Card */}
        <View style={styles.quoteCard}>
          <Lightbulb size={20} color={Colors.green[500]} strokeWidth={1.5} />
          <Text style={styles.quoteText}>
            "{dailyTip}"
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
  mealGrid: {
    gap: 12,
  },
  mealRow: {
    flexDirection: 'row',
    gap: 12,
  },
  mealButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.green[50],
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  mealLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mealIcon: {
    marginRight: 2,
  },
  mealText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: Colors.green[700],
  },
  plusCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.2,
    borderColor: Colors.green[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  nutritionTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 15,
    color: Colors.text,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
});
