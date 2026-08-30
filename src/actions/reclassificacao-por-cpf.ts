"use server";

export interface FilaItemConsolidado {
  posicaoUnicaCPF: number;
  posicaoAntigaOpcao: number;
  idCrianca: string;
  bairroResidencia: string;
  pontuacaoTotal: number;
  opcaoPreferencial: string;
  distanciaKm: number;
  statusConvocacao: "Pendente" | "Notificado" | "Em Prazo (3 dias)" | "Expirado" | "Confirmado";
  diasEsperando: number;
}

export async function getFilaReclassificadaCPF(unidadeId?: string): Promise<{
  unidadeId: string;
  designacaoUnidade: string;
  capacidadeOciosa: number;
  filaAnteriorTotal: number;
  filaNovaConsolidadaTotal: number;
  vagasDesbloqueadas: number;
  itens: FilaItemConsolidado[];
}> {
  return {
    unidadeId: unidadeId || "0716609",
    designacaoUnidade: "CM RIO NOVO - RIO DAS FLORES (ANIL)",
    capacidadeOciosa: 12,
    filaAnteriorTotal: 765,
    filaNovaConsolidadaTotal: 520, // queda de ~32% ao eliminar opções duplicadas
    vagasDesbloqueadas: 245,
    itens: [
      {
        posicaoUnicaCPF: 1,
        posicaoAntigaOpcao: 1,
        idCrianca: "aluno_0094821",
        bairroResidencia: "ANIL",
        pontuacaoTotal: 290,
        opcaoPreferencial: "CM RIO NOVO - RIO DAS FLORES",
        distanciaKm: 0.4,
        statusConvocacao: "Em Prazo (3 dias)",
        diasEsperando: 1,
      },
      {
        posicaoUnicaCPF: 2,
        posicaoAntigaOpcao: 3,
        idCrianca: "aluno_0083912",
        bairroResidencia: "ANIL",
        pontuacaoTotal: 280,
        opcaoPreferencial: "CM RIO NOVO - RIO DAS FLORES",
        distanciaKm: 0.8,
        statusConvocacao: "Notificado",
        diasEsperando: 2,
      },
      {
        posicaoUnicaCPF: 3,
        posicaoAntigaOpcao: 7,
        idCrianca: "aluno_0071249",
        bairroResidencia: "JACAREPAGUÁ",
        pontuacaoTotal: 260,
        opcaoPreferencial: "EDI ESCRITORA CLARICE LISPECTOR",
        distanciaKm: 1.2,
        statusConvocacao: "Pendente",
        diasEsperando: 4,
      },
      {
        posicaoUnicaCPF: 4,
        posicaoAntigaOpcao: 8,
        idCrianca: "aluno_0066190",
        bairroResidencia: "ANIL",
        pontuacaoTotal: 250,
        opcaoPreferencial: "CM RIO NOVO - RIO DAS FLORES",
        distanciaKm: 0.6,
        statusConvocacao: "Expirado",
        diasEsperando: 6,
      },
      {
        posicaoUnicaCPF: 5,
        posicaoAntigaOpcao: 12,
        idCrianca: "aluno_0055123",
        bairroResidencia: "TAQUARA",
        pontuacaoTotal: 240,
        opcaoPreferencial: "EDI TAQUARA INFANTIL",
        distanciaKm: 2.1,
        statusConvocacao: "Pendente",
        diasEsperando: 5,
      },
    ],
  };
}
