import type { Metadata } from 'next';
import { getEscolasGeo } from '@/actions/geo-queries';
import { GestorMapViewer } from '@/components/maps/gestor-map-viewer';

export const metadata: Metadata = {
  title: 'Mapa Interativo',
  description: 'Mapa geoespacial de todas as escolas da rede municipal.'
};

export default async function MapaPage() {
  const escolas = await getEscolasGeo();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground">Mapa Interativo</h1>
        <p className="text-sm text-muted-foreground">
          Visualização geoespacial das escolas municipais com agrupamento em clusters e alertas
        </p>
      </div>

      {/* Visualizador do Mapa e Filtros */}
      <GestorMapViewer escolas={escolas} />
    </div>
  );
}
