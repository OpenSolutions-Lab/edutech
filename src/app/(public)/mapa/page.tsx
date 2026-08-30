import type { Metadata } from 'next';
import { getEscolasGeo } from '@/actions/geo-queries';
import { PublicMapViewer } from '@/components/maps/public-map-viewer';
import { School } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Mapa das Escolas | EduRio-Insights',
  description: 'Mapa público das escolas municipais do Rio de Janeiro.'
};

export default async function MapaPublicoPage() {
  const escolas = await getEscolasGeo();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />

      {/* Header público */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500">
              <School className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-sm font-bold text-foreground">EduRio-Insights</span>
              <span className="ml-2 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                Acesso Público
              </span>
            </div>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/transparencia" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Transparência
            </Link>
            <Link href="/login" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all shadow-md shadow-primary/10">
              Área do Gestor
            </Link>
          </nav>
        </div>
      </header>

      {/* Map */}
      <main className="mx-auto max-w-6xl px-6 py-10 space-y-8 relative z-10">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mapa das Escolas</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Visualize espacialmente as unidades escolares geridas pela Secretaria Municipal de Educação do Rio de Janeiro.
          </p>
        </div>

        {/* Visualizador do Mapa Público */}
        <PublicMapViewer escolas={escolas} />
      </main>
    </div>
  );
}
