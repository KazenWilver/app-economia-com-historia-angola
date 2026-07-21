# Tipos partilhados — Jindungo
#
# Contrato TypeScript comum à web (público + admin) e, na FASE 5, ao mobile.
# Código: inglês. Comentários: português de Portugal.
#
# Módulos:
#   content.ts, province.ts, user.ts, recommendation.ts
#   forum.ts, map.ts, quiz.ts
#
# Uso no frontend:
#   import type { ContentType, Province, User, PublicTopic } from "@shared/types";
#
# Os ficheiros `*-types.ts` do frontend devem reexportar daqui e manter
# apenas helpers/UI locais (forms, labels, formatters).
