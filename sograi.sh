#!/usr/bin/env bash
set -e

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "${CYAN}======================================================"
echo -e "       👵 SogrAI - Code Review Inteligente"
echo -e "         Inicializador Rápido Standalone"
echo -e "======================================================${NC}"
echo ""

# 1. Checagem do Node.js
if ! command -v node >/dev/null 2>&1; then
    echo -e "❌ Node.js não encontrado. Por favor, instale o Node.js v20+ para continuar."
    exit 1
fi

# 2. Configuração do Banco de Dados (SQLite por padrão local ou PostgreSQL se ativo)
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

mkdir -p "$ROOT_DIR/data"

if [ -z "${DATABASE_URL:-}" ] || [[ "${DATABASE_URL}" == file:* ]]; then
    export DATABASE_URL="file:$ROOT_DIR/data/sograi.db"
    echo -e "${GREEN}✓ Modo Standalone Portátil ativado (SQLite embutido: data/sograi.db)${NC}"
    
    # Gera o schema SQLite se necessário
    node scripts/generate-sqlite-schema.js >/dev/null 2>&1
    
    # Sincroniza as tabelas no SQLite
    (cd sograi-backend && pnpm exec prisma db push --schema=prisma/schema.sqlite.prisma --skip-generate >/dev/null 2>&1)
    echo -e "${GREEN}✓ Banco de dados local SQLite inicializado com sucesso.${NC}"
else
    echo -e "${GREEN}✓ Conectando ao banco configurado em DATABASE_URL${NC}"
fi

# 3. Compilação do Frontend se necessário
if [ ! -d "$ROOT_DIR/sograi-frontend/dist" ]; then
    echo -e "${CYAN}📦 Compilando interface do SogrAI pela primeira vez...${NC}"
    (cd sograi-frontend && pnpm build >/dev/null 2>&1)
    echo -e "${GREEN}✓ Frontend compilado.${NC}"
fi

# 4. Compilação do Backend se necessário
if [ ! -d "$ROOT_DIR/sograi-backend/dist" ]; then
    echo -e "${CYAN}⚙️ Compilando servidor NestJS...${NC}"
    (cd sograi-backend && pnpm build >/dev/null 2>&1)
    echo -e "${GREEN}✓ Backend compilado.${NC}"
fi

export PORT="${PORT:-3333}"

echo ""
echo -e "${BOLD}${GREEN}🚀 SogrAI pronto! Abrindo no seu navegador em:${NC} ${CYAN}http://localhost:${PORT}${NC}"
echo -e "${YELLOW}Pressione Ctrl+C a qualquer momento para encerrar.${NC}"
echo ""

# Abre o navegador padrão em background após 1.5s
(
    sleep 1.5
    if command -v xdg-open >/dev/null 2>&1; then
        xdg-open "http://localhost:${PORT}" >/dev/null 2>&1 || true
    elif command -v open >/dev/null 2>&1; then
        open "http://localhost:${PORT}" >/dev/null 2>&1 || true
    fi
) &

# Inicia o servidor unificado
cd "$ROOT_DIR/sograi-backend"
node dist/main.js
