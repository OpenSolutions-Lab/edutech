# 07 — SOLUÇÕES DE IA/ML, ARQUITETURA E ENRIQUECIMENTO DE DADOS

Este documento consolida as soluções propostas para elevar o nível do app, a arquitetura técnica
e o reuso do projeto de referência `claude-impact-lab`, além do enriquecimento com DATA.RIO.

## 1) Problemas → Soluções de IA/ML

| # | Problema (do entendimento) | Solução proposta |
| --- | --- | --- |
| P1 | Onde abrir vagas (planejamento antecipado) | **Modelo preditivo de demanda territorial** (regressão leve XGBoost/LightGBM OU índice ad-hoc) usando série 2021-25 + variáveis externas (nascidos vivos IBGE, IDH/microárea, IDS, densidade infantil, empregabilidade). Saída: "índice de pressão de demanda" por unidade/território. |
| P2 | Uma criança segurando até 5 vagas | **Motor de agregação POR CPF**: recomputar fila agrupando por criança, detectar/sinalizar multi-inscrição ativa (real: 3.935 crianças / 12.498 vagas em 2025) e propor consolidação — camada analítica, sem alterar o sistema oficial. |
| P3 | Ordenar/priorizar a chamada | **Reclassificação por CPF** (não por opção) respeitando a régua vigente de cada ano + **match territorial** (distância bairro→unidade) para preencher vaga com menor perda. |
| P4 | Convocação manual/lenta e invisível | **Painel de priorização de convocação** (sinalizar "Selecionado há X dias sem confirmação", contatos desatualizados) + **simulação de automação** (ordem otimizada). Automação real WhatsApp/SMS → pós-pitch. |
| P5 | Gestor precisa entender/explorar os dados | **Copilot com RAG** (Anthropic Claude): responde em linguagem natural com base nos dados reais, gera síntese executiva + visual sugerido (mapa/gráfico/tabela) + recomendações prescritivas. |

**Escolha de IA (pragmática):** modelos **leves/transparentes** nos indicadores (auditabilidade —
fortalece o critério Engenharia = 20%) + **LLM Anthropic** na camada de síntese/explicação
(copilot, relatório PDF, explicação do "porquê"). Evita dependência de infraestrutura ML pesada.

## 2) Arquitetura (mesma do claude-impact-lab)

- **Frontend/Deploy:** Next.js (App Router) + Tailwind + shadcn/ui · **Vercel**
- **Banco/Auth:** Supabase (PostgreSQL) com **PostGIS** (geo) e **pgvector** (RAG)
- **Mapas:** Mapbox + `react-map-gl`/`deck.gl`
- **IA:** `@anthropic-ai/sdk` com **cadeia de fallback de modelos** + **fallback heurístico offline**
- **Relatório:** `@react-pdf/renderer`

## 3) O que será REAPROVEITADO do claude-impact-lab

Elementos com código pronto para adaptação ao domínio de creche:
- **Copilot RAG** (`src/actions/copilot-agent.ts`) — extrator de entidades + filtro/agregação +
  chain de fallback Anthropic + fallback offline. Perfeito para adaptar.
- **Modelos com fallback** (`evasao-model`, `merenda-model`, `rh-forecast-model`) — padrão
  "heurístico + LLM" reutilizável para o índice de pressão de demanda.
- **Mapas/camadas** (`base-map`, `public-map-viewer`, `vacancy-gaps-layer`, `school-clusters`) —
  base para o Mapa de Oferta×Demanda e "vazios educacionais".
- **Dashboards/BI** (`dashboard-kpis`, `fila-espera`, `predicoes`) — base para KPIs e painel.
- **Relatório executivo PDF** — reutilizar para relatório do domínio de creche.
- **EWS + explicabilidade** (padrão estilo SHAP) — reutilizar o padrão de "explicar o score".
- **Auth Supabase, layout/sidebar, theme** — estrutura pronta.

**O que NÃO se adapta diretamente:** o escopo amplo de escolas fundamentais/IDEB/merenda/RH vira o
domínio específico de **Inscrição Creche**, e o que era **dado fictício** no claude-impact-lab será
substituído pelos **dados reais** anonimizados 2021–2025 (o diferencial do edutech).

## 4) Enriquecimento com DATA.RIO / datalake e outras fontes

- **Registro Municipal Integrado (docs.dados.rio/rmi)** — cruzamentos sociais (CadÚnico, Bolsa
  Família) p/ validar a régua de pontuação automaticamente.
- **Microáreas SME-IPP** (shapefile no repositório) + **unidades georreferenciadas** (Instituto
  Longitude) — para os mapas por território.
- **Nascidos vivos (IBGE)** — `NascidosvivosRJ.xlsx` já no repositório do desafio (referência de
  demanda potencial).
- **IDH/microárea, IDS (SMDEIS) e empregabilidade formal** — variáveis do índice de pressão.
- **Malha de bairros oficiais e infraestrutura educacional** (climatização/reformas) do DATA.RIO.

## 5) Como os dados reais já alimentam o MVP (verificado)

- Pipeline real (`scripts/analise_creche.py`) → `analytics/inscricoes_agregadas.json`
  (contagens batem com o dicionário oficial: soma 837.179 opções).
- Geolocalização real (`scripts/gera_unidades_geo.py`) → `analytics/unidades_geo.json`
  (348/872 unidades com lat/long reais).
- O app consome esses JSONs reais (KPIs, mapa, gráficos, duplicidade, copilot). O copilot respondeu
  com números reais corretos (ANIL fila 1.825; JACAREPAGUÁ 1.387) durante o smoke test.

> **Regra do projeto:** nenhum dado inventado. Toda métrica deriva das bases reais do desafio;
> onde houver falta, declara-se a lacuna (não fabrica).