import type { Metadata } from 'next';
import { getProjecoesRH } from '@/actions/predicoes';
import { RHProjectionPanel } from '@/components/features/rh-projection-panel';

export const metadata: Metadata = {
  title: 'Carência de RH',
  description: 'Previsão de falta de professores por CRE e disciplina.'
};

export default async function RHPage() {
  const projecoes = await getProjecoesRH();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Previsão de Carência de RH</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Projeção EWMA (média móvel exponencial) de falta de professores por CRE e disciplina para os próximos 3 meses
        </p>
      </div>

      <RHProjectionPanel projecoes={projecoes} />
    </div>
  );
}
