'use client';

import React, { useState, useEffect } from 'react';
import { IndiceDesenvolvimentoSocialBairro } from '@/types/smdeis-intersetorial';
import { getIDSIntersetorial } from '@/actions/smdeis-demanda-socioeconomica';
import { ShieldAlert, BarChart3 } from 'lucide-react';

interface MapaIDSInterativoTabProps {
  selectedAp?: string;
  selectedRa?: string;
}

export function MapaIDSInterativoTab({ selectedAp, selectedRa }: MapaIDSInterativoTabProps) {
  const [idsData, setIdsData] = useState<IndiceDesenvolvimentoSocialBairro[]>([]);

  useEffect(() => {
    getIDSIntersetorial(selectedAp, selectedRa).then(setIdsData);
  }, [selectedAp, selectedRa]);

  const getBairroNome = (codigo: number) => {
    const map: Record<number, string> = { 1: 'Santo Cristo (Porto)', 103: 'Campo Grande', 82: 'Pavuna', 110: 'Santa Cruz', 95: 'Bangu' };
    return map[codigo] || `Bairro ${codigo}`;
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-400" /> Mapa Interativo do IDS (Índice de Desenvolvimento Social IPP / SME / SMDE)
            </h3>
            <p className="text-xs text-slate-400">Metodologia do Instituto Pereira Passos combinando renda/comércio (SMDE) com distorção idade-série e taxa de escolaridade (SME).</p>
          </div>
          <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-semibold rounded-full">
            Modelo Padrão IPP / DATA.RIO
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {idsData.map(item => (
            <div key={item.id} className="bg-slate-950 border border-slate-800 rounded-xl p-5 hover:border-purple-500/40 transition">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-white text-base">{getBairroNome(item.codigo_bairro)}</h4>
                <span className={`px-2.5 py-0.5 rounded text-xs font-extrabold uppercase ${
                  item.faixa_vulnerabilidade === 'Extrema' ? 'bg-red-950 text-red-400 border border-red-800/40' :
                  item.faixa_vulnerabilidade === 'Alta' ? 'bg-amber-950 text-amber-400 border border-amber-800/40' :
                  'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                }`}>
                  Vulnerabilidade {item.faixa_vulnerabilidade}
                </span>
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-xs text-slate-400">IDS Global do Bairro:</span>
                  <span className="text-lg font-extrabold text-purple-400">{item.ids_score}</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 h-full" style={{ width: `${item.ids_score * 100}%` }} />
                </div>
              </div>

              <div className="space-y-2 text-xs border-t border-slate-900 pt-3">
                <div className="flex justify-between">
                  <span className="text-slate-500">Subíndice Educação (SME):</span>
                  <span className="font-semibold text-white">{item.subindice_educacao}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Subíndice Renda/Trabalho (SMDE):</span>
                  <span className="font-semibold text-white">{item.subindice_renda_trabalho}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Subíndice Infraestrutura (IPP):</span>
                  <span className="font-semibold text-white">{item.subindice_infraestrutura}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-purple-950/30 border border-purple-800/40 rounded-xl text-xs text-purple-300 flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-purple-400 shrink-0" />
          <span>Bairros em faixa de Vulnerabilidade Extrema ou Alta disparam ações automáticas de Busca Ativa Preventiva e prioridade no orçamento participativo escolar.</span>
        </div>
      </div>
    </div>
  );
}
