#!/usr/bin/env bash

set -e

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${CYAN}======================================================"
echo -e "       👵 SogrAI - Inicializando Serviços..."
echo -e "======================================================${NC}"
echo ""

# Garante que o PostgreSQL esteja em execução se o docker estiver disponível
if ! nc -z localhost 5432 2>/dev/null; then
    if command -v docker >/dev/null 2>&1; then
        echo -e "${YELLOW}Subindo container do PostgreSQL...${NC}"
        docker compose up -d postgres
        sleep 2
    fi
fi

echo -e "${GREEN}Iniciando Backend (porta 3333) e Frontend (porta 5173)...${NC}"
echo -e "Pressione ${YELLOW}Ctrl+C${NC} para encerrar todos os serviços."
echo ""

# Inicia backend em segundo plano e frontend no primeiro plano
(cd sograi-backend && pnpm start:dev) &
BACKEND_PID=$!

(cd sograi-frontend && pnpm dev) &
FRONTEND_PID=$!

trap "echo ''; echo 'Encerrando SogrAI...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" SIGINT SIGTERM

wait
