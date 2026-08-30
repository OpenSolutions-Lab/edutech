import { IndiceDesenvolvimentoSocialBairro } from '@/types/smdeis-intersetorial';

/**
 * Modelo de Cálculo do IDS (Índice de Desenvolvimento Social IPP/SME/SMDEIS)
 * IDS = (0.40 * Subíndice_Educação) + (0.35 * Subíndice_Renda_Trabalho) + (0.25 * Subíndice_Infraestrutura)
 */
export function calcularIDSBairro(
  codigoBairro: number,
  subEducacao: number,      // 0 a 1 (baseado em IDEB, frequência e analfabetismo)
  subRendaTrabalho: number,  // 0 a 1 (baseado em taxa de emprego formal e MEIs)
  subInfraestrutura: number  // 0 a 1 (baseado em saneamento e escolas ativas)
): IndiceDesenvolvimentoSocialBairro {
  const idsScore = Math.min(1, Math.max(0, (0.40 * subEducacao) + (0.35 * subRendaTrabalho) + (0.25 * subInfraestrutura)));

  let faixa: 'Baixa' | 'Media' | 'Alta' | 'Extrema' = 'Baixa';
  if (idsScore < 0.40) {
    faixa = 'Extrema';
  } else if (idsScore < 0.60) {
    faixa = 'Alta';
  } else if (idsScore < 0.78) {
    faixa = 'Media';
  }

  return {
    id: `ids-${codigoBairro}`,
    codigo_bairro: codigoBairro,
    ids_score: Number(idsScore.toFixed(4)),
    subindice_educacao: Number(subEducacao.toFixed(4)),
    subindice_renda_trabalho: Number(subRendaTrabalho.toFixed(4)),
    subindice_infraestrutura: Number(subInfraestrutura.toFixed(4)),
    faixa_vulnerabilidade: faixa,
  };
}
