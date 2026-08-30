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
import { SlidersHorizontal, Map, RefreshCw } from 'lucide-react';
import { formatNumber } from '@/lib/utils/formatters';

interface PublicMapViewerProps {
  escolas: EscolaGeo[];
}

export function PublicMapViewer({ escolas }: PublicMapViewerProps) {
  const [selectedCRE, setSelectedCRE] = useState<string>('todos');
  const [selectedTipo, setSelectedTipo] = useState<string>('todos');

  // Filtros simples para o público
  const filteredEscolas = useMemo(() => {
    return escolas.filter((esc) => {
      const matchesCRE = selectedCRE === 'todos' || String(esc.cre_id) === selectedCRE;
      const matchesTipo = selectedTipo === 'todos' || esc.tipo === selectedTipo;
      return matchesCRE && matchesTipo;
    });
  }, [escolas, selectedCRE, selectedTipo]);

  const handleResetFilters = () => {
    setSelectedCRE('todos');
    setSelectedTipo('todos');
  };

  return (
    <div className="grid gap-6 lg:grid-cols-4 h-[600px] rounded-2xl overflow-hidden border border-border bg-card/10">
      {/* Controles de Filtros */}
      <div className="glass-card p-6 space-y-6 lg:col-span-1 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              Filtrar Unidades
            </h3>
            <button
              onClick={handleResetFilters}
              className="text-[10px] font-semibold text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="h-3 w-3" />
              Limpar
            </button>
          </div>

          {/* Filtro CRE */}
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

          {/* Filtro Tipo */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground">Tipo de Escola</label>
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
        </div>

        {/* Resumo da consulta */}
        <div className="bg-muted/10 border border-border/40 p-4 rounded-xl space-y-2">
          <span className="text-[10px] text-muted-foreground block uppercase font-bold tracking-wider">Unidades Encontradas</span>
          <span className="text-2xl font-bold text-foreground font-mono">{formatNumber(filteredEscolas.length)}</span>
          <span className="text-[10px] text-muted-foreground block">
            Mostradas no mapa interativo
          </span>
        </div>
      </div>

      {/* Visualizador de mapa */}
      <div className="lg:col-span-3 h-full relative">
        <BaseMap>
          <SchoolClusters escolas={filteredEscolas} />
        </BaseMap>
      </div>
    </div>
  );
}
