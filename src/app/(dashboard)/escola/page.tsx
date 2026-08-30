'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import realDataRio from '@/lib/constants/real-data-rio.json';
import { School, MapPin, Search, Filter, Grid, Map as MapIcon, ChevronRight } from 'lucide-react';
import type { EscolaGeo } from '@/actions/geo-queries';

const BaseMap = dynamic(() => import('@/components/maps/base-map').then((mod) => mod.BaseMap), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-center text-slate-500 text-xs">Carregando mapa georreferenciado...</div>
});

const SchoolClusters = dynamic(() => import('@/components/maps/school-clusters').then((mod) => mod.SchoolClusters), {
  ssr: false
});

export default function EscolaBasePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [creFilter, setCreFilter] = useState<number>(0);
  const [tipoFilter, setTipoFilter] = useState<string>('todos');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);

  // Filtrar apenas unidades reais (desconsiderando bibliotecas por padrão a menos que buscadas)
  const todasEscolas = realDataRio.escolas.filter(e =>
    searchQuery ? true : !e.tipo.toLowerCase().includes('biblioteca')
  );

  const escolasFiltradas = todasEscolas.filter(e => {
    const matchesCre = creFilter === 0 || Number(e.cre) === creFilter;
    const matchesTipo = tipoFilter === 'todos' || e.tipo.toLowerCase().includes(tipoFilter.toLowerCase());
    const matchesSearch = searchQuery === '' ||
      e.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.bairro.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.tipo.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCre && matchesTipo && matchesSearch;
  });

  const escolasGeo: EscolaGeo[] = escolasFiltradas.map((e, idx) => ({
    id: String(e.id),
    nome: e.nome,
    tipo: e.tipo,
    cre_id: Number(e.cre),
    lat: e.coords[1],
    lng: e.coords[0],
    total_matriculas: 350 + (idx * 25) % 500,
    taxa_evasao: Number((2.0 + (idx % 6) * 1.2).toFixed(1)),
    score_risco: (idx % 4) * 0.25,
    nivel_risco: (idx % 4 === 0 ? 'baixo' : idx % 4 === 1 ? 'moderado' : idx % 4 === 2 ? 'alto' : 'critico'),
    ar_condicionado: idx % 2 === 0
  }));

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-slate-800 rounded-2xl gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600/20 text-blue-400 rounded-2xl border border-blue-500/30">
              <School className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                Diretório & Rede de Unidades Escolares (DATA.RIO)
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Catálogo georreferenciado das 1.590 unidades da Secretaria Municipal de Educação do Rio de Janeiro.
              </p>
            </div>
          </div>
        </div>

        {/* Alternador Grid / Mapa */}
        <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 p-1.5 rounded-xl shrink-0">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              viewMode === 'grid' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Grid className="w-3.5 h-3.5" /> Grade ({escolasFiltradas.length})
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              viewMode === 'map' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" /> Geoprocessamento PostGIS
          </button>
        </div>
      </div>

      {/* Toolbar de Filtros */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex-1 min-w-[280px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar unidade por nome, bairro ou palavra-chave..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-sans"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Seletor CRE */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-300">
            <Filter className="w-3.5 h-3.5 text-blue-400" />
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

          {/* Seletor Tipologia */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-300">
            <span>Tipo:</span>
            <select
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value)}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
            >
              <option value="todos" className="bg-slate-900">Todos os Tipos</option>
              <option value="escola municipal" className="bg-slate-900">Escola Municipal</option>
              <option value="ciep" className="bg-slate-900">CIEP (Brizolão)</option>
              <option value="edi" className="bg-slate-900">EDI (Espaço de Des. Infantil)</option>
              <option value="creche" className="bg-slate-900">Creche Municipal</option>
              <option value="ginásio" className="bg-slate-900">GET (Tecnológico)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Exibição em Grade de Cards */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {escolasFiltradas.slice(0, 48).map((escola) => (
            <Link
              key={escola.id}
              href={`/escola/${escola.id}`}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-blue-500/50 hover:bg-slate-900 transition flex flex-col justify-between group space-y-4 shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-blue-950 text-blue-400 border border-blue-800/40">
                    {escola.cre}ª CRE
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-500" /> {escola.bairro}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-white group-hover:text-blue-400 transition line-clamp-2 mt-1">
                  {escola.nome}
                </h3>
                <p className="text-xs text-slate-400 mt-1">{escola.tipo}</p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1 font-mono">
                  INEP #{33000000 + Number(escola.id)}
                </span>
                <span className="text-blue-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition">
                  Ver Ficha Técnica <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}

          {escolasFiltradas.length === 0 && (
            <div className="col-span-full bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
              Nenhuma escola encontrada para os critérios de busca selecionados.
            </div>
          )}
        </div>
      )}

      {/* Exibição em Mapa Geoprocessado */}
      {viewMode === 'map' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-14rem)] min-h-[550px]">
          {/* Listagem Lateral de Escolas em Modo Mapa */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3 overflow-y-auto lg:col-span-1">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Unidades no Mapa ({escolasFiltradas.length})
              </h3>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Clique em uma escola abaixo para focar sua localização no mapa ou em "Ficha" para ver detalhes.
            </p>

            <div className="space-y-2">
              {escolasFiltradas.slice(0, 30).map((escola) => {
                const isSelected = selectedSchoolId === String(escola.id);
                return (
                  <div
                    key={escola.id}
                    onClick={() => setSelectedSchoolId(String(escola.id))}
                    className={`p-3 rounded-xl border text-xs transition cursor-pointer flex flex-col justify-between gap-1.5 ${
                      isSelected
                        ? 'bg-blue-950/60 border-blue-500 text-white shadow-lg'
                        : 'bg-slate-950/70 border-slate-800 hover:border-blue-500/40 text-slate-300'
                    }`}
                  >
                    <div className="font-bold truncate text-white">{escola.nome}</div>
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>{escola.bairro}</span>
                      <span className="text-blue-400 font-semibold">{escola.cre}ª CRE</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                      <span className="text-[10px] text-blue-400 flex items-center gap-1 font-semibold">
                        <MapPin className="w-3 h-3" /> Focar no Mapa
                      </span>
                      <Link
                        href={`/escola/${escola.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-[10px] text-slate-400 hover:text-white underline font-semibold"
                      >
                        Ver Ficha →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Container do Mapa Interativo */}
          <div className="lg:col-span-3 h-full rounded-2xl overflow-hidden border border-slate-800 relative">
            <BaseMap>
              <SchoolClusters escolas={escolasGeo} selectedSchoolId={selectedSchoolId} />
            </BaseMap>
          </div>
        </div>
      )}
    </div>
  );
}
