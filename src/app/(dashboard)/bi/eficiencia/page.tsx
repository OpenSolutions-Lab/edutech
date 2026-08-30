import type { Metadata } from 'next';
import { getResumoOrcamento, getOrcamentoPorCRE, getEscolasEficiencia } from '@/actions/eficiencia-orcamento';
import { BarChart } from '@/components/charts/bar-chart';
import { AreaChart } from '@/components/charts/area-chart';
import { KPICard } from '@/components/charts/kpi-card';
import { formatCurrency, formatNumber, formatPercentRaw } from '@/lib/utils/formatters';
import { BadgePercent, TrendingDown, DollarSign } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Eficiência Orçamentária',
  description: 'Auditoria de custos e investimentos por aluno na rede municipal.'
};

export default async function EficienciaPage() {
  const resumo = await getResumoOrcamento();
  const creRaw = await getOrcamentoPorCRE();
  const escolasRaw = await getEscolasEficiencia();

  const creChartData = creRaw.map((item) => ({
    label: item.sigla,
    value: item.custo_medio_aluno
  }));

  const custoEscolasData = escolasRaw.map((item) => ({
    label: item.nome,
    value: item.custo_aluno
  }));

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground">Eficiência Orçamentária</h1>
        <p className="text-sm text-muted-foreground">
          Auditoria comparativa de investimentos em manutenção predial e custo por aluno vs. desempenho escolar
        </p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          titulo="Total Investido"
          valor={formatCurrency(resumo.totalPago)}
          delta={{ value: "+4.1%", isPositive: true, direction: "up" }}
          iconName="dollar-sign"
          gradiente="from-blue-600 to-cyan-500"
        />
        <KPICard
          titulo="Custo Médio Aluno"
          valor={formatCurrency(resumo.custoMedioAluno)}
          delta={{ value: "+2.5%", isPositive: false, direction: "up" }}
          iconName="users"
          gradiente="from-violet-600 to-purple-500"
        />
        <KPICard
          titulo="Orçamento Empenhado"
          valor={formatCurrency(resumo.totalEmpenhado)}
          iconName="school"
          gradiente="from-cyan-500 to-blue-400"
        />
        <KPICard
          titulo="Eficiência de Pagamento"
          valor={formatPercentRaw(resumo.eficienciaPagamento)}
          delta={{ value: "+1.2%", isPositive: true, direction: "up" }}
          iconName="trending-down"
          gradiente="from-emerald-500 to-teal-400"
        />
      </div>

      {/* Graficos */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Custo aluno por CRE */}
        <div className="glass-card rounded-2xl p-6 flex flex-col">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-foreground">Custo Médio por Aluno por CRE</h3>
            <p className="text-xs text-muted-foreground">Investimento anual ponderado por número de matrículas</p>
          </div>
          <div className="h-[320px] w-full">
            <BarChart
              data={creChartData}
              valueType="currency"
            />
          </div>
        </div>

        {/* Distribuição de custos por escola */}
        <div className="glass-card rounded-2xl p-6 flex flex-col">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-foreground">Escopo de Custos das Unidades de Destaque</h3>
            <p className="text-xs text-muted-foreground">Gasto anual de manutenção por aluno em unidades de amostra</p>
          </div>
          <div className="h-[320px] w-full">
            <AreaChart
              data={custoEscolasData.slice(0, 10)}
              valueType="currency"
              gradientColor="#A855F7"
            />
          </div>
        </div>
      </div>

      {/* Tabela de Eficiência */}
      <div className="glass-card rounded-2xl p-6">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-foreground">Matriz de Investimento vs. Desempenho</h3>
          <p className="text-xs text-muted-foreground">Comparação de custo anual por aluno com taxas de aprovação e evasão escolar</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-muted-foreground">
            <thead className="text-xs uppercase text-muted-foreground/75 border-b border-border">
              <tr>
                <th className="py-3 px-4 font-semibold">Unidade Escolar</th>
                <th className="py-3 px-4 font-semibold">CRE</th>
                <th className="py-3 px-4 font-semibold text-right">Custo por Aluno/Ano</th>
                <th className="py-3 px-4 font-semibold text-right">Aprovação</th>
                <th className="py-3 px-4 font-semibold text-right">Evasão</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {escolasRaw.map((escola) => (
                <tr key={escola.id} className="group hover:bg-muted/5 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-foreground">
                    <Link href={`/escola/${escola.id}`} className="hover:underline hover:text-primary transition-colors">
                      {escola.nome}
                    </Link>
                  </td>
                  <td className="py-3.5 px-4">{escola.cre_id}ª CRE</td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-foreground">
                    {formatCurrency(escola.custo_aluno)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-emerald-400">
                    {formatPercentRaw(escola.taxa_aprovacao)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-red-400">
                    {formatPercentRaw(escola.taxa_evasao)}
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
