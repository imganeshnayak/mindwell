import { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, Image,
  Animated, ActivityIndicator, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Mail, Lock, Eye, EyeOff, Info, LogIn, UserPlus, Leaf } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { setGuideSettings } from '@/utils/guideSettings';
import { signUp, signIn } from '@/lib/auth/authApi';

type AuthMode = 'register' | 'signin';

export default function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>('register');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing fields', 'Please enter your email and password.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'register') {
        const userName = name.trim() || 'Avery';
        const { userId, error } = await signUp(email, password, userName);

        if (error) {
          Alert.alert('Registration failed', error.message);
          return;
        }

        // Save name locally so personalize screen has it right away
        setGuideSettings({ userName });
        router.replace('/(auth)/personalize');

      } else {
        const { userId, error } = await signIn(email, password);

        if (error) {
          Alert.alert('Sign in failed', error.message);
          return;
        }

        // Derive display name from email as fallback
        const userName = email.split('@')[0] || 'Avery';
        setGuideSettings({ userName });
        router.replace('/(tabs)');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Leaf size={18} color={Colors.green[500]} strokeWidth={2} />
            <Text style={styles.headerTitle}>Grounded Sanctuary</Text>
          </View>
          <TouchableOpacity>
            <Info size={22} color={Colors.textSecondary} strokeWidth={1.5} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoSection}>
            <View style={styles.leafIcon}>
              <Leaf size={40} color={Colors.green[400]} strokeWidth={1.5} />
            </View>
            <Text style={styles.heroTitle}>
              {mode === 'register' ? 'Join the Sanctuary' : 'Welcome Back'}
            </Text>
            <Text style={styles.heroSubtitle}>
              {mode === 'register'
                ? 'Begin your journey to mental clarity\nand emotional balance today.'
                : 'Continue your path to inner peace\nand mindful living.'}
            </Text>
          </View>

          <View style={styles.formCard}>
            {mode === 'register' && (
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Full Name</Text>
                <View style={styles.inputRow}>
                  <User size={18} color={Colors.green[400]} strokeWidth={1.5} />
                  <TextInput
                    style={styles.input}
                    placeholder="Avery Miller"
                    placeholderTextColor={Colors.textMuted}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>
              </View>
            )}

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Email Address</Text>
              <View style={styles.inputRow}>
                <Mail size={18} color={Colors.green[400]} strokeWidth={1.5} />
                <TextInput
                  style={styles.input}
                  placeholder="avery@sanctuary.com"
                  placeholderTextColor={Colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Password</Text>
              <View style={styles.inputRow}>
                <Lock size={18} color={Colors.green[400]} strokeWidth={1.5} />
                <TextInput
                  style={[styles.input, styles.inputFlex]}
                  placeholder="••••••••"
                  placeholderTextColor={Colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeOff size={18} color={Colors.green[400]} strokeWidth={1.5} />
                  ) : (
                    <Eye size={18} color={Colors.green[400]} strokeWidth={1.5} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              activeOpacity={0.85}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.submitBtnText}>
                  {mode === 'register' ? 'Create Account' : 'Sign In'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.switchMode}
            onPress={() => setMode(mode === 'register' ? 'signin' : 'register')}
          >
            <Text style={styles.switchModeText}>
              {mode === 'register' ? 'Already have an account? ' : "Don't have an account? "}
              <Text style={styles.switchModeLink}>
                {mode === 'register' ? 'Sign In' : 'Register'}
              </Text>
            </Text>
          </TouchableOpacity>

          <View style={styles.imageContainer}>
            <Image
              source={{ uri: 'https://images.pexels.com/photos/1536620/pexels-photo-1536620.jpeg?auto=compress&cs=tinysrgb&w=400' }}
              style={styles.bottomImage}
              resizeMode="cover"
            />
          </View>
        </ScrollView>

        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabItem, mode === 'signin' && styles.tabItemActive]}
            onPress={() => setMode('signin')}
          >
            <LogIn size={20} color={mode === 'signin' ? Colors.green[600] : Colors.textSecondary} strokeWidth={1.5} />
            <Text style={[styles.tabLabel, mode === 'signin' && styles.tabLabelActive]}>
              Sign In
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, mode === 'register' && styles.tabItemActive]}
            onPress={() => setMode('register')}
          >
            <UserPlus size={20} color={mode === 'register' ? Colors.green[600] : Colors.textSecondary} strokeWidth={1.5} />
            <Text style={[styles.tabLabel, mode === 'register' && styles.tabLabelActive]}>
              Register
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontFamily: 'DMSans-Medium', fontSize: 16, color: Colors.text },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 24 },
  logoSection: { alignItems: 'center', marginBottom: 32, marginTop: 16 },
  leafIcon: { marginBottom: 16 },
  heroTitle: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 28,
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontFamily: 'DMSans-Regular',
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  formCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    gap: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  fieldGroup: { gap: 8 },
  fieldLabel: { fontFamily: 'DMSans-Medium', fontSize: 14, color: Colors.text },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgDark,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  input: { flex: 1, fontFamily: 'DMSans-Regular', fontSize: 15, color: Colors.text, padding: 0 },
  inputFlex: { flex: 1 },
  submitBtn: {
    backgroundColor: Colors.tan,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: { fontFamily: 'DMSans-Bold', fontSize: 16, color: Colors.white, letterSpacing: 0.3 },
  switchMode: { alignItems: 'center', paddingVertical: 20 },
  switchModeText: { fontFamily: 'DMSans-Regular', fontSize: 14, color: Colors.textSecondary },
  switchModeLink: { fontFamily: 'DMSans-Bold', color: Colors.green[600] },
  imageContainer: { alignItems: 'center', marginTop: 8 },
  bottomImage: { width: 160, height: 130, borderRadius: 12 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.bg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    paddingTop: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 4,
    borderRadius: 30,
    marginHorizontal: 8,
  },
  tabItemActive: { backgroundColor: Colors.green[100] },
  tabLabel: { fontFamily: 'DMSans-Regular', fontSize: 12, color: Colors.textSecondary },
  tabLabelActive: { fontFamily: 'DMSans-Medium', color: Colors.green[600] },
});
