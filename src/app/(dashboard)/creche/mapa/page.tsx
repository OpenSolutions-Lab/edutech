import { MapaOfertaDemandaFeature } from "@/components/features/mapa-oferta-demanda";

export const metadata = {
  title: "Mapa de Oferta x Demanda | EduTech Creche SME-Rio",
  description: "Visualização georreferenciada do descompasso de oferta e demanda por creches na rede municipal do Rio de Janeiro.",
};

export default function MapaOfertaDemandaPage() {
  return <MapaOfertaDemandaFeature />;
}
