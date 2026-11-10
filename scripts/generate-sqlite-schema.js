#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const postgresSchemaPath = path.join(rootDir, 'sograi-backend', 'prisma', 'schema.prisma');
const sqliteSchemaPath = path.join(rootDir, 'sograi-backend', 'prisma', 'schema.sqlite.prisma');

if (!fs.existsSync(postgresSchemaPath)) {
  console.error(`❌ Arquivo não encontrado: ${postgresSchemaPath}`);
  process.exit(1);
}

let content = fs.readFileSync(postgresSchemaPath, 'utf8');

// 1. Troca provider para sqlite
content = content.replace(/provider\s*=\s*"postgresql"/g, 'provider = "sqlite"');

// 2. Troca tipo Decimal para Float
content = content.replace(/\bDecimal\b/g, 'Float');

// 3. Remove anotações @db.*
content = content.replace(/@db\.[A-Za-z0-9_]+(\([^)]*\))?/g, '');

// 4. Limpa espaços duplos remanescentes
content = content
  .split('\n')
  .map(line => line.replace(/[ \t]+$/, ''))
  .join('\n');

fs.writeFileSync(sqliteSchemaPath, content, 'utf8');
console.log(`✅ Schema SQLite gerado com sucesso em: ${sqliteSchemaPath}`);
