import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { BarChart2, ShoppingBag } from 'lucide-react-native';
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
              <TabLabel label="Biometrics" focused={focused} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="marketplace"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.tabItem, focused && styles.tabItemActive]}>
              <ShoppingBag size={22} color={focused ? Colors.green[600] : Colors.textSecondary} strokeWidth={1.5} />
              <TabLabel label="Marketplace" focused={focused} />
            </View>
          ),
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
    minWidth: 90,
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
