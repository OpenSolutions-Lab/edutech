'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { EscolaDetalhada } from '@/actions/escola-details';
import { KPICard } from '@/components/charts/kpi-card';
import { LineChart } from '@/components/charts/line-chart';
import { BarChart } from '@/components/charts/bar-chart';
import { FormattedMarkdown } from '@/components/ui/formatted-markdown';
import {
  formatCurrency,
  formatNumber,
  formatPercentRaw,
  formatRiskLevel
} from '@/lib/utils/formatters';
import {
  School,
  MapPin,
  Users,
  AlertTriangle,
  TrendingDown,
  BookOpen,
  Utensils,
  DollarSign,
  CheckCircle2,
  Building2,
  Thermometer,
  Calendar,
  ArrowLeft,
  Download,
  Sparkles,
  ShieldAlert,
  Brain,
  ExternalLink,
  FileText,
  Clock,
  UserCheck,
  AlertCircle
} from 'lucide-react';

interface EscolaProfileViewProps {
  escola: EscolaDetalhada;
}

export function EscolaProfileView({ escola }: EscolaProfileViewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'ai' | 'rh' | 'budget'>('overview');
  const riskInfo = formatRiskLevel(escola.score_risco);

  const riskBadgeStyles: Record<string, string> = {
    critico: 'bg-red-500/15 border-red-500/30 text-red-400',
    alto: 'bg-orange-500/15 border-orange-500/30 text-orange-400',
    moderado: 'bg-yellow-500/15 border-yellow-500/30 text-yellow-400',
    baixo: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
  };

  const percentualExecucaoOrcamentaria = Math.min(
    100,
    parseFloat(((escola.valor_pago / (escola.valor_empenhado || 1)) * 100).toFixed(1))
  );

  const carenciasData = [
    { label: 'Português', value: escola.carencias.portugues },
    { label: 'Matemática', value: escola.carencias.matematica },
    { label: 'Ciências', value: escola.carencias.ciencias },
    { label: 'Inglês', value: escola.carencias.ingles },
    { label: 'Edu. Física', value: escola.carencias.educacao_fisica },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Navigation Breadcrumb & Back */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao Painel Executivo
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href={`/geo/mapa`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted/50 transition-colors"
          >
            <MapPin className="h-3.5 w-3.5 text-primary" />
            Ver no Mapa
          </Link>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-3.5 py-2 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            Exportar Ficha PDF
          </button>
        </div>
      </div>

      {/* Header Banner da Unidade */}
      <div className="glass-card relative overflow-hidden rounded-3xl p-6 md:p-8 border border-border">
        {/* Subtle background glow based on risk level */}
        <div
          className={`absolute -right-20 -top-20 h-64 w-64 rounded-full blur-3xl opacity-20 pointer-events-none ${
            escola.nivel_risco === 'critico'
              ? 'bg-red-500'
              : escola.nivel_risco === 'alto'
              ? 'bg-orange-500'
              : 'bg-emerald-500'
          }`}
        />

        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                <School className="h-3.5 w-3.5" />
                {escola.tipo}
              </span>
              <span className="inline-flex items-center gap-1 rounded-lg bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                {`${escola.cre_id}ª CRE`}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-bold ${
                  riskBadgeStyles[escola.nivel_risco]
                }`}
              >
                <AlertCircle className="h-3.5 w-3.5" />
                Risco de Abandono: {riskInfo.label} ({(escola.score_risco * 100).toFixed(1)}%)
              </span>
            </div>

            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
                {escola.nome}
              </h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground/70" />
                  {escola.endereco_completo}
                </span>
                <span className="font-semibold text-foreground/80">
                  Bairro: {escola.bairro_nome} (IDH: {escola.idh_bairro.toFixed(3)})
                </span>
              </div>
            </div>
          </div>

          {/* Mini Quick Summary Pill */}
          <div className="flex flex-wrap gap-4 rounded-2xl bg-muted/20 p-4 border border-border/50">
            <div className="text-center px-3">
              <span className="block text-xs text-muted-foreground font-medium">Matrículas</span>
              <span className="text-lg font-bold font-mono text-foreground">
                {formatNumber(escola.total_matriculas)}
              </span>
            </div>
            <div className="h-8 w-px bg-border my-auto" />
            <div className="text-center px-3">
              <span className="block text-xs text-muted-foreground font-medium">Taxa Evasão</span>
              <span
                className={`text-lg font-bold font-mono ${
                  escola.taxa_evasao > 4 ? 'text-red-400' : 'text-emerald-400'
                }`}
              >
                {formatPercentRaw(escola.taxa_evasao)}
              </span>
            </div>
            <div className="h-8 w-px bg-border my-auto" />
            <div className="text-center px-3">
              <span className="block text-xs text-muted-foreground font-medium">Carência RH</span>
              <span
                className={`text-lg font-bold font-mono ${
                  escola.carencia_total > 0 ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                {escola.carencia_total} profs
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          titulo="Total de Matrículas"
          valor={formatNumber(escola.total_matriculas)}
          delta={{ value: `Capacidade: ${escola.capacidade_maxima}`, isPositive: true, direction: "up" }}
          iconName="graduation-cap"
          gradiente="from-blue-600 to-cyan-500"
        />
        <KPICard
          titulo="Taxa de Evasão Atual"
          valor={formatPercentRaw(escola.taxa_evasao)}
          delta={{ value: `Risco ${(escola.score_risco * 100).toFixed(0)}%`, isPositive: escola.taxa_evasao < 3, direction: escola.taxa_evasao > 3 ? "up" : "down" }}
          iconName="trending-down"
          gradiente={escola.taxa_evasao > 4 ? "from-red-500 to-rose-400" : "from-emerald-500 to-teal-400"}
        />
        <KPICard
          titulo="Taxa de Aprovação"
          valor={formatPercentRaw(escola.taxa_aprovacao)}
          delta={{ value: `Reprovação: ${formatPercentRaw(escola.taxa_reprovacao)}`, isPositive: escola.taxa_aprovacao >= 80, direction: "up" }}
          iconName="check-circle"
          gradiente="from-violet-600 to-purple-500"
        />
        <KPICard
          titulo="Custo por Aluno/Ano"
          valor={formatCurrency(escola.gasto_por_aluno)}
          delta={{ value: `Execução ${percentualExecucaoOrcamentaria}%`, isPositive: true, direction: "up" }}
          iconName="dollar-sign"
          gradiente="from-amber-500 to-orange-400"
        />
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-border space-x-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'overview'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          Visão Geral & Indicadores
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`flex items-center gap-2 pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'ai'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Brain className="h-4 w-4 text-violet-400" />
          Diagnóstico IA & Prevenção
        </button>
        <button
          onClick={() => setActiveTab('rh')}
          className={`flex items-center gap-2 pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'rh'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Users className="h-4 w-4 text-amber-400" />
          Quadro de Pessoal & RH ({escola.carencia_total})
        </button>
        <button
          onClick={() => setActiveTab('budget')}
          className={`flex items-center gap-2 pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'budget'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <DollarSign className="h-4 w-4 text-emerald-400" />
          Execução Orçamentária & Merenda
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Historical Trend Chart */}
            <div className="glass-card lg:col-span-2 rounded-2xl p-6 flex flex-col">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-foreground">Série Histórica (2021 - 2025)</h3>
                <p className="text-xs text-muted-foreground">Evolução de Matrículas e Taxas de Evasão / Aprovação escolar</p>
              </div>
              <div className="h-[300px] w-full">
                <LineChart
                  data={escola.historico}
                  xKey="ano"
                  series={[
                    { key: 'taxa_evasao', name: 'Taxa de Evasão (%)', color: '#EF4444' },
                    { key: 'taxa_aprovacao', name: 'Taxa de Aprovação (%)', color: '#10B981' }
                  ]}
                  valueType="percentRaw"
                />
              </div>
            </div>

            {/* School Technical Profile Card */}
            <div className="glass-card rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Ficha Técnica do Prédio
              </h3>

              <div className="divide-y divide-border text-sm">
                <div className="py-2.5 flex justify-between">
                  <span className="text-muted-foreground">Tipologia Predial</span>
                  <span className="font-medium text-foreground text-right">{escola.tipologia_predial}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-muted-foreground">Ano de Construção</span>
                  <span className="font-medium text-foreground">{escola.ano_construcao}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-muted-foreground">Capacidade Máxima</span>
                  <span className="font-medium text-foreground">{escola.capacidade_maxima} alunos</span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-muted-foreground">Climatização Integral</span>
                  <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                    escola.ar_condicionado ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                  }`}>
                    <Thermometer className="h-3.5 w-3.5" />
                    {escola.ar_condicionado ? 'Climatizada' : 'Sem Ar Condicionado'}
                  </span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-muted-foreground">Distorção Idade-Série</span>
                  <span className="font-mono font-bold text-amber-400">{escola.distorcao_idade_serie.toFixed(1)}%</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-muted-foreground">Status Operacional</span>
                  <span className="font-semibold text-emerald-400 capitalize">{escola.status}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Rendimento e Desempenho Interno */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="glass-card rounded-2xl p-5 border border-border">
              <span className="text-xs font-semibold text-muted-foreground">Total Aprovados</span>
              <div className="mt-1 text-2xl font-bold font-mono text-emerald-400">
                {formatNumber(escola.total_aprovados)}
              </div>
              <span className="text-xs text-muted-foreground mt-1 block">
                {((escola.total_aprovados / (escola.total_matriculas || 1)) * 100).toFixed(1)}% do corpo discente
              </span>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-border">
              <span className="text-xs font-semibold text-muted-foreground">Total Reprovados</span>
              <div className="mt-1 text-2xl font-bold font-mono text-amber-400">
                {formatNumber(escola.total_reprovados)}
              </div>
              <span className="text-xs text-muted-foreground mt-1 block">
                {((escola.total_reprovados / (escola.total_matriculas || 1)) * 100).toFixed(1)}% do corpo discente
              </span>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-border">
              <span className="text-xs font-semibold text-muted-foreground">Evadidos Acumulados</span>
              <div className="mt-1 text-2xl font-bold font-mono text-red-400">
                {formatNumber(escola.total_evadidos)}
              </div>
              <span className="text-xs text-muted-foreground mt-1 block">
                Foco prioritário de busca ativa
              </span>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-border">
              <span className="text-xs font-semibold text-muted-foreground">Transferidos</span>
              <div className="mt-1 text-2xl font-bold font-mono text-cyan-400">
                {formatNumber(escola.total_transferidos)}
              </div>
              <span className="text-xs text-muted-foreground mt-1 block">
                Fluxo de mobilidade escolar
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Diagnóstico de IA */}
      {activeTab === 'ai' && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main AI Diagnostic Report */}
            <div className="glass-card lg:col-span-2 rounded-2xl p-6 space-y-4 border border-violet-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-violet-400" />
                  <h3 className="text-lg font-bold text-foreground">Análise IA Contextual (Anthropic Claude)</h3>
                </div>
                <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-400 border border-violet-500/30">
                  Modelo Ativo
                </span>
              </div>

              <div className="rounded-xl bg-muted/20 p-5 border border-border/50">
                <FormattedMarkdown content={escola.analise_ia || "Carregando diagnóstico preditivo..."} />
              </div>

              {/* Recomendações da IA */}
              <div className="space-y-3 pt-2">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  Plano de Ação Recomendado
                </h4>
                <div className="grid gap-2">
                  {escola.recomendacoes.map((rec, i) => (
                    <div key={i} className="flex items-start gap-2.5 rounded-xl bg-card p-3 text-xs text-muted-foreground border border-border/60">
                      <span className="font-bold text-primary font-mono">{i + 1}.</span>
                      <span className="text-foreground">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Risk Factors Breakdown */}
            <div className="glass-card rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-red-400" />
                Vetor de Fatores de Risco
              </h3>
              <p className="text-xs text-muted-foreground">
                Pesos relativos dos indicadores para o cálculo do score de { (escola.score_risco * 100).toFixed(1) }%
              </p>

              <div className="space-y-3">
                {escola.fatores_contribuintes.map((fator, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-foreground">{fator.nome}</span>
                      <span className="font-mono font-bold text-primary">
                        {(fator.contribuicao * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet-500 to-primary rounded-full"
                        style={{ width: `${Math.min(100, fator.contribuicao * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-xl bg-amber-500/10 p-4 border border-amber-500/20 text-xs text-amber-300">
                <strong>Alerta de Intervenção:</strong> A equipe psicossocial da {`${escola.cre_id}ª CRE`} deve acionar a Busca Ativa escolar nas famílias em situação de vulnerabilidade extrema.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: RH / Quadro de Pessoal */}
      {activeTab === 'rh' && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="glass-card rounded-2xl p-5 border border-border">
              <span className="text-xs font-semibold text-muted-foreground">Docentes Ativos</span>
              <div className="mt-1 text-2xl font-bold font-mono text-foreground">
                {escola.total_professores}
              </div>
              <span className="text-xs text-muted-foreground mt-1 block">
                {escola.professores_efetivos} efetivos · {escola.professores_contratados} contratados
              </span>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-border">
              <span className="text-xs font-semibold text-muted-foreground">Carência Total de RH</span>
              <div className={`mt-1 text-2xl font-bold font-mono ${escola.carencia_total > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {escola.carencia_total} vagas
              </div>
              <span className="text-xs text-muted-foreground mt-1 block">
                Déficit acumulado nas turmas
              </span>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-border">
              <span className="text-xs font-semibold text-muted-foreground">Taxa de Assiduidade</span>
              <div className="mt-1 text-2xl font-bold font-mono text-emerald-400">
                {escola.taxa_presenca_media}%
              </div>
              <span className="text-xs text-muted-foreground mt-1 block">
                Frequência média do quadro
              </span>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Chart: Carências por Disciplina */}
            <div className="glass-card rounded-2xl p-6 flex flex-col">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-foreground">Déficit por Disciplina</h3>
                <p className="text-xs text-muted-foreground">Necessidade imediata de convocação ou remanejamento de professores</p>
              </div>
              <div className="h-[280px] w-full">
                <BarChart
                  data={carenciasData}
                  valueType="number"
                />
              </div>
            </div>

            {/* Action Card for RH */}
            <div className="glass-card rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-amber-400" />
                Gestão de Vagas & Remanejamento
              </h3>
              <p className="text-sm text-muted-foreground">
                Solicite convocação rápida de banco de concursados ou remanejamento de carga horária temporária via Coordenadoria Regional.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between rounded-xl bg-card p-3 text-xs border border-border">
                  <span>Professor de Português (40h)</span>
                  <span className="font-bold text-red-400 font-mono">Déficit: {escola.carencias.portugues}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-card p-3 text-xs border border-border">
                  <span>Professor de Matemática (40h)</span>
                  <span className="font-bold text-red-400 font-mono">Déficit: {escola.carencias.matematica}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-card p-3 text-xs border border-border">
                  <span>Professor de Ciências (22h)</span>
                  <span className="font-bold font-mono text-amber-400">Déficit: {escola.carencias.ciencias}</span>
                </div>
              </div>

              <button className="w-full rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                Abrir Chamado de Alocação RH no SMRH
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Orçamento & Merenda */}
      {activeTab === 'budget' && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="glass-card rounded-2xl p-5 border border-border">
              <span className="text-xs font-semibold text-muted-foreground">Valor Empenhado (2025)</span>
              <div className="mt-1 text-2xl font-bold font-mono text-foreground">
                {formatCurrency(escola.valor_empenhado)}
              </div>
              <span className="text-xs text-muted-foreground mt-1 block">
                Orçamento de manutenção alocado
              </span>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-border">
              <span className="text-xs font-semibold text-muted-foreground">Valor Pago</span>
              <div className="mt-1 text-2xl font-bold font-mono text-emerald-400">
                {formatCurrency(escola.valor_pago)}
              </div>
              <span className="text-xs text-muted-foreground mt-1 block">
                {percentualExecucaoOrcamentaria}% de execução financeira
              </span>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-border">
              <span className="text-xs font-semibold text-muted-foreground">Refeições / Dia (Merenda)</span>
              <div className="mt-1 text-2xl font-bold font-mono text-cyan-400">
                {formatNumber(escola.refeicoes_diarias)}
              </div>
              <span className="text-xs text-muted-foreground mt-1 block">
                Custo mensal est.: {formatCurrency(escola.custo_mensal_merenda)}
              </span>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Utensils className="h-5 w-5 text-cyan-400" />
              Dimensionamento de Merenda Escolar
            </h3>
            <p className="text-xs text-muted-foreground">
              Previsão de insumos baseada na assiduidade histórica de {escola.taxa_presenca_media}% e total de {escola.total_matriculas} alunos.
            </p>

            <div className="grid gap-4 md:grid-cols-3 pt-2">
              <div className="rounded-xl bg-card p-4 border border-border">
                <span className="text-xs text-muted-foreground">Refeições Estimadas/Mês</span>
                <span className="block text-xl font-bold font-mono text-foreground mt-1">
                  {formatNumber(escola.refeicoes_diarias * 22)}
                </span>
              </div>
              <div className="rounded-xl bg-card p-4 border border-border">
                <span className="text-xs text-muted-foreground">Custo por Refeição</span>
                <span className="block text-xl font-bold font-mono text-emerald-400 mt-1">
                  {formatCurrency(escola.custo_mensal_merenda / (escola.refeicoes_diarias * 22 || 1))}
                </span>
              </div>
              <div className="rounded-xl bg-card p-4 border border-border">
                <span className="text-xs text-muted-foreground">Status do Estoque</span>
                <span className="block text-xl font-bold font-mono text-emerald-400 mt-1">
                  Regular
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
