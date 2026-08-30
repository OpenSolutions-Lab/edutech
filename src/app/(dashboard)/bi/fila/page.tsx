import type { Metadata } from 'next';
import { getResumoFila, getEvolucaoFila, getFilaPorCRE } from '@/actions/fila-espera';
import { LineChart } from '@/components/charts/line-chart';
import { BarChart } from '@/components/charts/bar-chart';
import { KPICard } from '@/components/charts/kpi-card';
import { AlertCircle, Clock, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { formatNumber, formatPercentRaw } from '@/lib/utils/formatters';

export const metadata: Metadata = {
  title: 'Fila de Espera',
  description: 'Análise gerencial da fila de vagas da rede municipal.'
};

export default async function FilaPage() {
  const resumo = await getResumoFila();
  const evolucao = await getEvolucaoFila();
  const creRaw = await getFilaPorCRE();

  const creChartData = creRaw.map((item) => ({
    label: item.sigla,
    value: item.inscritos
  }));

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground">Fila de Espera</h1>
        <p className="text-sm text-muted-foreground">
          Análise e projeção de demanda por vagas de educação infantil (Creche e Pré-Escola)
        </p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          titulo="Total na Fila"
          valor={formatNumber(resumo.totalFila)}
          delta={{ value: "+3,2%", isPositive: false, direction: "up" }}
          iconName="users"
          gradiente="from-red-600 to-orange-500"
        />
        <KPICard
          titulo="Vagas Disponíveis"
          valor={formatNumber(resumo.totalVagasDisponiveis)}
          iconName="school"
          gradiente="from-blue-600 to-cyan-500"
        />
        <KPICard
          titulo="Atendimentos no Mês"
          valor={formatNumber(resumo.vagasLiberadasMes)}
          delta={{ value: "+12%", isPositive: true, direction: "up" }}
          iconName="clock"
          gradiente="from-emerald-500 to-teal-400"
        />
        <KPICard
          titulo="Taxa de Atendimento"
          valor={formatPercentRaw(resumo.taxaAtendimento)}
          delta={{ value: "+0.5%", isPositive: true, direction: "up" }}
          iconName="trending-down"
          gradiente="from-amber-500 to-orange-400"
        />
      </div>

      {/* Graficos */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Evolução da fila */}
        <div className="glass-card rounded-2xl p-6 flex flex-col">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-foreground">Projeção da Fila de Espera</h3>
            <p className="text-xs text-muted-foreground">Evolução de inscritos por segmento escolar</p>
          </div>
          <div className="h-[320px] w-full">
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
            <h3 className="text-lg font-bold text-foreground">Déficit de Vagas por CRE</h3>
            <p className="text-xs text-muted-foreground">Total de inscrições ativas aguardando alocação</p>
          </div>
          <div className="h-[320px] w-full">
            <BarChart
              data={creChartData}
              valueType="number"
            />
          </div>
        </div>
      </div>

      {/* Tabela Comparativa de CREs */}
      <div className="glass-card rounded-2xl p-6">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-foreground">Distribuição de Demanda por Coordenadoria (CRE)</h3>
          <p className="text-xs text-muted-foreground">Visão tabular do déficit de vagas e vagas ativas por região</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-muted-foreground">
            <thead className="text-xs uppercase text-muted-foreground/75 border-b border-border">
              <tr>
                <th className="py-3 px-4 font-semibold">Coordenadoria</th>
                <th className="py-3 px-4 font-semibold text-right">Inscritos Fila</th>
                <th className="py-3 px-4 font-semibold text-right">Vagas Ativas</th>
                <th className="py-3 px-4 font-semibold text-right">Déficit Líquido</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {creRaw.map((cre) => {
                const deficit = cre.inscritos - cre.vagas;
                return (
                  <tr key={cre.cre_id} className="group hover:bg-muted/5 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-foreground">
                      {cre.sigla} - Região Administrativa
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono">{formatNumber(cre.inscritos)}</td>
                    <td className="py-3.5 px-4 text-right font-mono text-emerald-400">{formatNumber(cre.vagas)}</td>
                    <td className="py-3.5 px-4 text-right font-mono text-red-400 font-semibold">{formatNumber(deficit)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
