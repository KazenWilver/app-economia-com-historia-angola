import { Moon, Sun } from "lucide-react-native";
import { Pressable, StyleSheet } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";

export function ThemeToggle({ size = 44 }: { size?: number }) {
  const { isDark, toggleTheme, colors } = useTheme();

  return (
    <Pressable
      onPress={toggleTheme}
      accessibilityLabel={isDark ? "Activar modo claro" : "Activar modo escuro"}
      hitSlop={8}
      style={({ pressed }) => [
        styles.button,
        {
          width: size,
          height: size,
          borderColor: colors.border,
          backgroundColor: colors.surfaceSecondary,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      {isDark ? (
        <Sun color={colors.contentPrimary} size={20} strokeWidth={1.5} />
      ) : (
        <Moon color={colors.contentPrimary} size={20} strokeWidth={1.5} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
