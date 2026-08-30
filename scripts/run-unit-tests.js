const assert = require('assert');
const { calcularScoreEvasao } = require('../src/lib/ai/evasao-model');
const { calcularProjecaoDemandaAdensamento } = require('../src/lib/ai/demanda-adensamento-model');
const { analisarGapsEmpregabilidadeTecnica } = require('../src/lib/ai/empregabilidade-tecnico-model');
const { calcularIDSBairro } = require('../src/lib/ai/ids-vulnerabilidade-model');

console.log('🧪 Iniciando Execução dos Testes Unitários de Algoritmos Intersetoriais...');

try {
  // Teste 1: Evasão com Alerta VEL (Vulnerabilidade Econômica Local)
  const evasaoResult = calcularScoreEvasao({
    id: 'esc-1',
    nome: 'Escola Municipal Pavuna',
    tipo: 'Fundamental_II',
    cre_id: 6,
    bairro: 'Pavuna',
    idh_bairro: 0.72,
    taxa_evasao: 5.0,
    taxa_reprovacao: 8.0,
    taxa_aprovacao: 85.0,
    distorcao_idade_serie: 12.0,
    total_matriculas: 600,
    total_evadidos: 30,
    variacao_emprego_12m: -5.4,
  });

  assert.strictEqual(evasaoResult.alerta_vulnerabilidade_economica, true, 'Deveria ativar alerta VEL');
  console.log('✅ Teste 1: Alerta VEL de Evasão por Queda Econômica — PASSOU!');

  // Teste 2: Projeção de Adensamento Imobiliário
  const adensamentoResult = calcularProjecaoDemandaAdensamento(
    { codigo_bairro: 103, nome: 'Campo Grande' },
    {
      id: '103',
      codigo_bairro: 103,
      nome_bairro: 'Campo Grande',
      regiao_administrativa: 'RA XVIII',
      taxa_emprego_formal: 52.0,
      variacao_emprego_12m: 3.0,
      empresas_ativas_total: 12000,
      mei_mulheres_total: 4000,
      trabalhadoras_formais_pct: 58.0,
      setor_predominante: 'Comercio',
      novos_licenciamentos_imobiliarios: 35,
      unidades_habitacionais_projetadas: 4800,
      investimento_publico_privado_milhoes: 600,
    },
    3000
  );

  assert.strictEqual(adensamentoResult.risco_superlotacao, 'critico', 'Superlotação deveria ser crítica');
  assert.ok(adensamentoResult.novos_alunos_estimados > 1000, 'Deveria estimar > 1000 novos alunos');
  console.log('✅ Teste 2: Projeção de Adensamento Habitação (24-36m) — PASSOU!');

  // Teste 3: Empregabilidade & Naves do Conhecimento
  const recs = analisarGapsEmpregabilidadeTecnica(
    { codigo_bairro: 1, nome: 'Santo Cristo' },
    [{ id: '1', codigo_bairro: 1, setor_economico: 'Tecnologia da Informação', vagas_abertas_mes: 150, candidatos_inscritos: 300, demanda_qualificacao_tecnica: 'Desenvolvimento Web', mes_referencia: 8, ano_referencia: 2026 }]
  );

  assert.strictEqual(recs[0].parceiro_recomendado, 'Nave do Conhecimento', 'Parceiro para TI no Porto deve ser Nave do Conhecimento');
  console.log('✅ Teste 3: Alinhamento de Cursos Técnicos & Naves do Conhecimento — PASSOU!');

  // Teste 4: IDS Territorial IPP
  const idsResult = calcularIDSBairro(110, 0.44, 0.39, 0.41);
  assert.strictEqual(idsResult.faixa_vulnerabilidade, 'Extrema', 'Score baixo deve resultar em vulnerabilidade Extrema');
  console.log('✅ Teste 4: Cálculo do IDS Intersetorial IPP/SME/SMDEIS — PASSOU!');

  console.log('🎉 TODOS OS TESTES UNITÁRIOS PASSARAM COM SUCESSO!');
} catch (e) {
  console.error('❌ Falha nos testes unitários:', e);
  process.exit(1);
}
