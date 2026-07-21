# Jindungo Mobile — Expo SDK 54

App React Native (Expo Router) que consome a API Laravel do projecto.

## Problema mais comum (Expo Go)

No telemóvel, **`localhost` é o próprio telemóvel**, não o PC. Se `EXPO_PUBLIC_API_URL=http://localhost:8000/api`, a app abre mas **não liga à API**.

Também havia um bug que gerava URLs inválidas (`http://http:8000/api`) a partir do `hostUri` do Expo — já corrigido em `lib/api.ts`.

## Como correr (passo a passo)

### 1. Backend a escutar na rede

Na raiz do projecto:

```powershell
docker compose up -d backend
```

Confirma no PC: [http://localhost:8000/api](http://localhost:8000/api) deve devolver JSON.

### 2. Arrancar o Metro / Expo

```powershell
cd mobile
npm start
```

Ou, forçando rede LAN (recomendado para Expo Go):

```powershell
cd mobile
npx expo start --lan
```

### 3. Abrir no telemóvel

1. Instala **Expo Go** (versão compatível com **SDK 54**).
2. PC e telemóvel na **mesma Wi‑Fi** (evita Wi‑Fi “convidado” / isolamento de clientes).
3. Escaneia o **QR code** no terminal (Android: Expo Go; iOS: Câmara → Expo Go).
4. Nos logs do Metro, confirma: `[Jindungo] API_URL = http://<IP-do-PC>:8000/api`  
   Se aparecer `localhost` ou `http://http:8000/api`, a API não vai funcionar.

### 4. Se a API falhar no telemóvel

Descobre o IPv4 do PC (`ipconfig`) e cria/edita `mobile/.env`:

```env
EXPO_PUBLIC_API_URL=http://SEU_IPV4:8000/api
```

Exemplo:

```env
EXPO_PUBLIC_API_URL=http://172.16.249.249:8000/api
```

Reinicia o Expo (`Ctrl+C` e `npm start`) e volta a abrir no Expo Go.

No Windows, permite entrada nas portas **8000** (API) e **8081** (Metro) na rede privada (Firewall).

## URL da API (resumo)

| Ambiente | URL |
|----------|-----|
| Expo Go (telemóvel) | IP LAN do PC, automático via Metro, ou `EXPO_PUBLIC_API_URL` |
| Emulador Android | `http://10.0.2.2:8000/api` (automático se não houver `.env`) |
| iOS Simulator / Expo Web no PC | `http://localhost:8000/api` |

## MVP incluído

- Splash + login + registo + recuperação de palavra-passe
- Tabs: Explorar, Quiz, Fórum, Mapa, Perfil
- Detalhe de conteúdos, quizzes, fórum, mapa (nativo no Expo Go), perfil
- Tema claro / escuro

## Notas

- O mapa interactivo com polígonos funciona no **Expo Go nativo**; no browser (Expo Web) usa a lista de províncias.
- O painel **admin** é só Web (`/admin`).
