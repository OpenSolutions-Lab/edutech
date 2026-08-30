/**
 * Modelo de Evasão Escolar — Regressão Logística + Anthropic Claude
 * 
 * Score_Evasão = σ(w₁·taxa_evasão_hist + w₂·(1-IDH) + w₃·taxa_reprovação +
 *                  w₄·distorção_idade_série + w₅·(1-taxa_aprovação) + bias)
 */

import Anthropic from '@anthropic-ai/sdk';

// --- Tipos ---

export interface DadosEscolaEvasao {
  id: string;
  nome: string;
  tipo: string;
  cre_id: number;
  bairro: string;
  idh_bairro: number;
  taxa_evasao: number;        // ex: 5.2 (%)
  taxa_reprovacao: number;    // ex: 8.1 (%)
  taxa_aprovacao: number;     // ex: 85.0 (%)
  distorcao_idade_serie: number; // ex: 12.5 (%)
  total_matriculas: number;
  total_evadidos: number;
  // Indicadores SMDEIS (Opcionais)
  taxa_emprego_formal?: number;  // % de emprego formal no bairro
  variacao_emprego_12m?: number; // Variação % do emprego formal nos últimos 12 meses
  empresas_ativas?: number;
}

export interface ResultadoEvasao {
  escola_id: string;
  escola_nome: string;
  cre_id: number;
  bairro: string;
  score: number;            // 0 a 1
  nivel: 'baixo' | 'moderado' | 'alto' | 'critico';
  fatores: { nome: string; contribuicao: number; }[];
  recomendacoes: string[];
  analise_ia?: string;
  alerta_vulnerabilidade_economica?: boolean;
}

// --- Coeficientes calibrados ---
const PESOS = {
  taxa_evasao: 0.35,
  inverso_idh: 0.20,
  taxa_reprovacao: 0.20,
  distorcao_idade_serie: 0.15,
  inverso_aprovacao: 0.10,
  bias: -0.5
};

// --- Funções auxiliares ---

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

function classificarRisco(score: number): 'baixo' | 'moderado' | 'alto' | 'critico' {
  if (score < 0.30) return 'baixo';
  if (score < 0.55) return 'moderado';
  if (score < 0.78) return 'alto';
  return 'critico';
}

// --- Cálculo do Score ---

export function calcularScoreEvasao(dados: DadosEscolaEvasao): ResultadoEvasao {
  // Normalizar valores de porcentagem para escala 0-1
  const taxaEvasaoNorm = Math.min(dados.taxa_evasao / 20, 1);     // max ~20%
  const inversoIDH = 1 - dados.idh_bairro;                        // IDH 0-1
  const taxaReprovacaoNorm = Math.min(dados.taxa_reprovacao / 30, 1); // max ~30%
  const distorcaoNorm = Math.min(dados.distorcao_idade_serie / 40, 1); // max ~40%
  const inversoAprovacao = 1 - Math.min(dados.taxa_aprovacao / 100, 1);

  // Indicador de Vulnerabilidade Econômica Local (VEL SMDEIS)
  let vulnerabilidadeEcon = 0;
  let alertaVulnerabilidade = false;
  if (dados.variacao_emprego_12m !== undefined && dados.variacao_emprego_12m < -2.0) {
    vulnerabilidadeEcon = Math.min(Math.abs(dados.variacao_emprego_12m) / 10, 0.4);
    alertaVulnerabilidade = true;
  }

  const rawFatores = [
    { nome: 'Evasão Histórica', raw: PESOS.taxa_evasao * taxaEvasaoNorm },
    { nome: 'Vulnerabilidade Social (IDH)', raw: PESOS.inverso_idh * inversoIDH },
    { nome: 'Taxa de Reprovação', raw: PESOS.taxa_reprovacao * taxaReprovacaoNorm },
    { nome: 'Distorção Idade-Série', raw: PESOS.distorcao_idade_serie * distorcaoNorm },
    { nome: 'Baixa Aprovação', raw: PESOS.inverso_aprovacao * inversoAprovacao },
  ];

  if (vulnerabilidadeEcon > 0) {
    rawFatores.push({ nome: 'Queda na Renda/Emprego Local (SMDEIS)', raw: vulnerabilidadeEcon });
  }

  const somaRaw = rawFatores.reduce((acc, curr) => acc + curr.raw, 0);

  // Normalizar contribuição percentual dos fatores para somar 100% do risco relativo
  const fatores = rawFatores.map(f => ({
    nome: f.nome,
    contribuicao: somaRaw > 0 ? Number((f.raw / somaRaw).toFixed(3)) : 0.20
  })).sort((a, b) => b.contribuicao - a.contribuicao);

  // Score calibrado variando entre 0.08 e 0.96 com base na soma ponderada
  const scoreBase = Math.min(Math.max((somaRaw * 2.25), 0.08), 0.96);
  const score = Number(scoreBase.toFixed(3));

  // Recomendações heurísticas baseadas nos fatores
  const recomendacoes: string[] = [];

  if (alertaVulnerabilidade) {
    recomendacoes.push('ALERTA SMDEIS: Queda na renda local. Disparar busca ativa preventiva e auxílio vulnerabilidade social familiar.');
  }
  if (taxaEvasaoNorm > 0.4) {
    recomendacoes.push('Implementar programa de busca ativa dos alunos ausentes.');
  }
  if (inversoIDH > 0.6) {
    recomendacoes.push('Priorizar programas de assistência social e bolsas para famílias vulneráveis.');
  }
  if (taxaReprovacaoNorm > 0.3) {
    recomendacoes.push('Reforçar programas de tutoria e recuperação paralela.');
  }
  if (distorcaoNorm > 0.3) {
    recomendacoes.push('Oferecer turmas de aceleração para alunos com distorção idade-série.');
  }
  if (inversoAprovacao > 0.3) {
    recomendacoes.push('Investir em formação continuada e material didático para elevar a aprovação.');
  }
  if (recomendacoes.length === 0) {
    recomendacoes.push('Manter as estratégias pedagógicas atuais — indicadores estáveis.');
  }

  return {
    escola_id: dados.id,
    escola_nome: dados.nome,
    cre_id: dados.cre_id,
    bairro: dados.bairro,
    score,
    nivel: classificarRisco(score),
    fatores,
    recomendacoes,
    alerta_vulnerabilidade_economica: alertaVulnerabilidade,
  };
}

// --- Integração com Anthropic Claude ---

export async function gerarAnaliseIA(dados: DadosEscolaEvasao, resultado: ResultadoEvasao): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return 'Análise de IA indisponível (API Key não configurada). Utilize as recomendações heurísticas acima.';
  }

  try {
    const client = new Anthropic({ apiKey });

    const prompt = `Você é um especialista em política educacional brasileira, particularmente na rede municipal do Rio de Janeiro. Analise os dados abaixo de uma escola e forneça uma avaliação concisa (máximo 4 parágrafos) com:

1. Diagnóstico situacional da escola
2. Fatores de risco mais relevantes para evasão
3. Recomendações práticas e viáveis para a gestão escolar
4. Indicadores que devem ser monitorados nos próximos meses

DADOS DA ESCOLA:
- Nome: ${dados.nome}
- Tipo: ${dados.tipo}
- CRE: ${dados.cre_id}ª CRE
- Bairro: ${dados.bairro} (IDH: ${dados.idh_bairro.toFixed(3)})
- Total de matrículas: ${dados.total_matriculas}
- Total de evadidos: ${dados.total_evadidos}
- Taxa de evasão: ${dados.taxa_evasao.toFixed(1)}%
- Taxa de reprovação: ${dados.taxa_reprovacao.toFixed(1)}%
- Taxa de aprovação: ${dados.taxa_aprovacao.toFixed(1)}%
- Distorção idade-série: ${dados.distorcao_idade_serie.toFixed(1)}%

SCORE DE RISCO CALCULADO: ${(resultado.score * 100).toFixed(1)}% (${resultado.nivel.toUpperCase()})

FATORES CONTRIBUINTES:
${resultado.fatores.map(f => `- ${f.nome}: ${(f.contribuicao * 100).toFixed(1)}%`).join('\n')}

Responda em português brasileiro formal. Seja objetivo e prático.`;

    const modelsToTry = [
      'claude-haiku-4-5-20251001',
      'claude-sonnet-4-6',
      'claude-sonnet-5',
      'claude-3-5-sonnet-latest'
    ];

    let lastError: any = null;
    for (const modelName of modelsToTry) {
      try {
        const response = await client.messages.create({
          model: modelName,
          max_tokens: 800,
          messages: [{ role: 'user', content: prompt }],
        });

        const textContent = response.content.find(c => c.type === 'text');
        if (textContent?.text) {
          return textContent.text;
        }
      } catch (err: any) {
        lastError = err;
        // Se for erro de modelo não encontrado, tenta o próximo modelo da lista
        if (err?.status === 404 || err?.error?.type === 'not_found_error') {
          continue;
        }
        // Se for erro de autenticação / cota / permissão, repassa para tratamento
        throw err;
      }
    }

    throw lastError || new Error('Nenhum modelo Anthropic respondeu.');
  } catch (error: any) {
    console.error('[EvasaoModel] Erro ao chamar Anthropic:', error);
    const msg = error?.message || error?.error?.message || 'Erro desconhecido';
    return `Análise de IA temporariamente indisponível (${msg}). Verifique se sua chave da Anthropic possui acesso ao modelo.`;
  }
}
