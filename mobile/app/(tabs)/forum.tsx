import { StyleSheet, Text } from "react-native";
import { MessageSquare } from "lucide-react-native";
import { Screen, Title } from "@/components/ui";
import { colors } from "@/lib/theme";

/** Placeholder — fórum completo no commit seguinte. */
export default function ForumScreen() {
  return (
    <Screen>
      <Title title="Fórum" subtitle="Debates e tópicos da comunidade." />
      <MessageSquare
        color={colors.bordeaux}
        size={40}
        strokeWidth={1.5}
        style={styles.icon}
      />
      <Text style={styles.body}>
        O fórum completo chega em breve nesta app.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  icon: { marginTop: 8, marginBottom: 16 },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.contentSecondary,
  },
});
