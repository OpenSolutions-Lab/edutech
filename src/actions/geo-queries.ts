'use server';

import { createClient } from '@/lib/supabase/server';

export interface EscolaGeo {
  id: string;
  nome: string;
  tipo: string;
  cre_id: number;
  lat: number;
  lng: number;
  total_matriculas: number;
  taxa_evasao: number;
  score_risco: number;
  nivel_risco: 'baixo' | 'moderado' | 'alto' | 'critico';
  ar_condicionado: boolean;
}

export interface VazioEducacionalGeo {
  bairro_nome: string;
  populacao_alvo: number;
  total_vagas: number;
  deficit_estimado: number;
  geojson: any; // Polygon / MultiPolygon geometry
}

export interface EscolaReformaGeo {
  id: string;
  nome: string;
  cre_id: number;
  tipo: string;
  lat: number;
  lng: number;
  ano_construcao: number;
  ar_condicionado: boolean;
  score_prioridade: number; // 0 a 100
}

// MOCKS DE FALLBACK COM EXCLUSIVIDADE PARA CRECHES E EDIS
const MOCK_ESCOLAS_GEO: EscolaGeo[] = [
  { id: '0716609', nome: 'CM RIO NOVO - RIO DAS FLORES', tipo: 'Creche Municipal', cre_id: 7, lat: -22.9542, lng: -43.3421, total_matriculas: 120, taxa_evasao: 1.2, score_risco: 0.92, nivel_risco: 'critico', ar_condicionado: true },
  { id: '0716812', nome: 'EDI ESCRITORA CLARICE LISPECTOR', tipo: 'EDI', cre_id: 7, lat: -22.9610, lng: -43.3512, total_matriculas: 150, taxa_evasao: 0.9, score_risco: 0.89, nivel_risco: 'critico', ar_condicionado: true },
  { id: '0716601', nome: 'CM OTÁVIO HENRIQUE DE OLIVEIRA', tipo: 'Creche Municipal', cre_id: 7, lat: -22.9488, lng: -43.3611, total_matriculas: 140, taxa_evasao: 1.5, score_risco: 0.86, nivel_risco: 'critico', ar_condicionado: true },
  { id: '0411602', nome: 'EDI PROFE. KATIA LIMA', tipo: 'EDI', cre_id: 4, lat: -22.8580, lng: -43.2450, total_matriculas: 180, taxa_evasao: 2.1, score_risco: 0.89, nivel_risco: 'critico', ar_condicionado: false },
  { id: '1019605', nome: 'CM GUARATIBA PRIMEIRA INFÂNCIA', tipo: 'Creche Municipal', cre_id: 10, lat: -22.9890, lng: -43.5890, total_matriculas: 160, taxa_evasao: 1.8, score_risco: 0.87, nivel_risco: 'alto', ar_condicionado: true },
  { id: '0102601', nome: 'EDI SANTA TERESA INFANTIL', tipo: 'EDI', cre_id: 1, lat: -22.9210, lng: -43.1890, total_matriculas: 90, taxa_evasao: 0.8, score_risco: 0.32, nivel_risco: 'baixo', ar_condicionado: true },
  { id: '0204603', nome: 'CM BOTAFOGO INFANTIL', tipo: 'Creche Municipal', cre_id: 2, lat: -22.9510, lng: -43.1820, total_matriculas: 100, taxa_evasao: 0.5, score_risco: 0.12, nivel_risco: 'baixo', ar_condicionado: true },
  { id: '0716805', nome: 'EDI FREGUESIA INFANTIL', tipo: 'EDI', cre_id: 7, lat: -22.9410, lng: -43.3400, total_matriculas: 130, taxa_evasao: 1.1, score_risco: 0.45, nivel_risco: 'moderado', ar_condicionado: true },
  { id: '0515602', nome: 'EDI MADUREIRA INFANTIL', tipo: 'EDI', cre_id: 5, lat: -22.8710, lng: -43.3360, total_matriculas: 140, taxa_evasao: 1.9, score_risco: 0.54, nivel_risco: 'alto', ar_condicionado: true }
];

const MOCK_VAZIOS_GEO = (tipo: string): VazioEducacionalGeo[] => [
  {
    bairro_nome: 'Anil (Jacarepaguá)',
    populacao_alvo: 2450,
    total_vagas: 625,
    deficit_estimado: 1825,
    geojson: {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[[-43.35, -22.96], [-43.33, -22.94], [-43.32, -22.97], [-43.35, -22.96]]]
      }
    }
  },
  {
    bairro_nome: 'Jacarepaguá Central',
    populacao_alvo: 2100,
    total_vagas: 713,
    deficit_estimado: 1387,
    geojson: {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[[-43.36, -22.97], [-43.34, -22.95], [-43.33, -22.98], [-43.36, -22.97]]]
      }
    }
  },
  {
    bairro_nome: 'Complexo da Maré',
    populacao_alvo: 1799,
    total_vagas: 900,
    deficit_estimado: 899,
    geojson: {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[[-43.25, -22.86], [-43.23, -22.85], [-43.22, -22.87], [-43.25, -22.86]]]
      }
    }
  }
];

const MOCK_REFORMAS_GEO: EscolaReformaGeo[] = [
  { id: '0716609', nome: 'CM RIO NOVO - RIO DAS FLORES', cre_id: 7, tipo: 'Creche Municipal', lat: -22.9542, lng: -43.3421, ano_construcao: 2012, ar_condicionado: true, score_prioridade: 89.5 },
  { id: '0716812', nome: 'EDI ESCRITORA CLARICE LISPECTOR', cre_id: 7, tipo: 'EDI', lat: -22.9610, lng: -43.3512, ano_construcao: 2014, ar_condicionado: true, score_prioridade: 86.2 },
  { id: '0411602', nome: 'EDI PROFE. KATIA LIMA', cre_id: 4, tipo: 'EDI', lat: -22.8580, lng: -43.2450, ano_construcao: 2008, ar_condicionado: false, score_prioridade: 91.2 },
  { id: '1019605', nome: 'CM GUARATIBA PRIMEIRA INFÂNCIA', cre_id: 10, tipo: 'Creche Municipal', lat: -22.9890, lng: -43.5890, ano_construcao: 2010, ar_condicionado: true, score_prioridade: 79.1 },
];

export async function getEscolasGeo(): Promise<EscolaGeo[]> {
  try {
    const supabase = await createClient();

    // Query RPC or direct table with custom select
    const { data, error } = await supabase
      .from('escolas')
      .select(`
        id,
        nome,
        tipo,
        cre_id,
        localizacao,
        ar_condicionado,
        matriculas_historico (
          total_matriculas,
          taxa_evasao
        ),
        predicoes_evasao (
          score_risco,
          nivel_risco
        )
      `)
      .eq('status', 'ativa');

    if (error || !data || data.length === 0) {
      return MOCK_ESCOLAS_GEO;
    }

    return data.map((item: any) => {
      // Obter coordenadas do Point
      const coords = item.localizacao?.coordinates || [0, 0];
      const lng = coords[0];
      const lat = coords[1];

      // Históricos e predições mais recentes
      const hist = item.matriculas_historico?.sort((a: any, b: any) => b.ano - a.ano)[0] || { total_matriculas: 400, taxa_evasao: 3.0 };
      const pred = item.predicoes_evasao?.[0] || { score_risco: 0.1, nivel_risco: 'baixo' };

      return {
        id: item.id,
        nome: item.nome,
        tipo: item.tipo,
        cre_id: item.cre_id || 0,
        lat,
        lng,
        total_matriculas: Number(hist.total_matriculas || 0),
        taxa_evasao: Number(hist.taxa_evasao || 0),
        score_risco: Number(pred.score_risco || 0.1),
        nivel_risco: pred.nivel_risco || 'baixo',
        ar_condicionado: item.ar_condicionado
      };
    });
  } catch {
    return MOCK_ESCOLAS_GEO;
  }
}

export async function getVaziosEducacionaisGeo(tipo: string = 'Creche'): Promise<VazioEducacionalGeo[]> {
  try {
    const supabase = await createClient();

    // Chamada à RPC fn_vazios_educacionais
    const { data, error } = await (supabase as any).rpc('fn_vazios_educacionais', { p_tipo: tipo });

    if (error || !data || (data as any).length === 0) {
      return MOCK_VAZIOS_GEO(tipo);
    }

    return data.map((row: any) => ({
      bairro_nome: row.bairro_nome,
      populacao_alvo: row.populacao_alvo,
      total_vagas: row.total_vagas,
      deficit_estimado: row.deficit_estimado,
      geojson: {
        type: 'Feature',
        geometry: row.geometria
      }
    }));
  } catch {
    return MOCK_VAZIOS_GEO(tipo);
  }
}

export async function getPrioridadeReformasGeo(): Promise<EscolaReformaGeo[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('escolas')
      .select(`
        id,
        nome,
        cre_id,
        tipo,
        localizacao,
        ano_construcao,
        ar_condicionado,
        orcamento_manutencao (
          valor_pago
        )
      `)
      .eq('status', 'ativa');

    if (error || !data || data.length === 0) {
      return MOCK_REFORMAS_GEO;
    }

    const result: EscolaReformaGeo[] = data.map((item: any) => {
      const coords = item.localizacao?.coordinates || [0, 0];
      const lng = coords[0];
      const lat = coords[1];

      const orcamentos = item.orcamento_manutencao || [];
      const totalOrcamento = orcamentos.reduce((acc: number, curr: any) => acc + Number(curr.valor_pago || 0), 0);

      // Calculando prioridade de reforma
      const idade = new Date().getFullYear() - (item.ano_construcao || 1980);
      const semAr = item.ar_condicionado ? 0 : 40;
      const predioAntigo = Math.min((idade / 70) * 40, 40);
      const baixoOrcamento = totalOrcamento < 150000 ? 20 : 0;

      const score = Math.min(semAr + predioAntigo + baixoOrcamento, 100);

      return {
        id: item.id,
        nome: item.nome,
        cre_id: item.cre_id || 0,
        tipo: item.tipo,
        lat,
        lng,
        ano_construcao: item.ano_construcao || 1980,
        ar_condicionado: item.ar_condicionado,
        score_prioridade: parseFloat(score.toFixed(1))
      };
    });

    return result.sort((a, b) => b.score_prioridade - a.score_prioridade);
  } catch {
    return MOCK_REFORMAS_GEO;
  }
}
