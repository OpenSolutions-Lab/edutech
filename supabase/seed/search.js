async function search() {
  try {
    const res = await fetch('https://datariov2-pcrj.hub.arcgis.com/api/v3/search?q=escolas', {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    const items = data.data;
    console.log(`Encontrados ${items.length} datasets:`);
    items.forEach((item, index) => {
      console.log(`\n[${index + 1}] ID: ${item.id}`);
      console.log(`Título: ${item.attributes.name}`);
      console.log(`Tipo: ${item.attributes.content}`);
      console.log(`Criado: ${new Date(item.attributes.created).toLocaleDateString()}`);
      console.log(`URL: ${item.attributes.url}`);
    });
  } catch (err) {
    console.error('Erro na busca:', err.message);
  }
}

search();
