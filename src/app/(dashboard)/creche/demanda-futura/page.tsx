import { DemandaFuturaNascidosVivosFeature } from "@/components/features/demanda-futura-nascidos-vivos";

export const metadata = {
  title: "Demanda Futura Nascidos Vivos | EduTech Creche SME-Rio",
  description: "Projeção de demanda territorial por nascidos vivos (IBGE/DATASUS) e vagas de creches públicas e conveneadas.",
};

export default function DemandaFuturaPage() {
  return <DemandaFuturaNascidosVivosFeature />;
}
