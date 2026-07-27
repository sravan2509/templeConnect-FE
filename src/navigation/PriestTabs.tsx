import { Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import PriestDashboardScreen from "../screens/PriestDashboardScreen";
import PriestProfileScreen from "../screens/Priest/PriestProfileScreen";
import PriestChatScreen from "../screens/Priest/PriestChatScreen";
import PriestNotificationsScreen from "../screens/Priest/PriestNotificationsScreen";
import { colors } from "../theme";

const Tab = createBottomTabNavigator();

const tabIcons: Record<string, string> = {
  Bookings: "📅",
  Profile: "👤",
  Chat: "💬",
  Notifications: "🔔",
};

export function PriestTabs() {
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
      <Tab.Screen name="Bookings" component={PriestDashboardScreen} />
      <Tab.Screen name="Chat" component={PriestChatScreen} />
      <Tab.Screen name="Notifications" component={PriestNotificationsScreen} />
      <Tab.Screen name="Profile" component={PriestProfileScreen} />
    </Tab.Navigator>
  );
}
