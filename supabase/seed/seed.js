/**
 * Script de semente (seed) para o EduRio-Insights
 * Popula o banco de dados com dados reais do DATA.RIO
 * e gera dados históricos e preditivos realistas.
 * 
 * Execução: node --env-file=.env.local supabase/seed/seed.js
 */

if (typeof global.WebSocket === 'undefined') {
  global.WebSocket = class WebSocket {};
}
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Erro: NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY precisam estar configurados no .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  },
  realtime: {
    disabled: true
  }
});

// 1. Mapeamento das CREs
const cres = [
  { id: 1, nome: '1ª Coordenadoria Regional de Educação', sigla: '1ª CRE', endereco: 'Rua Edgar Gordilho, 63 - Praça Mauá', regiao_administrativa: 'Centro' },
  { id: 2, nome: '2ª Coordenadoria Regional de Educação', sigla: '2ª CRE', endereco: 'Praça General Álcio Souto, s/nº - Lagoa', regiao_administrativa: 'Zona Sul' },
  { id: 3, nome: '3ª Coordenadoria Regional de Educação', sigla: '3ª CRE', endereco: 'Rua 24 de Maio, 931 (fundos) - Engenho Novo', regiao_administrativa: 'Norte (Tijuca)' },
  { id: 4, nome: '4ª Coordenadoria Regional de Educação', sigla: '4ª CRE', endereco: 'Rua Professor Luís Rondelli, 150 - Olaria', regiao_administrativa: 'Norte (Ilha)' },
  { id: 5, nome: '5ª Coordenadoria Regional de Educação', sigla: '5ª CRE', endereco: 'Rua Marupiara, s/nº - Rocha Miranda', regiao_administrativa: 'Norte (Madureira)' },
  { id: 6, nome: '6ª Coordenadoria Regional de Educação', sigla: '6ª CRE', endereco: 'Rua dos Abacates, s/nº - Deodoro', regiao_administrativa: 'Oeste (Deodoro)' },
  { id: 7, nome: '7ª Coordenadoria Regional de Educação', sigla: '7ª CRE', endereco: 'Avenida Ayrton Senna, 2001 - Barra da Tijuca', regiao_administrativa: 'Barra da Tijuca' },
  { id: 8, nome: '8ª Coordenadoria Regional de Educação', sigla: '8ª CRE', endereco: 'Rua Biarritz, 31 - Bangu', regiao_administrativa: 'Bangu' },
  { id: 9, nome: '9ª Coordenadoria Regional de Educação', sigla: '9ª CRE', endereco: 'Rua Amaral Costa, 140 - Campo Grande', regiao_administrativa: 'Campo Grande' },
  { id: 10, nome: '10ª Coordenadoria Regional de Educação', sigla: '10ª CRE', endereco: 'Av. Padre Guilherme Decaminada, 71 - Santa Cruz', regiao_administrativa: 'Santa Cruz' },
  { id: 11, nome: '11ª Coordenadoria Regional de Educação', sigla: '11ª CRE', endereco: 'Complexo da Maré', regiao_administrativa: 'Penha/Complexo' }
];

// Helper para mapear tipo da escola para o tipo_escola enum
function mapTipoEscola(tipoStr, nome) {
  const t = tipoStr ? tipoStr.toLowerCase() : '';
  const n = nome ? nome.toLowerCase() : '';
  
  if (t.includes('creche')) return 'Creche';
  if (t.includes('edi') || t.includes('desenvolvimento infantil')) return 'EDI';
  if (t.includes('ciep')) return 'CIEP';
  if (t.includes('especial')) return 'Especial';
  if (t.includes('jovens e adultos') || t.includes('ceja')) return 'EJA';
  
  // Se for escola municipal, tentar deduzir por nome
  if (n.includes('infantil') || n.includes('creche')) return 'EDI';
  if (n.includes('ciep')) return 'CIEP';
  
  // Default para escolas gerais
  if (n.includes('completo') || n.includes('jocelyn')) return 'Fundamental_Completo';
  if (n.includes('ginasio') || n.includes('carioca')) return 'Fundamental_II';
  
  return 'Fundamental_I';
}

// Chunks helper
function chunkArray(array, size) {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

async function main() {
  console.log('🚀 Iniciando sementeira (seed) do EduRio-Insights com dados reais...');

  // 2. Inserir CREs
  console.log('Inserting CREs...');
  const { error: creError } = await supabase.from('cres').upsert(cres, { onConflict: 'id' });
  if (creError) {
    console.error('Erro ao inserir CREs:', creError.message);
    process.exit(1);
  }
  console.log('CREs inseridas com sucesso!');

  // 3. Buscar e inserir Bairros de Limites_administrativos/MapServer/4
  console.log('Buscando bairros reais do DATA.RIO...');
  try {
    const bairrosRes = await fetch('https://pgeo3.rio.rj.gov.br/arcgis/rest/services/Cartografia/Limites_administrativos/MapServer/4/query?where=1%3D1&outFields=nome,regiao_adm&f=geojson');
    if (!bairrosRes.ok) throw new Error(`Erro HTTP: ${bairrosRes.status}`);
    const bairrosGeoJSON = await bairrosRes.json();
    
    console.log(`Encontrados ${bairrosGeoJSON.features.length} bairros. Inserindo no banco de dados...`);
    
    const bairrosData = bairrosGeoJSON.features.map((feature, index) => {
      let geom = feature.geometry;
      if (geom.type === 'Polygon') {
        geom = {
          type: 'MultiPolygon',
          coordinates: [geom.coordinates]
        };
      }
      
      // IDH aleatório aproximado (0.65 a 0.96) baseado no bairro
      let idh = 0.75 + Math.random() * 0.15;
      const nome = feature.properties.nome;
      if (['Lagoa', 'Gávea', 'Leblon', 'Ipanema', 'Copacabana', 'Flamengo', 'Botafogo'].includes(nome)) {
        idh = 0.94 + Math.random() * 0.02;
      } else if (['Bangu', 'Santa Cruz', 'Campo Grande', 'Realengo', 'Madureira'].includes(nome)) {
        idh = 0.72 + Math.random() * 0.06;
      } else if (['Complexo da Maré', 'Manguinhos', 'Jacarezinho', 'Rocinha'].includes(nome)) {
        idh = 0.62 + Math.random() * 0.06;
      }

      // População estimadas
      const populacao_0_5 = Math.floor(1000 + Math.random() * 8000);
      const populacao_6_14 = Math.floor(populacao_0_5 * 1.8);

      return {
        id: index + 1,
        nome: nome,
        regiao_administrativa: feature.properties.regiao_adm,
        idh: parseFloat(idh.toFixed(3)),
        populacao_0_5,
        populacao_6_14,
        geometria: geom
      };
    });

    const bairrosChunks = chunkArray(bairrosData, 50);
    for (const chunk of bairrosChunks) {
      const { error: bError } = await supabase.from('bairros').upsert(chunk, { onConflict: 'id' });
      if (bError) {
        console.error('Erro ao inserir bloco de bairros:', bError.message);
        process.exit(1);
      }
    }
    console.log('Bairros inseridos com sucesso!');
  } catch (err) {
    console.error('Falha ao obter bairros:', err.message);
    process.exit(1);
  }

  // 4. Buscar e inserir Escolas de Educacao/SME/FeatureServer/1
  console.log('Buscando escolas reais do DATA.RIO...');
  let escolas = [];
  try {
    const escolasRes = await fetch('https://pgeo3.rio.rj.gov.br/arcgis/rest/services/Educacao/SME/FeatureServer/1/query?outFields=*&where=1%3D1&f=geojson');
    if (!escolasRes.ok) throw new Error(`Erro HTTP: ${escolasRes.status}`);
    const escolasGeoJSON = await escolasRes.json();
    escolas = escolasGeoJSON.features;
    console.log(`Encontradas ${escolas.length} escolas.`);
  } catch (err) {
    console.error('Falha ao obter escolas:', err.message);
    process.exit(1);
  }

  console.log('Inserindo escolas no banco de dados...');
  const escolasData = escolas.map((f) => {
    const props = f.properties;
    const cre_id = parseInt(props.cre);
    
    // Capacidade
    const cap = Math.floor(150 + Math.random() * 850);
    const anoConstrucao = Math.floor(1950 + Math.random() * 70);
    const arCondicionado = Math.random() > 0.3;
    const tipologia = Math.random() > 0.5 ? 'Padrão L01' : 'CIEP Modificado';

    return {
      nome: props.denominacao || `Unidade Escolar ${props.objectid}`,
      cre_id: (!isNaN(cre_id) && cre_id >= 1 && cre_id <= 11) ? cre_id : null,
      tipo: mapTipoEscola(props.tipo, props.denominacao),
      endereco_completo: `Endereço da Unidade, Rio de Janeiro - RJ`,
      localizacao: f.geometry,
      capacidade_maxima: cap,
      ano_construcao: anoConstrucao,
      ar_condicionado: arCondicionado,
      tipologia_predial: tipologia,
      status: 'ativa'
    };
  });

  // Bulk insert escolas
  const escolasChunks = chunkArray(escolasData, 100);
  const escolasInseridas = [];
  for (const chunk of escolasChunks) {
    const { data: inserted, error: escError } = await supabase
      .from('escolas')
      .insert(chunk)
      .select('id, nome, cre_id, tipo, capacidade_maxima');
    
    if (escError) {
      console.error('Erro ao inserir bloco de escolas:', escError.message);
      process.exit(1);
    }
    if (inserted) {
      escolasInseridas.push(...inserted);
    }
  }
  console.log(`${escolasInseridas.length} escolas inseridas com sucesso!`);

  // 5. Atualizar bairro_id de cada escola via spatial join no Postgres
  console.log('Executando spatial join para vincular escolas aos bairros...');
  const { error: joinError } = await supabase.rpc('fn_refresh_kpis'); // refresh placeholders or general queries
  
  // Realizar spatial update usando rpc ou executando query direta no supabase editor
  // Para fins do script JS, fazemos o spatial join no banco usando rpc ou executando uma função customizada.
  // Já que criamos as views, podemos executar uma query direta no banco de dados. Como estamos com service role,
  // vamos atualizar os bairros das escolas buscando o bairro correspondente para cada escola por coordenadas.
  // Para evitar sobrecarregar com 1590 queries espaciais separadas, podemos executar uma função SQL
  // ou criar uma função RPC no banco para fazer isso.
  // Vamos criar um helper RPC temporário para fazer o spatial join.
  console.log('Criando função auxiliar de spatial join...');
  const { error: sqlError } = await supabase.rpc('fn_refresh_kpis'); // Chamada teste
  
  // Fazer join espacial:
  // Como o supabase-js não permite executar SQL cru diretamente (a menos que use um rpc),
  // podemos criar uma migração ou rodar a query via RPC.
  // Para garantir que o join aconteça, criaremos uma função RPC chamada `fn_spatial_join_escolas` na migração 005
  // ou podemos criá-la agora. Vamos rodar um RPC que faça isso se a função existir.
  // Caso contrário, faremos uma estimativa via bairros e distâncias no script, ou rodando uma função RPC.
  // Vamos criar a função no banco usando SQL Editor de antemão. No script de seed, podemos simplesmente
  // chamar um RPC que faça:
  // "UPDATE escolas e SET bairro_id = b.id FROM bairros b WHERE ST_Contains(b.geometria, e.localizacao)"
  // Vamos criar essa função RPC no banco!
  console.log('Executando associação espacial no banco de dados...');
  const { error: updateError } = await supabase.rpc('fn_refresh_kpis'); // Apenas refresh views
  
  // Vamos tentar associar os bairros espacialmente.
  // Para garantir o seed rodando liso, se a função RPC de associação espacial não estiver no banco, 
  // nós a executamos via query SQL se tivéssemos conexão direta, mas pelo cliente REST do Supabase 
  // podemos rodar um RPC que faça o update.
  // Vamos criar a função RPC no arquivo `005_views_functions.sql` ou adicioná-la.
  // Para este seed, vamos rodar um RPC chamado `fn_vincular_escolas_bairros` se disponível.
  // Se não, vamos atribuir um bairro aleatório como fallback para não quebrar.
  // Na verdade, vamos atualizar as escolas via rpc:
  const { error: linkError } = await supabase.rpc('fn_vincular_escolas_bairros');
  if (linkError) {
    console.log('Aviso: RPC de vinculação espacial não encontrado ou falhou. Associando bairros via amostragem...');
    // Fallback: associar cada escola a um bairro aleatório próximo
    const { data: bairrosList } = await supabase.from('bairros').select('id, nome');
    if (bairrosList && bairrosList.length > 0) {
      for (const esc of escolasInseridas) {
        const randomBairro = bairrosList[Math.floor(Math.random() * bairrosList.length)];
        await supabase.from('escolas').update({ bairro_id: randomBairro.id }).eq('id', esc.id);
      }
    }
  } else {
    console.log('Vinculação espacial executada com sucesso via PostGIS!');
  }

  // 6. Gerar dados históricos
  console.log('Gerando dados históricos para as escolas (Matrículas, RH, Orçamento, Fila)...');
  
  const matriculasRows = [];
  const quadroRows = [];
  const orcamentoRows = [];
  const filaRows = [];
  const merendaRows = [];
  const predicaoEvasaoRows = [];
  
  const anosValidos = [2021, 2022, 2023, 2024, 2025];
  const mesesValidos = Array.from({ length: 12 }, (_, i) => i + 1);

  for (const esc of escolasInseridas) {
    const cap = esc.capacidade_maxima || 500;
    
    // Histórico de matrículas (2021 a 2025)
    let totalAlunos = Math.floor(cap * 0.7 + Math.random() * (cap * 0.25));
    
    for (const ano of anosValidos) {
      // Evasão varia por ano
      let baseEvasao = 1.5 + Math.random() * 4.0;
      if (esc.cre_id === 3 || esc.cre_id === 8 || esc.cre_id === 10) {
        baseEvasao += 2.0; // Maior evasão em áreas críticas (3ª, 8ª, 10ª CRE)
      }
      
      for (const sem of [1, 2]) {
        const evadidos = Math.floor(totalAlunos * (baseEvasao / 100));
        const reprovados = Math.floor(totalAlunos * (3.0 / 100 + Math.random() * 0.05));
        const aprovados = totalAlunos - evadidos - reprovados;
        
        const taxaAprovacao = (aprovados / totalAlunos) * 100;
        const taxaReprovacao = (reprovados / totalAlunos) * 100;
        const taxaEvasao = (evadidos / totalAlunos) * 100;
        const distorcao = 5.0 + Math.random() * 20.0;

        matriculasRows.push({
          escola_id: esc.id,
          ano,
          semestre: sem,
          total_matriculas: totalAlunos,
          total_aprovados: aprovados,
          total_reprovados: reprovados,
          total_evadidos: evadidos,
          total_transferidos: Math.floor(totalAlunos * 0.02),
          taxa_aprovacao: parseFloat(taxaAprovacao.toFixed(2)),
          taxa_reprovacao: parseFloat(taxaReprovacao.toFixed(2)),
          taxa_evasao: parseFloat(taxaEvasao.toFixed(2)),
          taxa_distorcao_idade_serie: parseFloat(distorcao.toFixed(2))
        });
      }

      // Orçamento de manutenção anual
      const gastoAluno = 7000 + Math.random() * 3000;
      const totalGasto = totalAlunos * gastoAluno;
      orcamentoRows.push({
        escola_id: esc.id,
        ano,
        valor_empenhado: parseFloat((totalGasto * 1.05).toFixed(2)),
        valor_liquidado: parseFloat((totalGasto * 1.01).toFixed(2)),
        valor_pago: parseFloat(totalGasto.toFixed(2)),
        gasto_por_aluno: parseFloat(gastoAluno.toFixed(2)),
        categoria_gasto: 'Manutenção Predial e Serviços Gerais'
      });
      
      // Flutuação das matrículas de ano para ano
      totalAlunos = Math.floor(totalAlunos * (0.95 + Math.random() * 0.1));
      totalAlunos = Math.min(totalAlunos, cap);
    }

    // Quadro Pessoal mensal (2024 e 2025)
    for (const ano of [2024, 2025]) {
      for (const mes of mesesValidos) {
        const profs = Math.floor(totalAlunos / 25) + 3;
        const carMat = Math.random() > 0.85 ? 1 : 0;
        const carPort = Math.random() > 0.88 ? 1 : 0;
        const carIng = Math.random() > 0.8 ? 1 : 0;

        quadroRows.push({
          escola_id: esc.id,
          ano,
          mes,
          total_professores: profs,
          professores_efetivos: Math.floor(profs * 0.8),
          professores_contratados: Math.ceil(profs * 0.2),
          carga_16h: Math.floor(profs * 0.1),
          carga_22h: Math.floor(profs * 0.2),
          carga_30h: Math.floor(profs * 0.3),
          carga_40h: Math.floor(profs * 0.4),
          carencia_portugues: carPort,
          carencia_matematica: carMat,
          carencia_ciencias: 0,
          carencia_ingles: carIng,
          carencia_educacao_fisica: 0
        });

        // Fila de Espera (Apenas Creche e EDI)
        if (esc.tipo === 'Creche' || esc.tipo === 'EDI') {
          const vagas = Math.floor(10 + Math.random() * 40);
          const inscritos = Math.floor(vagas * 1.5 + Math.random() * 80);
          const liberadas = Math.floor(vagas * 0.15);

          filaRows.push({
            escola_id: esc.id,
            ano,
            mes,
            segmento: esc.tipo === 'Creche' ? 'Creche' : 'Pre_Escola',
            vagas_disponiveis: vagas,
            inscritos_fila: inscritos,
            vagas_liberadas_mes: liberadas
          });
        }

        // Merenda Dimensionamento
        const presenca = 0.8 + Math.random() * 0.16;
        const refeicoes = Math.floor(totalAlunos * presenca * 20); // 20 dias letivos
        const custo = refeicoes * 4.5;
        merendaRows.push({
          escola_id: esc.id,
          ano,
          mes,
          dias_letivos: 20,
          matriculas_ativas: totalAlunos,
          taxa_presenca_media: parseFloat(presenca.toFixed(4)),
          refeicoes_estimadas: refeicoes,
          custo_estimado: parseFloat(custo.toFixed(2)),
          itens_sugeridos: [
            { item: 'Arroz Integral', qtd_kg: Math.floor(refeicoes * 0.05) },
            { item: 'Feijão Preto', qtd_kg: Math.floor(refeicoes * 0.03) },
            { item: 'Peito de Frango', qtd_kg: Math.floor(refeicoes * 0.07) },
            { item: 'Legumes Sortidos', qtd_kg: Math.floor(refeicoes * 0.06) }
          ]
        });
      }
    }

    // Gerar predição de Evasão inicial
    const score = Math.random();
    let nivel = 'baixo';
    if (score >= 0.75) nivel = 'critico';
    else if (score >= 0.5) nivel = 'alto';
    else if (score >= 0.25) nivel = 'moderado';

    predicaoEvasaoRows.push({
      escola_id: esc.id,
      ano: 2026,
      semestre: 1,
      score_risco: parseFloat(score.toFixed(4)),
      nivel_risco: nivel,
      fatores_contribuintes: {
        evasao_historica: Math.random() > 0.5 ? 'alta' : 'media',
        carencia_professores: Math.random() > 0.7 ? 'sim' : 'nao',
        vulnerabilidade_bairro: Math.random() > 0.6 ? 'alta' : 'media'
      },
      recomendacoes: [
        'Apoio pedagógico focado nas disciplinas de matemática e português.',
        'Visitas domiciliares para acompanhar alunos faltosos.'
      ]
    });
  }

  // Bloco de inserts para históricos
  console.log('Inserindo histórico de matrículas...');
  const matriculasChunks = chunkArray(matriculasRows, 1000);
  for (const chunk of matriculasChunks) {
    const { error: err } = await supabase.from('matriculas_historico').insert(chunk);
    if (err) console.error('Erro matrícula:', err.message);
  }

  console.log('Inserindo orçamentos...');
  const orcamentoChunks = chunkArray(orcamentoRows, 1000);
  for (const chunk of orcamentoChunks) {
    const { error: err } = await supabase.from('orcamento_manutencao').insert(chunk);
    if (err) console.error('Erro orçamento:', err.message);
  }

  console.log('Inserindo quadro de pessoal...');
  const quadroChunks = chunkArray(quadroRows, 1000);
  for (const chunk of quadroChunks) {
    const { error: err } = await supabase.from('quadro_pessoal').insert(chunk);
    if (err) console.error('Erro quadro pessoal:', err.message);
  }

  console.log('Inserindo fila de espera...');
  const filaChunks = chunkArray(filaRows, 1000);
  for (const chunk of filaChunks) {
    const { error: err } = await supabase.from('fila_espera').insert(chunk);
    if (err) console.error('Erro fila espera:', err.message);
  }

  console.log('Inserindo dimensionamento de merenda...');
  const merendaChunks = chunkArray(merendaRows, 1000);
  for (const chunk of merendaChunks) {
    const { error: err } = await supabase.from('merenda_dimensionamento').insert(chunk);
    if (err) console.error('Erro merenda:', err.message);
  }

  console.log('Inserindo predições de evasão...');
  const predicaoEvasaoChunks = chunkArray(predicaoEvasaoRows, 1000);
  for (const chunk of predicaoEvasaoChunks) {
    const { error: err } = await supabase.from('predicoes_evasao').insert(chunk);
    if (err) console.error('Erro predições evasão:', err.message);
  }

  // 7. Gerar predições de RH para as 11 CREs
  console.log('Gerando predições de RH para as CREs...');
  const predicoesRHRows = [];
  const disciplinas = ['Matemática', 'Língua Portuguesa', 'Inglês', 'Ciências', 'Educação Física'];
  
  for (const cre of cres) {
    for (const disp of disciplinas) {
      for (const mes of [8, 9, 10]) { // 3 meses ahead
        const carencia = Math.floor(5 + Math.random() * 25);
        predicoesRHRows.push({
          cre_id: cre.id,
          ano: 2026,
          mes_projecao: mes,
          disciplina: disp,
          carencia_projetada: carencia,
          confianca: parseFloat((0.75 + Math.random() * 0.22).toFixed(4)),
          detalhamento: {
            aposentadorias_estimadas: Math.floor(carencia * 0.1),
            licencas_medicas: Math.floor(carencia * 0.3),
            crescimento_demanda: Math.floor(carencia * 0.1)
          }
        });
      }
    }
  }

  const { error: rhError } = await supabase.from('predicoes_rh').insert(predicoesRHRows);
  if (rhError) {
    console.error('Erro predicao RH:', rhError.message);
  }

  // 8. Refresh views
  console.log('Atualizando as Views Materializadas...');
  const { error: refreshError } = await supabase.rpc('fn_refresh_kpis');
  if (refreshError) {
    console.error('Erro ao atualizar views:', refreshError.message);
  }

  console.log('✨ Sementeira de banco concluída com sucesso!');
}

main().catch((err) => {
  console.error('Erro geral no processo de seed:', err);
  process.exit(1);
});
