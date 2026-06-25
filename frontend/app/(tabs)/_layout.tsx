import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { BarChart2, MoreHorizontal } from 'lucide-react-native';
import { Circle } from 'react-native-svg';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '@/constants/colors';

function SanctuaryIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2 C12 2 5 6.5 5 12.5 C5 17 8.5 20.5 12 22 C15.5 20.5 19 17 19 12.5 C19 6.5 12 2 12 2Z"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
        strokeLinejoin="round"
      />
      <Path
        d="M12 22 C12 22 8.5 19.5 6.5 15"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M12 22 C12 22 15.5 19.5 17.5 15"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function TreeIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Trunk */}
      <Path
        d="M12 22 L12 14"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Ground roots */}
      <Path
        d="M9 22 L15 22"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Left branch */}
      <Path
        d="M12 17 L8 13"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Right branch */}
      <Path
        d="M12 15 L16 11"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Main canopy circle */}
      <Circle cx="12" cy="10" r="5" stroke={color} strokeWidth="1.5" fill="none" />
      {/* Left canopy */}
      <Circle cx="7.5" cy="12" r="3.2" stroke={color} strokeWidth="1.5" fill="none" />
      {/* Right canopy */}
      <Circle cx="16.5" cy="10" r="3.2" stroke={color} strokeWidth="1.5" fill="none" />
    </Svg>
  );
}

function TabLabel({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text
      style={[
        styles.tabLabel,
        focused && styles.tabLabelActive,
      ]}
    >
      {label}
    </Text>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.green[600],
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.tabItem, focused && styles.tabItemActive]}>
              <SanctuaryIcon color={focused ? Colors.green[600] : Colors.textSecondary} size={22} />
              <TabLabel label="Sanctuary" focused={focused} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="biometrics"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.tabItem, focused && styles.tabItemActive]}>
              <BarChart2 size={22} color={focused ? Colors.green[600] : Colors.textSecondary} strokeWidth={1.5} />
              <TabLabel label="Metrics" focused={focused} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="tree"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.tabItem, focused && styles.tabItemActive]}>
              <TreeIcon color={focused ? Colors.green[600] : Colors.textSecondary} size={22} />
              <TabLabel label="Tree" focused={focused} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.tabItem, focused && styles.tabItemActive]}>
              <MoreHorizontal size={22} color={focused ? Colors.green[600] : Colors.textSecondary} strokeWidth={1.5} />
              <TabLabel label="More" focused={focused} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="steps-challenge"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.bg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    height: Platform.OS === 'ios' ? 85 : 65,
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  tabItem: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 30,
    gap: 4,
    minWidth: 72,
  },
  tabItemActive: {
    backgroundColor: Colors.green[100],
  },
  tabLabel: {
    fontFamily: 'DMSans-Regular',
    fontSize: 11,
    color: Colors.textSecondary,
  },
  tabLabelActive: {
    fontFamily: 'DMSans-Medium',
    color: Colors.green[600],
  },
});
