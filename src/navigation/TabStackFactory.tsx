import { createNativeStackNavigator } from "@react-navigation/native-stack";
import NodeScreen from "../screens/NodeScreen";
import HomeScreen from "../screens/Home/HomeScreen";
import TempleSearchScreen from "../screens/TempleSearchScreen";
import TempleDetailScreen from "../screens/TempleDetailScreen";
import BirthChartFormScreen from "../screens/BirthChartFormScreen";
import BirthChartResultScreen from "../screens/BirthChartResultScreen";
import BookPujaScreen from "../screens/BookPujaScreen";
import MapScreen from "../screens/MapScreen";
import ChangePasswordScreen from "../screens/ChangePasswordScreen";
import DevoteeChatScreen from "../screens/Connect/DevoteeChatScreen";
import { colors } from "../theme";
import { findNode, tabs } from "../content/tree";

const Stack = createNativeStackNavigator();
const screenOptions = {
  headerStyle: { backgroundColor: colors.bg },
  headerTintColor: colors.text,
  headerShadowVisible: false,
  headerBackTitle: "Back",
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
          options={({ route }: any) => ({ title: findNode(route.params?.tabId ?? tabId, route.params?.nodeId)?.title ?? "" })} />
        <Stack.Screen name="TempleSearch" component={TempleSearchScreen} options={{ title: "Search Temples" }} />
        <Stack.Screen name="TempleDetail" component={TempleDetailScreen} options={{ title: "Temple Details" }} />
        <Stack.Screen name="BirthChartForm" component={BirthChartFormScreen} options={{ title: "Birth Details" }} />
        <Stack.Screen name="BirthChartResult" component={BirthChartResultScreen} options={{ title: "Spiritual Profile" }} />
        <Stack.Screen name="BookPuja" component={BookPujaScreen} options={{ title: "Book a Puja" }} />
        <Stack.Screen name="Map" component={MapScreen} options={({ route }: any) => ({ title: route.params?.name ?? "Temple Map" })} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: "Change Password" }} />
        <Stack.Screen name="DevoteeChat" component={DevoteeChatScreen} options={{ title: "Chat with Priest" }} />
      </Stack.Navigator>
    );
  };
}
