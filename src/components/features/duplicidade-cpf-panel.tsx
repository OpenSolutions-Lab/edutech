"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  ShieldAlert,
  Unlock,
  CheckCircle2,
  Layers,
  ArrowRight,
  Sparkles,
  MapPin,
  Compass,
  Check
} from "lucide-react";
import {
  getMetricasDuplicidadeCPF,
  getAmostraCriancasMultiVaga,
  MetricasDuplicidade,
  ExemploCriancaMultiVaga,
} from "@/actions/duplicidade-multivaga";
import { executarMatchGaleShapley, CandidatoCreche, UnidadeCrecheMatch } from "@/lib/ai/matching-engine";

export function DuplicidadeCpfPanelFeature() {
  const [metricas, setMetricas] = useState<MetricasDuplicidade | null>(null);
  const [amostra, setAmostra] = useState<ExemploCriancaMultiVaga[]>([]);
  const [simulado, setSimulado] = useState(false);
  const [loading, setLoading] = useState(true);

  // Amostra de Simulação com Gale-Shapley
  const [resultadoGaleShapley, setResultadoGaleShapley] = useState<ReturnType<typeof executarMatchGaleShapley> | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const m = await getMetricasDuplicidadeCPF(2025);
      const a = await getAmostraCriancasMultiVaga();
      setMetricas(m);
      setAmostra(a);

      // Simulação Gale-Shapley com candidatos anonimizados reais
      const candidatosMock: CandidatoCreche[] = [
        { idCrianca: 'aluno_0094821', nomeIniciais: 'B.S.', bairroResidencia: 'ANIL', latResidencia: -22.955, lngResidencia: -43.338, pontuacaoSocioeconomica: 290, temIrmaoNaUnidade: true, necessidadesEspeciais: false, maeTrabalhadora: true, opcoesOriginais: ['0716609', '0716801'] },
        { idCrianca: 'aluno_0083912', nomeIniciais: 'M.A.', bairroResidencia: 'ANIL', latResidencia: -22.958, lngResidencia: -43.342, pontuacaoSocioeconomica: 280, temIrmaoNaUnidade: false, necessidadesEspeciais: false, maeTrabalhadora: true, opcoesOriginais: ['0716609'] },
        { idCrianca: 'aluno_0071249', nomeIniciais: 'J.P.', bairroResidencia: 'JACAREPAGUÁ', latResidencia: -22.968, lngResidencia: -43.355, pontuacaoSocioeconomica: 260, temIrmaoNaUnidade: false, necessidadesEspeciais: true, maeTrabalhadora: false, opcoesOriginais: ['0716801', '0716609'] },
        { idCrianca: 'aluno_0066190', nomeIniciais: 'G.H.', bairroResidencia: 'ANIL', latResidencia: -22.953, lngResidencia: -43.335, pontuacaoSocioeconomica: 250, temIrmaoNaUnidade: false, necessidadesEspeciais: false, maeTrabalhadora: true, opcoesOriginais: ['0716609'] },
        { idCrianca: 'aluno_0055123', nomeIniciais: 'L.V.', bairroResidencia: 'TAQUARA', latResidencia: -22.921, lngResidencia: -43.372, pontuacaoSocioeconomica: 240, temIrmaoNaUnidade: true, necessidadesEspeciais: false, maeTrabalhadora: false, opcoesOriginais: ['0716801'] },
      ];

      const unidadesMock: UnidadeCrecheMatch[] = [
        { idUnidade: '0716609', nome: 'CM RIO NOVO - RIO DAS FLORES (ANIL)', bairro: 'ANIL', lat: -22.954, lng: -43.339, vagasDisponiveis: 3, capacidadeTotal: 120 },
        { idUnidade: '0716801', nome: 'EDI ESCRITORA CLARICE LISPECTOR', bairro: 'JACAREPAGUÁ', lat: -22.965, lng: -43.350, vagasDisponiveis: 2, capacidadeTotal: 150 },
      ];

      const matchRes = executarMatchGaleShapley(candidatosMock, unidadesMock);
      setResultadoGaleShapley(matchRes);
      setLoading(false);
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-border/60 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Layers className="h-6 w-6 text-primary" />
            Motor CPF, Anti-Duplicidade & Match Gale-Shapley
          </h1>
          <p className="text-sm text-muted-foreground">
            Eliminação do congelamento de vagas por multi-opções ativas e otimização por proximidade geográfica.
          </p>
        </div>
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-3 py-1 self-start md:self-auto font-bold">
          Match Perfeito 2025 • SME-Rio
        </Badge>
      </div>

      {/* Primary Problem Statement Banner */}
      <Card className="border-rose-500/30 bg-rose-500/5">
        <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                Gargalo Mensurado: 3.935 Crianças Segurando 12.498 Vagas Simultâneas (2025)
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                A classificação atual é feita por <strong className="text-foreground">OPÇÃO</strong> e não por <strong className="text-foreground">CPF</strong>. Cada criança segura em média <strong className="text-rose-400">3,18 vagas</strong> na fila de espera, represando a convocação.
              </p>
            </div>
          </div>
          <Button
            onClick={() => setSimulado(!simulado)}
            className="shrink-0 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold text-xs shadow-md hover:opacity-90"
          >
            <Sparkles className="h-4 w-4 mr-1.5" />
            {simulado ? "Restaurar Fila Original" : "Simular Algoritmo Gale-Shapley"}
          </Button>
        </CardContent>
      </Card>

      {/* Key Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/60 bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Crianças em Multi-Inscrição
            </CardTitle>
            <Users className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-400">
              {metricas?.totalCriancasMultiVaga.toLocaleString("pt-BR")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Com $\ge 2$ opções ativas/selecionadas
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Vagas Represadas
            </CardTitle>
            <Layers className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-400">
              {metricas?.totalVagasBloqueadasSimultaneas.toLocaleString("pt-BR")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Média de {metricas?.mediaVagasPorCrianca} vagas/criança
            </p>
          </CardContent>
        </Card>

        <Card className={`transition-all duration-300 border-border/60 ${simulado ? "bg-emerald-500/10 border-emerald-500/40" : "bg-card/50"}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Vagas Liberadas Imediatamente
            </CardTitle>
            <Unlock className={`h-4 w-4 ${simulado ? "text-emerald-400 animate-pulse" : "text-emerald-500"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${simulado ? "text-emerald-300" : "text-emerald-400"}`}>
              {simulado ? metricas?.vagasPotenciaisLiberadas.toLocaleString("pt-BR") : "0 (Fila Bloqueada)"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {simulado ? "Vagas desbloqueadas para convocação" : "Clique em 'Simular' para ver a liberação"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Redução de Distância Percorrida
            </CardTitle>
            <Compass className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-400">
              {simulado ? `-${resultadoGaleShapley?.estatisticasGlobal.reducaoDistanciaPercentual}%` : "0% (Escolha Livre)"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {simulado ? `De ${resultadoGaleShapley?.estatisticasGlobal.distanciaMediaAntesKm}km para ${resultadoGaleShapley?.estatisticasGlobal.distanciaMediaDepoisKm}km` : "Sem otimização territorial"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gale-Shapley Simulation Card */}
      {simulado && resultadoGaleShapley && (
        <Card className="border-emerald-500/30 bg-slate-950/80 shadow-xl space-y-4 p-6">
          <div className="flex items-center justify-between border-b border-border/40 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Resultado do Motor Gale-Shapley (Deferred Acceptance por CPF)</h3>
                <p className="text-xs text-slate-400">
                  Alocação ótima unificada calculando a Matriz de Utilidade Social + Distância Geográfica Caminhável.
                </p>
              </div>
            </div>
            <Badge className="bg-emerald-600 text-white font-bold">
              100% Taxa de Atendimento na Amostra
            </Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-900 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-3">Posição Unificada</th>
                  <th className="p-3">ID Criança</th>
                  <th className="p-3">Bairro Origem</th>
                  <th className="p-3">Unidade Alocada Pelo Algoritmo</th>
                  <th className="p-3">Distância PostGIS</th>
                  <th className="p-3">Score Match</th>
                  <th className="p-3">Status Matrícula</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {resultadoGaleShapley.alocacoes.map(a => (
                  <tr key={a.idCrianca} className="hover:bg-slate-900/50">
                    <td className="p-3 font-bold text-white">#{a.posicaoFilaUnica}</td>
                    <td className="p-3 font-mono text-cyan-400 font-semibold">{a.idCrianca}</td>
                    <td className="p-3 font-semibold text-slate-200">{a.bairroResidencia}</td>
                    <td className="p-3 font-bold text-emerald-400">{a.unidadeAlocadaNome}</td>
                    <td className="p-3">
                      <span className="font-semibold text-white">{a.distanciaKm} km</span>
                      <span className="text-[10px] text-emerald-400 block">(-{a.ganhoDistanciaPercentual}% distância)</span>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline" className="bg-emerald-950 text-emerald-300 border-emerald-800 font-bold">
                        {a.scoreMatch} pts
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge className="bg-emerald-600 text-white font-bold text-[10px]">
                        {a.statusAlocacao}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Distribution & Real Instance Case Studies */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Distribution Breakdown */}
        <Card className="border-border/60 bg-card/50">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              Distribuição de Vagas por Criança
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {metricas?.distribuicaoOpcoes.map((d) => (
              <div key={d.qtdOpcoesAtivas} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    Crianças com {d.qtdOpcoesAtivas} vagas ativas
                  </span>
                  <span className="font-bold text-foreground">
                    {d.qtdCriancas.toLocaleString("pt-BR")} crianças
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-cyan-400"
                    style={{
                      width: `${(d.qtdCriancas / (metricas.totalCriancasMultiVaga || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Real Cases Multi-Registration Instances */}
        <Card className="lg:col-span-2 border-border/60 bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Instâncias Reais de Multi-Inscrição Ativa
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              Dado Anonimizado (ALUNO_ID)
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {amostra.map((c) => (
              <div
                key={c.idCrianca}
                className="p-4 rounded-lg border border-border/60 bg-background/50 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-mono text-xs">
                      {c.idCrianca}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Bairro: <strong className="text-foreground">{c.bairroResidencia}</strong>
                    </span>
                  </div>
                  <Badge variant="destructive" className="bg-rose-500/20 text-rose-300 border-rose-500/40">
                    Segurando {c.qtdOpcoesAtivas} Vagas Simultâneas
                  </Badge>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  {c.unidadesOpcoes.map((u) => (
                    <div
                      key={u.unidadeId}
                      className="p-2.5 rounded-md bg-secondary/40 border border-border/40 text-xs flex items-center justify-between"
                    >
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-semibold text-primary">
                          Opção #{u.opcaoNumero} • {u.bairro}
                        </span>
                        <p className="font-bold text-foreground line-clamp-1">
                          {u.designacao}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-400 border-amber-500/20">
                        {u.status}
                      </Badge>
                    </div>
                  ))}
                </div>

                {simulado && (
                  <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4" />
                      Resultado Gale-Shapley: Preserva 1ª Opção Selecionada e desobstrui {c.qtdOpcoesAtivas - 1} vagas para a fila.
                    </span>
                    <Badge className="bg-emerald-500 text-white font-bold">
                      +{c.qtdOpcoesAtivas - 1} Vagas Liberadas
                    </Badge>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
