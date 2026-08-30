'use client';

import { useState, useMemo, useTransition } from 'react';
import { calcularMerendaEscola } from '@/actions/predicoes';
import type { ResultadoMerenda, ParametrosMerenda } from '@/lib/ai/merenda-model';
import { formatCurrency, formatNumber } from '@/lib/utils/formatters';
import { exportToCSV } from '@/lib/utils/export-utils';
import {
  UtensilsCrossed, Calculator, Download, Loader2,
  ShoppingCart, CalendarDays, DollarSign, Users
} from 'lucide-react';

interface MerendaCalculatorProps {
  escolas: { id: string; nome: string; matriculas: number; presenca: number }[];
}

export function MerendaCalculator({ escolas }: MerendaCalculatorProps) {
  const [selectedEscola, setSelectedEscola] = useState<string>(escolas[0]?.id || '');
  const [custoUnitario, setCustoUnitario] = useState<number>(4.50);
  const [diasLetivos, setDiasLetivos] = useState<number>(22);
  const [taxaPresenca, setTaxaPresenca] = useState<number>(85);
  const [resultado, setResultado] = useState<ResultadoMerenda | null>(null);
  const [isPending, startTransition] = useTransition();

  const escolaSelecionada = useMemo(() => {
    return escolas.find(e => e.id === selectedEscola);
  }, [escolas, selectedEscola]);

  const handleCalcular = () => {
    if (!escolaSelecionada) return;

    const params: ParametrosMerenda = {
      escola_id: escolaSelecionada.id,
      escola_nome: escolaSelecionada.nome,
      matriculas_ativas: escolaSelecionada.matriculas,
      taxa_presenca: taxaPresenca / 100,
      dias_letivos: diasLetivos,
      custo_unitario_refeicao: custoUnitario,
    };

    startTransition(async () => {
      const res = await calcularMerendaEscola(params);
      setResultado(res);
    });
  };

  const handleExportarCSV = () => {
    if (!resultado) return;
    const headers = [
      { label: 'Item', key: 'item' },
      { label: 'Quantidade (kg)', key: 'quantidade_kg' },
      { label: 'Custo Estimado (R$)', key: 'custo_estimado' },
    ];
    const data = resultado.itens_sugeridos.map(item => ({
      item: item.item,
      quantidade_kg: item.quantidade_kg.toFixed(1),
      custo_estimado: item.custo_estimado.toFixed(2),
    }));
    exportToCSV(data, headers, `merenda_${resultado.escola_nome.replace(/\s/g, '_')}`);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Painel de Configuração */}
        <div className="glass-card rounded-2xl p-6 border border-border space-y-6 lg:col-span-1">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Calculator className="h-4 w-4 text-amber-400" />
            Parâmetros de Cálculo
          </h3>

          {/* Seletor de Escola */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground">Escola</label>
            <select
              value={selectedEscola}
              onChange={(e) => { setSelectedEscola(e.target.value); setResultado(null); }}
              className="w-full rounded-lg border border-border bg-input px-3 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            >
              {escolas.map(e => (
                <option key={e.id} value={e.id}>{e.nome} ({formatNumber(e.matriculas)} alunos)</option>
              ))}
            </select>
          </div>

          {/* Slider: Custo unitário */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <label className="font-semibold text-muted-foreground">Custo por Refeição</label>
              <span className="font-mono font-bold text-foreground">{formatCurrency(custoUnitario)}</span>
            </div>
            <input
              type="range"
              min="2"
              max="12"
              step="0.50"
              value={custoUnitario}
              onChange={(e) => { setCustoUnitario(parseFloat(e.target.value)); setResultado(null); }}
              className="w-full accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>R$ 2,00</span>
              <span>R$ 12,00</span>
            </div>
          </div>

          {/* Slider: Dias letivos */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <label className="font-semibold text-muted-foreground">Dias Letivos</label>
              <span className="font-mono font-bold text-foreground">{diasLetivos} dias</span>
            </div>
            <input
              type="range"
              min="10"
              max="25"
              step="1"
              value={diasLetivos}
              onChange={(e) => { setDiasLetivos(parseInt(e.target.value)); setResultado(null); }}
              className="w-full accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>10 dias</span>
              <span>25 dias</span>
            </div>
          </div>

          {/* Slider: Taxa de presença */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <label className="font-semibold text-muted-foreground">Presença Média</label>
              <span className="font-mono font-bold text-foreground">{taxaPresenca}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="100"
              step="1"
              value={taxaPresenca}
              onChange={(e) => { setTaxaPresenca(parseInt(e.target.value)); setResultado(null); }}
              className="w-full accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Botão Calcular */}
          <button
            onClick={handleCalcular}
            disabled={isPending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 py-3 text-sm font-bold text-white shadow-lg shadow-amber-500/20 transition-all hover:shadow-xl hover:shadow-amber-500/30 disabled:opacity-50"
          >
            {isPending ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Calculando...</>
            ) : (
              <><UtensilsCrossed className="h-4 w-4" /> Calcular Dimensionamento</>
            )}
          </button>
        </div>

        {/* Resultado */}
        <div className="lg:col-span-2 space-y-6">
          {resultado ? (
            <>
              {/* KPIs de Resultado */}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="glass-card rounded-2xl p-4 border border-border">
                  <Users className="h-5 w-5 text-primary mb-2" />
                  <span className="text-xl font-bold font-mono text-foreground">
                    {formatNumber(escolaSelecionada?.matriculas || 0)}
                  </span>
                  <span className="block text-[10px] text-muted-foreground mt-0.5">Matrículas Ativas</span>
                </div>
                <div className="glass-card rounded-2xl p-4 border border-amber-500/20">
                  <UtensilsCrossed className="h-5 w-5 text-amber-400 mb-2" />
                  <span className="text-xl font-bold font-mono text-amber-400">
                    {formatNumber(resultado.refeicoes_estimadas)}
                  </span>
                  <span className="block text-[10px] text-muted-foreground mt-0.5">Refeições/Mês</span>
                </div>
                <div className="glass-card rounded-2xl p-4 border border-emerald-500/20">
                  <DollarSign className="h-5 w-5 text-emerald-400 mb-2" />
                  <span className="text-xl font-bold font-mono text-emerald-400">
                    {formatCurrency(resultado.custo_total)}
                  </span>
                  <span className="block text-[10px] text-muted-foreground mt-0.5">Custo Mensal</span>
                </div>
                <div className="glass-card rounded-2xl p-4 border border-border">
                  <CalendarDays className="h-5 w-5 text-cyan-400 mb-2" />
                  <span className="text-xl font-bold font-mono text-foreground">{diasLetivos}</span>
                  <span className="block text-[10px] text-muted-foreground mt-0.5">Dias Letivos</span>
                </div>
              </div>

              {/* Tabela de Itens */}
              <div className="glass-card rounded-2xl p-6 border border-border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-amber-400" />
                    Ordem de Compra — Itens Estimados
                  </h3>
                  <button
                    onClick={handleExportarCSV}
                    className="flex items-center gap-1.5 rounded-lg border border-border bg-card/50 px-3 py-1.5 text-[10px] font-bold text-muted-foreground transition-all hover:bg-muted/10 hover:text-foreground"
                  >
                    <Download className="h-3 w-3" />
                    Exportar CSV
                  </button>
                </div>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-3 text-muted-foreground font-semibold">Item</th>
                      <th className="text-right py-2 px-3 text-muted-foreground font-semibold">Quantidade (kg)</th>
                      <th className="text-right py-2 px-3 text-muted-foreground font-semibold">Custo Estimado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultado.itens_sugeridos.map(item => (
                      <tr key={item.item} className="border-b border-border/30 hover:bg-muted/5 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-foreground">{item.item}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-foreground">{formatNumber(item.quantidade_kg)}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-emerald-400">{formatCurrency(item.custo_estimado)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-border">
                      <td className="py-3 px-3 font-bold text-foreground">TOTAL</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-foreground">
                        {formatNumber(resultado.itens_sugeridos.reduce((a, b) => a + b.quantidade_kg, 0))}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">
                        {formatCurrency(resultado.itens_sugeridos.reduce((a, b) => a + b.custo_estimado, 0))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Projeção Mensal */}
              <div className="glass-card rounded-2xl p-6 border border-border">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4">
                  <CalendarDays className="h-4 w-4 text-cyan-400" />
                  Projeção Mensal do Ano Letivo
                </h3>
                <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                  {resultado.projecao_mensal.map(p => (
                    <div key={p.mes} className="p-3 bg-muted/5 border border-border/40 rounded-xl text-center space-y-1.5">
                      <span className="text-xs font-bold text-foreground">{p.mes}</span>
                      <span className="block text-[10px] text-muted-foreground">{p.dias_letivos} dias</span>
                      <span className="block text-sm font-mono font-bold text-amber-400">{formatNumber(p.refeicoes)}</span>
                      <span className="block text-[10px] text-emerald-400 font-semibold">{formatCurrency(p.custo)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="glass-card flex h-full min-h-[400px] items-center justify-center rounded-2xl border border-border">
              <div className="text-center space-y-3 max-w-xs">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10">
                  <UtensilsCrossed className="h-8 w-8 text-amber-400" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Calculadora de Merenda</h3>
                <p className="text-sm text-muted-foreground">
                  Selecione uma escola e ajuste os parâmetros ao lado, depois clique em "Calcular" para projetar o consumo de alimentos.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
