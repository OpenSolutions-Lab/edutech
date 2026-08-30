'use client';

import React, { useState, useEffect } from 'react';
import { VazioCuidadoInfantilItem, HubEconomico, IndicadoresEconomicosBairro } from '@/types/smdeis-intersetorial';
import { getVaziosCuidadoInfantil, getHubsEconomicos, getIndicadoresEconomicos } from '@/actions/smdeis-demanda-socioeconomica';
import { PedagogicoContextualizadorModal } from './PedagogicoContextualizadorModal';
import { MapPin, Users, Building2, AlertTriangle, Sparkles, Filter, ShieldAlert } from 'lucide-react';

interface GeoOverlaysTabProps {
  selectedAp?: string;
  selectedRa?: string;
}

export function GeoOverlaysTab({ selectedAp, selectedRa }: GeoOverlaysTabProps) {
  const [activeOverlay, setActiveOverlay] = useState<'creches' | 'hubs' | 'adensamento'>('creches');
  const [vazios, setVazios] = useState<VazioCuidadoInfantilItem[]>([]);
  const [hubs, setHubs] = useState<HubEconomico[]>([]);
  const [indicadores, setIndicadores] = useState<IndicadoresEconomicosBairro[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBairro, setSelectedBairro] = useState({ nome: 'Santo Cristo', setor: 'Tecnologia' });

  useEffect(() => {
    getVaziosCuidadoInfantil(selectedAp, selectedRa).then(setVazios);
    getHubsEconomicos(selectedAp, selectedRa).then(setHubs);
    getIndicadoresEconomicos(selectedAp, selectedRa).then(setIndicadores);
  }, [selectedAp, selectedRa]);

  const openPedagogicoModal = (nome: string, setor: string) => {
    setSelectedBairro({ nome, setor });
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Controles de Overlay */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-blue-400" />
          <span className="text-sm font-semibold text-white">Camadas de Geoprocessamento Intersetorial:</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveOverlay('creches')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeOverlay === 'creches'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" /> Vazios de Creche × Mães Trabalhadoras
          </button>

          <button
            onClick={() => setActiveOverlay('hubs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeOverlay === 'hubs'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" /> Hubs Econômicos × Creches Conveneadas
          </button>

          <button
            onClick={() => setActiveOverlay('adensamento')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeOverlay === 'adensamento'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/20'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-4 h-4" /> Adensamento Imobiliário × Bebês (0 a 3a)
          </button>
        </div>
      </div>

      {/* Visão de Conteúdo por Overlay */}
      {activeOverlay === 'creches' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 relative min-h-[420px] flex flex-col justify-between overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-400" /> Mapa de Vazios de Cuidado Infantil vs. Mães no Mercado Formal
                  </h3>
                  <p className="text-xs text-slate-400">Cruzamento de déficit de vagas em creches com a presença de trabalhadoras e MEIs femininas no bairro.</p>
                </div>
                <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold rounded-full">
                  PostGIS Spatial Join Active
                </span>
              </div>

              {/* Simulação Visual de Mapa Geográfico */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                {vazios.map(item => (
                  <div key={item.codigo_bairro} className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl hover:border-blue-500/50 transition">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-white text-sm">{item.bairro_nome}</h4>
                      <span className="text-xs font-bold text-red-400 bg-red-950/40 px-2 py-0.5 rounded border border-red-800/40">
                        Score {item.score_prioridade}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                      <div>
                        <span className="text-slate-500 block">Déficit Creches:</span>
                        <span className="font-semibold text-white">{item.deficit_creches.toLocaleString()} vagas</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Mulheres Formais:</span>
                        <span className="font-semibold text-emerald-400">{item.trabalhadoras_formais_pct}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10 mt-6 p-4 bg-blue-950/40 border border-blue-800/40 rounded-xl text-xs text-blue-300 flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-blue-400 shrink-0" />
              <span>A prioridade de expansão de vagas não considera apenas o déficit absoluto, mas garante suporte socioeconômico a mães trabalhadoras.</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Ranking de Prioridade Educacional</h4>
              <div className="space-y-3">
                {vazios.slice(0, 4).map((v, idx) => (
                  <div key={v.codigo_bairro} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                        #{idx + 1}
                      </span>
                      <div>
                        <div className="text-sm font-bold text-white">{v.bairro_nome}</div>
                        <div className="text-xs text-slate-400">{v.mei_mulheres_total} MEIs femininas</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-amber-400">{v.deficit_creches} vagas em falta</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeOverlay === 'hubs' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 relative">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-400" /> Hubs Econômicos & Creches Conveneadas/Parceiras
            </h3>
            <p className="text-xs text-slate-400 mb-6">Mapeamento de creches parceiras em polos comerciais e industriais de forte empregabilidade feminina.</p>

            <div className="space-y-4">
              {hubs.map(hub => (
                <div key={hub.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-indigo-950 text-indigo-400 border border-indigo-800/40">
                        {hub.tipo_hub}
                      </span>
                      <h4 className="font-bold text-white text-base">{hub.nome}</h4>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{hub.descricao}</p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold rounded-lg">
                    Creches Conveneadas Mapeadas
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h4 className="text-sm font-bold text-white mb-3">Rede de Creches Conveneadas</h4>
            <p className="text-xs text-slate-400 mb-4">Garantia de vagas em horário integral nos polos econômicos de alta densidade de trabalhadoras formais e MEIs.</p>
            <div className="p-4 bg-indigo-950/30 border border-indigo-800/40 rounded-xl text-xs text-indigo-300">
              O modelo analítico calcula o grau de substituição entre a construção de novos EDIs públicos e o credenciamento de creches parceiras.
            </div>
          </div>
        </div>
      )}

      {activeOverlay === 'adensamento' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" /> Mancha de Licenciamento Imobiliário × Impacto em Creche (0 a 3a)
          </h3>
          <p className="text-xs text-slate-400 mb-6">Projeção da demanda por turmas de berçário e maternal gerada pelo adensamento residencial nos próximos 24-36 meses.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {indicadores.map(ind => (
              <div key={ind.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                <h4 className="font-bold text-white text-sm mb-1">{ind.nome_bairro}</h4>
                <div className="text-xs text-slate-400 mb-3">{ind.regiao_administrativa}</div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Licenciamentos Aprovados:</span>
                    <span className="font-bold text-amber-400">{ind.novos_licenciamentos_imobiliarios} projetos</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Unidades Habitacionais:</span>
                    <span className="font-bold text-white">+{ind.unidades_habitacionais_projetadas} hab.</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Demanda Estimada de Creche:</span>
                    <span className="font-bold text-emerald-400">+{Math.round(ind.unidades_habitacionais_projetadas * 0.18)} bebês (0-3a)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <PedagogicoContextualizadorModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        bairroNome={selectedBairro.nome}
        setorPredominante={selectedBairro.setor}
      />
    </div>
  );
}
