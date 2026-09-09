# V2 — MODO ESCURO COM ACENTOS NEON

> Pedido de mudança sobre a v1. Cole no Figma Make ou no v0 apontando para o protótipo já gerado.
> **A estrutura não muda.** Layout, densidade, colunas, dados e fluxo permanecem idênticos.
> O que muda é o sistema de cor, elevação e sinalização.

---

## AVISO ANTES DE COMEÇAR

**Escuro + neon + glassmorphism é a combinação mais "cara de IA" que existe.** É o preset de todo gerador de site desde 2023: fundo preto, card translúcido com blur, glow roxo e ciano, gradiente de malha ao fundo.

O que separa o dark premium do dark genérico é **restrição**. Linear e Vercel tratam escuro como padrão, não como tema alternativo, e usam **uma cor de acento apenas**. O neon aqui é **sinal de dados**, não iluminação ambiente: ele aparece onde a informação é crítica e em nenhum outro lugar.

Regra que resume tudo: **se você apagar todo o neon da tela, ela ainda tem que funcionar e ficar bonita.** O neon é a camada de urgência, não a estrutura.

---

## REFERÊNCIAS PARA ESTUDAR (nesta ordem)

| Referência | O que copiar |
|---|---|
| **Linear (dark)** | Restrição. Superfície quase preta, uma cor de acento, hierarquia por tipografia |
| **PostHog** | Densidade de dados em escuro sem cansar. Verde usado com parcimônia para guiar o olho |
| **Supabase** | Hierarquia tipográfica clara com destaque em verde. Polimento de ferramenta de dev |
| **Bloomberg Terminal / dashboards financeiros** | Números em mono, tabelas densas, acento âmbar, layout feito para varrer milhares de linhas sem fadiga |
| **Dashboards de observabilidade (estética de terminal)** | Near-black, JetBrains Mono, verde neon com semântica de "saudável" |

Note o padrão: **todos usam UMA cor de acento com significado.** Nenhum usa cinco.

---

## SISTEMA DE COR — V2

```
SUPERFÍCIES  (near-black, nunca #000000 puro)
  canvas          #0A0A0B
  superfície      #111113      cards, tabela, painéis
  superfície-2    #17171A      hover de linha, cabeçalho de tabela
  superfície-3    #1E1E22      estado ativo, dropdown

BORDAS  (a elevação vem daqui, não de sombra)
  borda           #232327
  borda-forte     #2E2E33      divisor de seção
  borda-acento    rgba(77,124,255,0.35)

TEXTO
  primário        #EDEDEF
  secundário      #9B9BA3
  terciário       #6B6B73
  desabilitado    #4A4A52

AÇÃO / MARCA  (uma só cor, usada pouco)
  ação            #4D7CFF
  ação-hover      #6B93FF
  ação-suave      rgba(77,124,255,0.12)   fundo de item selecionado
  foco            0 0 0 2px rgba(77,124,255,0.45)

PRIORIDADE — AQUI MORA O NEON
  crítico         texto #FF5C5C   fundo rgba(255,92,92,0.10)   borda rgba(255,92,92,0.28)
  alto            texto #FFA23A   fundo rgba(255,162,58,0.10)  borda rgba(255,162,58,0.28)
  médio           texto #FFD84D   fundo rgba(255,216,77,0.09)  borda rgba(255,216,77,0.25)
  baixo           texto #3DDC97   fundo rgba(61,220,151,0.10)  borda rgba(61,220,151,0.28)
  arquivado       texto #6B6B73   fundo rgba(255,255,255,0.04) borda #2E2E33
```

**Alternativa de acento, se quiser algo menos comum que azul:** lime ácido `#C3F53C`. Mais distintivo, combina com o resto da paleta, mas exige texto escuro por cima em botões preenchidos.

---

## COMO FAZER O GLOW (importante)

O glow bom é **sombra colorida de baixa opacidade**, não blur de fundo.

```css
/* Badge de prioridade crítica */
box-shadow: 0 0 12px rgba(255, 92, 92, 0.25);

/* Ponto indicador de status */
box-shadow: 0 0 6px currentColor;

/* Linha de tabela crítica — barra fina à esquerda, não fundo inteiro */
border-left: 2px solid #FF5C5C;
box-shadow: inset 2px 0 8px -4px rgba(255, 92, 92, 0.5);
```

**Onde o glow pode aparecer:**
- Badge de prioridade crítica e alta
- Ponto de status ao lado do número RICE
- Barra de progresso de completude na Tela 2
- Barra empilhada de distribuição do painel
- Borda esquerda de linha crítica na tabela

**Onde NÃO pode:** card inteiro, header, sidebar, botão comum, texto de corpo, fundo de página.

---

## MUDANÇAS POR ELEMENTO

**Tabela.** Cabeçalho em `superfície-2` com texto terciário 11px uppercase. Linhas separadas por borda de 1px `#232327`, não por listra zebrada. Hover leva a linha para `superfície-2`. Linha selecionada ganha `ação-suave` + borda esquerda azul de 2px.

**Score RICE.** Continua em mono tabular, mas agora em `#EDEDEF` com peso 500. Ao lado dele, um ponto de 6px na cor da prioridade, com glow. O número não fica neon — o ponto fica.

**Badges de prioridade.** Fundo translúcido da cor + borda de 1px da cor + texto na cor. Raio 4px, altura 20px, 11px uppercase com `letter-spacing: 0.04em`.

**Números sem estimativa.** Em `#4A4A52` com ícone de alerta em `#FFA23A`. O contraste do vazio contra o preenchido é o que faz a fila ser lida rápido.

**Textura.** Adicione grain/noise a 2–3% de opacidade sobre o canvas. É o truque mais barato para tirar a chapação de fundo liso e é o que separa dark caro de dark de template.

**Foco de teclado.** Anel em `ação` com 2px. Visível sempre — em dark, foco discreto some.

**Seleção de texto.** `::selection { background: rgba(77,124,255,0.3); }`

**Gráficos do painel.** Barra empilhada usando as 4 cores de prioridade com glow suave. Eixos e grid em `#232327`, quase invisíveis. Rótulos em texto terciário.

---

## MOTION

Só onde comunica estado. Use Motion (Framer Motion).

- Linha da tabela ao entrar: fade + 4px de deslocamento, 180ms, escalonado em 20ms
- Badge crítico: pulso de glow muito sutil, 2s de ciclo, **só nas linhas críticas** — se tudo pulsa, nada chama atenção
- Slider da Tela 4: score e posição na fila animam com spring ao arrastar
- Barra de completude da Tela 2: preenche com ease-out de 300ms a cada lacuna fechada
- Respeitar `prefers-reduced-motion`

---

## COMPONENTES DE APOIO (21st.dev)

Instale só se economizar tempo. Requer chave: gere em `21st.dev/mcp` e exporte como `API_KEY_21ST`. Conta gratuita tem limite diário de instalações.

```bash
# Shell de dashboard com paleta escura pronta (Charcoal Ink)
npx shadcn@latest add "https://21st.dev/r/arunjdass/dashboard-sidebar?api_key=$API_KEY_21ST"

# Toggle claro/escuro com glow — bom detalhe de acabamento
npx shadcn@latest add "https://21st.dev/r/daiwiikharihar17147/cinematic-glow-toggle"
```

Catálogo de efeitos de glow: `21st.dev/community/components/s/glow`
Diretório completo para o agente consultar: `21st.dev/llms.txt`

**Não instale, para este projeto:** aurora background, bento grid glassmorphic, dock 3D. São componentes de landing page. Numa ferramenta interna eles denunciam o protótipo.

---

## PROIBIDO NA V2

- ❌ `#000000` puro como fundo
- ❌ Glassmorphism, `backdrop-blur`, card translúcido
- ❌ Roxo e ciano como cores de acento (assinatura de gerador de IA)
- ❌ Gradiente em card, header, botão ou fundo
- ❌ Aurora, mesh gradient, blob, orbe luminoso ao fundo
- ❌ Texto de corpo em cor neon
- ❌ Glow em mais de 15% dos elementos da tela
- ❌ Mais de uma cor de acento de marca
- ❌ Sombra preta difusa (não funciona em dark, só suja)
- ❌ Inverter as cores da v1 mecanicamente — dark bom é redesenhado, não invertido

---

## CRITÉRIO DE ACEITE

1. Tirar todo o neon da tela: ela continua legível, hierárquica e bonita
2. Contraste do texto de corpo contra o fundo ≥ 7:1
3. Nenhuma cor neon usada em texto corrido
4. Uma única cor de acento de marca em toda a interface
5. Um estranho olha e não consegue dizer se foi gerado por IA

---

## PROMPT PRONTO PARA COLAR

```
Refaça o protótipo em modo escuro. A estrutura não muda — mesmo layout, mesma densidade,
mesmas colunas, mesmos dados, mesmo fluxo. O que muda é cor, elevação e sinalização.

REFERÊNCIA: Linear em dark, PostHog e Supabase. Near-black com UMA cor de acento e
neon usado apenas como sinal de dados. NÃO é dark de template de IA.

PROIBIDO: preto puro, glassmorphism, backdrop-blur, roxo, ciano, gradiente, aurora,
mesh, glow em card inteiro, texto de corpo em neon, sombra preta difusa.
Não inverta as cores da versão clara — redesenhe.

SUPERFÍCIES: canvas #0A0A0B · superfície #111113 · hover #17171A · ativo #1E1E22
BORDAS: #232327 e #2E2E33 (a elevação vem da borda, não de sombra)
TEXTO: #EDEDEF · #9B9BA3 · #6B6B73
AÇÃO (uma só): #4D7CFF, hover #6B93FF, fundo selecionado rgba(77,124,255,0.12)

NEON DE PRIORIDADE (única fonte de cor viva):
  crítico #FF5C5C · alto #FFA23A · médio #FFD84D · baixo #3DDC97
  Cada um como: texto na cor + fundo da cor a 10% + borda da cor a 28%

GLOW: box-shadow colorido de baixa opacidade, nunca blur de fundo.
  badge crítico: 0 0 12px rgba(255,92,92,0.25)
  ponto de status: 0 0 6px currentColor
  linha crítica: border-left 2px + inset shadow
  Só em: badge de prioridade, ponto de status, barra de completude, gráfico do painel.

DETALHES: grain a 2% sobre o canvas · foco com anel #4D7CFF de 2px · seleção de texto
em azul translúcido · score RICE em #EDEDEF com ponto colorido ao lado (o ponto é que
brilha, não o número) · sem estimativa em #4A4A52 com alerta âmbar.

MOTION: linhas entram com fade + 4px escalonado em 20ms · pulso de glow só nas linhas
críticas · slider da tela de detalhe anima com spring · respeitar prefers-reduced-motion.

TESTE: se eu remover todo o neon, a tela tem que continuar bonita e legível.
Se não continuar, o neon está fazendo trabalho de estrutura e está errado.

Comece pela tela da fila priorizada. Vou revisar antes da próxima.
```