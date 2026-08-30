'use client';

import { useState, useEffect, useTransition } from 'react';
import {
  FilaUnidadeModel,
  LogEventoFila,
  OpcaoFila,
  StatusOpcaoFila,
  ResumoIndicadoresFila,
} from '@/types/gestao-fila';
import {
  getUnidadesEscolaresFila,
  getFilasDaUnidadeAction,
  getLogsMotorFilaAction,
  marcarContatadoAction,
  registrarNovaTentativaAction,
  registrarRespostaAction,
  adicionarObservacaoAction,
  varrerPrazosExpiradosAction,
  getIndicadoresGestaoFilaAction,
  recarregarFilaDemonstracaoAction,
} from '@/actions/gestao-fila';
import {
  diasDistintosDeTentativa,
  proximaTentativaAte,
  recontatoAtrasado,
  progressoETextoPrazo,
} from '@/lib/engine/queue-engine';
import {
  School,
  Users,
  CheckCircle2,
  XCircle,
  PhoneCall,
  Clock,
  RefreshCw,
  FileText,
  AlertTriangle,
  Send,
  Layers,
  Sparkles,
  ShieldCheck,
  Building,
  UserCheck,
  UserX,
  AlertCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatNumber } from '@/lib/utils/formatters';

interface UnidadeOption {
  id: string;
  nome: string;
  cre_sigla: string;
  bairro: string;
}

export function GestaoFilaView() {
  const [isPending, startTransition] = useTransition();
  const [unidades, setUnidades] = useState<UnidadeOption[]>([]);
  const [unidadeSelecionadaId, setUnidadeSelecionadaId] = useState<string>('');
  const [filas, setFilas] = useState<FilaUnidadeModel[]>([]);
  const [turmaSelecionadaKey, setTurmaSelecionadaKey] = useState<string>('');
  const [modoVisualizacao, setModoVisualizacao] = useState<'convocacao' | 'matriculados' | 'retirados' | 'log'>('convocacao');
  const [logs, setLogs] = useState<LogEventoFila[]>([]);
  const [indicadores, setIndicadores] = useState<ResumoIndicadoresFila | null>(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal para Observações (Append-Only)
  const [opcaoObsModal, setOpcaoObsModal] = useState<OpcaoFila | null>(null);
  const [novaObsTexto, setNovaObsTexto] = useState('');
  const [autorObs, setAutorObs] = useState('Secretaria da Unidade');

  useEffect(() => {
    async function loadInitial() {
      const uList = await getUnidadesEscolaresFila();
      setUnidades(uList);
      if (uList.length > 0) {
        setUnidadeSelecionadaId(uList[0].id);
      }
      const ind = await getIndicadoresGestaoFilaAction();
      setIndicadores(ind);
      const l = await getLogsMotorFilaAction();
      setLogs(l);
    }
    loadInitial();
  }, []);

  useEffect(() => {
    if (!unidadeSelecionadaId) return;
    async function fetchFilas() {
      const fList = await getFilasDaUnidadeAction(unidadeSelecionadaId);
      setFilas(fList);
      if (fList.length > 0) {
        setTurmaSelecionadaKey(`${fList[0].grupamento} - ${fList[0].turno}`);
      } else {
        setTurmaSelecionadaKey('');
      }
    }
    startTransition(() => {
      fetchFilas();
    });
  }, [unidadeSelecionadaId]);

  const refreshCurrentData = async () => {
    if (unidadeSelecionadaId) {
      const fList = await getFilasDaUnidadeAction(unidadeSelecionadaId);
      setFilas(fList);
    }
    const lList = await getLogsMotorFilaAction();
    setLogs(lList);
    const ind = await getIndicadoresGestaoFilaAction();
    setIndicadores(ind);
  };

  const handleVarrerPrazos = async () => {
    startTransition(async () => {
      const avisos = await varrerPrazosExpiradosAction();
      if (avisos.length > 0) {
        setToastMessage(`Varredura concluída: ${avisos.length} candidato(s) com prazo estourado cancelados.`);
      } else {
        setToastMessage('Nenhum prazo estourado no momento.');
      }
      await refreshCurrentData();
    });
  };

  const handleResetDemo = async () => {
    startTransition(async () => {
      await recarregarFilaDemonstracaoAction();
      await refreshCurrentData();
      setToastMessage('Dados de fila viva reinicializados para demonstração.');
    });
  };

  const handleMarcarContatado = async (opcaoId: string) => {
    startTransition(async () => {
      try {
        await marcarContatadoAction(opcaoId);
        setToastMessage('📞 Contato iniciado! Prazo de 3 dias úteis ativo (1ª tentativa registrada hoje).');
        await refreshCurrentData();
      } catch (err: any) {
        setToastMessage(`Erro: ${err.message}`);
      }
    });
  };

  const handleRegistrarTentativa = async (opcaoId: string) => {
    startTransition(async () => {
      try {
        await registrarNovaTentativaAction(opcaoId);
        setToastMessage('☎️ Nova tentativa de contato registrada com sucesso.');
        await refreshCurrentData();
      } catch (err: any) {
        setToastMessage(`Erro: ${err.message}`);
      }
    });
  };

  const handleRegistrarResposta = async (opcaoId: string, aceitou: boolean) => {
    startTransition(async () => {
      try {
        const { notificacoes } = await registrarRespostaAction(opcaoId, aceitou);
        if (aceitou) {
          if (notificacoes.length > 0) {
            setToastMessage(`✅ VAGA CONFIRMADA! ${notificacoes[0]}`);
          } else {
            setToastMessage('✅ VAGA CONFIRMADA! Matrícula garantida nesta creche.');
          }
        } else {
          setToastMessage('❌ Recusa registrada. Vaga liberada em cascata para o próximo da fila (candidato movido para Retirados da Fila).');
        }
        await refreshCurrentData();
      } catch (err: any) {
        setToastMessage(`Erro: ${err.message}`);
      }
    });
  };

  const handleAdicionarObservacao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!opcaoObsModal || !novaObsTexto.trim()) return;
    startTransition(async () => {
      try {
        const updated = await adicionarObservacaoAction(opcaoObsModal.id, autorObs, novaObsTexto);
        setOpcaoObsModal(updated);
        setNovaObsTexto('');
        setToastMessage('🗒 Observação auditável salva com sucesso.');
        await refreshCurrentData();
      } catch (err: any) {
        setToastMessage(`Erro: ${err.message}`);
      }
    });
  };

  const filaAtual = filas.find((f) => `${f.grupamento} - ${f.turno}` === turmaSelecionadaKey);
  const unidadeAtual = unidades.find((u) => u.id === unidadeSelecionadaId);
  const hoje = new Date();
  const hojeStr = hoje.toISOString().split('T')[0];

  const formatDateBR = (isoStr: string | null) => {
    if (!isoStr) return '—';
    const [y, m, d] = isoStr.split('T')[0].split('-');
    return `${d}/${m}`;
  };

  const renderStatusBadge = (status: StatusOpcaoFila) => {
    switch (status) {
      case 'LISTA_DE_ESPERA':
        return <Badge variant="outline" className="border-slate-500/40 text-slate-400 bg-slate-950/50">1. Lista de Espera</Badge>;
      case 'SELECIONADO':
        return <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">2. Vaga Liberada — Aguardando Contato</Badge>;
      case 'CONTATADO':
        return <Badge className="bg-blue-500/20 text-blue-300 border border-blue-500/40">3. Contatado — Prazo Ativo (3 dias úteis)</Badge>;
      case 'CONFIRMADO':
        return <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">4. Vaga Confirmada</Badge>;
      case 'CANCELADO_NA_CONFIRMACAO':
        return <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/40">⚡ Cancelado em Cascata (Matriculou em Outra)</Badge>;
      case 'CANCELADO_PELO_SISTEMA':
        return <Badge className="bg-rose-500/20 text-rose-300 border border-rose-500/40">5. Cancelado (Recusa / Prazo Expirado)</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const retiradosCount = filaAtual
    ? filaAtual.opcoes.filter((o) => o.status === 'CANCELADO_PELO_SISTEMA' || o.status === 'CANCELADO_NA_CONFIRMACAO').length
    : 0;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Toast Notification Header */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 rounded-xl border border-primary/40 bg-slate-900/95 p-4 text-sm text-foreground shadow-2xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-top-3">
          <Sparkles className="h-5 w-5 text-primary shrink-0" />
          <span className="font-medium">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-auto text-muted-foreground hover:text-foreground text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Principal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <UserCheck className="h-7 w-7 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">
              Gestão de Fila Viva — Operacional da Unidade Escolar
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Motor Central de Convocação, Cascata Automática de Vagas por CPF e Regra de 3 Dias Úteis (SME-Rio)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleVarrerPrazos}
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-950/40 text-amber-300 px-4 py-2 text-xs font-semibold hover:bg-amber-900/50 transition shadow-sm"
          >
            <Clock className="h-4 w-4" />
            Varrer Prazos Expirados
          </button>
          <button
            onClick={handleResetDemo}
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary/80 px-4 py-2 text-xs font-semibold hover:bg-secondary transition shadow-sm"
          >
            <RefreshCw className={`h-4 w-4 ${isPending ? 'animate-spin' : ''}`} />
            Reiniciar Fila Demo
          </button>
        </div>
      </div>

      {/* BANNER DOS 3 INDICADORES DO GERENCIADOR DE FILA */}
      {indicadores && (
        <div className="rounded-2xl border border-primary/30 bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-base font-bold text-foreground">
                Indicadores Consolidados da Gestão de Fila Viva (Rede Municipal)
              </h2>
            </div>
            <span className="text-xs text-muted-foreground">
              {indicadores.totalOpcoesAnalisadas} opções rastreadas em tempo real
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {/* Indicador 1 */}
            <div className="rounded-xl border border-border/60 bg-background/60 p-4 space-y-1">
              <span className="text-xs font-medium text-muted-foreground">
                1. Tempo Médio de Fila na Unidade Escolar
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-blue-400">
                  {indicadores.tempoMedioFilaRedeDias}
                </span>
                <span className="text-xs text-muted-foreground">dias corridos</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Tempo decorrido da inscrição à convocação/desfecho na creche.
              </p>
            </div>

            {/* Indicador 2 */}
            <div className="rounded-xl border border-border/60 bg-background/60 p-4 space-y-1">
              <span className="text-xs font-medium text-muted-foreground">
                2. Total Crianças Não Contactadas (Perdidos)
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-rose-400">
                  {formatNumber(indicadores.totalCriancasNaoContactadasRede)}
                </span>
                <span className="text-xs text-muted-foreground">alunos por estouro</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Opções canceladas automaticamente após 3 dias úteis sem resposta.
              </p>
            </div>

            {/* Indicador 3 */}
            <div className="rounded-xl border border-border/60 bg-background/60 p-4 space-y-1">
              <span className="text-xs font-medium text-muted-foreground">
                3. Média de Contatos por Aluno
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-emerald-400">
                  {indicadores.mediaContatosPorAlunoRede}
                </span>
                <span className="text-xs text-muted-foreground">tentativas/aluno</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Tentativas efetuadas pelas equipes das creches antes da decisão.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SELETOR DE UNIDADE ESCOLAR & TURMAS */}
      <div className="glass-card rounded-2xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
          <div className="flex flex-col gap-1.5 flex-1 max-w-xl">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Building className="h-4 w-4 text-primary" />
              Selecione a Unidade Escolar (Creche / EDI)
            </label>
            <select
              value={unidadeSelecionadaId}
              onChange={(e) => setUnidadeSelecionadaId(e.target.value)}
              className="w-full rounded-xl border border-border bg-slate-900 px-4 py-2.5 text-sm font-semibold text-foreground focus:border-primary focus:outline-none"
            >
              {unidades.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nome} ({u.cre_sigla} · {u.bairro})
                </option>
              ))}
            </select>
          </div>

          {unidadeAtual && (
            <div className="flex flex-col text-right">
              <span className="text-xs text-muted-foreground font-medium">Unidade Selecionada:</span>
              <span className="text-sm font-bold text-foreground">{unidadeAtual.nome}</span>
              <span className="text-xs text-primary font-semibold">{unidadeAtual.cre_sigla} · Bairro {unidadeAtual.bairro}</span>
            </div>
          )}
        </div>

        {/* PILLS DE TURMAS / GRUPAMENTOS */}
        {filas.length > 0 ? (
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Turmas / Grupamento e Turno:
            </span>
            <div className="flex flex-wrap gap-2.5">
              {filas.map((f) => {
                const key = `${f.grupamento} - ${f.turno}`;
                const isSelected = key === turmaSelecionadaKey;
                const confirmados = f.opcoes.filter((o) => o.status === 'CONFIRMADO').length;
                return (
                  <button
                    key={key}
                    onClick={() => setTurmaSelecionadaKey(key)}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                      isSelected
                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]'
                        : 'border border-border bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground'
                    }`}
                  >
                    <span>{f.grupamento} ({f.turno})</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] ${isSelected ? 'bg-black/20 text-white' : 'bg-background text-foreground'}`}>
                      {confirmados}/{f.vagas_disponiveis} vagas
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-sm text-muted-foreground">
            Nenhuma turma cadastrada para esta unidade.
          </div>
        )}

        {/* NAVEGAÇÃO DE MODOS: Fila de Convocação, Já Matriculados, Retirados da Fila, Log Auditável */}
        <div className="flex border-b border-border overflow-x-auto">
          <button
            onClick={() => setModoVisualizacao('convocacao')}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition whitespace-nowrap ${
              modoVisualizacao === 'convocacao'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Users className="h-4 w-4" />
            Fila de Convocação
          </button>
          <button
            onClick={() => setModoVisualizacao('matriculados')}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition whitespace-nowrap ${
              modoVisualizacao === 'matriculados'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />
            Já Matriculados nesta Unidade
          </button>
          <button
            onClick={() => setModoVisualizacao('retirados')}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition whitespace-nowrap ${
              modoVisualizacao === 'retirados'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <UserX className="h-4 w-4 text-rose-400" />
            Retirados da Fila ({retiradosCount})
          </button>
          <button
            onClick={() => setModoVisualizacao('log')}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition whitespace-nowrap ${
              modoVisualizacao === 'log'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            Log Auditoria Motor Central ({logs.length})
          </button>
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL DO MODO */}

      {/* MODO 1: FILA DE CONVOCAÇÃO */}
      {modoVisualizacao === 'convocacao' && filaAtual && (
        <div className="space-y-6">
          {/* Card Resumo da Turma */}
          <div className="flex items-center justify-between rounded-xl bg-secondary/50 p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-primary">
                <School className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">
                  {filaAtual.grupamento} · {filaAtual.turno} — {unidadeAtual?.nome}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {filaAtual.opcoes.filter((o) => o.status === 'CONFIRMADO').length} de {filaAtual.vagas_disponiveis} vaga(s) preenchidas neste processo
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="border-amber-500/30 text-amber-300">
                {filaAtual.opcoes.filter((o) => o.status === 'SELECIONADO').length} Selecionados
              </Badge>
              <Badge variant="outline" className="border-blue-500/30 text-blue-300">
                {filaAtual.opcoes.filter((o) => o.status === 'CONTATADO').length} Contatados em Prazo
              </Badge>
            </div>
          </div>

          {/* LISTA DE OPÇÕES DA TURMA */}
          <div className="space-y-4">
            {filaAtual.opcoes.map((opcao, index) => {
              const posicao = index + 1;
              const diasDistintos = diasDistintosDeTentativa(opcao);
              const nRegistros = opcao.tentativas_contato.length;
              const isAtrasado = recontatoAtrasado(opcao, hoje);
              const proxData = proximaTentativaAte(opcao);
              const { fracao, textoRestante } = progressoETextoPrazo(opcao, hoje);

              const diasExistentesSet = new Set(opcao.tentativas_contato.map((t) => t.split('T')[0]));
              const jaEDiaContabilizado = diasExistentesSet.has(hojeStr);
              const limiteAtingido = diasExistentesSet.size >= 3;

              return (
                <div
                  key={opcao.id}
                  className={`glass-card rounded-2xl p-5 border transition hover:border-primary/40 ${
                    opcao.status === 'CONFIRMADO'
                      ? 'border-emerald-500/40 bg-emerald-950/10'
                      : opcao.status === 'CONTATADO'
                      ? isAtrasado
                        ? 'border-rose-500/60 bg-rose-950/20'
                        : 'border-blue-500/40 bg-blue-950/10'
                      : opcao.status === 'SELECIONADO'
                      ? 'border-amber-500/40 bg-amber-950/10'
                      : opcao.status === 'CANCELADO_NA_CONFIRMACAO'
                      ? 'border-purple-500/30 bg-purple-950/10 opacity-75'
                      : 'border-border'
                  }`}
                >
                  <div className="grid gap-4 md:grid-cols-12 items-center">
                    {/* Posicao */}
                    <div className="md:col-span-1 flex items-center justify-center">
                      <span className="text-xl font-extrabold text-foreground bg-secondary px-3 py-1.5 rounded-xl border border-border">
                        {posicao}º
                      </span>
                    </div>

                    {/* Dados Aluno */}
                    <div className="md:col-span-3 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground text-base">
                          {opcao.aluno_nome}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          ({opcao.aluno_anon})
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-0.5">
                        <p>Pontuação Oficial: <strong className="text-primary">{opcao.pontuacao} pts</strong></p>
                        <p>Tel: <span className="font-mono text-foreground">{opcao.telefone_contato}</span></p>
                        <p className="text-[11px]">Inscrição: {formatDateBR(opcao.data_criacao)} ({opcao.dias_fila} dias em fila)</p>
                      </div>
                    </div>

                    {/* Status Badge & Regra Exata de Prazo + Recontato */}
                    <div className="md:col-span-4 space-y-2">
                      <div>{renderStatusBadge(opcao.status)}</div>

                      {opcao.status === 'CONTATADO' && (
                        <div className="space-y-1.5 bg-background/80 p-3 rounded-xl border border-border text-xs">
                          {/* Barra de Progresso do Prazo Final (3 dias úteis) */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[11px] font-semibold text-muted-foreground">
                              <span>Prazo de resposta:</span>
                              <span className="text-amber-300">{textoRestante}</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-300 ${isAtrasado ? 'bg-rose-500' : 'bg-blue-500'}`}
                                style={{ width: `${Math.round(fracao * 100)}%` }}
                              />
                            </div>
                          </div>

                          {/* Alerta de Recontato Atrasado (se houver) */}
                          {isAtrasado ? (
                            <div className="flex items-start gap-1.5 text-rose-300 bg-rose-950/50 p-2 rounded-lg border border-rose-500/40 text-[11px]">
                              <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                              <span>
                                <strong>Recontato atrasado</strong> — última tentativa em {formatDateBR(opcao.tentativas_contato[opcao.tentativas_contato.length - 1])}. Obrigatório tentar de novo hoje!
                              </span>
                            </div>
                          ) : (
                            <div className="flex justify-between items-center text-[11px] text-slate-300 pt-0.5">
                              <span>Tentativas: <strong className="text-foreground">{diasDistintos.length}/3 dias distintos</strong> ({nRegistros} reg.)</span>
                              <span className="text-muted-foreground">Próximo até: <strong className="text-emerald-300">{formatDateBR(proxData)}</strong></span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Botões de Ação */}
                    <div className="md:col-span-3 flex flex-wrap items-center gap-2">
                      {opcao.status === 'SELECIONADO' && (
                        <button
                          onClick={() => handleMarcarContatado(opcao.id)}
                          disabled={isPending}
                          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:opacity-90 shadow-md transition"
                        >
                          <PhoneCall className="h-3.5 w-3.5" />
                          Marcar como Contatado
                        </button>
                      )}

                      {opcao.status === 'CONTATADO' && (
                        <>
                          {limiteAtingido && !jaEDiaContabilizado ? (
                            <span className="text-[11px] text-muted-foreground italic bg-secondary/60 p-2 rounded-xl border border-border w-full text-center">
                              Já houve tentativa em 3 dias distintos — aguardando resposta ou expiração.
                            </span>
                          ) : (
                            <button
                              onClick={() => handleRegistrarTentativa(opcao.id)}
                              disabled={isPending}
                              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-blue-500/30 bg-blue-950/40 text-blue-300 px-3 py-1.5 text-xs font-semibold hover:bg-blue-900/50 transition"
                            >
                              <PhoneCall className="h-3.5 w-3.5" />
                              ☎️ + Tentativa Hoje
                            </button>
                          )}

                          <button
                            onClick={() => handleRegistrarResposta(opcao.id, true)}
                            disabled={isPending}
                            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 shadow-md transition"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            ✅ Aceitou
                          </button>
                          <button
                            onClick={() => handleRegistrarResposta(opcao.id, false)}
                            disabled={isPending}
                            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-950/40 text-rose-300 px-3 py-1.5 text-xs font-semibold hover:bg-rose-900/50 transition"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            ❌ Recusou
                          </button>
                        </>
                      )}

                      {opcao.status === 'CONFIRMADO' && (
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4" /> Vaga Garantida nesta Creche
                        </span>
                      )}

                      {opcao.status === 'CANCELADO_NA_CONFIRMACAO' && (
                        <span className="text-xs text-purple-300 flex items-center gap-1">
                          <Layers className="h-4 w-4" /> Cancelado por cascata
                        </span>
                      )}
                    </div>

                    {/* Botão de Observações */}
                    <div className="md:col-span-1 flex justify-end">
                      <button
                        onClick={() => setOpcaoObsModal(opcao)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-secondary/80 px-3 py-2 text-xs font-medium text-foreground hover:bg-secondary transition"
                      >
                        <FileText className="h-3.5 w-3.5 text-primary" />
                        Obs ({opcao.observacoes.length})
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODO 2: JÁ MATRICULADOS NESTA UNIDADE */}
      {modoVisualizacao === 'matriculados' && filaAtual && (
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            Crianças Com Vaga Confirmada — {filaAtual.grupamento} · {filaAtual.turno}
          </h3>

          {filaAtual.opcoes.filter((o) => o.status === 'CONFIRMADO').length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">Nenhuma matrícula confirmada ainda nesta turma.</p>
          ) : (
            <div className="divide-y divide-border">
              {filaAtual.opcoes
                .filter((o) => o.status === 'CONFIRMADO')
                .map((opcao) => (
                  <div key={opcao.id} className="py-3.5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-foreground text-sm">{opcao.aluno_nome} ({opcao.aluno_anon})</p>
                      <p className="text-xs text-muted-foreground">Pontuação: {opcao.pontuacao} pts · Responsável: {opcao.responsavel_nome}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-emerald-400 font-semibold bg-emerald-950/40 border border-emerald-500/30 px-3 py-1 rounded-full">
                        Confirmado em {opcao.timestamp_resposta ? formatDateBR(opcao.timestamp_resposta) : 'Hoje'}
                      </span>
                      <button
                        onClick={() => setOpcaoObsModal(opcao)}
                        className="inline-flex items-center gap-1 rounded-xl border border-border bg-secondary/80 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary"
                      >
                        <FileText className="h-3.5 w-3.5 text-primary" />
                        Obs ({opcao.observacoes.length})
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* MODO 3: NOVA ABA — RETIRADOS DA FILA */}
      {modoVisualizacao === 'retirados' && filaAtual && (
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <UserX className="h-5 w-5 text-rose-400" />
                Candidatos Retirados da Fila / Vagas Canceladas — {filaAtual.grupamento} · {filaAtual.turno}
              </h3>
              <p className="text-xs text-muted-foreground">
                Registros com recusa explícita, prazo limite excedido ou desobstruídos por confirmação em outra unidade
              </p>
            </div>
            <Badge variant="outline" className="border-rose-500/30 text-rose-300">
              {retiradosCount} registros nesta turma
            </Badge>
          </div>

          {retiradosCount === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              Nenhum candidato retirado da fila nesta turma.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filaAtual.opcoes
                .filter((o) => o.status === 'CANCELADO_PELO_SISTEMA' || o.status === 'CANCELADO_NA_CONFIRMACAO')
                .map((opcao) => {
                  const isCascata = opcao.status === 'CANCELADO_NA_CONFIRMACAO';

                  return (
                    <div key={opcao.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground text-sm">{opcao.aluno_nome}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">({opcao.aluno_anon})</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Pontuação: <strong className="text-primary">{opcao.pontuacao} pts</strong> · Tel: {opcao.telefone_contato} · Inscrição: {formatDateBR(opcao.data_criacao)}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {isCascata ? (
                            <span className="text-purple-300 font-medium">⚡ Motivo: Confirmou vaga em outra creche (vaga desobstruída por cascata automática)</span>
                          ) : (
                            <span className="text-rose-300 font-medium">❌ Motivo: Recusa declarada pelo responsável ou estouro do prazo limite de 3 dias úteis</span>
                          )}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {renderStatusBadge(opcao.status)}
                        <span className="text-xs text-muted-foreground font-mono">
                          {opcao.timestamp_resposta ? formatDateBR(opcao.timestamp_resposta) : '—'}
                        </span>
                        <button
                          onClick={() => setOpcaoObsModal(opcao)}
                          className="inline-flex items-center gap-1 rounded-xl border border-border bg-secondary/80 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary"
                        >
                          <FileText className="h-3.5 w-3.5 text-primary" />
                          Obs ({opcao.observacoes.length})
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* MODO 4: FEED DE AUDITORIA DO MOTOR CENTRAL */}
      {modoVisualizacao === 'log' && (
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Log em Tempo Real do Motor Central de Convocação
            </h3>
            <span className="text-xs text-muted-foreground">Últimos {logs.length} eventos auditados</span>
          </div>

          <div className="rounded-xl border border-border bg-slate-950/90 p-4 max-h-[500px] overflow-y-auto space-y-3 font-mono text-xs">
            {logs.map((log) => (
              <div key={log.id} className="flex gap-3 border-b border-slate-800/80 pb-2">
                <span className="text-slate-500 shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString('pt-BR')}
                </span>
                <span className={`flex-1 ${
                  log.tipo === 'CASCADE_CANCEL' ? 'text-purple-300 font-semibold' :
                  log.tipo === 'CONFIRMED' ? 'text-emerald-400 font-semibold' :
                  log.tipo === 'EXPIRED_CANCEL' ? 'text-rose-400' :
                  log.tipo === 'CONTACTED' ? 'text-blue-300' : 'text-slate-300'
                }`}>
                  {log.mensagem}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL DE OBSERVAÇÕES DE AUDITORIA (APPEND-ONLY) */}
      {opcaoObsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-slate-900 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Anotações de Auditoria — {opcaoObsModal.aluno_nome}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {opcaoObsModal.unidade_nome} · {opcaoObsModal.grupamento}
                </p>
              </div>
              <button
                onClick={() => setOpcaoObsModal(null)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Histórico de Notas (Append-Only) */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              <span className="text-xs font-bold text-muted-foreground uppercase">Histórico Imutável:</span>
              {opcaoObsModal.observacoes.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">Nenhuma observação cadastrada ainda.</p>
              ) : (
                opcaoObsModal.observacoes.map((obs) => (
                  <div key={obs.id} className="rounded-xl border border-border bg-secondary/50 p-3 space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="font-semibold text-primary">{obs.autor} ({obs.unidade})</span>
                      <span>{new Date(obs.timestamp).toLocaleString('pt-BR')}</span>
                    </div>
                    <p className="text-xs text-foreground">{obs.texto}</p>
                  </div>
                ))
              )}
            </div>

            {/* Form Nova Nota */}
            <form onSubmit={handleAdicionarObservacao} className="space-y-3 border-t border-border pt-3">
              <span className="text-xs font-bold text-foreground">Nova Anotação de Atendimento:</span>
              <input
                type="text"
                value={autorObs}
                onChange={(e) => setAutorObs(e.target.value)}
                placeholder="Nome / Cargo do atendente"
                className="w-full rounded-xl border border-border bg-slate-950 px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
              />
              <textarea
                value={novaObsTexto}
                onChange={(e) => setNovaObsTexto(e.target.value)}
                placeholder="Digite a observação do atendimento (ex: mãe virá amanhã com comprovante)..."
                rows={3}
                className="w-full rounded-xl border border-border bg-slate-950 p-3 text-xs text-foreground focus:border-primary focus:outline-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpcaoObsModal(null)}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-secondary"
                >
                  Fechar
                </button>
                <button
                  type="submit"
                  disabled={isPending || !novaObsTexto.trim()}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                  Salvar Observação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
