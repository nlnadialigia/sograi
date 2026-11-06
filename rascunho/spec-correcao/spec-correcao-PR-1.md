# 🛠️ Spec de Correção e Implementação Técnica - PR #104638 (Iteração 1)
> **Objetivo:** Plano de ação prático e focado nos arquivos que necessitam de ajuste antes da aprovação do merge.
> Cole os trechos abaixo ou forneça este arquivo ao seu assistente de IA na IDE para aplicação imediata.

- **Repositório**: `portal-florestal-backend`
- **Autor**: Rubens Pinheiro Junior
- **Decisão Geral**: REPROVADA | **Risco**: Alto
- **Tempo Estimado**: 1 dia
- **Data da Análise**: 05/11/2026, 20:14:16

---

## 📋 Resumo das Ações Obrigatórias

1. **`/src/puzzle/pi/services/menu/menu-upload-values.ts`** - O código apresenta mutações em loops com alta complexidade ciclomática, ausência total de sanitização de dados de entrada e falta absoluta de testes unitários para cobrir divisões por zero e edge cases críticos.
2. **`/src/puzzle/infrastructure/puzzle.module.ts`** - O acoplamento horizontal entre domínios foi violado ao injetar um serviço de outro módulo diretamente nos provedores do PuzzleModule, destruindo o encapsulamento do domínio Pi.
3. **`/src/puzzle/pi/services/menu/menu-upload-file.service.ts`** - O código apresenta sérios riscos de segurança relacionados a DoS via descompressão de arquivos (Billion Laughs / Zip Bomb adaptado para XLSX) e tratamento inadequado de dados de entrada sem sanitização estrita, além de lacunas na cobertura de testes.
4. **`/src/puzzle/pi/sites/sp/services/sp-menu.service.ts`** - O código introduz tipagem frágil com type casting explícito ('as any'), lógica de normalização de frações com alta propensão a bugs e baixa legibilidade num método já sobrecarregado.

---

## 🎯 Arquivos com Pendências para Ajuste


### 📄 `/src/puzzle/pi/services/menu/menu-upload-values.ts` (add)
- **Status do Arquivo:** ❌ REPROVADO
- **Justificativa do Tech Lead:** O código apresenta mutações em loops com alta complexidade ciclomática, ausência total de sanitização de dados de entrada e falta absoluta de testes unitários para cobrir divisões por zero e edge cases críticos.

#### Apontamentos Técnicos:

- **[WARNING] STYLE - Uso de variáveis mutáveis em programação funcional**
  - **Problema:** O uso de 'let previousArea' e 'let accumulatedArea' dentro do map de partições introduz estado mutável desnecessário, dificultando o rastreio de efeitos colaterais e a legibilidade.
  - **Linhas:** `L30-L31`
  
```typescript
// Correção sugerida:
Utilize reduce para acumular os valores ou separe a lógica de cálculo de áreas em uma função auxiliar pura.
```


- **[BLOCKER] SECURITY - Falta de validação e sanitização de dados de entrada**
  - **Problema:** Os dados de entrada 'rows' vêm de uma fonte externa (upload). O código confia cegamente nas propriedades do objeto sem validar tipos, limites ou sanitizar contra injeções ou estruturas corrompidas.
  - **Linhas:** `L14`
  
```typescript
// Correção sugerida:
Implementar validação de schema (ex: Zod ou class-validator) antes de processar as linhas do upload.
```


- **[WARNING] PERFORMANCE - Possível divisão por zero ou arredondamento impreciso**
  - **Problema:** A divisão por 'total' (total de área) pode resultar em NaN ou Infinity se o total for zero, embora haja uma verificação 'total > 0'. No entanto, operações repetidas de fixedNumber podem causar desvios de precisão decimal na soma das áreas partidas.
  - **Linhas:** `L34`
  
```typescript
// Correção sugerida:
Garantir tratamento explícito para o caso de total === 0 e validar a precisão decimal acumulada.
```


- **[BLOCKER] TESTS - Ausência total de testes unitários**
  - **Problema:** O novo serviço foi adicionado sem nenhum arquivo de teste correspondente (.spec.ts). Regras de negócio complexas envolvendo partições MEC e mesclagem de valores não podem ser aceitas sem cobertura de testes.
  - **Linhas:** `L1-L47`
  
```typescript
// Correção sugerida:
Criar o arquivo menu-upload-values.spec.ts cobrindo cenários de sucesso, partições vazias, áreas zeradas e merge de nulos.
```

---


### 📄 `/src/puzzle/infrastructure/puzzle.module.ts` (edit)
- **Status do Arquivo:** ❌ REPROVADO
- **Justificativa do Tech Lead:** O acoplamento horizontal entre domínios foi violado ao injetar um serviço de outro módulo diretamente nos provedores do PuzzleModule, destruindo o encapsulamento do domínio Pi.

#### Apontamentos Técnicos:

- **[BLOCKER] STYLE - Violação de Fronteira de Módulo (Cross-domain provider injection)**
  - **Problema:** O serviço 'MenuUploadFileService' do domínio 'Pi' está sendo injetado diretamente nos providers do 'PuzzleModule'. Isso viola o encapsulamento do NestJS. O correto é exportar o serviço no 'PiModule' e garantir que o 'PiModule' gerencie suas próprias instâncias.
  - **Linhas:** `L11, L19`
  
```typescript
// Correção sugerida:
// No pi.module.ts:
@Module({ providers: [MenuUploadFileService], exports: [MenuUploadFileService] })
export class PiModule {}

// No puzzle.module.ts (imports PiModule, which is already there, just use the exported service via DI if PiModule exports it):
@Module({
  imports: [PiModule, ...],
  providers: [PuzzleService, PuzzleOrchestratorService]
})
```

---


### 📄 `/src/puzzle/pi/services/menu/menu-upload-file.service.ts` (add)
- **Status do Arquivo:** ❌ REPROVADO
- **Justificativa do Tech Lead:** O código apresenta sérios riscos de segurança relacionados a DoS via descompressão de arquivos (Billion Laughs / Zip Bomb adaptado para XLSX) e tratamento inadequado de dados de entrada sem sanitização estrita, além de lacunas na cobertura de testes.

#### Apontamentos Técnicos:

- **[BLOCKER] SECURITY - Falta de validação de tamanho de buffer e proteção contra Zip Bomb**
  - **Problema:** Carregar diretamente o buffer do arquivo enviado pelo usuário no ExcelJS sem validar o tamanho máximo do arquivo ou o número de células pode esgotar a memória do servidor, causando um ataque de DoS.
  - **Linhas:** `L32-L37`
  


- **[WARNING] STYLE - Método parse excessivamente longo e acumulador de responsabilidades**
  - **Problema:** O método `parse` lida com leitura de binário, validação de abas, extração de colunas, validação de cabeçalhos duplicados, mapeamento, normalização e parsing externo, violando o SOLID (SRP).
  - **Linhas:** `L29-L77`
  


- **[WARNING] PERFORMANCE - Processamento síncrono intensivo de memória em grandes planilhas**
  - **Problema:** O uso de operações encadeadas como `rows.map`, `Object.fromEntries` e geração de buffers inteiros na memória para o arquivo de erros (`workbook.xlsx.writeBuffer()`) pode causar picos de uso de memória em requisições concorrentes.
  - **Linhas:** `L62-L101`
  


- **[WARNING] TESTS - Ausência de suíte de testes unitários**
  - **Problema:** O arquivo novo não possui testes automatizados associados para garantir a resiliência contra entradas inválidas, cenários de erro e casos de borda.
  - **Linhas:** `L1-L103`
  

---


### 📄 `/src/puzzle/pi/sites/sp/services/sp-menu.service.ts` (edit)
- **Status do Arquivo:** ❌ REPROVADO
- **Justificativa do Tech Lead:** O código introduz tipagem frágil com type casting explícito ('as any'), lógica de normalização de frações com alta propensão a bugs e baixa legibilidade num método já sobrecarregado.

#### Apontamentos Técnicos:

- **[BLOCKER] STYLE - Uso de type casting (as any) para burlar o sistema de tipos**
  - **Problema:** O uso de `(item as any).isMecPartition` destrói a segurança de tipos do TypeScript. A propriedade deveria estar explícita na interface `CreateMenu` ou o objeto deveria ser validado adequadamente.
  - **Linhas:** `L45`
  
```typescript
// Correção sugerida:
if (item.slopeLower == null || item.slopeUpper == null || item.isMecPartition)
```


- **[WARNING] PERFORMANCE - Buscas lineares em loops encadeados (Complexidade O(N*M))**
  - **Problema:** Utilizar `dbMenus.find(...)` dentro do loop principal `for (const item of data)` resulta em complexidade de tempo quadrática quando o volume de dados cresce. Deve-se criar um Map de `dbMenus` indexado por `up` antes do loop.
  - **Linhas:** `L46-L115`
  
```typescript
// Correção sugerida:
const dbMenuMap = new Map(dbMenus.map(m => [m.up, m]));
// utilizar dbMenuMap.get(key) em vez de .find()
```


- **[WARNING] STYLE - Lógica de normalização de frações opaca**
  - **Problema:** A condição `if (slopeLower + slopeUpper > 0 && slopeLower + slopeUpper <= 1)` é mágica e difícil de manter. Deve ser extraída para um método privado descritivo, ex: `this.isFractionalScale(slopeLower, slopeUpper)`.
  - **Linhas:** `L54-L57`
  

---


## 💡 Instrução de Finalização
Após realizar as correções nos arquivos indicados, realize o commit/push no Azure DevOps e solicite a re-análise na plataforma SogrAI para conferência automática da resolução dos itens.
