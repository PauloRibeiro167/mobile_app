#!/bin/bash
# Build Android para ambiente production
set -e

# Ir para a raiz do projeto
cd "$(dirname "$0")/../.." || exit 1

echo "\n🚀📱 INICIANDO BUILD ANDROID - PRODUCTION\n==============================="

# 1. Build do app Angular/Ionic para produção
echo "[1/3] Build do app web (produção)..."
npx nx run app:build:production

# 2. Sincronizar com Capacitor
echo "[2/3] Sincronizando Capacitor..."
npx cap sync android

# 3. Build Android nativo
echo "[3/3] Build Android nativo..."
cd android && ./gradlew assembleRelease

echo "\n✅ Build Android (produção) finalizado. O APK está em android/app/build/outputs/apk/release/.\n"
