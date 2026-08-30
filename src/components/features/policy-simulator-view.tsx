'use client';

import React, { useState, useEffect } from 'react';
import { runPolicySimulation, SimulationResult } from '@/actions/policy-simulator';
import { Sliders, TrendingUp, DollarSign, Users, Thermometer, Award, Sparkles, RefreshCw } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { FormattedMarkdown } from '@/components/ui/formatted-markdown';

export function PolicySimulatorView() {
  const [orcamento, setOrcamento] = useState(15); // R$ 15M
  const [professores, setProfessores] = useState(180);
  const [climatizadas, setClimatizadas] = useState(35);
  const [monitoria, setMonitoria] = useState(400);
  const [gets, setGets] = useState(4);
  const [creTarget, setCreTarget] = useState(0);

  const [loading, setLoading] = useState(false);
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);

  const handleSimulate = async () => {
    setLoading(true);
    try {
      const res = await runPolicySimulation({
        orcamentoMilhoes: orcamento,
        novosProfessores: professores,
        novasEscolasClimatizadas: climatizadas,
        bolsasMonitoria: monitoria,
        novosGets: gets,
        creTarget,
      });
      setSimResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Removida execução automática no useEffect para rodar apenas sob demanda do usuário ao clicar no botão.

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sliders className="w-6 h-6 text-indigo-400" />
            Simulador de Políticas Públicas "What-If"
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Gêmeo Digital de simulação causal orçamentária e projeção do impacto no IDEB-Rio e na evasão escolar.
          </p>
        </div>

        <button
          onClick={handleSimulate}
          disabled={loading}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 transition shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Executar Simulação</span>
        </button>
      </div>

      {/* Controls & Results Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Interactive Sliders */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-6">
          <h2 className="text-base font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
            <Sliders className="w-4 h-4 text-indigo-400" />
            Variáveis Orçamentárias & Alocação
          </h2>

          {/* Slider 1: Orçamento Adicional */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Orçamento Adicional</span>
              <span className="text-emerald-400 font-mono">R$ {orcamento}M</span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              step="1"
              value={orcamento}
              onChange={(e) => setOrcamento(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          {/* Slider 2: Novos Professores */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-blue-400" /> Novos Professores (Disciplinas Críticas)</span>
              <span className="text-blue-400 font-mono">{professores} profs</span>
            </div>
            <input
              type="range"
              min="10"
              max="500"
              step="10"
              value={professores}
              onChange={(e) => setProfessores(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          {/* Slider 3: Climatização */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5"><Thermometer className="w-3.5 h-3.5 text-amber-400" /> Escolas Climatizadas</span>
              <span className="text-amber-400 font-mono">{climatizadas} escolas</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={climatizadas}
              onChange={(e) => setClimatizadas(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          {/* Slider 4: Bolsas de Monitoria */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5"><Award className="w-3.5 h-3.5 text-purple-400" /> Bolsas de Monitoria Escolar</span>
              <span className="text-purple-400 font-mono">{monitoria} bolsas</span>
            </div>
            <input
              type="range"
              min="0"
              max="1000"
              step="50"
              value={monitoria}
              onChange={(e) => setMonitoria(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>

          {/* Slider 5: Novos GETs */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Novos GETs (Tecnológicos)</span>
              <span className="text-indigo-400 font-mono">{gets} unidades</span>
            </div>
            <input
              type="range"
              min="0"
              max="15"
              step="1"
              value={gets}
              onChange={(e) => setGets(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          {/* CRE Target Filter */}
          <div className="pt-2">
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Foco Territorial Prioritário</label>
            <select
              value={creTarget}
              onChange={(e) => setCreTarget(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value={0}>Todas as 11 CREs (Distribuição Equitativa)</option>
              {Array.from({ length: 11 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{`${i + 1}ª CRE`}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Column: Simulation Dashboard & Impact Cards */}
        <div className="lg:col-span-2 space-y-6">
          {!simResult && !loading && (
            <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4 min-h-[400px]">
              <div className="p-4 bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 rounded-2xl">
                <Sliders className="w-10 h-10" />
              </div>
              <div className="max-w-md">
                <h3 className="text-lg font-bold text-white">Pronto para Simular</h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Ajuste os parâmetros orçamentários e territoriais no painel à esquerda e clique no botão <strong className="text-indigo-400 font-semibold">"Executar Simulação"</strong> para projetar os impactos em tempo real.
                </p>
              </div>
              <button
                onClick={handleSimulate}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition flex items-center gap-2 shadow-lg shadow-indigo-500/20"
              >
                <RefreshCw className="w-4 h-4" /> Executar Simulação
              </button>
            </div>
          )}

          {/* Top KPI Cards */}
          {simResult && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
                <div className="text-xs text-slate-400 font-medium">Impacto IDEB-Rio</div>
                <div className="text-2xl font-extrabold text-emerald-400 mt-1">+{simResult.impactoIdeb}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{simResult.idebAtual} ➔ {simResult.idebProjetado} pts</div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
                <div className="text-xs text-slate-400 font-medium">Queda de Evasão</div>
                <div className="text-2xl font-extrabold text-blue-400 mt-1">-{simResult.reducaoEvasaoPct}%</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{simResult.evasaoAtualPct}% ➔ {simResult.evasaoProjetadaPct}%</div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
                <div className="text-xs text-slate-400 font-medium">Alunos Beneficiados</div>
                <div className="text-2xl font-extrabold text-purple-400 mt-1">{simResult.alunosBeneficiados.toLocaleString()}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">impacto direto</div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
                <div className="text-xs text-slate-400 font-medium">SROI (Retorno Social)</div>
                <div className="text-2xl font-extrabold text-amber-400 mt-1">{simResult.roiSocialEstimado}x</div>
                <div className="text-[11px] text-slate-400 mt-0.5">por R$ 1,00 investido</div>
              </div>
            </div>
          )}

          {/* AI Narrative Synthesis con Scrollbar Dedicada e Parágrafos Estruturados */}
          {simResult && (
            <div className="bg-gradient-to-r from-blue-950/40 via-indigo-950/40 to-slate-900 border border-blue-500/30 rounded-2xl p-5 backdrop-blur-md space-y-3">
              <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm border-b border-slate-800/80 pb-2">
                <Sparkles className="w-4 h-4" /> Síntese Preditiva da IA Generativa
              </div>
              <div className="max-h-52 overflow-y-auto pr-3 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
                <FormattedMarkdown content={simResult.resumoIa} />
              </div>
            </div>
          )}

          {/* CRE Breakdown Chart */}
          {simResult && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" /> Ganho de IDEB Projetado por Coordenadoria (CRE)
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={simResult.detalhamentoCre}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="cre" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', color: '#fff' }} />
                    <Bar dataKey="ganhoIdeb" fill="#6366f1" radius={[4, 4, 0, 0]} name="Ganho IDEB (pontos)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
