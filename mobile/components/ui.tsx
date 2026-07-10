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
import { colors } from "@/lib/theme";

export function Screen({
  children,
  scroll = false,
}: {
  children: React.ReactNode;
  scroll?: boolean;
}) {
  if (scroll) {
    return (
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    );
  }

  return <View style={styles.screen}>{children}</View>;
}

export function Title({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.titleBlock}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
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
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={styles.card}>{children}</View>;
}

export function Field(
  props: TextInputProps & {
    label: string;
    error?: string;
    variant?: "dark" | "light";
  },
) {
  const { label, error, style, variant = "dark", ...rest } = props;
  const isLight = variant === "light";

  return (
    <View style={styles.field}>
      <Text style={[styles.label, isLight && styles.labelLight]}>{label}</Text>
      <TextInput
        placeholderTextColor={
          isLight ? colors.contentTertiary : colors.contentTertiary
        }
        style={[styles.input, isLight && styles.inputLight, style]}
        {...rest}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
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
  variant?: "primary" | "danger";
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || isLoading}
      style={({ pressed }) => [
        styles.button,
        variant === "danger" && styles.buttonDanger,
        (disabled || isLoading) && styles.buttonDisabled,
        pressed && styles.buttonPressed,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        <Text style={styles.buttonText}>{label}</Text>
      )}
    </Pressable>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  titleBlock: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.contentPrimary,
    letterSpacing: -0.4,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    color: colors.contentSecondary,
  },
  card: {
    backgroundColor: colors.surfaceCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
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
    fontSize: 14,
    fontWeight: "700",
    color: colors.contentDarkPrimary,
  },
  labelLight: {
    color: colors.contentPrimary,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.borderDark,
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: colors.surfaceDark,
    color: colors.contentDarkPrimary,
  },
  inputLight: {
    borderColor: colors.border,
    backgroundColor: colors.surfaceCard,
    color: colors.contentPrimary,
  },
  error: {
    marginTop: 6,
    color: colors.error,
    fontSize: 12,
  },
  button: {
    minHeight: 48,
    borderRadius: 999,
    backgroundColor: colors.bordeaux,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  buttonDanger: {
    backgroundColor: colors.error,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonPressed: {
    opacity: 0.88,
  },
  buttonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "700",
  },
  empty: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    textAlign: "center",
    color: colors.contentSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
});
