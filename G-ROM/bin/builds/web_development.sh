#!/bin/bash
# Build web para ambiente development com checagem de dependências e live reload

set -e

# Cores para terminal
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Ir para a raiz do projeto
cd "$(dirname "$0")/../.." || exit 1

echo -e "${CYAN}🔍 Checando dependências do ambiente de desenvolvimento...${NC}"

# Checar Node.js
if ! command -v node &> /dev/null; then
	echo -e "${RED}❌ Node.js não encontrado. Instale o Node.js para continuar.${NC}"
	exit 1
else
	echo -e "${GREEN}✅ Node.js encontrado: $(node --version)${NC}"
fi

# Checar npm
if ! command -v npm &> /dev/null; then
	echo -e "${RED}❌ npm não encontrado. Instale o npm para continuar.${NC}"
	exit 1
else
	echo -e "${GREEN}✅ npm encontrado: $(npm --version)${NC}"
fi

# Checar Ionic CLI
if ! command -v ionic &> /dev/null; then
	echo -e "${YELLOW}⚠️  Ionic CLI não encontrado. Instalando...${NC}"
	if npm install -g @ionic/cli; then
		echo -e "${GREEN}✅ Ionic CLI instalado com sucesso!${NC}"
	else
		echo -e "${RED}❌ Falha na instalação do Ionic CLI${NC}"
		exit 1
	fi
else
	echo -e "${GREEN}✅ Ionic CLI encontrado${NC}"
fi

# Instalar dependências do projeto se necessário
if [ ! -d "node_modules" ]; then
	echo -e "${YELLOW}📦 Instalando dependências do projeto...${NC}"
	if ! npm ci; then
		echo -e "${RED}❌ Falha ao instalar dependências${NC}"
		echo -e "${YELLOW}💡 Tentando com npm install...${NC}"
		if ! npm install; then
			echo -e "${RED}❌ Falha crítica na instalação de dependências${NC}"
			exit 1
		fi
	fi
else
	echo -e "${GREEN}✅ Dependências já instaladas${NC}"
fi

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}   SITFOR - DEV SERVER (NX/IONIC)   ${NC}"
echo -e "${CYAN}========================================${NC}"
echo -e "${YELLOW}Iniciando servidor de desenvolvimento com live reload...${NC}"
echo -e "${CYAN}Acesse: http://localhost:8100${NC}"
echo -e "${YELLOW}Pressione Ctrl+C para encerrar o servidor.${NC}"

# Rodar servidor de desenvolvimento (preferencialmente Nx, mas pode ser adaptado para ionic serve)
if command -v nx &> /dev/null; then
	npx nx serve app
else
	ionic serve
fi
