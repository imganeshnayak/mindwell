import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useFonts } from 'expo-font';
import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_700Bold,
} from '@expo-google-fonts/playfair-display';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import * as SplashScreen from 'expo-splash-screen';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import type { Session } from '@supabase/supabase-js';
import { hydrateGuideSettings, getGuideSettings } from '@/utils/guideSettings';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    'PlayfairDisplay-Regular': PlayfairDisplay_400Regular,
    'PlayfairDisplay-Bold': PlayfairDisplay_700Bold,
    'DMSans-Regular': DMSans_400Regular,
    'DMSans-Medium': DMSans_500Medium,
    'DMSans-Bold': DMSans_700Bold,
  });

  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [hydrationDone, setHydrationDone] = useState(false);

  // ── Load initial session + subscribe to auth changes ──
  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      
      if (initialSession) {
        await hydrateGuideSettings();
      }
      
      if (mounted) {
        setSession(initialSession);
        setHydrationDone(true);
      }
    }

    checkAuth();

    // Listen for sign-in / sign-out events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        if (newSession) {
          await hydrateGuideSettings();
        }
        if (mounted) {
          setSession(newSession);
          setHydrationDone(true);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // ── Hide splash + route once fonts AND session state are ready ──
  useEffect(() => {
    if (!fontsLoaded && !fontError) return;  // fonts not ready yet
    if (session === undefined || !hydrationDone) return; // session/settings not checked yet

    SplashScreen.hideAsync();

    if (session) {
      // Logged in — check onboarding status
      const { onboardingDone } = getGuideSettings();
      if (onboardingDone) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(auth)/personalize');
      }
    } else {
      // Not logged in — go to auth
      router.replace('/(auth)');
    }
  }, [fontsLoaded, fontError, session, hydrationDone]);

  if ((!fontsLoaded && !fontError) || session === undefined || !hydrationDone) {
    return null;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="dark" />
    </>
  );
}
