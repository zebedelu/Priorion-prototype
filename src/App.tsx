import { useState, useMemo, useEffect, useRef } from 'react'
import {
  AlertTriangle,
  ArrowDown,
  ArrowLeftRight,
  ArrowUp,
  ArrowUpDown,
  BarChart2,
  Check,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Clock,
  Edit2,
  FileText,
  LayoutDashboard,
  List,
  Plus,
  SlidersHorizontal,
  Sparkles,
  X,
  Zap,
} from 'lucide-react'

// ─── Palette constants ────────────────────────────────────────────────────────

const BG = {
  canvas:      '#0A0A0B',
  surface:     '#111113',
  surface2:    '#17171A',
  surface3:    '#1E1E22',
  border:      '#232327',
  borderStrong:'#2E2E33',
  text:        '#EDEDEF',
  textSec:     '#9B9BA3',
  textTer:     '#6B6B73',
  textDis:     '#4A4A52',
  action:      '#4D7CFF',
  actionHover: '#6B93FF',
  actionSoft:  'rgba(77,124,255,0.12)',
  actionBorder:'rgba(77,124,255,0.35)',
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Priority = 'crítico' | 'alto' | 'médio' | 'baixo'
type Status   = 'em-fila' | 'em-execução' | 'refinando' | 'sem-estimativa'
type Screen   = 'queue' | 'new' | 'comparison' | 'detail' | 'dashboard' | 'review'
type SortKey  = 'rice' | 'reach' | 'impact' | 'confidence' | 'effort' | 'client'
type SortDir  = 'asc' | 'desc'

interface Demand {
  id: string
  title: string
  client: string
  reach: number
  impact: number
  confidence: number
  effort: number
  rice: number
  priority: Priority
  status: Status
  owner: string
  createdAt: string
  refinedAt?: string
}

// ─── Data ─────────────────────────────────────────────────────────────────────

function calcRice(r: number, i: number, c: number, e: number) {
  return Math.round((r * i * c / e) * 10) / 10
}

const DEMANDS: Demand[] = [
  {
    id: 'DEM-001',
    title: 'Integração da emissão de NF-e com o novo layout da SEFAZ',
    client: 'Farmácia São Bento',
    reach: 1200, impact: 3, confidence: 1.0, effort: 13,
    rice: calcRice(1200, 3, 1.0, 13),
    priority: 'crítico', status: 'em-fila',
    owner: 'Juliano', createdAt: 'há 2h', refinedAt: 'há 1h',
  },
  {
    id: 'DEM-002',
    title: 'Agenda duplicando consultas quando dois recepcionistas salvam junto',
    client: 'Clínica Vida Plena',
    reach: 340, impact: 3, confidence: 1.0, effort: 5,
    rice: calcRice(340, 3, 1.0, 5),
    priority: 'crítico', status: 'em-execução',
    owner: 'Marcela', createdAt: 'há 5h', refinedAt: 'há 3h',
  },
  {
    id: 'DEM-003',
    title: 'Leitor de código de barras trava no PDV depois de 6h ligado',
    client: 'Supermercado União',
    reach: 2100, impact: 2, confidence: 0.8, effort: 21,
    rice: calcRice(2100, 2, 0.8, 21),
    priority: 'alto', status: 'em-fila',
    owner: 'Téo', createdAt: 'há 1d', refinedAt: 'há 18h',
  },
  {
    id: 'DEM-004',
    title: 'Lembrete de consulta por WhatsApp',
    client: 'Clínica Vida Plena',
    reach: 890, impact: 1, confidence: 0.8, effort: 8,
    rice: calcRice(890, 1, 0.8, 8),
    priority: 'médio', status: 'em-fila',
    owner: 'Rafa', createdAt: 'há 2d', refinedAt: 'há 1d',
  },
  {
    id: 'DEM-005',
    title: 'Relatório de comissão por vendedor exportando em Excel',
    client: 'Distribuidora Zanatta',
    reach: 45, impact: 1, confidence: 0.8, effort: 8,
    rice: calcRice(45, 1, 0.8, 8),
    priority: 'baixo', status: 'sem-estimativa',
    owner: 'Bruna', createdAt: 'há 3d',
  },
  {
    id: 'DEM-006',
    title: 'Rastreio de carga com atualização a cada 15 min',
    client: 'Transportes Kunz',
    reach: 180, impact: 2, confidence: 0.5, effort: 34,
    rice: calcRice(180, 2, 0.5, 34),
    priority: 'baixo', status: 'em-fila',
    owner: 'Téo', createdAt: 'há 4d',
  },
  {
    id: 'DEM-007',
    title: 'Migração do catálogo antigo para busca por código OEM',
    client: 'Auto Peças Girardi',
    reach: 120, impact: 2, confidence: 0.5, effort: 21,
    rice: calcRice(120, 2, 0.5, 21),
    priority: 'baixo', status: 'sem-estimativa',
    owner: 'Bruna', createdAt: 'há 5d',
  },
]

// Deltas de posição (simulados — resultado de correções do suporte)
const DEMAND_DELTAS: Record<string, { delta: number; reason: string }> = {
  'DEM-001': { delta: 3,  reason: 'subiu 3 — Reach confirmado de 800 para 1.200 por Juliano' },
  'DEM-002': { delta: 7,  reason: 'subiu 7 — Effort corrigido de 13 para 5 dias por Marcela' },
  'DEM-003': { delta: -2, reason: 'desceu 2 — Impact revisado de 3 para 2 por Téo' },
  'DEM-004': { delta: 0,  reason: 'sem alteração neste ciclo' },
  'DEM-005': { delta: -1, reason: 'desceu 1 — Reach corrigido de 60 para 45 por Bruna' },
  'DEM-006': { delta: 0,  reason: 'sem alteração neste ciclo' },
  'DEM-007': { delta: 1,  reason: 'subiu 1 — Confidence atualizada de 30% para 50% por Bruna' },
}

// ─── Priority styles (dark) ───────────────────────────────────────────────────

const PRIORITY: Record<Priority, {
  text: string; bg: string; border: string; glow: string; label: string; leftBorder: string
}> = {
  'crítico': {
    text: '#FF5C5C', bg: 'rgba(255,92,92,0.10)', border: 'rgba(255,92,92,0.28)',
    glow: '0 0 12px rgba(255,92,92,0.25)', label: 'CRÍTICO', leftBorder: '#FF5C5C',
  },
  'alto': {
    text: '#FFA23A', bg: 'rgba(255,162,58,0.10)', border: 'rgba(255,162,58,0.28)',
    glow: '0 0 8px rgba(255,162,58,0.20)', label: 'ALTO', leftBorder: '#FFA23A',
  },
  'médio': {
    text: '#FFD84D', bg: 'rgba(255,216,77,0.09)', border: 'rgba(255,216,77,0.25)',
    glow: '', label: 'MÉDIO', leftBorder: '#FFD84D',
  },
  'baixo': {
    text: '#3DDC97', bg: 'rgba(61,220,151,0.10)', border: 'rgba(61,220,151,0.28)',
    glow: '', label: 'BAIXO', leftBorder: '#3DDC97',
  },
}

const STATUS_LABELS: Record<Status, string> = {
  'em-fila': 'Em fila',
  'em-execução': 'Em execução',
  'refinando': 'Refinando',
  'sem-estimativa': 'Sem estimativa',
}

// ─── PriorityBadge ────────────────────────────────────────────────────────────

function PriorityBadge({ priority, size = 'md' }: { priority: Priority; size?: 'sm' | 'md' }) {
  const p = PRIORITY[priority]
  const animate = priority === 'crítico' || priority === 'alto'
  return (
    <span
      style={{
        color: p.text,
        backgroundColor: p.bg,
        border: `1px solid ${p.border}`,
        borderRadius: '4px',
        boxShadow: p.glow || undefined,
        animation: animate
          ? priority === 'crítico'
            ? 'glowPulse 2.2s ease-in-out infinite'
            : 'glowPulseHigh 2.5s ease-in-out infinite'
          : undefined,
        letterSpacing: '0.04em',
        lineHeight: '1',
        height: '20px',
        padding: size === 'sm' ? '0 5px' : '0 6px',
        fontSize: '11px',
        fontWeight: '600',
      }}
      className="inline-flex items-center uppercase"
    >
      {p.label}
    </span>
  )
}

// ─── RiceBar (percentile micro-bar) ──────────────────────────────────────────

function RiceBar({ demand }: { demand: Demand }) {
  const allDemands = DEMANDS

  function percentile(values: number[], val: number, invert = false) {
    const sorted = [...values].sort((a, b) => a - b)
    const rank = sorted.findIndex(v => v >= val) + 1
    const p = rank / sorted.length
    return invert ? 1 - p + 1 / sorted.length : p
  }

  const rP = percentile(allDemands.map(d => d.reach), demand.reach)
  const iP = percentile(allDemands.map(d => d.impact), demand.impact)
  const cP = percentile(allDemands.map(d => d.confidence), demand.confidence)
  const eP = percentile(allDemands.map(d => d.effort), demand.effort, true)

  const maxH = 14
  const p = PRIORITY[demand.priority]

  const segments = [
    { label: 'R', pct: rP, color: p.text, invert: false },
    { label: 'I', pct: iP, color: p.text, invert: false },
    { label: 'C', pct: cP, color: p.text, invert: false },
    { label: 'E', pct: eP, color: BG.textTer, invert: true },
  ]

  const tooltip = `R ${demand.reach.toLocaleString('pt-BR')} · I ${demand.impact}× · C ${Math.round(demand.confidence * 100)}% · E ${demand.effort}d`

  return (
    <div className="flex items-end gap-px" title={tooltip} style={{ height: `${maxH}px` }}>
      {segments.map(s => {
        const h = Math.max(2, Math.round(s.pct * maxH))
        return (
          <div
            key={s.label}
            style={{
              width: '4px',
              height: `${maxH}px`,
              display: 'flex',
              flexDirection: s.invert ? 'column' : 'column-reverse',
              alignItems: 'stretch',
            }}
          >
            <div style={{ height: `${h}px`, backgroundColor: s.color, borderRadius: '1px', opacity: 0.9 }} />
            <div style={{ flex: 1, backgroundColor: s.color, borderRadius: '1px', opacity: 0.12 }} />
          </div>
        )
      })}
    </div>
  )
}

// ─── DeltaPosition ────────────────────────────────────────────────────────────

function DeltaPosition({ demandId }: { demandId: string }) {
  const d = DEMAND_DELTAS[demandId]
  if (!d) return null

  const [hover, setHover] = useState(false)

  return (
    <div
      className="relative"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <span
        className="font-mono text-[11px] tabular-nums"
        style={{
          color: d.delta > 0 ? '#3DDC97' : BG.textTer,
          minWidth: '28px',
          display: 'inline-block',
          textAlign: 'right',
        }}
      >
        {d.delta > 0 ? `↑${d.delta}` : d.delta < 0 ? `↓${Math.abs(d.delta)}` : '—'}
      </span>
      {hover && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap text-[11px] px-2 py-1 rounded-[4px] z-50 pointer-events-none"
          style={{ backgroundColor: BG.surface3, border: `1px solid ${BG.borderStrong}`, color: BG.textSec }}
        >
          {d.reason}
        </div>
      )}
    </div>
  )
}

// ─── Screen 1 — Fila priorizada ───────────────────────────────────────────────

function QueueScreen({
  onSelectDemand,
  onNewDemand,
}: {
  onSelectDemand: (d: Demand) => void
  onNewDemand: () => void
}) {
  const [sortKey, setSortKey] = useState<SortKey>('rice')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [filterClient, setFilterClient] = useState('')
  const [filterOwner, setFilterOwner] = useState('')
  const [filterPriority, setFilterPriority] = useState<Priority | ''>('')

  const sorted = useMemo(() => {
    let list = [...DEMANDS]
    if (filterClient) list = list.filter(d => d.client === filterClient)
    if (filterOwner) list = list.filter(d => d.owner === filterOwner)
    if (filterPriority) list = list.filter(d => d.priority === filterPriority)
    list.sort((a, b) => {
      let cmp = 0
      if (sortKey === 'rice') cmp = a.rice - b.rice
      else if (sortKey === 'reach') cmp = a.reach - b.reach
      else if (sortKey === 'impact') cmp = a.impact - b.impact
      else if (sortKey === 'confidence') cmp = a.confidence - b.confidence
      else if (sortKey === 'effort') cmp = a.effort - b.effort
      else if (sortKey === 'client') cmp = a.client.localeCompare(b.client)
      return sortDir === 'desc' ? -cmp : cmp
    })
    return list
  }, [sortKey, sortDir, filterClient, filterOwner, filterPriority])

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const criticalCount = DEMANDS.filter(d => d.priority === 'crítico').length
  const noEstimateCount = DEMANDS.filter(d => d.status === 'sem-estimativa').length
  const clients = [...new Set(DEMANDS.map(d => d.client))].sort()
  const owners  = [...new Set(DEMANDS.map(d => d.owner))].sort()
  const hasFilters = !!(filterClient || filterOwner || filterPriority)

  const selectStyle = {
    height: '28px', padding: '0 24px 0 8px', fontSize: '12px',
    color: BG.textSec, border: `1px solid ${BG.border}`, borderRadius: '4px',
    backgroundColor: BG.surface, cursor: 'pointer', outline: 'none', appearance: 'none' as const,
  }

  function ThSort({ label, k, right }: { label: string; k: SortKey; right?: boolean }) {
    const active = sortKey === k
    return (
      <th
        onClick={() => handleSort(k)}
        className="select-none cursor-pointer px-4 py-2 whitespace-nowrap"
        style={{
          fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em',
          color: active ? BG.textSec : BG.textTer, textAlign: right ? 'right' : 'left',
        }}
      >
        <span className={`inline-flex items-center gap-1 ${right ? 'justify-end w-full' : ''}`}>
          {label}
          {active
            ? sortDir === 'desc' ? <ArrowDown size={11} strokeWidth={2} /> : <ArrowUp size={11} strokeWidth={2} />
            : <ArrowUpDown size={11} strokeWidth={1.5} style={{ opacity: 0.3 }} />}
        </span>
      </th>
    )
  }

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: BG.canvas }}>
      {/* Header */}
      <div className="px-6 pt-6 pb-0 shrink-0">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="font-semibold leading-tight tracking-tight" style={{ fontSize: '20px', color: BG.text }}>
              Fila priorizada
            </h1>
            <p className="font-mono mt-1" style={{ fontSize: '12px', color: BG.textTer }}>
              {DEMANDS.length} demandas · {criticalCount} críticas · {noEstimateCount} sem estimativa
            </p>
          </div>
          <button
            onClick={onNewDemand}
            className="flex items-center gap-1.5 px-3 shrink-0 transition-colors"
            style={{
              height: '30px', backgroundColor: BG.action, color: '#fff',
              fontSize: '13px', fontWeight: '500', borderRadius: '6px',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = BG.actionHover)}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = BG.action)}
          >
            <Plus size={14} strokeWidth={2} />
            Nova demanda
          </button>
        </div>
        {/* Filters */}
        <div className="flex items-center gap-2 pb-4">
          <select value={filterClient} onChange={e => setFilterClient(e.target.value)} style={selectStyle}>
            <option value="">Todos os clientes</option>
            {clients.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filterOwner} onChange={e => setFilterOwner(e.target.value)} style={selectStyle}>
            <option value="">Todos os responsáveis</option>
            {owners.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          <select value={filterPriority} onChange={e => setFilterPriority(e.target.value as Priority | '')} style={selectStyle}>
            <option value="">Todas as prioridades</option>
            <option value="crítico">Crítico</option>
            <option value="alto">Alto</option>
            <option value="médio">Médio</option>
            <option value="baixo">Baixo</option>
          </select>
          {hasFilters && (
            <button
              onClick={() => { setFilterClient(''); setFilterOwner(''); setFilterPriority('') }}
              className="flex items-center gap-1 transition-colors"
              style={{ fontSize: '12px', color: BG.textTer }}
              onMouseEnter={e => (e.currentTarget.style.color = BG.textSec)}
              onMouseLeave={e => (e.currentTarget.style.color = BG.textTer)}
            >
              <X size={12} strokeWidth={2} /> Limpar
            </button>
          )}
          <div className="ml-auto flex items-center gap-1 font-mono" style={{
            fontSize: '11px', color: BG.textTer, border: `1px solid ${BG.border}`,
            borderRadius: '4px', padding: '2px 6px',
          }}>
            ⌘K
          </div>
        </div>
      </div>

      <div style={{ height: '1px', backgroundColor: BG.border }} />

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10" style={{ backgroundColor: BG.canvas }}>
            <tr style={{ borderBottom: `1px solid ${BG.border}` }}>
              <th className="px-3 py-2" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: BG.textTer, width: '32px' }} />
              <th className="px-3 py-2 text-left" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: BG.textTer, width: '80px' }}>ID</th>
              <th className="px-4 py-2 text-left" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: BG.textTer }}>Demanda</th>
              <ThSort label="Cliente" k="client" />
              <ThSort label="Reach" k="reach" right />
              <ThSort label="Impact" k="impact" right />
              <ThSort label="Conf." k="confidence" right />
              <ThSort label="Effort" k="effort" right />
              <th className="px-3 py-2" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: BG.textTer, width: '70px', textAlign: 'center' }}>RICE</th>
              <ThSort label="RICE ↕" k="rice" right />
              <th className="px-4 py-2 text-left" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: BG.textTer }}>Prioridade</th>
              <th className="px-4 py-2 text-left" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: BG.textTer }}>Responsável</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((d, i) => {
              const noEst = d.status === 'sem-estimativa'
              const isCrit = d.priority === 'crítico'
              const p = PRIORITY[d.priority]
              return (
                <tr
                  key={d.id}
                  onClick={() => onSelectDemand(d)}
                  className="row-enter cursor-pointer group"
                  style={{
                    height: '42px',
                    borderBottom: `1px solid ${BG.border}`,
                    borderLeft: isCrit ? `2px solid ${p.leftBorder}` : '2px solid transparent',
                    boxShadow: isCrit ? `inset 2px 0 8px -4px rgba(255,92,92,0.4)` : undefined,
                    animationDelay: `${i * 18}ms`,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = BG.surface2)}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  {/* Delta */}
                  <td className="px-2 text-right">
                    <DeltaPosition demandId={d.id} />
                  </td>
                  {/* ID */}
                  <td className="px-3">
                    <span className="font-mono" style={{ fontSize: '11px', color: BG.textTer }}>{d.id}</span>
                  </td>
                  {/* Title */}
                  <td className="px-4 max-w-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="truncate"
                        style={{ fontSize: '13px', color: BG.text }}
                      >
                        {d.title}
                      </span>
                      {noEst && <AlertTriangle size={13} strokeWidth={1.5} style={{ color: '#FFA23A', flexShrink: 0 }} />}
                    </div>
                  </td>
                  {/* Client */}
                  <td className="px-4 whitespace-nowrap">
                    <span style={{ fontSize: '12px', color: BG.textSec }}>{d.client}</span>
                  </td>
                  {/* Reach */}
                  <td className="px-4 text-right">
                    <span className="font-mono tabular-nums" style={{ fontSize: '12px', color: BG.textSec }}>
                      {d.reach.toLocaleString('pt-BR')}
                    </span>
                  </td>
                  {/* Impact */}
                  <td className="px-4 text-right">
                    <span className="font-mono tabular-nums" style={{ fontSize: '12px', color: BG.textSec }}>{d.impact}×</span>
                  </td>
                  {/* Confidence */}
                  <td className="px-4 text-right">
                    <span className="font-mono tabular-nums" style={{ fontSize: '12px', color: BG.textSec }}>{Math.round(d.confidence * 100)}%</span>
                  </td>
                  {/* Effort */}
                  <td className="px-4 text-right">
                    <span className="font-mono tabular-nums" style={{ fontSize: '12px', color: BG.textSec }}>{d.effort}d</span>
                  </td>
                  {/* RICE micro-bar */}
                  <td className="px-3 text-center">
                    <div className="flex items-center justify-center">
                      <RiceBar demand={d} />
                    </div>
                  </td>
                  {/* RICE score */}
                  <td className="px-4 text-right">
                    {noEst ? (
                      <span className="font-mono" style={{ fontSize: '12px', color: BG.textDis }}>—</span>
                    ) : (
                      <div className="flex items-center justify-end gap-1.5">
                        <div
                          style={{
                            width: '6px', height: '6px', borderRadius: '50%',
                            backgroundColor: p.text, boxShadow: `0 0 6px ${p.text}`,
                          }}
                        />
                        <span className="font-mono tabular-nums font-medium" style={{ fontSize: '13px', color: BG.text }}>
                          {d.rice.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                        </span>
                      </div>
                    )}
                  </td>
                  {/* Priority */}
                  <td className="px-4">
                    <PriorityBadge priority={d.priority} />
                  </td>
                  {/* Owner */}
                  <td className="px-4">
                    <span style={{ fontSize: '12px', color: BG.textSec }}>{d.owner}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Screen 2 — Nova demanda ──────────────────────────────────────────────────

const INTERVIEW_STEPS = [
  {
    question: 'Quantos funcionários da farmácia acessam o sistema em um dia típico?',
    options: ['Menos de 20', 'Entre 20 e 100', 'Mais de 100'],
    factor: 'Reach',
    completeness: 22,
    reportLine: (ans: string) =>
      `Reach: ${ans === 'Mais de 100' ? '~120 usuários/trimestre estimados' : ans === 'Entre 20 e 100' ? '~60 usuários/trimestre estimados' : '< 20 usuários/trimestre'}`,
  },
  {
    question: 'O que acontece hoje quando precisam de informação sobre pedidos fora do caixa?',
    options: ['Ligam para o estoque', 'Consultam no computador fixo', 'Não conseguem consultar'],
    factor: 'Contexto',
    completeness: 40,
    reportLine: (ans: string) => `Situação atual: ${ans}. Isso gera interrupção no fluxo de atendimento.`,
  },
  {
    question: 'O que muda de verdade se resolvermos isso — qual o ganho real para a farmácia?',
    options: ['Atendimento mais rápido', 'Menos erros de pedido', 'Menos interrupções no caixa'],
    factor: 'Impact',
    completeness: 58,
    reportLine: (ans: string) => `Impact: Alto (2×) — ${ans}. Efeito direto na operação diária.`,
  },
  {
    question: 'Você tem algum dado ou relato concreto? Uma reclamação, planilha, qualquer coisa.',
    options: ['Sim, tenho registros de suporte', 'Estimativa do gerente', 'Só percepção geral'],
    factor: 'Confidence',
    completeness: 74,
    reportLine: (ans: string) => {
      const conf = ans === 'Sim, tenho registros de suporte' ? '80%' : '50%'
      return `Confidence: ${conf} — ${ans}.`
    },
  },
  {
    question: 'Quanto tempo você estima para entregar? Considera um desenvolvedor focado nisso.',
    options: ['Menos de uma semana (< 5d)', '1 a 2 semanas (5–10d)', 'Mais de 2 semanas (> 10d)'],
    factor: 'Effort',
    completeness: 90,
    reportLine: (ans: string) => {
      const effort = ans.includes('< 5') ? '3–5 pessoa-dias' : ans.includes('5–10') ? '5–10 pessoa-dias' : '10+ pessoa-dias'
      return `Effort: ${effort}. Inclui implementação, testes e ativação.`
    },
  },
]

function NewDemandScreen() {
  const [initialText, setInitialText] = useState('')
  const [started, setStarted] = useState(false)
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [pendingAnswer, setPendingAnswer] = useState<string | null>(null)
  const completeness = step < INTERVIEW_STEPS.length
    ? (step === 0 ? 0 : INTERVIEW_STEPS[step - 1].completeness)
    : 90
  const done = completeness >= 80
  const currentStep = INTERVIEW_STEPS[step]
  const reportLines = answers.map((ans, i) => INTERVIEW_STEPS[i].reportLine(ans))

  function handleAnswer(ans: string) {
    setPendingAnswer(ans)
    setTimeout(() => { setAnswers(p => [...p, ans]); setStep(p => p + 1); setPendingAnswer(null) }, 400)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', height: '112px', padding: '10px 12px', fontSize: '13px',
    color: BG.text, backgroundColor: BG.surface, border: `1px solid ${BG.border}`,
    borderRadius: '6px', resize: 'none', outline: 'none',
    lineHeight: '1.6', fontFamily: 'inherit',
  }

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: BG.canvas }}>
      <div className="px-6 pt-6 pb-4 shrink-0" style={{ borderBottom: `1px solid ${BG.border}` }}>
        <h1 className="font-semibold tracking-tight" style={{ fontSize: '20px', color: BG.text }}>Nova demanda</h1>
        <p className="mt-1" style={{ fontSize: '12px', color: BG.textTer }}>A IA conduz a entrevista — uma pergunta por vez — até a demanda estar pronta para pontuar.</p>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left */}
        <div className="flex flex-col w-1/2 overflow-y-auto" style={{ borderRight: `1px solid ${BG.border}` }}>
          <div className="p-6" style={{ borderBottom: `1px solid ${BG.border}` }}>
            <label className="block mb-2" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: BG.textTer }}>
              Descrição inicial
            </label>
            <textarea
              value={initialText}
              onChange={e => setInitialText(e.target.value)}
              disabled={started}
              placeholder="Descreva a demanda com suas palavras. Não precisa ser perfeito — a IA vai fazer as perguntas certas."
              style={{
                ...inputStyle,
                backgroundColor: started ? BG.surface2 : BG.surface,
                color: started ? BG.textSec : BG.text,
              }}
            />
            {!started && (
              <button
                onClick={() => { if (initialText.trim().length >= 10) setStarted(true) }}
                disabled={initialText.trim().length < 10}
                className="mt-3 flex items-center gap-1.5 transition-colors"
                style={{
                  height: '30px', padding: '0 12px', fontSize: '13px', fontWeight: '500',
                  backgroundColor: initialText.trim().length >= 10 ? BG.action : BG.surface3,
                  color: initialText.trim().length >= 10 ? '#fff' : BG.textDis,
                  borderRadius: '6px', cursor: initialText.trim().length >= 10 ? 'pointer' : 'not-allowed',
                }}
              >
                Iniciar refinamento
                <ChevronRight size={14} strokeWidth={2} />
              </button>
            )}
          </div>

          {started && (
            <div className="flex-1 p-6 space-y-5">
              {answers.map((ans, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: BG.actionSoft }}>
                      <span style={{ fontSize: '9px', fontWeight: 700, color: BG.action }}>IA</span>
                    </div>
                    <p style={{ fontSize: '13px', color: BG.text, lineHeight: '1.5' }}>{INTERVIEW_STEPS[i].question}</p>
                  </div>
                  <div className="ml-7 inline-block px-3 py-1.5 rounded-[6px]" style={{ backgroundColor: BG.surface2, fontSize: '12px', color: BG.textSec }}>
                    {ans}
                  </div>
                </div>
              ))}

              {currentStep && !pendingAnswer && (
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: BG.actionSoft }}>
                      <span style={{ fontSize: '9px', fontWeight: 700, color: BG.action }}>IA</span>
                    </div>
                    <p style={{ fontSize: '13px', color: BG.text, lineHeight: '1.5' }}>{currentStep.question}</p>
                  </div>
                  <div className="ml-7 flex flex-wrap gap-2">
                    {currentStep.options.map(opt => (
                      <button
                        key={opt}
                        onClick={() => handleAnswer(opt)}
                        className="px-3 py-1.5 rounded-[4px] transition-colors"
                        style={{
                          fontSize: '12px', color: BG.action,
                          border: `1px solid ${BG.actionBorder}`,
                          backgroundColor: 'transparent',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = BG.actionSoft)}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {pendingAnswer && (
                <div className="ml-7 inline-block px-3 py-1.5 rounded-[6px] animate-pulse" style={{ backgroundColor: BG.actionSoft, fontSize: '12px', color: BG.action }}>
                  {pendingAnswer}
                </div>
              )}

              {step >= INTERVIEW_STEPS.length && (
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: 'rgba(61,220,151,0.15)' }}>
                    <Check size={10} strokeWidth={3} style={{ color: '#3DDC97' }} />
                  </div>
                  <p style={{ fontSize: '13px', color: '#3DDC97', lineHeight: '1.5', fontWeight: '500' }}>
                    Demanda completa. Todos os fatores RICE foram definidos. Revise o relatório ao lado e classifique quando estiver pronto.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right */}
        <div className="flex flex-col w-1/2 overflow-y-auto">
          <div className="p-6" style={{ borderBottom: `1px solid ${BG.border}` }}>
            <div className="flex items-center justify-between mb-2">
              <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: BG.textTer }}>
                Completude
              </span>
              <span className="font-mono font-semibold" style={{ fontSize: '12px', color: BG.text }}>{completeness}%</span>
            </div>
            {/* Segmented completeness bar */}
            <div className="flex gap-1 mb-3">
              {INTERVIEW_STEPS.map((s, i) => {
                const isDone = i < answers.length
                const isCurrent = i === step && started
                const color = isDone ? BG.action : isCurrent ? BG.actionBorder : BG.border
                return (
                  <div key={s.factor} className="flex-1 flex flex-col gap-1">
                    <div
                      style={{
                        height: '5px', borderRadius: '2px', backgroundColor: color,
                        boxShadow: isDone ? `0 0 6px ${BG.actionBorder}` : undefined,
                        transition: 'background-color 300ms ease-out, box-shadow 300ms ease-out',
                      }}
                    />
                    <span style={{ fontSize: '9px', fontWeight: 600, textTransform: 'uppercase', textAlign: 'center', color: isDone ? BG.action : BG.textTer }}>
                      {s.factor}
                    </span>
                  </div>
                )
              })}
            </div>
            <div className="flex flex-wrap gap-3">
              {INTERVIEW_STEPS.map((s, i) => {
                const isDone = i < answers.length
                const isCurrent = i === step && started
                return (
                  <div key={s.factor} className="flex items-center gap-1">
                    {isDone
                      ? <Check size={11} strokeWidth={2.5} style={{ color: '#3DDC97' }} />
                      : isCurrent ? <div style={{ width: 11, height: 11, borderRadius: '50%', border: `2px solid #FFD84D` }} />
                      : <div style={{ width: 11, height: 11, borderRadius: '50%', border: `2px solid ${BG.border}` }} />}
                    <span style={{ fontSize: '11px', color: isDone ? '#3DDC97' : isCurrent ? '#FFD84D' : BG.textTer }}>
                      {s.factor}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex-1 p-6 space-y-4">
            {!started ? (
              <p style={{ fontSize: '12px', color: BG.textDis, fontStyle: 'italic' }}>
                O relatório aparece aqui conforme as respostas entram...
              </p>
            ) : (
              <>
                <div>
                  <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: BG.textTer, marginBottom: 6 }}>Demanda</p>
                  <p style={{ fontSize: '13px', color: BG.text, lineHeight: '1.6', fontWeight: 500 }}>{initialText}</p>
                </div>
                {reportLines.length > 0 && (
                  <div className="space-y-2 pt-3" style={{ borderTop: `1px solid ${BG.border}` }}>
                    {reportLines.map((line, i) => {
                      const colonIdx = line.indexOf(':')
                      const label = line.slice(0, colonIdx)
                      const rest = line.slice(colonIdx + 1).trim()
                      return (
                        <div key={i} className="flex gap-2">
                          <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: BG.textTer, flexShrink: 0, width: '76px', paddingTop: '1px' }}>
                            {label}
                          </span>
                          <span style={{ fontSize: '12px', color: BG.textSec, lineHeight: '1.5' }}>{rest}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="p-6" style={{ borderTop: `1px solid ${BG.border}` }}>
            <button
              disabled={!done}
              style={{
                width: '100%', height: '34px', fontSize: '13px', fontWeight: 600,
                borderRadius: '6px', cursor: done ? 'pointer' : 'not-allowed',
                backgroundColor: done ? BG.action : BG.surface3,
                color: done ? '#fff' : BG.textDis,
                transition: 'background-color 200ms',
              }}
            >
              Classificar demanda
            </button>
            {!done && started && (
              <p className="text-center mt-2" style={{ fontSize: '11px', color: BG.textTer }}>
                Disponível com completude acima de 80%
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Screen 3 — Antes e depois ────────────────────────────────────────────────

const BEFORE_TEXT = `O cliente pediu pra gente atualizar a nota fiscal porque o sistema tá rejeitando. A SEFAZ mudou alguma coisa e agora não funciona mais. Isso tá afetando bastante gente lá na farmácia, não conseguem emitir nota de jeito nenhum. Precisamos resolver isso logo pois está causando problemas sérios para eles. Falei com o Juliano e ele sabe os detalhes técnicos. Acho que é coisa de layout mesmo.`

const RICE_FACTORS_AFTER = [
  { label: 'Reach', value: '1.200 usuários/tri', justification: 'Total de PDVs ativos da Farmácia São Bento, todos emitindo NF-e diariamente.', color: BG.action },
  { label: 'Impact', value: '3× (massivo)', justification: 'Operação de emissão fiscal completamente bloqueada. Sem NF-e, sem venda.', color: '#FF5C5C' },
  { label: 'Confidence', value: '100%', justification: 'Rejeição confirmada pela SEFAZ com código de erro NT 2024.001.', color: '#3DDC97' },
  { label: 'Effort', value: '13 pessoa-dias', justification: 'Mapeamento do leiaute (3d) + implementação (7d) + testes de homologação (3d).', color: '#FFD84D' },
]

function BeforeAfterScreen() {
  const [hoveredFactor, setHoveredFactor] = useState<string | null>(null)

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: BG.canvas }}>
      <div className="px-6 pt-6 pb-4 shrink-0" style={{ borderBottom: `1px solid ${BG.border}` }}>
        <div className="flex items-center gap-3">
          <div>
            <h1 className="font-semibold tracking-tight" style={{ fontSize: '20px', color: BG.text }}>Antes e depois</h1>
            <p className="mt-1" style={{ fontSize: '12px', color: BG.textTer }}>
              <span className="font-mono" style={{ color: BG.textTer }}>DEM-001</span> · Farmácia São Bento · Integração NF-e SEFAZ
            </p>
          </div>
          <PriorityBadge priority="crítico" />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/2 flex flex-col" style={{ borderRight: `1px solid ${BG.border}` }}>
          <div className="px-6 py-2.5" style={{ borderBottom: `1px solid ${BG.border}`, backgroundColor: BG.surface2 }}>
            <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: BG.textTer }}>Pedido original</span>
          </div>
          <div className="flex-1 overflow-y-auto p-6" style={{ backgroundColor: BG.surface }}>
            <p style={{ fontSize: '13px', color: BG.textSec, lineHeight: '1.7' }}>{BEFORE_TEXT}</p>
            <div className="mt-6 pt-4" style={{ borderTop: `1px solid ${BG.border}` }}>
              <p style={{ fontSize: '11px', color: BG.textTer }}>
                Texto livre sem estrutura. Reach, Impact, Confidence e Effort impossíveis de inferir sem perguntas.
              </p>
            </div>
          </div>
        </div>

        <div className="w-1/2 flex flex-col">
          <div className="px-6 py-2.5" style={{ borderBottom: `1px solid ${BG.border}`, backgroundColor: BG.surface }}>
            <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: BG.action }}>Demanda refinada</span>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-5" style={{ backgroundColor: BG.canvas }}>
            {[
              { section: 'Problema', content: 'As notas fiscais emitidas pelo sistema estão sendo rejeitadas pela SEFAZ após a publicação do novo leiaute NT 2024.001. O módulo de emissão ainda usa o formato anterior e precisa ser atualizado.' },
              { section: 'Quem é afetado', content: 'Todos os 1.200 pontos de venda da Farmácia São Bento que emitem NF-e diariamente. A operação de venda fica completamente bloqueada sem a emissão fiscal.' },
              { section: 'Evidência', content: 'Rejeição confirmada com código de erro oficial da SEFAZ. Data de obrigatoriedade do novo leiaute: 01/11/2024. Impacto 100% verificável.' },
              { section: 'Escopo', content: 'Atualização do módulo de emissão de NF-e para o leiaute NT 2024.001. Inclui mapeamento dos novos campos, implementação e testes em ambiente de homologação da SEFAZ.' },
              { section: 'Critérios de aceite', content: 'Sistema emite NF-e sem rejeição em produção · Testado e aprovado em homologação · Documentação de campos atualizada · Deploy sem janela de manutenção.' },
            ].map(({ section, content }) => (
              <div key={section}>
                <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: BG.textTer, marginBottom: '4px' }}>{section}</p>
                <p style={{ fontSize: '13px', color: BG.text, lineHeight: '1.6' }}>{content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RICE Footer */}
      <div className="shrink-0 px-6 py-4" style={{ borderTop: `1px solid ${BG.borderStrong}`, backgroundColor: BG.surface }}>
        <p className="mb-3" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: BG.textTer }}>
          Fatores RICE — (1.200 × 3 × 1,0) ÷ 13 =&nbsp;
          <span className="font-mono" style={{ color: BG.text, fontSize: '13px', fontWeight: 700 }}>276,9</span>
        </p>
        <div className="grid grid-cols-4 gap-3">
          {RICE_FACTORS_AFTER.map(f => (
            <div
              key={f.label}
              onMouseEnter={() => setHoveredFactor(f.label)}
              onMouseLeave={() => setHoveredFactor(null)}
              className="p-3 rounded-[6px] cursor-default transition-all"
              style={{
                backgroundColor: BG.surface2,
                border: `1px solid ${hoveredFactor === f.label ? f.color + '50' : BG.border}`,
                boxShadow: hoveredFactor === f.label ? `0 0 10px ${f.color}18` : undefined,
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: BG.textTer }}>{f.label}</span>
                <span className="font-mono font-semibold" style={{ fontSize: '12px', color: f.color }}>{f.value}</span>
              </div>
              <p style={{ fontSize: '11px', color: BG.textSec, lineHeight: '1.4' }}>{f.justification}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Screen 4 — Detalhe ───────────────────────────────────────────────────────

const TIMELINE = [
  { label: 'Demanda aberta',   time: 'há 2h',    done: true },
  { label: 'Refinamento IA',   time: 'há 1h',    done: true },
  { label: 'Classificada',     time: 'há 45min', done: true },
  { label: 'Em fila',          time: 'agora',    done: true },
  { label: 'Em execução',      time: '—',        done: false },
]

function DetailScreen({ demand }: { demand: Demand }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [simR, setSimR] = useState(demand.reach)
  const [simI, setSimI] = useState(demand.impact)
  const [simC, setSimC] = useState(demand.confidence)
  const [simE, setSimE] = useState(demand.effort)

  const simRice = Math.round((simR * simI * simC / simE) * 10) / 10
  const otherRices = DEMANDS.filter(d => d.id !== demand.id).map(d => d.rice)
  const allRices = [simRice, ...otherRices].sort((a, b) => b - a)
  const simPosition = allRices.indexOf(simRice) + 1
  const origPosition = [...DEMANDS].sort((a, b) => b.rice - a.rice).findIndex(d => d.id === demand.id) + 1

  const p = PRIORITY[demand.priority]

  const factors = [
    { key: 'reach', label: 'Reach', value: demand.reach.toLocaleString('pt-BR'), suffix: 'usuários/tri', justification: 'Todos os PDVs ativos da Farmácia São Bento que emitem NF-e diariamente.', author: 'Juliano', when: 'há 1h', inferred: false },
    { key: 'impact', label: 'Impact', value: `${demand.impact}×`, suffix: 'massivo', justification: 'Operação completamente bloqueada sem emissão de NF-e. Sem nota, sem venda.', author: 'Marcela', when: 'há 1h', inferred: false },
    { key: 'confidence', label: 'Confidence', value: `${Math.round(demand.confidence * 100)}%`, suffix: 'confirmado', justification: 'Rejeição com código de erro SEFAZ verificado. Data de obrigatoriedade publicada.', author: 'Juliano', when: 'há 45min', inferred: false },
    { key: 'effort', label: 'Effort', value: `${demand.effort}d`, suffix: 'pessoa-dias', justification: 'Mapeamento do novo leiaute (3d) + implementação (7d) + testes de homologação (3d).', author: 'Téo', when: 'há 45min', inferred: true },
  ]

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ backgroundColor: BG.canvas }}>
      <div className="px-6 pt-6 pb-4 shrink-0" style={{ borderBottom: `1px solid ${BG.border}` }}>
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono" style={{ fontSize: '12px', color: BG.textTer }}>{demand.id}</span>
              <PriorityBadge priority={demand.priority} />
              <span style={{ fontSize: '11px', color: BG.textTer }}>· {demand.client} · {demand.owner}</span>
            </div>
            <h1 className="font-semibold leading-snug tracking-tight" style={{ fontSize: '18px', color: BG.text }}>
              {demand.title}
            </h1>
          </div>
          <div className="text-right shrink-0">
            <p className="font-mono font-bold tabular-nums leading-none" style={{ fontSize: '32px', color: BG.text }}>
              {demand.rice.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
            </p>
            <p className="font-mono mt-1" style={{ fontSize: '11px', color: BG.textTer }}>
              ({demand.reach.toLocaleString('pt-BR')} × {demand.impact} × {demand.confidence}) ÷ {demand.effort}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          {/* Factors */}
          <div className="p-6 space-y-2">
            <p className="mb-3" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: BG.textTer }}>Fatores RICE</p>
            {factors.map(f => (
              <div key={f.key} className="rounded-[6px] overflow-hidden" style={{ border: `1px solid ${BG.border}` }}>
                <button
                  onClick={() => setExpanded(prev => ({ ...prev, [f.key]: !prev[f.key] }))}
                  className="w-full flex items-center justify-between px-4 py-3 transition-colors"
                  style={{ backgroundColor: 'transparent' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = BG.surface2)}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <div className="flex items-center gap-3">
                    <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: BG.textTer, width: '76px' }}>{f.label}</span>
                    <span className="font-mono font-semibold" style={{ fontSize: '14px', color: BG.text }}>{f.value}</span>
                    <span style={{ fontSize: '11px', color: BG.textTer }}>{f.suffix}</span>
                    {f.inferred && (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-[3px]" style={{ fontSize: '10px', color: '#FFA23A', backgroundColor: 'rgba(255,162,58,0.10)', border: '1px solid rgba(255,162,58,0.25)' }}>
                        ⚠ inferido
                      </span>
                    )}
                  </div>
                  {expanded[f.key]
                    ? <ChevronDown size={14} strokeWidth={1.5} style={{ color: BG.textTer }} />
                    : <ChevronRight size={14} strokeWidth={1.5} style={{ color: BG.textTer }} />}
                </button>
                {expanded[f.key] && (
                  <div className="px-4 pb-3" style={{ borderTop: `1px solid ${BG.border}`, backgroundColor: BG.surface2, paddingTop: '12px' }}>
                    <p style={{ fontSize: '12px', color: BG.textSec, lineHeight: '1.5' }}>{f.justification}</p>
                    <p className="mt-2" style={{ fontSize: '11px', color: BG.textTer }}>
                      Definido por {f.author} · {f.when}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Simulator */}
          <div className="px-6 pb-6">
            <div className="rounded-[6px] overflow-hidden" style={{ border: `1px solid ${BG.border}` }}>
              <div className="px-4 py-3 flex items-center justify-between" style={{ backgroundColor: BG.surface2, borderBottom: `1px solid ${BG.border}` }}>
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={14} strokeWidth={1.5} style={{ color: BG.textSec }} />
                  <span style={{ fontSize: '12px', fontWeight: 600, color: BG.text }}>Simulador</span>
                </div>
                <p style={{ fontSize: '11px', color: BG.textTer }}>Arraste para ver o impacto na fila</p>
              </div>
              <div className="p-4 space-y-4" style={{ backgroundColor: BG.surface }}>
                {[
                  { label: 'Reach', val: simR, setter: setSimR, min: 100, max: 5000, step: 50, fmt: (v: number) => v.toLocaleString('pt-BR') },
                  { label: 'Impact', val: simI, setter: setSimI, min: 0.25, max: 3, step: 0.25, fmt: (v: number) => `${v}×` },
                  { label: 'Confidence', val: simC, setter: setSimC, min: 0.5, max: 1.0, step: 0.1, fmt: (v: number) => `${Math.round(v * 100)}%` },
                  { label: 'Effort', val: simE, setter: setSimE, min: 1, max: 60, step: 1, fmt: (v: number) => `${v}d` },
                ].map(({ label, val, setter, min, max, step, fmt }) => (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-2">
                      <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: BG.textTer }}>{label}</span>
                      <span className="font-mono font-semibold tabular-nums" style={{ fontSize: '12px', color: BG.text }}>{fmt(val)}</span>
                    </div>
                    <input
                      type="range" min={min} max={max} step={step} value={val}
                      onChange={e => setter(parseFloat(e.target.value))}
                      style={{ width: '100%', transition: 'all 200ms cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                    />
                  </div>
                ))}

                <div className="pt-3 flex items-center justify-between" style={{ borderTop: `1px solid ${BG.border}` }}>
                  <div>
                    <p style={{ fontSize: '11px', color: BG.textTer, marginBottom: '2px' }}>Novo RICE</p>
                    <span
                      className="font-mono font-bold tabular-nums"
                      style={{
                        fontSize: '24px',
                        color: simRice > demand.rice ? '#3DDC97' : simRice < demand.rice ? '#FF5C5C' : BG.text,
                        transition: 'all 200ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                      }}
                    >
                      {simRice.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                    </span>
                    <span className="ml-2" style={{ fontSize: '11px', color: BG.textTer }}>
                      {simRice > demand.rice ? `+${(simRice - demand.rice).toFixed(1)}` : simRice < demand.rice ? `${(simRice - demand.rice).toFixed(1)}` : 'sem alteração'}
                    </span>
                  </div>
                  <div className="text-right">
                    <p style={{ fontSize: '11px', color: BG.textTer, marginBottom: '2px' }}>Posição na fila</p>
                    <span
                      className="font-mono font-bold tabular-nums"
                      style={{
                        fontSize: '24px', color: BG.text,
                        transition: 'all 200ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                      }}
                    >
                      #{simPosition}
                    </span>
                    {simPosition !== origPosition && (
                      <span className="ml-2" style={{ fontSize: '11px', color: simPosition < origPosition ? '#3DDC97' : BG.textTer }}>
                        {simPosition < origPosition ? `▲ subiu ${origPosition - simPosition}` : `▼ desceu ${simPosition - origPosition}`}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="w-52 shrink-0 p-5 overflow-y-auto" style={{ borderLeft: `1px solid ${BG.border}` }}>
          <p className="mb-4" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: BG.textTer }}>Histórico</p>
          {TIMELINE.map((t, i) => (
            <div key={t.label} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
                  style={{ borderColor: t.done ? BG.action : BG.border, backgroundColor: t.done ? BG.action : 'transparent' }}
                >
                  {t.done && <Check size={10} strokeWidth={3} style={{ color: '#fff' }} />}
                </div>
                {i < TIMELINE.length - 1 && (
                  <div className="w-px mt-1" style={{ height: '32px', backgroundColor: t.done ? BG.action : BG.border }} />
                )}
              </div>
              <div style={{ paddingBottom: '32px' }}>
                <p style={{ fontSize: '12px', color: BG.text, fontWeight: 500, lineHeight: 1.3 }}>{t.label}</p>
                <p style={{ fontSize: '11px', color: BG.textTer, marginTop: '2px' }}>{t.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Screen 5 — Painel ────────────────────────────────────────────────────────

function DashboardScreen() {
  const counts = {
    'crítico': DEMANDS.filter(d => d.priority === 'crítico').length,
    'alto':    DEMANDS.filter(d => d.priority === 'alto').length,
    'médio':   DEMANDS.filter(d => d.priority === 'médio').length,
    'baixo':   DEMANDS.filter(d => d.priority === 'baixo').length,
  }
  const total = DEMANDS.length
  const queueEffort = DEMANDS.filter(d => d.status === 'em-fila').reduce((s, d) => s + d.effort, 0)
  const monthlyCapacity = 60
  const effortPct = Math.min(Math.round(queueEffort / monthlyCapacity * 100), 120)
  const stalled = DEMANDS.filter(d => d.status === 'sem-estimativa')

  const priorityBars: { key: Priority; label: string; color: string }[] = [
    { key: 'crítico', label: 'Crítico', color: '#FF5C5C' },
    { key: 'alto',    label: 'Alto',    color: '#FFA23A' },
    { key: 'médio',   label: 'Médio',   color: '#FFD84D' },
    { key: 'baixo',   label: 'Baixo',   color: '#3DDC97' },
  ]

  const blockStyle: React.CSSProperties = {
    border: `1px solid ${BG.border}`, borderRadius: '6px', padding: '20px',
    backgroundColor: BG.surface,
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ backgroundColor: BG.canvas }}>
      <div className="px-6 pt-6 pb-4 shrink-0" style={{ borderBottom: `1px solid ${BG.border}` }}>
        <h1 className="font-semibold tracking-tight" style={{ fontSize: '20px', color: BG.text }}>Painel</h1>
        <p className="mt-1" style={{ fontSize: '12px', color: BG.textTer }}>Visão geral da fila de demandas</p>
      </div>

      <div className="p-6 space-y-5">
        {/* Priority distribution */}
        <div style={blockStyle}>
          <p className="mb-4" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: BG.textTer }}>Distribuição por prioridade</p>
          <div className="flex gap-px mb-4" style={{ height: '20px', borderRadius: '4px', overflow: 'hidden', backgroundColor: BG.surface2 }}>
            {priorityBars.map(({ key, color }) => {
              const pct = (counts[key] / total) * 100
              return pct > 0 ? (
                <div
                  key={key}
                  style={{
                    width: `${pct}%`, backgroundColor: color,
                    boxShadow: key === 'crítico' ? '0 0 10px rgba(255,92,92,0.30)' : key === 'alto' ? '0 0 8px rgba(255,162,58,0.22)' : undefined,
                  }}
                />
              ) : null
            })}
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {priorityBars.map(({ key, label, color }) => (
              <div key={key} className="flex items-center gap-2">
                <div style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: color }} />
                <span style={{ fontSize: '12px', color: BG.textSec }}>{label}</span>
                <span className="font-mono font-semibold tabular-nums" style={{ fontSize: '12px', color: BG.text }}>{counts[key]}</span>
                <span style={{ fontSize: '11px', color: BG.textTer }}>
                  ({Math.round(counts[key] / total * 100)}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Queue vs capacity */}
        <div style={blockStyle}>
          <p className="mb-1" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: BG.textTer }}>Fila × capacidade do time</p>
          <p className="mb-4" style={{ fontSize: '12px', color: BG.textSec }}>Este mês · capacidade declarada: {monthlyCapacity} pessoa-dias</p>
          <div className="flex items-end gap-4 mb-4">
            {[
              { label: 'Na fila', val: `${queueEffort}d` },
              { label: 'Capacidade', val: `${monthlyCapacity}d` },
            ].map(({ label, val }) => (
              <div key={label}>
                <p style={{ fontSize: '11px', color: BG.textTer, marginBottom: '2px' }}>{label}</p>
                <p className="font-mono font-bold tabular-nums leading-none" style={{ fontSize: '28px', color: BG.text }}>{val}</p>
              </div>
            ))}
            <div style={{ color: BG.borderStrong, fontSize: '20px', marginBottom: '4px' }}>/</div>
          </div>
          <div style={{ height: '8px', backgroundColor: BG.surface2, borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' }}>
            <div
              style={{
                height: '100%', borderRadius: '4px',
                width: `${Math.min(effortPct, 100)}%`,
                backgroundColor: effortPct > 90 ? '#FF5C5C' : effortPct > 70 ? '#FFA23A' : BG.action,
                boxShadow: effortPct > 90 ? '0 0 10px rgba(255,92,92,0.30)' : undefined,
                transition: 'width 600ms ease-out',
              }}
            />
          </div>
          <p style={{ fontSize: '11px', color: BG.textTer }}>
            {effortPct}% comprometido ·{' '}
            {monthlyCapacity - queueEffort > 0
              ? `${monthlyCapacity - queueEffort}d disponíveis`
              : `${Math.abs(monthlyCapacity - queueEffort)}d acima da capacidade`}
          </p>
        </div>

        {/* Stalled */}
        <div style={blockStyle}>
          <p className="mb-1" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: BG.textTer }}>Demandas represadas</p>
          <p className="mb-4" style={{ fontSize: '12px', color: BG.textSec }}>Aguardando refinamento e classificação</p>
          <div className="space-y-2">
            {stalled.map(d => (
              <div key={d.id} className="flex items-center justify-between px-3 py-2.5 rounded-[4px] transition-colors" style={{ border: `1px solid ${BG.border}`, backgroundColor: BG.surface2 }}>
                <div className="flex items-center gap-3">
                  <span className="font-mono" style={{ fontSize: '11px', color: BG.textTer }}>{d.id}</span>
                  <div>
                    <p style={{ fontSize: '12px', color: BG.text, fontWeight: 500, lineHeight: '1.3' }}>{d.title}</p>
                    <p style={{ fontSize: '11px', color: BG.textSec }}>{d.client} · {d.owner}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-1" style={{ fontSize: '11px', color: BG.textTer }}>
                    <Clock size={11} strokeWidth={1.5} />
                    {d.createdAt}
                  </div>
                  <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', color: '#FFA23A', backgroundColor: 'rgba(255,162,58,0.10)', border: '1px solid rgba(255,162,58,0.25)' }}>
                    Sem estimativa
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Screen 6 — Revisão IA ────────────────────────────────────────────────────

const REVIEW_ITEMS = [
  {
    demand: DEMANDS[1],
    tags: ['baixa confiança', 'estimado'],
    factors: [
      { name: 'Reach', value: 340, displayValue: '340', conf: 90, justification: 'Cita 340 pacientes ativos no relatório original.', inferred: false },
      { name: 'Impact', value: 2, displayValue: '2×', conf: 55, justification: 'Não informado — estimado por similaridade com demandas de agenda.', inferred: true },
      { name: 'Confidence', value: 100, displayValue: '100%', conf: 95, justification: 'Bug confirmado por múltiplos relatos de suporte.', inferred: false },
      { name: 'Effort', value: 5, displayValue: '5d', conf: 60, justification: 'Estimativa inicial sem análise técnica detalhada.', inferred: true },
    ],
    scoreBreakdown: [
      { label: 'Score RICE base', detail: '(340 × 2 × 1,0) ÷ 5', value: '136,0', final: false },
      { label: 'Regra 4 "bug crítico"', detail: 'automática', value: '+68,0', final: false },
      { label: 'Score final', detail: '', value: '204,0', final: true, priority: 'crítico' as Priority },
    ],
    reportText: [
      { text: 'A agenda da Clínica Vida Plena apresenta um bug crítico de concorrência: quando dois recepcionistas tentam salvar a mesma consulta simultaneamente, o sistema cria registros duplicados.', inferred: false },
      { text: ' Isso afeta ', inferred: false },
      { text: '340 pacientes ativos', inferred: false, underlined: true },
      { text: ' mensalmente e gera ', inferred: false },
      { text: 'retrabalho estimado de 2h por dia para a equipe clínica', inferred: true, underlined: true },
      { text: '.', inferred: false },
    ],
    corrections: [
      { factor: 'Impact', from: '2×', to: '3×', reason: 'Bug impede atendimento completo de pacientes' },
      { factor: 'Effort', from: '5d', to: '8d', reason: 'Exige refactoring do módulo de agenda' },
    ],
  },
  {
    demand: DEMANDS[4],
    tags: ['no limite'],
    factors: [
      { name: 'Reach', value: 45, displayValue: '45', conf: 85, justification: 'Informado pelo cliente: 45 vendedores.', inferred: false },
      { name: 'Impact', value: 1, displayValue: '1×', conf: 70, justification: 'Automação de tarefa manual semanal.', inferred: false },
      { name: 'Confidence', value: 80, displayValue: '80%', conf: 80, justification: 'Baseado em relato do gerente de vendas.', inferred: false },
      { name: 'Effort', value: 8, displayValue: '8d', conf: 55, justification: 'Estimativa sem análise do formato atual do relatório.', inferred: true },
    ],
    scoreBreakdown: [
      { label: 'Score RICE base', detail: '(45 × 1 × 0,8) ÷ 8', value: '4,5', final: false },
      { label: 'Score final', detail: '', value: '4,5', final: true, priority: 'baixo' as Priority },
    ],
    reportText: [
      { text: 'A Distribuidora Zanatta precisa de um relatório de comissão por vendedor que possa ser exportado em Excel. Atualmente o processo é feito manualmente a cada semana, consumindo tempo da equipe de RH.', inferred: false },
    ],
    corrections: [],
  },
  {
    demand: DEMANDS[6],
    tags: ['contestado'],
    factors: [
      { name: 'Reach', value: 120, displayValue: '120', conf: 60, justification: 'Estimado pelo número de SKUs, sem dados de acesso.', inferred: true },
      { name: 'Impact', value: 2, displayValue: '2×', conf: 65, justification: 'Melhora de fluxo de busca — sem dado de conversão.', inferred: true },
      { name: 'Confidence', value: 50, displayValue: '50%', conf: 50, justification: 'Sem evidência concreta; estimativa baseada em tamanho.', inferred: true },
      { name: 'Effort', value: 21, displayValue: '21d', conf: 70, justification: 'Migração de catálogo com mapeamento de código OEM.', inferred: false },
    ],
    scoreBreakdown: [
      { label: 'Score RICE base', detail: '(120 × 2 × 0,5) ÷ 21', value: '5,7', final: false },
      { label: 'Score final', detail: '', value: '5,7', final: true, priority: 'baixo' as Priority },
    ],
    reportText: [
      { text: 'A Auto Peças Girardi solicita a migração do catálogo antigo para um sistema de busca por código OEM. O sistema atual não suporta esse tipo de busca, forçando consultas manuais.', inferred: false },
    ],
    corrections: [],
  },
]

const REVIEW_TAG_STYLES: Record<string, { color: string; bg: string; border: string }> = {
  'baixa confiança': { color: '#FFA23A', bg: 'rgba(255,162,58,0.10)', border: 'rgba(255,162,58,0.28)' },
  'estimado':        { color: '#FFD84D', bg: 'rgba(255,216,77,0.09)', border: 'rgba(255,216,77,0.25)' },
  'ajustado por regra': { color: BG.action, bg: BG.actionSoft, border: BG.actionBorder },
  'no limite':       { color: '#9B9BA3', bg: 'rgba(155,155,163,0.10)', border: 'rgba(155,155,163,0.25)' },
  'contestado':      { color: '#FF5C5C', bg: 'rgba(255,92,92,0.10)', border: 'rgba(255,92,92,0.28)' },
}

function ReviewScreen() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [correctingFactor, setCorrectingFactor] = useState<string | null>(null)
  const [corrections, setCorrections] = useState(REVIEW_ITEMS[0].corrections)
  const [patternDismissed, setPatternDismissed] = useState(false)
  const [showToast, setShowToast] = useState(false)

  const item = REVIEW_ITEMS[currentIndex]
  const totalItems = 12

  useEffect(() => {
    setCorrections(REVIEW_ITEMS[currentIndex].corrections)
    setCorrectingFactor(null)
  }, [currentIndex])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'j' || e.key === 'J') setCurrentIndex(i => Math.min(i + 1, REVIEW_ITEMS.length - 1))
      if (e.key === 'k' || e.key === 'K') setCurrentIndex(i => Math.max(i - 1, 0))
      if (e.key === 'a' || e.key === 'A') { setShowToast(true); setTimeout(() => setShowToast(false), 2000) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const tagStyle = (tag: string) => REVIEW_TAG_STYLES[tag] || { color: BG.textSec, bg: BG.surface3, border: BG.border }

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: BG.canvas }}>

      {/* AI Health strip */}
      <div className="flex items-center gap-6 px-6 py-2 shrink-0" style={{ backgroundColor: BG.surface, borderBottom: `1px solid ${BG.border}` }}>
        {[
          { label: 'Aprovação sem correção', value: '68%' },
          { label: 'Fator mais corrigido', value: 'Effort · 41%' },
          { label: 'Fator mais confiável', value: 'Reach · 94%' },
          { label: 'Diretrizes criadas', value: '7' },
        ].map(m => (
          <div key={m.label} className="flex items-center gap-2">
            <span style={{ fontSize: '11px', color: BG.textTer }}>{m.label}</span>
            <span className="font-mono font-semibold" style={{ fontSize: '11px', color: BG.text }}>{m.value}</span>
          </div>
        ))}
        <div className="ml-auto flex items-center gap-3">
          <span style={{ fontSize: '11px', color: BG.textTer }}>J/K navegar · A aprovar · C corrigir</span>
          <span className="font-mono" style={{ fontSize: '11px', color: BG.action, fontWeight: 600 }}>
            {currentIndex + 1} de {totalItems}
          </span>
        </div>
      </div>

      {/* Pattern detection banner */}
      {!patternDismissed && currentIndex === 0 && (
        <div className="mx-6 mt-4 shrink-0 px-4 py-3 rounded-[6px] flex items-start justify-between gap-4" style={{ backgroundColor: 'rgba(77,124,255,0.08)', border: `1px solid ${BG.actionBorder}` }}>
          <div className="flex items-start gap-3">
            <Sparkles size={15} strokeWidth={1.5} style={{ color: BG.action, flexShrink: 0, marginTop: '2px' }} />
            <div>
              <p style={{ fontSize: '12px', color: BG.text, fontWeight: 500, marginBottom: '2px' }}>Padrão detectado</p>
              <p style={{ fontSize: '12px', color: BG.textSec, lineHeight: '1.5' }}>
                Você corrigiu Impact de 2→3 em 3 demandas de conformidade fiscal nos últimos 4 dias.
                Criar diretriz: <em>"Demanda de conformidade fiscal tem Impact mínimo 3"</em>?
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button className="px-3 py-1 rounded-[4px] transition-colors" style={{ fontSize: '12px', fontWeight: 500, backgroundColor: BG.action, color: '#fff' }}>
              Criar diretriz
            </button>
            <button onClick={() => setPatternDismissed(true)} className="px-2 py-1 rounded-[4px]" style={{ fontSize: '12px', color: BG.textSec }}>
              Agora não
            </button>
            <button onClick={() => setPatternDismissed(true)}>
              <X size={13} strokeWidth={1.5} style={{ color: BG.textTer }} />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="px-6 pt-4 pb-3 shrink-0" style={{ borderBottom: `1px solid ${BG.border}` }}>
        <div className="flex items-center gap-3">
          <span className="font-mono" style={{ fontSize: '12px', color: BG.textTer }}>{item.demand.id}</span>
          <PriorityBadge priority={item.demand.priority} />
          {item.tags.map(tag => {
            const ts = tagStyle(tag)
            return (
              <span key={tag} style={{ fontSize: '11px', color: ts.color, backgroundColor: ts.bg, border: `1px solid ${ts.border}`, borderRadius: '4px', padding: '1px 6px' }}>
                {tag}
              </span>
            )
          })}
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => setCurrentIndex(i => Math.max(i - 1, 0))}
              disabled={currentIndex === 0}
              className="px-2 py-1 rounded-[4px] transition-colors"
              style={{ fontSize: '11px', color: BG.textSec, border: `1px solid ${BG.border}`, backgroundColor: BG.surface, opacity: currentIndex === 0 ? 0.4 : 1 }}
            >
              ← K
            </button>
            <button
              onClick={() => setCurrentIndex(i => Math.min(i + 1, REVIEW_ITEMS.length - 1))}
              disabled={currentIndex === REVIEW_ITEMS.length - 1}
              className="px-2 py-1 rounded-[4px] transition-colors"
              style={{ fontSize: '11px', color: BG.textSec, border: `1px solid ${BG.border}`, backgroundColor: BG.surface, opacity: currentIndex === REVIEW_ITEMS.length - 1 ? 0.4 : 1 }}
            >
              J →
            </button>
          </div>
        </div>
        <h2 className="font-semibold mt-1" style={{ fontSize: '15px', color: BG.text }}>{item.demand.title}</h2>
      </div>

      {/* 60/40 content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left 60% */}
        <div className="flex flex-col overflow-y-auto" style={{ width: '60%', borderRight: `1px solid ${BG.border}` }}>
          {/* Report text */}
          <div className="p-5" style={{ borderBottom: `1px solid ${BG.border}` }}>
            <p className="mb-2" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: BG.textTer }}>Relatório refinado</p>
            <p style={{ fontSize: '13px', color: BG.text, lineHeight: '1.7' }}>
              {item.reportText.map((seg, i) =>
                seg.underlined ? (
                  <span
                    key={i}
                    title={seg.inferred ? 'Inferido pela IA — não estava no texto original' : 'Derivado do texto original'}
                    style={{
                      textDecoration: seg.inferred ? 'underline' : 'underline',
                      textDecorationStyle: seg.inferred ? 'dashed' : 'solid',
                      textDecorationColor: seg.inferred ? '#FFA23A' : BG.action,
                      cursor: 'help',
                      color: seg.inferred ? '#FFA23A' : BG.text,
                    }}
                  >
                    {seg.text}
                  </span>
                ) : (
                  <span key={i}>{seg.text}</span>
                )
              )}
            </p>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5">
                <div style={{ width: '14px', height: '2px', borderBottom: `2px solid ${BG.action}` }} />
                <span style={{ fontSize: '10px', color: BG.textTer }}>derivado</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div style={{ width: '14px', height: '2px', borderBottom: `2px dashed #FFA23A` }} />
                <span style={{ fontSize: '10px', color: BG.textTer }}>inferido pela IA</span>
              </div>
            </div>
          </div>

          {/* Factors */}
          <div className="p-5 space-y-2" style={{ borderBottom: `1px solid ${BG.border}` }}>
            <p className="mb-3" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: BG.textTer }}>Fatores RICE</p>
            {item.factors.map(f => (
              <div key={f.name} className="rounded-[6px]" style={{ border: `1px solid ${BG.border}`, backgroundColor: BG.surface }}>
                <div className="flex items-center gap-3 px-4 py-3">
                  <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: BG.textTer, width: '76px' }}>{f.name}</span>
                  <span className="font-mono font-semibold" style={{ fontSize: '14px', color: BG.text, width: '40px' }}>{f.displayValue}</span>
                  {/* Confidence bar */}
                  <div className="flex items-center gap-2 flex-1">
                    <div style={{ flex: 1, height: '4px', backgroundColor: BG.surface2, borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: '2px',
                        width: `${f.conf}%`,
                        backgroundColor: f.conf >= 80 ? '#3DDC97' : f.conf >= 60 ? '#FFD84D' : '#FFA23A',
                      }} />
                    </div>
                    <span className="font-mono" style={{ fontSize: '10px', color: BG.textTer, width: '28px', textAlign: 'right' }}>{f.conf}%</span>
                  </div>
                  {f.inferred && (
                    <span style={{ fontSize: '10px', color: '#FFA23A', backgroundColor: 'rgba(255,162,58,0.10)', border: '1px solid rgba(255,162,58,0.25)', borderRadius: '3px', padding: '1px 5px' }}>
                      ⚠ inferido
                    </span>
                  )}
                  <button
                    onClick={() => setCorrectingFactor(correctingFactor === f.name ? null : f.name)}
                    className="flex items-center gap-1 transition-colors"
                    style={{ fontSize: '11px', color: correctingFactor === f.name ? BG.action : BG.textTer }}
                  >
                    <Edit2 size={11} strokeWidth={1.5} />
                    corrigir
                  </button>
                </div>
                <div className="px-4 pb-2" style={{ color: BG.textTer, fontSize: '11px' }}>{f.justification}</div>
                {correctingFactor === f.name && (
                  <div className="px-4 pb-3 pt-2 space-y-2" style={{ borderTop: `1px solid ${BG.border}`, backgroundColor: BG.surface2 }}>
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: '11px', color: BG.textTer, textDecoration: 'line-through', fontFamily: 'monospace' }}>{f.displayValue}</span>
                      <span style={{ fontSize: '11px', color: BG.textTer }}>→</span>
                      <input
                        autoFocus
                        placeholder="novo valor"
                        className="font-mono"
                        style={{
                          width: '80px', height: '26px', padding: '0 8px', fontSize: '12px',
                          backgroundColor: BG.surface3, border: `1px solid ${BG.actionBorder}`,
                          borderRadius: '4px', color: BG.text, outline: 'none',
                        }}
                      />
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {['bug impede faturamento', 'exige migração', 'dado confirmado pelo cliente'].map(chip => (
                        <button key={chip} className="px-2 py-0.5 rounded-[3px] transition-colors" style={{ fontSize: '11px', color: BG.textSec, backgroundColor: BG.surface3, border: `1px solid ${BG.border}` }}>
                          {chip}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Score breakdown */}
          <div className="p-5">
            <p className="mb-3" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: BG.textTer }}>Como chegou na coluna</p>
            <div className="rounded-[6px] overflow-hidden" style={{ border: `1px solid ${BG.border}` }}>
              {item.scoreBreakdown.map((row, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-4 py-2.5"
                  style={{
                    borderBottom: row.final ? 'none' : `1px solid ${BG.border}`,
                    backgroundColor: row.final ? BG.surface2 : BG.surface,
                  }}
                >
                  <div>
                    <span style={{ fontSize: '12px', color: row.final ? BG.text : BG.textSec, fontWeight: row.final ? 600 : 400 }}>{row.label}</span>
                    {row.detail && <span className="ml-2 font-mono" style={{ fontSize: '11px', color: BG.textTer }}>{row.detail}</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-semibold tabular-nums" style={{ fontSize: '13px', color: row.final ? BG.text : BG.textSec }}>{row.value}</span>
                    {row.final && row.priority && <PriorityBadge priority={row.priority} size="sm" />}
                    {!row.final && (
                      <button style={{ fontSize: '11px', color: BG.textTer }}>discordar</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 40% */}
        <div className="flex flex-col overflow-y-auto" style={{ width: '40%', backgroundColor: BG.surface }}>
          <div className="p-5 flex-1">
            <div className="flex items-center justify-between mb-4">
              <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: BG.textTer }}>Correções nesta demanda</p>
              <span className="font-mono font-bold" style={{ fontSize: '13px', color: corrections.length > 0 ? '#FFA23A' : BG.textTer }}>{corrections.length}</span>
            </div>

            {corrections.length === 0 ? (
              <p style={{ fontSize: '12px', color: BG.textDis, fontStyle: 'italic' }}>Nenhuma correção aplicada.</p>
            ) : (
              <div className="space-y-3 mb-5">
                {corrections.map((c, i) => (
                  <div key={i} className="p-3 rounded-[6px]" style={{ backgroundColor: BG.surface2, border: `1px solid ${BG.border}` }}>
                    <div className="flex items-center gap-2 mb-1">
                      <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: BG.textSec }}>{c.factor}</span>
                      <span className="font-mono" style={{ fontSize: '12px', color: BG.textTer, textDecoration: 'line-through' }}>{c.from}</span>
                      <span style={{ fontSize: '11px', color: BG.textTer }}>→</span>
                      <span className="font-mono font-semibold" style={{ fontSize: '12px', color: '#3DDC97' }}>{c.to}</span>
                    </div>
                    <p style={{ fontSize: '11px', color: BG.textSec }}>{c.reason}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Suggestion field */}
            <div className="mb-5">
              <label className="block mb-2" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: BG.textTer }}>
                Sugestão para o sistema
              </label>
              <textarea
                placeholder={"Quando a demanda cita 'não consigo faturar', trate como Impact 3 automaticamente..."}
                style={{
                  width: '100%', height: '80px', padding: '8px 10px', fontSize: '12px',
                  color: BG.text, backgroundColor: BG.surface3, border: `1px solid ${BG.border}`,
                  borderRadius: '6px', resize: 'none', outline: 'none', fontFamily: 'inherit',
                  lineHeight: '1.5',
                }}
              />
            </div>

            <div className="flex gap-2">
              <button
                className="flex-1 py-2 rounded-[6px] font-semibold transition-colors"
                style={{ fontSize: '13px', backgroundColor: BG.action, color: '#fff' }}
              >
                Aprovar com correções
              </button>
              <button
                className="px-3 py-2 rounded-[6px] transition-colors"
                style={{ fontSize: '13px', color: BG.textSec, border: `1px solid ${BG.border}`, backgroundColor: BG.surface3 }}
              >
                Como está
              </button>
            </div>
            <p className="text-center mt-2" style={{ fontSize: '11px', color: BG.textTer }}>
              Enter aprova e avança · ⌘Z desfaz
            </p>
          </div>
        </div>
      </div>

      {/* Toast */}
      {showToast && (
        <div
          className="fixed bottom-4 right-4 flex items-center gap-2 px-3 py-2 rounded-[6px] z-50"
          style={{ backgroundColor: BG.surface3, border: `1px solid ${BG.border}`, color: BG.text, fontSize: '12px' }}
        >
          <Check size={13} strokeWidth={2.5} style={{ color: '#3DDC97' }} />
          Aprovado como está
        </div>
      )}
    </div>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const NAV_ITEMS: { id: Screen; label: string; icon: React.ReactNode; shortcut: string }[] = [
  { id: 'queue',      label: 'Fila priorizada', icon: <List size={15} strokeWidth={1.5} />,          shortcut: '1' },
  { id: 'new',        label: 'Nova demanda',    icon: <Plus size={15} strokeWidth={1.5} />,          shortcut: '2' },
  { id: 'comparison', label: 'Antes e depois',  icon: <ArrowLeftRight size={15} strokeWidth={1.5} />, shortcut: '3' },
  { id: 'detail',     label: 'Detalhe',         icon: <FileText size={15} strokeWidth={1.5} />,      shortcut: '4' },
  { id: 'dashboard',  label: 'Painel',          icon: <BarChart2 size={15} strokeWidth={1.5} />,     shortcut: '5' },
  { id: 'review',     label: 'Revisão IA',      icon: <ClipboardCheck size={15} strokeWidth={1.5} />, shortcut: '6' },
]

function Sidebar({ screen, onNavigate }: { screen: Screen; onNavigate: (s: Screen) => void }) {
  const pendingReview = 12

  return (
    <div className="shrink-0 flex flex-col h-full" style={{ width: '208px', backgroundColor: BG.canvas, borderRight: `1px solid ${BG.border}` }}>
      {/* Logo */}
      <div className="px-4 py-4" style={{ borderBottom: `1px solid ${BG.border}` }}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 flex items-center justify-center rounded-[4px]" style={{ backgroundColor: BG.action }}>
            <SlidersHorizontal size={13} strokeWidth={2} style={{ color: '#fff' }} />
          </div>
          <span className="font-semibold tracking-tight" style={{ fontSize: '14px', color: BG.text }}>Triagem</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-2 px-2 space-y-0.5">
        {NAV_ITEMS.map(item => {
          const active = screen === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="w-full flex items-center justify-between px-2 py-2 rounded-[4px] text-left transition-colors"
              style={{
                backgroundColor: active ? BG.actionSoft : 'transparent',
                color: active ? BG.action : BG.textSec,
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.backgroundColor = BG.surface2 }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              <div className="flex items-center gap-2.5">
                {item.icon}
                <span style={{ fontSize: '13px', fontWeight: 500 }}>{item.label}</span>
              </div>
              <div className="flex items-center gap-1">
                {item.id === 'review' && pendingReview > 0 && !active && (
                  <span style={{
                    fontSize: '10px', fontWeight: 600, backgroundColor: 'rgba(255,162,58,0.15)',
                    color: '#FFA23A', border: '1px solid rgba(255,162,58,0.3)',
                    borderRadius: '3px', padding: '0 4px', lineHeight: '16px',
                  }}>
                    {pendingReview}
                  </span>
                )}
                <span style={{
                  fontSize: '10px', fontFamily: 'monospace',
                  border: `1px solid ${active ? BG.actionBorder : BG.border}`,
                  color: active ? BG.action : BG.textTer,
                  backgroundColor: active ? BG.actionSoft : BG.surface2,
                  borderRadius: '3px', padding: '1px 4px',
                }}>
                  {item.shortcut}
                </span>
              </div>
            </button>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-4 py-3" style={{ borderTop: `1px solid ${BG.border}` }}>
        <div className="flex items-center gap-1.5" style={{ fontSize: '11px', color: BG.textTer }}>
          <span style={{ fontFamily: 'monospace', border: `1px solid ${BG.border}`, borderRadius: '3px', padding: '1px 5px', fontSize: '10px' }}>⌘K</span>
          <span>Busca rápida</span>
        </div>
        <p style={{ fontSize: '10px', color: BG.textDis, marginTop: '6px' }}>v0.2 · protótipo</p>
      </div>
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<Screen>('queue')
  const [selectedDemand, setSelectedDemand] = useState<Demand>(DEMANDS[0])

  function handleSelectDemand(d: Demand) {
    setSelectedDemand(d)
    setScreen('detail')
  }

  return (
    <div className="flex h-full" style={{ backgroundColor: BG.canvas }}>
      <Sidebar screen={screen} onNavigate={setScreen} />
      <main className="flex-1 overflow-hidden" style={{ backgroundColor: BG.canvas }}>
        {screen === 'queue'      && <QueueScreen onSelectDemand={handleSelectDemand} onNewDemand={() => setScreen('new')} />}
        {screen === 'new'        && <NewDemandScreen />}
        {screen === 'comparison' && <BeforeAfterScreen />}
        {screen === 'detail'     && <DetailScreen demand={selectedDemand} />}
        {screen === 'dashboard'  && <DashboardScreen />}
        {screen === 'review'     && <ReviewScreen />}
      </main>
    </div>
  )
}
