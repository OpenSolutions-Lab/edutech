'use client';

import { useState, useEffect } from 'react';
import { Source, Layer, Popup, useMap } from 'react-map-gl/mapbox';
import type { VazioEducacionalGeo } from '@/actions/geo-queries';
import { formatNumber } from '@/lib/utils/formatters';
import { AlertTriangle, Info } from 'lucide-react';

interface VacancyGapsLayerProps {
  vazios: VazioEducacionalGeo[];
}

export function VacancyGapsLayer({ vazios }: VacancyGapsLayerProps) {
  const { current: map } = useMap();
  const [selectedBairro, setSelectedBairro] = useState<VazioEducacionalGeo | null>(null);

  // Criar FeatureCollection do GeoJSON dos bairros com estatísticas de déficit
  const geojson: any = {
    type: 'FeatureCollection',
    features: vazios.map((v) => {
      const feat = { ...v.geojson };
      feat.properties = {
        bairro_nome: v.bairro_nome,
        populacao_alvo: v.populacao_alvo,
        total_vagas: v.total_vagas,
        deficit_estimado: v.deficit_estimado
      };
      return feat;
    })
  };

  useEffect(() => {
    if (!map) return;

    const handleMapClick = (event: any) => {
      const features = map.queryRenderedFeatures(event.point, {
        layers: ['bairros-fill']
      });

      if (!features.length) {
        setSelectedBairro(null);
        return;
      }

      const clickedFeature = features[0];
      const props = clickedFeature.properties;
      
      if (props && props.bairro_nome) {
        const bairro = vazios.find(v => v.bairro_nome === props.bairro_nome);
        if (bairro) {
          // Abre o popup na localização do clique
          setSelectedBairro({
            ...bairro,
            // Guarda as coordenadas de clique para plotar o popup nela
            geojson: {
              ...bairro.geojson,
              // Guardamos temporariamente o ponto do clique na estrutura para o popup
              clickCoordinates: [event.lngLat.lng, event.lngLat.lat]
            }
          });
        }
      }
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [map, vazios]);

  return (
    <>
      <Source id="vazios-source" type="geojson" data={geojson}>
        {/* Camada de Polígonos Preenchidos (Choropleth) */}
        <Layer
          id="bairros-fill"
          type="fill"
          source="vazios-source"
          paint={{
            'fill-color': [
              'step',
              ['get', 'deficit_estimado'],
              'rgba(16, 185, 129, 0.15)', // verde-claro para déficit baixo (< 1000)
              1000,
              'rgba(245, 158, 11, 0.25)', // laranja para déficit médio (1000 - 2500)
              2500,
              'rgba(239, 68, 68, 0.35)'  // vermelho para déficit crítico (> 2500)
            ],
            'fill-outline-color': 'rgba(255, 255, 255, 0.2)'
          }}
        />

        {/* Camada de bordas para destacar os polígonos */}
        <Layer
          id="bairros-borders"
          type="line"
          source="vazios-source"
          paint={{
            'line-color': 'rgba(255, 255, 255, 0.35)',
            'line-width': 1.5
          }}
        />
      </Source>



      {/* Popup de informações de déficit do bairro */}
      {selectedBairro && (selectedBairro.geojson as any).clickCoordinates && (
        <Popup
          longitude={(selectedBairro.geojson as any).clickCoordinates[0]}
          latitude={(selectedBairro.geojson as any).clickCoordinates[1]}
          anchor="bottom"
          onClose={() => setSelectedBairro(null)}
          closeOnClick={false}
          offset={10}
        >
          <div className="p-3 w-64 space-y-2.5 font-sans relative z-50">
            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                Vazio Educacional Identificado
              </span>
              <h4 className="font-bold text-sm text-foreground leading-tight mt-0.5">
                Bairro: {selectedBairro.bairro_nome}
              </h4>
            </div>

            {/* Métricas de Cobertura */}
            <div className="space-y-1.5 text-xs border-y border-border py-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">População Alvo:</span>
                <span className="font-bold text-foreground font-mono">{formatNumber(selectedBairro.populacao_alvo)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vagas Ativas:</span>
                <span className="font-bold text-foreground font-mono text-emerald-400">{formatNumber(selectedBairro.total_vagas)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-border/50">
                <span className="text-muted-foreground font-semibold">Déficit Estimado:</span>
                <span className="font-bold text-red-400 font-mono">{formatNumber(selectedBairro.deficit_estimado)}</span>
              </div>
            </div>

            {/* Status do Alerta */}
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Prioridade Alta de Expansão</span>
            </div>
          </div>
        </Popup>
      )}
    </>
  );
}
