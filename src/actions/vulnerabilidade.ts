'use server';

import { createClient } from '@/lib/supabase/server';

export interface EscolaVulnerabilidade {
  id: string;
  nome: string;
  cre_id: number;
  tipo: string;
  bairro: string;
  idh: number;
  taxa_evasao: number;
  taxa_aprovacao: number;
  carencia_professores: number;
  ar_condicionado: boolean;
  score_risco_evasao: number;
  ive: number; // Índice de Vulnerabilidade Escolar (0 a 100)
}

const MOCK_VULNERABILIDADE: EscolaVulnerabilidade[] = [
  { id: '1', nome: 'E.M. Francisco de Campos', cre_id: 3, tipo: 'CIEP', bairro: 'Engenho Novo', idh: 0.782, taxa_evasao: 4.8, taxa_aprovacao: 81.2, carencia_professores: 4, ar_condicionado: false, score_risco_evasao: 0.92, ive: 84.5 },
  { id: '2', nome: 'E.M. Senador Camará', cre_id: 8, tipo: 'Escola Municipal', bairro: 'Bangu', idh: 0.751, taxa_evasao: 5.2, taxa_aprovacao: 82.5, carencia_professores: 6, ar_condicionado: false, score_risco_evasao: 0.88, ive: 82.1 },
  { id: '3', nome: 'E.M. Princesa Isabel', cre_id: 10, tipo: 'EDI', bairro: 'Santa Cruz', idh: 0.723, taxa_evasao: 5.5, taxa_aprovacao: 80.1, carencia_professores: 2, ar_condicionado: false, score_risco_evasao: 0.85, ive: 80.8 },
  { id: '4', nome: 'E.M. Marechal Rondom', cre_id: 3, tipo: 'Escola Municipal', bairro: 'Méier', idh: 0.812, taxa_evasao: 3.9, taxa_aprovacao: 84.5, carencia_professores: 3, ar_condicionado: true, score_risco_evasao: 0.79, ive: 71.4 },
  { id: '5', nome: 'E.M. Cardeal Leme', cre_id: 11, tipo: 'CIEP', bairro: 'Complexo da Maré', idh: 0.655, taxa_evasao: 4.2, taxa_aprovacao: 83.1, carencia_professores: 5, ar_condicionado: true, score_risco_evasao: 0.76, ive: 76.5 },
  { id: '6', nome: 'E.M. Barão de Macahubas', cre_id: 1, tipo: 'Escola Municipal', bairro: 'Centro', idh: 0.852, taxa_evasao: 2.1, taxa_aprovacao: 89.2, carencia_professores: 1, ar_condicionado: true, score_risco_evasao: 0.32, ive: 35.2 },
  { id: '7', nome: 'E.M. Henrique Dodsworth', cre_id: 2, tipo: 'CIEP', bairro: 'Copacabana', idh: 0.955, taxa_evasao: 1.2, taxa_aprovacao: 94.5, carencia_professores: 0, ar_condicionado: true, score_risco_evasao: 0.12, ive: 15.6 },
  { id: '8', nome: 'E.M. República Argentina', cre_id: 2, tipo: 'Escola Municipal', bairro: 'Botafogo', idh: 0.962, taxa_evasao: 1.1, taxa_aprovacao: 95.2, carencia_professores: 0, ar_condicionado: true, score_risco_evasao: 0.08, ive: 12.4 },
  { id: '9', nome: 'E.M. Herbert Moses', cre_id: 7, tipo: 'Escola Municipal', bairro: 'Jacarepaguá', idh: 0.841, taxa_evasao: 2.4, taxa_aprovacao: 88.1, carencia_professores: 2, ar_condicionado: true, score_risco_evasao: 0.35, ive: 36.8 },
  { id: '10', nome: 'E.M. Chile', cre_id: 5, tipo: 'Escola Municipal', bairro: 'Olaria', idh: 0.792, taxa_evasao: 3.1, taxa_aprovacao: 86.4, carencia_professores: 2, ar_condicionado: false, score_risco_evasao: 0.54, ive: 58.4 }
];

export async function getRankingVulnerabilidade(): Promise<EscolaVulnerabilidade[]> {
  try {
    const supabase = await createClient();

    // Consulta escolas com seus dados geográficos, históricos e de predições
    const { data, error } = await supabase
      .from('escolas')
      .select(`
        id,
        nome,
        cre_id,
        tipo,
        ar_condicionado,
        bairros (
          nome,
          idh
        ),
        matriculas_historico (
          taxa_evasao,
          taxa_aprovacao
        ),
        predicoes_evasao (
          score_risco
        ),
        quadro_pessoal (
          carencia_total
        )
      `)
      .eq('status', 'ativa');

    if (error || !data || data.length === 0) {
      console.warn('Erro ou ausência de dados na tabela escolas. Usando fallback de vulnerabilidade.');
      return MOCK_VULNERABILIDADE.sort((a, b) => b.ive - a.ive);
    }

    // Mapeia e calcula o IVE
    const result: EscolaVulnerabilidade[] = data.map((item: any) => {
      const bairro = item.bairros?.nome || 'Não Informado';
      const idh = Number(item.bairros?.idh || 0.75);

      // Obter histórico mais recente
      const hist = item.matriculas_historico?.sort((a: any, b: any) => b.ano - a.ano)[0] || { taxa_evasao: 3.0, taxa_aprovacao: 88.0 };
      const pred = item.predicoes_evasao?.[0] || { score_risco: 0.3 };
      const quadro = item.quadro_pessoal?.[0] || { carencia_total: 0 };

      const taxaEvasao = Number(hist.taxa_evasao || 0);
      const taxaAprovacao = Number(hist.taxa_aprovacao || 88);
      const scoreRisco = Number(pred.score_risco || 0.3);
      const carencia = Number(quadro.carencia_total || 0);

      // Cálculo do IVE (Escala de 0 a 100)
      // IVE = 0.30 * Score_Evasao + 0.25 * (1 - IDH) + 0.20 * Carencia_RH_Normalizada + 0.15 * (1 - Taxa_Aprovação) + 0.10 * Deficit_Infraestrutura
      const compEvasao = scoreRisco * 100;
      const compIdh = (1 - idh) * 100;
      const compCarencia = Math.min((carencia / 10) * 100, 100);
      const compAprovacao = ((100 - taxaAprovacao) / 100) * 100;
      const compInfra = item.ar_condicionado ? 0 : 50; // se não tem ar condicionado, soma no risco

      const ive = 0.30 * compEvasao + 0.25 * compIdh + 0.20 * compCarencia + 0.15 * compAprovacao + 0.10 * compInfra;

      return {
        id: item.id,
        nome: item.nome,
        cre_id: item.cre_id || 0,
        tipo: item.tipo,
        bairro,
        idh,
        taxa_evasao: taxaEvasao,
        taxa_aprovacao: taxaAprovacao,
        carencia_professores: carencia,
        ar_condicionado: item.ar_condicionado,
        score_risco_evasao: scoreRisco,
        ive: parseFloat(ive.toFixed(1))
      };
    });

    return result.sort((a, b) => b.ive - a.ive);
  } catch (err) {
    return MOCK_VULNERABILIDADE.sort((a, b) => b.ive - a.ive);
  }
}
