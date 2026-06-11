import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Camera } from 'lucide-react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '@/constants/colors';
import { getGuideSettings, setGuideSettings, GuideSettings } from '@/utils/guideSettings';

export default function GuideSettingsScreen() {
  const [settings, setSettings] = useState<GuideSettings>(getGuideSettings());

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSettings({ ...settings, avatar: result.assets[0].uri });
    }
  };

  const saveSettings = () => {
    setGuideSettings(settings);
    router.back();
  };

  const toggleFocus = (item: string) => {
    setSettings((prev) => {
      const current = prev.focus;
      if (current.includes(item)) {
        return { ...prev, focus: current.filter((f) => f !== item) };
      } else {
        if (current.length >= 3) return prev;
        return { ...prev, focus: [...current, item] };
      }
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Guide Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
              <Image source={{ uri: settings.avatar }} style={styles.avatarImage} />
              <View style={styles.cameraIconContainer}>
                <Camera size={16} color={Colors.white} />
              </View>
            </TouchableOpacity>
            <Text style={styles.avatarHint}>Tap to change avatar</Text>
          </View>

          {/* Guide Name */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Guide Name</Text>
            <TextInput
              style={styles.input}
              value={settings.guideName}
              onChangeText={(text) => setSettings({ ...settings, guideName: text })}
              placeholder="Sanctuary AI"
              placeholderTextColor={Colors.textMuted}
            />
          </View>

          {/* Gender */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Gender Identity</Text>
            <Text style={styles.sectionDesc}>Influences the tone and persona of your guide.</Text>
            <View style={styles.chipRow}>
              {['Neutral', 'Female', 'Male', 'Non-binary'].map((gender) => {
                const isActive = settings.gender === gender;
                return (
                  <TouchableOpacity
                    key={gender}
                    style={[styles.chip, isActive && styles.chipActive]}
                    onPress={() => setSettings({ ...settings, gender: gender as GuideSettings['gender'] })}
                  >
                    <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{gender}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Role */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Role</Text>
            <Text style={styles.sectionDesc}>How the AI relates to you.</Text>
            <View style={styles.chipRow}>
              {['Guide', 'Mom', 'Dad', 'Friend', 'Bestie'].map((role) => {
                const isActive = settings.role === role;
                return (
                  <TouchableOpacity
                    key={role}
                    style={[styles.chip, isActive && styles.chipActive]}
                    onPress={() => setSettings({ ...settings, role: role as GuideSettings['role'] })}
                  >
                    <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{role}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Personality */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personality</Text>
            <View style={styles.chipRow}>
              {['Empathetic', 'Analytical', 'Playful'].map((personality) => {
                const isActive = settings.personality === personality;
                return (
                  <TouchableOpacity
                    key={personality}
                    style={[styles.chip, isActive && styles.chipActive]}
                    onPress={() => setSettings({ ...settings, personality: personality as GuideSettings['personality'] })}
                  >
                    <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{personality}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Voice */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Voice</Text>
            <View style={styles.chipRow}>
              {['Gentle & Nurturing', 'Focused & Calm', 'Bright & Motivating'].map((voice) => {
                const isActive = settings.voice === voice;
                return (
                  <TouchableOpacity
                    key={voice}
                    style={[styles.chip, isActive && styles.chipActive]}
                    onPress={() => setSettings({ ...settings, voice })}
                  >
                    <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{voice}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Interaction Frequency */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Interaction Frequency</Text>
            <View style={styles.chipRow}>
              {[
                { label: 'Low', desc: 'Only when asked' },
                { label: 'Balanced', desc: 'Natural flow' },
                { label: 'Proactive', desc: 'Check-ins' },
              ].map((freq) => {
                const isActive = settings.frequency === freq.label;
                return (
                  <TouchableOpacity
                    key={freq.label}
                    style={[styles.cardChip, isActive && styles.cardChipActive]}
                    onPress={() => setSettings({ ...settings, frequency: freq.label as GuideSettings['frequency'] })}
                  >
                    <Text style={[styles.cardChipTitle, isActive && styles.cardChipTitleActive]}>{freq.label}</Text>
                    <Text style={[styles.cardChipDesc, isActive && styles.cardChipDescActive]}>{freq.desc}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Core Focus */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Core Focus (Max 3)</Text>
            <View style={styles.chipRow}>
              {['Better Sleep', 'Daily Movement', 'Stress Relief', 'Mindful Breathing'].map((focus) => {
                const isActive = settings.focus.includes(focus);
                return (
                  <TouchableOpacity
                    key={focus}
                    style={[styles.chip, isActive && styles.chipActive]}
                    onPress={() => toggleFocus(focus)}
                  >
                    <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{focus}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={saveSettings}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.bg,
  },
  backButton: {
    padding: 4,
    marginLeft: -4,
  },
  headerTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 18,
    color: Colors.text,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 60,
    gap: 32,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: Colors.green[200],
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.green[600],
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.bg,
  },
  avatarHint: {
    fontFamily: 'DMSans-Medium',
    fontSize: 13,
    color: Colors.textSecondary,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
    color: Colors.text,
  },
  sectionDesc: {
    fontFamily: 'DMSans-Regular',
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: -8,
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: 'DMSans-Medium',
    fontSize: 16,
    color: Colors.text,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  chipActive: {
    backgroundColor: Colors.tan,
    borderColor: Colors.tan,
  },
  chipText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: Colors.text,
  },
  chipTextActive: {
    color: Colors.white,
  },
  cardChip: {
    flex: 1,
    minWidth: '30%',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    alignItems: 'center',
    gap: 4,
  },
  cardChipActive: {
    backgroundColor: Colors.tan,
    borderColor: Colors.tan,
  },
  cardChipTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 14,
    color: Colors.text,
  },
  cardChipTitleActive: {
    color: Colors.white,
  },
  cardChipDesc: {
    fontFamily: 'DMSans-Regular',
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  cardChipDescActive: {
    color: 'rgba(255,255,255,0.8)',
  },
  footer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    backgroundColor: Colors.bg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  saveButton: {
    backgroundColor: Colors.tan,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  saveButtonText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
    color: Colors.white,
  },
});
