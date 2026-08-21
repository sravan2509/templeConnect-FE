import { Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import AdminDashboardScreen from "../screens/AdminDashboardScreen";
import AdminTempleUploadScreen from "../screens/Admin/AdminTempleUploadScreen";
import { colors } from "../theme";
import NodeScreen from "../screens/NodeScreen";

const Tab = createBottomTabNavigator();

const tabIcons: Record<string, string> = {
  Dashboard: "📊",
  Temples: "🛕",
  Priests: "👤",
  Content: "📚",
};

export function AdminTabs() {
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
      <Tab.Screen name="Dashboard" component={AdminDashboardScreen} />
      <Tab.Screen name="Temples" component={AdminTempleUploadScreen} />
      {/* For Priests and Content we use NodeScreen as placeholders or the respective screen if they exist. For now, use AdminDashboardScreen as placeholder */}
      <Tab.Screen name="Priests" component={AdminDashboardScreen} />
      <Tab.Screen name="Content" component={AdminDashboardScreen} />
    </Tab.Navigator>
  );
}
