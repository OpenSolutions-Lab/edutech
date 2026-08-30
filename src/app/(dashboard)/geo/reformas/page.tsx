import type { Metadata } from 'next';
import { getPrioridadeReformasGeo } from '@/actions/geo-queries';
import { ReformasMapViewer } from '@/components/maps/reformas-map-viewer';

export const metadata: Metadata = {
  title: 'Reformas Prediais',
  description: 'Priorização de reformas estruturais e climatização.'
};

export default async function ReformasPage() {
  const reformas = await getPrioridadeReformasGeo();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground">Priorização de Reformas</h1>
        <p className="text-sm text-muted-foreground">
          Score inteligente de prioridade baseado em idade do prédio, climatização pendente e orçamentos anteriores
        </p>
      </div>

      {/* Visualizador de Priorização */}
      <ReformasMapViewer reformas={reformas} />
    </div>
  );
}
