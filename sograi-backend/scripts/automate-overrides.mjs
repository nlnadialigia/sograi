/* eslint-disable @typescript-eslint/no-unused-vars */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
/* global console */

// 1. Garantir diretório raiz do projeto e PATH configurado
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
process.chdir(ROOT_DIR);

const home = process.env.HOME || '';
const extraPaths = [
  path.join(home, '.local/share/pnpm'),
  path.join(home, '.pnpm'),
  path.join(home, '.nvm/versions/node', process.version, 'bin'),
  path.join(home, '.nvm/versions/node', process.version, 'lib/node_modules/corepack/shims'),
  path.join(home, '.local/share/fnm/current/bin'),
];
process.env.PATH = `${extraPaths.join(':')}:${process.env.PATH || ''}`;

const PKG_PATH = path.join(ROOT_DIR, 'package.json');
const WORKSPACE_PATH = path.join(ROOT_DIR, 'pnpm-workspace.yaml');
const PNPM_LOCK = path.join(ROOT_DIR, 'pnpm-lock.yaml');

function checkPnpm() {
  try {
    execSync('pnpm --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function clearOverrides() {
  console.log('🧹 Limpando overrides antigos no package.json e pnpm-workspace.yaml...');

  // 1. Limpar package.json
  try {
    if (fs.existsSync(PKG_PATH)) {
      const pkg = JSON.parse(fs.readFileSync(PKG_PATH, 'utf8'));
      let modified = false;

      if (pkg.overrides) {
        delete pkg.overrides;
        modified = true;
      }
      if (pkg.pnpm?.overrides) {
        delete pkg.pnpm.overrides;
        if (Object.keys(pkg.pnpm).length === 0) {
          delete pkg.pnpm;
        }
        modified = true;
      }

      if (modified) {
        fs.writeFileSync(PKG_PATH, JSON.stringify(pkg, null, 2) + '\n');
        console.log('📝 package.json: overrides removidos.');
      }
    }
  } catch (err) {
    console.warn('⚠️ Não foi possível limpar overrides em package.json:', err.message);
  }

  // 2. Limpar pnpm-workspace.yaml
  if (fs.existsSync(WORKSPACE_PATH)) {
    const workspaceContent = fs.readFileSync(WORKSPACE_PATH, 'utf8');
    const lines = workspaceContent.split('\n');
    const newLines = [];
    let inOverrides = false;

    for (const line of lines) {
      if (line.startsWith('overrides:')) {
        inOverrides = true;
        continue;
      }
      if (inOverrides) {
        if (line.trim().length > 0 && !line.match(/^\s/)) {
          inOverrides = false;
        } else {
          continue;
        }
      }
      newLines.push(line);
    }

    const newWorkspaceContent =
      newLines
        .join('\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim() + '\n';
    if (workspaceContent !== newWorkspaceContent) {
      fs.writeFileSync(WORKSPACE_PATH, newWorkspaceContent);
      console.log('📝 pnpm-workspace.yaml: overrides removidos.');
    }
  }
}

function cleanAndInstall(message) {
  const targets = ['node_modules'];
  if (fs.existsSync(PNPM_LOCK)) targets.push('pnpm-lock.yaml');

  console.log(`🗑️ Removendo: ${targets.join(', ')}...`);
  for (const target of targets) {
    const fullPath = path.join(ROOT_DIR, target);
    if (fs.existsSync(fullPath)) {
      fs.rmSync(fullPath, { recursive: true, force: true });
    }
  }

  console.log(`📦 ${message}...`);
  execSync('pnpm install', { stdio: 'inherit' });

  if (fs.existsSync(path.join(ROOT_DIR, 'prisma/schema.prisma'))) {
    console.log('🔄 Regenerando Prisma Client...');
    try {
      execSync('pnpm run db:generate', { stdio: 'inherit' });
    } catch {
      try {
        execSync('npx prisma generate', { stdio: 'inherit' });
      } catch (err) {
        console.warn('⚠️ Alerta ao rodar prisma generate:', err.message);
      }
    }
  }
}

function getAuditData() {
  console.log('🔍 Rodando pnpm audit...');
  try {
    const output = execSync('pnpm audit --json', { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
    return JSON.parse(output);
  } catch (error) {
    if (error.stdout) {
      return JSON.parse(error.stdout);
    }
    throw error;
  }
}

function extractVersion(range) {
  if (!range || typeof range !== 'string') return null;
  const match = range.match(/\d+\.\d+\.\d+/);
  return match ? match[0] : null;
}

function applyOverrides(newOverrides) {
  console.log('🔧 Aplicando novos overrides:', newOverrides);

  // 1. Atualizar package.json
  if (fs.existsSync(PKG_PATH)) {
    const pkg = JSON.parse(fs.readFileSync(PKG_PATH, 'utf8'));
    pkg.overrides = newOverrides;
    fs.writeFileSync(PKG_PATH, JSON.stringify(pkg, null, 2) + '\n');
    console.log('📝 package.json atualizado.');
  }

  // 2. Atualizar pnpm-workspace.yaml
  let workspaceContent = '';
  if (fs.existsSync(WORKSPACE_PATH)) {
    workspaceContent = fs.readFileSync(WORKSPACE_PATH, 'utf8').trimEnd();
  }

  const overridesBlock = Object.entries(newOverrides)
    .map(([pkgName, version]) => `  '${pkgName}': '${version}'`)
    .join('\n');

  workspaceContent = workspaceContent
    ? `${workspaceContent}\n\noverrides:\n${overridesBlock}\n`
    : `overrides:\n${overridesBlock}\n`;
  fs.writeFileSync(WORKSPACE_PATH, workspaceContent);
  console.log('📝 pnpm-workspace.yaml atualizado com overrides.');
}

function isNewer(v1, v2) {
  const parts1 = (v1 || '').split('.').map((n) => parseInt(n, 10) || 0);
  const parts2 = (v2 || '').split('.').map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < 3; i++) {
    const p1 = parts1[i] ?? 0;
    const p2 = parts2[i] ?? 0;
    if (p1 > p2) return true;
    if (p1 < p2) return false;
  }
  return false;
}

async function run() {
  if (!checkPnpm()) {
    console.error('❌ Erro: pnpm não encontrado no sistema. Este script requer pnpm instalado.');
    process.exit(1);
  }

  try {
    clearOverrides();
    cleanAndInstall('Instalando dependências puras (sem overrides)');

    const audit = getAuditData();
    const newOverrides = {};

    // 1. Formato de advisories (pnpm audit / legado npm)
    if (audit.advisories) {
      for (const id in audit.advisories) {
        const advisory = audit.advisories[id];
        const pkgName = advisory?.module_name;
        const patchedRange = advisory?.patched_versions;
        const version = extractVersion(patchedRange);

        if (pkgName && version) {
          if (!newOverrides[pkgName] || isNewer(version, newOverrides[pkgName])) {
            newOverrides[pkgName] = version;
          }
        }
      }
    }

    // 2. Formato de vulnerabilities (pnpm audit / npm v7+)
    if (audit.vulnerabilities) {
      for (const [pkgName, vuln] of Object.entries(audit.vulnerabilities)) {
        let fixVersion = null;
        if (typeof vuln?.fixAvailable === 'object' && vuln?.fixAvailable?.version) {
          fixVersion = vuln.fixAvailable.version;
        } else if (typeof vuln?.fixAvailable === 'string') {
          fixVersion = extractVersion(vuln.fixAvailable);
        }

        if (!fixVersion && Array.isArray(vuln?.via)) {
          for (const item of vuln.via) {
            if (typeof item === 'object' && item?.fixAvailable) {
              if (typeof item.fixAvailable === 'object' && item.fixAvailable?.version) {
                fixVersion = item.fixAvailable.version;
                break;
              } else if (typeof item.fixAvailable === 'string') {
                fixVersion = extractVersion(item.fixAvailable);
                if (fixVersion) break;
              }
            }
          }
        }

        if (fixVersion) {
          const version = extractVersion(fixVersion) || fixVersion;
          if (version && (!newOverrides[pkgName] || isNewer(version, newOverrides[pkgName]))) {
            newOverrides[pkgName] = version;
          }
        }
      }
    }

    if (Object.keys(newOverrides).length === 0) {
      console.log('✅ Nenhuma vulnerabilidade passível de override encontrada. O ambiente está seguro!');
      return;
    }

    applyOverrides(newOverrides);
    cleanAndInstall('Instalando dependências (aplicando correções)');

    console.log('🧪 Validando com novo pnpm audit...');
    try {
      execSync('pnpm audit', { stdio: 'inherit' });
      console.log('✨ Tudo limpo!');
    } catch {
      console.warn('⚠️ Vulnerabilidades residuais detectadas. Verifique manualmente.');
    }
  } catch (error) {
    console.error('❌ Erro crítico:', error.message);
    process.exit(1);
  }
}

run();
