import { DemandaAdensamentoProjecao, IndicadoresEconomicosBairro } from '@/types/smdeis-intersetorial';

/**
 * Modelo de Demanda por Adensamento Urbano & Expansão Escolar (24-36 Meses)
 * Cruzamento entre Licenciamento Imobiliário SMDEIS e Capacidade da Rede SME.
 */
export function calcularProjecaoDemandaAdensamento(
  bairro: { codigo_bairro: number; nome: string },
  indicadores: IndicadoresEconomicosBairro,
  capacidadeAtualEscolas: number
): DemandaAdensamentoProjecao {
  const licencas = indicadores.novos_licenciamentos_imobiliarios || 0;
  const unidadesProjetadas = indicadores.unidades_habitacionais_projetadas || (licencas * 80);

  // Fator médio de crianças em idade escolar por unidade habitacional no Rio = 0.35
  const novosAlunosEstimados = Math.round(unidadesProjetadas * 0.35);

  // Déficit estimado considerando capacidade existente
  const deficitProjetado = Math.max(0, novosAlunosEstimados - Math.round(capacidadeAtualEscolas * 0.15));

  let riscoSuperlotacao: 'baixo' | 'moderado' | 'alto' | 'critico' = 'baixo';
  let recomendacao = 'Demanda habitacional estabilizada. Manter monitoramento regular.';

  if (unidadesProjetadas > 1500) {
    riscoSuperlotacao = 'critico';
    recomendacao = `ALERTA DE ADENSAMENTO CRÍTICO: Projeção de +${novosAlunosEstimados} alunos nos próximos 24-36 meses. Recomendada a construção imediata de novo EDI / Escola de Tempo Integral na coordenada.`;
  } else if (unidadesProjetadas > 800) {
    riscoSuperlotacao = 'alto';
    recomendacao = `EXPANSÃO NECESSÁRIA: Projeção de +${novosAlunosEstimados} alunos. Recomenda-se ampliação de salas ou modularização da infraestrutura escolar local.`;
  } else if (unidadesProjetadas > 300) {
    riscoSuperlotacao = 'moderado';
    recomendacao = `MONITORAMENTO DE MATRÍCULAS: Previsão de +${novosAlunosEstimados} alunos. Remanejamento de vagas com bairros vizinhos deve ser planejado.`;
  }

  return {
    codigo_bairro: bairro.codigo_bairro,
    nome_bairro: bairro.nome,
    licenciamentos_atuais: licencas,
    unidades_habitacionais: unidadesProjetadas,
    novos_alunos_estimados: novosAlunosEstimados,
    deficit_capacidade_projetado: deficitProjetado,
    risco_superlotacao: riscoSuperlotacao,
    recomendacao_expansao: recomendacao,
  };
}
