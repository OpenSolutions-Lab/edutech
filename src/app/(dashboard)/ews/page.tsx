import { EWSView } from '@/components/features/ews-view';

export const metadata = {
  title: 'Early Warning System (EWS) | EduRio-Insights',
  description: 'Sistema Preditivo de Evasão e Busca Ativa com Fatores SHAP',
};

export default function EWSPage() {
  return <EWSView />;
}
