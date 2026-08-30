'use client';

import { useState, useTransition } from 'react';
import type { ResultadoEvasao } from '@/lib/ai/evasao-model';
import { getAnaliseIAEvasao } from '@/actions/predicoes';
import { formatPercentRaw, formatNumber, formatRiskLevel } from '@/lib/utils/formatters';
import {
  AlertTriangle, ChevronDown, ChevronUp, Search,
  Brain, Loader2, Sparkles, BarChart3, Info
} from 'lucide-react';
import { FormattedMarkdown } from '@/components/ui/formatted-markdown';

interface EvasionRiskPanelProps {
  resultados: ResultadoEvasao[];
}

export function EvasionRiskPanel({ resultados }: EvasionRiskPanelProps) {
  const [filtroNivel, setFiltroNivel] = useState<string>('todos');
  const [filtroCre, setFiltroCre] = useState<number>(0);
  const [busca, setBusca] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [analiseIA, setAnaliseIA] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // 1. Filtro por Foco Territorial (CRE) e Busca Textual
  const territoryFiltered = resultados.filter(r => {
    const matchesCre = filtroCre === 0 || Number(r.cre_id) === Number(filtroCre);
    const matchesBusca = busca === '' ||
      r.escola_nome.toLowerCase().includes(busca.toLowerCase()) ||
      (r.bairro && r.bairro.toLowerCase().includes(busca.toLowerCase()));
    return matchesCre && matchesBusca;
  });

  // 2. Estatísticas dinâmicas dos cartões refletindo a CRE / Busca selecionada
  const stats = {
    critico: territoryFiltered.filter(r => r.nivel === 'critico').length,
    alto: territoryFiltered.filter(r => r.nivel === 'alto').length,
    moderado: territoryFiltered.filter(r => r.nivel === 'moderado').length,
    baixo: territoryFiltered.filter(r => r.nivel === 'baixo').length,
  };

  // 3. Filtro final incluindo o Nível de Risco selecionado
  const filtered = territoryFiltered.filter(r => {
    return filtroNivel === 'todos' || r.nivel === filtroNivel;
  });

  const handleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleGerarAnalise = (escolaId: string) => {
    setLoadingId(escolaId);
    startTransition(async () => {
      const texto = await getAnaliseIAEvasao(escolaId);
      setAnaliseIA(prev => ({ ...prev, [escolaId]: texto }));
      setLoadingId(null);
    });
  };

  const riskColorMap: Record<string, string> = {
    critico: 'bg-red-500/10 border-red-500/30 text-red-400',
    alto: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
    moderado: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
    baixo: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
  };

  const riskDotColor: Record<string, string> = {
    critico: 'bg-red-500',
    alto: 'bg-orange-500',
    moderado: 'bg-yellow-500',
    baixo: 'bg-emerald-500',
  };

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {([
          { nivel: 'critico', label: 'Crítico', icon: '🔴', count: stats.critico },
          { nivel: 'alto', label: 'Alto', icon: '🟠', count: stats.alto },
          { nivel: 'moderado', label: 'Moderado', icon: '🟡', count: stats.moderado },
          { nivel: 'baixo', label: 'Baixo', icon: '🟢', count: stats.baixo },
        ] as const).map(item => (
          <button
            key={item.nivel}
            onClick={() => setFiltroNivel(filtroNivel === item.nivel ? 'todos' : item.nivel)}
            className={`glass-card rounded-2xl p-4 text-left transition-all hover:scale-[1.02] border ${
              filtroNivel === item.nivel ? riskColorMap[item.nivel] : 'border-border'
            }`}
          >
            <span className="text-2xl">{item.icon}</span>
            <div className="mt-2">
              <span className="text-2xl font-bold font-mono text-foreground">{item.count}</span>
              <span className="block text-xs text-muted-foreground mt-0.5">Risco {item.label}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Barra de Busca e Foco Territorial */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por escola ou bairro..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full rounded-xl border border-border bg-input py-3 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        {/* Dropdown Foco Territorial */}
        <div className="flex items-center gap-2 w-full sm:w-auto bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs">
          <span className="text-muted-foreground font-semibold whitespace-nowrap">📍 Foco Territorial:</span>
          <select
            value={filtroCre}
            onChange={(e) => setFiltroCre(Number(e.target.value))}
            className="bg-transparent text-foreground font-bold focus:outline-none cursor-pointer w-full"
          >
            <option value={0} className="bg-slate-900">Todas as 11 Coordenadorias (CREs)</option>
            {Array.from({ length: 11 }, (_, i) => i + 1).map(cre => (
              <option key={cre} value={cre} className="bg-slate-900">{cre}ª CRE</option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de Escolas */}
      <div className="space-y-3">
        {filtered.map(resultado => {
          const risk = formatRiskLevel(resultado.score);
          const isExpanded = expandedId === resultado.escola_id;

          return (
            <div
              key={resultado.escola_id}
              className={`glass-card rounded-2xl overflow-hidden border transition-all ${
                isExpanded ? 'border-primary/40 shadow-lg shadow-primary/5' : 'border-border'
              }`}
            >
              {/* Cabeçalho da Escola */}
              <button
                onClick={() => handleExpand(resultado.escola_id)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`h-3 w-3 rounded-full ${riskDotColor[resultado.nivel]} animate-pulse`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-foreground">{resultado.escola_nome}</h4>
                      {resultado.cre_id && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400">
                          {resultado.cre_id}ª CRE {resultado.bairro ? `· ${resultado.bairro}` : ''}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Score: <span className="font-mono font-bold">{(resultado.score * 100).toFixed(1)}%</span>
                      {' · '}
                      <span className={risk.color}>Risco {risk.label}</span>
                    </span>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </button>

              {/* Conteúdo Expandido */}
              {isExpanded && (
                <div className="px-5 pb-5 space-y-5 border-t border-border pt-5 animate-fade-in">
                  {/* Fatores Contribuintes */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                      <BarChart3 className="h-3.5 w-3.5 text-primary" />
                      Fatores Contribuintes
                    </h5>
                    <div className="space-y-2">
                      {resultado.fatores.map(fator => {
                        const pctWidth = Math.min(fator.contribuicao * 100, 100);
                        return (
                          <div key={fator.nome} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">{fator.nome}</span>
                              <span className="font-mono font-bold text-foreground">
                                {(fator.contribuicao * 100).toFixed(1)}%
                              </span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-muted/20 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-primary to-cyan-400 transition-all duration-500"
                                style={{ width: `${pctWidth}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Recomendações Heurísticas */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                      <Info className="h-3.5 w-3.5 text-primary" />
                      Recomendações
                    </h5>
                    <ul className="space-y-1.5">
                      {resultado.recomendacoes.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <span className="text-primary mt-0.5">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Análise IA (Anthropic Claude) */}
                  <div className="space-y-3 bg-gradient-to-br from-violet-500/5 to-blue-500/5 border border-violet-500/15 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                        <Brain className="h-3.5 w-3.5 text-violet-400" />
                        Análise Preditiva Claude AI
                      </h5>
                      {!analiseIA[resultado.escola_id] && (
                        <button
                          onClick={() => handleGerarAnalise(resultado.escola_id)}
                          disabled={isPending && loadingId === resultado.escola_id}
                          className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-blue-500 px-3 py-1.5 text-[10px] font-bold text-white shadow-lg shadow-violet-500/20 transition-all hover:shadow-xl hover:shadow-violet-500/30 disabled:opacity-50"
                        >
                          {isPending && loadingId === resultado.escola_id ? (
                            <>
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Analisando...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-3 w-3" />
                              Gerar Análise IA
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {analiseIA[resultado.escola_id] ? (
                      <FormattedMarkdown content={analiseIA[resultado.escola_id]} />
                    ) : (
                      <p className="text-[11px] text-muted-foreground/60 italic">
                        Clique em "Gerar Análise IA" para obter uma avaliação diagnóstica personalizada por IA.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="glass-card flex h-40 items-center justify-center rounded-2xl">
            <p className="text-sm text-muted-foreground">Nenhuma escola encontrada para os filtros selecionados.</p>
          </div>
        )}
      </div>
    </div>
  );
}
