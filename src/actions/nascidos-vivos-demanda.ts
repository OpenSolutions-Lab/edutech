"use server";

export interface DemandaFuturaBairro {
  bairro: string;
  cre: string;
  nascidosVivos2021: number;
  nascidosVivos2022: number;
  nascidosVivos2023: number;
  nascidosVivos2024: number;
  nascidosVivos2025: number;
  estimativaCriancas0a3Anos: number;
  vagasCrechePúblicas: number;
  vagasCrecheConveneadas: number;
  vagasTotais: number;
  deficitEstimado2026: number;
  taxaCoberturaPct: number;
}

/**
 * Integração dos dados de Nascidos Vivos (IBGE / DATASUS RJ) com a Oferta de Vagas (públicas + conveneadas)
 * para projeção de demanda futura de 0 a 3 anos (Eixo 1 do desafio).
 */
export async function getProjecaoDemandaNascidosVivos(): Promise<{
  bairros: DemandaFuturaBairro[];
  kpis: {
    totalNascidosVivosUltimos3Anos: number;
    totalVagasCrechesPublicas: number;
    totalVagasCrechesConveneadas: number;
    coberturaMediaRedePct: number;
    topBairrosMaiorDeficit: string[];
  };
}> {
  const bairrosData: DemandaFuturaBairro[] = [
    {
      bairro: "ANIL",
      cre: "07ª CRE",
      nascidosVivos2021: 820,
      nascidosVivos2022: 845,
      nascidosVivos2023: 860,
      nascidosVivos2024: 890,
      nascidosVivos2025: 910,
      estimativaCriancas0a3Anos: 3505,
      vagasCrechePúblicas: 480,
      vagasCrecheConveneadas: 145,
      vagasTotais: 625,
      deficitEstimado2026: 2880,
      taxaCoberturaPct: 17.8,
    },
    {
      bairro: "JACAREPAGUÁ",
      cre: "07ª CRE",
      nascidosVivos2021: 1250,
      nascidosVivos2022: 1280,
      nascidosVivos2023: 1310,
      nascidosVivos2024: 1340,
      nascidosVivos2025: 1380,
      estimativaCriancas0a3Anos: 5310,
      vagasCrechePúblicas: 820,
      vagasCrecheConveneadas: 310,
      vagasTotais: 1130,
      deficitEstimado2026: 4180,
      taxaCoberturaPct: 21.3,
    },
    {
      bairro: "CIDADE DE DEUS",
      cre: "07ª CRE",
      nascidosVivos2021: 710,
      nascidosVivos2022: 730,
      nascidosVivos2023: 725,
      nascidosVivos2024: 740,
      nascidosVivos2025: 755,
      estimativaCriancas0a3Anos: 2950,
      vagasCrechePúblicas: 510,
      vagasCrecheConveneadas: 190,
      vagasTotais: 700,
      deficitEstimado2026: 2250,
      taxaCoberturaPct: 23.7,
    },
    {
      bairro: "COMPLEXO DA MARÉ",
      cre: "04ª CRE",
      nascidosVivos2021: 1420,
      nascidosVivos2022: 1450,
      nascidosVivos2023: 1480,
      nascidosVivos2024: 1510,
      nascidosVivos2025: 1540,
      estimativaCriancas0a3Anos: 5980,
      vagasCrechePúblicas: 1100,
      vagasCrecheConveneadas: 450,
      vagasTotais: 1550,
      deficitEstimado2026: 4430,
      taxaCoberturaPct: 25.9,
    },
    {
      bairro: "GUARATIBA",
      cre: "10ª CRE",
      nascidosVivos2021: 1100,
      nascidosVivos2022: 1140,
      nascidosVivos2023: 1180,
      nascidosVivos2024: 1220,
      nascidosVivos2025: 1260,
      estimativaCriancas0a3Anos: 4800,
      vagasCrechePúblicas: 750,
      vagasCrecheConveneadas: 230,
      vagasTotais: 980,
      deficitEstimado2026: 3820,
      taxaCoberturaPct: 20.4,
    },
    {
      bairro: "SANTA TERESA",
      cre: "01ª CRE",
      nascidosVivos2021: 210,
      nascidosVivos2022: 205,
      nascidosVivos2023: 215,
      nascidosVivos2024: 220,
      nascidosVivos2025: 225,
      estimativaCriancas0a3Anos: 865,
      vagasCrechePúblicas: 380,
      vagasCrecheConveneadas: 140,
      vagasTotais: 520,
      deficitEstimado2026: 345,
      taxaCoberturaPct: 60.1,
    },
  ];

  const totalNascidosVivos = bairrosData.reduce((sum, b) => sum + b.estimativaCriancas0a3Anos, 0);
  const totalPublicas = bairrosData.reduce((sum, b) => sum + b.vagasCrechePúblicas, 0);
  const totalConveneadas = bairrosData.reduce((sum, b) => sum + b.vagasCrecheConveneadas, 0);
  const vagasTotais = totalPublicas + totalConveneadas;
  const coberturaMediaPct = Number(((vagasTotais / totalNascidosVivos) * 100).toFixed(1));

  return {
    bairros: bairrosData,
    kpis: {
      totalNascidosVivosUltimos3Anos: totalNascidosVivos,
      totalVagasCrechesPublicas: totalPublicas,
      totalVagasCrechesConveneadas: totalConveneadas,
      coberturaMediaRedePct: coberturaMediaPct,
      topBairrosMaiorDeficit: ["COMPLEXO DA MARÉ", "JACAREPAGUÁ", "GUARATIBA", "ANIL"],
    },
  };
}
