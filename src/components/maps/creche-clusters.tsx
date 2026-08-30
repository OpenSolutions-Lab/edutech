'use client';

import { useState, useEffect } from 'react';
import { Source, Layer, useMap, Popup } from 'react-map-gl/mapbox';
import type { UnidadeSaldoData } from '@/actions/saldo-oferta-demanda';
import { MapPin, Users, CheckCircle, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface CrecheClustersProps {
  unidades: UnidadeSaldoData[];
  selectedUnidadeId?: string | null;
  onSelectUnidade?: (unidade: UnidadeSaldoData | null) => void;
}

export function CrecheClusters({ unidades, selectedUnidadeId, onSelectUnidade }: CrecheClustersProps) {
  const { current: map } = useMap();
  const [selectedUnidade, setSelectedUnidade] = useState<UnidadeSaldoData | null>(null);

  // Efeito para centralizar mapa quando uma unidade é selecionada externamente
  useEffect(() => {
    if (selectedUnidadeId) {
      const found = unidades.find((u) => u.id === selectedUnidadeId);
      if (found) {
        setSelectedUnidade(found);
        if (map) {
          map.resize();
          map.flyTo({
            center: [found.lng, found.lat],
            zoom: 15.5,
            duration: 1200,
          });
        }
      }
    }
  }, [selectedUnidadeId, unidades, map]);

  // Converte unidades para formato GeoJSON aceito pelo Mapbox
  const geojson: any = {
    type: 'FeatureCollection',
    features: unidades.map((u) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [u.lng, u.lat],
      },
      properties: {
        id: u.id,
        designacao: u.designacao,
        tipo: u.tipo,
        cre: u.cre,
        bairro: u.bairro,
        vagasOferecidas: u.vagasOferecidas,
        vagasOciosas: u.vagasOciosas,
        filaTotal: u.filaTotal,
        confirmados: u.confirmados,
        indicePressao: u.indicePressao,
        statusDemanda: u.statusDemanda,
      },
    })),
  };

  useEffect(() => {
    if (!map) return;

    const handleMapClick = (event: any) => {
      const features = map.queryRenderedFeatures(event.point, {
        layers: ['creche-clusters', 'creche-unclustered-point'],
      });

      if (!features.length) {
        return;
      }

      const clickedFeature = features[0];

      // Se clicou em um agrupamento (cluster), expande o zoom
      if (clickedFeature.layer && clickedFeature.layer.id === 'creche-clusters') {
        const clusterId = clickedFeature.properties?.cluster_id;
        const source: any = map.getSource('creches-source');
        source.getClusterExpansionZoom(clusterId, (err: any, zoom: number) => {
          if (err) return;
          map.easeTo({
            center: (clickedFeature.geometry as any).coordinates,
            zoom: Math.min(zoom + 1.5, 16),
          });
        });
        return;
      }

      // Se clicou em um marcador de creche individual
      if (clickedFeature.layer && clickedFeature.layer.id === 'creche-unclustered-point') {
        const props = clickedFeature.properties;
        const unidade = unidades.find((u) => u.id === props?.id);
        if (unidade) {
          setSelectedUnidade(unidade);
          if (onSelectUnidade) {
            onSelectUnidade(unidade);
          }
        }
      }
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [map, unidades, onSelectUnidade]);

  return (
    <>
      <Source
        id="creches-source"
        type="geojson"
        data={geojson}
        cluster={true}
        clusterMaxZoom={14}
        clusterRadius={45}
      >
        {/* Círculos de clusters */}
        <Layer
          id="creche-clusters"
          type="circle"
          source="creches-source"
          filter={['has', 'point_count']}
          paint={{
            'circle-color': [
              'step',
              ['get', 'point_count'],
              'rgba(59, 130, 246, 0.75)', // Azul
              20,
              'rgba(245, 158, 11, 0.75)', // Amarelo/Laranja
              50,
              'rgba(244, 63, 94, 0.75)', // Vermelho Rosa
            ],
            'circle-radius': [
              'step',
              ['get', 'point_count'],
              18,
              20,
              24,
              50,
              30,
            ],
            'circle-stroke-width': 2,
            'circle-stroke-color': 'rgba(255, 255, 255, 0.3)',
          }}
        />

        {/* Rótulo numérico do cluster */}
        <Layer
          id="creche-cluster-count"
          type="symbol"
          source="creches-source"
          filter={['has', 'point_count']}
          layout={{
            'text-field': ['get', 'point_count_abbreviated'],
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12,
          }}
          paint={{
            'text-color': '#ffffff',
          }}
        />

        {/* Marcadores individuais de Creches & EDIs */}
        <Layer
          id="creche-unclustered-point"
          type="circle"
          source="creches-source"
          filter={['!', ['has', 'point_count']]}
          paint={{
            'circle-color': [
              'match',
              ['get', 'statusDemanda'],
              'CRITICO', '#f43f5e', // Rosa/Vermelho
              'EXCEDENTE_VAGAS', '#10b981', // Verde Esmeralda
              'PRESSAO_ALTA', '#f59e0b', // Âmbar
              '#3b82f6', // Azul padrão (EQUILIBRADO)
            ],
            'circle-radius': 8,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff',
          }}
        />
      </Source>

      {/* Popup do Mapbox para Unidade Selecionada */}
      {selectedUnidade && (
        <Popup
          longitude={selectedUnidade.lng}
          latitude={selectedUnidade.lat}
          anchor="bottom"
          onClose={() => setSelectedUnidade(null)}
          closeOnClick={false}
          offset={12}
        >
          <div className="p-3.5 w-72 space-y-3 font-sans relative z-50 text-popover-foreground">
            <div>
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-[10px] font-bold uppercase text-primary tracking-wider">
                  {selectedUnidade.cre} • {selectedUnidade.tipo}
                </span>
                <Badge
                  variant="outline"
                  className={
                    selectedUnidade.statusDemanda === 'CRITICO'
                      ? 'bg-rose-500/10 text-rose-500 border-rose-500/30 text-[10px] px-1.5 py-0'
                      : selectedUnidade.statusDemanda === 'EXCEDENTE_VAGAS'
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-[10px] px-1.5 py-0'
                      : 'bg-amber-500/10 text-amber-500 border-amber-500/30 text-[10px] px-1.5 py-0'
                  }
                >
                  {selectedUnidade.statusDemanda === 'CRITICO'
                    ? 'Fila Crítica'
                    : selectedUnidade.statusDemanda === 'EXCEDENTE_VAGAS'
                    ? 'Vagas Libres'
                    : 'Pressão Alta'}
                </Badge>
              </div>
              <h4 className="font-bold text-xs text-foreground leading-snug line-clamp-2">
                <Link
                  href={`/escola/${selectedUnidade.id}`}
                  className="hover:underline hover:text-primary transition-colors"
                >
                  {selectedUnidade.designacao}
                </Link>
              </h4>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3 text-primary shrink-0" />
                {selectedUnidade.bairro}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs border-y border-border py-2">
              <div className="space-y-0.5">
                <span className="text-muted-foreground text-[10px] flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-emerald-500" /> Vagas libres
                </span>
                <span className="font-bold text-emerald-600 font-mono text-sm">
                  {selectedUnidade.vagasOciosas}
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-muted-foreground text-[10px] flex items-center gap-1">
                  <Users className="h-3 w-3 text-amber-500" /> Fila esperas
                </span>
                <span className="font-bold text-amber-600 font-mono text-sm">
                  {selectedUnidade.filaTotal}
                </span>
              </div>
            </div>

            <div className="pt-0.5">
              <Link
                href={`/escola/${selectedUnidade.id}`}
                onClick={() => {
                  if (onSelectUnidade) {
                    onSelectUnidade(selectedUnidade);
                  }
                }}
                className="w-full h-7 text-xs font-semibold flex items-center justify-center gap-1.5 rounded-md bg-primary text-primary-foreground shadow hover:bg-primary/90 transition-colors"
              >
                <span>Ver Detalhes Completos</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </Popup>
      )}
    </>
  );
}
