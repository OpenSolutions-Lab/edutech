import crypto from 'crypto';

export interface UnidadeCreche {
  codigo: string;
  nome: string;
  tipo: 'Creche Municipal' | 'EDI';
  cre: number;
  bairro: string;
  endereco: string;
  lat: number;
  lon: number;
}

export interface UnidadeRanqueada {
  unidade: UnidadeCreche;
  distancia_km: number | null;
  vagas_ofertadas_ano_anterior: number;
  inscritos_ano_anterior: number;
  candidatos_por_vaga: number;
  indicacao_concorrencia: string;
  selo_concorrencia: { texto: string; cor: string };
  selo_distancia: { texto: string; cor: string };
  score: number;
  motivo: string;
}

export const INICIO_ANO_LETIVO = new Date(2026, 2, 1); // March 1st 2026
export const ANO_REFERENCIA = 2025;
export const NUM_OPCOES = 5;

// Cálculo determinístico de vagas e inscritos simulados por unidade (2025)
function getDadosHistoricos2025(codigo: string) {
  const hashHex = crypto.createHash('md5').update(codigo).digest('hex').substring(0, 8);
  const semente = parseInt(hashHex, 16);
  const vagas = [6, 8, 10, 12, 14, 16, 20, 24, 30][semente % 9];
  const fator = 0.6 + ((Math.floor(semente / 9) % 40) / 10.0);
  const inscritos = Math.max(1, Math.round(vagas * fator));
  const candidatosPorVaga = inscritos / Math.max(vagas, 1);
  return { vagas, inscritos, candidatosPorVaga };
}

// Amostra de creches e EDIs do Rio de Janeiro
export const UNIDADES_CRECHE_SAMPLE: UnidadeCreche[] = [
  { codigo: "CRE02-0117", nome: "Creche Municipal Zilda Arns", tipo: "Creche Municipal", cre: 2, bairro: "Tijuca", endereco: "Rua Conde de Bonfim, 400 — Tijuca", lat: -22.9245, lon: -43.2336 },
  { codigo: "CRE02-0142", nome: "EDI Anísio Teixeira", tipo: "EDI", cre: 2, bairro: "Vila Isabel", endereco: "Boulevard 28 de Setembro, 210 — Vila Isabel", lat: -22.9163, lon: -43.2478 },
  { codigo: "CRE02-0088", nome: "Creche Municipal Paulo Freire", tipo: "Creche Municipal", cre: 2, bairro: "Maracanã", endereco: "Rua São Francisco Xavier, 524 — Maracanã", lat: -22.9126, lon: -43.2270 },
  { codigo: "CRE02-0203", nome: "EDI Darcy Ribeiro", tipo: "EDI", cre: 2, bairro: "Grajaú", endereco: "Rua Barão do Bom Retiro, 1200 — Grajaú", lat: -22.9231, lon: -43.2596 },
  { codigo: "CRE04-0051", nome: "Creche Municipal Tarsila do Amaral", tipo: "Creche Municipal", cre: 4, bairro: "Botafogo", endereco: "Rua Voluntários da Pátria, 190 — Botafogo", lat: -22.9515, lon: -43.1837 },
  { codigo: "CRE04-0067", nome: "EDI Cora Coralina", tipo: "EDI", cre: 4, bairro: "Flamengo", endereco: "Rua Marquês de Abrantes, 80 — Flamengo", lat: -22.9324, lon: -43.1755 },
  { codigo: "CRE04-0072", nome: "Creche Municipal Cecília Meireles", tipo: "Creche Municipal", cre: 4, bairro: "Laranjeiras", endereco: "Rua das Laranjeiras, 400 — Laranjeiras", lat: -22.9345, lon: -43.1875 },
  { codigo: "CRE04-0090", nome: "Creche Municipal Santa Teresa", tipo: "Creche Municipal", cre: 4, bairro: "Santa Teresa", endereco: "Rua Almirante Alexandrino, 1100 — Santa Teresa", lat: -22.9200, lon: -43.1877 },
  { codigo: "CRE04-0110", nome: "EDI Portinari", tipo: "EDI", cre: 4, bairro: "Catete", endereco: "Rua do Catete, 310 — Catete", lat: -22.9268, lon: -43.1780 },
  { codigo: "CRE04-0121", nome: "Creche Municipal Copacabana", tipo: "Creche Municipal", cre: 4, bairro: "Copacabana", endereco: "Rua Barata Ribeiro, 500 — Copacabana", lat: -22.9711, lon: -43.1868 },
  { codigo: "CRE04-0133", nome: "EDI Vinícius de Moraes", tipo: "EDI", cre: 4, bairro: "Ipanema", endereco: "Rua Prudente de Moraes, 300 — Ipanema", lat: -22.9838, lon: -43.2048 },
  { codigo: "CRE04-0140", nome: "Creche Municipal Leblon", tipo: "Creche Municipal", cre: 4, bairro: "Leblon", endereco: "Rua Dias Ferreira, 100 — Leblon", lat: -22.9838, lon: -43.2237 },
  { codigo: "CRE04-0155", nome: "EDI Rubem Braga", tipo: "EDI", cre: 4, bairro: "Gávea", endereco: "Rua Marquês de São Vicente, 200 — Gávea", lat: -22.9770, lon: -43.2323 },
  { codigo: "CRE03-0044", nome: "Creche Municipal São Cristóvão", tipo: "Creche Municipal", cre: 3, bairro: "São Cristóvão", endereco: "Rua São Luiz Gonzaga, 300 — São Cristóvão", lat: -22.8975, lon: -43.2225 },
  { codigo: "CRE07-0061", nome: "EDI Nise da Silveira", tipo: "EDI", cre: 7, bairro: "Méier", endereco: "Rua Dias da Cruz, 400 — Méier", lat: -22.9024, lon: -43.2794 },
  { codigo: "CRE07-0078", nome: "Creche Municipal Engenho de Dentro", tipo: "Creche Municipal", cre: 7, bairro: "Engenho de Dentro", endereco: "Rua Ana Néri, 150 — Engenho de Dentro", lat: -22.8876, lon: -43.2913 },
  { codigo: "CRE07-0092", nome: "EDI Clarice Lispector", tipo: "EDI", cre: 7, bairro: "Cascadura", endereco: "Rua Carolina Machado, 500 — Cascadura", lat: -22.8845, lon: -43.3260 },
  { codigo: "CRE07-0103", nome: "Creche Municipal Madureira", tipo: "Creche Municipal", cre: 7, bairro: "Madureira", endereco: "Estrada do Portela, 200 — Madureira", lat: -22.8730, lon: -43.3390 },
  { codigo: "CRE06-0035", nome: "EDI Milton Santos", tipo: "EDI", cre: 6, bairro: "Irajá", endereco: "Av. Monsenhor Félix, 300 — Irajá", lat: -22.8290, lon: -43.3270 },
  { codigo: "CRE05-0048", nome: "Creche Municipal Penha", tipo: "Creche Municipal", cre: 5, bairro: "Penha", endereco: "Rua do Cajá, 120 — Penha", lat: -22.8430, lon: -43.2790 },
  { codigo: "CRE05-0059", nome: "EDI Ramos", tipo: "EDI", cre: 5, bairro: "Ramos", endereco: "Rua Uranos, 900 — Ramos", lat: -22.8500, lon: -43.2560 },
  { codigo: "CRE03-0071", nome: "Creche Municipal Ilha do Governador", tipo: "Creche Municipal", cre: 3, bairro: "Cocotá", endereco: "Estrada do Galeão, 800 — Ilha do Governador", lat: -22.8050, lon: -43.1900 },
  { codigo: "CRE10-0022", nome: "EDI Oscar Niemeyer", tipo: "EDI", cre: 10, bairro: "Barra da Tijuca", endereco: "Av. das Américas, 5000 — Barra da Tijuca", lat: -23.0000, lon: -43.3650 },
  { codigo: "CRE10-0031", nome: "Creche Municipal Recreio", tipo: "Creche Municipal", cre: 10, bairro: "Recreio dos Bandeirantes", endereco: "Av. das Américas, 16000 — Recreio", lat: -23.0250, lon: -43.4680 },
  { codigo: "CRE10-0040", nome: "EDI Freguesia", tipo: "EDI", cre: 10, bairro: "Freguesia (Jacarepaguá)", endereco: "Estrada dos Três Rios, 400 — Freguesia", lat: -22.9380, lon: -43.3430 },
  { codigo: "CRE10-0052", nome: "Creche Municipal Taquara", tipo: "Creche Municipal", cre: 10, bairro: "Taquara", endereco: "Estrada do Tindiba, 600 — Taquara", lat: -22.9200, lon: -43.3830 },
  { codigo: "CRE09-0018", nome: "EDI Campo Grande", tipo: "EDI", cre: 9, bairro: "Campo Grande", endereco: "Rua Coronel Agostinho, 200 — Campo Grande", lat: -22.9020, lon: -43.5610 },
  { codigo: "CRE09-0027", nome: "Creche Municipal Santa Cruz", tipo: "Creche Municipal", cre: 9, bairro: "Santa Cruz", endereco: "Rua Felipe Cardoso, 300 — Santa Cruz", lat: -22.9160, lon: -43.6840 },
  { codigo: "CRE08-0014", nome: "EDI Bangu", tipo: "EDI", cre: 8, bairro: "Bangu", endereco: "Rua Fonseca, 400 — Bangu", lat: -22.8760, lon: -43.4650 },
  { codigo: "CRE08-0025", nome: "Creche Municipal Realengo", tipo: "Creche Municipal", cre: 8, bairro: "Realengo", endereco: "Rua Marechal Soares de Andréa, 100 — Realengo", lat: -22.8790, lon: -43.4290 },
  { codigo: "CRE10-0063", nome: "Creche Municipal Guaratiba", tipo: "Creche Municipal", cre: 10, bairro: "Guaratiba", endereco: "Estrada da Matriz, 200 — Guaratiba", lat: -23.0560, lon: -43.5940 }
];

export const BAIRROS_RIO = Array.from(new Set(UNIDADES_CRECHE_SAMPLE.map(u => u.bairro))).sort();

export function getGrupamentoPorNascimento(dataNascimento: Date, dataRef: Date = INICIO_ANO_LETIVO): string {
  const meses = (dataRef.getFullYear() - dataNascimento.getFullYear()) * 12 + (dataRef.getMonth() - dataNascimento.getMonth());
  if (meses < 12) return "Berçário";
  if (meses < 24) return "Maternal I";
  if (meses < 36) return "Maternal II";
  if (meses < 48) return "Pré-Escola I";
  return "Pré-Escola II";
}

export function getGrupamentosElegiveis(tipo: 'Creche Municipal' | 'EDI'): string[] {
  const base = ["Berçário", "Maternal I", "Maternal II"];
  if (tipo === "EDI") {
    return [...base, "Pré-Escola I", "Pré-Escola II"];
  }
  return base;
}

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371.0;
  const p1 = (lat1 * Math.PI) / 180;
  const p2 = (lat2 * Math.PI) / 180;
  const dPhi = ((lat2 - lat1) * Math.PI) / 180;
  const dLmb = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dPhi / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dLmb / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function centroideBairro(bairro: string): [number, number] | null {
  const pts = UNIDADES_CRECHE_SAMPLE.filter(u => u.bairro === bairro);
  if (pts.length === 0) return null;
  const sumLat = pts.reduce((acc, u) => acc + u.lat, 0);
  const sumLon = pts.reduce((acc, u) => acc + u.lon, 0);
  return [sumLat / pts.length, sumLon / pts.length];
}

export function getSeloConcorrencia(ratio: number): { texto: string; cor: string } {
  if (ratio <= 1.5) return { texto: `🟢 Sobrou vaga em ${ANO_REFERENCIA}`, cor: "#10b981" };
  if (ratio <= 3.0) return { texto: `🔵 Concorrência baixa em ${ANO_REFERENCIA}`, cor: "#2563eb" };
  if (ratio <= 6.0) return { texto: `🟡 Concorrência média em ${ANO_REFERENCIA}`, cor: "#d97706" };
  return { texto: `⚪ Concorrência alta em ${ANO_REFERENCIA}`, cor: "#6b7280" };
}

export function getSeloDistancia(distanciaKm: number | null): { texto: string; cor: string } {
  if (distanciaKm === null) return { texto: "⚪ Sem referência", cor: "#6b7280" };
  if (distanciaKm <= 1.5) return { texto: "🟢 Bem perto", cor: "#10b981" };
  if (distanciaKm <= 4.0) return { texto: "🔵 Perto", cor: "#2563eb" };
  return { texto: "⚪ Mais distante", cor: "#6b7280" };
}

function norm(valor: number, menor: number, maior: number): number {
  if (maior <= menor) return 0.5;
  return (valor - menor) / (maior - menor);
}

export function ranquearUnidadesCreche(
  criterio: 'proximidade' | 'agilidade',
  grupamento: string,
  ref: [number, number] | null
): UnidadeRanqueada[] {
  const elegiveis = UNIDADES_CRECHE_SAMPLE.filter(u => getGrupamentosElegiveis(u.tipo).includes(grupamento));

  const dists: Record<string, number | null> = {};
  const razoes: Record<string, number> = {};
  const historicos: Record<string, { vagas: number; inscritos: number; candidatosPorVaga: number }> = {};

  elegiveis.forEach(u => {
    dists[u.codigo] = ref ? haversineKm(ref[0], ref[1], u.lat, u.lon) : null;
    const hist = getDadosHistoricos2025(u.codigo);
    historicos[u.codigo] = hist;
    razoes[u.codigo] = hist.candidatosPorVaga;
  });

  const rVals = Object.values(razoes);
  const rMin = Math.min(...(rVals.length ? rVals : [1.0]));
  const rMax = Math.max(...(rVals.length ? rVals : [1.0]));

  const distNum = Object.values(dists).filter((d): d is number => d !== null);
  const dMin = distNum.length ? Math.min(...distNum) : 0.0;
  const dMax = distNum.length ? Math.max(...distNum) : 1.0;

  const resultado: UnidadeRanqueada[] = elegiveis.map(u => {
    const d = dists[u.codigo];
    const razao = razoes[u.codigo];
    const hist = historicos[u.codigo];
    const chance = 1.0 - norm(razao, rMin, rMax);
    const perto = d === null ? 0.5 : 1.0 - norm(d, dMin, dMax);

    let score = 0;
    let motivo = "";
    const base2025 = `Em ${ANO_REFERENCIA}: ${hist.vagas} vagas para ${hist.inscritos} inscritos (~${razao.toFixed(1)} por vaga).`;

    if (criterio === "proximidade") {
      score = 0.80 * perto + 0.20 * chance;
      if (d !== null && d <= 1.0) {
        motivo = `A ~${d.toFixed(1)} km do endereço informado — dá para ir a pé.`;
      } else if (d !== null) {
        motivo = `A ~${d.toFixed(1)} km do endereço informado.`;
      } else {
        motivo = "No bairro de referência selecionado.";
      }
    } else {
      score = 0.85 * chance + 0.15 * perto;
      motivo = base2025;
    }

    return {
      unidade: u,
      distancia_km: d,
      vagas_ofertadas_ano_anterior: hist.vagas,
      inscritos_ano_anterior: hist.inscritos,
      candidatos_por_vaga: razao,
      indicacao_concorrencia: ratioLabel(razao),
      selo_concorrencia: getSeloConcorrencia(razao),
      selo_distancia: getSeloDistancia(d),
      score,
      motivo,
    };
  });

  if (criterio === "proximidade") {
    resultado.sort((a, b) => {
      const distA = a.distancia_km ?? 1e9;
      const distB = b.distancia_km ?? 1e9;
      if (distA !== distB) return distA - distB;
      return b.score - a.score;
    });
  } else {
    resultado.sort((a, b) => {
      if (a.candidatos_por_vaga !== b.candidatos_por_vaga) {
        return a.candidatos_por_vaga - b.candidatos_por_vaga;
      }
      return b.score - a.score;
    });
  }

  return resultado;
}

function ratioLabel(r: number): string {
  if (r <= 1.5) return "sobrou vaga em 2025";
  if (r <= 3.0) return "concorrência baixa em 2025";
  if (r <= 6.0) return "concorrência média em 2025";
  return "concorrência alta em 2025";
}
