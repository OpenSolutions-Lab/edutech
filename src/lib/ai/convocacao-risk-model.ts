/**
 * Classificador Preditivo de Risco de No-Show / Desistência na Convocação
 * Prevê a probabilidade de uma família convocada não responder ou perder o prazo oficial de 3 dias úteis.
 */

export interface CandidatoConvocado {
  idCrianca: string;
  nomeIniciais: string;
  bairroResidencia: string;
  unidadeConvocadaNome: string;
  distanciaKm: number;
  diasDecorridosConvocacao: number; // 0, 1, 2 ou 3 dias
  canalContatoCadastrado: 'WhatsApp + Celular' | 'Apenas Celular' | 'Apenas E-mail' | 'Contato Desatualizado';
  pontuacaoVulnerabilidade: number;
  idadeAnosResponsavel: number;
  tentativasContatoEfetuadas: number;
}

export interface PredicaoNoShowConvocacao {
  idCrianca: string;
  probabilidadeNoShow: number; // 0.00 a 1.00
  nivelRisco: 'Crítico (>75%)' | 'Alto (50-75%)' | 'Moderado (25-50%)' | 'Baixo (<25%)';
  fatoresRiscoPrincipais: string[];
  acaoRecomendada: 'Busca Ativa Presencial URGENTE' | 'Disparo Agente WhatsApp' | 'Reenvio SMS & Chamada' | 'Acompanhamento Padrão';
}

/**
 * Calcula a probabilidade de No-Show utilizando um modelo de regressão logística calibrado:
 * Logit(p) = β0 + β1*(Distancia) + β2*(FatorCanal) + β3*(DiasSemResposta) + β4*(Vulnerabilidade)
 */
export function predizerRiscoNoShow(candidato: CandidatoConvocado): PredicaoNoShowConvocacao {
  let logit = -1.8; // Bias base

  // Fator Distância (Distância > 2km aumenta substancialmente o risco de desistência)
  if (candidato.distanciaKm > 3.0) logit += 1.4;
  else if (candidato.distanciaKm > 1.5) logit += 0.7;

  // Fator Canal de Contato
  if (candidato.canalContatoCadastrado === 'Contato Desatualizado') logit += 2.2;
  else if (candidato.canalContatoCadastrado === 'Apenas E-mail') logit += 1.1;
  else if (candidato.canalContatoCadastrado === 'Apenas Celular') logit += 0.5;

  // Fator Tempo Decorrido sem Resposta
  if (candidato.diasDecorridosConvocacao >= 2) logit += 1.6;
  else if (candidato.diasDecorridosConvocacao === 1) logit += 0.6;

  // Fator Vulnerabilidade Extrema (dificuldade de locomoção / ausência de sinal)
  if (candidato.pontuacaoVulnerabilidade >= 250) logit += 0.5;

  // Aplicação da Função Sigmóide: p = 1 / (1 + e^-logit)
  const probabilidadeNoShow = Number((1 / (1 + Math.exp(-logit))).toFixed(2));

  const fatoresRiscoPrincipais: string[] = [];
  if (candidato.canalContatoCadastrado === 'Contato Desatualizado') {
    fatoresRiscoPrincipais.push('Número de telefone ou contato não localizado');
  }
  if (candidato.distanciaKm > 2.0) {
    fatoresRiscoPrincipais.push(`Unidade distante da residência (${candidato.distanciaKm} km)`);
  }
  if (candidato.diasDecorridosConvocacao >= 2) {
    fatoresRiscoPrincipais.push(`2º dia de prazo sem nenhuma interação do responsável`);
  }
  if (candidato.canalContatoCadastrado === 'Apenas E-mail') {
    fatoresRiscoPrincipais.push('Contato apenas por e-mail (baixa taxa de leitura)');
  }

  if (fatoresRiscoPrincipais.length === 0) {
    fatoresRiscoPrincipais.push('Cadastro regular com canal WhatsApp ativo');
  }

  let nivelRisco: PredicaoNoShowConvocacao['nivelRisco'] = 'Baixo (<25%)';
  let acaoRecomendada: PredicaoNoShowConvocacao['acaoRecomendada'] = 'Acompanhamento Padrão';

  if (probabilidadeNoShow >= 0.75) {
    nivelRisco = 'Crítico (>75%)';
    acaoRecomendada = 'Busca Ativa Presencial URGENTE';
  } else if (probabilidadeNoShow >= 0.50) {
    nivelRisco = 'Alto (50-75%)';
    acaoRecomendada = 'Disparo Agente WhatsApp';
  } else if (probabilidadeNoShow >= 0.25) {
    nivelRisco = 'Moderado (25-50%)';
    acaoRecomendada = 'Reenvio SMS & Chamada';
  }

  return {
    idCrianca: candidato.idCrianca,
    probabilidadeNoShow,
    nivelRisco,
    fatoresRiscoPrincipais,
    acaoRecomendada,
  };
}
