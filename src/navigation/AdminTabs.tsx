import { Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AdminDashboardScreen from "../screens/AdminDashboardScreen";
import AdminTempleUploadScreen from "../screens/Admin/AdminTempleUploadScreen";
import ChangePasswordScreen from "../screens/ChangePasswordScreen";
import { colors } from "../theme";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const tabIcons: Record<string, string> = {
  Dashboard: "📊",
  Pujas: "🪔",
  Priests: "🧑‍🦱",
  Content: "📚",
  Temples: "🛕",
};

// Each tab renders one section of the admin console.
const DashboardTab = () => <AdminDashboardScreen section="dashboard" />;
const PujasTab = () => <AdminDashboardScreen section="pujas" />;
const PriestsTab = () => <AdminDashboardScreen section="priests" />;
const ContentTab = () => <AdminDashboardScreen section="content" />;

function AdminTabsInner() {
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
      <Tab.Screen name="Dashboard" component={DashboardTab} />
      <Tab.Screen name="Pujas" component={PujasTab} />
      <Tab.Screen name="Priests" component={PriestsTab} />
      <Tab.Screen name="Content" component={ContentTab} />
      <Tab.Screen name="Temples" component={AdminTempleUploadScreen} />
    </Tab.Navigator>
  );
}

export function AdminTabs() {
  return (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: colors.bg }, headerTintColor: colors.text, headerShadowVisible: false }}>
      <Stack.Screen name="AdminHome" component={AdminTabsInner} options={{ headerShown: false }} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: "Change Password" }} />
    </Stack.Navigator>
  );
}
