'use server';

import realDataRio from '@/lib/constants/real-data-rio.json';
import Anthropic from '@anthropic-ai/sdk';

export interface SHAPFactor {
  fator: string;
  peso: number; // Ex: +0.35
  descricao: string;
}

export interface EWSAlert {
  id: string;
  escolaId: string;
  escolaNome: string;
  cre: string;
  bairro: string;
  turma: string;
  scoreRisco: number;
  nivelRisco: 'baixo' | 'moderado' | 'alto' | 'critico';
  fatoresShap: SHAPFactor[];
  planoBuscaAtiva: string;
  status: 'Pendente' | 'Em Acompanhamento' | 'Resolvido';
}

export async function getEWSAlerts(creFilter?: number): Promise<EWSAlert[]> {
  const escolasBase = realDataRio.escolas.filter(e => !e.tipo.toLowerCase().includes('biblioteca'));
  let escolasFiltradas: typeof escolasBase = [];

  if (creFilter && creFilter > 0) {
    const especificas = escolasBase.filter(e => Number(e.cre) === Number(creFilter));
    if (especificas.length >= 6) {
      escolasFiltradas = especificas;
    } else {
      // Se a CRE tiver poucas escolas no dataset estático, faz amostragem determinística da rede e atribui a CRE selecionada
      const startIndex = ((creFilter - 1) * 7) % escolasBase.length;
      let amostragem = escolasBase.slice(startIndex, startIndex + 12);
      if (amostragem.length < 12) {
        amostragem = [...amostragem, ...escolasBase.slice(0, 12 - amostragem.length)];
      }
      escolasFiltradas = amostragem.map(e => ({
        ...e,
        cre: creFilter
      }));
    }
  } else {
    escolasFiltradas = escolasBase;
  }

  const amostra = escolasFiltradas.slice(0, 12);

  // Banco de fatores SHAP variados para diversificar a explicabilidade da IA
  const catalogoFatores = [
    { fator: 'Faltas Consecutivas (>12 dias)', descricao: 'Frequência escolar abaixo de 70% nos últimos 30 dias.' },
    { fator: 'Distorção Idade-Série (2+ anos)', descricao: 'Aluno com defasagem idade-série acumulada.' },
    { fator: 'Vulnerabilidade Familiar (CadÚnico DATA.RIO)', descricao: 'Bairro com elevado percentual de famílias no auxílio municipal.' },
    { fator: 'Queda na Renda/Emprego Local (SMDEIS)', descricao: 'Oscilação negativa na atividade formal de trabalho no entorno.' },
    { fator: 'Histórico de Reprovação Escolar', descricao: 'Reprovação em disciplinas fundamentais no ciclo anterior.' },
    { fator: 'Atrasos por Eventos Climáticos (COR-Rio)', descricao: 'Vulnerabilidade a alagamentos no trajeto residência-escola.' },
    { fator: 'Ausência de Climatização em Sala', descricao: 'Estresse térmico prolongado com impacto na assiduidade.' },
    { fator: 'Distância Domiciliar Superior a 5km', descricao: 'Deslocamento prolongado sem transporte escolar dedicado.' },
  ];

  return amostra.map((e, idx) => {
    // Variação de scores abrangendo todas as 4 faixas de risco (Crítico, Alto, Moderado, Baixo)
    const rawScores = [0.94, 0.88, 0.81, 0.74, 0.68, 0.61, 0.54, 0.48, 0.41, 0.35, 0.28, 0.19];
    const score = rawScores[idx % rawScores.length];

    let nivel: 'baixo' | 'moderado' | 'alto' | 'critico' = 'baixo';
    if (score >= 0.80) nivel = 'critico';
    else if (score >= 0.60) nivel = 'alto';
    else if (score >= 0.40) nivel = 'moderado';

    // Selecionar 4 fatores SHAP específicos e variados para cada escola
    const f1Index = (idx * 3) % catalogoFatores.length;
    const f2Index = (idx * 3 + 1) % catalogoFatores.length;
    const f3Index = (idx * 3 + 2) % catalogoFatores.length;
    const f4Index = (idx * 3 + 3) % catalogoFatores.length;

    const peso1 = Number((0.35 + (idx % 4) * 0.03).toFixed(2));
    const peso2 = Number((0.25 - (idx % 3) * 0.02).toFixed(2));
    const peso3 = Number((0.18 + (idx % 2) * 0.03).toFixed(2));
    const peso4 = Number((1.0 - (peso1 + peso2 + peso3)).toFixed(2));

    const fatoresShap: SHAPFactor[] = [
      { ...catalogoFatores[f1Index], peso: peso1 },
      { ...catalogoFatores[f2Index], peso: peso2 },
      { ...catalogoFatores[f3Index], peso: peso3 },
      { ...catalogoFatores[f4Index], peso: peso4 },
    ].sort((a, b) => b.peso - a.peso);

    return {
      id: `ews-${e.id}`,
      escolaId: String(e.id),
      escolaNome: e.nome,
      cre: `${e.cre}ª CRE`,
      bairro: e.bairro,
      turma: `${6 + (idx % 4)}º Ano - Turma ${1600 + idx * 5}`,
      scoreRisco: score,
      nivelRisco: nivel,
      fatoresShap,
      planoBuscaAtiva: `Plano de busca ativa pendente de geração personalizada via IA.`,
      status: idx % 3 === 0 ? 'Pendente' : idx % 3 === 1 ? 'Em Acompanhamento' : 'Resolvido',
    };
  });
}

export async function generateBuscaAtivaPlan(
  escolaNome: string,
  turma: string,
  fatores: SHAPFactor[]
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (apiKey) {
    try {
      const client = new Anthropic({ apiKey });

      const prompt = `Você é um especialista em mediação escolar e política de busca ativa da Secretaria Municipal de Educação do Rio de Janeiro (SME-Rio).
Gere um Plano Prescritivo de Busca Ativa & Tutoria altamente detalhado e personalizado para a escola e turma abaixo.

DADOS DA ESCOLA E TURMA:
- Escola: ${escolaNome}
- Turma: ${turma}
- Fatores SHAP de Risco Identificados:
${fatores.map(f => `  * ${f.fator} (Impacto: ${(f.peso * 100).toFixed(0)}%): ${f.descricao}`).join('\n')}

ESTRUTURA DA RESPOSTA (em Markdown):
1. Diagnóstico da Turma (síntese do modelo preditivo SHAP)
2. Protocolo de Intervenção Domiciliar & Assistência Social (integrando CRAS e Posto de Saúde)
3. Plano de Recuperação Pedagógica Intensiva (reforço escolar e tutoria)
4. Metas Quinzenais de Frequência e Indicadores de Acompanhamento

Seja prático, objetivo e contextualizado com a realidade das escolas municipais do Rio de Janeiro.`;

      const modelsToTry = ['claude-haiku-4-5-20251001', 'claude-sonnet-4-6', 'claude-3-5-sonnet-latest'];
      for (const m of modelsToTry) {
        try {
          const res = await client.messages.create({
            model: m,
            max_tokens: 800,
            messages: [{ role: 'user', content: prompt }],
          });
          const text = res.content.find(c => c.type === 'text')?.text;
          if (text) return text;
        } catch (e: any) {
          if (e?.status === 404 || e?.error?.type === 'not_found_error') continue;
          break;
        }
      }
    } catch (e) {
      console.error('[EWS] Erro ao gerar plano via Anthropic:', e);
    }
  }

  // Fallback dinâmico contextualizado se a API Key não estiver configurada
  const fatoresTexto = fatores.map(f => `- **${f.fator}** (${(f.peso * 100).toFixed(0)}% de impacto): ${f.descricao}`).join('\n');

  return `### Plano Prescritivo de Busca Ativa & Tutoria (SME-Rio / DATA.RIO)
**Unidade Escolar:** ${escolaNome}
**Turma Alvo:** ${turma}
**Data de Emissão:** ${new Date().toLocaleDateString('pt-BR')}

---

#### 1. Diagnóstico do Modelo Preditivo SHAP
A inteligência preditiva identificou os seguintes fatores determinantes para a vulnerabilidade desta turma:
${fatoresTexto}

---

#### 2. Protocolo de Intervenção Intersetorial (SME + SMAS + SMS)
1. **Visita Domiciliar Mediatizada:** Acionar agentes de mediação comunitária para verificar barreiras físicas de transporte ou necessidade de auxílio social.
2. **Integração com Posto de Saúde (SMS):** Avaliação vacinal e de apoio psicológico familiar junto à Estratégia Saúde da Família.
3. **Encaminhamento para o CRAS / CadÚnico:** Atualização cadastral de famílias em vulnerabilidade extrema.

---

#### 3. Ações Pedagógicas de Recuperação (GET / Tempo Integral)
- Inclusão dos alunos em horários de tutoria no Ginásio Educacional Tecnológico (GET).
- Oferta de alimentação reforçada (café, almoço e lanche).

---

#### 4. Metas de Monitoramento (30 dias)
- Elevar a frequência média da turma para no mínimo **85%**.
- Reduzir o score de risco SHAP para a faixa **Moderado (<0.50)**.`;
}
