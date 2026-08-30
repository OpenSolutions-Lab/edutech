/**
 * Configurações geográficas padrão do mapa do Rio de Janeiro
 */

export const MAP_CONFIG = {
  // Centro geográfico aproximado do município do Rio de Janeiro
  defaultViewport: {
    longitude: -43.3850,
    latitude: -22.9150,
    zoom: 10,
    pitch: 0,
    bearing: 0
  },
  
  // Limites geográficos da caixa envolvente (bounding box) do Rio de Janeiro
  bounds: [
    [-43.7950, -23.0850], // Sudoeste [lng, lat]
    [-42.9850, -22.7450]  // Nordeste [lng, lat]
  ] as [[number, number], [number, number]],
  
  maxZoom: 18,
  minZoom: 9,
  
  styles: {
    dark: 'mapbox://styles/mapbox/dark-v11',
    light: 'mapbox://styles/mapbox/light-v11',
    streets: 'mapbox://styles/mapbox/streets-v12',
    satellite: 'mapbox://styles/mapbox/satellite-v9'
  }
};
