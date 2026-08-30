'use client';

import { useState, useMemo } from 'react';
import type { EscolaGeo } from '@/actions/geo-queries';
import dynamic from 'next/dynamic';

const BaseMap = dynamic(() => import('@/components/maps/base-map').then((mod) => mod.BaseMap), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-muted/10 rounded-2xl" />
});

const SchoolClusters = dynamic(() => import('@/components/maps/school-clusters').then((mod) => mod.SchoolClusters), {
  ssr: false
});
import { SlidersHorizontal, School, AlertCircle, RefreshCw } from 'lucide-react';
import { formatNumber } from '@/lib/utils/formatters';

interface GestorMapViewerProps {
  escolas: EscolaGeo[];
}

export function GestorMapViewer({ escolas }: GestorMapViewerProps) {
  const [selectedCRE, setSelectedCRE] = useState<string>('todos');
  const [selectedTipo, setSelectedTipo] = useState<string>('todos');
  const [selectedRisco, setSelectedRisco] = useState<string>('todos');

  // Filtros aplicados em tempo de renderização
  const filteredEscolas = useMemo(() => {
    return escolas.filter((esc) => {
      const matchesCRE = selectedCRE === 'todos' || String(esc.cre_id) === selectedCRE;
      const matchesTipo = selectedTipo === 'todos' || esc.tipo === selectedTipo;
      const matchesRisco = selectedRisco === 'todos' || esc.nivel_risco === selectedRisco;
      return matchesCRE && matchesTipo && matchesRisco;
    });
  }, [escolas, selectedCRE, selectedTipo, selectedRisco]);

  const handleResetFilters = () => {
    setSelectedCRE('todos');
    setSelectedTipo('todos');
    setSelectedRisco('todos');
  };

  return (
    <div className="grid gap-6 lg:grid-cols-4 h-[calc(100vh-12rem)] min-h-[600px]">
      {/* Sidebar de Filtros */}
      <div className="glass-card rounded-2xl p-6 space-y-6 lg:col-span-1 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              Painel de Controle
            </h3>
            <button
              onClick={handleResetFilters}
              className="text-[10px] font-semibold text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
              title="Limpar filtros"
            >
              <RefreshCw className="h-3 w-3" />
              Limpar
            </button>
          </div>

          {/* Filtro por CRE */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground">Filtro Regional (CRE)</label>
            <select
              value={selectedCRE}
              onChange={(e) => setSelectedCRE(e.target.value)}
              className="w-full rounded-lg border border-border bg-input px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            >
              <option value="todos">Todas as CREs</option>
              {Array.from({ length: 11 }, (_, i) => i + 1).map((cre) => (
                <option key={cre} value={String(cre)}>{cre}ª CRE</option>
              ))}
            </select>
          </div>

          {/* Filtro por Tipo */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground">Tipo de Unidade</label>
            <select
              value={selectedTipo}
              onChange={(e) => setSelectedTipo(e.target.value)}
              className="w-full rounded-lg border border-border bg-input px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            >
              <option value="todos">Todos os tipos</option>
              <option value="CIEP">CIEP</option>
              <option value="Escola Municipal">Escola Municipal</option>
              <option value="EDI">EDI</option>
              <option value="Creche">Creche</option>
            </select>
          </div>

          {/* Filtro por Nível de Risco */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground">Alerta de Evasão</label>
            <select
              value={selectedRisco}
              onChange={(e) => setSelectedRisco(e.target.value)}
              className="w-full rounded-lg border border-border bg-input px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            >
              <option value="todos">Todos os níveis de risco</option>
              <option value="baixo">🟢 Risco Baixo</option>
              <option value="moderado">🟡 Risco Moderado</option>
              <option value="alto">🟠 Risco Alto</option>
              <option value="critico">🔴 Risco Crítico</option>
            </select>
          </div>
        </div>

        {/* Resumo Estatístico das Escolas Filtradas */}
        <div className="bg-muted/15 border border-border/60 p-4 rounded-xl space-y-3">
          <h4 className="text-xs font-bold text-foreground">Amostra Atual</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="space-y-0.5">
              <span className="text-muted-foreground block text-[10px]">Unidades Exibidas</span>
              <span className="font-bold text-foreground font-mono">{formatNumber(filteredEscolas.length)}</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-muted-foreground block text-[10px]">Matrículas Totais</span>
              <span className="font-bold text-emerald-400 font-mono">
                {formatNumber(filteredEscolas.reduce((acc, curr) => acc + curr.total_matriculas, 0))}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Visualizador do Mapa */}
      <div className="lg:col-span-3 h-full rounded-2xl overflow-hidden relative">
        <BaseMap>
          <SchoolClusters escolas={filteredEscolas} />
        </BaseMap>
      </div>
    </div>
  );
}
