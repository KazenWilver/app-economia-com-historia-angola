import { StyleSheet, Text, View } from "react-native";
import { useThemeColors } from "@/contexts/ThemeContext";

function formatLabel(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function ContentStatistics({ data }: { data: string }) {
  const colors = useThemeColors();
  const trimmed = data.trim();

  if (!trimmed) {
    return null;
  }

  let parsed: Record<string, unknown> | null = null;

  try {
    const json = JSON.parse(trimmed) as unknown;
    if (json && typeof json === "object" && !Array.isArray(json)) {
      parsed = json as Record<string, unknown>;
    }
  } catch {
    parsed = null;
  }

  if (!parsed) {
    return (
      <Text style={[styles.raw, { color: colors.contentPrimary }]}>
        {trimmed}
      </Text>
    );
  }

  return (
    <View style={styles.grid}>
      {Object.entries(parsed).map(([key, value]) => (
        <View
          key={key}
          style={[
            styles.item,
            {
              borderColor: colors.border,
              backgroundColor: colors.surfaceSecondary,
            },
          ]}
        >
          <Text style={[styles.label, { color: colors.contentTertiary }]}>
            {formatLabel(key)}
          </Text>
          <Text style={[styles.value, { color: colors.bordeaux }]}>
            {typeof value === "object" ? JSON.stringify(value) : String(value)}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: 10,
  },
  item: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: "800",
  },
  raw: {
    fontSize: 15,
    lineHeight: 24,
  },
});
