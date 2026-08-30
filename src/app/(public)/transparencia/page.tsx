import type { Metadata } from 'next';
import { getResumoFila, getEvolucaoFila, getFilaPorCRE } from '@/actions/fila-espera';
import { LineChart } from '@/components/charts/line-chart';
import { BarChart } from '@/components/charts/bar-chart';
import { School, Globe, ArrowRight, HeartHandshake, Eye, Users } from 'lucide-react';
import Link from 'next/link';
import { formatNumber, formatPercentRaw } from '@/lib/utils/formatters';

export const metadata: Metadata = {
  title: 'Portal de Transparência | EduRio-Insights',
  description: 'Acompanhe a fila de espera por creche e pré-escola da rede municipal do Rio de Janeiro.'
};

export default async function TransparenciaPage() {
  const resumo = await getResumoFila();
  const evolucao = await getEvolucaoFila();
  const creRaw = await getFilaPorCRE();

  const creChartData = creRaw.map((item) => ({
    label: item.sigla,
    value: item.inscritos
  }));

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />

      {/* Header público */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500">
              <School className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-sm font-bold text-foreground">EduRio-Insights</span>
              <span className="ml-2 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                Acesso Público
              </span>
            </div>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/mapa" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Mapa das Escolas
            </Link>
            <Link href="/login" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all shadow-md shadow-primary/10">
              Área do Gestor
            </Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-6xl px-6 py-12 space-y-10 relative z-10">
        {/* Intro */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-500/20 px-3 py-1 text-xs font-semibold text-primary">
              <Eye className="h-3.5 w-3.5" />
              Transparência Ativa
            </div>
            <h1 className="text-3xl font-bold text-foreground">Fila de Vagas da Rede</h1>
            <p className="text-sm text-muted-foreground max-w-xl">
              Informações consolidadas e em tempo real sobre a fila de espera por vagas de Creche e Pré-Escola.
            </p>
          </div>
          <div className="text-xs text-muted-foreground">
            Mês de referência: Julho/2025 · Atualizado semanalmente
          </div>
        </div>

        {/* Resumo de Metricas */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="glass-card rounded-2xl p-5 space-y-2">
            <span className="text-xs text-muted-foreground font-medium">Inscritos na Fila</span>
            <p className="text-3xl font-bold font-mono text-foreground">{formatNumber(resumo.totalFila)}</p>
            <span className="text-[10px] text-muted-foreground">Crianças aguardando vaga</span>
          </div>
          <div className="glass-card rounded-2xl p-5 space-y-2">
            <span className="text-xs text-muted-foreground font-medium">Vagas Imediatas</span>
            <p className="text-3xl font-bold font-mono text-emerald-400">{formatNumber(resumo.totalVagasDisponiveis)}</p>
            <span className="text-[10px] text-muted-foreground">Disponíveis para alocação</span>
          </div>
          <div className="glass-card rounded-2xl p-5 space-y-2">
            <span className="text-xs text-muted-foreground font-medium">Vagas Atendidas/Mês</span>
            <p className="text-3xl font-bold font-mono text-blue-400">{formatNumber(resumo.vagasLiberadasMes)}</p>
            <span className="text-[10px] text-muted-foreground">Chamados no último mês</span>
          </div>
          <div className="glass-card rounded-2xl p-5 space-y-2">
            <span className="text-xs text-muted-foreground font-medium">Taxa de Atendimento</span>
            <p className="text-3xl font-bold font-mono text-amber-400">{formatPercentRaw(resumo.taxaAtendimento)}</p>
            <span className="text-[10px] text-muted-foreground">Mensal de liberação</span>
          </div>
        </div>

        {/* Graficos */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Evolução da fila */}
          <div className="glass-card rounded-2xl p-6 flex flex-col">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-foreground">Evolução Histórica da Fila</h3>
              <p className="text-xs text-muted-foreground">Inscritos ao longo dos meses por segmento</p>
            </div>
            <div className="h-[300px] w-full">
              <LineChart
                data={evolucao}
                xKey="mes"
                series={[
                  { key: 'Creche', name: 'Creche', color: '#3B82F6' },
                  { key: 'PreEscola', name: 'Pré-Escola', color: '#10B981' }
                ]}
                valueType="number"
              />
            </div>
          </div>

          {/* Distribuição por CRE */}
          <div className="glass-card rounded-2xl p-6 flex flex-col">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-foreground">Demanda por Região (CRE)</h3>
              <p className="text-xs text-muted-foreground">Inscritos totais aguardando vaga por região administrativa</p>
            </div>
            <div className="h-[300px] w-full">
              <BarChart
                data={creChartData}
                valueType="number"
              />
            </div>
          </div>
        </div>

        {/* Como participar / Rodapé */}
        <div className="glass-card rounded-2xl p-8 border-l-4 border-emerald-500/40 bg-emerald-500/5 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2 justify-center sm:justify-start">
              <HeartHandshake className="h-5 w-5 text-emerald-400" />
              Precisa de ajuda ou deseja realizar inscrição?
            </h3>
            <p className="text-xs text-muted-foreground max-w-xl">
              As inscrições para a rede pública municipal do Rio de Janeiro ocorrem durante períodos específicos. Acesse o portal oficial Rioeduca ou ligue para a Central 1746.
            </p>
          </div>
          <a
            href="https://rioeduca.rio.rj.gov.br/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-emerald-500/10 hover:shadow-xl transition-all hover:scale-[1.02] shrink-0"
          >
            Acessar Rioeduca
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </main>
    </div>
  );
}
