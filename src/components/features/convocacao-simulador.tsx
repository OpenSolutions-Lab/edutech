"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Send,
  Clock,
  CheckCircle,
  AlertTriangle,
  PhoneCall,
  UserCheck,
  Building,
  Sparkles,
  MessageSquare,
  ShieldAlert,
  Bot
} from "lucide-react";
import {
  getFilaReclassificadaCPF,
  FilaItemConsolidado,
} from "@/actions/reclassificacao-por-cpf";
import { predizerRiscoNoShow, PredicaoNoShowConvocacao } from "@/lib/ai/convocacao-risk-model";
import { WhatsAppAgentSimulator } from "./whatsapp-agent-simulator";

export function ConvocacaoSimuladorFeature() {
  const [dataFila, setDataFila] = useState<{
    unidadeId: string;
    designacaoUnidade: string;
    capacidadeOciosa: number;
    filaAnteriorTotal: number;
    filaNovaConsolidadaTotal: number;
    vagasDesbloqueadas: number;
    itens: FilaItemConsolidado[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [notificados, setNotificados] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<'painel' | 'whatsapp'>('painel');
  const [alunoSelecionadoWhatsApp, setAlunoSelecionadoWhatsApp] = useState<string>('Bernardo Silva');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const res = await getFilaReclassificadaCPF();
      setDataFila(res);
      setLoading(false);
    }
    loadData();
  }, []);

  const handleDispararNotificacao = (idCrianca: string) => {
    setNotificados((prev) => ({ ...prev, [idCrianca]: true }));
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-border/60 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Send className="h-6 w-6 text-primary" />
            Convocação Preditiva & Agente Conversacional WhatsApp
          </h1>
          <p className="text-sm text-muted-foreground">
            Painel da CRE e unidade com classificador preditivo de No-Show e automação via IA Agêntica.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab('painel')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'painel'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" /> Painel de Risco ML
          </button>
          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'whatsapp'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bot className="w-3.5 h-3.5" /> Agente WhatsApp (Experiência Família)
          </button>
        </div>
      </div>

      {activeTab === 'painel' ? (
        <>
          {/* Overview Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-border/60 bg-card/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Vagas Ociosas na Unidade
                </CardTitle>
                <Building className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-400">
                  {dataFila?.capacidadeOciosa} Vagas
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Prontas para preenchimento imediato
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Fila Consolidada por CPF
                </CardTitle>
                <UserCheck className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {dataFila?.filaNovaConsolidadaTotal} Crianças
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Redução de {dataFila?.vagasDesbloqueadas} duplicidades
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Tempo Médio de Atendimento
                </CardTitle>
                <Clock className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-400">
                  0.8 Dias
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Com automação WhatsApp (era &gt;7 dias)
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Predição de No-Show
                </CardTitle>
                <ShieldAlert className="h-4 w-4 text-rose-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-rose-400">
                  1 Risco Crítico
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Busca Ativa Preventiva sugerida
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Table: Reclassified Queue & ML Risk Classification */}
          <Card className="border-border/60 bg-card/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-foreground">
                  Fila Reclassificada por Criança — {dataFila?.designacaoUnidade}
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Ordem unificada de prioridade com cálculo preditivo de risco de não-resposta em 3 dias.
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  dataFila?.itens.forEach((i) => handleDispararNotificacao(i.idCrianca));
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs"
              >
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                Notificar Top {dataFila?.capacidadeOciosa} Famílias via WhatsApp
              </Button>
            </CardHeader>

            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-secondary/60 text-muted-foreground font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="p-3">Posição CPF</th>
                      <th className="p-3">Criança / Bairro</th>
                      <th className="p-3">Pontuação</th>
                      <th className="p-3">Risco Preditivo No-Show</th>
                      <th className="p-3">Recomendação IA</th>
                      <th className="p-3">Ação de Convocação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {dataFila?.itens.map((item, idx) => {
                      const isNotificado = notificados[item.idCrianca];

                      // Classificação Preditiva de Risco ML
                      const risco = predizerRiscoNoShow({
                        idCrianca: item.idCrianca,
                        nomeIniciais: `Criança ${idx + 1}`,
                        bairroResidencia: item.bairroResidencia,
                        unidadeConvocadaNome: dataFila.designacaoUnidade,
                        distanciaKm: item.distanciaKm,
                        diasDecorridosConvocacao: item.diasEsperando > 3 ? 2 : item.diasEsperando,
                        canalContatoCadastrado: idx === 3 ? 'Contato Desatualizado' : idx === 2 ? 'Apenas E-mail' : 'WhatsApp + Celular',
                        pontuacaoVulnerabilidade: item.pontuacaoTotal,
                        idadeAnosResponsavel: 28,
                        tentativasContatoEfetuadas: item.diasEsperando,
                      });

                      return (
                        <tr key={item.idCrianca} className="hover:bg-secondary/30 transition-colors">
                          <td className="p-3 font-bold text-foreground">
                            #{item.posicaoUnicaCPF}{" "}
                            <span className="text-[10px] text-muted-foreground font-normal">
                              (opção #{item.posicaoAntigaOpcao})
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="font-mono text-primary font-semibold">{item.idCrianca}</div>
                            <div className="text-[10px] text-muted-foreground">{item.bairroResidencia} • {item.distanciaKm} km</div>
                          </td>
                          <td className="p-3">
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-bold">
                              {item.pontuacaoTotal} pts
                            </Badge>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1.5">
                              <Badge
                                variant="outline"
                                className={
                                  risco.probabilidadeNoShow >= 0.75
                                    ? "bg-rose-500/15 text-rose-400 border-rose-500/30 font-bold"
                                    : risco.probabilidadeNoShow >= 0.50
                                    ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                                    : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                                }
                              >
                                {Math.round(risco.probabilidadeNoShow * 100)}% ({risco.nivelRisco.split(' ')[0]})
                              </Badge>
                            </div>
                            <div className="text-[10px] text-muted-foreground mt-0.5 max-w-[200px] truncate">
                              {risco.fatoresRiscoPrincipais[0]}
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="text-[11px] font-semibold text-slate-300">
                              {risco.acaoRecomendada}
                            </span>
                          </td>
                          <td className="p-3 flex items-center gap-2">
                            <Button
                              size="sm"
                              variant={isNotificado ? "secondary" : "default"}
                              disabled={isNotificado}
                              onClick={() => handleDispararNotificacao(item.idCrianca)}
                              className="h-7 text-[11px] px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white"
                            >
                              {isNotificado ? (
                                <>
                                  <CheckCircle className="h-3 w-3 mr-1 text-emerald-400" />
                                  Notificado
                                </>
                              ) : (
                                <>
                                  <Send className="h-3 w-3 mr-1" />
                                  Convocar WhatsApp
                                </>
                              )}
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setAlunoSelecionadoWhatsApp(`Aluno ${item.idCrianca}`);
                                setActiveTab('whatsapp');
                              }}
                              className="h-7 text-[11px] px-2 text-emerald-400 border-emerald-500/30 hover:bg-emerald-950"
                              title="Testar Simulação WhatsApp"
                            >
                              <MessageSquare className="h-3 w-3" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bot className="w-6 h-6 text-emerald-400" />
              <div>
                <h4 className="text-sm font-bold text-white">Simulação Interativa do Robô Agêntico WhatsApp</h4>
                <p className="text-xs text-slate-400">
                  Teste o fluxo conversacional autônomo enviado aos responsáveis durante o ciclo oficial de 3 dias.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('painel')}
              className="text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 px-3 py-1.5 rounded-xl"
            >
              ← Voltar ao Painel
            </button>
          </div>

          <WhatsAppAgentSimulator
            nomeAluno={alunoSelecionadoWhatsApp}
            unidadeNome={dataFila?.designacaoUnidade || "CM RIO NOVO - RIO DAS FLORES (ANIL)"}
            prazoDiasRestantes={2}
          />
        </div>
      )}
    </div>
  );
}
