import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { router } from "expo-router";
import {
  PROJECT_ABOUT,
  TEAM_CREDIT_LINE,
  TEAM_MEMBERS,
} from "@shared/guide";
import { Card, PrimaryButton, Screen, Title } from "@/components/ui";
import { useThemeColors } from "@/contexts/ThemeContext";

export default function SobreNosScreen() {
  const colors = useThemeColors();

  return (
    <Screen scroll>
      <Animated.View entering={FadeInDown.duration(480)}>
        <Title
          title="Sobre nós"
          subtitle={PROJECT_ABOUT.tagline}
        />
        <Text style={[styles.credit, { color: colors.contentSecondary }]}>
          {TEAM_CREDIT_LINE}
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(80).duration(420)}>
        <Card>
          <Text style={[styles.heading, { color: colors.contentPrimary }]}>
            Missão
          </Text>
          <Text style={[styles.body, { color: colors.contentSecondary }]}>
            {PROJECT_ABOUT.mission}
          </Text>
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(140).duration(420)}>
        <Card>
          <Text style={[styles.heading, { color: colors.contentPrimary }]}>
            Contexto académico
          </Text>
          <Text style={[styles.body, { color: colors.contentSecondary }]}>
            Instituição: {PROJECT_ABOUT.institution}
          </Text>
          <Text style={[styles.body, { color: colors.contentSecondary }]}>
            Unidade curricular: {PROJECT_ABOUT.course}
          </Text>
          <Text style={[styles.body, { color: colors.contentSecondary }]}>
            Equipa: {PROJECT_ABOUT.group} · {PROJECT_ABOUT.academicYear}
          </Text>
          <Text style={[styles.body, { color: colors.contentSecondary }]}>
            Codinome: {PROJECT_ABOUT.codename}
          </Text>
          <Text style={[styles.body, { color: colors.contentSecondary }]}>
            Stack: {PROJECT_ABOUT.stack}
          </Text>
        </Card>
      </Animated.View>

      <Text style={[styles.section, { color: colors.contentPrimary }]}>
        A equipa
      </Text>

      {TEAM_MEMBERS.map((member, index) => (
        <Animated.View
          key={member.name}
          entering={FadeInUp.delay(180 + index * 60).duration(400)}
          style={styles.memberWrap}
        >
          <Card>
            <Text style={[styles.memberName, { color: colors.bordeaux }]}>
              {member.name}
            </Text>
            <Text style={[styles.memberRole, { color: colors.contentPrimary }]}>
              {member.role}
            </Text>
            <Text style={[styles.body, { color: colors.contentSecondary }]}>
              {member.focus}
            </Text>
            {member.email ? (
              <Text style={[styles.email, { color: colors.petrol }]}>
                {member.email}
              </Text>
            ) : null}
          </Card>
        </Animated.View>
      ))}

      <View style={styles.actions}>
        <PrimaryButton
          label="Abrir guia completo"
          onPress={() => router.push("/ajuda" as never)}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  credit: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  heading: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  body: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 4,
  },
  section: {
    marginTop: 16,
    marginBottom: 8,
    fontSize: 18,
    fontWeight: "700",
  },
  memberWrap: {
    marginBottom: 10,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 4,
  },
  memberRole: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
  },
  email: {
    marginTop: 8,
    fontSize: 12,
  },
  actions: {
    marginTop: 16,
    marginBottom: 24,
  },
});
