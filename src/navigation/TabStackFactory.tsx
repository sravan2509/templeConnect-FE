import { createNativeStackNavigator } from "@react-navigation/native-stack";
import NodeScreen from "../screens/NodeScreen";
import HomeScreen from "../screens/Home/HomeScreen";
import TempleSearchScreen from "../screens/TempleSearchScreen";
import TempleDetailScreen from "../screens/TempleDetailScreen";
import BirthChartFormScreen from "../screens/BirthChartFormScreen";
import BirthChartResultScreen from "../screens/BirthChartResultScreen";
import BookPujaScreen from "../screens/BookPujaScreen";
import MapScreen from "../screens/MapScreen";
import AdminDashboardScreen from "../screens/AdminDashboardScreen";
import ChangePasswordScreen from "../screens/ChangePasswordScreen";
import { colors } from "../theme";
import { findNode, tabs } from "../content/tree";

const Stack = createNativeStackNavigator();
const screenOptions = {
  headerStyle: { backgroundColor: colors.bg },
  headerTintColor: colors.text,
  headerShadowVisible: false,
  contentStyle: { backgroundColor: colors.bg },
};

export function createTabStack(tabId: string) {
  const tab = tabs.find((t) => t.tabId === tabId)!;
  return function TabStack() {
    return (
      <Stack.Navigator screenOptions={screenOptions}>
        <Stack.Screen name="Root" component={tabId === "home" ? HomeScreen : NodeScreen}
          initialParams={{ tabId, nodeId: tab.root.id }}
          options={{ title: tab.tabTitle, headerShown: tabId !== "home" }} />
        <Stack.Screen name="Node" component={NodeScreen}
          options={({ route }: any) => ({ title: findNode(tabId, route.params?.nodeId)?.title ?? "" })} />
        <Stack.Screen name="TempleSearch" component={TempleSearchScreen} options={{ title: "Search Temples" }} />
        <Stack.Screen name="TempleDetail" component={TempleDetailScreen} options={{ title: "Temple Details" }} />
        <Stack.Screen name="BirthChartForm" component={BirthChartFormScreen} options={{ title: "Birth Details" }} />
        <Stack.Screen name="BirthChartResult" component={BirthChartResultScreen} options={{ title: "Spiritual Profile" }} />
        <Stack.Screen name="BookPuja" component={BookPujaScreen} options={{ title: "Book Puja" }} />
        <Stack.Screen name="Map" component={MapScreen} options={{ title: "Map" }} />
        <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ title: "Admin" }} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: "Change Password" }} />
      </Stack.Navigator>
    );
  };
}
