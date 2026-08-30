import type { Metadata } from 'next';
import { getPredicoesEvasao } from '@/actions/predicoes';
import { EvasionRiskPanel } from '@/components/features/evasion-risk-panel';

export const metadata: Metadata = {
  title: 'Alerta de Evasão',
  description: 'Modelo preditivo de alerta precoce de evasão escolar.'
};

export default async function EvasaoPage() {
  const resultados = await getPredicoesEvasao();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Alerta Precoce de Evasão</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Score de risco de abandono por escola · Regressão logística ponderada + análise contextual Claude AI
        </p>
      </div>

      <EvasionRiskPanel resultados={resultados} />
    </div>
  );
}
