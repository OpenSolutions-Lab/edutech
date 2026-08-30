'use client';

import React, { useState, useEffect } from 'react';
import { AreaPlanejamento, RegiaoAdministrativa } from '@/types/smdeis-intersetorial';
import { getAreasPlanejamento, getRegioesAdministrativas } from '@/actions/smdeis-demanda-socioeconomica';
import { GeoOverlaysTab } from '@/components/intersetorial/GeoOverlaysTab';
import { EmpregabilidadeTecnicaTab } from '@/components/intersetorial/EmpregabilidadeTecnicaTab';
import { ExpansaoUrbanaTab } from '@/components/intersetorial/ExpansaoUrbanaTab';
import { MapaIDSInterativoTab } from '@/components/intersetorial/MapaIDSInterativoTab';
import { Network, MapPin, Briefcase, HardHat, BarChart3, Filter } from 'lucide-react';

export default function IntersetorialPage() {
  const [activeTab, setActiveTab] = useState<'geo' | 'empregabilidade' | 'expansao' | 'ids'>('geo');
  const [aps, setAps] = useState<AreaPlanejamento[]>([]);
  const [ras, setRas] = useState<RegiaoAdministrativa[]>([]);
  const [selectedAp, setSelectedAp] = useState<string>('');
  const [selectedRa, setSelectedRa] = useState<string>('');

  useEffect(() => {
    getAreasPlanejamento().then(setAps);
    getRegioesAdministrativas().then(setRas);
  }, []);

  const handleApChange = (apCode: string) => {
    setSelectedAp(apCode);
    setSelectedRa('');
    getRegioesAdministrativas(apCode || undefined).then(setRas);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Header Intersetorial */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600/20 text-blue-400 rounded-2xl border border-blue-500/30">
              <Network className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                Inteligência Intersetorial: SME + SMDEIS Rio
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Conectando Educação Municipal, Desenvolvimento Econômico e os microdados do DATA.RIO / Instituto Pereira Passos (IPP).
              </p>
            </div>
          </div>
        </div>

        {/* Filtro por Chaves Primárias Universais (AP & RA) */}
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-2.5 rounded-2xl">
          <div className="flex items-center gap-2 px-2 text-slate-400 text-xs font-semibold">
            <Filter className="w-4 h-4 text-blue-400" /> Escopo Territorial:
          </div>
          <select
            value={selectedAp}
            onChange={e => handleApChange(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 font-semibold"
          >
            <option value="">Todas as APs (1 a 5)</option>
            {aps.map(ap => (
              <option key={ap.codigo_ap} value={ap.codigo_ap}>{ap.nome}</option>
            ))}
          </select>

          <select
            value={selectedRa}
            onChange={e => setSelectedRa(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 font-semibold"
          >
            <option value="">Todas as RAs</option>
            {ras.map(ra => (
              <option key={ra.codigo_ra} value={ra.codigo_ra.toString()}>{ra.nome}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs de Navegação Principal */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800/80 pb-2">
        <button
          onClick={() => setActiveTab('geo')}
          className={`px-5 py-3 rounded-xl font-bold text-sm transition flex items-center gap-2.5 ${
            activeTab === 'geo'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <MapPin className="w-4 h-4" /> Geoprocessamento de Creches & Overlays
        </button>

        <button
          onClick={() => setActiveTab('empregabilidade')}
          className={`px-5 py-3 rounded-xl font-bold text-sm transition flex items-center gap-2.5 ${
            activeTab === 'empregabilidade'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Briefcase className="w-4 h-4" /> Mães no Mercado & Apoio de Creche
        </button>

        <button
          onClick={() => setActiveTab('expansao')}
          className={`px-5 py-3 rounded-xl font-bold text-sm transition flex items-center gap-2.5 ${
            activeTab === 'expansao'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <HardHat className="w-4 h-4" /> Expansão Habitacional & Creche (0-3a)
        </button>

        <button
          onClick={() => setActiveTab('ids')}
          className={`px-5 py-3 rounded-xl font-bold text-sm transition flex items-center gap-2.5 ${
            activeTab === 'ids'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" /> Mapa IDS (Vulnerabilidade da Primeira Infância)
        </button>
      </div>

      {/* Renderização da Tab Ativa */}
      <div className="space-y-8">
        {activeTab === 'geo' && <GeoOverlaysTab selectedAp={selectedAp} selectedRa={selectedRa} />}
        {activeTab === 'empregabilidade' && <EmpregabilidadeTecnicaTab selectedAp={selectedAp} selectedRa={selectedRa} />}
        {activeTab === 'expansao' && <ExpansaoUrbanaTab selectedAp={selectedAp} selectedRa={selectedRa} />}
        {activeTab === 'ids' && <MapaIDSInterativoTab selectedAp={selectedAp} selectedRa={selectedRa} />}
      </div>
    </div>
  );
}
