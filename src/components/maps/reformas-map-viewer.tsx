'use client';

import { useState, useMemo, useEffect } from 'react';
import type { EscolaReformaGeo } from '@/actions/geo-queries';
import dynamic from 'next/dynamic';

const BaseMap = dynamic(() => import('@/components/maps/base-map').then((mod) => mod.BaseMap), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-muted/10 rounded-2xl" />
});
import { Source, Layer, useMap, Popup } from 'react-map-gl/mapbox';
import { SlidersHorizontal, Wrench, Snowflake, Info, Landmark, CheckCircle2, ShieldAlert, FileText, Filter } from 'lucide-react';
import { formatNumber } from '@/lib/utils/formatters';
import Link from 'next/link';

interface ReformasMapViewerProps {
  reformas: EscolaReformaGeo[];
}

export function ReformasMapViewer({ reformas }: ReformasMapViewerProps) {
  const [selectedSchool, setSelectedSchool] = useState<EscolaReformaGeo | null>(null);
  const [creFilter, setCreFilter] = useState<number>(0);
  const [tipoFilter, setTipoFilter] = useState<string>('todos');
  const [osNotification, setOsNotification] = useState<string | null>(null);
  const { current: map } = useMap();

  // Filtros aplicados em tempo real
  const reformasFiltradas = useMemo(() => {
    return reformas.filter((r) => {
      const matchesCre = creFilter === 0 || r.cre_id === creFilter;
      const matchesTipo = tipoFilter === 'todos' ||
        (tipoFilter === 'clima' && !r.ar_condicionado) ||
        (tipoFilter === 'antigo' && r.ano_construcao < 1980) ||
        (tipoFilter === 'critico' && r.score_prioridade >= 80);

      return matchesCre && matchesTipo;
    });
  }, [reformas, creFilter, tipoFilter]);

  // Estatísticas e KPIs agregados
  const stats = useMemo(() => {
    const total = reformasFiltradas.length;
    const semAr = reformasFiltradas.filter(r => !r.ar_condicionado).length;
    const mediaIdade = total > 0
      ? Math.round(reformasFiltradas.reduce((acc, r) => acc + (new Date().getFullYear() - r.ano_construcao), 0) / total)
      : 0;
    const orcamentoEstimado = semAr * 180000 + (total - semAr) * 85000;

    return { total, semAr, mediaIdade, orcamentoEstimado };
  }, [reformasFiltradas]);

  // Converter para GeoJSON
  const geojson: any = {
    type: 'FeatureCollection',
    features: reformasFiltradas.map((r) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [r.lng, r.lat]
      },
      properties: {
        id: r.id,
        nome: r.nome,
        tipo: r.tipo,
        cre_id: r.cre_id,
        ano_construcao: r.ano_construcao,
        ar_condicionado: r.ar_condicionado,
        score_prioridade: r.score_prioridade
      }
    }))
  };

  useEffect(() => {
    if (!map) return;

    const handleMapClick = (event: any) => {
      const features = map.queryRenderedFeatures(event.point, {
        layers: ['reformas-point']
      });

      if (!features.length) {
        setSelectedSchool(null);
        return;
      }

      const clickedFeature = features[0];
      const props = clickedFeature.properties;

      if (props && props.id) {
        const school = reformas.find(e => e.id === props.id);
        if (school) {
          setSelectedSchool(school);
        }
      }
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [map, reformas]);

  const handleFlyToSchool = (school: EscolaReformaGeo) => {
    setSelectedSchool(school);
    if (map) {
      map.flyTo({
        center: [school.lng, school.lat],
        zoom: 15,
        duration: 2000
      });
    }
  };

  const handleGerarOrdemServico = (schoolName: string) => {
    const osId = `OS-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setOsNotification(`Ordem de Vistoria Técnica ${osId} solicitada com sucesso para a EOM/SME (${schoolName}).`);
    setTimeout(() => setOsNotification(null), 6000);
  };

  return (
    <div className="space-y-4">
      {/* Banner Explicativo & KPIs Superiores */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Unidades Prioritárias</span>
          <div className="text-2xl font-bold font-mono text-white mt-1">{stats.total} <span className="text-xs font-normal text-slate-400">escolas</span></div>
          <span className="text-[10px] text-orange-400 mt-1 font-semibold">Em monitoramento contínuo</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Demanda de Climatização</span>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-1">
            {stats.total > 0 ? Math.round((stats.semAr / stats.total) * 100) : 0}%
          </div>
          <span className="text-[10px] text-slate-400 mt-1">{stats.semAr} prédios necessitam de AR/GET</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Idade Média Predial</span>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1">{stats.mediaIdade} <span className="text-xs font-normal text-slate-400">anos</span></div>
          <span className="text-[10px] text-slate-400 mt-1">Parque escolar histórico da SME</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Orçamento Estimado</span>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            R$ {(stats.orcamentoEstimado / 1000000).toFixed(1)}M
          </div>
          <span className="text-[10px] text-slate-400 mt-1">Investimento projetado para adequação</span>
        </div>
      </div>

      {/* Toolbar de Filtros */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-white">
          <Wrench className="w-4 h-4 text-orange-400" />
          <span>Filtros do Modelo Predial:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Seletor CRE */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-300">
            <Filter className="w-3.5 h-3.5 text-orange-400" />
            <span>CRE:</span>
            <select
              value={creFilter}
              onChange={(e) => setCreFilter(Number(e.target.value))}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
            >
              <option value={0} className="bg-slate-900">Todas (11 CREs)</option>
              {Array.from({ length: 11 }, (_, i) => (
                <option key={i + 1} value={i + 1} className="bg-slate-900">{`${i + 1}ª CRE`}</option>
              ))}
            </select>
          </div>

          {/* Seletor Categoria de Reforma */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-300">
            <span>Intervenção:</span>
            <select
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value)}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
            >
              <option value="todos" className="bg-slate-900">Todas as Intervenções</option>
              <option value="clima" className="bg-slate-900">Pendente Climatização GET</option>
              <option value="critico" className="bg-slate-900">Prioridade Crítica (Score ≥ 80)</option>
              <option value="antigo" className="bg-slate-900">Prédios Históricos (&lt; 1980)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alerta de Notificação de Ordem de Serviço */}
      {osNotification && (
        <div className="p-3.5 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center justify-between gap-2 animate-fadeIn">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            {osNotification}
          </span>
          <button onClick={() => setOsNotification(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Main Grid: Sidebar + Map */}
      <div className="grid gap-6 lg:grid-cols-4 h-[calc(100vh-18rem)] min-h-[500px]">
        {/* Sidebar de Ranking de Prioridade */}
        <div className="glass-card rounded-2xl p-5 space-y-4 lg:col-span-1 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2.5">
              <h3 className="text-xs font-bold text-foreground flex items-center gap-2 uppercase tracking-wider">
                Ranking de Prioridade ({reformasFiltradas.length})
              </h3>
            </div>

            {/* Listagem das Escolas com maior Score */}
            <div className="space-y-2">
              {reformasFiltradas.map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => handleFlyToSchool(item)}
                  className={`p-3 border rounded-xl flex items-center justify-between gap-3 text-xs cursor-pointer transition-all ${
                    selectedSchool?.id === item.id
                      ? 'bg-orange-950/40 border-orange-500 text-white'
                      : 'bg-muted/10 border-border/40 hover:bg-muted/20 hover:border-orange-500/40 text-slate-300'
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-foreground block truncate max-w-[140px]">
                      {index + 1}. {item.nome}
                    </span>
                    <span className="text-[10px] text-muted-foreground block">
                      {item.cre_id}ª CRE · Ano {item.ano_construcao}
                    </span>
                  </div>
                  <span className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                    item.score_prioridade >= 80 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                    item.score_prioridade >= 60 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {item.score_prioridade.toFixed(1)}
                  </span>
                </div>
              ))}

              {reformasFiltradas.length === 0 && (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  Nenhuma escola atende aos filtros de intervenção selecionados.
                </div>
              )}
            </div>
          </div>

          {/* Nota Explicativa do Modelo */}
          <div className="flex gap-2.5 bg-slate-900 border border-slate-800 p-3 rounded-xl text-[11px] text-slate-400">
            <Info className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              O **Score de Reforma (0-100)** prioriza edificações com mais tempo de construção, déficit de climatização (GET) e baixo histórico de investimento de manutenção.
            </p>
          </div>
        </div>

        {/* Visualizador do Mapa */}
        <div className="lg:col-span-3 h-full rounded-2xl overflow-hidden relative border border-slate-800">
          <BaseMap>
            <Source id="reformas-source" type="geojson" data={geojson}>
              <Layer
                id="reformas-point"
                type="circle"
                source="reformas-source"
                paint={{
                  'circle-color': [
                    'interpolate',
                    ['linear'],
                    ['get', 'score_prioridade'],
                    50, '#10B981',
                    75, '#F59E0B',
                    85, '#EF4444'
                  ],
                  'circle-radius': [
                    'interpolate',
                    ['linear'],
                    ['get', 'score_prioridade'],
                    50, 7,
                    85, 14
                  ],
                  'circle-stroke-width': 2,
                  'circle-stroke-color': '#ffffff'
                }}
              />
            </Source>

            {/* Popup de detalhe da escola */}
            {selectedSchool && (
              <Popup
                longitude={selectedSchool.lng}
                latitude={selectedSchool.lat}
                anchor="bottom"
                onClose={() => setSelectedSchool(null)}
                closeOnClick={false}
                offset={10}
              >
                <div className="p-3.5 w-72 space-y-3 font-sans relative z-50">
                  <div>
                    <span className="text-[10px] uppercase font-extrabold text-orange-400 tracking-wider">
                      {selectedSchool.tipo} · {selectedSchool.cre_id}ª CRE
                    </span>
                    <h4 className="font-bold text-sm text-foreground leading-tight mt-0.5">
                      <Link href={`/escola/${selectedSchool.id}`} className="hover:underline hover:text-primary transition-colors">
                        {selectedSchool.nome}
                      </Link>
                    </h4>
                  </div>

                  <div className="space-y-1.5 text-xs border-y border-border py-2.5">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ano de Construção:</span>
                      <span className="font-bold text-foreground">{selectedSchool.ano_construcao}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Climatização GET:</span>
                      {selectedSchool.ar_condicionado ? (
                        <span className="text-emerald-400 font-semibold">Instalada</span>
                      ) : (
                        <span className="text-rose-400 font-bold bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">Requer Instalação Urgentemente</span>
                      )}
                    </div>
                    <div className="flex justify-between pt-1 border-t border-border/50">
                      <span className="text-muted-foreground font-semibold">Score Prioridade:</span>
                      <span className="font-bold text-orange-400 font-mono">{selectedSchool.score_prioridade.toFixed(1)} / 100</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleGerarOrdemServico(selectedSchool.nome)}
                    className="w-full py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition"
                  >
                    <FileText className="w-3.5 h-3.5" /> Solicitar Vistoria Técnica (EOM)
                  </button>
                </div>
              </Popup>
            )}
          </BaseMap>
        </div>
      </div>
    </div>
  );
}
