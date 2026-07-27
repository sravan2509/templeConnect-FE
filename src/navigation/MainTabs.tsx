import { Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createTabStack } from "./TabStackFactory";
import { tabs } from "../content/tree";
import { colors } from "../theme";

const Tab = createBottomTabNavigator();

const tabIcons: Record<string, string> = {
  home: "🏠",
  temples: "🛕",
  rituals: "🪔",
  connect: "🤝",
  profile: "👤",
};

// Pre-build tab stack components once at module level so React Navigation
// receives stable component references and never unmounts/remounts tabs.
const tabStacks = Object.fromEntries(
  tabs.map((tab) => [tab.tabId, createTabStack(tab.tabId)])
);

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
        tabBarIcon: () => <Text style={{ fontSize: 20 }}>{tabIcons[route.name]}</Text>,
      })}
    >
      {tabs.map((tab) => (
        <Tab.Screen key={tab.tabId} name={tab.tabId} component={tabStacks[tab.tabId]} options={{ title: tab.tabTitle }} />
      ))}
    </Tab.Navigator>
  );
}
