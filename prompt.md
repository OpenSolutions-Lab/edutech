# Projeto: EduRio-Insights (Plataforma Omnicanal de Inteligência Educacional - SME Rio)

## 1. Contexto e Objetivo Geral
Você é um Engenheiro de Software Full-Stack Sênior e Cientista de Dados atuando no Google Antigravity. O objetivo é construir do zero a plataforma "EduRio-Insights", um sistema robusto baseado nos Dados Abertos da Secretaria Municipal de Educação (SME) do Rio de Janeiro (DATA.RIO e Datalake municipal). 

A plataforma deve unir Inteligência Artificial Preditiva, Análise Geoespacial e Dashboards Gerenciais Dinâmicos em uma única SPA (Single Page Application) moderna, performática e responsiva.

## 2. Stack Tecnológica Obrigatória
- **Frontend:** Next.js (App Router), React, TailwindCSS, Shadcn/ui, Lucide React.
- **Gráficos e Mapas:** Recharts (para BI) e React-Map-GL / Mapbox GL (para geoprocessamento).
- **Backend / Serverless:** Next.js Server Actions e API Routes.
- **Banco de Dados & Auth:** Supabase (PostgreSQL) com extensões PostGIS (para dados geográficos) e pgvector (para IA).
- **Modelagem de IA/Estatística:** Scripts em Python (executados via ambiente local do Antigravity) para processar os dados brutos e gerar os coeficientes/modelos preditivos que serão salvos no Supabase.
- **Deploy:** Configurado para Vercel (Edge-ready).

## 3. Arquitetura de Dados (Supabase + PostGIS)
Crie as migrações SQL no Supabase para as seguintes tabelas estruturadas:
- `escolas`: id, nome, cre, tipo (Creche, EDI, Fundamental), endereco, latitude, longitude (Geometry/PostGIS), capacidade, ar_condicionado (boolean).
- `matriculas_historico`: id, escola_id, ano, total_alunos, taxa_aprovacao, taxa_reprovacao, taxa_evasao, idh_bairro.
- `quadro_pessoal`: id, escola_id, total_professores, carga_16h, carga_22h, carga_30h, carga_40h, carencia_estimada.
- `orcamento_manutencao`: id, escola_id, ano, valor_empenhado, valor_pago, gasto_por_aluno.

## 4. Requisitos das Três Camadas do Sistema

### Camada 1: Modelos Preditivos de IA
1. **Alerta Precoce de Evasão:** Criar uma função de regressão/classificação (ou mock matemático baseado em lógica fuzzy no Next.js caso o script python dependa de bibliotecas externas pesadas) que calcule o "Score de Risco de Abandono" por escola, correlacionando o histórico de evasão, IDH da região e taxas de reprovação.
2. **Previsão de Carência de RH:** Tela que projete os meses críticos de falta de professores por Coordenadoria Regional de Educação (CRE).
3. **Dimensionamento de Merenda:** Algoritmo que calcule a previsão de insumos alimentares com base no número de matrículas ativas vs. taxa de presença média histórica da unidade.

### Camada 2: Análise Geográfica (Geoprocessamento)
1. **Mapa Interativo (Mapbox/Leaflet):** Plotar todas as escolas da rede SME com clusters por CRE.
2. **Identificador de Vazios Educacionais:** Camada visual no mapa indicando bairros com alta densidade demográfica infantil, mas baixa cobertura de vagas (Creches/EDIs).
3. **Filtros Avançados:** Permitir filtrar escolas por vulnerabilidade, falta de professores e necessidade de climatização (reformas prediais).

### Camada 3: Dashboards de Business Intelligence (BI)
1. **Painel Executivo:** Cards com KPI de custo médio por aluno, taxa de evasão consolidada da cidade e total de vagas ociosas.
2. **Ranking de Vulnerabilidade:** Tabela interativa com paginação e busca, classificando as escolas pelo Índice de Vulnerabilidade Escolar (IVE) calculado pelo sistema.
3. **Fila de Espera Transparente:** Gráfico de linhas demonstrando a evolução da fila de vagas ao longo dos meses por região administrativa.

## 5. Fluxo de Trabalho para o Antigravity (Fases AG Kit)
Siga rigorosamente as fases do ciclo de desenvolvimento do Antigravity:
1. **EXPLORE:** Vasculhe o diretório para planejar a estrutura de pastas do Next.js (App Router).
2. **PLAN:** Apresente para mim o design das tabelas do Supabase e o layout proposto das telas antes de codificar.
3. **IMPLEMENT:** Escreva código limpo em TypeScript. Use Server Actions para consultar o Supabase. Crie componentes Shadcn/ui modulares e isolados.
4. **VERIFY:** Execute testes de renderização ou utilize o navegador integrado do Antigravity para testar os estados da aplicação, interações e responsividade.
5. **DEPLOY:** Prepare o arquivo `vercel.json` e garanta que o projeto esteja pronto para ser buildado no ambiente da Vercel sem erros de tipagem.

## 6. Instruções de Inicialização
- Inicie instalando o Next.js, TailwindCSS e o cliente do Supabase (`@supabase/supabase-js`).
- Crie mock data ultra-realistas baseados na estrutura real da Prefeitura do Rio (ex: nomes de bairros como Campo Grande, Bangu, Maré, Copacabana, e as divisões reais de 1ª a 11ª CRE) dentro de um script de semente (seed) do Supabase para podermos testar imediatamente sem depender da chave de API de produção do DATA.RIO.
- Ative o modo auto-execução controlado, solicitando minha revisão apenas antes de rodar os scripts de banco de dados.

Vamos decolar. Comece a fase EXPLORE e apresente a estrutura inicial do projeto.
