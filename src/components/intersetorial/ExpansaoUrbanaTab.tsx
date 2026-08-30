'use client';

import React, { useState, useEffect } from 'react';
import { DemandaAdensamentoProjecao } from '@/types/smdeis-intersetorial';
import { getPredicoesAdensamentoUrbano } from '@/actions/smdeis-demanda-socioeconomica';
import { HardHat, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

interface ExpansaoUrbanaTabProps {
  selectedAp?: string;
  selectedRa?: string;
}

export function ExpansaoUrbanaTab({ selectedAp, selectedRa }: ExpansaoUrbanaTabProps) {
  const [projecoes, setProjecoes] = useState<DemandaAdensamentoProjecao[]>([]);

  useEffect(() => {
    getPredicoesAdensamentoUrbano(selectedAp, selectedRa).then(setProjecoes);
  }, [selectedAp, selectedRa]);

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <HardHat className="w-5 h-5 text-amber-400" /> Matriz de Expansão Habitacional & Demanda de Creche (0 a 3 Anos)
            </h3>
            <p className="text-xs text-slate-400">Projeção da demanda por novas turmas de creche com base em obras imobiliárias e licenças habitacionais aprovadas na SMDEIS.</p>
          </div>
          <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold rounded-full flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Horizonte 2026 - 2029
          </span>
        </div>

        <div className="space-y-4 mt-6">
          {projecoes.map(p => (
            <div key={p.codigo_bairro} className="bg-slate-950 border border-slate-800 rounded-xl p-5 hover:border-amber-500/40 transition">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-900 pb-4 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold text-white">{p.nome_bairro}</h4>
                    <span className={`px-2.5 py-0.5 rounded text-[11px] font-extrabold uppercase ${
                      p.risco_superlotacao === 'critico' ? 'bg-red-950 text-red-400 border border-red-800/40' :
                      p.risco_superlotacao === 'alto' ? 'bg-amber-950 text-amber-400 border border-amber-800/40' :
                      'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                    }`}>
                      Risco {p.risco_superlotacao}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{p.licenciamentos_atuais} projetos de obras aprovados no DATA.RIO</p>
                </div>

                <div className="flex items-center gap-6 text-right">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Unidades Habitacionais</span>
                    <span className="text-sm font-bold text-white">+{p.unidades_habitacionais.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Alunos Projetados</span>
                    <span className="text-sm font-bold text-amber-400">+{p.novos_alunos_estimados.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs text-slate-300 bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                {p.risco_superlotacao === 'critico' || p.risco_superlotacao === 'alto' ? (
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                )}
                <span>{p.recomendacao_expansao}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
