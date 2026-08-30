import type { Metadata } from 'next';
import { getRankingVulnerabilidade } from '@/actions/vulnerabilidade';
import { VulnerabilityRanking } from '@/components/features/vulnerability-ranking';
import { ShieldAlert } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Ranking de Vulnerabilidade',
  description: 'Classificação de escolas municipais pelo Índice de Vulnerabilidade Escolar (IVE).'
};

export default async function VulnerabilidadePage() {
  const data = await getRankingVulnerabilidade();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground">Ranking de Vulnerabilidade</h1>
        <p className="text-sm text-muted-foreground">
          Classificação das unidades escolares pelo Índice de Vulnerabilidade Escolar (IVE)
        </p>
      </div>

      {/* Tabela do Ranking */}
      <VulnerabilityRanking data={data} />
    </div>
  );
}
