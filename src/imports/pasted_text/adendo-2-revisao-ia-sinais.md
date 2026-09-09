# ADENDO 2 — REVISÃO DA IA + SINAIS VISUAIS

> Complementa v1 (estrutura), v2 (dark + neon) e o adendo do quadro.
> Escopo continua sendo **protótipo visual**: dados fixos, correções encenadas.

---

# PARTE 1 — TELA DE REVISÃO (a principal desta entrega)

## Por que ela existe

A IA erra. O que decide se o produto sobrevive não é o acerto dela — é **quão barato é corrigir e quanto ela aprende com a correção**. Esta tela é onde o suporte audita, corrige e, sem perceber, configura o sistema.

**Princípio:** correção isolada não ensina nada. **Padrão** de correção ensina. O sistema observa as correções e propõe a regra.

## O que entra na fila de revisão

Nem toda demanda precisa de revisão. Entram automaticamente:

| Motivo | Etiqueta |
|---|---|
| Confiança da IA abaixo de 70% | `baixa confiança` |
| Fator inferido, não informado pela pessoa | `estimado` |
| Regra da empresa mudou o resultado | `ajustado por regra` |
| Score próximo do corte entre duas faixas | `no limite` |
| Pessoa que abriu discordou da classificação | `contestado` |

Contador no topo: `12 aguardando revisão · 4 de baixa confiança`

## Layout — duas colunas, 60/40

### Esquerda: o que a IA fez

Cada bloco é auditável e corrigível **no lugar**, sem abrir modal.

**Bloco 1 — Relatório refinado**
- O texto estruturado que a IA produziu
- Trechos derivados do original ficam sublinhados; passar o mouse mostra a frase de origem
- Trechos **inferidos** (que a IA deduziu, não leu) aparecem com sublinhado tracejado âmbar — é aqui que a maioria dos erros mora
- Clicar em qualquer trecho abre edição inline

**Bloco 2 — Os quatro fatores**
```
Reach        340      ▓▓▓▓░░░░  confiança 90%    [corrigir]
             "cita 340 pacientes ativos no relatório"

Impact       2        ▓▓░░░░░░  confiança 55%    [corrigir]  ⚠ inferido
             "não informado — estimado por similaridade com demandas de agenda"

Confidence   100%     ▓▓▓▓▓▓▓▓  confiança 95%    [corrigir]
Effort       5 dias   ▓▓▓░░░░░  confiança 60%    [corrigir]  ⚠ inferido
```
- Cada fator mostra: valor, barra de confiança, **justificativa em uma linha**, e se foi lido ou inferido
- `[corrigir]` troca o valor por um campo, com o valor antigo riscado ao lado

**Bloco 3 — Como chegou na coluna**
```
Score RICE base                            102,4
Regra 3 "afeta faturamento"                 +40
Diretriz: conformidade fiscal          Impact 2→3
──────────────────────────────────────────────────
Final                                      142,4  →  CRÍTICO
```
Cada linha tem um `[discordar]` que abre o campo de motivo.

### Direita: a correção do suporte

**Painel fixo, sempre visível.** Enquanto o suporte corrige à esquerda, este painel acumula.

```
CORREÇÕES NESTA DEMANDA          3

  Impact          2 → 3
  motivo: bug que impede faturamento

  Effort          5 → 8 dias
  motivo: exige migração de dados

  Prioridade      Alto → Crítico
  motivo: cliente em contrato SLA

  ┌────────────────────────────────┐
  │ Sugestão para o sistema        │  ← campo livre, opcional
  │                                │
  │ "Quando a demanda cita 'não    │
  │  consigo faturar', trate como  │
  │  Impact 3 automaticamente"     │
  └────────────────────────────────┘

  [ Aprovar com correções ]  [ Aprovar como está ]
```

**O motivo é obrigatório em toda correção.** Sem ele, o sistema não aprende — vira só um valor trocado. Mas mantenha barato: 3 motivos mais comuns como chips clicáveis, campo livre ao lado.

## O ciclo que fecha (o diferencial)

Depois de N correções semelhantes, aparece uma faixa no topo:

```
┌──────────────────────────────────────────────────────────────┐
│  Padrão detectado                                            │
│  Você corrigiu Impact de 2→3 em 3 demandas de conformidade   │
│  fiscal nos últimos 4 dias.                                  │
│                                                              │
│  Criar diretriz: "Demanda de conformidade fiscal tem         │
│  Impact mínimo 3"?                                           │
│                                                              │
│  [ Criar diretriz ]   [ Agora não ]   [ Nunca sugerir isso ] │
└──────────────────────────────────────────────────────────────┘
```

Ao aceitar, a diretriz **aparece na Tela 6 já preenchida**, marcada como `sugerida por padrão de correção`. O suporte configurou o sistema sem nunca abrir a tela de configuração.

## Painel de saúde da IA (topo da tela, faixa fina)

```
Taxa de aprovação sem correção     68%
Fator mais corrigido               Effort  (41% das revisões)
Fator mais confiável               Reach   (94% aprovados)
Diretrizes criadas por correção    7
```

**Mostrar que a IA erra é o que faz o time confiar nela.** Um painel que diz "Effort é corrigido em 41% dos casos" é mais crível que qualquer promessa de acurácia — e diz ao time exatamente onde não confiar.

## Velocidade de operação

Suporte revisa em lote. A tela tem que ser rápida:

- `J` / `K` — próxima e anterior
- `A` — aprovar como está
- `C` — entrar em modo correção
- `Enter` — aprovar com correções e ir para a próxima
- Contador de progresso: `4 de 12`
- Sem confirmação modal em nada; ação errada se desfaz com `⌘Z` e um toast

---

# PARTE 2 — MICRO-BARRA DE COMPOSIÇÃO RICE

Substitui a leitura de quatro números por uma forma reconhecível de relance.

```
Clínica Vida Plena          ▓▓▓▓▁▓▓▓▓▓▓▓▁▁▁         147,7
                            R    I     C    E
```

**Detalhe honesto de implementação:** RICE é `(R × I × C) / E`, então os fatores **não somam**. Não desenhe segmentos proporcionais ao score — seria matematicamente falso.

O correto: cada segmento mostra a **força relativa daquele fator contra a fila inteira** (percentil). Uma demanda que é alcance puro tem o primeiro segmento cheio e os outros curtos. Effort desenha para baixo, ou em cor invertida, porque é o único fator em que "mais" significa "pior".

- 4 segmentos, 3px de altura, 4px de largura cada, 1px de espaço
- R / I / C na cor da prioridade da demanda, com 40% de opacidade no vazio
- E em cinza, desenhado invertido
- Tooltip no hover com os valores reais

---

# PARTE 3 — DELTA DE POSIÇÃO

```
↑7   Clínica Vida Plena
↓3   Distribuidora Zanatta
—    Supermercado União
```

- Seta + número, 11px, mono
- Subiu em verde de prioridade baixa `#3DDC97`, desceu em terciário cinza — **subir chama atenção, descer não**
- Hover mostra o motivo: `subiu 7 — Effort corrigido de 13 para 5 dias por Marcela`
- `—` para quem não mexeu, em cinza terciário. Não esconda: a estabilidade também é informação.
- Reset a cada ciclo definido na Tela 6 (padrão: diário)

Isso conecta com a tela de revisão: **toda correção do suporte gera um delta visível na fila.** O suporte vê o efeito do próprio trabalho na tela principal. É a recompensa que faz a revisão não parecer burocracia.

---

# PROMPT PARA COLAR

```
Adicione ao protótipo uma TELA DE REVISÃO e dois sinais visuais na fila.
Mantenha escopo de protótipo visual: dados fixos, correções encenadas, sem backend.
Mantenha a estética já definida (dark near-black, uma cor de ação, neon só como sinal)
e a densidade alta. Não afrouxe espaçamento.

TELA DE REVISÃO — duas colunas 60/40.

ESQUERDA, o que a IA fez, tudo corrigível inline sem modal:
1. Relatório refinado. Trechos derivados do texto original com sublinhado sólido;
   trechos INFERIDOS pela IA com sublinhado tracejado âmbar. Hover mostra a origem.
2. Os quatro fatores RICE, cada um com: valor, barra de confiança, justificativa em
   uma linha, marcador "inferido" quando aplicável, e botão [corrigir] que troca o
   valor por um campo mostrando o valor antigo riscado.
3. Bloco "Como chegou na coluna" em formato de extrato: score base, cada regra aplicada
   com seu ajuste, diretriz aplicada, score final e coluna. Cada linha com [discordar].

DIREITA, painel fixo de correções que acumula enquanto o suporte trabalha:
lista das correções feitas (valor antigo → novo + motivo), um campo livre de
"Sugestão para o sistema", e dois botões: "Aprovar com correções" e "Aprovar como está".
Motivo é obrigatório em toda correção, mas oferecido como 3 chips clicáveis + campo livre.

FAIXA DE PADRÃO DETECTADO no topo, quando houver correções repetidas:
"Você corrigiu Impact de 2→3 em 3 demandas de conformidade fiscal nos últimos 4 dias.
Criar diretriz: 'Demanda de conformidade fiscal tem Impact mínimo 3'?"
com botões [Criar diretriz] [Agora não] [Nunca sugerir isso].

FAIXA DE SAÚDE DA IA no topo, fina, 4 métricas em mono:
taxa de aprovação sem correção 68% · fator mais corrigido: Effort (41%) ·
fator mais confiável: Reach (94%) · diretrizes criadas por correção: 7

VELOCIDADE: atalhos J/K navegar, A aprovar, C corrigir, Enter aprovar e avançar.
Contador "4 de 12". Sem modal de confirmação; desfazer com ⌘Z e toast.

FILA DE REVISÃO: 12 itens com etiquetas de motivo — baixa confiança, estimado,
ajustado por regra, no limite, contestado.

DOIS SINAIS NA FILA PRINCIPAL:

A) Micro-barra de composição RICE em cada card: 4 segmentos de 3px de altura,
   R/I/C na cor da prioridade e E em cinza desenhado invertido (porque mais esforço
   é pior). Os segmentos mostram a força RELATIVA de cada fator contra a fila inteira
   (percentil), NÃO proporção do score — RICE é multiplicativo, segmento proporcional
   seria matematicamente falso. Tooltip com os valores reais.

B) Delta de posição à esquerda de cada card: "↑7", "↓3" ou "—" em mono 11px.
   Subida em verde, descida e estabilidade em cinza terciário — subir chama atenção,
   descer não. Hover mostra o motivo: "subiu 7 — Effort corrigido de 13 para 5 dias
   por Marcela".

Comece pela tela de revisão. Vou revisar antes dos sinais visuais.
```