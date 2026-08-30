'use client';

import { useState, useMemo } from 'react';
import type { VazioEducacionalGeo } from '@/actions/geo-queries';
import dynamic from 'next/dynamic';

const BaseMap = dynamic(() => import('@/components/maps/base-map').then((mod) => mod.BaseMap), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-muted/10 rounded-2xl" />
});

const VacancyGapsLayer = dynamic(() => import('@/components/maps/vacancy-gaps-layer').then((mod) => mod.VacancyGapsLayer), {
  ssr: false
});
import { SlidersHorizontal, AlertTriangle, Map, HelpCircle } from 'lucide-react';
import { formatNumber } from '@/lib/utils/formatters';

interface VaziosMapViewerProps {
  vaziosCreche: VazioEducacionalGeo[];
  vaziosEDI: VazioEducacionalGeo[];
}

export function VaziosMapViewer({ vaziosCreche, vaziosEDI }: VaziosMapViewerProps) {
  const [selectedSegmento, setSelectedSegmento] = useState<'Creche' | 'EDI'>('Creche');

  const activeVazios = useMemo(() => {
    return selectedSegmento === 'Creche' ? vaziosCreche : vaziosEDI;
  }, [selectedSegmento, vaziosCreche, vaziosEDI]);

  return (
    <div className="grid gap-6 lg:grid-cols-4 h-[calc(100vh-12rem)] min-h-[600px]">
      {/* Sidebar de Controle e Ranking */}
      <div className="glass-card rounded-2xl p-6 space-y-6 lg:col-span-1 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              Segmento de Ensino
            </h3>
          </div>

          {/* Seletor de segmento */}
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedSegmento('Creche')}
              className={`flex-1 rounded-lg py-2 text-xs font-semibold border transition-all ${
                selectedSegmento === 'Creche'
                  ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/10'
                  : 'bg-card text-muted-foreground border-border hover:bg-muted/10'
              }`}
            >
              Creche
            </button>
            <button
              onClick={() => setSelectedSegmento('EDI')}
              className={`flex-1 rounded-lg py-2 text-xs font-semibold border transition-all ${
                selectedSegmento === 'EDI'
                  ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/10'
                  : 'bg-card text-muted-foreground border-border hover:bg-muted/10'
              }`}
            >
              Pré-Escola (EDI)
            </button>
          </div>

          {/* Listagem dos Bairros com maior Déficit */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              Zonas de Maior Déficit
            </h4>
            <div className="space-y-2">
              {activeVazios.slice(0, 4).map((item, index) => (
                <div
                  key={item.bairro_nome}
                  className="p-3 bg-muted/10 border border-border/40 rounded-xl flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <span className="font-bold text-foreground block">
                      {index + 1}. {item.bairro_nome}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Vagas: {formatNumber(item.total_vagas)} / Demanda: {formatNumber(item.populacao_alvo)}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded">
                    -{formatNumber(item.deficit_estimado)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Nota Explicativa */}
        <div className="flex gap-2.5 bg-blue-500/5 border border-blue-500/10 p-3.5 rounded-xl text-[11px] text-muted-foreground">
          <HelpCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            O mapa ao lado (Choropleth) pinta os bairros com base no déficit. O vermelho representa as regiões que demandam expansão emergencial de novas creches municipais.
          </p>
        </div>
      </div>

      {/* Visualizador do Mapa */}
      <div className="lg:col-span-3 h-full rounded-2xl overflow-hidden relative">
        <BaseMap>
          <VacancyGapsLayer vazios={activeVazios} />
        </BaseMap>
      </div>
    </div>
  );
}
