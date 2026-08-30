import Anthropic from '@anthropic-ai/sdk';
import { PlanoAulaContextualizado } from '@/types/smdeis-intersetorial';

export interface PromptContextoPedagogicoInput {
  escola_nome: string;
  bairro_nome: string;
  setor_predominante: string;
  componente_curricular: string; // Ex: 'Matemática', 'Ciências', 'Tecnologia'
  ano_escolar: string;           // Ex: '7º Ano', '9º Ano', 'EJA III'
  hub_proximo?: string;          // Ex: 'Porto Maravalley', 'Polo Logístico Pavuna'
}

export async function gerarPlanoAulaContextualizado(
  input: PromptContextoPedagogicoInput
): Promise<PlanoAulaContextualizado> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  // Fallback heurístico caso Anthropic não esteja configurado
  if (!apiKey) {
    return gerarPlanoAulaHeuristico(input);
  }

  try {
    const client = new Anthropic({ apiKey });

    const prompt = `Você é um especialista em desenvolvimento pedagógico e inovação educacional da Secretaria Municipal de Educação do Rio de Janeiro (SME-Rio).
Sua tarefa é criar um plano de aula contextualizado para o Ginásio Educacional Tecnológico (GET) ou escola de tempo integral.

DADOS DA ESCOLA E TERRITÓRIO (SME + SMDEIS DATA.RIO):
- Escola: ${input.escola_nome}
- Bairro: ${input.bairro_nome}
- Setor Econômico Predominante no Entorno: ${input.setor_predominante}
- Hub Tecnológico/Econômico Próximo: ${input.hub_proximo || 'Distrito de Inovação Local'}
- Componente Curricular: ${input.componente_curricular}
- Ano Escolar: ${input.ano_escolar}

DIRETRIZES:
1. Integre o Currículo Carioca com os problemas reais e vocação econômica do bairro (${input.setor_predominante}).
2. Se a região for Portuária/Tecnologia (Porto Maravalley), foque em lógica de programação, análise de dados e sistemas.
3. Se a região for Zona Norte/Logística, foque em otimização de rotas, transportes, cadeia de suprimentos e matemática aplicada.
4. Se a região for Zona Oeste/Indústria/Urbanismo, foque em física aplicada a construções, sustentabilidade e processos industriais.
5. Se for Zona Sul/Turismo, foque em economia criativa e idiomas/comunicação.

Retorne em formato JSON válido contendo:
{
  "tema_aula": "string",
  "objetivos_aprendizagem": ["string"],
  "projeto_pratico_local": "string",
  "conexao_hubs_locais": "string"
}`;

    const modelsToTry = [
      'claude-haiku-4-5-20251001',
      'claude-sonnet-4-6',
      'claude-sonnet-5',
      'claude-3-5-sonnet-latest'
    ];

    for (const modelName of modelsToTry) {
      try {
        const response = await client.messages.create({
          model: modelName,
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }],
        });

        const text = response.content.find(c => c.type === 'text')?.text;
        if (text) {
          const parsed = JSON.parse(text);
          return {
            escola_nome: input.escola_nome,
            bairro_nome: input.bairro_nome,
            setor_predominante: input.setor_predominante,
            componente_curricular: input.componente_curricular,
            ano_escolar: input.ano_escolar,
            tema_aula: parsed.tema_aula,
            objetivos_aprendizagem: parsed.objetivos_aprendizagem || [],
            projeto_pratico_local: parsed.projeto_pratico_local,
            conexao_hubs_locais: parsed.conexao_hubs_locais,
          };
        }
      } catch (e: any) {
        if (e?.status === 404 || e?.error?.type === 'not_found_error') continue;
        break;
      }
    }
  } catch (err) {
    console.error('[PedagogicoRAG] Erro ao invocar LLM:', err);
  }

  return gerarPlanoAulaHeuristico(input);
}

function gerarPlanoAulaHeuristico(input: PromptContextoPedagogicoInput): PlanoAulaContextualizado {
  const setor = input.setor_predominante.toLowerCase();
  
  if (setor.includes('tecnologia') || input.bairro_nome.includes('Porto') || input.bairro_nome.includes('Santo Cristo')) {
    return {
      escola_nome: input.escola_nome,
      bairro_nome: input.bairro_nome,
      setor_predominante: input.setor_predominante,
      componente_curricular: input.componente_curricular,
      ano_escolar: input.ano_escolar,
      tema_aula: `Lógica e Programação Aplicada ao Hub Porto Maravalley (${input.componente_curricular})`,
      objetivos_aprendizagem: [
        'Compreender algoritmos de ordenação e estruturas de decisão',
        'Desenvolver pequenos scripts orientados à análise de dados urbanos',
        'Reconhecer as oportunidades do mercado de tecnologia na Região Portuária do Rio'
      ],
      projeto_pratico_local: 'Criação de um protótipo de aplicativo web para mapeamento de pontos de coleta seletiva no Porto Maravalley.',
      conexao_hubs_locais: 'Visita guiada e mentoria remota com startups residentes no Hub Porto Maravalley e IMPA Tech.'
    };
  } else if (setor.includes('logistica') || input.bairro_nome.includes('Pavuna') || input.bairro_nome.includes('Vigário')) {
    return {
      escola_nome: input.escola_nome,
      bairro_nome: input.bairro_nome,
      setor_predominante: input.setor_predominante,
      componente_curricular: input.componente_curricular,
      ano_escolar: input.ano_escolar,
      tema_aula: `Matemática de Transportes & Cadeias de Suprimentos na Zona Norte (${input.componente_curricular})`,
      objetivos_aprendizagem: [
        'Calcular rotas de menor custo e consumo em matrizes de transporte',
        'Aplicar probabilidade e estatística ao controle de estoque de mercadorias',
        'Analisar o impacto do polo logístico da Pavuna na economia carioca'
      ],
      projeto_pratico_local: 'Simulação de planejamento de frota de entregas sustentáveis na Avenida Brasil e Rodovia Presidente Dutra.',
      conexao_hubs_locais: 'Estudo de caso real baseado em dados operacionais dos centros de distribuição da Zona Norte.'
    };
  }

  return {
    escola_nome: input.escola_nome,
    bairro_nome: input.bairro_nome,
    setor_predominante: input.setor_predominante,
    componente_curricular: input.componente_curricular,
    ano_escolar: input.ano_escolar,
    tema_aula: `Urbanismo e Desenvolvimento Sustentável (${input.componente_curricular})`,
    objetivos_aprendizagem: [
      'Identificar o impacto do crescimento imobiliário e comercial no território',
      'Resolver problemas práticos de geometria e escala aplicados ao bairro',
      'Propor soluções para melhoria da infraestrutura comunitária'
    ],
    projeto_pratico_local: 'Elaboração de maquete e planta baixa para reurbanização da praça central do bairro.',
    conexao_hubs_locais: 'Integração com projetos comunitários de economia circular e empreendedorismo local.'
  };
}
