# BOOTSTRAP DE PROTOTIPAÇÃO — Triagem de Demandas com RICE

> Dois prompts prontos: **A) Figma Make** (fluxo visual completo) e **B) v0** (código React real).
> A Seção 0 é o briefing compartilhado — leia antes, é o que garante coerência entre os dois.

---

# SEÇÃO 0 — ESCOPO: PROTÓTIPO VISUAL, NÃO APLICAÇÃO

**O que deve ser gerado é um PROTÓTIPO VISUAL.** Telas navegáveis com dados fixos, para demonstração e avaliação de interface. Não é software funcional.

### NÃO gerar

- ❌ Backend, API, servidor, rota de dados
- ❌ Banco de dados, schema, ORM, persistência
- ❌ Autenticação, login, sessão, controle de acesso
- ❌ Chamada real a modelo de IA — o refinamento é **encenado** com respostas pré-escritas
- ❌ Cálculo dinâmico a partir de entrada real do usuário
- ❌ Integração externa, webhook, envio de e-mail ou WhatsApp
- ❌ Deploy, variável de ambiente, chave de API

### GERAR

- ✅ Telas completas e polidas, com dados fixos em constante no próprio arquivo
- ✅ Navegação entre telas (clicar numa linha da tabela abre o detalhe)
- ✅ Interações **simuladas**: ordenar tabela, abrir e fechar painel, alternar aba, mover slider
- ✅ Estados visuais prontos: preenchido, vazio, carregando, sem estimativa
- ✅ A entrevista da IA como **roteiro fixo** — perguntas e respostas já escritas, avançando ao clicar
- ✅ Fidelidade visual alta: espaçamento, tipografia e cor exatos como especificados

**Critério:** cada tela precisa parecer real numa apresentação de 3 minutos e aguentar cliques do júri. Nada precisa funcionar por baixo.

**O simulador de sliders da Tela 4 é a única exceção** — ali o recálculo do score e o reordenamento da fila acontecem de verdade, em memória, porque é o momento que demonstra a mecânica. Aritmética simples no front, sem servidor.

---

# SEÇÃO 0.1 — BRIEFING DO PRODUTO

## O que é

Sistema interno de **software house** para triagem e priorização de demandas.
Fluxo em três tempos:

```
1. ENTRADA        cliente/PM abre uma demanda em texto livre
2. REFINAMENTO    IA conduz entrevista guiada até o relatório ficar pontuável
3. CLASSIFICAÇÃO  demanda refinada recebe score RICE e entra na fila priorizada
```

O produto não decide sozinho. Ele **transforma pedido vago em demanda mensurável** e mostra a fila com o critério explícito.

## O framework RICE

```
RICE = (Reach × Impact × Confidence) / Effort
```

| Fator | O que mede aqui | Escala |
|---|---|---|
| **Reach** | Quantos clientes/usuários afetados por trimestre | número absoluto |
| **Impact** | Quanto muda para cada um | 0,25 (mínimo) · 0,5 · 1 (médio) · 2 (alto) · 3 (massivo) |
| **Confidence** | Quanto de evidência sustenta a estimativa | 50% · 80% · 100% |
| **Effort** | Custo de entrega | pessoa-dias |

**Regra de UI que importa:** o score nunca aparece sozinho. Sempre com os 4 fatores que o compõem, clicáveis para ver de onde vieram. Score sem rastro é caixa-preta, e caixa-preta ninguém confia.

## O refinamento por IA (mecânica de entrevista guiada)

Não é chat livre. É uma entrevista com **objetivo de completude**:

1. Pessoa descreve a demanda em texto livre
2. Sistema identifica **lacunas** para pontuar RICE (ex.: "quantos clientes isso afeta?", "o que acontece se não fizermos?")
3. Faz **uma pergunta por vez**, nunca um formulário de 12 campos
4. Mostra uma **barra de completude** subindo conforme as lacunas fecham
5. Ao final, entrega o **relatório refinado** lado a lado com o original

O momento mais forte da demo é essa comparação: parágrafo confuso à esquerda, demanda estruturada e pontuável à direita.

---

# SEÇÃO 1 — SISTEMA VISUAL (obrigatório nos dois prompts)

## Direção

**Linear + Notion + Vercel.** Denso, calmo, tipografia forte, cor com significado.
Claro e colorido — mas a cor **carrega informação de prioridade**, não decora.

## Tokens

```
CANVAS
  fundo          #FBFBFA   (off-white quente, não branco puro)
  superfície     #FFFFFF
  superfície-2   #F5F5F3
  borda          #E8E8E4
  borda-forte    #D4D4CE

TEXTO
  primário       #1A1A19
  secundário     #6B6B65
  terciário      #9B9B94

MARCA
  ação           #2743E3   (azul elétrico, usado com parcimônia)
  ação-hover     #1D35C4
  ação-suave     #EEF1FE   (fundo de estado selecionado)

PRIORIDADE (a paleta colorida que dá o recado)
  crítico        #D6453D   fundo #FDECEB
  alto           #E07B39   fundo #FDF2E9
  médio          #A97C00   fundo #FAF4E3
  baixo          #3F8F5F   fundo #ECF6F0
  arquivado      #9B9B94   fundo #F5F5F3
```

## Tipografia

- UI: **Geist** (ou Inter Tight). **Não use Inter puro** — é a fonte padrão de todo protótipo de IA.
- Números, scores, IDs: **Geist Mono**, com `font-variant-numeric: tabular-nums`
- Escala: 11 / 12 / 13 / 14 / 16 / 20 / 28
- Corpo de interface em **13px**, não 16px. Densidade é o que faz parecer ferramenta profissional.

## Forma

- Raio: **6px** em cards e inputs, 4px em badges. Nunca 16px+.
- Sombra: quase nenhuma. Hierarquia por **borda de 1px** e fundo.
- Ícones: **Lucide**, stroke 1.5px, tamanho 16px. Nunca emoji como ícone.
- Espaçamento: múltiplos de 4.

## ANTI-CARA-DE-IA (checklist inegociável)

Não faça, em nenhuma tela:

- ❌ Gradiente roxo→azul em hero, header ou card
- ❌ Glassmorphism, blur de fundo, card translúcido
- ❌ Emoji como ícone (🚀 ✨ 🎯) em qualquer lugar
- ❌ Border-radius grande (16px, 24px) — parece landing page de template
- ❌ Hero centralizado com frase grande e dois botões
- ❌ Grade de cards para listar coisas que são naturalmente uma **tabela**
- ❌ Sombra grande e difusa (`shadow-2xl`)
- ❌ Dados falsos genéricos: "Acme Inc", "John Doe", "Lorem ipsum", "Project Alpha"
- ❌ Cor sem significado — fundo colorido só porque fica bonito
- ❌ Ilustração 3D, blob, gradiente de malha
- ❌ Modo escuro como padrão (o pedido é paleta clara)

Faça:

- ✅ Tabela densa com linhas de 40–44px para a fila de demandas
- ✅ Estados vazios com instrução real, não desenho fofo
- ✅ Números alinhados à direita, tabulares
- ✅ Atalhos de teclado visíveis (`⌘K`, `J/K` para navegar) — assinatura de ferramenta séria
- ✅ Texto de interface **todo em português do Brasil**, natural, sem tradução literal
- ✅ Timestamps relativos ("há 2h"), não datas completas em lista

---

# SEÇÃO 2 — TELAS

## Tela 1 — Fila priorizada (tela inicial)

Tabela densa. Colunas:

| # | Demanda | Cliente | Reach | Impact | Conf. | Effort | **RICE** | Prioridade | Responsável |
|---|---|---|---|---|---|---|---|---|---|

- Ordenada por RICE decrescente por padrão
- Coluna RICE em mono, negrito, alinhada à direita
- Prioridade como badge colorido pequeno (não pílula gorda)
- Filtros no topo em barra fina: cliente, responsável, faixa de prioridade, status
- Contador discreto: "38 demandas · 6 críticas · 12 sem estimativa"
- Linha com estado "sem estimativa" fica com o RICE em cinza e um ícone de alerta — é a chamada para refinar

## Tela 2 — Nova demanda (entrada + refinamento por IA)

Layout de duas colunas, 50/50:

**Esquerda — a conversa**
- Textarea grande no topo para o texto livre inicial
- Abaixo, o histórico da entrevista: pergunta da IA, resposta da pessoa
- **Uma pergunta por vez**, com 2–4 opções sugeridas clicáveis + campo livre
- Perguntas devem parecer de gente: "Quantos clientes hoje esbarram nisso?" e não "Informe o Reach estimado"

**Direita — o relatório se montando ao vivo**
- Barra de completude no topo: `Completude 68%` com segmentos por fator RICE
- Cada fator com estado: ✓ definido / ⚠ estimado / ○ faltando
- O texto do relatório refinado vai crescendo conforme as respostas entram
- Botão inferior desabilitado até completude ≥ 80%: "Classificar demanda"

## Tela 3 — Antes e depois (o momento de demo)

Comparação lado a lado:
- **Esquerda:** o texto original, cru, como veio. Fundo `#F5F5F3`, tipografia menor, cinza.
- **Direita:** o relatório refinado, estruturado em seções (Problema · Quem é afetado · Evidência · Escopo · Critérios de aceite).
- Trechos que a IA extraiu do original aparecem **destacados nos dois lados** ao passar o mouse — mostra que não inventou, derivou.
- No rodapé: os 4 fatores RICE com o valor e uma frase de justificativa cada.

## Tela 4 — Detalhe da demanda

- Cabeçalho: ID mono, título, cliente, badge de prioridade, responsável
- Score RICE grande, com a fórmula visível: `(1.200 × 2 × 0,8) ÷ 13 = 147,7`
- Cada fator expansível: valor, justificativa, quem definiu, quando
- **Simulador:** sliders para os 4 fatores mostrando o score e a **nova posição na fila** em tempo real. Isso vende sozinho.
- Timeline lateral: aberta → refinada → classificada → em fila → em execução

## Tela 5 — Painel

Sem cards decorativos. Três blocos úteis:
- **Distribuição por prioridade** — barra horizontal empilhada com as 4 cores
- **Fila x capacidade** — quantos pessoa-dias na fila contra a capacidade do time; mostra até onde o time chega neste mês
- **Demandas represadas** — as que estão há mais tempo sem classificação

---

# SEÇÃO 3 — DADOS DE EXEMPLO

Use estes. Protótipo com dado realista parece produto; com "Acme Inc" parece exercício.

| Cliente | Demanda | R | I | C | E |
|---|---|---|---|---|---|
| Farmácia São Bento | Integração da emissão de NF-e com o novo layout da SEFAZ | 1.200 | 3 | 100% | 13 |
| Clínica Vida Plena | Agenda duplicando consultas quando dois recepcionistas salvam junto | 340 | 3 | 100% | 5 |
| Distribuidora Zanatta | Relatório de comissão por vendedor exportando em Excel | 45 | 1 | 80% | 8 |
| Supermercado União | Leitor de código de barras trava no PDV depois de 6h ligado | 2.100 | 2 | 80% | 21 |
| Transportes Kunz | Rastreio de carga com atualização a cada 15 min | 180 | 2 | 50% | 34 |
| Clínica Vida Plena | Lembrete de consulta por WhatsApp | 890 | 1 | 80% | 8 |
| Auto Peças Girardi | Migração do catálogo antigo para busca por código OEM | 120 | 2 | 50% | 21 |

Responsáveis: Juliano, Marcela, Téo, Rafa, Bruna.

---

# SEÇÃO 4 — PROMPT A: FIGMA MAKE

> Cole isto no Figma Make. Ele é bom em fluxo e alta fidelidade visual.

```
Crie um PROTÓTIPO VISUAL de um app web interno chamado "Triagem", usado por uma
software house brasileira para priorizar demandas de clientes com o framework RICE.

ESCOPO: protótipo de interface para demonstração. Telas navegáveis com dados fixos.
Sem backend, sem banco, sem login, sem chamada real de IA. O refinamento por IA é
ENCENADO — perguntas e respostas já escritas, avançando ao clicar. Interações são
simuladas: ordenar tabela, navegar entre telas, abrir painel, mover slider.
Prioridade absoluta é fidelidade visual, não funcionamento.

ESTÉTICA: linguagem visual de Linear, Notion e Vercel. Denso, calmo, profissional.
Paleta clara e quente. Cor usada APENAS para comunicar prioridade, nunca decoração.

PROIBIDO: gradiente roxo, glassmorphism, emoji como ícone, border-radius acima de 8px,
hero centralizado, sombra grande, dados genéricos tipo "Acme Inc", modo escuro.
Se parecer um template de landing page, está errado.

TOKENS
fundo #FBFBFA · superfície #FFFFFF · borda #E8E8E4
texto #1A1A19 / secundário #6B6B65
ação #2743E3 (usar com parcimônia)
prioridade: crítico #D6453D · alto #E07B39 · médio #A97C00 · baixo #3F8F5F
Fonte Geist, corpo 13px, números em Geist Mono tabular. Raio 6px. Ícones Lucide 16px stroke 1.5.
Todo o texto em português do Brasil.

TELAS (nesta ordem)
1. Fila priorizada — tabela densa, linhas de 42px, colunas:
   Demanda · Cliente · Reach · Impact · Confidence · Effort · RICE · Prioridade · Responsável.
   Ordenada por RICE. Barra de filtros fina no topo. Contador "38 demandas · 6 críticas".
2. Nova demanda — duas colunas. Esquerda: entrevista da IA, UMA pergunta por vez,
   com opções sugeridas clicáveis. Direita: relatório se montando, barra de completude
   segmentada por fator RICE, botão "Classificar" desabilitado até 80%.
3. Antes e depois — texto original cru à esquerda em cinza, relatório estruturado à direita
   (Problema · Quem é afetado · Evidência · Escopo · Critérios de aceite). Rodapé com os 4 fatores.
4. Detalhe — score com fórmula visível "(1.200 × 2 × 0,8) ÷ 13 = 147,7", fatores expansíveis
   com justificativa, e um simulador com sliders que mostra a nova posição na fila em tempo real.
5. Painel — distribuição por prioridade (barra empilhada), fila x capacidade do time,
   demandas represadas. Sem cards decorativos.

DADOS: use demandas reais de software house brasileira — farmácia com NF-e da SEFAZ,
clínica com agenda duplicando consulta, supermercado com PDV travando, distribuidora
com relatório de comissão. Nomes de responsáveis: Juliano, Marcela, Téo, Rafa, Bruna.

Comece pela tela 1. Vou revisar antes de você seguir para a próxima.
```

---

# SEÇÃO 5 — PROMPT B: v0

> Cole no v0. Ele entrega React + Tailwind + shadcn/ui — código que você aproveita.

```
Construa um PROTÓTIPO VISUAL da tela de fila priorizada de um sistema interno de
triagem de demandas para software house, usando Next.js, Tailwind e shadcn/ui.

ESCOPO: só a camada de interface. Componente único de página, dados fixos em uma
constante tipada no próprio arquivo. Sem fetch, sem API route, sem banco, sem auth,
sem server action, sem variável de ambiente. Ordenação e filtro funcionam apenas
em memória, sobre o array fixo. É protótipo para demonstração, não aplicação.

CONTEXTO: demandas de clientes entram, são refinadas por IA e classificadas por RICE
(Reach × Impact × Confidence ÷ Effort). Esta tela é a fila resultante.

REFERÊNCIA VISUAL: Linear e Vercel Dashboard. Denso, tipografia pequena, cor com significado.
NÃO faça: gradiente, glassmorphism, emoji, radius grande, sombra pesada, card grid.
Se parecer template de landing page, refaça.

DESIGN TOKENS (defina no tailwind.config e use via CSS variables, sem hex solto no JSX)
  canvas #FBFBFA · surface #FFFFFF · border #E8E8E4
  fg #1A1A19 · fg-muted #6B6B65
  action #2743E3
  critico #D6453D/#FDECEB · alto #E07B39/#FDF2E9 · medio #A97C00/#FAF4E3 · baixo #3F8F5F/#ECF6F0

COMPONENTES
- <DemandTable> — tabela com linhas de 42px, hover sutil, ordenável por qualquer coluna,
  RICE em font-mono tabular-nums alinhado à direita
- <PriorityBadge> — badge pequeno, 4px de raio, texto 11px uppercase tracking-wide
- <RiceScore> — score + tooltip mostrando a fórmula com os valores substituídos
- <FilterBar> — barra fina: cliente, responsável, prioridade, status. Sem card ao redor.
- Estado vazio com instrução real, não ilustração

DETALHES QUE IMPORTAM
- Linhas sem estimativa: RICE em cinza + ícone de alerta, com ação "Refinar demanda"
- Timestamps relativos ("há 2h")
- Atalho ⌘K visível no canto
- Números sempre tabulares e alinhados à direita
- Todo texto em português do Brasil

DADOS (use exatamente estes, tipados em TypeScript):
Farmácia São Bento · NF-e novo layout SEFAZ · R1200 I3 C100% E13
Clínica Vida Plena · agenda duplicando consultas · R340 I3 C100% E5
Supermercado União · PDV trava após 6h · R2100 I2 C80% E21
Distribuidora Zanatta · relatório de comissão em Excel · R45 I1 C80% E8
Transportes Kunz · rastreio a cada 15min · R180 I2 C50% E34
Auto Peças Girardi · busca por código OEM · R120 I2 C50% E21
Responsáveis: Juliano, Marcela, Téo, Rafa, Bruna

Entregue só esta tela, completa e polida. Depois eu peço a próxima.
```

---

# SEÇÃO 6 — COMO USAR NOS 3 DIAS

**Ordem que funciona:**
1. Figma Make primeiro, tela 1 apenas. Julgue a direção visual antes de gerar o resto.
2. Aprovada a direção, gere as telas 2 e 3 — são as que vendem a ideia na apresentação.
3. v0 só depois, para as telas que virarão código de verdade.

**Não gere as 5 telas de uma vez.** Você perde o controle da coerência visual e gasta o dobro corrigindo.

**A tela que ganha a demo é a 3 (antes e depois).** É onde a IA mostra valor concreto: pedido vago virou demanda pontuável. Invista tempo nela.

**A tela 4 tem o truque:** o simulador com sliders mudando a posição na fila ao vivo. Júri adora ver causa e efeito.

## Teste de qualidade antes de apresentar

Mostre uma tela para alguém e pergunte: *"isso parece um produto que uma empresa paga ou parece gerado por IA?"*
Se hesitar, o problema quase sempre é um destes três: radius grande demais, cor sem significado, ou densidade baixa demais.

---

## PENDENTE — confirmar

**"Mecânica GSD"**: escrevi assumindo entrevista guiada estruturada (IA faz perguntas de lacuna,
uma por vez, até o relatório ficar pontuável). Se GSD significa outra coisa no seu contexto,
a Seção 0 e a Tela 2 precisam de ajuste.