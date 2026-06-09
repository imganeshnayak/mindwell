import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import Svg, { Path } from 'react-native-svg';

function SanctuaryLogo({ size = 80 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <Path
        d="M40 8 C40 8 20 20 20 38 C20 52 30 62 40 66 C50 62 60 52 60 38 C60 20 40 8 40 8Z"
        stroke={Colors.green[500]}
        strokeWidth="2.5"
        fill="none"
        strokeLinejoin="round"
      />
      <Path
        d="M40 66 C40 66 28 58 22 44"
        stroke={Colors.green[500]}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M40 66 C40 66 52 58 58 44"
        stroke={Colors.green[500]}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M40 20 L40 66"
        stroke={Colors.green[500]}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeDasharray="2 4"
      />
    </Svg>
  );
}

export default function SplashScreen() {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.85)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      router.replace('/(auth)');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          { opacity: logoOpacity, transform: [{ scale: logoScale }] },
        ]}
      >
        <SanctuaryLogo size={90} />
      </Animated.View>

      <Animated.Text style={[styles.title, { opacity: titleOpacity }]}>
        Grounded Sanctuary
      </Animated.Text>

      <Animated.Text style={[styles.subtitle, { opacity: subtitleOpacity }]}>
        FIND YOUR CENTER
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  logoContainer: {
    marginBottom: 8,
  },
  title: {
    fontFamily: 'PlayfairDisplay-Regular',
    fontSize: 30,
    color: Colors.text,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontFamily: 'DMSans-Medium',
    fontSize: 12,
    color: Colors.textMuted,
    letterSpacing: 4,
    position: 'absolute',
    bottom: 60,
  },
});
