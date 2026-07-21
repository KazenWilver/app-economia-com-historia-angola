import { useCallback, useMemo, useState } from "react";
import {
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  UIManager,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeInUp,
  LinearTransition,
} from "react-native-reanimated";
import { router } from "expo-router";
import {
  USER_GUIDE_META,
  USER_GUIDE_SECTIONS,
  type GuideSection,
} from "@shared/guide";
import { Card, PrimaryButton, Screen, Title } from "@/components/ui";
import { useThemeColors } from "@/contexts/ThemeContext";
import { ManualGuideImage } from "@/lib/manual-images";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function GuideSectionCard({
  section,
  index,
  open,
  onToggle,
}: {
  section: GuideSection;
  index: number;
  open: boolean;
  onToggle: () => void;
}) {
  const colors = useThemeColors();

  return (
    <Animated.View
      entering={FadeInUp.delay(Math.min(index * 35, 420)).duration(420)}
      layout={LinearTransition.springify().damping(18)}
      style={styles.sectionWrap}
    >
      <Card>
        <Pressable
          onPress={onToggle}
          accessibilityRole="button"
          accessibilityState={{ expanded: open }}
          style={styles.sectionHeader}
        >
          <View style={styles.sectionHeaderText}>
            <Text style={[styles.sectionTitle, { color: colors.contentPrimary }]}>
              {section.title}
            </Text>
            <Text
              style={[styles.sectionSummary, { color: colors.contentSecondary }]}
            >
              {section.summary}
            </Text>
          </View>
          <Text style={[styles.chevron, { color: colors.bordeaux }]}>
            {open ? "−" : "+"}
          </Text>
        </Pressable>

        {open ? (
          <Animated.View entering={FadeInDown.duration(280)} style={styles.body}>
            <View
              style={[
                styles.purposeBox,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.surfaceSecondary,
                },
              ]}
            >
              <Text style={[styles.boxLabel, { color: colors.petrol }]}>
                Para que serve
              </Text>
              <Text style={[styles.boxText, { color: colors.contentPrimary }]}>
                {section.purpose}
              </Text>
            </View>

            <View style={styles.split}>
              <View
                style={[
                  styles.canBox,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.surfaceSecondary,
                  },
                ]}
              >
                <Text style={[styles.boxLabel, { color: colors.success }]}>
                  O que podes fazer
                </Text>
                {section.canDo.map((item) => (
                  <Text
                    key={item}
                    style={[styles.bullet, { color: colors.contentSecondary }]}
                  >
                    • {item}
                  </Text>
                ))}
              </View>

              <View
                style={[
                  styles.cannotBox,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.surfaceSecondary,
                  },
                ]}
              >
                <Text style={[styles.boxLabel, { color: colors.error }]}>
                  O que não podes fazer
                </Text>
                {section.cannotDo.map((item) => (
                  <Text
                    key={item}
                    style={[styles.bullet, { color: colors.contentSecondary }]}
                  >
                    • {item}
                  </Text>
                ))}
              </View>
            </View>

            <Text style={[styles.howLabel, { color: colors.contentTertiary }]}>
              Como fazer
            </Text>
            {section.steps.map((step, stepIndex) => (
              <View key={step.title} style={styles.step}>
                <View
                  style={[
                    styles.stepBadge,
                    { backgroundColor: colors.surfaceSecondary },
                  ]}
                >
                  <Text style={[styles.stepBadgeText, { color: colors.gold }]}>
                    {stepIndex + 1}
                  </Text>
                </View>
                <View style={styles.stepText}>
                  <Text
                    style={[styles.stepTitle, { color: colors.contentPrimary }]}
                  >
                    {step.title}
                  </Text>
                  <Text
                    style={[styles.stepBody, { color: colors.contentSecondary }]}
                  >
                    {step.body}
                  </Text>
                </View>
              </View>
            ))}

            {section.images && section.images.length > 0 ? (
              <View style={styles.imagesBlock}>
                <Text
                  style={[styles.howLabel, { color: colors.contentTertiary }]}
                >
                  Vê o ecrã
                </Text>
                {section.images.map((image) => (
                  <View key={image.file} style={styles.imageWrap}>
                    <ManualGuideImage file={image.file} alt={image.alt} />
                    <Text
                      style={[
                        styles.imageCaption,
                        { color: colors.contentSecondary },
                      ]}
                    >
                      {image.caption}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}
          </Animated.View>
        ) : null}
      </Card>
    </Animated.View>
  );
}

export default function AjudaScreen() {
  const colors = useThemeColors();
  const sections = USER_GUIDE_SECTIONS;
  const [openIds, setOpenIds] = useState<Set<string>>(
    () => new Set(sections.map((section) => section.id)),
  );

  const allOpen = useMemo(
    () => openIds.size === sections.length,
    [openIds.size, sections.length],
  );

  const toggle = useCallback((section: GuideSection) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(section.id)) {
        next.delete(section.id);
      } else {
        next.add(section.id);
      }
      return next;
    });
  }, []);

  const expandAll = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenIds(new Set(sections.map((section) => section.id)));
  };

  const collapseAll = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenIds(new Set());
  };

  return (
    <Screen scroll>
      <Animated.View entering={FadeInDown.duration(500)}>
        <Title title={USER_GUIDE_META.title} subtitle={USER_GUIDE_META.intro} />
        <Text style={[styles.meta, { color: colors.contentTertiary }]}>
          {USER_GUIDE_META.product} · {USER_GUIDE_META.codename} v
          {USER_GUIDE_META.version}
        </Text>
        <Text style={[styles.meta, { color: colors.contentSecondary }]}>
          {USER_GUIDE_META.creators}
        </Text>
      </Animated.View>

      <View style={styles.actions}>
        <PrimaryButton
          label={allOpen ? "Recolher tudo" : "Expandir tudo"}
          onPress={allOpen ? collapseAll : expandAll}
        />
        <View style={styles.spacer} />
        <PrimaryButton
          label="Sobre nós — a equipa"
          onPress={() => router.push("/sobre-nos" as never)}
        />
      </View>

      {sections.map((section, index) => (
        <GuideSectionCard
          key={section.id}
          section={section}
          index={index}
          open={openIds.has(section.id)}
          onToggle={() => toggle(section)}
        />
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  meta: {
    fontSize: 12,
    marginBottom: 4,
    lineHeight: 17,
  },
  actions: {
    marginTop: 12,
    marginBottom: 8,
  },
  spacer: {
    height: 8,
  },
  sectionWrap: {
    marginTop: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  sectionHeaderText: {
    flex: 1,
    gap: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  sectionSummary: {
    fontSize: 13,
    lineHeight: 18,
  },
  chevron: {
    fontSize: 22,
    fontWeight: "600",
    lineHeight: 24,
  },
  body: {
    marginTop: 14,
    gap: 12,
  },
  purposeBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  split: {
    gap: 10,
  },
  canBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  cannotBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  boxLabel: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  boxText: {
    fontSize: 13,
    lineHeight: 19,
  },
  bullet: {
    fontSize: 13,
    lineHeight: 18,
  },
  howLabel: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginTop: 4,
  },
  step: {
    flexDirection: "row",
    gap: 10,
  },
  stepBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  stepBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  stepText: {
    flex: 1,
    gap: 2,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  stepBody: {
    fontSize: 13,
    lineHeight: 19,
  },
  imagesBlock: {
    gap: 12,
    marginTop: 4,
  },
  imageWrap: {
    gap: 6,
  },
  imageCaption: {
    fontSize: 12,
    lineHeight: 17,
  },
});
