import type { Metadata } from 'next';
import { getEscolasMerenda } from '@/actions/predicoes';
import { MerendaCalculator } from '@/components/features/merenda-calculator';

export const metadata: Metadata = {
  title: 'Merenda Escolar',
  description: 'Dimensionamento automático da merenda escolar.'
};

export default async function MerendaPage() {
  const escolas = await getEscolasMerenda();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dimensionamento de Merenda</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Estimativa inteligente de consumo e ordens de compra com base em matrículas, presença e cardápio da SME
        </p>
      </div>

      <MerendaCalculator escolas={escolas} />
    </div>
  );
}
