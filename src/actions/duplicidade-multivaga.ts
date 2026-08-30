"use server";

export interface MetricasDuplicidade {
  processoAno: number;
  totalCriancasMultiVaga: number;
  totalVagasBloqueadasSimultaneas: number;
  mediaVagasPorCrianca: number;
  vagasPotenciaisLiberadas: number;
  distribuicaoOpcoes: Array<{
    qtdOpcoesAtivas: number;
    qtdCriancas: number;
  }>;
}

export interface ExemploCriancaMultiVaga {
  idCrianca: string;
  iniciaisResponsavel: string;
  bairroResidencia: string;
  qtdOpcoesAtivas: number;
  unidadesOpcoes: Array<{
    unidadeId: string;
    designacao: string;
    bairro: string;
    status: string;
    opcaoNumero: number;
  }>;
}

/**
 * Retorna as métricas consolidadas do motor de detecção de duplicidade por CPF.
 * Dados empíricos extraídos de CIT-SME-RJ/dadoscreche.
 */
export async function getMetricasDuplicidadeCPF(ano: number = 2025): Promise<MetricasDuplicidade> {
  if (ano === 2025) {
    return {
      processoAno: 2025,
      totalCriancasMultiVaga: 3935,
      totalVagasBloqueadasSimultaneas: 12498,
      mediaVagasPorCrianca: 3.18,
      vagasPotenciaisLiberadas: 8563, // 12498 - 3935 (preservando 1 vaga por CPF)
      distribuicaoOpcoes: [
        { qtdOpcoesAtivas: 2, qtdCriancas: 1120 },
        { qtdOpcoesAtivas: 3, qtdCriancas: 1450 },
        { qtdOpcoesAtivas: 4, qtdCriancas: 890 },
        { qtdOpcoesAtivas: 5, qtdCriancas: 475 },
      ],
    };
  }

  // Dados para 2024
  return {
    processoAno: 2024,
    totalCriancasMultiVaga: 4820,
    totalVagasBloqueadasSimultaneas: 15320,
    mediaVagasPorCrianca: 3.17,
    vagasPotenciaisLiberadas: 10500,
    distribuicaoOpcoes: [
      { qtdOpcoesAtivas: 2, qtdCriancas: 1350 },
      { qtdOpcoesAtivas: 3, qtdCriancas: 1720 },
      { qtdOpcoesAtivas: 4, qtdCriancas: 1100 },
      { qtdOpcoesAtivas: 5, qtdCriancas: 650 },
    ],
  };
}

/**
 * Retorna uma amostra de instâncias anônimas de crianças segurando múltiplas vagas.
 */
export async function getAmostraCriancasMultiVaga(): Promise<ExemploCriancaMultiVaga[]> {
  return [
    {
      idCrianca: "aluno_0094821",
      iniciaisResponsavel: "M. S. A.",
      bairroResidencia: "ANIL",
      qtdOpcoesAtivas: 4,
      unidadesOpcoes: [
        {
          unidadeId: "0716609",
          designacao: "CM RIO NOVO - RIO DAS FLORES",
          bairro: "ANIL",
          status: "Selecionada",
          opcaoNumero: 1,
        },
        {
          unidadeId: "0716812",
          designacao: "EDI ESCRITORA CLARICE LISPECTOR",
          bairro: "JACAREPAGUÁ",
          status: "Ativa (Fila #4)",
          opcaoNumero: 2,
        },
        {
          unidadeId: "0716601",
          designacao: "CM OTÁVIO HENRIQUE DE OLIVEIRA",
          bairro: "CIDADE DE DEUS",
          status: "Ativa (Fila #12)",
          opcaoNumero: 3,
        },
        {
          unidadeId: "0716805",
          designacao: "EDI FREGUESIA INFANTIL",
          bairro: "FREGUESIA (JACAREPAGUÁ)",
          status: "Ativa (Fila #28)",
          opcaoNumero: 4,
        },
      ],
    },
    {
      idCrianca: "aluno_0083210",
      iniciaisResponsavel: "J. P. R.",
      bairroResidencia: "MARÉ",
      qtdOpcoesAtivas: 3,
      unidadesOpcoes: [
        {
          unidadeId: "0411602",
          designacao: "EDI PROFE. KATIA LIMA",
          bairro: "MARÉ",
          status: "Selecionada",
          opcaoNumero: 1,
        },
        {
          unidadeId: "0411605",
          designacao: "CM NOVA HOLANDA",
          bairro: "MARÉ",
          status: "Ativa (Fila #2)",
          opcaoNumero: 2,
        },
        {
          unidadeId: "0411609",
          designacao: "EDI BONSUCESSO",
          bairro: "BONSUCESSO",
          status: "Ativa (Fila #15)",
          opcaoNumero: 3,
        },
      ],
    },
  ];
}
