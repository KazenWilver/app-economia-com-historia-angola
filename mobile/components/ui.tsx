import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { useTheme, useThemeColors } from "@/contexts/ThemeContext";
import type { ThemeColors } from "@/lib/theme";

export function Screen({
  children,
  scroll = false,
}: {
  children: React.ReactNode;
  scroll?: boolean;
}) {
  const colors = useThemeColors();

  if (scroll) {
    return (
      <ScrollView
        style={[styles.screen, { backgroundColor: colors.surface }]}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.surface }]}>
      {children}
    </View>
  );
}

export function Title({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  const colors = useThemeColors();

  return (
    <View style={styles.titleBlock}>
      <View style={styles.titleRow}>
        <View style={styles.titleTextWrap}>
          <Text
            style={[
              styles.title,
              { color: colors.contentPrimary },
            ]}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: colors.contentSecondary }]}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {right ? <View style={styles.titleRight}>{right}</View> : null}
      </View>
    </View>
  );
}

export function Card({
  children,
  onPress,
}: {
  children: React.ReactNode;
  onPress?: () => void;
}) {
  const colors = useThemeColors();
  const cardStyle = [
    styles.card,
    {
      backgroundColor: colors.surfaceCard,
      borderColor: colors.border,
    },
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [...cardStyle, pressed && styles.cardPressed]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

export function Field(
  props: TextInputProps & {
    label: string;
    error?: string;
  },
) {
  const colors = useThemeColors();
  const { label, error, style, ...rest } = props;

  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.contentSecondary }]}>
        {label}
      </Text>
      <TextInput
        placeholderTextColor={colors.contentTertiary}
        style={[
          styles.input,
          {
            borderColor: colors.border,
            backgroundColor: colors.surfaceCard,
            color: colors.contentPrimary,
          },
          style,
        ]}
        {...rest}
      />
      {error ? (
        <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
      ) : null}
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  isLoading = false,
  disabled = false,
  variant = "primary",
}: {
  label: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "danger" | "secondary";
}) {
  const colors = useThemeColors();
  const backgroundColor =
    variant === "danger"
      ? colors.error
      : variant === "secondary"
        ? colors.surfaceSecondary
        : colors.bordeaux;

  const textColor =
    variant === "secondary" ? colors.contentPrimary : colors.white;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || isLoading}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor },
        (disabled || isLoading) && styles.buttonDisabled,
        pressed && styles.buttonPressed,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.buttonText, { color: textColor }]}>{label}</Text>
      )}
    </Pressable>
  );
}

export function EmptyState({ message }: { message: string }) {
  const colors = useThemeColors();
  return (
    <View style={styles.empty}>
      <Text style={[styles.emptyText, { color: colors.contentSecondary }]}>
        {message}
      </Text>
    </View>
  );
}

/** Estilos de tipografia/cartão reutilizáveis por ecrã. */
export function makeContentStyles(c: ThemeColors) {
  return StyleSheet.create({
    cardTitle: {
      fontSize: 17,
      fontWeight: "700",
      color: c.contentPrimary,
      marginBottom: 6,
    },
    cardBody: {
      fontSize: 14,
      lineHeight: 20,
      color: c.contentSecondary,
      marginBottom: 8,
    },
    meta: {
      fontSize: 12,
      color: c.contentTertiary,
      fontWeight: "600",
    },
    error: {
      marginTop: 12,
      color: c.error,
      fontSize: 14,
    },
    badge: {
      fontSize: 12,
      fontWeight: "700",
      color: c.bordeaux,
      backgroundColor: c.bordeauxMuted,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      overflow: "hidden",
    },
  });
}

export function useIsDark() {
  return useTheme().isDark;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  scrollContent: {
    paddingBottom: 40,
    flexGrow: 1,
  },
  titleBlock: {
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  titleTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  titleRight: {
    paddingTop: 2,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  cardPressed: {
    opacity: 0.88,
  },
  field: {
    marginBottom: 14,
  },
  label: {
    marginBottom: 6,
    fontSize: 13,
    fontWeight: "700",
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  error: {
    marginTop: 6,
    fontSize: 12,
  },
  button: {
    minHeight: 48,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonPressed: {
    opacity: 0.88,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "700",
  },
  empty: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 15,
    lineHeight: 22,
  },
});
