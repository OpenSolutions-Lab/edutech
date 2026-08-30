## [EXPANSÃO DE ESCOPO] Integração Intersetorial: Inteligência Educacional & Desenvolvimento Econômico (SME + SMDEIS Rio)

### 1. Objetivo da Integração
Enriquecer a plataforma conectando os dados da Secretaria de Educação (SME) com os indicadores da Secretaria de Desenvolvimento Econômico, Inovação e Simplificação (SMDEIS) obtidos no DATA.RIO. O objetivo é correlacionar o desempenho, a evasão e a demanda por vagas escolares com a atividade econômica, empregabilidade e o desenvolvimento urbano dos bairros e Regiões Administrativas (RAs) do Rio de Janeiro.

### 2. Infraestrutura de Banco de Dados Avançada (Supabase + PostGIS)
Implementar as seguintes tabelas e relacionamentos geográficos no Supabase:
1. **Tabela `smdeis_bairros_economia`:**
   - `id`: uuid (primary key)
   - `codigo_bairro`: varchar (chave de integração com a malha digital do Rio)
   - `nome_bairro`: varchar
   - `regiao_administrativa`: varchar (ex: 'RA XVIII - Campo Grande')
   - `taxa_emprego_formal`: numeric
   - `empresas_ativas_total`: integer
   - `setor_predominante`: varchar (ex: 'Tecnologia', 'Logistica', 'Servicos', 'Comercio')
   - `novos_licenciamentos_imobiliarios`: integer (indicador de adensamento urbano)
   - `geom_bairro`: geometry(Polygon, 4326) (polígono geográfico do bairro para consultas PostGIS)

2. **Chave de Integração Territorial (Query Base):**
   - Garantir que as consultas cruzem `escolas.latitude` e `escolas.longitude` (convertidos em `ST_SetSRID(ST_MakePoint(long, lat), 4326)`) com `smdeis_bairros_economia.geom_bairro` usando a função `ST_Contains` do PostGIS, ou via código de bairro correspondente.

### 3. Implementação dos Novos Insights por Camada

#### Camada 1: Modelos Preditivos de IA (Evasão e Vagas)
1. **Risco de Abandono por Pressão Econômica:** Atualizar o algoritmo de risco de evasão (Ensino Fundamental II e EJA) para incluir as variáveis `taxa_emprego_formal` e oscilações do comércio local do bairro. Áreas com queda de atividade econômica devem disparar alertas de vulnerabilidade financeira familiar.
2. **Preditor de Demanda por Adensamento:** Criar um modelo que utilize a variável `novos_licenciamentos_imobiliarios` da SMDEIS para projetar o aumento na busca por matrículas em creches e EDIs naquela coordenada geográfica nos próximos 24 meses.

#### Camada 2: Geoprocessamento Avançado (Mapas com Overlays)
1. **Camada de Vazios de Cuidado Infantil:** No mapa interativo, criar um filtro de sobreposição (Overlay) que cruze a fila de espera de creches com o mapa de calor de bairros onde há maior concentração de trabalhadoras formais e microempreendedoras (MEIs), priorizando a expansão de vagas para mães que trabalham.
2. **Hubs de Inovação e Escolas:** Mapear a proximidade das escolas de tempo integral e dos Ginásios Educacionais Tecnológicos (GET) com os polos econômicos estratégicos em expansão (ex: Porto Maravalley, hubs de tecnologia ou distritos industriais).

#### Camada 3: BI e Dashboards Gerenciais Intersetoriais
1. **Painel de Retorno Socioeconômico:** Criar gráficos no Recharts correlacionando o Índice de Desenvolvimento Escolar (Ideb/Ideb-Rio) com o crescimento de empresas e renda do bairro a longo prazo.
2. **Módulo de Contextualização do Planejador Pedagógico (IA/RAG):** 
   - Modificar a Server Action `generateLessonPlan` para que, além do Currículo Carioca, a IA receba o `setor_predominante` econômico do entorno da escola.
   - O prompt do LLM deve ser instruído a contextualizar os planos de aula de ciências e matemática com problemas reais daquela economia local (ex: logística na Zona Norte, tecnologia na Região Portuária, turismo na Zona Sul).

### 4. Fluxo de Trabalho e Mock de Dados no Antigravity
1. Escrever o script de migração SQL para criar a tabela de dados econômicos e habilitar as queries geográficas.
2. Criar dados simulados (mock data) ultra-realistas conectando bairros específicos (ex: Campo Grande com alto licenciamento imobiliário, Porto com setor predominante de Tecnologia, Bangu com forte comércio local).
3. Atualizar os componentes de visualização da interface do usuário para suportar os novos filtros intersetoriais na barra lateral do painel.
4. Validar o fluxo gerando um plano de aula contextualizado para uma escola do Porto (deve conter referências a tecnologia/inovação) e outro para a Zona Oeste (deve focar em urbanismo ou comércio).
