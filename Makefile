CYAN=\e[1;36m
GREEN=\e[1;32m
YELLOW=\e[1;33m
RED=\e[1;31m
MAGENTA=\e[1;35m
BLUE=\e[1;34m
NC=\e[0m
CLEAR_LINE = tput cuu1 && tput el
COMPOSE_FILE = .devcontainer/compose.yaml
ENV_FILE = .env.development
DOCKERFILE ?= .devcontainer/Dockerfile
IMAGE_NAME ?= $(PROJECT_NAME)_image
DOCKERFILE_DEPS = $(shell cat $(DOCKERFILE) | tr '\n' ' ' | sed 's/.*apt-get install -y --no-install-recommends //;s/ &&.*//')
PROJECT_NAME ?= $(shell grep -E '^(export )?PROJECT_NAME=' $(ENV_FILE) | sed 's/^export //' | cut -d '=' -f2)
DOCKER = docker compose -f $(COMPOSE_FILE)  --env-file $(ENV_FILE) -p $(PROJECT_NAME)
NOCACHE ?= 0
MAKEFLAGS += --no-print-directory
PROJECT_WORKDIR ?= /workspaces

.PHONY: help build build-no-cache rebuild up down exec exec-workspace logs ps clean env-check rm-env regen-env adb-devices serve fix-cache

help:
	@printf "$(CYAN)Comandos disponíveis:$(NC)\n"
	@printf "  $(BLUE)help$(NC)          \t\t$(YELLOW)- Mostra esta ajuda.$(NC)\n"
	@printf "  $(BLUE)build$(NC)         \t\t$(YELLOW)- Builda a imagem Docker manualmente.$(NC)\n"
	@printf "  $(BLUE)build-no-cache$(NC) \t$(YELLOW)- Builda a imagem Docker SEM cache.$(NC)\n"
	@printf "  $(BLUE)rebuild$(NC)       \t\t$(YELLOW)- Força o rebuild da imagem e recria os containers.$(NC)\n"
	@printf "  $(BLUE)up$(NC)            \t\t$(YELLOW)- Sobe os containers e faz build se necessário.$(NC)\n"
	@printf "  $(BLUE)down$(NC)          \t\t$(YELLOW)- Para e remove todos os containers abertos.$(NC)\n"
	@printf "  $(BLUE)exec$(NC)          \t\t$(YELLOW)- Abre shell no workspace do projeto.$(NC)\n"
	@printf "  $(BLUE)serve$(NC)         \t\t$(YELLOW)- Sobe o servidor de desenvolvimento do Ionic.$(NC)\n"
	@printf "  $(BLUE)fix-cache$(NC)     \t\t$(YELLOW)- Corrige o cache local do Angular para o usuario atual.$(NC)\n"
	@printf "  $(BLUE)logs$(NC)          \t\t$(YELLOW)- Mostra os logs do container.$(NC)\n"
	@printf "  $(BLUE)ps$(NC)            \t\t$(YELLOW)- Lista os containers do projeto.$(NC)\n"
	@printf "  $(BLUE)clean$(NC)         \t\t$(YELLOW)- Limpa o ambiente Docker.$(NC)\n\n"

build:
	@printf "$(CYAN)Build da imagem Docker...$(NC)\n"
	@if [ "$(NOCACHE)" = "1" ]; then \
		printf "$(YELLOW)Build sem cache ativado.$(NC)\n"; \
		docker build --no-cache -f $(DOCKERFILE) -t $(IMAGE_NAME) .; \
	else \
		docker build -f $(DOCKERFILE) -t $(IMAGE_NAME) .; \
	fi

build-no-cache:
	@printf "$(YELLOW)Buildando imagem Docker SEM cache...$(NC)\n"
	@NOCACHE=1 $(MAKE) build
	@:

rebuild:
	@printf "$(CYAN)Recriando o ambiente...$(NC)\n"
	@$(MAKE) down
	@$(MAKE) build
	@$(MAKE) up
	@printf "$(GREEN)Ambiente recriado com sucesso.$(NC)\n"

up:
	@if [ ! -f "$(ENV_FILE)" ]; then \
		printf "$(RED)Arquivo de ambiente não encontrado: $(ENV_FILE)$(NC)\n"; \
		printf "$(YELLOW)Crie o arquivo $(ENV_FILE) antes de continuar.$(NC)\n"; \
		exit 1; \
	fi
	@printf "$(CYAN)Subindo containers...$(NC)\n"
	@printf "$(GREEN)Rodando: Docker compose up -d$(NC)\n"
	@$(DOCKER) up -d
	@printf "$(GREEN)Containers estão rodando.$(NC)\n"

down:
	@printf "$(YELLOW)Parando e removendo todos os containers, volumes e redes do projeto...$(NC)\n"
	@$(DOCKER) down -v --remove-orphans

exec:
	@if ! $(DOCKER) ps --filter "name=frontend" --filter "status=running" | grep -q frontend; then \
		$(MAKE) up; \
	fi
	@printf "$(CYAN)Abrindo workspace do projeto...$(NC)\n"
	@$(DOCKER) exec -it frontend /bin/bash -lc 'export ADB_SERVER_SOCKET=tcp:127.0.0.1:5037; export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/opt/android-sdk/cmdline-tools/latest/bin:/opt/android-sdk/platform-tools:$PATH"; export PS1="\[\e[1;34m\]frontend:\w:\[\e[0m\] "; exec /bin/bash --noprofile --norc'

serve:
	@printf "$(CYAN)Iniciando servidor de desenvolvimento do Ionic...$(NC)\n"
	@cd mobile && ./bin/dev

fix-cache:
	@printf "$(CYAN)Preparando cache local do Angular...$(NC)\n"
	@mkdir -p G-ROM/.cache/ng
	@chmod -R u+rwX G-ROM/.cache 2>/dev/null || true
	@if [ -d G-ROM/.angular/cache ] && [ ! -w G-ROM/.angular/cache ]; then \
		printf "$(YELLOW)Cache antigo em G-ROM/.angular/cache sem permissao; removendo com sudo interno do workspace...$(NC)\n"; \
		chown -R $$(id -u):$$(id -g) G-ROM/.angular 2>/dev/null || true; \
	fi

# O container usa host network para que o adb dentro dele possa conectar ao adb server do host.
logs:
	@printf "$(MAGENTA)Mostrando logs do serviço...$(NC)\n"
	@$(DOCKER) logs $(PROJECT_NAME)

ps:
	@printf '$(BLUE)Listando containers ativos...$(NC)\n'
	@$(DOCKER) ps

adb-devices:
	@if command -v adb >/dev/null 2>&1; then \
		printf "$(CYAN)Listando dispositivos via adb do host...$(NC)\n"; \
		adb kill-server >/dev/null 2>&1 || true; \
		adb start-server >/dev/null 2>&1 || true; \
		adb devices -l; \
	else \
		printf "$(YELLOW)adb não encontrado no host; usando adb dentro do container...$(NC)\n"; \
		$(DOCKER) exec -it frontend /bin/bash -lc 'export PATH="/opt/android-sdk/platform-tools:/opt/android-sdk/cmdline-tools/latest/bin:$$PATH"; adb kill-server >/dev/null 2>&1; adb start-server >/dev/null 2>&1; sleep 1; adb devices -l'; \
	fi

clean:
	@clear
	@printf '\n$(MAGENTA)Selecione a opção de limpeza:$(NC)\n'
	@printf '  $(CYAN)[1] Limpar apenas recursos do projeto (compose)$(NC)\n'
	@printf '  $(CYAN)[2] Limpar TODOS os containers, volumes, imagens e redes do Docker$(NC)\n'
	@printf '  $(CYAN)[3] Cancelar$(NC)\n\n'
	@sh -c '\
		while true; do \
			printf "  $(YELLOW)Digite 1, 2 ou 3 e pressione ENTER: $(NC)"; \
			read opt; \
			case "$$opt" in \
				1) \
					printf "$(YELLOW)Limpando apenas recursos do projeto (compose)...$(NC)\n"; \
					$(DOCKER) down -v --remove-orphans; \
					exit 0; \
					;; \
				2) \
					trap "echo; echo -e '\''$(RED)Operação interrompida pelo usuário.$(NC)'\''; exit 130" INT; \
					printf "$(MAGENTA)Tem certeza que deseja remover TODOS os containers, volumes, imagens e redes no Docker? (s/N): $(NC)"; \
					read confirm; \
					if [ "$$confirm" = "s" ] || [ "$$confirm" = "S" ]; then \
						printf "$(RED)Removendo todos os containers, volumes, imagens e redes...$(NC)\n"; \
						docker stop $$(docker ps -aq) 2>/dev/null || true; \
						docker rm $$(docker ps -aq) 2>/dev/null || true; \
						docker volume prune -f; \
						docker network prune -f; \
						docker image prune -a -f; \
					else \
						printf "Operação cancelada.\n"; \
					fi; \
					exit 0; \
					;; \
				3) \
					printf "Operação cancelada.\n"; \
					exit 0; \
					;; \
				*) \
					printf "$(RED)Opção inválida. Tente novamente.$(NC)\n"; \
					;; \
			esac; \
		done \
	'

env-check:
	@printf "$(CYAN)Valores lidos do arquivo $(ENV_FILE):$(NC)\n"
	@printf "  PROJECT_NAME=%s\n" "$(PROJECT_NAME)"
