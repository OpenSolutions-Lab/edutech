'use server';

import { queueEngine } from '@/lib/engine/queue-engine';
import {
  FilaUnidadeModel,
  LogEventoFila,
  OpcaoFila,
  ResumoIndicadoresFila,
} from '@/types/gestao-fila';

export async function getUnidadesEscolaresFila() {
  return queueEngine.getUnidadesDisponiveis();
}

export async function getFilasDaUnidadeAction(unidadeId: string): Promise<FilaUnidadeModel[]> {
  return queueEngine.getFilasDaUnidade(unidadeId);
}

export async function getLogsMotorFilaAction(): Promise<LogEventoFila[]> {
  return queueEngine.getLogs();
}

export async function getUltimaSincronizacaoAction(): Promise<string | null> {
  return queueEngine.getUltimaSincronizacao();
}

export async function marcarContatadoAction(opcaoId: string): Promise<OpcaoFila> {
  return queueEngine.marcarContatado(opcaoId);
}

export async function registrarNovaTentativaAction(opcaoId: string): Promise<OpcaoFila> {
  return queueEngine.registrarNovaTentativa(opcaoId);
}

export async function registrarRespostaAction(
  opcaoId: string,
  aceitou: boolean
): Promise<{ opcao: OpcaoFila; notificacoes: string[] }> {
  return queueEngine.registrarResposta(opcaoId, aceitou);
}

export async function adicionarObservacaoAction(
  opcaoId: string,
  autor: string,
  texto: string
): Promise<OpcaoFila> {
  return queueEngine.adicionarObservacao(opcaoId, autor, texto);
}

export async function varrerPrazosExpiradosAction(): Promise<string[]> {
  return queueEngine.varrerPrazosExpirados();
}

export async function getIndicadoresGestaoFilaAction(): Promise<ResumoIndicadoresFila> {
  return queueEngine.getIndicadoresFila();
}

export async function recarregarFilaDemonstracaoAction(): Promise<void> {
  queueEngine.recarregar();
}
