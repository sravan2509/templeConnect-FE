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
        <Tab.Screen key={tab.tabId} name={tab.tabId} component={createTabStack(tab.tabId)} options={{ title: tab.tabTitle }} />
      ))}
    </Tab.Navigator>
  );
}
