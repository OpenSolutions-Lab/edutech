/**
 * Tipos de dados para o Gerenciador de Fila Viva de Creches (SME-Rio)
 */

export type StatusOpcaoFila =
  | 'LISTA_DE_ESPERA'
  | 'SELECIONADO'
  | 'CONTATADO'
  | 'CONFIRMADO'
  | 'CANCELADO_NA_CONFIRMACAO'
  | 'CANCELADO_PELO_SISTEMA';

export interface RegistroObservacao {
  id: string;
  autor: string;
  unidade: string;
  texto: string;
  timestamp: string; // ISO String
}

export interface OpcaoFila {
  id: string;
  aluno_anon: string;
  aluno_nome: string;
  responsavel_anon: string;
  responsavel_nome: string;
  unidade_id: string;
  unidade_nome: string;
  cre_id: number;
  cre_sigla: string;
  bairro: string;
  turno: 'Integral' | 'Manhã' | 'Tarde';
  grupamento: 'Berçário I' | 'Berçário II' | 'Maternal I' | 'Maternal II';
  ordem_opcao: number; // 1ª, 2ª, 3ª opção do aluno
  pontuacao: number;
  data_criacao: string; // ISO string da inscrição
  status: StatusOpcaoFila;
  timestamp_contato?: string | null; // Data/hora do 1º contato
  prazo_limite?: string | null; // Data final (3 dias úteis) YYYY-MM-DD
  timestamp_resposta?: string | null; // Quando foi confirmado/recusado/expirado
  tentativas_contato: string[]; // ISO strings de cada tentativa registrada
  observacoes: RegistroObservacao[]; // Notas de auditoria append-only
  telefone_contato: string;
  dias_fila: number; // Dias corridos em fila até a convocação/atual
}

export interface FilaUnidadeModel {
  unidade_id: string;
  unidade_nome: string;
  cre_id: number;
  turno: string;
  grupamento: string;
  vagas_disponiveis: number;
  opcoes: OpcaoFila[];
}

export interface LogEventoFila {
  id: string;
  timestamp: string;
  mensagem: string;
  tipo: 'PROMOTED' | 'CONTACTED' | 'CONFIRMED' | 'CASCADE_CANCEL' | 'EXPIRED_CANCEL' | 'REFUSED_CANCEL' | 'NOTE_ADDED';
  unidade_nome?: string;
  aluno_anon?: string;
}

export interface IndicadoresFilaUnidade {
  unidade_id: string;
  unidade_nome: string;
  cre_id: number;
  cre_sigla: string;
  bairro: string;
  total_inscritos: number;
  total_vagas: number;
  vagas_ocupadas: number;
  tempo_medio_fila_dias: number; // Indicador 1: Tempo médio de fila na unidade escolar
  criancas_nao_contactadas_perdidos: number; // Indicador 2: Total de crianças não contactadas - perdidos - por unidade escolar
  media_contatos_por_aluno: number; // Indicador 3: Média de quantidade de contato por aluno
}

export interface ResumoIndicadoresFila {
  tempoMedioFilaRedeDias: number; // Indicador 1 Geral
  totalCriancasNaoContactadasRede: number; // Indicador 2 Geral
  mediaContatosPorAlunoRede: number; // Indicador 3 Geral
  totalOpcoesAnalisadas: number;
  totalVagasLiberadasCascata: number;
  unidades: IndicadoresFilaUnidade[];
}
