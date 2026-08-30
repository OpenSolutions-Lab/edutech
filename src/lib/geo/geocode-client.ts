export interface GeocodeResult {
  lat: number;
  lon: number;
  rotulo: string;
}

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const VIEWBOX_RIO = "-43.80,-23.10,-43.10,-22.74";

export async function geocodificarEndereco(endereco: string): Promise<GeocodeResult | null> {
  const consulta = endereco.trim();
  if (!consulta) return null;

  let query = consulta;
  if (!query.toLowerCase().includes("rio de janeiro")) {
    query = `${query}, Rio de Janeiro, RJ, Brasil`;
  }

  try {
    const params = new URLSearchParams({
      q: query,
      format: "json",
      limit: "1",
      countrycodes: "br",
      viewbox: VIEWBOX_RIO,
      bounded: "1",
      addressdetails: "0"
    });

    const response = await fetch(`${NOMINATIM_URL}?${params.toString()}`, {
      headers: {
        "User-Agent": "edurio-insights-inscricao/1.0"
      }
    });

    if (!response.ok) return null;
    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) return null;

    const item = data[0];
    const nome = item.display_name || consulta;
    const rotulo = nome.split(",").slice(0, 3).join(", ").trim();

    return {
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      rotulo
    };
  } catch (error) {
    console.error("Erro na geocodificação Nominatim:", error);
    return null;
  }
}
