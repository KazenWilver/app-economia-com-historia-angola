import { Tabs } from "expo-router";
import {
  BookOpen,
  HelpCircle,
  Map,
  MessageSquare,
  User,
} from "lucide-react-native";
import { ActivityIndicator, View } from "react-native";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

export default function TabsLayout() {
  const { isLoading } = useAuth();
  const { colors } = useTheme();

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
        headerStyle: { backgroundColor: colors.surfaceCard },
        headerTintColor: colors.contentPrimary,
        headerTitleStyle: { fontWeight: "700", color: colors.contentPrimary },
        headerShadowVisible: false,
        headerRight: () => (
          <View style={{ marginRight: 12 }}>
            <ThemeToggle size={40} />
          </View>
        ),
        tabBarActiveTintColor: colors.bordeaux,
        tabBarInactiveTintColor: colors.contentTertiary,
        tabBarStyle: {
          backgroundColor: colors.surfaceCard,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
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
