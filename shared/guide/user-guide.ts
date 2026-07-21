/**
 * Guia de utilização — linguagem simples, com exemplos e imagens.
 * Fonte única para web, admin, mobile e manual HTML/PDF.
 */

import { PROJECT_ABOUT, TEAM_CREDIT_LINE } from "./team";

export type GuideAudience = "all" | "web" | "admin" | "mobile";

export interface GuideStep {
  title: string;
  body: string;
}

export interface GuideImage {
  /** Nome do ficheiro em /manual-images/ (web) e docs/manual-images/ (PDF). */
  file: string;
  alt: string;
  caption: string;
}

export interface GuideSection {
  id: string;
  title: string;
  purpose: string;
  summary: string;
  audience: GuideAudience[];
  canDo: string[];
  cannotDo: string[];
  steps: GuideStep[];
  images?: GuideImage[];
}

export const USER_GUIDE_META = {
  title: "Guia fácil de utilização",
  product: PROJECT_ABOUT.product,
  codename: PROJECT_ABOUT.codename,
  version: "3.1",
  institution: `${PROJECT_ABOUT.institution} · ${PROJECT_ABOUT.course} · ${PROJECT_ABOUT.group} · ${PROJECT_ABOUT.academicYear}`,
  creators: TEAM_CREDIT_LINE,
  intro:
    "Este guia explica, com palavras simples e com imagens, como usar o site e a aplicação. Segue os passos um a um. Se vires uma imagem, compara com o teu ecrã — ajuda a não te perderes.",
} as const;

export const USER_GUIDE_SECTIONS: GuideSection[] = [
  {
    id: "visao-geral",
    title: "1. O que é esta aplicação?",
    purpose:
      "Isto serve para aprenderes sobre a economia e a história de Angola, no computador ou no telemóvel.",
    summary: "Há um site, um telemóvel e uma zona só para o administrador.",
    audience: ["all", "web", "admin", "mobile"],
    canDo: [
      "Ver textos, vídeos e áudios sobre Angola.",
      "Fazer quizzes (perguntas) e ver o ranking.",
      "Falar no fórum e ver o mapa das províncias.",
      "Pedir acesso a textos especiais (Jindungo).",
      "Perguntar ao Tutor (IA) sobre os temas da plataforma (com conta).",
    ],
    cannotDo: [
      "Não podes comprar coisas aqui — não há pagamentos.",
      "No telemóvel não existe a zona de administrador.",
      "Não envia mensagens tipo WhatsApp em tempo real.",
      "A IA não faz tudo sozinha — vê a secção 9.",
    ],
    steps: [
      {
        title: "No computador",
        body: "Abre o site no browser (Chrome, Edge, etc.). Em cima vês o menu: Explorar, Trilho, Tutor, Quiz, Ranking, Fórum, Mapa.",
      },
      {
        title: "No telemóvel",
        body: "Abre a app. Em baixo vês as abas: Explorar, Quiz, Fórum, Mapa e Perfil.",
      },
      {
        title: "Exemplo",
        body: "Queres ver um vídeo? Clica em Explorar → toca no filtro «Vídeo» → escolhe um cartão.",
      },
    ],
    images: [
      {
        file: "01-inicio.png",
        alt: "Página inicial do site com o botão Entrar",
        caption:
          "Página inicial: o botão vermelho «Entrar» fica em cima, à direita.",
      },
    ],
  },
  {
    id: "convidado",
    title: "2. Sem conta (só a olhar)",
    purpose:
      "Isto serve para conheceres o site antes de criares conta.",
    summary: "Podes ver muita coisa, mas não podes gravar progresso nem comentar.",
    audience: ["all", "web", "mobile"],
    canDo: [
      "Ver Explorar (textos e vídeos públicos).",
      "Ver o mapa e o ranking.",
      "Ler o fórum (tópicos abertos).",
    ],
    cannotDo: [
      "Não podes escrever comentários.",
      "Não podes fazer um quiz com pontuação.",
      "Não podes usar o Tutor nem a biblioteca Jindungo.",
    ],
    steps: [
      {
        title: "Como fazer",
        body: "Entra no site e usa o menu. Quando algo pedir conta, aparece o botão «Entrar».",
      },
      {
        title: "Exemplo",
        body: "Abres o Fórum e lês. Se quiseres responder, o site pede para iniciares sessão.",
      },
    ],
  },
  {
    id: "conta-sessao",
    title: "3. Entrar e criar conta",
    purpose:
      "Isto serve para o site te conhecer e guardar o teu progresso.",
    summary: "Precisas de email e palavra-passe. É como entrar no email.",
    audience: ["all", "web", "mobile"],
    canDo: [
      "Criar conta nova (Registar).",
      "Entrar com email e palavra-passe.",
      "Pedir nova palavra-passe se esqueceres.",
      "Sair quando terminares.",
    ],
    cannotDo: [
      "Não podes entrar com Google ou Facebook.",
      "Não mistures a conta de aluno com a de administrador.",
    ],
    steps: [
      {
        title: "Entrar no site",
        body: "Em cima à direita, clica no botão vermelho «Entrar». Escreve o teu email e a palavra-passe. Clica outra vez em «Entrar».",
      },
      {
        title: "Ainda não tens conta?",
        body: "Na mesma página, clica em «Registar». Preenche o nome, o email, a palavra-passe e a tua província. Depois entra.",
      },
      {
        title: "Exemplo de conta de teste",
        body: "Email: julieta@jindungo.ao — Palavra-passe: password (conta de utilizador normal).",
      },
      {
        title: "Esqueceste a palavra-passe?",
        body: "Clica em «Esqueci a palavra-passe», põe o email e segue as instruções.",
      },
    ],
    images: [
      {
        file: "02-entrar.png",
        alt: "Ecrã de entrar com email e palavra-passe",
        caption:
          "Ecrã «Entrar»: escreve o email, a palavra-passe e carrega no botão vermelho.",
      },
    ],
  },
  {
    id: "explorar",
    title: "4. Explorar (biblioteca de conteúdos)",
    purpose:
      "Isto serve para encontrares textos, áudios, vídeos e podcasts.",
    summary: "É a prateleira de materiais. Escolhes um cartão e abres.",
    audience: ["all", "web", "mobile"],
    canDo: [
      "Filtrar por tipo (Texto, Áudio, Vídeo, Podcast, Jindungo).",
      "Abrir um conteúdo e ler ou ouvir.",
      "Com conta: escrever comentários.",
    ],
    cannotDo: [
      "Não podes criar conteúdos novos (só o administrador).",
      "Sem acesso Jindungo, não abres os textos especiais.",
    ],
    steps: [
      {
        title: "Abrir Explorar",
        body: "No menu de cima, clica em «Explorar». No telemóvel, toca na aba «Explorar».",
      },
      {
        title: "Escolher um tipo",
        body: "Clica num filtro redondo: Todos, Texto, Áudio, Vídeo, Podcast ou Jindungo.",
      },
      {
        title: "Abrir um item",
        body: "Clica no cartão que quiseres. Lê, ouve ou vê o vídeo.",
      },
      {
        title: "Exemplo",
        body: "Queres um podcast? Filtro «Podcast» → clica no cartão → carrega em play.",
      },
    ],
    images: [
      {
        file: "03-explorar.png",
        alt: "Lista de conteúdos em Explorar com filtros",
        caption:
          "Explorar: os filtros ficam sob o título. Os cartões são os conteúdos.",
      },
    ],
  },
  {
    id: "conteudo",
    title: "5. Dentro de um conteúdo",
    purpose:
      "Isto serve para leres ou ouvires o material completo e deixares um comentário.",
    summary: "Abre o cartão e trabalhas na página do conteúdo.",
    audience: ["all", "web", "mobile"],
    canDo: [
      "Ler o texto ou usar o leitor de áudio/vídeo.",
      "Com conta: comentar e responder a comentários.",
      "Apagar só os teus comentários.",
    ],
    cannotDo: [
      "Não apagas comentários de outras pessoas.",
      "Sem conta não escreves comentários.",
    ],
    steps: [
      {
        title: "Como comentar",
        body: "Entra com a tua conta. Desce até à zona de comentários. Escreve e envia.",
      },
      {
        title: "Exemplo",
        body: "Leste um texto sobre petróleo e queres perguntar algo → escreve o comentário e envia.",
      },
    ],
    images: [
      {
        file: "04-conteudo.png",
        alt: "Página de um conteúdo aberto",
        caption: "Página de um conteúdo: o texto ou o leitor fica no centro.",
      },
    ],
  },
  {
    id: "jindungo",
    title: "6. Biblioteca Jindungo (textos especiais)",
    purpose:
      "Isto serve para textos exclusivos. Precisas de pedido aprovado pelo administrador.",
    summary: "Pedes acesso → esperas → se for aceite, lês os textos.",
    audience: ["all", "web", "admin", "mobile"],
    canDo: [
      "Com conta: pedir acesso (podes escrever uma mensagem).",
      "Ver se o pedido está a aguardar, aceite ou recusado.",
      "Com acesso aceite: abrir os textos Jindungo.",
    ],
    cannotDo: [
      "Sem conta não pedes acesso.",
      "Enquanto esperas, não cries outro pedido.",
      "Se o admin retirar o acesso, deixas de ver os textos.",
    ],
    steps: [
      {
        title: "Pedir acesso",
        body: "Entra na tua conta. Vai a Explorar → filtro «Jindungo», ou abre a página Jindungo. Escreve uma mensagem (opcional) e carrega em «Pedir acesso».",
      },
      {
        title: "Esperar",
        body: "Vais ver «Pedido em análise». Não precisas de fazer mais nada.",
      },
      {
        title: "Quando for aceite",
        body: "Já não pedes de novo. Abres os textos normalmente.",
      },
      {
        title: "Exemplo",
        body: "És aluno e queres os textos extras da disciplina → pedes acesso → o professor (admin) aprova.",
      },
    ],
    images: [
      {
        file: "12-jindungo.png",
        alt: "Pedido de acesso à biblioteca Jindungo",
        caption:
          "Biblioteca Jindungo: se ainda não entraste, aparece o ecrã «Entrar». Depois pedes o acesso.",
      },
    ],
  },
  {
    id: "trilho",
    title: "7. Trilho (caminho de aprendizagem)",
    purpose:
      "Isto serve para te guiar passo a passo: conteúdo, quiz, mapa e fórum.",
    summary: "É um percurso. Com conta, o progresso fica guardado.",
    audience: ["all", "web", "mobile"],
    canDo: [
      "Ver os passos do trilho.",
      "Com conta: marcar progresso e ver a percentagem.",
    ],
    cannotDo: [
      "Sem conta o progresso não fica gravado.",
      "Não mudas a ordem dos passos.",
    ],
    steps: [
      {
        title: "Abrir o Trilho",
        body: "No site: menu «Trilho». No telemóvel: Perfil → Trilho educativo.",
      },
      {
        title: "Seguir",
        body: "Clica em «Começar» ou no passo indicado. Faz a actividade e volta ao trilho.",
      },
    ],
    images: [
      {
        file: "05-trilho.png",
        alt: "Ecrã do trilho educativo",
        caption: "Trilho: lista de passos e barra de progresso.",
      },
    ],
  },
  {
    id: "tutor",
    title: "8. Tutor (assistente que responde perguntas)",
    purpose:
      "Isto serve para fazeres perguntas sobre economia e história de Angola e receberes uma resposta da IA.",
    summary: "Só funciona se estiveres com sessão iniciada. Lê também a secção 9 sobre a IA.",
    audience: ["all", "web", "mobile"],
    canDo: [
      "Escrever uma pergunta.",
      "Usar uma sugestão pronta.",
      "Seguir ligações para conteúdos quando aparecerem.",
    ],
    cannotDo: [
      "Sem conta não usas o Tutor.",
      "O Tutor não substitui um professor e pode demorar se a internet estiver lenta.",
    ],
    steps: [
      {
        title: "Abrir",
        body: "Entra na conta. No site: menu «Tutor». No telemóvel: Perfil → Tutor IA. Se ainda não entraste, o site mostra o ecrã de Entrar — entra primeiro e volta ao Tutor.",
      },
      {
        title: "Perguntar",
        body: "Escreve a pergunta (com algumas palavras) e envia. Exemplo: «O que é a diversificação económica em Angola?»",
      },
    ],
    images: [
      {
        file: "06-tutor.png",
        alt: "Ecrã do Tutor com caixa de pergunta",
        caption:
          "Se ainda não entraste, o Tutor pede o ecrã «Entrar». Depois de entrares, voltas e fazes a pergunta.",
      },
    ],
  },
  {
    id: "ia",
    title: "9. A inteligência artificial (IA) — o que faz, pode e não pode",
    purpose:
      "Isto serve para saberes, em palavras simples, o que a IA faz nesta aplicação — e o que nunca faz sozinha.",
    summary:
      "Há duas utilizações: o Tutor (para ti) e a ajuda a criar quizzes (só para o administrador).",
    audience: ["all", "web", "admin", "mobile"],
    canDo: [
      "No Tutor: ler a tua pergunta e procurar nos conteúdos publicados da plataforma.",
      "No Tutor: responder em português de Portugal, de forma clara, e indicar fontes quando encontrar.",
      "No Tutor: usar sugestões de perguntas prontas (ex.: sobre petróleo ou café).",
      "No admin: propor um quiz (perguntas e respostas) a partir de um texto ou de um conteúdo.",
      "Se a ligação à IA falhar: o Tutor ainda tenta dar uma resposta simples com base nos textos da biblioteca.",
    ],
    cannotDo: [
      "Não inventa factos: se não houver base nos conteúdos, deve dizer que não encontrou informação suficiente.",
      "Não substitui um professor, um livro oficial nem um exame.",
      "Não publica conteúdos, quizzes nem respostas no fórum sozinha.",
      "Não aprova pedidos Jindungo, não muda o teu perfil e não altera o ranking.",
      "Não é chat tipo WhatsApp: não guarda conversas longas entre dias nem envia mensagens no telemóvel.",
      "Não responde a perguntas fora do tema (economia/história de Angola na plataforma).",
      "Não faz trabalhos escolares por ti nem dá respostas de exames oficiais.",
      "Sem conta iniciada: o Tutor não funciona.",
      "Só o administrador usa a geração de quizzes com IA — e tem de rever e guardar à mão.",
    ],
    steps: [
      {
        title: "O que a IA faz (resumo)",
        body: "Ajuda a aprender: responde no Tutor com base nos textos da plataforma; e, no painel admin, sugere perguntas de quiz para o administrador rever.",
      },
      {
        title: "Exemplo (aluno)",
        body: "Perguntas: «Qual o peso do petróleo nas exportações?» → a IA lê conteúdos publicados → responde e pode mostrar ligações para leres mais.",
      },
      {
        title: "Exemplo (administrador)",
        body: "No admin, em Quizzes → «Gerar quiz com assistência de IA» → escolhe um conteúdo ou cola um texto → a IA propõe perguntas → tu corriges e só depois guardas.",
      },
      {
        title: "Se a resposta parecer estranha",
        body: "Lê os conteúdos indicados. Em dúvida, pergunta a um professor ou ao administrador. A IA pode errar ou ficar sem base se o tema não estiver na biblioteca.",
      },
    ],
    images: [
      {
        file: "06-tutor.png",
        alt: "Tutor IA — ponto de contacto principal com a inteligência artificial",
        caption:
          "O Tutor é o sítio principal onde a IA fala contigo. Entra na conta, escreve a pergunta e compara a resposta com os conteúdos sugeridos.",
      },
    ],
  },
  {
    id: "quiz",
    title: "10. Quizzes (perguntas e pontuação)",
    purpose:
      "Isto serve para testares o que aprendeste, com pontos e tempo (se houver).",
    summary: "Vês a lista; para jogar a sério, precisas de conta.",
    audience: ["all", "web", "mobile"],
    canDo: [
      "Ver a lista de quizzes.",
      "Com conta: responder, ver se acertaste e ver a pontuação final.",
      "Repetir o quiz mais tarde.",
    ],
    cannotDo: [
      "Sem conta não ficas no ranking.",
      "Quando o tempo acaba, o quiz fecha.",
    ],
    steps: [
      {
        title: "Começar",
        body: "Menu «Quiz» (ou aba Quiz no telemóvel). Escolhe um quiz → «Começar».",
      },
      {
        title: "Responder",
        body: "Escolhe uma opção → «Confirmar» → lê se está certa → «Seguinte».",
      },
      {
        title: "Exemplo",
        body: "Fazes o quiz «Petróleo» → no fim vês 80% → podes ir ao Ranking para te comparares.",
      },
    ],
    images: [
      {
        file: "07-quiz.png",
        alt: "Lista de quizzes",
        caption: "Lista de quizzes: escolhe um e começa.",
      },
    ],
  },
  {
    id: "ranking",
    title: "11. Ranking (classificação)",
    purpose:
      "Isto serve para veres quem tem melhores resultados nos quizzes.",
    summary: "Podes filtrar por país inteiro ou por província.",
    audience: ["all", "web", "mobile"],
    canDo: [
      "Ver a tabela sem conta.",
      "Filtrar Nacional ou Por região.",
      "Filtrar por quiz.",
    ],
    cannotDo: [
      "Não mudas a pontuação à mão.",
      "Sem quizzes feitos com conta, o teu nome não aparece.",
    ],
    steps: [
      {
        title: "Abrir",
        body: "Menu «Ranking» ou botão «Ver ranking» depois de um quiz.",
      },
      {
        title: "Exemplo",
        body: "Queres ver a tua província → escolhe «Por região» → selecciona a província.",
      },
    ],
    images: [
      {
        file: "08-ranking.png",
        alt: "Tabela de ranking",
        caption: "Ranking: tabela de classificação com filtros em cima.",
      },
    ],
  },
  {
    id: "forum",
    title: "12. Fórum (conversas)",
    purpose:
      "Isto serve para debater temas em tópicos (como um quadro de discussões).",
    summary: "Podes ler sem conta; para escrever, precisas de conta.",
    audience: ["all", "web", "mobile"],
    canDo: [
      "Ler tópicos públicos.",
      "Com conta: criar tópico e responder.",
      "Apagar as tuas respostas.",
    ],
    cannotDo: [
      "Tópicos privados só o autor e o admin vêem.",
      "Não é chat instantâneo.",
    ],
    steps: [
      {
        title: "Ler",
        body: "Menu «Fórum» → clica num tópico.",
      },
      {
        title: "Escrever",
        body: "Entra na conta → «Novo tópico» → título e texto → Publicar. Ou abre um tópico e responde em baixo.",
      },
      {
        title: "Exemplo",
        body: "Queres discutir o café em Angola → Novo tópico → título «Café e exportações» → Publicar.",
      },
    ],
    images: [
      {
        file: "09-forum.png",
        alt: "Lista de tópicos do fórum",
        caption: "Fórum: lista de debates. «Novo tópico» cria uma conversa nova.",
      },
    ],
  },
  {
    id: "mapa",
    title: "13. Mapa de Angola",
    purpose:
      "Isto serve para clicares numa província e leres a sua história/economia.",
    summary: "Há 21 províncias. Clica numa para abrir o painel.",
    audience: ["all", "web", "mobile"],
    canDo: [
      "Clicar numa província e ler o texto.",
      "No site: usar botões Noite, Elevar, Repor, Localizar, Centrar.",
    ],
    cannotDo: [
      "Não és obrigado a ligar o GPS.",
      "No telemóvel pelo browser o mapa pode ser só uma lista.",
    ],
    steps: [
      {
        title: "Abrir",
        body: "Menu «Mapa» (ou aba Mapa no telemóvel).",
      },
      {
        title: "Escolher província",
        body: "Clica em Luanda (ou outra). Lê o painel que abre. Fecha quando terminares.",
      },
      {
        title: "Exemplo",
        body: "Queres saber sobre Benguela → clica em Benguela no mapa → lê a narrativa.",
      },
    ],
    images: [
      {
        file: "10-mapa.png",
        alt: "Mapa interactivo de Angola",
        caption: "Mapa: clica numa província colorida para ler o texto.",
      },
    ],
  },
  {
    id: "perfil",
    title: "14. Perfil (os teus dados)",
    purpose:
      "Isto serve para mudares o teu nome, email, telefone, província e foto.",
    summary: "Só funciona depois de entrares com a conta.",
    audience: ["all", "web", "mobile"],
    canDo: [
      "Actualizar dados e fotografia.",
      "Ver progresso do trilho e atalhos.",
      "Sair da conta (no telemóvel).",
    ],
    cannotDo: [
      "Não editas o perfil de outra pessoa.",
      "Não te tornas administrador pelo perfil.",
    ],
    steps: [
      {
        title: "Abrir",
        body: "No site: «Perfil» em cima. No telemóvel: aba «Perfil».",
      },
      {
        title: "Guardar",
        body: "Muda o que precisares → «Guardar».",
      },
      {
        title: "Exemplo",
        body: "Mudaste de província → escolhe a nova no perfil → Guardar (ajuda no ranking regional).",
      },
    ],
    images: [
      {
        file: "11-perfil.png",
        alt: "Ecrã de perfil do utilizador",
        caption:
          "Perfil e Jindungo pedem sessão. Entra com o email e a palavra-passe; depois abres Perfil ou Jindungo outra vez.",
      },
    ],
  },
  {
    id: "ajuda-sobre",
    title: "15. Ajuda e Sobre nós",
    purpose:
      "Isto serve para leres este guia e conheceres a equipa do Grupo 6.",
    summary: "Há um botão de ajuda e uma página Sobre nós.",
    audience: ["all", "web", "admin", "mobile"],
    canDo: [
      "Abrir o guia completo e expandir cada secção.",
      "Ver os nomes dos criadores e a missão do projecto.",
    ],
    cannotDo: [
      "O guia só explica — não muda as tuas permissões.",
    ],
    steps: [
      {
        title: "No site",
        body: "Clica no ícone de ajuda (?) em cima, ou no rodapé em «Ajuda» / «Sobre nós».",
      },
      {
        title: "No telemóvel",
        body: "Perfil → «Ajuda — guia completo» ou «Sobre nós».",
      },
    ],
    images: [
      {
        file: "13-ajuda.png",
        alt: "Página inicial — ponto de partida para a Ajuda",
        caption:
          "Na página inicial, usa o menu ou o rodapé para chegares à Ajuda e ao Sobre nós.",
      },
    ],
  },
  {
    id: "admin-acesso",
    title: "16. Administrador — como entrar",
    purpose:
      "Isto serve para quem gere a plataforma (conteúdos, pedidos, utilizadores).",
    summary: "Só no computador, endereço /admin. Não existe no telemóvel.",
    audience: ["all", "admin", "web"],
    canDo: [
      "Entrar em /admin/login com conta de administrador.",
      "Gerir conteúdos, quizzes, fórum, mapa e pedidos Jindungo.",
    ],
    cannotDo: [
      "Não geres a plataforma pela app do telemóvel.",
      "A sessão de admin é diferente da sessão de aluno.",
    ],
    steps: [
      {
        title: "Entrar",
        body: "Abre /admin/login. Exemplo: email admin@jindungo.ao e palavra-passe password.",
      },
      {
        title: "Menu",
        body: "À esquerda (ou em cima no telemóvel do browser) vês: Dashboard, Conteúdos, Quizzes, Fórum, Mapa, Pedidos Jindungo, Utilizadores, Ajuda, Sobre nós.",
      },
    ],
    images: [
      {
        file: "14-admin.png",
        alt: "Entrar no painel de administração",
        caption:
          "Admin: ecrã próprio. Escreve o email de administrador e «Entrar no painel».",
      },
    ],
  },
  {
    id: "admin-conteudos",
    title: "17. Admin — publicar conteúdos",
    purpose:
      "Isto serve para o administrador criar textos, áudios, vídeos e podcasts.",
    summary: "Cria → guarda rascunho ou publica → o aluno vê em Explorar.",
    audience: ["all", "admin"],
    canDo: [
      "Criar, editar, publicar, arquivar e eliminar.",
      "Marcar conteúdo como exclusivo ou tipo Jindungo.",
    ],
    cannotDo: [
      "Eliminar é definitivo.",
      "Rascunhos não aparecem ao público.",
    ],
    steps: [
      {
        title: "Novo conteúdo",
        body: "Conteúdos → Novo → preenche título e tipo → Guardar rascunho ou Publicar.",
      },
      {
        title: "Exemplo",
        body: "Queres um texto novo sobre diamantes → tipo Texto → escreve → Publicar.",
      },
    ],
  },
  {
    id: "admin-quizzes",
    title: "18. Admin — quizzes",
    purpose:
      "Isto serve para criar perguntas de teste para os alunos.",
    summary:
      "Podes escrever à mão ou pedir uma proposta à IA e depois rever (ver também a secção 9).",
    audience: ["all", "admin"],
    canDo: [
      "Criar perguntas e marcar a resposta certa.",
      "Activar ou desactivar um quiz.",
      "Gerar proposta com IA a partir de um texto ou conteúdo.",
    ],
    cannotDo: [
      "A IA não publica sozinha — tens de rever e guardar.",
      "A IA não marca o quiz como activo sem a tua confirmação.",
    ],
    steps: [
      {
        title: "Criar à mão",
        body: "Quizzes → Novo → adiciona perguntas → activa → Guardar.",
      },
      {
        title: "Com ajuda da IA",
        body: "Quizzes → Gerar com IA → escolhe conteúdo ou cola texto → revê as perguntas propostas → corrige o que estiver errado → Guardar.",
      },
    ],
  },
  {
    id: "admin-forum-mapa",
    title: "19. Admin — fórum e mapa",
    purpose:
      "Isto serve para moderar debates e escrever textos das províncias.",
    summary: "Fórum: ocultar/eliminar. Mapa: narrativas por província.",
    audience: ["all", "admin"],
    canDo: [
      "Editar ou eliminar tópicos.",
      "Criar narrativas do mapa (província + texto).",
    ],
    cannotDo: [
      "Alunos não editam as narrativas do mapa.",
    ],
    steps: [
      {
        title: "Mapa",
        body: "Admin → Mapa → Novo → escolhe a província → escreve → Guardar.",
      },
      {
        title: "Fórum",
        body: "Admin → Fórum → Editar ou Eliminar um tópico inadequado.",
      },
    ],
  },
  {
    id: "admin-jindungo",
    title: "20. Admin — pedidos Jindungo",
    purpose:
      "Isto serve para decidir quem lê a biblioteca especial.",
    summary: "Aprovar, rejeitar, revogar ou restaurar.",
    audience: ["all", "admin"],
    canDo: [
      "Ver pedidos pendentes e aprovar/rejeitar.",
      "Ver aprovados e revogar.",
      "Restaurar um rejeitado.",
    ],
    cannotDo: [
      "O aluno não recebe SMS automático — ele vê o estado na app.",
    ],
    steps: [
      {
        title: "Aprovar",
        body: "Pedidos Jindungo → filtro Pendentes → Aprovar. Confirma em Aprovados.",
      },
      {
        title: "Tirar acesso",
        body: "Filtro Aprovados → «Revogar acesso».",
      },
    ],
  },
  {
    id: "admin-utilizadores",
    title: "21. Admin — utilizadores",
    purpose:
      "Isto serve para activar ou desactivar contas de alunos.",
    summary: "Uma conta desactivada deixa de usar a plataforma normalmente.",
    audience: ["all", "admin"],
    canDo: [
      "Activar ou desactivar utilizadores comuns.",
    ],
    cannotDo: [
      "Não desactivas outras contas de administrador neste ecrã.",
    ],
    steps: [
      {
        title: "Desactivar",
        body: "Utilizadores → encontra a pessoa → Desactivar → confirma.",
      },
    ],
  },
  {
    id: "mobile",
    title: "22. No telemóvel",
    purpose:
      "Isto serve para usares as mesmas funções no telemóvel, com botões grandes em baixo.",
    summary: "Abas: Explorar, Quiz, Fórum, Mapa, Perfil. Outras coisas abrem a partir do Perfil.",
    audience: ["all", "mobile", "web"],
    canDo: [
      "Usar as cinco abas.",
      "Puxar a lista para baixo para actualizar.",
      "Abrir Tutor, Trilho, Jindungo, Ranking, Ajuda e Sobre nós pelo Perfil.",
    ],
    cannotDo: [
      "Não há admin no telemóvel.",
      "No telemóvel físico, «localhost» não funciona — precisa do endereço certo da API.",
    ],
    steps: [
      {
        title: "Primeiro uso",
        body: "Abre a app → Explorar ou Entrar. Se pedirem API, o professor/técnico configura o endereço.",
      },
      {
        title: "Exemplo",
        body: "Queres o Tutor no telemóvel → Perfil → Tutor IA.",
      },
    ],
  },
  {
    id: "tema",
    title: "23. Tema claro e escuro",
    purpose:
      "Isto serve para escolheres ecrã claro ou escuro, conforme for mais fácil para os olhos.",
    summary: "O botão do sol/lua fica junto do menu.",
    audience: ["all", "web", "mobile"],
    canDo: [
      "Mudar entre claro e escuro.",
      "A escolha fica guardada.",
    ],
    cannotDo: [
      "Não há mais temas além de claro e escuro.",
    ],
    steps: [
      {
        title: "Mudar",
        body: "Clica no ícone do sol (ou lua) em cima. No telemóvel também há o botão nas abas.",
      },
    ],
  },
  {
    id: "o-que-nao-faz",
    title: "24. O que a aplicação NÃO faz",
    purpose:
      "Isto serve para não esperares funções que não existem.",
    summary: "Lista curta do que está de fora.",
    audience: ["all", "web", "admin", "mobile"],
    canDo: [
      "Usar tudo o que está descrito nas secções anteriores.",
    ],
    cannotDo: [
      "Não há loja nem pagamentos.",
      "O aluno não publica conteúdos.",
      "Não há chat tipo WhatsApp nem notificações no telemóvel.",
      "Não há login com Google.",
      "Não há admin na app móvel.",
      "A IA não gere a plataforma sozinha (ver secção 9).",
    ],
    steps: [
      {
        title: "Em dúvida",
        body: "Se não está escrito em «O que podes fazer», provavelmente não existe. Lê a Ajuda ou pergunta ao administrador.",
      },
    ],
  },
  {
    id: "problemas",
    title: "25. Problemas comuns (e soluções)",
    purpose:
      "Isto serve para desbloqueares os casos mais frequentes.",
    summary: "Site lento, não entra, não vê Jindungo, quiz não começa.",
    audience: ["all", "web", "admin", "mobile"],
    canDo: [
      "Esperar e tentar de novo se o servidor estiver a acordar.",
      "Usar as contas de demonstração quando forem dadas.",
    ],
    cannotDo: [
      "Não forces o acesso Jindungo sem aprovação — o servidor bloqueia.",
    ],
    steps: [
      {
        title: "O site demora muito",
        body: "Às vezes o servidor dorme. Espera até 1 minuto e actualiza a página.",
      },
      {
        title: "Não vejo textos Jindungo",
        body: "Confirma que entraste com a conta, pediste acesso e foste aprovado. Actualiza a página.",
      },
      {
        title: "O quiz não começa",
        body: "Entra com a conta. Se pedir, escolhe a tua província no Perfil.",
      },
      {
        title: "O Tutor não responde ou diz que não encontrou base",
        body: "Confirma que entraste com a conta e que a pergunta tem pelo menos algumas palavras. Se a IA não achar base nos conteúdos, lê Explorar ou muda a pergunta. Exemplo: em vez de «ajuda-me no exame», pergunta «O que é a diversificação económica em Angola?»",
      },
      {
        title: "Contas de teste",
        body: "Utilizador: julieta@jindungo.ao / password. Admin (só /admin): admin@jindungo.ao / password.",
      },
    ],
  },
];

export function filterGuideSections(
  audience: GuideAudience | "full",
): GuideSection[] {
  if (audience === "full" || audience === "all") {
    return USER_GUIDE_SECTIONS;
  }

  return USER_GUIDE_SECTIONS.filter(
    (section) =>
      section.audience.includes("all") || section.audience.includes(audience),
  );
}

/** Caminho público web para uma imagem do manual. */
export function guideImagePublicPath(file: string): string {
  return `/manual-images/${file}`;
}
