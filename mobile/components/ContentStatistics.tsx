import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/lib/theme";

function formatLabel(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function ContentStatistics({ data }: { data: string }) {
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
    return <Text style={styles.raw}>{trimmed}</Text>;
  }

  return (
    <View style={styles.grid}>
      {Object.entries(parsed).map(([key, value]) => (
        <View key={key} style={styles.item}>
          <Text style={styles.label}>{formatLabel(key)}</Text>
          <Text style={styles.value}>
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
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    backgroundColor: colors.surface,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.contentTertiary,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.bordeaux,
  },
  raw: {
    fontSize: 15,
    lineHeight: 24,
    color: colors.contentPrimary,
  },
});
