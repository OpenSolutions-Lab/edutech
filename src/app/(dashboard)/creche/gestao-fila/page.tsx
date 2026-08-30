import type { Metadata } from 'next';
import { GestaoFilaView } from '@/components/features/gestao-fila-view';

export const metadata: Metadata = {
  title: 'Gestão de Fila (Fila Viva) | EduTech Creche',
  description: 'Motor central de gestão de fila, convocação e cascata de vagas de creche da SME-Rio.',
};

export default function GestaoFilaPage() {
  return <GestaoFilaView />;
}
