import type { Metadata } from 'next';
import { getVaziosEducacionaisGeo } from '@/actions/geo-queries';
import { VaziosMapViewer } from '@/components/maps/vazios-map-viewer';

export const metadata: Metadata = {
  title: 'Vazios Educacionais',
  description: 'Identificação de bairros com déficit de vagas escolares.'
};

export default async function VaziosPage() {
  const vaziosCreche = await getVaziosEducacionaisGeo('Creche');
  const vaziosEDI = await getVaziosEducacionaisGeo('EDI');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground">Vazios Educacionais</h1>
        <p className="text-sm text-muted-foreground">
          Mapeamento do déficit de cobertura escolar em bairros e comunidades de alta vulnerabilidade social
        </p>
      </div>

      {/* Visualizador de Vazios */}
      <VaziosMapViewer vaziosCreche={vaziosCreche} vaziosEDI={vaziosEDI} />
    </div>
  );
}
