export interface AreaPlanejamento {
  codigo_ap: string; // 'AP1', 'AP2', 'AP3', 'AP4', 'AP5'
  nome: string;
  descricao?: string;
}

export interface RegiaoAdministrativa {
  codigo_ra: number;
  nome: string;
  codigo_ap: string;
}

export interface IndicadoresEconomicosBairro {
  id: string;
  codigo_bairro: number;
  nome_bairro: string;
  regiao_administrativa: string;
  taxa_emprego_formal: number;
  variacao_emprego_12m: number;
  empresas_ativas_total: number;
  mei_mulheres_total: number;
  trabalhadoras_formais_pct: number;
  setor_predominante: 'Tecnologia' | 'Logistica' | 'Servicos' | 'Comercio' | 'Industria';
  novos_licenciamentos_imobiliarios: number;
  unidades_habitacionais_projetadas: number;
  investimento_publico_privado_milhoes: number;
  updated_at?: string;
}

export interface HubEconomico {
  id: string;
  nome: string;
  tipo_hub: 'Tecnologia' | 'Logistica' | 'Industrial' | 'Economia Criativa';
  codigo_bairro: number;
  descricao: string;
  lat: number;
  lng: number;
  raio_influencia_km: number;
}

export interface ObservatorioEmpregoItem {
  id: string;
  codigo_bairro: number;
  setor_economico: string;
  vagas_abertas_mes: number;
  candidatos_inscritos: number;
  demanda_qualificacao_tecnica: string;
  mes_referencia: number;
  ano_referencia: number;
}

export interface IndiceDesenvolvimentoSocialBairro {
  id: string;
  codigo_bairro: number;
  ids_score: number;
  subindice_educacao: number;
  subindice_renda_trabalho: number;
  subindice_infraestrutura: number;
  faixa_vulnerabilidade: 'Baixa' | 'Media' | 'Alta' | 'Extrema';
}

export interface VazioCuidadoInfantilItem {
  bairro_nome: string;
  codigo_bairro: number;
  populacao_0_5: number;
  trabalhadoras_formais_pct: number;
  mei_mulheres_total: number;
  vagas_creches: number;
  deficit_creches: number;
  score_prioridade: number;
}

export interface DemandaAdensamentoProjecao {
  codigo_bairro: number;
  nome_bairro: string;
  licenciamentos_atuais: number;
  unidades_habitacionais: number;
  novos_alunos_estimados: number;
  deficit_capacidade_projetado: number;
  risco_superlotacao: 'baixo' | 'moderado' | 'alto' | 'critico';
  recomendacao_expansao: string;
}

export interface RecomendacaoCursoTecnico {
  codigo_bairro: number;
  nome_bairro: string;
  setor_demanda: string;
  vagas_abertas: number;
  curso_sugerido: string;
  parceiro_recomendado: 'GET (Ginásio Educacional Tecnológico)' | 'Nave do Conhecimento' | 'SME Qualificação' | 'SENAI/FIRJAN';
  nivel_prioridade: 'alta' | 'media' | 'urgente';
}

export interface PlanoAulaContextualizado {
  escola_nome: string;
  bairro_nome: string;
  setor_predominante: string;
  componente_curricular: string;
  ano_escolar: string;
  tema_aula: string;
  objetivos_aprendizagem: string[];
  projeto_pratico_local: string;
  conexao_hubs_locais: string;
}
