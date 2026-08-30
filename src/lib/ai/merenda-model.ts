/**
 * Modelo de Dimensionamento de Merenda Escolar
 * 
 * Refeições = Matrículas_Ativas × Taxa_Presença × Dias_Letivos
 * Custo = Refeições × Custo_Unitário
 */

// --- Tipos ---

export interface ParametrosMerenda {
  escola_id: string;
  escola_nome: string;
  matriculas_ativas: number;
  taxa_presenca: number;        // 0 a 1 (ex: 0.85 = 85%)
  dias_letivos: number;         // dias no mês
  custo_unitario_refeicao: number; // R$
}

export interface ResultadoMerenda {
  escola_id: string;
  escola_nome: string;
  refeicoes_estimadas: number;
  custo_total: number;
  itens_sugeridos: ItemMerenda[];
  projecao_mensal: ProjecaoMensal[];
}

export interface ItemMerenda {
  item: string;
  quantidade_kg: number;
  custo_estimado: number;
}

export interface ProjecaoMensal {
  mes: string;
  dias_letivos: number;
  refeicoes: number;
  custo: number;
}

// --- Constantes ---

const CARDAPIO_BASE: { item: string; porcao_kg_por_refeicao: number; custo_por_kg: number }[] = [
  { item: 'Arroz', porcao_kg_por_refeicao: 0.08, custo_por_kg: 5.50 },
  { item: 'Feijão', porcao_kg_por_refeicao: 0.05, custo_por_kg: 8.20 },
  { item: 'Carne Bovina', porcao_kg_por_refeicao: 0.06, custo_por_kg: 38.00 },
  { item: 'Frango', porcao_kg_por_refeicao: 0.07, custo_por_kg: 16.50 },
  { item: 'Legumes Variados', porcao_kg_por_refeicao: 0.10, custo_por_kg: 7.80 },
  { item: 'Frutas', porcao_kg_por_refeicao: 0.12, custo_por_kg: 6.50 },
  { item: 'Leite (litros)', porcao_kg_por_refeicao: 0.20, custo_por_kg: 5.90 },
  { item: 'Óleo de Soja (litros)', porcao_kg_por_refeicao: 0.01, custo_por_kg: 9.00 },
  { item: 'Macarrão', porcao_kg_por_refeicao: 0.04, custo_por_kg: 6.20 },
  { item: 'Açúcar', porcao_kg_por_refeicao: 0.02, custo_por_kg: 5.00 },
];

const DIAS_LETIVOS_MENSAL: Record<string, number> = {
  Fev: 15, Mar: 22, Abr: 18, Mai: 22, Jun: 20,
  Jul: 10, Ago: 22, Set: 20, Out: 22, Nov: 20, Dez: 15
};

const NOMES_MESES = ['Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

// --- Cálculo ---

export function calcularMerenda(params: ParametrosMerenda): ResultadoMerenda {
  const refeicoes = Math.round(params.matriculas_ativas * params.taxa_presenca * params.dias_letivos);
  const custo = refeicoes * params.custo_unitario_refeicao;

  // Calcular itens necessários com base no cardápio padrão da SME
  const itens: ItemMerenda[] = CARDAPIO_BASE.map(item => {
    const qtd = parseFloat((refeicoes * item.porcao_kg_por_refeicao).toFixed(1));
    return {
      item: item.item,
      quantidade_kg: qtd,
      custo_estimado: parseFloat((qtd * item.custo_por_kg).toFixed(2))
    };
  });

  // Projeção mensal (restante do ano letivo)
  const mesAtual = new Date().getMonth();
  const projecao: ProjecaoMensal[] = NOMES_MESES
    .filter((_, i) => i + 1 >= mesAtual) // Meses restantes
    .slice(0, 6) // Máximo 6 meses
    .map(mes => {
      const dias = DIAS_LETIVOS_MENSAL[mes] || 20;
      const refMes = Math.round(params.matriculas_ativas * params.taxa_presenca * dias);
      return {
        mes,
        dias_letivos: dias,
        refeicoes: refMes,
        custo: parseFloat((refMes * params.custo_unitario_refeicao).toFixed(2))
      };
    });

  return {
    escola_id: params.escola_id,
    escola_nome: params.escola_nome,
    refeicoes_estimadas: refeicoes,
    custo_total: parseFloat(custo.toFixed(2)),
    itens_sugeridos: itens,
    projecao_mensal: projecao,
  };
}

export { NOMES_MESES as MESES_LETIVOS, CARDAPIO_BASE };
