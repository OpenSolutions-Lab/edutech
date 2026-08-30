'use client';

import { useState, useMemo } from 'react';
import type { ProjecaoRH } from '@/lib/ai/rh-forecast-model';
import { DISCIPLINAS } from '@/lib/ai/rh-forecast-model';
import { formatNumber } from '@/lib/utils/formatters';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Users, Filter } from 'lucide-react';

interface RHProjectionPanelProps {
  projecoes: ProjecaoRH[];
}

export function RHProjectionPanel({ projecoes }: RHProjectionPanelProps) {
  const [selectedDisciplina, setSelectedDisciplina] = useState<string>('todas');
  const [selectedCRE, setSelectedCRE] = useState<string>('todas');

  // Agrupar dados para heatmap
  const filteredProjecoes = useMemo(() => {
    return projecoes.filter(p => {
      const matchDisc = selectedDisciplina === 'todas' || p.disciplina === selectedDisciplina;
      const matchCRE = selectedCRE === 'todas' || String(p.cre_id) === selectedCRE;
      return matchDisc && matchCRE;
    });
  }, [projecoes, selectedDisciplina, selectedCRE]);

  // Dados para heatmap CRE × Disciplina
  const cres = useMemo(() => {
    const uniqueCREs = [...new Set(projecoes.map(p => p.cre_id))].sort((a, b) => a - b);
    return uniqueCREs.map(id => ({
      id,
      nome: projecoes.find(p => p.cre_id === id)?.cre_nome || `${id}ª CRE`
    }));
  }, [projecoes]);

  const getHeatmapValue = (creId: number, disciplina: string) => {
    const proj = projecoes.find(p => p.cre_id === creId && p.disciplina === disciplina);
    return proj;
  };

  const getHeatmapColor = (carencia: number) => {
    if (carencia <= 2) return 'bg-emerald-500/20 text-emerald-400';
    if (carencia <= 5) return 'bg-yellow-500/20 text-yellow-400';
    if (carencia <= 8) return 'bg-orange-500/20 text-orange-400';
    return 'bg-red-500/20 text-red-400';
  };

  const getTrendIcon = (tendencia: string) => {
    if (tendencia === 'subindo') return <TrendingUp className="h-3 w-3 text-red-400" />;
    if (tendencia === 'descendo') return <TrendingDown className="h-3 w-3 text-emerald-400" />;
    return <Minus className="h-3 w-3 text-muted-foreground" />;
  };

  // Estatísticas
  const totalCarencia = filteredProjecoes.reduce((acc, p) => acc + p.carencia_atual, 0);
  const totalAlerta = filteredProjecoes.filter(p => p.alerta).length;
  const totalSubindo = filteredProjecoes.filter(p => p.tendencia === 'subindo').length;

  return (
    <div className="space-y-6">
      {/* Cards de resumo */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="glass-card rounded-2xl p-4 border border-border">
          <Users className="h-5 w-5 text-primary mb-2" />
          <span className="text-2xl font-bold font-mono text-foreground">{formatNumber(totalCarencia)}</span>
          <span className="block text-xs text-muted-foreground mt-0.5">Carências Identificadas</span>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-red-500/20">
          <AlertTriangle className="h-5 w-5 text-red-400 mb-2" />
          <span className="text-2xl font-bold font-mono text-red-400">{totalAlerta}</span>
          <span className="block text-xs text-muted-foreground mt-0.5">Alertas Ativos</span>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-orange-500/20">
          <TrendingUp className="h-5 w-5 text-orange-400 mb-2" />
          <span className="text-2xl font-bold font-mono text-orange-400">{totalSubindo}</span>
          <span className="block text-xs text-muted-foreground mt-0.5">Tendência de Alta</span>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-border">
          <Filter className="h-5 w-5 text-cyan-400 mb-2" />
          <span className="text-2xl font-bold font-mono text-foreground">{filteredProjecoes.length}</span>
          <span className="block text-xs text-muted-foreground mt-0.5">Projeções Ativas</span>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Disciplina</label>
          <select
            value={selectedDisciplina}
            onChange={(e) => setSelectedDisciplina(e.target.value)}
            className="rounded-lg border border-border bg-input px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="todas">Todas</option>
            {DISCIPLINAS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">CRE</label>
          <select
            value={selectedCRE}
            onChange={(e) => setSelectedCRE(e.target.value)}
            className="rounded-lg border border-border bg-input px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="todas">Todas</option>
            {cres.map(c => <option key={c.id} value={String(c.id)}>{c.nome}</option>)}
          </select>
        </div>
      </div>

      {/* Heatmap CRE × Disciplina */}
      <div className="glass-card rounded-2xl p-6 border border-border overflow-x-auto">
        <h3 className="text-sm font-bold text-foreground mb-4">Heatmap de Carência Atual (CRE × Disciplina)</h3>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-3 text-muted-foreground font-semibold">CRE</th>
              {DISCIPLINAS.map(d => (
                <th key={d} className="text-center py-2 px-2 text-muted-foreground font-semibold">{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cres.map(cre => (
              <tr key={cre.id} className="border-b border-border/30 hover:bg-muted/5 transition-colors">
                <td className="py-2 px-3 font-semibold text-foreground whitespace-nowrap">{cre.nome}</td>
                {DISCIPLINAS.map(disc => {
                  const proj = getHeatmapValue(cre.id, disc);
                  const carencia = proj?.carencia_atual || 0;
                  return (
                    <td key={disc} className="text-center py-1.5 px-1">
                      <div className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 font-mono font-bold ${getHeatmapColor(carencia)}`}>
                        {carencia}
                        {proj && getTrendIcon(proj.tendencia)}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Projeções Detalhadas */}
      <div className="glass-card rounded-2xl p-6 border border-border">
        <h3 className="text-sm font-bold text-foreground mb-4">Projeções para os Próximos 3 Meses</h3>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjecoes.filter(p => p.alerta).slice(0, 9).map(proj => (
            <div
              key={`${proj.cre_id}-${proj.disciplina}`}
              className="p-4 bg-muted/5 border border-border/50 rounded-xl space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-foreground">{proj.cre_nome}</span>
                  <span className="block text-[10px] text-muted-foreground">{proj.disciplina}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-semibold">
                  {getTrendIcon(proj.tendencia)}
                  <span className={proj.tendencia === 'subindo' ? 'text-red-400' : proj.tendencia === 'descendo' ? 'text-emerald-400' : 'text-muted-foreground'}>
                    {proj.tendencia === 'subindo' ? 'Subindo' : proj.tendencia === 'descendo' ? 'Descendo' : 'Estável'}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                {proj.projecoes.map((p, i) => (
                  <div key={i} className="flex-1 text-center">
                    <span className="block text-[10px] text-muted-foreground">{p.mes}</span>
                    <span className={`block font-mono font-bold text-sm ${p.carencia_projetada > 8 ? 'text-red-400' : p.carencia_projetada > 5 ? 'text-orange-400' : 'text-foreground'}`}>
                      {p.carencia_projetada}
                    </span>
                    <span className="block text-[9px] text-muted-foreground/60">
                      ±{((1 - p.confianca) * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
