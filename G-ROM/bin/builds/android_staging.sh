#!/bin/bash
# Build Android para ambiente staging

# Garante execução na raiz do projeto
cd "$(dirname "$0")/../.." || exit 1

# Gera build web para staging
npm run build:staging || { echo "[ERRO] Falha ao gerar build web staging."; exit 1; }

# Garante que a plataforma android existe
if [ ! -d "android" ]; then
	npx cap add android || { echo "[ERRO] Falha ao adicionar plataforma android."; exit 1; }
fi

# Sincroniza arquivos web com o projeto Android
npx cap sync android || { echo "[ERRO] Falha ao sincronizar Capacitor Android."; exit 1; }

# Compila APK de staging
cd android || exit 1
./gradlew assembleStaging || { echo "[ERRO] Falha ao compilar APK staging."; exit 1; }

APK_PATH="app/build/outputs/apk/staging/app-staging.apk"
if [ -f "$APK_PATH" ]; then
	echo "[SUCESSO] APK de staging gerado em: $APK_PATH"
else
	echo "[ERRO] APK de staging não encontrado."
	exit 1
fi
