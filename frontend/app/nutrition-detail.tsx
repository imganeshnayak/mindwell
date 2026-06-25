import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, ActivityIndicator, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Calendar, Droplet, Plus, Pencil, Lightbulb, Croissant, Sandwich, Soup, Cookie } from 'lucide-react-native';
import { router } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';
import { Colors } from '@/constants/colors';
import { supabase } from '@/lib/supabase';
import { fetchTodayHydration, fetchTodayMeals, updateHydration, upsertMeal, MealData } from '@/lib/nutrition/nutritionApi';
import { estimateNutritionFromText } from '@/utils/aiClient';
import { completeTask } from '@/lib/tree/treeApi';

function CircularProgress({
  value,
  max,
  size = 220,
}: {
  value: number;
  max: number;
  size?: number;
}) {
  const strokeWidth = 12;
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

export default function NutritionDetailScreen() {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  // Calendar browsing month/year
  const [browseYear, setBrowseYear] = useState(new Date().getFullYear());
  const [browseMonth, setBrowseMonth] = useState(new Date().getMonth());

  const [hydration, setHydration] = useState(0);
  const [meals, setMeals] = useState<MealData[]>([]);

  // Modal and Form States
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<string>('');
  const [mealId, setMealId] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fats, setFats] = useState('');
  const [isEstimating, setIsEstimating] = useState(false);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const h = await fetchTodayHydration(user.id, selectedDate);
      setHydration(h);
      const m = await fetchTodayMeals(user.id, selectedDate);
      setMeals(m);
    }
    loadData();
  }, [selectedDate]);

  const toggleHydration = async (index: number) => {
    let newVal = hydration === index + 1 ? index : index + 1;
    setHydration(newVal);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await updateHydration(user.id, newVal, selectedDate);
    }
  };

  const openMealModal = (type: string, existingMeal?: MealData) => {
    setSelectedMealType(type);
    if (existingMeal) {
      setMealId(existingMeal.id);
      setDescription(existingMeal.description || '');
      setCalories(existingMeal.calories?.toString() || '');
      setProtein(existingMeal.protein_g?.toString() || '');
      setCarbs(existingMeal.carbs_g?.toString() || '');
      setFats(existingMeal.fats_g?.toString() || '');
    } else {
      setMealId(null);
      setDescription('');
      setCalories('');
      setProtein('');
      setCarbs('');
      setFats('');
    }
    setModalVisible(true);
  };

  const saveMealLog = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description for the meal.');
      return;
    }

    const payload = {
      ...(mealId ? { id: mealId } : {}),
      user_id: user.id,
      date: selectedDate,
      meal_type: selectedMealType,
      description: description,
      calories: parseInt(calories) || 0,
      protein_g: parseInt(protein) || 0,
      carbs_g: parseInt(carbs) || 0,
      fats_g: parseInt(fats) || 0,
    };

    const { error } = await upsertMeal(payload);
    if (error) {
      Alert.alert('Error', 'Failed to save meal: ' + error);
    } else {
      setModalVisible(false);
      // Reload meals
      const m = await fetchTodayMeals(user.id, selectedDate);
      setMeals(m);
      // Logging a meal = one task for tree growth
      completeTask(user.id); // fire-and-forget
    }
  };

  const handleAIEstimate = async () => {
    if (!description.trim()) {
      Alert.alert('Information', 'Please enter a food description first.');
      return;
    }

    setIsEstimating(true);
    const result = await estimateNutritionFromText(description);
    setIsEstimating(false);

    if (result) {
      setCalories(result.calories.toString());
      setProtein(result.protein.toString());
      setCarbs(result.carbs.toString());
      setFats(result.fats.toString());
    } else {
      Alert.alert('AI Estimate Failed', 'Could not estimate nutrition. Please fill in details manually.');
    }
  };

  // Monthly Calendar Helpers
  const getDaysInMonth = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1).getDay();
    const padOffset = firstDay === 0 ? 6 : firstDay - 1; // Mon=0, Sun=6
    const numDays = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < padOffset; i++) {
      days.push({ isPadding: true, dayNum: 0 });
    }
    for (let i = 1; i <= numDays; i++) {
      days.push({ isPadding: false, dayNum: i });
    }
    return days;
  };

  const monthsList = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (browseMonth === 0) {
      setBrowseMonth(11);
      setBrowseYear(prev => prev - 1);
    } else {
      setBrowseMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (browseMonth === 11) {
      setBrowseMonth(0);
      setBrowseYear(prev => prev + 1);
    } else {
      setBrowseMonth(prev => prev + 1);
    }
  };

  const handleDateSelect = (dayNum: number) => {
    const formattedMonth = (browseMonth + 1).toString().padStart(2, '0');
    const formattedDay = dayNum.toString().padStart(2, '0');
    setSelectedDate(`${browseYear}-${formattedMonth}-${formattedDay}`);
    setShowCalendarModal(false);
  };

  const formatHeaderDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr + 'T00:00:00');
      const monthLabel = monthsList[d.getMonth()];
      const dayNum = d.getDate();
      const yr = d.getFullYear();
      return `${monthLabel} ${dayNum}, ${yr}`;
    } catch {
      return 'Nutrition Detail';
    }
  };

  const totalCals = meals.reduce((sum, m) => sum + m.calories, 0);
  const totalProtein = meals.reduce((sum, m) => sum + m.protein_g, 0);
  const totalCarbs = meals.reduce((sum, m) => sum + m.carbs_g, 0);
  const totalFats = meals.reduce((sum, m) => sum + m.fats_g, 0);

  const getMealIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'breakfast': return <Croissant size={24} color={Colors.green[700]} />;
      case 'lunch': return <Sandwich size={24} color={Colors.green[700]} />;
      case 'dinner': return <Soup size={24} color={Colors.green[700]} />;
      case 'snacks': return <Cookie size={24} color={'#C4845A'} />;
      default: return <Plus size={24} color={Colors.green[700]} />;
    }
  };

  const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top App Bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{formatHeaderDate(selectedDate)}</Text>
        <TouchableOpacity style={styles.iconButton} onPress={() => setShowCalendarModal(true)}>
          <Calendar size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Daily Summary Hero */}
        <View style={styles.heroSection}>
          <View style={styles.circleContainer}>
            <CircularProgress value={totalCals} max={2200} size={220} />
            <View style={styles.circleInner}>
              <Text style={styles.heroValue}>{totalCals.toLocaleString()}</Text>
              <Text style={styles.heroMax}>/ 2,200 kcal</Text>
            </View>
          </View>

          {/* Macros Chips */}
          <View style={styles.macrosContainer}>
            <View style={[styles.macroChip, { backgroundColor: Colors.green[100] }]}>
              <View style={[styles.macroDot, { backgroundColor: Colors.green[600] }]} />
              <Text style={[styles.macroText, { color: Colors.green[700] }]}>Protein {totalProtein}g</Text>
            </View>
            <View style={[styles.macroChip, { backgroundColor: Colors.green[50] }]}>
              <View style={[styles.macroDot, { backgroundColor: Colors.green[600] }]} />
              <Text style={[styles.macroText, { color: Colors.green[700] }]}>Carbs {totalCarbs}g</Text>
            </View>
            <View style={[styles.macroChip, { backgroundColor: '#FCECDD' }]}>
              <View style={[styles.macroDot, { backgroundColor: '#C4845A' }]} />
              <Text style={[styles.macroText, { color: '#8A5A3D' }]}>Fats {totalFats}g</Text>
            </View>
          </View>
        </View>

        {/* Hydration Tracker */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Hydration</Text>
            <Text style={styles.sectionSubtitle}>{hydration} / 8 glasses</Text>
          </View>
          <View style={[styles.card, styles.hydrationCard]}>
            <View style={styles.waterDrops}>
              {[...Array(8)].map((_, i) => (
                <TouchableOpacity key={i} onPress={() => toggleHydration(i)} activeOpacity={0.7}>
                  <Droplet 
                    size={28} 
                    color={i < hydration ? Colors.green[600] : Colors.textMuted}
                    fill={i < hydration ? Colors.green[600] : 'transparent'} 
                  />
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.addButton}>
              <Plus size={20} color={Colors.green[700]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Meal Log */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meal Log</Text>
          <View style={styles.mealList}>
            {mealTypes.map((type) => {
              const meal = meals.find((m) => m.meal_type === type);
              if (meal) {
                return (
                  <TouchableOpacity 
                    key={type} 
                    style={[styles.card, styles.mealCard]} 
                    activeOpacity={0.8}
                    onPress={() => openMealModal(type, meal)}
                  >
                    <View style={styles.mealLeft}>
                      <View style={[styles.mealIconBox, { backgroundColor: type === 'Snacks' ? '#FCECDD' : Colors.green[50] }]}>
                        {getMealIcon(type)}
                      </View>
                      <View>
                        <Text style={styles.mealName}>{type}</Text>
                        <Text style={styles.mealDesc}>{meal.description}</Text>
                      </View>
                    </View>
                    <View style={styles.mealRight}>
                      <Text style={styles.mealCals}>{meal.calories} kcal</Text>
                      <Pencil size={18} color={Colors.textSecondary} />
                    </View>
                  </TouchableOpacity>
                );
              } else {
                return (
                  <TouchableOpacity 
                    key={type} 
                    style={[styles.emptyMealCard]} 
                    activeOpacity={0.8}
                    onPress={() => openMealModal(type)}
                  >
                    <View style={styles.mealLeft}>
                      <View style={[styles.mealIconBox, { backgroundColor: Colors.bgDark }]}>
                        {getMealIcon(type)}
                      </View>
                      <View>
                        <Text style={styles.mealName}>{type}</Text>
                        <Text style={[styles.mealDesc, { color: Colors.textMuted }]}>Add meal...</Text>
                      </View>
                    </View>
                    <View style={[styles.addButton, { backgroundColor: Colors.green[600] }]}>
                      <Plus size={20} color={Colors.white} />
                    </View>
                  </TouchableOpacity>
                );
              }
            })}
          </View>
        </View>

        {/* Daily Insight */}
        <View style={styles.insightCard}>
          <View style={styles.insightIconBox}>
            <Lightbulb size={24} color={Colors.green[600]} />
          </View>
          <View style={styles.insightTextContent}>
            <Text style={styles.insightTitle}>Daily Insight</Text>
            <Text style={styles.insightText}>
              You're on track! Increasing your protein today will help with muscle recovery after your morning walk.
            </Text>
          </View>
        </View>

      </ScrollView>

      {/* Meal Logger Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {mealId ? 'Edit' : 'Log'} {selectedMealType}
            </Text>

            <Text style={styles.inputLabel}>Food Description</Text>
            <View style={styles.descInputRow}>
              <TextInput
                style={[styles.modalInput, styles.descInput]}
                placeholder="What did you eat? (e.g., Avocado Toast with Eggs)"
                placeholderTextColor={Colors.textMuted}
                value={description}
                onChangeText={setDescription}
                multiline
              />
              <TouchableOpacity 
                style={[styles.aiEstimateBtn, isEstimating && styles.aiEstimateBtnDisabled]}
                onPress={handleAIEstimate}
                disabled={isEstimating}
              >
                {isEstimating ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <Text style={styles.aiEstimateBtnText}>✨ AI Estimate</Text>
                )}
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Calories (kcal)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g., 350"
              placeholderTextColor={Colors.textMuted}
              keyboardType="numeric"
              value={calories}
              onChangeText={setCalories}
            />

            <View style={styles.macrosInputRow}>
              <View style={styles.macroInputCol}>
                <Text style={styles.inputLabel}>Protein (g)</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g., 12"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="numeric"
                  value={protein}
                  onChangeText={setProtein}
                />
              </View>
              <View style={styles.macroInputCol}>
                <Text style={styles.inputLabel}>Carbs (g)</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g., 40"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="numeric"
                  value={carbs}
                  onChangeText={setCarbs}
                />
              </View>
              <View style={styles.macroInputCol}>
                <Text style={styles.inputLabel}>Fats (g)</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g., 8"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="numeric"
                  value={fats}
                  onChangeText={setFats}
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.actionBtn, styles.cancelBtn]} 
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionBtn, styles.saveBtn]} 
                onPress={saveMealLog}
              >
                <Text style={styles.saveBtnText}>Save Meal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Monthly Calendar Selector Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showCalendarModal}
        onRequestClose={() => setShowCalendarModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowCalendarModal(false)}
        >
          <View style={styles.calendarModalContent} onStartShouldSetResponder={() => true}>
            {/* Month Header Switcher */}
            <View style={styles.calendarHeader}>
              <TouchableOpacity onPress={handlePrevMonth} style={styles.calNavBtn}>
                <Text style={styles.calNavText}>{"<"}</Text>
              </TouchableOpacity>
              <Text style={styles.calendarMonthTitle}>
                {monthsList[browseMonth]} {browseYear}
              </Text>
              <TouchableOpacity onPress={handleNextMonth} style={styles.calNavBtn}>
                <Text style={styles.calNavText}>{">"}</Text>
              </TouchableOpacity>
            </View>

            {/* Weekdays Row */}
            <View style={styles.weekdaysRow}>
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                <Text key={i} style={styles.weekdayLabel}>{day}</Text>
              ))}
            </View>

            {/* Days Grid */}
            <View style={styles.daysGrid}>
              {getDaysInMonth(browseYear, browseMonth).map((day, i) => {
                if (day.isPadding) {
                  return <View key={i} style={styles.dayCellEmpty} />;
                }

                // Check if this cell represents today
                const isCellToday = 
                  new Date().getDate() === day.dayNum &&
                  new Date().getMonth() === browseMonth &&
                  new Date().getFullYear() === browseYear;

                // Check if this cell represents the selected date
                const formattedMonth = (browseMonth + 1).toString().padStart(2, '0');
                const formattedDay = day.dayNum.toString().padStart(2, '0');
                const cellDateStr = `${browseYear}-${formattedMonth}-${formattedDay}`;
                const isCellSelected = cellDateStr === selectedDate;

                return (
                  <TouchableOpacity
                    key={i}
                    style={[
                      styles.dayCell,
                      isCellSelected && styles.dayCellSelected,
                      isCellToday && !isCellSelected && styles.dayCellToday,
                    ]}
                    onPress={() => handleDateSelect(day.dayNum)}
                  >
                    <Text 
                      style={[
                        styles.dayCellText,
                        isCellSelected && styles.dayCellTextSelected,
                        isCellToday && !isCellSelected && styles.dayCellTextToday,
                      ]}
                    >
                      {day.dayNum}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
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
    paddingVertical: 14,
  },
  iconButton: {
    padding: 8,
  },
  headerTitle: {
    fontFamily: 'DMSans-Medium',
    fontSize: 20,
    color: Colors.text,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 16,
    gap: 32,
  },
  heroSection: {
    alignItems: 'center',
  },
  circleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 24,
  },
  circleInner: {
    position: 'absolute',
    alignItems: 'center',
  },
  heroValue: {
    fontFamily: 'DMSans-Bold',
    fontSize: 36,
    color: Colors.text,
  },
  heroMax: {
    fontFamily: 'DMSans-Regular',
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  macrosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  macroChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  macroDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  macroText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 13,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 4,
  },
  sectionTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 20,
    color: Colors.text,
  },
  sectionSubtitle: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: Colors.textSecondary,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  hydrationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  waterDrops: {
    flexDirection: 'row',
    gap: 2,
    flex: 1,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.green[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealList: {
    gap: 12,
  },
  mealCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mealLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  mealIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealName: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: Colors.text,
    marginBottom: 4,
  },
  mealDesc: {
    fontFamily: 'DMSans-Regular',
    fontSize: 15,
    color: Colors.textSecondary,
  },
  mealRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mealCals: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: Colors.textSecondary,
  },
  emptyMealCard: {
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  insightCard: {
    backgroundColor: 'rgba(212, 230, 213, 0.3)',
    borderColor: Colors.green[100],
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  insightIconBox: {
    backgroundColor: Colors.green[100],
    padding: 8,
    borderRadius: 20,
  },
  insightTextContent: {
    flex: 1,
  },
  insightTitle: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: Colors.text,
    marginBottom: 4,
  },
  insightText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: Colors.green[700],
    lineHeight: 22,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    gap: 16,
    paddingBottom: Platform.OS === 'ios' ? 44 : 24,
  },
  modalTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 20,
    color: Colors.text,
    marginBottom: 8,
  },
  inputLabel: {
    fontFamily: 'DMSans-Medium',
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: -4,
  },
  modalInput: {
    backgroundColor: Colors.bgDark,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: 'DMSans-Regular',
    fontSize: 15,
    color: Colors.text,
  },
  descInputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  descInput: {
    flex: 1,
    height: 80,
    textAlignVertical: 'top',
  },
  aiEstimateBtn: {
    backgroundColor: Colors.green[600],
    borderRadius: 12,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
    height: 80,
    width: 100,
  },
  aiEstimateBtnDisabled: {
    backgroundColor: Colors.textMuted,
  },
  aiEstimateBtnText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 12,
    color: Colors.white,
    textAlign: 'center',
  },
  macrosInputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  macroInputCol: {
    flex: 1,
    gap: 8,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    backgroundColor: Colors.bgDark,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelBtnText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 15,
    color: Colors.textSecondary,
  },
  saveBtn: {
    backgroundColor: Colors.green[600],
  },
  saveBtnText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 15,
    color: Colors.white,
  },
  // Calendar Modal Styles
  calendarModalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 44 : 28,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  calNavBtn: {
    padding: 8,
    backgroundColor: Colors.bgDark,
    borderRadius: 8,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calNavText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
    color: Colors.text,
  },
  calendarMonthTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 18,
    color: Colors.text,
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 8,
    marginBottom: 4,
  },
  weekdayLabel: {
    fontFamily: 'DMSans-Medium',
    fontSize: 12,
    color: Colors.textMuted,
    width: 36,
    textAlign: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 12,
    justifyContent: 'space-around',
  },
  dayCell: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellEmpty: {
    width: 36,
    height: 36,
  },
  dayCellSelected: {
    backgroundColor: Colors.green[600],
  },
  dayCellToday: {
    borderWidth: 1.5,
    borderColor: Colors.green[600],
  },
  dayCellText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: Colors.text,
  },
  dayCellTextSelected: {
    fontFamily: 'DMSans-Bold',
    color: Colors.white,
  },
  dayCellTextToday: {
    fontFamily: 'DMSans-Bold',
    color: Colors.green[600],
  },
});
