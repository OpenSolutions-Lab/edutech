'use server';

import { createClient } from '@/lib/supabase/server';
import realDataRio from '@/lib/constants/real-data-rio.json';
import { queueEngine } from '@/lib/engine/queue-engine';

export interface KPIsCrecheCidade {
  totalCrechesEdis: number;          // 872 unidades de creche/EDI
  totalCriancasAtendidas: number;   // 62.899 crianças de 0-3a em 2025
  totalCriancasFilaCPF: number;     // 16.345 crianças em fila unificada
  vagasDesbloqueaveisCPF: number;   // 8.563 vagas desobstruídas
  criancasMultiInscricao: number;   // 3.935 crianças com multi-vagas
  taxaGiroFilaPct: number;          // +68.5% giro de vagas
  unidadesPressaoCritica: number;   // 18 creches em alerta de pressão
  
  // 3 NOVOS INDICADORES DO GERENCIADOR DE FILA VIVA:
  tempoMedioFilaDias: number;              // 1. Tempo médio de fila na unidade escolar (dias)
  totalCriancasNaoContactadas: number;     // 2. Total de crianças não contactadas - perdidos - por unidade escolar
  mediaTentativasContatoAluno: number;     // 3. Média de quantidade de contato por aluno
}

export interface FilaPorCRE {
  cre_id: number;
  sigla: string;
  total_fila: number;
  vagas_ociosas_cpf: number;
}

export interface EvolucaoCrecheAnual {
  ano: number;
  total_inscritos: number;
}

export interface CrechePressao {
  id: string;
  nome: string;
  cre_id: number;
  tipo: string;
  bairro: string;
  ipdf_score: number; // Índice Preditivo de Pressão (0.00 a 1.00)
  candidatos_na_fila: number;
  status_fila: 'Crítica' | 'Alta' | 'Moderada';
}

const MOCK_FILA_CRE: FilaPorCRE[] = [
  { cre_id: 1, sigla: '01ª CRE', total_fila: 850, vagas_ociosas_cpf: 420 },
  { cre_id: 2, sigla: '02ª CRE', total_fila: 620, vagas_ociosas_cpf: 310 },
  { cre_id: 3, sigla: '03ª CRE', total_fila: 1480, vagas_ociosas_cpf: 740 },
  { cre_id: 4, sigla: '04ª CRE', total_fila: 2490, vagas_ociosas_cpf: 1240 },
  { cre_id: 5, sigla: '05ª CRE', total_fila: 1210, vagas_ociosas_cpf: 600 },
  { cre_id: 6, sigla: '06ª CRE', total_fila: 1340, vagas_ociosas_cpf: 670 },
  { cre_id: 7, sigla: '07ª CRE', total_fila: 4120, vagas_ociosas_cpf: 2060 }, // Anil + Jacarepaguá + CDD
  { cre_id: 8, sigla: '08ª CRE', total_fila: 1800, vagas_ociosas_cpf: 900 },
  { cre_id: 9, sigla: '09ª CRE', total_fila: 1250, vagas_ociosas_cpf: 625 },
  { cre_id: 10, sigla: '10ª CRE', total_fila: 2850, vagas_ociosas_cpf: 1420 },
  { cre_id: 11, sigla: '11ª CRE', total_fila: 620, vagas_ociosas_cpf: 310 },
];

const MOCK_EVOLUCAO_CRECHE: EvolucaoCrecheAnual[] = [
  { ano: 2021, total_inscritos: 57690 },
  { ano: 2022, total_inscritos: 57820 },
  { ano: 2023, total_inscritos: 45918 },
  { ano: 2024, total_inscritos: 71757 },
  { ano: 2025, total_inscritos: 62899 },
];

const MOCK_CRECHES_PRESSAO: CrechePressao[] = [
  { id: '0716609', nome: 'CM RIO NOVO - RIO DAS FLORES', cre_id: 7, tipo: 'Creche Municipal', bairro: 'ANIL', ipdf_score: 0.92, candidatos_na_fila: 765, status_fila: 'Crítica' },
  { id: '0716812', nome: 'EDI ESCRITORA CLARICE LISPECTOR', cre_id: 7, tipo: 'EDI', bairro: 'JACAREPAGUÁ', ipdf_score: 0.89, candidatos_na_fila: 580, status_fila: 'Crítica' },
  { id: '0716601', nome: 'CM OTÁVIO HENRIQUE DE OLIVEIRA', cre_id: 7, tipo: 'Creche Municipal', bairro: 'CIDADE DE DEUS', ipdf_score: 0.86, candidatos_na_fila: 520, status_fila: 'Crítica' },
  { id: '0411602', nome: 'EDI PROFE. KATIA LIMA', cre_id: 4, tipo: 'EDI', bairro: 'MARÉ', ipdf_score: 0.89, candidatos_na_fila: 490, status_fila: 'Crítica' },
  { id: '1019605', nome: 'CM GUARATIBA PRIMEIRA INFÂNCIA', cre_id: 10, tipo: 'Creche Municipal', bairro: 'GUARATIBA', ipdf_score: 0.87, candidatos_na_fila: 460, status_fila: 'Alta' },
];

/**
 * Retorna os KPIs consolidados da rede com as 3 métricas do Gerenciador de Fila Viva
 */
export async function getKPIsConsolidadosCreche(): Promise<KPIsCrecheCidade> {
  const indFila = queueEngine.getIndicadoresFila();

  return {
    totalCrechesEdis: 872,
    totalCriancasAtendidas: 62899,
    totalCriancasFilaCPF: 16345,
    vagasDesbloqueaveisCPF: 8563,
    criancasMultiInscricao: 3935,
    taxaGiroFilaPct: 68.5,
    unidadesPressaoCritica: 18,
    // 3 NOVOS INDICADORES DO GERENCIADOR DE FILA:
    tempoMedioFilaDias: indFila.tempoMedioFilaRedeDias,
    totalCriancasNaoContactadas: indFila.totalCriancasNaoContactadasRede,
    mediaTentativasContatoAluno: indFila.mediaContatosPorAlunoRede,
  };
}

export async function getFilaPorCRE(): Promise<FilaPorCRE[]> {
  return MOCK_FILA_CRE;
}

export async function getEvolucaoInscricoesCreche(): Promise<EvolucaoCrecheAnual[]> {
  return MOCK_EVOLUCAO_CRECHE;
}

export async function getTopCrechesPressao(): Promise<CrechePressao[]> {
  return MOCK_CRECHES_PRESSAO;
}

export async function getIndicadoresFilaGestao() {
  return queueEngine.getIndicadoresFila();
}
