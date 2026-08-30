import { PDFExecutiveReportView } from '@/components/reports/pdf-executive-report';

export const metadata = {
  title: 'Relatórios Executivos PDF | EduRio-Insights',
  description: 'Gerador de Relatórios Executivos com Síntese de IA e Dados do DATA.RIO',
};

export default function RelatoriosPage() {
  return <PDFExecutiveReportView />;
}
