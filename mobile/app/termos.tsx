import { StyleSheet, Text } from "react-native";
import { Screen } from "@/components/ui";
import { useThemeColors } from "@/contexts/ThemeContext";

export default function TermosScreen() {
  const colors = useThemeColors();

  return (
    <Screen scroll>
      <Text style={[styles.title, { color: colors.contentPrimary }]}>
        Termos de utilização
      </Text>
      <Text style={[styles.meta, { color: colors.contentTertiary }]}>
        Última actualização: Julho de 2026 · Projecto académico ISPTEC
      </Text>

      <Text style={[styles.heading, { color: colors.contentPrimary }]}>
        1. Objecto
      </Text>
      <Text style={[styles.body, { color: colors.contentSecondary }]}>
        Estes termos regulam o acesso à plataforma Jindungo, destinada a
        conteúdos educativos sobre economia e história de Angola (vídeos,
        áudio, quizzes, fórum e mapa interactivo).
      </Text>

      <Text style={[styles.heading, { color: colors.contentPrimary }]}>
        2. Conta de utilizador
      </Text>
      <Text style={[styles.body, { color: colors.contentSecondary }]}>
        És responsável pela confidencialidade das tuas credenciais e pela
        exactidão das informações de perfil. O uso indevido da conta pode
        resultar em suspensão no âmbito do projecto académico.
      </Text>

      <Text style={[styles.heading, { color: colors.contentPrimary }]}>
        3. Conteúdos e conduta
      </Text>
      <Text style={[styles.body, { color: colors.contentSecondary }]}>
        Os conteúdos educativos são para fins de aprendizagem. No fórum, evita
        linguagem ofensiva, spam ou partilha de dados pessoais de terceiros.
      </Text>

      <Text style={[styles.heading, { color: colors.contentPrimary }]}>
        4. Limitação
      </Text>
      <Text style={[styles.body, { color: colors.contentSecondary }]}>
        A plataforma é um projecto académico e pode estar incompleta ou em
        evolução. Não constitui aconselhamento económico ou jurídico.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 8,
  },
  meta: {
    fontSize: 12,
    marginBottom: 20,
  },
  heading: {
    marginTop: 12,
    marginBottom: 6,
    fontSize: 16,
    fontWeight: "700",
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 8,
  },
});
