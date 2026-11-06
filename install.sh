#!/usr/bin/env bash

set -e

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}======================================================"
echo -e "       👵 SogrAI - Instalador Automatizado"
echo -e "======================================================${NC}"
echo ""

# 1. Checagem do Node.js
echo -e "${CYAN}🔍 [1/6] Verificando versão do Node.js...${NC}"
if ! command -v node >/dev/null 2>&1; then
    echo -e "${RED}❌ Node.js não encontrado. Instale o Node.js v20+ antes de continuar.${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo -e "${YELLOW}⚠️ Aviso: Recomendamos Node.js v20 ou superior. Versão detectada: $(node -v)${NC}"
else
    echo -e "${GREEN}✓ Node.js $(node -v) detectado com sucesso.${NC}"
fi

# 2. Checagem do pnpm
echo ""
echo -e "${CYAN}📦 [2/6] Verificando gerenciador de pacotes pnpm...${NC}"
if ! command -v pnpm >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️ pnpm não encontrado. Instalando pnpm globalmente...${NC}"
    npm install -g pnpm
fi
echo -e "${GREEN}✓ pnpm $(pnpm -v) pronto para uso.${NC}"

# 3. Configuração dos arquivos .env
echo ""
echo -e "${CYAN}⚙️ [3/6] Configurando arquivos de ambiente (.env)...${NC}"
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}✓ Arquivo .env raiz criado a partir de .env.example.${NC}"
else
    echo -e "${GREEN}✓ Arquivo .env raiz já existente.${NC}"
fi

if [ ! -f sograi-backend/.env ]; then
    cp sograi-backend/.env.example sograi-backend/.env 2>/dev/null || cp .env.example sograi-backend/.env
    echo -e "${GREEN}✓ Arquivo sograi-backend/.env configurado.${NC}"
fi

# 4. Instalação de dependências
echo ""
echo -e "${CYAN}📥 [4/6] Instalando dependências do Backend e Frontend com pnpm...${NC}"
echo -e "  -> Instalando dependências do backend..."
(cd sograi-backend && pnpm install)

echo -e "  -> Instalando dependências do frontend..."
(cd sograi-frontend && pnpm install)
echo -e "${GREEN}✓ Dependências instaladas com sucesso.${NC}"

# 5. Banco de Dados PostgreSQL e Prisma ORM
echo ""
echo -e "${CYAN}🗄️ [5/6] Configurando banco de dados PostgreSQL e Prisma ORM...${NC}"

# Verifica se a porta 5432 está aberta ou se o Docker pode subir o Postgres
if ! nc -z localhost 5432 2>/dev/null; then
    if command -v docker >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠️ PostgreSQL não detectado na porta 5432. Subindo container PostgreSQL via Docker...${NC}"
        docker compose up -d postgres
        echo -e "Aguardando PostgreSQL inicializar..."
        sleep 4
    else
        echo -e "${YELLOW}⚠️ PostgreSQL não detectado na porta 5432 e Docker não disponível.${NC}"
        echo -e "Certifique-se de que o PostgreSQL esteja em execução antes de rodar o backend."
    fi
else
    echo -e "${GREEN}✓ Instância PostgreSQL ativa detectada na porta 5432.${NC}"
fi

echo -e "  -> Sincronizando schema do banco via Prisma..."
(cd sograi-backend && pnpm prisma db push)
echo -e "${GREEN}✓ Schema do banco atualizado com sucesso.${NC}"

# 6. Compilação dos Projetos
echo ""
echo -e "${CYAN}🔨 [6/6] Realizando build de teste...${NC}"
(cd sograi-backend && pnpm build)
(cd sograi-frontend && pnpm build)
echo -e "${GREEN}✓ Backend e Frontend compilados com 0 erros.${NC}"

chmod +x install.sh start.sh 2>/dev/null || true

echo ""
echo -e "${GREEN}======================================================"
echo -e "       🎉 Instalação do SogrAI concluída com sucesso!"
echo -e "======================================================${NC}"
echo ""
echo -e "Para iniciar a aplicação em modo de desenvolvimento, execute:"
echo -e "   ${CYAN}./start.sh${NC}"
echo ""
echo -e "Ou para subir tudo em containers Docker de produção:"
echo -e "   ${CYAN}docker compose up -d --build${NC}"
echo ""
