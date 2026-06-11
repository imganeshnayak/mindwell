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

export const setGuideSettings = (newSettings: Partial<GuideSettings>) => {
  settings = { ...settings, ...newSettings };
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.error('Error running guide settings listener:', e);
    }
  });
};

export const subscribeToSettings = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
