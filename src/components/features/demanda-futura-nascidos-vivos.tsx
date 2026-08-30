"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Baby,
  Building2,
  TrendingUp,
  AlertTriangle,
  Users,
  PieChart,
  BrainCircuit,
  Lightbulb,
  Layers
} from "lucide-react";
import {
  getProjecaoDemandaNascidosVivos,
  DemandaFuturaBairro,
} from "@/actions/nascidos-vivos-demanda";
import { getRankingPressaoTodasCres, ProjecaoDemandaCreche } from "@/lib/ai/demanda-forecast-model";

export function DemandaFuturaNascidosVivosFeature() {
  const [data, setData] = useState<{
    bairros: DemandaFuturaBairro[];
    kpis: {
      totalNascidosVivosUltimos3Anos: number;
      totalVagasCrechesPublicas: number;
      totalVagasCrechesConveneadas: number;
      coberturaMediaRedePct: number;
      topBairrosMaiorDeficit: string[];
    };
  } | null>(null);

  const [mlRankings, setMlRankings] = useState<ProjecaoDemandaCreche[]>([]);
  const [loading, setLoading] = useState(true);
  const [creSelecionada, setCreSelecionada] = useState<number>(10); // Default na 10ª CRE (Santa Cruz/Paciência - maior pressão)

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const res = await getProjecaoDemandaNascidosVivos();
      const rankingMl = getRankingPressaoTodasCres();
      setData(res);
      setMlRankings(rankingMl);
      setLoading(false);
    }
    loadData();
  }, []);

  const creAtualInfo = mlRankings.find(r => r.creId === creSelecionada) || mlRankings[0];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-border/60 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Baby className="h-6 w-6 text-primary" />
            Demanda Futura Preditiva (ML Nascidos Vivos × CadÚnico × Vagas)
          </h1>
          <p className="text-sm text-muted-foreground">
            Modelo de Machine Learning para cálculo do Índice Preditivo de Pressão de Demanda (IPDF) por coorte etária.
          </p>
        </div>
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-3 py-1 self-start md:self-auto font-bold">
          ML IPDF 0-3 Anos (Eixo 1)
        </Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/60 bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Bebês Nascidos (Coorte 0-3a)
            </CardTitle>
            <Baby className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-400">
              {data?.kpis.totalNascidosVivosUltimos3Anos.toLocaleString("pt-BR")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Referência SINASC / IBGE RJ
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Vagas Públicas Existentes
            </CardTitle>
            <Building2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-400">
              {data?.kpis.totalVagasCrechesPublicas.toLocaleString("pt-BR")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Oferta direta nas creches da rede
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              CRE de Maior Pressão ML
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-400">
              {mlRankings[0]?.creNome || '10ª CRE'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              IPDF Score: {mlRankings[0]?.ipdfScore} ({mlRankings[0]?.nivelPressao})
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Cobertura Média da Rede
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {data?.kpis.coberturaMediaRedePct}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Capacidade vs população infantil 0-3a
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ML Forecast Card por CRE */}
      {creAtualInfo && (
        <Card className="border-emerald-500/30 bg-slate-950/80 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                  Projeção Preditiva de Turmas para 2026: {creAtualInfo.creNome}
                </CardTitle>
                <p className="text-xs text-slate-400">
                  Seleção de CRE para detalhamento do modelo estatístico por faixa de idade infantil.
                </p>
              </div>
            </div>

            {/* Seletor de CRE */}
            <select
              value={creSelecionada}
              onChange={e => setCreSelecionada(Number(e.target.value))}
              className="bg-slate-900 border border-slate-700 text-xs font-bold text-emerald-400 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
            >
              {mlRankings.map(r => (
                <option key={r.creId} value={r.creId}>
                  {r.creNome} (IPDF: {r.ipdfScore})
                </option>
              ))}
            </select>
          </CardHeader>

          <CardContent className="pt-6 space-y-6">
            {/* Grid da Distribuição Etária */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
                <span className="text-xs text-slate-400 font-semibold block mb-1">Berçário I (0 a 1 ano)</span>
                <span className="text-xl font-bold text-cyan-400">
                  {creAtualInfo.distribuicaoPorFaixa.bercarioI.toLocaleString('pt-BR')} bebês
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">Demanda alta vulnerabilidade</span>
              </div>

              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
                <span className="text-xs text-slate-400 font-semibold block mb-1">Berçário II (1 a 2 anos)</span>
                <span className="text-xl font-bold text-emerald-400">
                  {creAtualInfo.distribuicaoPorFaixa.bercarioII.toLocaleString('pt-BR')} bebês
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">Maior demanda de mães MEI</span>
              </div>

              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
                <span className="text-xs text-slate-400 font-semibold block mb-1">Maternal I (2 a 3 anos)</span>
                <span className="text-xl font-bold text-amber-400">
                  {creAtualInfo.distribuicaoPorFaixa.maternalI.toLocaleString('pt-BR')} crianças
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">Pico de transição</span>
              </div>

              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
                <span className="text-xs text-slate-400 font-semibold block mb-1">Maternal II (3 a 4 anos)</span>
                <span className="text-xl font-bold text-purple-400">
                  {creAtualInfo.distribuicaoPorFaixa.maternalII.toLocaleString('pt-BR')} crianças
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">Pré-escola imediata</span>
              </div>
            </div>

            {/* Recomendações Táticas do Modelo */}
            <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <Lightbulb className="w-4 h-4" /> Recomendações Táticas do Modelo de IA:
              </div>
              <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
                {creAtualInfo.recomendacoesTaticas.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Table: Projeção Preditiva Completa de Bairros */}
      <Card className="border-border/60 bg-card/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <PieChart className="h-4 w-4 text-primary" />
              Ranking de Pressão Preditiva por Bairro (Nascidos Vivos × Capacidade Total)
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Cruzamento contínuo dos microdados oficiais anonimizados de 2021 a 2025.
            </p>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-secondary/60 text-muted-foreground font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-3">Bairro / CRE</th>
                  <th className="p-3">Nascidos Vivos (0-3a)</th>
                  <th className="p-3">Vagas Públicas</th>
                  <th className="p-3">Vagas Conveneadas</th>
                  <th className="p-3">Déficit Projetado 2026</th>
                  <th className="p-3">Taxa de Cobertura</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {data?.bairros.map((b) => (
                  <tr key={b.bairro} className="hover:bg-secondary/30 transition-colors">
                    <td className="p-3 font-bold text-foreground">
                      {b.bairro}{" "}
                      <span className="text-[10px] text-muted-foreground font-normal">
                        ({b.cre})
                      </span>
                    </td>
                    <td className="p-3 font-mono font-semibold text-cyan-400">
                      {b.estimativaCriancas0a3Anos.toLocaleString("pt-BR")} bebês
                    </td>
                    <td className="p-3 font-semibold text-emerald-400">
                      {b.vagasCrechePúblicas}
                    </td>
                    <td className="p-3 font-semibold text-amber-400">
                      {b.vagasCrecheConveneadas}
                    </td>
                    <td className="p-3 font-bold text-rose-400">
                      -{b.deficitEstimado2026.toLocaleString("pt-BR")} vagas
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={
                            b.taxaCoberturaPct < 25
                              ? "bg-rose-500/10 text-rose-400 border-rose-500/30 font-bold"
                              : b.taxaCoberturaPct < 40
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          }
                        >
                          {b.taxaCoberturaPct}%
                        </Badge>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
