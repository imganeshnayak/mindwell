import { fetchGuideSettings, upsertGuideSettings } from '@/lib/guide-settings/guideSettingsApi';
import { supabase } from '@/lib/supabase';

export interface GuideSettings {
  userName: string;
  guideName: string;
  voice: string;
  personality: 'Empathetic' | 'Analytical' | 'Playful';
  frequency: 'Low' | 'Balanced' | 'Proactive';
  focus: string[];
  gender: 'Male' | 'Female' | 'Non-binary' | 'Neutral';
  role: 'Guide' | 'Mom' | 'Dad' | 'Friend' | 'Bestie';
  avatar: string;
  onboardingDone?: boolean;
}

let settings: GuideSettings = {
  userName: 'Avery',
  guideName: 'Sanctuary AI',
  voice: 'Gentle & Nurturing',
  personality: 'Empathetic',
  frequency: 'Balanced',
  focus: [],
  gender: 'Neutral',
  role: 'Guide',
  avatar: 'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=100',
};

const listeners = new Set<() => void>();

export const getGuideSettings = (): GuideSettings => {
  return { ...settings };
};

export const setGuideSettings = async (newSettings: Partial<GuideSettings>) => {
  settings = { ...settings, ...newSettings };
  
  // Trigger UI update immediately (optimistic UI)
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.error('Error running guide settings listener:', e);
    }
  });

  // Persist to Supabase in background if logged in
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await upsertGuideSettings(user.id, {
      guide_name: settings.guideName,
      voice: settings.voice,
      personality: settings.personality,
      frequency: settings.frequency,
      focus: settings.focus,
      gender: settings.gender,
      role: settings.role,
      avatar_url: settings.avatar,
      onboarding_done: settings.onboardingDone,
    });
  }
};

export const subscribeToSettings = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const hydrateGuideSettings = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const data = await fetchGuideSettings(user.id);
  if (data) {
    settings = {
      ...settings,
      guideName: data.guide_name || settings.guideName,
      voice: data.voice || settings.voice,
      personality: (data.personality as any) || settings.personality,
      frequency: (data.frequency as any) || settings.frequency,
      focus: data.focus || settings.focus,
      gender: (data.gender as any) || settings.gender,
      role: (data.role as any) || settings.role,
      avatar: data.avatar_url || settings.avatar,
      onboardingDone: data.onboarding_done,
    };
    
    listeners.forEach((listener) => {
      try {
        listener();
      } catch (e) {
        console.error('Error running guide settings listener:', e);
      }
    });
  }
};

