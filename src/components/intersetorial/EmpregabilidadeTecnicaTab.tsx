'use client';

import React, { useState, useEffect } from 'react';
import { RecomendacaoCursoTecnico } from '@/types/smdeis-intersetorial';
import { getRecomendacoesQualificacaoTecnica } from '@/actions/smdeis-demanda-socioeconomica';
import { Briefcase, GraduationCap, Building2, CheckCircle2 } from 'lucide-react';

interface EmpregabilidadeTecnicaTabProps {
  selectedAp?: string;
  selectedRa?: string;
}

export function EmpregabilidadeTecnicaTab({ selectedAp, selectedRa }: EmpregabilidadeTecnicaTabProps) {
  const [recs, setRecs] = useState<RecomendacaoCursoTecnico[]>([]);

  useEffect(() => {
    getRecomendacoesQualificacaoTecnica(selectedAp, selectedRa).then(setRecs);
  }, [selectedAp, selectedRa]);

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-emerald-400" /> Mercado de Trabalho Feminino & Apoio de Creche (SMDEIS + SME)
            </h3>
            <p className="text-xs text-slate-400">Cruzamento de microdados do Observatório do Trabalho com a necessidade de turmas de creche em horário integral para mães trabalhadoras.</p>
          </div>
          <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Apoio à Trabalhadora Sincronizado
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {recs.map((rec, idx) => (
            <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-5 hover:border-emerald-500/40 transition flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
                    {rec.nome_bairro}
                  </span>
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                    rec.nivel_prioridade === 'urgente' ? 'bg-red-950 text-red-400 border border-red-800/40' : 'bg-amber-950 text-amber-400 border border-amber-800/40'
                  }`}>
                    Prioridade {rec.nivel_prioridade}
                  </span>
                </div>

                <div className="mt-3">
                  <div className="text-xs text-slate-500">Demanda de Mercado (Vagas Abertas):</div>
                  <div className="text-base font-bold text-emerald-400 flex items-center gap-1.5 mt-0.5">
                    <Building2 className="w-4 h-4" /> {rec.setor_demanda} ({rec.vagas_abertas} vagas/mês)
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-900">
                  <div className="text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1">
                    <GraduationCap className="w-4 h-4 text-blue-400" /> Curso Recomendado pela IA:
                  </div>
                  <div className="text-sm font-bold text-white">{rec.curso_sugerido}</div>
                </div>
              </div>

              <div className="pt-2">
                <span className="text-[11px] font-semibold text-indigo-400 bg-indigo-950/50 px-3 py-1.5 rounded-lg border border-indigo-800/40 block text-center">
                  Parceiro: {rec.parceiro_recomendado}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
