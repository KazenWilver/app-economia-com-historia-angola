# Jindungo Mobile — MVP

App Expo (SDK 57) que consome a API Laravel do projecto.

## Arranque

1. API a correr (ex.: `cd backend && php artisan serve --host=0.0.0.0 --port=8000`).
2. Nesta pasta:

```bash
cd mobile
npm start
```

3. Abre no Expo Go (telemóvel) ou emulador.

## URL da API

| Ambiente | URL |
|----------|-----|
| Emulador Android | `http://10.0.2.2:8000/api` (automático) |
| iOS Simulator | `http://localhost:8000/api` (automático) |
| Telemóvel físico (Expo Go) | `EXPO_PUBLIC_API_URL=http://<IP-LAN>:8000/api` |
| Expo Web (browser) | `http://localhost:8000/api` (CORS: portas 8081/8082) |

Exemplo PowerShell (na pasta `mobile`, **antes** de `npm start`):

```powershell
cd mobile
$env:EXPO_PUBLIC_API_URL="http://192.168.1.36:8000/api"
npm start
```

### "Failed to fetch" — o que verificar

1. **Backend a correr** noutro terminal: `.\scripts\serve.ps1`
2. **Testar no browser do PC:** abre `http://localhost:8000/api/provinces` — deve devolver JSON
3. **Telemóvel físico:** usa a app **Expo Go** (QR), não o browser Web do Expo
4. **Mesma rede Wi‑Fi** entre PC e telemóvel
5. **Firewall Windows:** permite entrada na porta 8000 (rede privada)
6. **Porta 8082:** se o Metro mudou de porta, o CORS já inclui 8082 — reinicia o backend após alterar `.env`
7. Nos logs do Expo, confirma: `[Jindungo] API_URL = http://...`

## MVP incluído

- Splash + login + registo
- Tabs: Explorar, Quiz, Fórum, Mapa, Perfil
- Detalhe de conteúdos (`/conteudo/[slug]`)
- Jogar quiz com timer, submissão e resultados
- Mapa com marcadores + lista de províncias e narrativas
- Fórum: listar tópicos, criar tópico, ver e responder
- Perfil editável + upload de avatar + logout

## Ainda por fazer (iterações seguintes)

- Players nativos de áudio/vídeo
- Polish visual Apple-like
- GeoJSON completo como na web
- Tópicos privados no mobile
