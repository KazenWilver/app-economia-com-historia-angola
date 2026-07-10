import { StyleSheet, Text } from "react-native";
import { Screen } from "@/components/ui";
import { colors } from "@/lib/theme";

export default function PrivacidadeScreen() {
  return (
    <Screen scroll>
      <Text style={styles.title}>Política de privacidade</Text>
      <Text style={styles.meta}>
        Última actualização: Julho de 2026 · Projecto académico ISPTEC
      </Text>

      <Text style={styles.heading}>1. Quem somos</Text>
      <Text style={styles.body}>
        O Jindungo é uma plataforma educativa desenvolvida no âmbito da unidade
        curricular Engenharia de Software II (ISPTEC). Tratamos dados pessoais
        apenas para autenticação, personalização de conteúdos e funcionamento
        do fórum, quizzes e mapa.
      </Text>

      <Text style={styles.heading}>2. Dados que recolhemos</Text>
      <Text style={styles.body}>
        Nome e email no registo; palavra-passe cifrada; actividade na
        plataforma (quizzes, comentários, tópicos); preferências de perfil.
      </Text>

      <Text style={styles.heading}>3. Finalidade</Text>
      <Text style={styles.body}>
        Utilizamos os dados para autenticar utilizadores, apresentar
        recomendações educativas, moderar o fórum e melhorar a experiência de
        aprendizagem. Não vendemos dados a terceiros.
      </Text>

      <Text style={styles.heading}>4. Conservação e segurança</Text>
      <Text style={styles.body}>
        Os dados são guardados enquanto a conta estiver activa no âmbito do
        projecto. Podes pedir a actualização ou eliminação dos teus dados
        através do perfil ou aos administradores académicos.
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
