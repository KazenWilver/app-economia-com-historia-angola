import { StyleSheet, Text } from "react-native";
import { Screen } from "@/components/ui";
import { colors } from "@/lib/theme";

export default function TermosScreen() {
  return (
    <Screen scroll>
      <Text style={styles.title}>Termos de utilização</Text>
      <Text style={styles.meta}>
        Última actualização: Julho de 2026 · Projecto académico ISPTEC
      </Text>

      <Text style={styles.heading}>1. Objecto</Text>
      <Text style={styles.body}>
        Estes termos regulam o acesso à plataforma Jindungo, destinada a
        conteúdos educativos sobre economia e história de Angola (vídeos,
        áudio, quizzes, fórum e mapa interactivo).
      </Text>

      <Text style={styles.heading}>2. Conta de utilizador</Text>
      <Text style={styles.body}>
        És responsável pela confidencialidade das tuas credenciais e pela
        exactidão das informações de perfil. O uso indevido da conta pode
        resultar em suspensão no âmbito do projecto académico.
      </Text>

      <Text style={styles.heading}>3. Conteúdos e conduta</Text>
      <Text style={styles.body}>
        Os conteúdos educativos são para fins de aprendizagem. No fórum, evita
        linguagem ofensiva, spam ou partilha de dados pessoais de terceiros.
      </Text>

      <Text style={styles.heading}>4. Limitação</Text>
      <Text style={styles.body}>
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
    color: colors.contentPrimary,
    marginBottom: 8,
  },
  meta: {
    fontSize: 12,
    color: colors.contentTertiary,
    marginBottom: 20,
  },
  heading: {
    marginTop: 12,
    marginBottom: 6,
    fontSize: 16,
    fontWeight: "700",
    color: colors.contentPrimary,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.contentSecondary,
    marginBottom: 8,
  },
});
