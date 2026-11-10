#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const postgresSchemaPath = path.join(rootDir, 'sograi-backend', 'prisma', 'schema.prisma');
const sqliteSchemaPath = path.join(rootDir, 'sograi-backend', 'prisma', 'schema.sqlite.prisma');

if (!fs.existsSync(postgresSchemaPath)) {
  console.error(`❌ Arquivo de schema canônico PostgreSQL não encontrado: ${postgresSchemaPath}`);
  process.exit(1);
}

const originalContent = fs.readFileSync(postgresSchemaPath, 'utf8');

// Transformação estruturada de schema: PostgreSQL -> SQLite
function transformSchemaToSqlite(source) {
  const lines = source.split('\n');
  const transformed = [];

  for (let line of lines) {
    // 1. Converte provider do datasource db
    if (/^\s*provider\s*=\s*"postgresql"\s*$/.test(line)) {
      transformed.push(line.replace('"postgresql"', '"sqlite"'));
      continue;
    }

    // 2. Converte tipos Decimal para Float (SQLite não suporta Decimal nativo no Prisma)
    let processedLine = line.replace(/\bDecimal\b/g, 'Float');

    // 3. Remove anotações específicas de dialeto PostgreSQL (@db.*)
    processedLine = processedLine.replace(/@db\.[A-Za-z0-9_]+(\([^)]*\))?/g, '');

    // 4. Remove espaços vazios redundantes no fim da linha
    transformed.push(processedLine.replace(/[ \t]+$/, ''));
  }

  return transformed.join('\n');
}

const sqliteContent = transformSchemaToSqlite(originalContent);

// Sanity check pós-geração
if (!sqliteContent.includes('provider = "sqlite"')) {
  console.error('❌ Falha na validação: o schema gerado não contém `provider = "sqlite"`');
  process.exit(1);
}

if (/@db\./.test(sqliteContent)) {
  console.error('❌ Falha na validação: anotações não compatíveis @db.* ainda presentes no schema gerado');
  process.exit(1);
}

fs.writeFileSync(sqliteSchemaPath, sqliteContent, 'utf8');
console.log(`✅ Schema SQLite gerado e validado com sucesso em: ${sqliteSchemaPath}`);
