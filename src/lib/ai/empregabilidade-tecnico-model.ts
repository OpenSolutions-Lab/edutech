import { ObservatorioEmpregoItem, RecomendacaoCursoTecnico } from '@/types/smdeis-intersetorial';

/**
 * Modelo de Alinhamento de Empregabilidade vs Oferta de Ensino Técnico & Naves do Conhecimento
 */
export function analisarGapsEmpregabilidadeTecnica(
  bairro: { codigo_bairro: number; nome: string },
  microdadosEmprego: ObservatorioEmpregoItem[]
): RecomendacaoCursoTecnico[] {
  const recomendacoes: RecomendacaoCursoTecnico[] = [];

  for (const item of microdadosEmprego) {
    if (item.vagas_abertas_mes > 20) {
      let cursoSugerido = 'Curso Técnico em Tecnologia da Informação';
      let parceiro: RecomendacaoCursoTecnico['parceiro_recomendado'] = 'GET (Ginásio Educacional Tecnológico)';
      let prioridade: RecomendacaoCursoTecnico['nivel_prioridade'] = 'alta';

      if (item.setor_economico.toLowerCase().includes('tecnologia')) {
        cursoSugerido = 'Desenvolvimento Web Fullstack & IA Generativa';
        parceiro = 'Nave do Conhecimento';
        prioridade = 'urgente';
      } else if (item.setor_economico.toLowerCase().includes('logistica')) {
        cursoSugerido = 'Gestão de Operações Logísticas & Modais de Transporte';
        parceiro = 'GET (Ginásio Educacional Tecnológico)';
        prioridade = 'urgente';
      } else if (item.setor_economico.toLowerCase().includes('industria')) {
        cursoSugerido = 'Automação Industrial & Manutenção Eletromecânica';
        parceiro = 'SENAI/FIRJAN';
        prioridade = 'alta';
      } else if (item.setor_economico.toLowerCase().includes('comercio') || item.setor_economico.toLowerCase().includes('servicos')) {
        cursoSugerido = 'Marketing Digital, E-commerce & Vendas';
        parceiro = 'SME Qualificação';
        prioridade = 'media';
      }

      recomendacoes.push({
        codigo_bairro: bairro.codigo_bairro,
        nome_bairro: bairro.nome,
        setor_demanda: item.setor_economico,
        vagas_abertas: item.vagas_abertas_mes,
        curso_sugerido: cursoSugerido,
        parceiro_recomendado: parceiro,
        nivel_prioridade: prioridade,
      });
    }
  }

  if (recomendacoes.length === 0) {
    recomendacoes.push({
      codigo_bairro: bairro.codigo_bairro,
      nome_bairro: bairro.nome,
      setor_demanda: 'Serviços Gerais & Empreendedorismo',
      vagas_abertas: 15,
      curso_sugerido: 'Gestão de Pequenos Negócios & Educação Financeira',
      parceiro_recomendado: 'Nave do Conhecimento',
      nivel_prioridade: 'media',
    });
  }

  return recomendacoes.sort((a, b) => b.vagas_abertas - a.vagas_abertas);
}
