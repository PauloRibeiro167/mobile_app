#!/usr/bin/env bash
set -euo pipefail

# entrypoint.sh: cria usuário com UID/GID fornecidos via env (LOCAL_UID/LOCAL_GID) e executa CMD
# Uso: defina LOCAL_UID e LOCAL_GID ao subir o container para que o usuário criado
# corresponda ao usuário do host e permita editar arquivos montados sem sudo.

: ${LOCAL_UID:=}
: ${LOCAL_GID:=}
: ${USER_NAME:=dev}

# Caminho do arquivo de ambiente dentro do workspace montado
ENV_FILE_PATH="/workspaces/.env.development"
BASE_DIR="/workspaces"
WORKSPACE_DIR="/workspaces"

# Função: gera .env.development no workspace se não existir
generate_env_if_missing() {
  if [ -f "$ENV_FILE_PATH" ]; then
    return 0
  fi

  # Tentar detectar UID/GID do host a partir do mountpoint $WORKSPACE_DIR
  DETECTED_UID=1000
  DETECTED_GID=1000
  if [ -d "$WORKSPACE_DIR" ]; then
    if command -v stat >/dev/null 2>&1; then
      DETECTED_UID=$(stat -c %u $WORKSPACE_DIR 2>/dev/null || id -u)
      DETECTED_GID=$(stat -c %g $WORKSPACE_DIR 2>/dev/null || id -g)
    fi
  fi

  # Preferir variáveis fornecidas ao entrypoint, senão usar detectadas
  if [ -z "${LOCAL_UID:-}" ]; then
    LOCAL_UID=$DETECTED_UID
  fi
  if [ -z "${LOCAL_GID:-}" ]; then
    LOCAL_GID=$DETECTED_GID
  fi

  # Valores padrão
  DEFAULT_PROJECT_NAME="app-mercado"
  DEFAULT_DB="postgres"
  DEFAULT_DB_USER="sitfor_user"
  DEFAULT_DB_NAME="sitfor_db"
  DEFAULT_POSTGRES_USER="sitfor_user"
  DEFAULT_POSTGRES_PASSWORD="sitfor_pass"

  # Em modo interativo podemos perguntar ao usuário (necessário -it e INTERACTIVE_ENV=1)
  if [ "${INTERACTIVE_ENV:-0}" = "1" ] && [ -t 0 ]; then
    read -r -p "Project name [${DEFAULT_PROJECT_NAME}]: " PROJECT_NAME_INPUT
    PROJECT_NAME=${PROJECT_NAME_INPUT:-$DEFAULT_PROJECT_NAME}
    read -r -p "DB engine [${DEFAULT_DB}]: " DB_INPUT
    DB=${DB_INPUT:-$DEFAULT_DB}
    read -r -p "DB user [${DEFAULT_DB_USER}]: " DB_USER_INPUT
    DB_USER=${DB_USER_INPUT:-$DEFAULT_DB_USER}
    read -r -p "DB name [${DEFAULT_DB_NAME}]: " DB_NAME_INPUT
    DB_NAME=${DB_NAME_INPUT:-$DEFAULT_DB_NAME}
    read -r -p "Postgres user (for container) [${DEFAULT_POSTGRES_USER}]: " POSTGRES_USER_INPUT
    POSTGRES_USER=${POSTGRES_USER_INPUT:-$DEFAULT_POSTGRES_USER}
    read -s -r -p "Postgres password [${DEFAULT_POSTGRES_PASSWORD}]: " POSTGRES_PASSWORD_INPUT || true
    echo
    POSTGRES_PASSWORD=${POSTGRES_PASSWORD_INPUT:-$DEFAULT_POSTGRES_PASSWORD}
  else
    # não-interativo: usar valores de env se existirem, senão defaults
    PROJECT_NAME=${PROJECT_NAME:-$DEFAULT_PROJECT_NAME}
    DB=${DB:-$DEFAULT_DB}
    DB_USER=${DB_USER:-$DEFAULT_DB_USER}
    DB_NAME=${DB_NAME:-$DEFAULT_DB_NAME}
    POSTGRES_USER=${POSTGRES_USER:-$DEFAULT_POSTGRES_USER}
    POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-$DEFAULT_POSTGRES_PASSWORD}
  fi

  # Gerar arquivo de forma atômica
  tmpfile=$(mktemp /tmp/.env.development.XXXXXX)
  cat > "$tmpfile" <<EOF
# .env.development gerado automaticamente pelo entrypoint
LOCAL_UID=$LOCAL_UID
LOCAL_GID=$LOCAL_GID

ENV_FILE=.env.development
PROJECT_NAME=$PROJECT_NAME
DB=$DB
DB_USER=$DB_USER
DB_NAME=$DB_NAME
POSTGRES_USER=$POSTGRES_USER
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
POSTGRES_DB=$DB_NAME
EOF

  if mkdir -p "$(dirname "$ENV_FILE_PATH")" 2>/dev/null; then
    mv "$tmpfile" "$ENV_FILE_PATH" 2>/dev/null || cp "$tmpfile" "$ENV_FILE_PATH" 2>/dev/null || true
    echo "arquivo gerado: $ENV_FILE_PATH (LOCAL_UID=$LOCAL_UID LOCAL_GID=$LOCAL_GID)"
  else
    echo "[WARN] Não foi possível criar diretório para $ENV_FILE_PATH; pulando geração do arquivo." >&2
    rm -f "$tmpfile" || true
  fi
}

# criar grupo com GID se não existir
EXISTING_GROUP=$(getent group | awk -F: -v gid="$LOCAL_GID" '$3==gid{print $1}' || true)
if [ -z "$EXISTING_GROUP" ]; then
  groupadd -g "$LOCAL_GID" "$USER_NAME" 2>/dev/null || true
else
  # se já existe um grupo com esse GID, reuse o nome
  USER_GROUP="$EXISTING_GROUP"
fi

# criar usuário com UID/GID se não existir
EXISTING_USER=$(getent passwd | awk -F: -v uid="$LOCAL_UID" '$3==uid{print $1}' || true)
if [ -z "$EXISTING_USER" ]; then
  useradd -m -u "$LOCAL_UID" -g "${USER_GROUP:-$LOCAL_GID}" -s /bin/bash "$USER_NAME" 2>/dev/null || true
else
  USER_NAME="$EXISTING_USER"
fi

# Ajustar propriedade do diretório de trabalho (workspace) para o usuário criado
if [ -d "/workspaces" ]; then
  # tentar ajustar permissões, mas não falhar se não for permitido
  chown -R "$LOCAL_UID":"$LOCAL_GID" /workspaces 2>/dev/null || echo "[WARN] chown /workspaces falhou; pode ser problema de permissões do host" >&2
fi

# Configurar Git safe.directory para evitar erros de ownership
if [ -d "/workspaces/.git" ]; then
  # Configurar safe.directory para o usuário root
  git config --global --add safe.directory /workspaces 2>/dev/null || true
  git config --global --add safe.directory '*' 2>/dev/null || true
  
  # Configurar para o usuário criado também
  if command -v gosu >/dev/null 2>&1; then
    gosu "$USER_NAME" git config --global --add safe.directory /workspaces 2>/dev/null || true
    gosu "$USER_NAME" git config --global --add safe.directory '*' 2>/dev/null || true
  else
    su -c "git config --global --add safe.directory /workspaces" "$USER_NAME" 2>/dev/null || true
    su -c "git config --global --add safe.directory '*'" "$USER_NAME" 2>/dev/null || true
  fi
fi

# Função: tornar executáveis todos os scripts do diretório bin
make_bin_scripts_executable() {
  local bin_dir="/workspaces/api/bin"
  
  if [ ! -d "$bin_dir" ]; then
    echo "[INFO] Diretório $bin_dir não encontrado, pulando configuração de permissões dos scripts" >&2
    return 0
  fi
  
  echo "[INFO] Tornando executáveis os scripts em $bin_dir"
  
  # Tornar executáveis todos os arquivos no diretório bin (recursivamente)
  find "$bin_dir" -type f -exec chmod +x {} \; 2>/dev/null || {
    echo "[WARN] Não foi possível definir permissões executáveis para alguns arquivos em $bin_dir" >&2
    return 0
  }
  
  # Listar alguns dos principais scripts tornados executáveis (para confirmação)
  local main_scripts=("apk" "app" "build" "check_deps" "clean" "dev" "develop" "install" "live-reload" "logcat-app" "production" "staging" "sync" "test")
  
  for script in "${main_scripts[@]}"; do
    if [ -f "$bin_dir/$script" ] && [ -x "$bin_dir/$script" ]; then
      echo "[INFO] ✓ $script executável"
    fi
  done
  
  # Verificar subdiretórios builds e checks
  for subdir in "builds" "checks"; do
    if [ -d "$bin_dir/$subdir" ]; then
      local count=$(find "$bin_dir/$subdir" -type f -executable | wc -l)
      echo "[INFO] ✓ $count arquivos executáveis em $subdir/"
    fi
  done
}

# Função: instalar dependências Ruby (bundle install) para o backend
install_ruby_dependencies() {
  local backend_dir="/workspaces/api"
  
  if [ ! -f "$backend_dir/Gemfile" ]; then
    echo "[INFO] Gemfile não encontrado em $backend_dir, pulando instalação de dependências Ruby" >&2
    return 0
  fi
  
  echo "[INFO] Verificando e instalando dependências Ruby..."
  
  # Mudar para o diretório do backend
  cd "$backend_dir" || {
    echo "[WARN] Não foi possível acessar $backend_dir" >&2
    return 1
  }
  
  # Verificar se bundle está disponível
  if ! command -v bundle >/dev/null 2>&1; then
    echo "[WARN] Bundler não encontrado, pulando instalação de dependências Ruby" >&2
    return 1
  fi
  
  # Verificar se as dependências já estão instaladas
  if bundle check >/dev/null 2>&1; then
    echo "[INFO] ✓ Dependências Ruby já instaladas"
    return 0
  fi
  
  echo "[INFO] Instalando dependências Ruby..."
  
  # Instalar dependências
  if bundle install --quiet; then
    echo "[INFO] ✓ Dependências Ruby instaladas com sucesso"
  else
    echo "[WARN] Falha na instalação de dependências Ruby, tentando sem cache..." >&2
    bundle install --no-cache --quiet || {
      echo "[ERROR] Falha persistente na instalação de dependências Ruby" >&2
      return 1
    }
  fi
}

# Executar a função para tornar os scripts executáveis
make_bin_scripts_executable

# Instalar dependências Ruby
install_ruby_dependencies || echo "[WARN] Instalação de dependências Ruby falhou, mas continuando..." >&2

# Ajustar permissões para backend se necessário
if [ "$PWD" = "/workspaces/backend" ] && [ -d "/workspaces/backend" ]; then
  chown -R "$USER_NAME:$USER_NAME" /workspaces/backend 2>/dev/null || true
fi

# Geração embutida do .env.development para manter consistência (não sobrescreve se já existir)
generate_env_if_missing || true

# Se houver um comando, executar como o usuário criado. Caso contrário, iniciar shell.
if [ "$#" -gt 0 ]; then
  # Construir linha de comando segura (simples):
  CMDLINE="$*"

  # Se o alvo for um arquivo presente mas não executável (ex.: mount noexec ou sem bit),
  # execute através do interpretador bash para evitar 'permission denied'.
  if [ -f "$1" ] && [ ! -x "$1" ]; then
    if command -v gosu >/dev/null 2>&1; then
      exec gosu "$USER_NAME" bash -lc "$CMDLINE"
    else
      exec su -s /bin/bash -c "bash -lc '$CMDLINE'" "$USER_NAME"
    fi
  else
    # Normal path: exec direto
    if command -v gosu >/dev/null 2>&1; then
      exec gosu "$USER_NAME" "$@"
    else
      exec su -s /bin/bash -c "$CMDLINE" "$USER_NAME"
    fi
  fi
else
  if command -v gosu >/dev/null 2>&1; then
    exec gosu "$USER_NAME" bash -l
  else
    exec su - "$USER_NAME"
  fi
fi
