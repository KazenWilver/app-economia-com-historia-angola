import { Image } from "react-native";

/** Mapa estático das capturas do guia (assets locais). */
export const MANUAL_IMAGE_SOURCES: Record<string, number> = {
  "01-inicio.png": require("../assets/manual/01-inicio.png"),
  "02-entrar.png": require("../assets/manual/02-entrar.png"),
  "03-explorar.png": require("../assets/manual/03-explorar.png"),
  "04-conteudo.png": require("../assets/manual/04-conteudo.png"),
  "05-trilho.png": require("../assets/manual/05-trilho.png"),
  "06-tutor.png": require("../assets/manual/06-tutor.png"),
  "07-quiz.png": require("../assets/manual/07-quiz.png"),
  "08-ranking.png": require("../assets/manual/08-ranking.png"),
  "09-forum.png": require("../assets/manual/09-forum.png"),
  "10-mapa.png": require("../assets/manual/10-mapa.png"),
  "11-perfil.png": require("../assets/manual/11-perfil.png"),
  "12-jindungo.png": require("../assets/manual/12-jindungo.png"),
  "13-ajuda.png": require("../assets/manual/13-ajuda.png"),
  "14-admin.png": require("../assets/manual/14-admin.png"),
};

export function ManualGuideImage({
  file,
  alt,
}: {
  file: string;
  alt: string;
}) {
  const source = MANUAL_IMAGE_SOURCES[file];
  if (!source) {
    return null;
  }

  return (
    <Image
      source={source}
      accessibilityLabel={alt}
      resizeMode="contain"
      style={{ width: "100%", aspectRatio: 16 / 10, borderRadius: 12 }}
    />
  );
}
