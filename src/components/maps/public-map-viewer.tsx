'use client';

import { useState, useMemo } from 'react';
import type { EscolaGeo } from '@/actions/geo-queries';
import dynamic from 'next/dynamic';
import { SlidersHorizontal, Map, RefreshCw, Sparkles } from 'lucide-react';
import { formatNumber } from '@/lib/utils/formatters';
import { InscricaoSugestaoWizard } from '@/components/features/inscricao-sugestao-wizard';

const BaseMap = dynamic(() => import('@/components/maps/base-map').then((mod) => mod.BaseMap), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-muted/10 rounded-2xl" />
});

const SchoolClusters = dynamic(() => import('@/components/maps/school-clusters').then((mod) => mod.SchoolClusters), {
  ssr: false
});

interface PublicMapViewerProps {
  escolas: EscolaGeo[];
}

export function PublicMapViewer({ escolas }: PublicMapViewerProps) {
  // Padrão: Visão do Mapa de Creches
  const [activeTab, setActiveTab] = useState<'mapa' | 'inscricao'>('mapa');
  const [selectedCRE, setSelectedCRE] = useState<string>('todos');

  // Filtrar rigorosamente por Creches e EDIs + Filtro por CRE
  const filteredEscolas = useMemo(() => {
    return escolas.filter((esc) => {
      const isCrecheOuEDI = esc.tipo === 'Creche' || esc.tipo === 'Creche Municipal' || esc.tipo === 'EDI';
      const matchesCRE = selectedCRE === 'todos' || String(esc.cre_id) === selectedCRE;
      return isCrecheOuEDI && matchesCRE;
    });
  }, [escolas, selectedCRE]);

  const handleResetFilters = () => {
    setSelectedCRE('todos');
  };

  return (
    <div className="space-y-6">
      {/* Seletor de Abas de Navegação */}
      <div className="flex items-center justify-center sm:justify-start gap-2 border-b border-border pb-3">
        <button
          onClick={() => setActiveTab('mapa')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'mapa'
              ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
              : 'bg-card/40 border border-border text-muted-foreground hover:text-foreground hover:bg-card'
          }`}
        >
          <Map className="h-4 w-4" />
          <span>Mapa Geral de Creches e EDIs</span>
        </button>

        <button
          onClick={() => setActiveTab('inscricao')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'inscricao'
              ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
              : 'bg-card/40 border border-border text-muted-foreground hover:text-foreground hover:bg-card'
          }`}
        >
          <Sparkles className="h-4 w-4 text-amber-300" />
          <span>Assistente de Inscrição Creche (Sugestão de Alocação)</span>
        </button>
      </div>

      {/* Conteúdo da Aba Selecionada */}
      {activeTab === 'inscricao' ? (
        <InscricaoSugestaoWizard />
      ) : (
        <div className="grid gap-6 lg:grid-cols-4 h-[600px] rounded-2xl overflow-hidden border border-border bg-card/10">
          {/* Controles de Filtros - Apenas Filtro Regional (CRE) */}
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

              {/* Único Filtro: Regional (CRE) */}
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
            </div>

            {/* Resumo da consulta */}
            <div className="bg-muted/10 border border-border/40 p-4 rounded-xl space-y-2">
              <span className="text-[10px] text-muted-foreground block uppercase font-bold tracking-wider">
                Creches e EDIs Encontradas
              </span>
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
      )}
    </div>
  );
}
