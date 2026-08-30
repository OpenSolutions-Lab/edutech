'use client';

import { useState, useEffect } from 'react';
import { Source, Layer, useMap, Popup } from 'react-map-gl/mapbox';
import type { EscolaGeo } from '@/actions/geo-queries';
import { formatNumber, formatPercentRaw, formatRiskLevel } from '@/lib/utils/formatters';
import { GraduationCap, MapPin, AlertCircle, School, Snowflake } from 'lucide-react';
import Link from 'next/link';

interface SchoolClustersProps {
  escolas: EscolaGeo[];
  selectedSchoolId?: string | null;
  onSelectSchool?: (school: EscolaGeo | null) => void;
}

export function SchoolClusters({ escolas, selectedSchoolId, onSelectSchool }: SchoolClustersProps) {
  const { current: map } = useMap();
  const [selectedSchool, setSelectedSchool] = useState<EscolaGeo | null>(null);

  useEffect(() => {
    if (selectedSchoolId) {
      const found = escolas.find(e => e.id === selectedSchoolId);
      if (found) {
        setSelectedSchool(found);
        if (map) {
          map.resize();
          map.flyTo({
            center: [found.lng, found.lat],
            zoom: 16,
            duration: 1500
          });
        }
      }
    }
  }, [selectedSchoolId, escolas, map]);

  // Converter escolas para GeoJSON
  const geojson: any = {
    type: 'FeatureCollection',
    features: escolas.map((esc) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [esc.lng, esc.lat]
      },
      properties: {
        id: esc.id,
        nome: esc.nome,
        tipo: esc.tipo,
        cre_id: esc.cre_id,
        total_matriculas: esc.total_matriculas,
        taxa_evasao: esc.taxa_evasao,
        score_risco: esc.score_risco,
        nivel_risco: esc.nivel_risco,
        ar_condicionado: esc.ar_condicionado
      }
    }))
  };

  useEffect(() => {
    if (!map) return;

    const handleMapClick = (event: any) => {
      const features = map.queryRenderedFeatures(event.point, {
        layers: ['clusters', 'unclustered-point']
      });

      if (!features.length) {
        setSelectedSchool(null);
        return;
      }

      const clickedFeature = features[0];
      
      // Se clicou em um cluster, faz zoom
      if (clickedFeature.layer && clickedFeature.layer.id === 'clusters') {
        const clusterId = clickedFeature.properties?.cluster_id;
        const source: any = map.getSource('escolas-source');
        source.getClusterExpansionZoom(clusterId, (err: any, zoom: number) => {
          if (err) return;
          map.easeTo({
            center: (clickedFeature.geometry as any).coordinates,
            zoom: Math.min(zoom + 1, 16)
          });
        });
        return;
      }

      // Se clicou em uma escola individual, abre popup
      if (clickedFeature.layer && clickedFeature.layer.id === 'unclustered-point') {
        const props = clickedFeature.properties;
        const school = escolas.find(e => e.id === props?.id);
        if (school) {
          setSelectedSchool(school);
        }
      }
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [map, escolas]);

  return (
    <>
      <Source
        id="escolas-source"
        type="geojson"
        data={geojson}
        cluster={true}
        clusterMaxZoom={14}
        clusterRadius={50}
      >
        {/* Camada de círculos de clusters */}
        <Layer
          id="clusters"
          type="circle"
          source="escolas-source"
          filter={['has', 'point_count']}
          paint={{
            'circle-color': [
              'step',
              ['get', 'point_count'],
              'rgba(59, 130, 246, 0.65)',  // Azul para clusters pequenos
              30,
              'rgba(139, 92, 246, 0.65)',  // Violeta para clusters médios
              100,
              'rgba(244, 63, 94, 0.65)'    // Vermelho para grandes clusters
            ],
            'circle-radius': [
              'step',
              ['get', 'point_count'],
              18,  // raio inicial
              30,
              24,  // raio médio
              100,
              30   // raio grande
            ],
            'circle-stroke-width': 2,
            'circle-stroke-color': 'rgba(255, 255, 255, 0.1)'
          }}
        />

        {/* Camada de texto numérico dos clusters */}
        <Layer
          id="cluster-count"
          type="symbol"
          source="escolas-source"
          filter={['has', 'point_count']}
          layout={{
            'text-field': ['get', 'point_count_abbreviated'],
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12
          }}
          paint={{
            'text-color': '#ffffff'
          }}
        />

        {/* Camada de escolas individuais (não agrupadas) */}
        <Layer
          id="unclustered-point"
          type="circle"
          source="escolas-source"
          filter={['!', ['has', 'point_count']]}
          paint={{
            'circle-color': [
              'match',
              ['get', 'nivel_risco'],
              'baixo', '#10B981',
              'moderado', '#F59E0B',
              'alto', '#F97316',
              'critico', '#EF4444',
              '#3B82F6' // default
            ],
            'circle-radius': 7,
            'circle-stroke-width': 1.5,
            'circle-stroke-color': '#ffffff'
          }}
        />
      </Source>



      {/* Popup de detalhe ao clicar na escola */}
      {selectedSchool && (
        <Popup
          longitude={selectedSchool.lng}
          latitude={selectedSchool.lat}
          anchor="bottom"
          onClose={() => setSelectedSchool(null)}
          closeOnClick={false}
          offset={10}
        >
          <div className="p-4 w-72 space-y-3 font-sans relative z-50">
            {/* Header */}
            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                {selectedSchool.tipo} · {selectedSchool.cre_id}ª CRE
              </span>
              <h4 className="font-bold text-sm text-foreground leading-tight hover:text-primary transition-colors mt-0.5">
                <Link href={`/escola/${selectedSchool.id}`} className="hover:underline">
                  {selectedSchool.nome}
                </Link>
              </h4>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 gap-2 text-xs border-y border-border py-2.5">
              <div className="space-y-0.5">
                <span className="text-muted-foreground flex items-center gap-1">
                  <GraduationCap className="h-3 w-3" /> Matrículas
                </span>
                <span className="font-bold text-foreground font-mono">{formatNumber(selectedSchool.total_matriculas)}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> Evasão
                </span>
                <span className="font-bold text-foreground font-mono">{formatPercentRaw(selectedSchool.taxa_evasao)}</span>
              </div>
            </div>

            {/* Risk and Clim */}
            <div className="flex items-center justify-between gap-2 pt-0.5">
              {/* Risco */}
              <div className="flex items-center gap-1 text-[11px] font-semibold">
                <AlertCircle className={`h-3.5 w-3.5 ${formatRiskLevel(selectedSchool.score_risco).color}`} />
                <span className={formatRiskLevel(selectedSchool.score_risco).color}>
                  Risco {selectedSchool.nivel_risco}
                </span>
              </div>
              
              {/* Climatização */}
              {selectedSchool.ar_condicionado ? (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                  <Snowflake className="h-3 w-3 animate-spin" style={{ animationDuration: '6s' }} /> Climatizada
                </span>
              ) : (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded border border-orange-500/20">
                  Sem Clima
                </span>
              )}
            </div>
          </div>
        </Popup>
      )}
    </>
  );
}
