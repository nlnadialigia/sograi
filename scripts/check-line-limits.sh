#!/usr/bin/env bash
set -euo pipefail

echo "=========================================="
echo "🔍 SogrAI - Auditoria de Limites de Linhas"
echo "=========================================="

ERRORS=0

echo "▶ Verificando Frontend (limite: 350 linhas por arquivo)..."
while IFS= read -r file; do
  lines=$(wc -l < "$file")
  if [ "$lines" -gt 350 ]; then
    echo "❌ [FALHA FRONTEND] $file possui $lines linhas (máximo permitido: 350)"
    ERRORS=$((ERRORS + 1))
  fi
done < <(find sograi-frontend/src -type f \( -name "*.tsx" -o -name "*.jsx" -o -name "*.ts" \))

echo "▶ Verificando Serviços do Backend (limite: 500 linhas por serviço)..."
while IFS= read -r file; do
  lines=$(wc -l < "$file")
  if [ "$lines" -gt 500 ]; then
    echo "❌ [FALHA BACKEND] $file possui $lines linhas (máximo permitido: 500)"
    ERRORS=$((ERRORS + 1))
  fi
done < <(find sograi-backend/src -type f -name "*.service.ts")

if [ "$ERRORS" -gt 0 ]; then
  echo "=========================================="
  echo "💥 Falha: $ERRORS arquivo(s) violaram as regras de limite de linhas!"
  echo "=========================================="
  exit 1
fi

echo "✅ Todos os arquivos estão em estrita conformidade com os limites arquiteturais!"
exit 0
