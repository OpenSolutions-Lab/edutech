/**
 * Motor de Régua Socioeconômica por Processo Seletivo (2021-2025) - SME-Rio
 * 
 * Regra de Negócio RN-001: A régua de pontuação socioeconômica sofreu ajustes nos ciclos:
 * - 2021-2023: Foco em vulnerabilidade social direta (Bolsa Família + Renda + Deficiência)
 * - 2024: Inclusão de ponderação por mãe trabalhadora / adolescente e irmão na unidade
 * - 2025: Matriz com pesos revisados (Cartão Família Carioca = 100 pts, PWD = 100 pts, etc.)
 */

export interface RespostaSocioeconomica {
  codigoPergunta: string;
  resposta: string | boolean | number;
}

export interface DadosInscricaoScoring {
  processoAno: number;
  temBolsaFamilia?: boolean;
  temCartaoFamiliaCarioca?: boolean;
  possuiDeficiencia?: boolean;
  maeAdolescente?: boolean;
  maeTrabalhadora?: boolean;
  temIrmaoNaUnidade?: boolean;
  rendaPerCapita?: number; // em reais
  distanciaKm?: number;
  respostasDetalhadas?: RespostaSocioeconomica[];
}

export interface ResultadoScoring {
  pontuacaoTotal: number;
  detalhamento: Record<string, number>;
  processoAno: number;
  reguaAplicada: string;
}

export function calcularPontuacaoInscricao(dados: DadosInscricaoScoring): ResultadoScoring {
  const { processoAno } = dados;
  let pontuacaoTotal = 0;
  const detalhamento: Record<string, number> = {};

  if (processoAno <= 2023) {
    // Régua 2021 - 2023
    if (dados.temBolsaFamilia || dados.temCartaoFamiliaCarioca) {
      detalhamento["Vulnerabilidade Social (BF/CFC)"] = 100;
      pontuacaoTotal += 100;
    }
    if (dados.possuiDeficiencia) {
      detalhamento["Pessoa com Deficiência (PCD)"] = 80;
      pontuacaoTotal += 80;
    }
    if (dados.rendaPerCapita !== undefined && dados.rendaPerCapita <= 218) {
      detalhamento["Extrema Pobreza"] = 50;
      pontuacaoTotal += 50;
    } else if (dados.rendaPerCapita !== undefined && dados.rendaPerCapita <= 660) {
      detalhamento["Baixa Renda"] = 30;
      pontuacaoTotal += 30;
    }
    if (dados.temIrmaoNaUnidade) {
      detalhamento["Irmão Matriculado"] = 20;
      pontuacaoTotal += 20;
    }
    return {
      pontuacaoTotal,
      detalhamento,
      processoAno,
      reguaAplicada: "Régua Socioeconômica SME 2021-2023",
    };
  }

  if (processoAno === 2024) {
    // Régua 2024
    if (dados.temCartaoFamiliaCarioca || dados.temBolsaFamilia) {
      detalhamento["Programa Social (CFC/BF)"] = 100;
      pontuacaoTotal += 100;
    }
    if (dados.possuiDeficiencia) {
      detalhamento["Pessoa com Deficiência (PCD)"] = 100;
      pontuacaoTotal += 100;
    }
    if (dados.maeAdolescente) {
      detalhamento["Mãe Adolescente (<18 anos)"] = 40;
      pontuacaoTotal += 40;
    }
    if (dados.maeTrabalhadora) {
      detalhamento["Mãe / Responsável Trabalhador"] = 30;
      pontuacaoTotal += 30;
    }
    if (dados.temIrmaoNaUnidade) {
      detalhamento["Irmão na mesma unidade"] = 30;
      pontuacaoTotal += 30;
    }
    if (dados.distanciaKm !== undefined && dados.distanciaKm <= 2.0) {
      detalhamento["Proximidade Territorial (<2km)"] = 20;
      pontuacaoTotal += 20;
    }

    return {
      pontuacaoTotal,
      detalhamento,
      processoAno,
      reguaAplicada: "Régua Socioeconômica SME 2024",
    };
  }

  // Régua 2025 (Atual)
  if (dados.temCartaoFamiliaCarioca) {
    detalhamento["Cartão Família Carioca"] = 100;
    pontuacaoTotal += 100;
  } else if (dados.temBolsaFamilia) {
    detalhamento["Bolsa Família"] = 80;
    pontuacaoTotal += 80;
  }

  if (dados.possuiDeficiencia) {
    detalhamento["Pessoa com Deficiência (PCD)"] = 100;
    pontuacaoTotal += 100;
  }

  if (dados.maeAdolescente) {
    detalhamento["Mãe Adolescente"] = 50;
    pontuacaoTotal += 50;
  }

  if (dados.maeTrabalhadora) {
    detalhamento["Mãe/Responsável no Mercado de Trabalho"] = 40;
    pontuacaoTotal += 40;
  }

  if (dados.temIrmaoNaUnidade) {
    detalhamento["Irmão Frequentador"] = 40;
    pontuacaoTotal += 40;
  }

  if (dados.distanciaKm !== undefined) {
    if (dados.distanciaKm <= 1.0) {
      detalhamento["Proximidade (<1km)"] = 30;
      pontuacaoTotal += 30;
    } else if (dados.distanciaKm <= 3.0) {
      detalhamento["Proximidade (1-3km)"] = 15;
      pontuacaoTotal += 15;
    }
  }

  return {
    pontuacaoTotal,
    detalhamento,
    processoAno,
    reguaAplicada: "Régua Socioeconômica Vigente 2025",
  };
}
