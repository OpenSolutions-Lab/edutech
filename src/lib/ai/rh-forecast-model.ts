/**
 * Modelo de Previsão de Carência de RH — EWMA (Exponentially Weighted Moving Average)
 * 
 * Projeção(t+n) = α·Real(t) + α(1-α)·Real(t-1) + α(1-α)²·Real(t-2) + ...
 * α = 0.3 (fator de suavização)
 */

// --- Tipos ---

export interface DadosHistoricoRH {
  cre_id: number;
  cre_nome: string;
  disciplina: string;
  serie_mensal: number[]; // últimos 12 meses de carência real
}

export interface ProjecaoRH {
  cre_id: number;
  cre_nome: string;
  disciplina: string;
  carencia_atual: number;
  projecoes: { mes: string; carencia_projetada: number; confianca: number }[];
  tendencia: 'subindo' | 'estavel' | 'descendo';
  alerta: boolean;
}

// --- Constantes ---
const ALPHA = 0.3; // Fator de suavização EWMA
const MESES_PROJECAO = 3;

const NOMES_MESES = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
];

const DISCIPLINAS = [
  'Português', 'Matemática', 'Ciências', 'Inglês', 'Educação Física'
];

// --- Cálculo EWMA ---

function calcularEWMA(serie: number[], alpha: number): number {
  if (serie.length === 0) return 0;
  if (serie.length === 1) return serie[0];

  let ewma = serie[0];
  for (let i = 1; i < serie.length; i++) {
    ewma = alpha * serie[i] + (1 - alpha) * ewma;
  }
  return ewma;
}

function projetarEWMA(serie: number[], alpha: number, mesesAdiante: number): number[] {
  const ultimoEWMA = calcularEWMA(serie, alpha);
  const projecoes: number[] = [];

  // Calcular tendência linear dos últimos 6 meses para ajustar a projeção
  const ultimos6 = serie.slice(-6);
  let tendencia = 0;
  if (ultimos6.length >= 2) {
    const inicio = ultimos6[0];
    const fim = ultimos6[ultimos6.length - 1];
    tendencia = (fim - inicio) / ultimos6.length;
  }

  for (let i = 1; i <= mesesAdiante; i++) {
    // Projeção = EWMA + tendência linear atenuada
    const proj = Math.max(0, Math.round(ultimoEWMA + tendencia * i * 0.7));
    projecoes.push(proj);
  }

  return projecoes;
}

function calcularConfianca(serie: number[], projecaoIndex: number): number {
  // Confiança diminui à medida que a projeção se afasta do presente
  // Variância da série afeta a confiança
  const media = serie.reduce((a, b) => a + b, 0) / serie.length;
  const variancia = serie.reduce((a, b) => a + Math.pow(b - media, 2), 0) / serie.length;
  const cv = media > 0 ? Math.sqrt(variancia) / media : 1; // coeficiente de variação

  const baseConfianca = Math.max(0.50, 1 - cv);
  const decaimento = 0.08 * projecaoIndex;
  return Math.max(0.40, baseConfianca - decaimento);
}

function determinarTendencia(serie: number[]): 'subindo' | 'estavel' | 'descendo' {
  if (serie.length < 3) return 'estavel';
  const ultimos3 = serie.slice(-3);
  const primeiros3 = serie.slice(-6, -3);
  if (primeiros3.length === 0) return 'estavel';

  const mediaRecente = ultimos3.reduce((a, b) => a + b, 0) / ultimos3.length;
  const mediaAnterior = primeiros3.reduce((a, b) => a + b, 0) / primeiros3.length;

  const variacao = ((mediaRecente - mediaAnterior) / (mediaAnterior || 1)) * 100;
  if (variacao > 10) return 'subindo';
  if (variacao < -10) return 'descendo';
  return 'estavel';
}

// --- Função principal de projeção ---

export function projetarCarenciaRH(dados: DadosHistoricoRH): ProjecaoRH {
  const mesAtual = new Date().getMonth();

  const projecoes = projetarEWMA(dados.serie_mensal, ALPHA, MESES_PROJECAO);
  const tendencia = determinarTendencia(dados.serie_mensal);

  const projecoesFormatadas = projecoes.map((valor, i) => ({
    mes: NOMES_MESES[(mesAtual + i + 1) % 12],
    carencia_projetada: valor,
    confianca: calcularConfianca(dados.serie_mensal, i)
  }));

  const carenciaAtual = dados.serie_mensal[dados.serie_mensal.length - 1] || 0;
  const alerta = carenciaAtual > 5 || projecoes.some(p => p > 8);

  return {
    cre_id: dados.cre_id,
    cre_nome: dados.cre_nome,
    disciplina: dados.disciplina,
    carencia_atual: carenciaAtual,
    projecoes: projecoesFormatadas,
    tendencia,
    alerta
  };
}

// --- Mock de dados históricos ---

export function gerarDadosMockRH(): DadosHistoricoRH[] {
  const CREs = [
    { id: 1, nome: '1ª CRE' }, { id: 2, nome: '2ª CRE' }, { id: 3, nome: '3ª CRE' },
    { id: 4, nome: '4ª CRE' }, { id: 5, nome: '5ª CRE' }, { id: 6, nome: '6ª CRE' },
    { id: 7, nome: '7ª CRE' }, { id: 8, nome: '8ª CRE' }, { id: 9, nome: '9ª CRE' },
    { id: 10, nome: '10ª CRE' }, { id: 11, nome: '11ª CRE' },
  ];

  // Seed determinístico para dados consistentes
  const seed = (cre: number, disc: number) => {
    return (cre * 7 + disc * 13) % 17;
  };

  const dados: DadosHistoricoRH[] = [];
  for (const cre of CREs) {
    for (let d = 0; d < DISCIPLINAS.length; d++) {
      const base = seed(cre.id, d) + 2;
      const serie = Array.from({ length: 12 }, (_, i) => {
        const sazonal = Math.sin((i / 12) * Math.PI * 2) * 2;
        const tendencia = (cre.id > 7 ? 0.3 : -0.1) * i; // CREs periféricas pioram
        const ruido = ((cre.id * 31 + d * 17 + i * 7) % 5) - 2;
        return Math.max(0, Math.round(base + sazonal + tendencia + ruido));
      });

      dados.push({
        cre_id: cre.id,
        cre_nome: cre.nome,
        disciplina: DISCIPLINAS[d],
        serie_mensal: serie
      });
    }
  }
  return dados;
}

export { DISCIPLINAS, NOMES_MESES };
