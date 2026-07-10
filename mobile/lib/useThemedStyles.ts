import { useMemo } from "react";
import { StyleSheet, type ImageStyle, type TextStyle, type ViewStyle } from "react-native";
import { useThemeColors } from "@/contexts/ThemeContext";
import type { ThemeColors } from "@/lib/theme";

type NamedStyles = Record<string, ViewStyle | TextStyle | ImageStyle>;

/** Cria estilos dependentes do tema actual (recalcula no toggle). */
export function useThemedStyles<T extends NamedStyles>(
  factory: (c: ThemeColors) => T,
): T {
  const colors = useThemeColors();
  return useMemo(() => StyleSheet.create(factory(colors)), [colors, factory]);
}
