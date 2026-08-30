import { describe, it, expect } from 'vitest';
import { calcularScoreEvasao, DadosEscolaEvasao } from '@/lib/ai/evasao-model';
import { calcularProjecaoDemandaAdensamento } from '@/lib/ai/demanda-adensamento-model';
import { analisarGapsEmpregabilidadeTecnica } from '@/lib/ai/empregabilidade-tecnico-model';
import { calcularIDSBairro } from '@/lib/ai/ids-vulnerabilidade-model';

describe('Inteligência Intersetorial SME + SMDEIS', () => {
  it('deve disparar alerta VEL e elevar o score de risco quando houver queda acentuada no emprego formal', () => {
    const dadosComQueda: DadosEscolaEvasao = {
      id: 'escola-1',
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
      variacao_emprego_12m: -5.4, // Queda acentuada na renda/emprego
    };

    const resultado = calcularScoreEvasao(dadosComQueda);
    expect(resultado.alerta_vulnerabilidade_economica).toBe(true);
    expect(resultado.recomendacoes.some(r => r.includes('ALERTA SMDEIS'))).toBe(true);
  });

  it('deve projetar adensamento e déficit de vagas com base em licenças imobiliárias', () => {
    const projecao = calcularProjecaoDemandaAdensamento(
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

    expect(projecao.novos_alunos_estimados).toBeGreaterThan(1000);
    expect(projecao.risco_superlotacao).toBe('critico');
  });

  it('deve recomendar cursos técnicos e Naves do Conhecimento com base no mercado de trabalho local', () => {
    const recs = analisarGapsEmpregabilidadeTecnica(
      { codigo_bairro: 1, nome: 'Santo Cristo' },
      [
        {
          id: '1',
          codigo_bairro: 1,
          setor_economico: 'Tecnologia da Informação',
          vagas_abertas_mes: 150,
          candidatos_inscritos: 300,
          demanda_qualificacao_tecnica: 'Desenvolvimento Web',
          mes_referencia: 8,
          ano_referencia: 2026,
        },
      ]
    );

    expect(recs.length).toBeGreaterThan(0);
    expect(recs[0].parceiro_recomendado).toBe('Nave do Conhecimento');
    expect(recs[0].nivel_prioridade).toBe('urgente');
  });

  it('deve calcular corretamente o IDS Territorial IPP/SME/SMDEIS', () => {
    const ids = calcularIDSBairro(110, 0.44, 0.39, 0.41);
    expect(ids.ids_score).toBeLessThan(0.60);
    expect(ids.faixa_vulnerabilidade).toBe('Extrema');
  });
});
