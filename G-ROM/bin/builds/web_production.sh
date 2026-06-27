#!/bin/bash
# Build de produção para web e base para apps nativos (Android/iOS)
# Gera versão otimizada, sincroniza com Capacitor e orienta sobre próximos passos

set -e

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

cd "$(dirname "$0")/../.." || exit 1

echo -e "${CYAN}🔵 Processo de build de produção iniciado...${NC}"
echo -e "${YELLOW}1. Gerando build otimizado para produção (ionic build --prod)...${NC}"

if ionic build --prod; then
	echo -e "${GREEN}✅ Build de produção concluído!${NC}"
else
	echo -e "${RED}❌ Erro no build de produção.${NC}"
	exit 1
fi

echo -e "${YELLOW}2. Sincronizando arquivos otimizados com projetos nativos (npx cap sync)...${NC}"
if npx cap sync; then
	echo -e "${GREEN}✅ Sincronização com Capacitor concluída!${NC}"
else
	echo -e "${RED}❌ Erro ao sincronizar com Capacitor.${NC}"
	exit 1
fi

echo -e "${CYAN}------------------------------------------${NC}"
echo -e "${CYAN}Build de produção finalizado!${NC}"
echo -e "${CYAN}Conteúdo otimizado disponível na pasta: www/${NC}"
echo -e "${YELLOW}Principais arquivos e pastas:${NC}"
echo -e "  - index.html: ponto de entrada da aplicação"
echo -e "  - *.js: bundles JavaScript otimizados"
echo -e "  - *.css: estilos minificados"
echo -e "  - assets/: arquivos estáticos (imagens, fontes, etc)"
echo -e "  - manifest.webmanifest: configurações PWA"
echo -e "${CYAN}------------------------------------------${NC}"
echo -e "${YELLOW}Para gerar o APK/AAB final, abra o projeto Android no Android Studio e siga o processo de build e assinatura.${NC}"
echo -e "${YELLOW}Para iOS, abra o projeto no Xcode.${NC}"
echo -e "${GREEN}Processo concluído.${NC}"
