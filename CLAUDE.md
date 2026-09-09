@AGENTS.md

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## O que é este projeto

**Priorion** ("Triagem") — protótipo visual de um sistema interno de triagem de demandas com pontuação RICE para uma software house. Fluxo: entrada em texto livre → refinamento por IA (entrevista guiada) → classificação RICE → fila priorizada.

**É um protótipo, não uma aplicação.** Regras do escopo (definidas nos briefings em `src/imports/pasted_text/`):

- Sem backend, banco, autenticação ou integração externa. Todos os dados são constantes fixas no próprio arquivo.
- A entrevista da IA é encenada (roteiro fixo em `INTERVIEW_STEPS`) — não chamar modelo de IA real.
- Única exceção: o simulador de sliders da tela Detalhe recalcula o RICE de verdade, em memória.

## Comandos

```bash
pnpm dev        # dev server (já roda na $PORT no ambiente Figma Make — não iniciar manualmente)
pnpm build      # build de produção
pnpm format     # formatar com oxfmt (não há linter nem testes)
```

Toolchain via `.mise.toml` (Node + pnpm). Há `package-lock.json` e `pnpm-lock.yaml` no repo; usar pnpm.

## Arquitetura

Tudo vive em **`src/App.tsx`** (~1800 linhas, single-file de propósito):

- `App` — estado `screen` + sidebar de navegação (atalhos 1–6, J/K/A/C na tela Revisão).
- 6 telas como componentes independentes: `QueueScreen` (fila priorizada com sort/filter), `NewDemandScreen` (entrevista IA), `BeforeAfterScreen` (comparação), `DetailScreen` (fatores + simulador RICE), `DashboardScreen`, `ReviewScreen` (auditoria das classificações da IA).
- Dados: `DEMANDS`, `DEMAND_DELTAS`, `REVIEW_ITEMS`, `TIMELINE`, `INTERVIEW_STEPS` — constantes no topo do arquivo.
- `calcRice(r, i, c, e)` — única lógica de negócio real: `(reach × impact × confidence) / effort`, arredondado a 1 decimal.
- `src/imports/pasted_text/*.md` — briefings de design que geraram o protótipo; são a especificação de referência (não são código).

## Convenções de estilo (dark "neon como sinal de dados")

- Paleta centralizada no objeto `BG` (constante em App.tsx) — usar os tokens dele, não cores novas.
- Neon/glow apenas como sinalização de dados (prioridade crítica/alto, barras de capacidade). Regra dos briefings: **se apagar todo o neon, a tela ainda funciona e fica bonita.** Uma única cor de acento (`#4D7CFF`).
- Layout via classes Tailwind; cores, bordas e tamanhos via `style={{...}}` inline com tokens do `BG` (padrão do arquivo — seguir).
- Keyframes, fontes (Geist/Geist Mono via `@theme`), scrollbar e range slider em `src/index.css`.
- Interface em pt-BR; valores numéricos com `toLocaleString('pt-BR')`; tipos `Priority`/`Status` usam acentos ('crítico', 'em-execução').
- Strings com apóstrofo: usar aspas duplas (regra do AGENTS.md).

## Rotina de trabalho

- Ao modificar código, atualize o CLAUDE.md imediatamente para manter as informações corretas.
- Use TaskCreate para organizar o trabalho; inclua sempre uma task final "atualizar o CLAUDE.md" com base no que foi mudado.