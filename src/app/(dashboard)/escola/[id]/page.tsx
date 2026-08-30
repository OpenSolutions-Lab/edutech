import type { Metadata } from "next";
import { getEscolaDetalhes } from "@/actions/escola-details";
import { EscolaProfileView } from "@/components/features/escola-profile-view";

interface EscolaDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: EscolaDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const escola = await getEscolaDetalhes(id);

  return {
    title: `${escola.nome} | EduRio-Insights`,
    description: `Ficha completa, indicadores e diagnóstico preditivo da unidade ${escola.nome} (${escola.tipo}).`,
  };
}

export default async function EscolaDetailPage({ params }: EscolaDetailPageProps) {
  const { id } = await params;
  const escola = await getEscolaDetalhes(id);

  return <EscolaProfileView escola={escola} />;
}
