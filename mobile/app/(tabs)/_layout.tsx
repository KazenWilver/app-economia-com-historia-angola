import { Tabs } from "expo-router";
import {
  BookOpen,
  HelpCircle,
  Map,
  MessageSquare,
  User,
} from "lucide-react-native";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { colors } from "@/lib/theme";

export default function TabsLayout() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.surface,
        }}
      >
        <ActivityIndicator color={colors.bordeaux} />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.surfaceDark },
        headerTintColor: colors.contentDarkPrimary,
        headerTitleStyle: { fontWeight: "700" },
        tabBarActiveTintColor: colors.bordeaux,
        tabBarInactiveTintColor: colors.contentSecondary,
        tabBarStyle: {
          backgroundColor: colors.surfaceElevated,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tabs.Screen
        name="explorar"
        options={{
          title: "Explorar",
          tabBarIcon: ({ color, size }) => (
            <BookOpen color={color} size={size} strokeWidth={1.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="quiz"
        options={{
          title: "Quiz",
          tabBarIcon: ({ color, size }) => (
            <HelpCircle color={color} size={size} strokeWidth={1.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="forum"
        options={{
          title: "Fórum",
          tabBarIcon: ({ color, size }) => (
            <MessageSquare color={color} size={size} strokeWidth={1.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="mapa"
        options={{
          title: "Mapa",
          tabBarIcon: ({ color, size }) => (
            <Map color={color} size={size} strokeWidth={1.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size }) => (
            <User color={color} size={size} strokeWidth={1.5} />
          ),
        }}
      />
    </Tabs>
  );
}
