import { createNativeStackNavigator } from "@react-navigation/native-stack";
import NodeScreen from "../screens/NodeScreen";
import HomeScreen from "../screens/Home/HomeScreen";
import TempleSearchScreen from "../screens/TempleSearchScreen";
import BirthChartFormScreen from "../screens/BirthChartFormScreen";
import BirthChartResultScreen from "../screens/BirthChartResultScreen";
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
        <Stack.Screen
          name="Root"
          component={tabId === "home" ? HomeScreen : NodeScreen}
          initialParams={{ tabId, nodeId: tab.root.id }}
          options={{ title: tab.tabTitle, headerShown: tabId !== "home" }}
        />
        <Stack.Screen
          name="Node"
          component={NodeScreen}
          options={({ route }: any) => ({ title: findNode(tabId, route.params?.nodeId)?.title ?? "" })}
        />
        <Stack.Screen name="TempleSearch" component={TempleSearchScreen} options={{ title: "Temple Search" }} />
        <Stack.Screen name="BirthChartForm" component={BirthChartFormScreen} options={{ title: "Birth Details" }} />
        <Stack.Screen name="BirthChartResult" component={BirthChartResultScreen} options={{ title: "Spiritual Profile" }} />
      </Stack.Navigator>
    );
  };
}
