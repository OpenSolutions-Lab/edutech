import { DuplicidadeCpfPanelFeature } from "@/components/features/duplicidade-cpf-panel";

export const metadata = {
  title: "Motor CPF & Anti-Duplicidade | EduTech Creche SME-Rio",
  description: "Detecção de multi-inscrições ativas e reclassificação da fila agrupada por criança.",
};

export default function DuplicidadeCpfPage() {
  return <DuplicidadeCpfPanelFeature />;
}
