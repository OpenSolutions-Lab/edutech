import type { Metadata } from 'next';
import Link from 'next/link';
import { KPICard } from '@/components/charts/kpi-card';
import { BarChart } from '@/components/charts/bar-chart';
import { AreaChart } from '@/components/charts/area-chart';
import {
  getKPIsConsolidadosCreche,
  getFilaPorCRE,
  getEvolucaoInscricoesCreche,
  getTopCrechesPressao,
  getIndicadoresFilaGestao,
} from '@/actions/dashboard-kpis';
import {
  formatNumber,
  formatPercentRaw,
} from '@/lib/utils/formatters';
import { AlertCircle, ArrowRight, Baby, Building, Layers, Sparkles, UserCheck, ShieldAlert, Compass, Clock, PhoneCall, UserX } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Painel Executivo | EduTech Creche',
  description: 'Visão executiva da gestão de vagas de creche da rede municipal de educação do Rio de Janeiro.'
};

export default async function DashboardPage() {
  const kpis = await getKPIsConsolidadosCreche();
  const filaPorCreRaw = await getFilaPorCRE();
  const evolucaoRaw = await getEvolucaoInscricoesCreche();
  const topCreches = await getTopCrechesPressao();
  const indicadoresFila = await getIndicadoresFilaGestao();

  // Dados para o gráfico de Fila por CRE
  const filaChartData = filaPorCreRaw.map((item) => ({
    label: item.sigla,
    value: item.total_fila
  }));

  // Dados para o gráfico de evolução da série histórica
  const evolucaoChartData = evolucaoRaw.map((item) => ({
    label: String(item.ano),
    value: item.total_inscritos
  }));

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Título Principal */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Baby className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">
            Painel Executivo — EduTech Creche (0 a 3 Anos)
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Inteligência na Inscrição e Gestão de Vagas da Educação Infantil (SME-Rio) · Dados Reais Anonimizados 2021–2025
        </p>
      </div>

      {/* Banner Principal de Destaque - Match Perfeito & Creches (Azul Oficial SME Rio) */}
      <div className="rounded-2xl border border-[#003963] bg-gradient-to-r from-[#004A80] via-[#00508A] to-[#0077C8] p-6 shadow-xl space-y-4 text-white">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 text-xs font-bold text-white mb-2 border border-white/20 backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              SME-Rio Match Perfeito (0 a 3 anos e 11 meses)
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              Inteligência Territorial & Desobstrução da Fila de Creches por CPF
            </h2>
            <p className="text-xs text-blue-100 mt-1 max-w-3xl leading-relaxed">
              Análise empírica dos 5 processos seletivos (837.179 opções). Em 2025, <strong className="text-emerald-300 font-bold">3.935 crianças</strong> seguravam <strong className="text-amber-200 font-bold">12.498 vagas simultâneas</strong>. O motor de Fila Viva e cascata desobstrui <strong className="text-cyan-200 font-bold">~8.563 vagas</strong> e reduz o tempo de atendimento das famílias.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5 shrink-0">
            <Link
              href="/creche/gestao-fila"
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 text-slate-950 hover:bg-cyan-300 px-4 py-2.5 text-xs font-extrabold shadow-md transition"
            >
              <UserCheck className="h-4 w-4" />
              Gestão de Fila (Fila Viva)
            </Link>
            <Link
              href="/creche/mapa"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 text-white hover:bg-white/20 px-4 py-2.5 text-xs font-bold transition"
            >
              Mapa Oferta × Demanda
            </Link>
            <Link
              href="/creche/duplicidade"
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/40 bg-emerald-500/20 text-emerald-200 px-4 py-2.5 text-xs font-bold transition hover:bg-emerald-500/30"
            >
              Motor CPF Gale-Shapley
            </Link>
          </div>
        </div>
      </div>

      {/* Grid de KPIs de Creche */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          titulo="Unidades Creche & EDI"
          valor={formatNumber(kpis.totalCrechesEdis)}
          iconName="school"
          gradiente="from-[#00508A] to-[#00C0F3]"
        />
        <KPICard
          titulo="Bebês Atendidos (0-3a)"
          valor={formatNumber(kpis.totalCriancasAtendidas)}
          delta={{ value: "+8,2%", isPositive: true, direction: "up" }}
          iconName="baby"
          gradiente="from-emerald-600 to-teal-500"
        />
        <KPICard
          titulo="Fila de Espera Unificada (CPF)"
          valor={formatNumber(kpis.totalCriancasFilaCPF)}
          delta={{ value: "-32% por CPF", isPositive: true, direction: "down" }}
          iconName="user-check"
          gradiente="from-amber-600 to-orange-500"
        />
        <KPICard
          titulo="Vagas Liberadas por CPF"
          valor={formatNumber(kpis.vagasDesbloqueaveisCPF)}
          delta={{ value: "+68.5% giro", isPositive: true, direction: "up" }}
          iconName="unlock"
          gradiente="from-sky-600 to-cyan-500"
        />
      </div>

      {/* BLOCO DE DESTAQUE: 3 INDICADORES DO GERENCIADOR DE FILA VIVA */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-md space-y-6 text-card-foreground">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-0.5 text-xs font-bold text-primary mb-1 border border-primary/20">
              <UserCheck className="w-3.5 h-3.5" />
              Indicadores de Convocação & Eficiência Operacional
            </div>
            <h2 className="text-xl font-extrabold text-foreground tracking-tight">
              Gerenciador de Fila Viva — Indicadores por Unidade Escolar
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Métricas consolidadas a partir do motor operacional de contato e cascata de vagas
            </p>
          </div>
          <Link
            href="/creche/gestao-fila"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:opacity-90 shadow-md transition shrink-0"
          >
            Acessar Gestão de Fila Operacional
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* 3 CARDS DE INDICADORES */}
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Indicador 1 */}
          <div className="rounded-xl p-5 border border-sky-500/30 bg-sky-50 dark:bg-sky-950/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-700 dark:text-sky-300 uppercase tracking-wider">Indicador 1</span>
              <Clock className="h-5 w-5 text-sky-600 dark:text-sky-400" />
            </div>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Tempo Médio de Fila na Unidade Escolar</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-foreground">{kpis.tempoMedioFilaDias}</span>
              <span className="text-xs font-bold text-sky-700 dark:text-sky-300">dias corridos</span>
            </div>
            <p className="text-[11px] text-muted-foreground pt-1 border-t border-border/40">
              Média de tempo da inscrição até a convocação e aceite na creche.
            </p>
          </div>

          {/* Indicador 2 */}
          <div className="rounded-xl p-5 border border-rose-500/30 bg-rose-50 dark:bg-rose-950/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider">Indicador 2</span>
              <UserX className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            </div>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Crianças Não Contactadas (Perdidos)</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-foreground">{formatNumber(kpis.totalCriancasNaoContactadas)}</span>
              <span className="text-xs font-bold text-rose-700 dark:text-rose-300">alunos / prazo estourado</span>
            </div>
            <p className="text-[11px] text-muted-foreground pt-1 border-t border-border/40">
              Total de cadastros cancelados automaticamente por passar de 3 dias úteis.
            </p>
          </div>

          {/* Indicador 3 */}
          <div className="rounded-xl p-5 border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">Indicador 3</span>
              <PhoneCall className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Média de Contatos por Aluno</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-foreground">{kpis.mediaTentativasContatoAluno}</span>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">tentativas / aluno</span>
            </div>
            <p className="text-[11px] text-muted-foreground pt-1 border-t border-border/40">
              Número médio de tentativas telefônicas realizadas até o desfecho.
            </p>
          </div>
        </div>

        {/* TABELA DISCRIMINADA DOS 3 INDICADORES POR UNIDADE ESCOLAR */}
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-bold text-foreground">Detalhamento dos Indicadores por Unidade Escolar Monitorada</h3>
          <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-xs">
            <table className="w-full text-left text-xs text-muted-foreground">
              <thead className="bg-muted/80 text-[11px] uppercase text-muted-foreground border-b border-border">
                <tr>
                  <th className="py-3 px-4 font-bold text-foreground">Unidade Escolar (Creche / EDI)</th>
                  <th className="py-3 px-4 font-bold">CRE / Bairro</th>
                  <th className="py-3 px-4 font-bold">Fila / Vagas</th>
                  <th className="py-3 px-4 font-bold text-sky-700 dark:text-sky-300">1. Tempo Médio Fila</th>
                  <th className="py-3 px-4 font-bold text-rose-700 dark:text-rose-300">2. Crianças Não Contactadas</th>
                  <th className="py-3 px-4 font-bold text-emerald-700 dark:text-emerald-300">3. Média Contatos/Aluno</th>
                  <th className="py-3 px-4 font-bold text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {indicadoresFila.unidades.map((u) => (
                  <tr key={u.unidade_id} className="hover:bg-muted/10 transition-colors">
                    <td className="py-3 px-4 font-bold text-foreground">{u.unidade_nome}</td>
                    <td className="py-3 px-4">{u.cre_sigla} · {u.bairro}</td>
                    <td className="py-3 px-4 font-mono font-semibold">{u.vagas_ocupadas}/{u.total_vagas} ocupadas</td>
                    <td className="py-3 px-4 font-mono font-bold text-blue-400">{u.tempo_medio_fila_dias} dias</td>
                    <td className="py-3 px-4 font-mono font-bold text-rose-400">{u.criancas_nao_contactadas_perdidos} perdidos</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400">{u.media_contatos_por_aluno} tentativas</td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href="/creche/gestao-fila"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
                      >
                        Operar Fila
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* KPIs Secundários de Creche */}
      <div className="grid gap-4 sm:grid-cols-3">
        <KPICard
          titulo="Multi-Inscrições Ativas"
          valor={formatNumber(kpis.criancasMultiInscricao)}
          delta={{ value: "3,18 vagas/criança", isPositive: false, direction: "up" }}
          iconName="layers"
          gradiente="from-rose-600 to-red-500"
        />
        <KPICard
          titulo="Ganho Distância Caminhada"
          valor="-78.5%"
          delta={{ value: "0,8km vs 3,8km", isPositive: true, direction: "down" }}
          iconName="compass"
          gradiente="from-cyan-500 to-blue-500"
        />
        <KPICard
          titulo="Unidades em Pressão Crítica"
          valor={formatNumber(kpis.unidadesPressaoCritica)}
          delta={{ value: "Fila concentrada", isPositive: false, direction: "up" }}
          iconName="alert-triangle"
          gradiente="from-amber-600 to-rose-500"
        />
      </div>

      {/* Gráficos de Creche */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Fila de Espera por CRE */}
        <div className="glass-card flex flex-col rounded-2xl p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-foreground">Fila de Espera por CRE (Creches 2025)</h3>
              <p className="text-xs text-muted-foreground">Concentração territorial de demanda por vagas de 0 a 3 anos</p>
            </div>
            <Badge variant="outline" className="text-xs border-primary/30 text-primary">
              7ª CRE (Anil/JPA) no topo
            </Badge>
          </div>
          <div className="h-[320px] w-full">
            <BarChart
              data={filaChartData}
              valueType="number"
            />
          </div>
        </div>

        {/* Evolução de Inscrições em Creche */}
        <div className="glass-card flex flex-col rounded-2xl p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-foreground">Evolução de Inscrições em Creche (2021-2025)</h3>
              <p className="text-xs text-muted-foreground">Série histórica de solicitações de vagas da 1ª Infância</p>
            </div>
            <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-400">
              +10.9% em 2024/25
            </Badge>
          </div>
          <div className="h-[320px] w-full">
            <AreaChart
              data={evolucaoChartData}
              valueType="number"
              gradientColor="#10B981"
            />
          </div>
        </div>
      </div>

      {/* Top Unidades de Creche em Pressão Crítica */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-foreground">Creches Municipais & EDIs em Pressão Crítica de Fila</h3>
            <p className="text-xs text-muted-foreground">Monitoramento das unidades com maior retenção de opções por CPF e alta densidade de demanda</p>
          </div>
          <Link
            href="/creche/mapa"
            className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
          >
            Ver no Mapa Oferta × Demanda
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-muted-foreground">
            <thead className="text-xs uppercase text-muted-foreground/75 border-b border-border">
              <tr>
                <th className="py-3 px-4 font-semibold">Nome da Creche / EDI</th>
                <th className="py-3 px-4 font-semibold">Bairro</th>
                <th className="py-3 px-4 font-semibold">CRE</th>
                <th className="py-3 px-4 font-semibold">Tipo</th>
                <th className="py-3 px-4 font-semibold">Fila em Espera</th>
                <th className="py-3 px-4 font-semibold">Pressão ML (IPDF)</th>
                <th className="py-3 px-4 font-semibold text-right">Status da Fila</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {topCreches.map((creche) => (
                <tr key={creche.id} className="group hover:bg-muted/5 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-foreground">
                    <Link href="/creche/mapa" className="hover:underline hover:text-primary transition-colors font-bold text-white">
                      {creche.nome}
                    </Link>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-300">{creche.bairro}</td>
                  <td className="py-3.5 px-4 font-medium">{creche.cre_id}ª CRE</td>
                  <td className="py-3.5 px-4">{creche.tipo}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-rose-400">
                    {creche.candidatos_na_fila} crianças
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">
                    {(creche.ipdf_score * 100).toFixed(1)}%
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {creche.status_fila}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
