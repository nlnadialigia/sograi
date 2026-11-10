@echo off
setlocal enabledelayedexpansion

echo ======================================================
echo        SogrAI - Code Review Inteligente
echo          Inicializador Rapido Standalone
echo ======================================================
echo.

where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERRO] Node.js nao encontrado. Por favor, instale o Node.js v20+ em https://nodejs.org
    pause
    exit /b 1
)

set ROOT_DIR=%~dp0
cd /d "%ROOT_DIR%"

if not exist "%ROOT_DIR%data" mkdir "%ROOT_DIR%data"

if "%DATABASE_URL%"=="" (
    set "DATABASE_URL=file:%ROOT_DIR%data\sograi.db"
    echo [OK] Modo Standalone Portatil ativado (SQLite embutido: data\sograi.db)
    
    node scripts\generate-sqlite-schema.js >nul 2>nul
    cd /d "%ROOT_DIR%sograi-backend"
    call pnpm exec prisma db push --schema=prisma/schema.sqlite.prisma --skip-generate >nul 2>nul
    cd /d "%ROOT_DIR%"
    echo [OK] Banco de dados local SQLite inicializado com sucesso.
)

if not exist "%ROOT_DIR%sograi-frontend\dist" (
    echo [*] Compilando interface do SogrAI pela primeira vez...
    cd /d "%ROOT_DIR%sograi-frontend"
    call pnpm build >nul 2>nul
    cd /d "%ROOT_DIR%"
    echo [OK] Frontend compilado.
)

if not exist "%ROOT_DIR%sograi-backend\dist" (
    echo [*] Compilando servidor NestJS...
    cd /d "%ROOT_DIR%sograi-backend"
    call pnpm build >nul 2>nul
    cd /d "%ROOT_DIR%"
    echo [OK] Backend compilado.
)

if "%PORT%"=="" set PORT=3333

echo.
echo ======================================================
echo SogrAI pronto! Abrindo no seu navegador: http://localhost:%PORT%
echo Pressione Ctrl+C a qualquer momento para encerrar.
echo ======================================================
echo.

start "" "http://localhost:%PORT%"

cd /d "%ROOT_DIR%sograi-backend"
node dist\main.js
