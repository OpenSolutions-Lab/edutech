'use client';

import React, { useState, useEffect } from 'react';
import { getEWSAlerts, generateBuscaAtivaPlan, EWSAlert } from '@/actions/early-warning-system';
import { AlertTriangle, ShieldAlert, FileText, CheckCircle2, RefreshCw, ChevronRight } from 'lucide-react';
import { FormattedMarkdown } from '@/components/ui/formatted-markdown';

export function EWSView() {
  const [alerts, setAlerts] = useState<EWSAlert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<EWSAlert | null>(null);
  const [generatedPlan, setGeneratedPlan] = useState<string | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [creFilter, setCreFilter] = useState<number>(0);
  const [riskFilter, setRiskFilter] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    async function load() {
      const data = await getEWSAlerts(creFilter || undefined);
      setAlerts(data);
      if (data.length > 0) setSelectedAlert(data[0]);
    }
    load();
  }, [creFilter]);

  const handleGeneratePlan = async (alert: EWSAlert) => {
    setLoadingPlan(true);
    try {
      const plan = await generateBuscaAtivaPlan(alert.escolaNome, alert.turma, alert.fatoresShap);
      setGeneratedPlan(plan);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPlan(false);
    }
  };

  const filteredAlerts = alerts.filter(a => {
    const matchesRisk = riskFilter === 'todos' || a.nivelRisco === riskFilter;
    const matchesSearch = searchQuery === '' ||
      a.escolaNome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.bairro.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.turma.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRisk && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Banner & Escopo Territorial */}
      <div className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900 border border-rose-500/30 rounded-2xl gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-400" />
            Early Warning System (EWS) & Fatores SHAP de Evasão
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Inteligência Preditiva em granularidade de turma/escola baseada em microssinais da SME e do DATA.RIO.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={creFilter}
            onChange={(e) => setCreFilter(Number(e.target.value))}
            className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500 font-semibold"
          >
            <option value={0}>Todas as 11 Coordenadorias (CREs)</option>
            {Array.from({ length: 11 }, (_, i) => (
              <option key={i + 1} value={i + 1}>{`${i + 1}ª CRE`}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left List of Alerts */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white">Turmas em Alerta ({filteredAlerts.length})</h2>
            <span className="text-[11px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-mono font-semibold">
              Explicabilidade SHAP
            </span>
          </div>

          {/* Busca por Nome/Bairro */}
          <input
            type="text"
            placeholder="Filtrar por escola, bairro ou turma..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />

          {/* Tabs por Faixa de Risco */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
            {(['todos', 'critico', 'alto', 'moderado', 'baixo'] as const).map(r => (
              <button
                key={r}
                onClick={() => setRiskFilter(r)}
                className={`px-2.5 py-1 rounded-lg font-bold capitalize transition ${
                  riskFilter === r
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="space-y-2.5 max-h-[540px] overflow-y-auto pr-1">
            {filteredAlerts.map((a) => {
              const isSelected = selectedAlert?.id === a.id;
              return (
                <button
                  key={a.id}
                  onClick={() => {
                    setSelectedAlert(a);
                    setGeneratedPlan(null);
                  }}
                  className={`w-full text-left p-3.5 rounded-xl border transition ${
                    isSelected
                      ? 'bg-rose-950/40 border-rose-500/50 text-white'
                      : 'bg-slate-900 hover:bg-slate-800/80 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-xs truncate text-white">{a.escolaNome}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase shrink-0 ${
                      a.nivelRisco === 'critico' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                      a.nivelRisco === 'alto' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      a.nivelRisco === 'moderado' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                      'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {a.nivelRisco}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400">{a.turma} • {a.cre}</div>
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-800/60 text-[11px]">
                    <span className="text-slate-400">Score Risco: <strong className="text-rose-400 font-mono">{(a.scoreRisco * 100).toFixed(0)}%</strong></span>
                    <span className="text-slate-500 flex items-center gap-1">Ver Fatores <ChevronRight className="w-3 h-3" /></span>
                  </div>
                </button>
              );
            })}

            {filteredAlerts.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-500">
                Nenhuma turma encontrada para o filtro de risco selecionado.
              </div>
            )}
          </div>
        </div>

        {/* Right Detail Pane */}
        <div className="lg:col-span-2 space-y-6">
          {selectedAlert ? (
            <>
              {/* Card Title & Info */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">{selectedAlert.cre} • {selectedAlert.bairro}</span>
                    <h2 className="text-xl font-bold text-white mt-0.5">{selectedAlert.escolaNome}</h2>
                    <p className="text-xs text-slate-400 mt-1">{selectedAlert.turma}</p>
                  </div>

                  <button
                    onClick={() => handleGeneratePlan(selectedAlert)}
                    disabled={loadingPlan}
                    className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs flex items-center gap-2 transition shrink-0"
                  >
                    <FileText className="w-4 h-4" />
                    <span>{loadingPlan ? 'Gerando Plano IA...' : 'Gerar Plano Busca Ativa'}</span>
                  </button>
                </div>

                {/* SHAP Factors Bar Breakdown */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Decomposição dos Fatores SHAP (Explicabilidade da IA)
                  </h3>

                  <div className="space-y-2.5">
                    {selectedAlert.fatoresShap.map((f, idx) => (
                      <div key={idx} className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 space-y-1.5">
                        <div className="flex justify-between text-xs font-medium text-slate-200">
                          <span>{f.fator}</span>
                          <span className="text-rose-400 font-mono font-bold">+{(f.peso * 100).toFixed(0)}% impacto</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-gradient-to-r from-amber-500 to-rose-500 h-full rounded-full" style={{ width: `${f.peso * 100}%` }} />
                        </div>
                        <p className="text-[11px] text-slate-400">{f.descricao}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Generated Plan Container */}
              {generatedPlan && (
                <div className="bg-gradient-to-br from-slate-900 via-rose-950/20 to-slate-900 border border-rose-500/40 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-sm border-b border-rose-500/20 pb-3">
                    <CheckCircle2 className="w-5 h-5" />
                    Plano Prescritivo de Busca Ativa Gerado pela IA
                  </div>

                  <FormattedMarkdown content={generatedPlan} />
                </div>
              )}
            </>
          ) : (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
              Selecione uma turma ao lado para visualizar os fatores explicativos SHAP e gerar o plano de intervenção.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
