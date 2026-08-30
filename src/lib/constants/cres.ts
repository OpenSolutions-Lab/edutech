/**
 * Mapeamento completo das 11 Coordenadorias Regionais de Educação (CREs)
 * da Secretaria Municipal de Educação do Rio de Janeiro.
 */

export interface CREInfo {
  id: number;
  sigla: string;
  nome: string;
  endereco: string;
  regiaoAdministrativa: string;
  bairrosPrincipais: string[];
  cor: string;
}

export const CRE_DATA: CREInfo[] = [
  {
    id: 1,
    sigla: "1ª CRE",
    nome: "1ª Coordenadoria Regional de Educação",
    endereco: "Rua Edgar Gordilho, 63 - Praça Mauá",
    regiaoAdministrativa: "Centro",
    bairrosPrincipais: ["Centro", "Lapa", "Glória", "Santa Teresa", "São Cristóvão", "Catumbi", "Saúde", "Gamboa"],
    cor: "#3B82F6",
  },
  {
    id: 2,
    sigla: "2ª CRE",
    nome: "2ª Coordenadoria Regional de Educação",
    endereco: "Praça General Álcio Souto, s/nº - Lagoa",
    regiaoAdministrativa: "Zona Sul",
    bairrosPrincipais: ["Copacabana", "Ipanema", "Botafogo", "Lagoa", "Leblon", "Gávea", "Urca", "Flamengo", "Laranjeiras"],
    cor: "#10B981",
  },
  {
    id: 3,
    sigla: "3ª CRE",
    nome: "3ª Coordenadoria Regional de Educação",
    endereco: "Rua 24 de Maio, 931 (fundos) - Engenho Novo",
    regiaoAdministrativa: "Norte (Tijuca)",
    bairrosPrincipais: ["Tijuca", "Engenho Novo", "Méier", "Maracanã", "Vila Isabel", "Grajaú", "Andaraí", "Lins de Vasconcelos"],
    cor: "#F59E0B",
  },
  {
    id: 4,
    sigla: "4ª CRE",
    nome: "4ª Coordenadoria Regional de Educação",
    endereco: "Rua Professor Luís Rondelli, 150 - Olaria",
    regiaoAdministrativa: "Norte (Ilha)",
    bairrosPrincipais: ["Olaria", "Penha", "Ilha do Governador", "Ramos", "Bonsucesso", "Manguinhos", "Complexo do Alemão"],
    cor: "#EF4444",
  },
  {
    id: 5,
    sigla: "5ª CRE",
    nome: "5ª Coordenadoria Regional de Educação",
    endereco: "Rua Marupiara, s/nº - Rocha Miranda",
    regiaoAdministrativa: "Norte (Madureira)",
    bairrosPrincipais: ["Madureira", "Rocha Miranda", "Campinho", "Cascadura", "Turiaçu", "Cavalcanti", "Quintino"],
    cor: "#8B5CF6",
  },
  {
    id: 6,
    sigla: "6ª CRE",
    nome: "6ª Coordenadoria Regional de Educação",
    endereco: "Rua dos Abacates, s/nº - Deodoro",
    regiaoAdministrativa: "Oeste (Deodoro)",
    bairrosPrincipais: ["Deodoro", "Realengo", "Padre Miguel", "Anchieta", "Ricardo de Albuquerque", "Magalhães Bastos"],
    cor: "#EC4899",
  },
  {
    id: 7,
    sigla: "7ª CRE",
    nome: "7ª Coordenadoria Regional de Educação",
    endereco: "Avenida Ayrton Senna, 2001 - Barra da Tijuca",
    regiaoAdministrativa: "Barra da Tijuca",
    bairrosPrincipais: ["Barra da Tijuca", "Recreio dos Bandeirantes", "Jacarepaguá", "Taquara", "Pechincha", "Freguesia"],
    cor: "#06B6D4",
  },
  {
    id: 8,
    sigla: "8ª CRE",
    nome: "8ª Coordenadoria Regional de Educação",
    endereco: "Rua Biarritz, 31 - Bangu",
    regiaoAdministrativa: "Bangu",
    bairrosPrincipais: ["Bangu", "Senador Camará", "Santíssimo", "Guilherme da Silveira", "Padre Miguel"],
    cor: "#F97316",
  },
  {
    id: 9,
    sigla: "9ª CRE",
    nome: "9ª Coordenadoria Regional de Educação",
    endereco: "Rua Amaral Costa, 140 - Campo Grande",
    regiaoAdministrativa: "Campo Grande",
    bairrosPrincipais: ["Campo Grande", "Cosmos", "Inhoaíba", "Senador Vasconcelos"],
    cor: "#84CC16",
  },
  {
    id: 10,
    sigla: "10ª CRE",
    nome: "10ª Coordenadoria Regional de Educação",
    endereco: "Av. Padre Guilherme Decaminada, 71 - Santa Cruz",
    regiaoAdministrativa: "Santa Cruz",
    bairrosPrincipais: ["Santa Cruz", "Paciência", "Sepetiba", "Guaratiba", "Pedra de Guaratiba"],
    cor: "#14B8A6",
  },
  {
    id: 11,
    sigla: "11ª CRE",
    nome: "11ª Coordenadoria Regional de Educação",
    endereco: "Complexo da Maré",
    regiaoAdministrativa: "Penha/Complexo",
    bairrosPrincipais: ["Complexo da Maré", "Manguinhos", "Bonsucesso", "Benfica", "Caju"],
    cor: "#A855F7",
  },
];

export const CRE_MAP = Object.fromEntries(
  CRE_DATA.map((cre) => [cre.id, cre])
) as Record<number, CREInfo>;

export function getCREById(id: number): CREInfo | undefined {
  return CRE_MAP[id];
}

export function getCREColor(id: number): string {
  return CRE_MAP[id]?.cor ?? "#6B7280";
}
