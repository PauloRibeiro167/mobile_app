## 📱 Projeto (APK) – App Ionic + Capacitor integrado à API SITFOR

Aplicação mobile (Android / iOS via Capacitor) construída em Ionic + Angular. O objetivo principal é consumir a API do SITFOR (cadastros, consultas e atualização de dados de fachada / metadados de campo) com suporte a Live Reload em dispositivos físicos (USB ou Wi‑Fi) e ambiente Docker para desenvolvimento isolado.

---
## ✨ Principais Características
* Stack: Angular 20, Ionic 8, Capacitor 7.
* Live Reload otimizado (script `base/bin/live-reload`) com suporte a:
  * Dispositivo físico via USB (adb reverse automático).
  * Dispositivo/emulador via Wi‑Fi (exige `DEV_HOST_IP`).
* Ambiente Docker / DevContainer com Node, Java 21, Android SDK e Gradle prontos.
* Postgres opcional (já configurado em `docker-compose`).
* Scripts utilitários em `base/bin` e alvo Makefile para orquestração containerizada.
* Plugins Capacitor para: câmera, geolocalização, upload (file-transfer), segurança, preferências, etc.

---
## 🗂 Estrutura Essencial
```
base/
  package.json          # Dependências e scripts npm
  capacitor.config.ts   # Config principal
  bin/                  # Scripts (dev, live-reload, build, etc.)
  android/              # Plataforma Android (Gerada / sincronizada)
  src/                  # Código Angular/Ionic
.devcontainer/          # Dockerfile, compose e entrypoint
.env.development        # Variáveis de ambiente (dev)
Makefile                # Alvos para Docker (build/up/exec/...)
```

---
## 🛠 Pré‑requisitos (Modo Local Direto – opcional)
Se NÃO for usar Docker:
* Node.js 20+ (ou versão usada na imagem: 24.x LTS slim)
* Java JDK 21 (para builds Android)
* Android SDK + platform-tools
* Ionic CLI e Angular CLI (`npm i -g @ionic/cli @angular/cli`)
* ADB (Android platform-tools no PATH)

Para fluxo recomendado (DevContainer/Docker) só precisa de: Docker + Docker Compose.

---
## 🚀 Início Rápido com Docker (Recomendado)
1. Ajustar (se quiser) o UID/GID no `.env.development` (ou ele será gerado):
	* `LOCAL_UID=$(id -u)`
	* `LOCAL_GID=$(id -g)`
2. Subir containers:
	```bash
	make up
	```
3. Abrir shell dentro do container app:
	```bash
	make exec
	```
4. Dentro do container (diretório `/workspace/base`), iniciar servidor dev simples:
	```bash
	bin/dev

	```
5. Acessar: http://localhost:8100
****
Parar ambiente:
```bash
make down
```

Rebuild forçado:
```bash
make rebuild
```

Ver logs do serviço principal:
```bash
make logs
```


---
## 🔄 Live Reload em Dispositivo (Android)
Script interativo: `bin/live-reload` (execute DENTRO do container com `make exec`).

Fluxo típico:
```bash
make exec          # entra no container
cd /workspace/base
bin/live-reload    # abre menu interativo (USB / WiFi / Emulador)
```

Variáveis que influenciam:
| Variável | Função | Default |
|----------|--------|---------|
| DEV_HOST_IP | IP da máquina host visível pelo dispositivo | `localhost` |
| DEV_LIVERELOAD_PORT | Porta base para live reload | `8100` |
| DEV_AUTO_TUNNEL | Se 1, ativa `adb reverse` automaticamente (USB) | `1` |
| USE_ADB_REVERSE | Força túnel manual (se exportada) | vazio |
| DEV_USE_POLLING | Força polling de arquivos (Docker) | `1` |
| DEV_POLL_INTERVAL | Intervalo de polling (ms) | `800` |
| DEV_VERBOSE_WATCH | Loga mudanças de arquivos | `1` |

Para dispositivo físico via Wi‑Fi defina antes:
```bash
echo "DEV_HOST_IP=192.168.x.y" >> .env.development
```
Ou exporte apenas para a sessão atual:
```bash
export DEV_HOST_IP=192.168.x.y
```

USB (adb reverse) já funciona com `DEV_AUTO_TUNNEL=1`. Se quiser desativar:
```bash
export DEV_AUTO_TUNNEL=0
```

---
## 🔧 Scripts Principais (Dentro de `base/`)
| Script | Descrição |
|--------|-----------|
| `bin/dev` | Instala dependências (se faltarem) e roda `ng serve` em 8100. |
| `bin/live-reload` | Menu interativo para live reload em device/emulador. Ajusta túnel, porta, host. |
| `bin/build` | (Se existir) Build de produção/ajustada. |
| `bin/apk` | Geração de APK (ver script para parâmetros). |
| `bin/production` / `bin/staging` | Rotinas de build específicas (se configuradas). |
| `bin/sync` | Sincroniza web para plataforma nativa (capacitor sync). |
| `bin/logcat-app` | Mostra logs Android filtrados. |

Scripts adicionais podem ser inspecionados em `base/bin` para detalhes.

---
## ⚙️ Variáveis de Ambiente (.env.development)
Arquivo base (já existente / gerado):
```dotenv
LOCAL_UID=1000
LOCAL_GID=1000
DEV_HOST_IP=localhost
PROJECT_NAME=ionic-app
DB=postgres
DB_USER=dev
DB_NAME=ionicdb
POSTGRES_USER=dev
POSTGRES_PASSWORD=dev
POSTGRES_DB=ionicdb
DEV_AUTO_TUNNEL=1
DEV_USE_POLLING=1
DEV_POLL_INTERVAL=800
DEV_VERBOSE_WATCH=1
```

## 🔌 Plugins relevantes

| Plugin | Uso Resumido |
|--------|--------------|
| `@capacitor/action-sheet` | Ações rápidas contextuais (depende de `@ionic/pwa-elements` em PWA). |
| `@capacitor/app` | Eventos ciclo vida (foreground/background). |
| `@capacitor/device` | Informações do dispositivo (validar integridade / versão). |
| `@capacitor/file-transfer` | Upload (ex: imagem de fachada). |
| `@capacitor/geolocation` | Capturar coordenadas e metadados de campo. |
| `@capacitor/browser` / `inappbrowser` | Abrir páginas externas dentro do app. |
| `@capacitor/keyboard` | Ajustes de UX em formulários. |
| `@capacitor/motion` | Telemetria de movimento (se necessário). |
| `@capacitor/network` | Detectar conectividade para bloquear operações offline. |
| `@capacitor/preferences` | Preferências leves / flags de onboarding. |
| `@capacitor/push-notifications` | Notificar (ex: upload concluído). |
| `@capacitor/privacy-screen` | Ocultar conteúdo em app switcher. |
| `@capacitor/screen-orientation` | Fixar retrato. |
| `@capacitor/status-bar` | Ajustar cores e safe area. |
| `@capacitor/toast` | Feedback rápido ao usuário. |
| Plugin | Uso Resumido |
|--------|--------------|
| `@capacitor/action-sheet` | Ações rápidas contextuais (depende de `@ionic/pwa-elements` em PWA). |
| `@capacitor/app` | Eventos ciclo vida (foreground/background). |
| `@capacitor/device` | Informações do dispositivo (validar integridade / versão). |
| `@capacitor/file-transfer` | Upload (ex: imagem de fachada). |
| `@capacitor/geolocation` | Capturar coordenadas e metadados de campo. |
| `@capacitor/browser` / `inappbrowser` | Abrir páginas externas dentro do app. |
| `@capacitor/keyboard` | Ajustes de UX em formulários. |
| `@capacitor/motion` | Telemetria de movimento (se necessário). |
| `@capacitor/network` | Detectar conectividade para bloquear operações offline. |
| `@capacitor/preferences` | Preferências leves / flags de onboarding. |
| `@capacitor/push-notifications` | Notificar (ex: upload concluído). |
| `@capacitor/privacy-screen` | Ocultar conteúdo em app switcher. |
| `@capacitor/screen-orientation` | Fixar retrato. |
| `@capacitor/status-bar` | Ajustar cores e safe area. |
| `@capacitor/toast` | Feedback rápido ao usuário. |

---
## 🧪 Testes
* Unit: `npm test`
* E2E (Cypress):
  ```bash
  npm run cypress:open
  # ou headless
  npm run cypress:run
  ```

---
## 📦 Build de Produção / Geração de APK
Para gerar o APK para Android, execute o script `bin/app` dentro do container e selecione a opção de compilação para Android.

Exemplo:
```bash
make exec
cd /workspace/base
bin/app
# Selecione a opção para Android
```
Isso padroniza o processo de build.
---

## 🧹 Limpeza
Remover somente recursos do projeto:
```bash
make clean   # escolha opção 1
```
Limpeza total (todas imagens/volumes Docker): usar opção 2 do mesmo menu (irreversível).
