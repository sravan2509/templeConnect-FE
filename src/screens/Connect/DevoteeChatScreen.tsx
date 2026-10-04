import { useLayoutEffect } from "react";
import { View } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { colors } from "../../theme";
import { useAuth } from "../../context/AuthContext";
import { ChatThread } from "../../components/ChatThread";

export default function DevoteeChatScreen({ route, navigation }: any) {
  const { priestId, priestName } = route.params as { priestId: string; priestName: string };
  const { user } = useAuth();
  const headerHeight = useHeaderHeight();

  // The stack header already shows the back button; just title it with the priest's name.
  useLayoutEffect(() => {
    navigation.setOptions({ title: priestName || "Chat with Priest" });
  }, [navigation, priestName]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ChatThread otherUserId={priestId} myUserId={user?.id} placeholder="Message your priest..." keyboardOffset={headerHeight} />
    </View>
  );
}
