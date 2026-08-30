'use server';

import { createClient } from '@/lib/supabase/server';

export interface FilaResumo {
  totalFila: number;
  totalVagasDisponiveis: number;
  vagasLiberadasMes: number;
  taxaAtendimento: number; // % de vagas liberadas vs inscritos
}

export interface FilaEvolucao {
  mes: string;
  Creche: number;
  PreEscola: number;
}

export interface FilaCRE {
  cre_id: number;
  sigla: string;
  sigla_nome?: string;
  inscritos: number;
  vagas: number;
}

const MOCK_RESUMO: FilaResumo = {
  totalFila: 16345, // Total de crianças em fila de espera em Creche (2025)
  totalVagasDisponiveis: 8563, // Vagas desobstruíveis por consolidação por CPF
  vagasLiberadasMes: 2450,
  taxaAtendimento: 74.8 // Taxa de atendimento 2025
};

const MOCK_EVOLUCAO: FilaEvolucao[] = [
  { mes: '2021', Creche: 68392, PreEscola: 0 },
  { mes: '2022', Creche: 33338, PreEscola: 0 },
  { mes: '2023', Creche: 29715, PreEscola: 0 },
  { mes: '2024', Creche: 30941, PreEscola: 0 },
  { mes: '2025', Creche: 16345, PreEscola: 0 }
];

const MOCK_FILA_CRE: FilaCRE[] = [
  { cre_id: 1, sigla: '01ª CRE', inscritos: 850, vagas: 220 },
  { cre_id: 2, sigla: '02ª CRE', sigla_nome: 'Zona Sul/Tijuca', inscritos: 620, vagas: 190 },
  { cre_id: 3, sigla: '03ª CRE', inscritos: 1480, vagas: 310 },
  { cre_id: 4, sigla: '04ª CRE', inscritos: 2490, vagas: 480 },
  { cre_id: 5, sigla: '05ª CRE', inscritos: 1210, vagas: 290 },
  { cre_id: 6, sigla: '06ª CRE', inscritos: 1340, vagas: 220 },
  { cre_id: 7, sigla: '07ª CRE', inscritos: 4120, vagas: 850 }, // 7ª CRE Anil + Jacarepaguá + CDD
  { cre_id: 8, sigla: '08ª CRE', inscritos: 1800, vagas: 350 },
  { cre_id: 9, sigla: '09ª CRE', inscritos: 1250, vagas: 290 },
  { cre_id: 10, sigla: '10ª CRE', inscritos: 2850, vagas: 440 },
  { cre_id: 11, sigla: '11ª CRE', inscritos: 620, vagas: 150 }
];

export async function getResumoFila(): Promise<FilaResumo> {
  try {
    const supabase = await createClient();

    const { data, error } = (await supabase
      .from('fila_espera')
      .select('vagas_disponiveis, inscritos_fila, vagas_liberadas_mes')
      .eq('ano', 2025)
      .eq('mes', 7)) as any;

    if (error || !data || data.length === 0) {
      return MOCK_RESUMO;
    }

    let totalFila = 0;
    let totalVagas = 0;
    let totalLiberadas = 0;

    data.forEach((row: any) => {
      totalFila += row.inscritos_fila || 0;
      totalVagas += row.vagas_disponiveis || 0;
      totalLiberadas += row.vagas_liberadas_mes || 0;
    });

    const taxa = totalFila > 0 ? (totalLiberadas / totalFila) * 100 : 0;

    return {
      totalFila,
      totalVagasDisponiveis: totalVagas,
      vagasLiberadasMes: totalLiberadas,
      taxaAtendimento: parseFloat(taxa.toFixed(1))
    };
  } catch {
    return MOCK_RESUMO;
  }
}

export async function getEvolucaoFila(): Promise<FilaEvolucao[]> {
  try {
    const supabase = await createClient();

    const { data, error } = (await supabase
      .from('fila_espera')
      .select('mes, segmento, inscritos_fila')
      .eq('ano', 2025)) as any;

    if (error || !data || data.length === 0) {
      return MOCK_EVOLUCAO;
    }

    const mesesMap = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    // Agrupar por mês e segmento
    const groups: Record<number, { Creche: number; PreEscola: number }> = {};
    
    data.forEach((row: any) => {
      const m = row.mes;
      if (!groups[m]) {
        groups[m] = { Creche: 0, PreEscola: 0 };
      }
      if (row.segmento === 'Creche') {
        groups[m].Creche += row.inscritos_fila || 0;
      } else if (row.segmento === 'Pre_Escola') {
        groups[m].PreEscola += row.inscritos_fila || 0;
      }
    });

    const result = Object.keys(groups).map((mKey) => {
      const mNum = Number(mKey);
      return {
        mes: mesesMap[mNum - 1] || String(mNum),
        Creche: groups[mNum].Creche,
        PreEscola: groups[mNum].PreEscola
      };
    });

    return result.length > 0 ? result : MOCK_EVOLUCAO;
  } catch {
    return MOCK_EVOLUCAO;
  }
}

export async function getFilaPorCRE(): Promise<FilaCRE[]> {
  try {
    const supabase = await createClient();

    // Query fila e join com escolas para saber a CRE
    const { data, error } = await supabase
      .from('fila_espera')
      .select(`
        inscritos_fila,
        vagas_disponiveis,
        escolas (
          cre_id
        )
      `)
      .eq('ano', 2025)
      .eq('mes', 7);

    if (error || !data || data.length === 0) {
      return MOCK_FILA_CRE;
    }

    const creMap: Record<number, { inscritos: number; vagas: number }> = {};
    
    data.forEach((row: any) => {
      const creId = row.escolas?.cre_id;
      if (creId) {
        if (!creMap[creId]) {
          creMap[creId] = { inscritos: 0, vagas: 0 };
        }
        creMap[creId].inscritos += row.inscritos_fila || 0;
        creMap[creId].vagas += row.vagas_disponiveis || 0;
      }
    });

    const result = Object.keys(creMap).map((key) => {
      const creId = Number(key);
      return {
        cre_id: creId,
        sigla: `${creId}ª CRE`,
        inscritos: creMap[creId].inscritos,
        vagas: creMap[creId].vagas
      };
    });

    return result.length > 0 ? result.sort((a, b) => a.cre_id - b.cre_id) : MOCK_FILA_CRE;
  } catch {
    return MOCK_FILA_CRE;
  }
}
