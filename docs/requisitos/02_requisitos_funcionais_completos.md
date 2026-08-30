# Documento de Requisitos — EduTech / "Match Perfeito" (Inscrição de Creche SME-Rio)

> Fonte: Hackathon SME-Rio + Rio Impact Lab 2026 — Entrevista com stakeholder (SME-Rio),
> Briefing e Apresentação oficiais, repositório de dados `taicor-ai/claude-impact-lab-rio-2`,
> e análise do projeto de referência `claude-impact-lab` (EduRio-Insights).
> Status: aprovado (base) — preparado pela fase de requirements-distillation/project-orchestrator.

## 1. Objetivo e valor
- Problema: a rede de creches da SME-Rio (maior da América Latina; 600 mil alunos, 1.560 escolas,
  +300 creches parceiras) tem **vagas ociosas em algumas unidades e filas de espera longas em outras**
  — a fila reflete menos escassez global do que **descompasso entre oferta e demanda por território
  e turno** (fila de "preferência", não de ausência de vaga).
- Para quem: Equipe de Inovação/Tecnologia e Dados da SME-Rio; subsecretária de Inovação (Ana Paula
  Massoneto), gerente de sistemas e dados (Gabi), coordenadorias regionais (11 CREs) e diretores de
  escolas; em última instância, as famílias com crianças de 0 a 3 anos e 11 meses.
- Sucesso mensurável (MVP do desafio): reduzir o tempo médio para preencher uma vaga ociosa
  (hoje >1 semana), reduzir duplicidade de ocupação (uma criança segurando até 5 vagas), e dar
  visibilidade/projecaão de onde abrir vagas. Critério de julgamento do hackathon: **Impacto Real = 40%**,
  Produto=20, Engenharia=20, Ideia=10, Apresentação=10.

## 2. Usuários e papéis
| Papel | Descrição | Permissões |
|-------|-----------|-----------|
| Gestor SME (nível central) | Define métricas, planeja vagas, acompanha rede | Visão executiva global, KPI |
| Coordenadoria Regional (CRE) | 11 territórios; administra matrícula de sua região | Visão por região/território |
| Diretor de unidade | Opera a convocação, confirma matrícula | Painel da unidade, chamada de fila |
| Família/responsável | Inscreve, escolhe unidades, confirma vaga | Portal público, status da inscrição |
| Analista de dados | Limpa dados, monitora filas, monta relatórios | Dashboards + export + RAG |

## 3. Escopo
- **MVP (obrigatório p/ o desafio):** inteligência acionável que responda "quantas vagas abrir e
  onde", "em que ordem chamar a fila" e "como garantir que a família chegue à vaga a tempo" — com
  dados reais 2021–2025.
- **Roadmap (pós-hackathon):** convocação automatizada (WhatsApp/SMS rastreávveis), match
  territorial dinâmico em produção, integração transacional com o sistema oficial.
- **Fora de escopo (explícito):** alterar o sistema oficial de cadastro/classificação da prefeitura
  (a solução é analítica/demonstrativa); acesso a dados sensíveis reais (usar anonimizados).

## 4. Módulos / áreas funcionais
- Módulo 1 — Planejamento de Vagas (Eixo 1): projeção de demanda territorial.
- Módulo 2 — Inspeção & Classificação (Eixo 2): análise da lógica de escolha/classificação por CPF.
- Módulo 3 — Convocação (Eixo 3): automação/rastreio e priorização da chamada.
- Módulo 4 — Painel do Gestor (BI & Georreferenciamento): dashboards + mapas por CRE/unidade.
- Módulo 5 — Inteligência Conversacional (RAG + IA): copilot para gestores explicar/explorar.

## 5. Funcionalidades (comportamento observável + aceite)
### F-001 — Mapa de descompasso oferta x demanda (territorial)
- Ação: visualizar por CRE/microárea as unidades com vagas ociosas vs filas longas, por turno/grupamento.
- Resultado: mapa (Mapbox/deck.gl) com camadas coloridas por saldo de vagas.
- Aceite: ao filtrar por CRE, os pontos refletem os saldos calculados dos dados do processo;
  tooltip mostra unidade, grupamento, turno, fila e vagas.
### F-002 — Simulador de planejamento de vagas
- Ação: ver "quantas vagas abrir e onde" com base em projeção de demanda + regra atual de pontuação.
- Resultado: recomendação por unidade/território (abrir X vagas em berçário integral em microárea Y).
- Aceite: usa dados de inscrições + socioeconômicos 2021–2025; aplica a régua de pontuação vigente.
### F-003 — Painel de fila e tempo de espera
- Ação: acompanhar fila remanescente, taxa de conversão por unidade e tempo de espera por status.
- Resultado: KPIs (fila total, vagas ociosas, taxa de atendimento, dias p/ preencher vaga).
- Aceite: métricas computadas da base; destaca situações "Selecionada" sem confirmação além do prazo.
### F-004 — Motor de classificação "por CPF" (anti-duplicidade)
- Ação: detectar e reduzir uma criança segurando múltiplas vagas (até 5) simultaneamente.
- Resultado: sinalizadores de multi-inscrição e recomendações de consolidação da oferta.
- Aceite: identifica %, por processo, de cadastros com >1 opção ativa/Selecionada.
### F-005 — Copilot de Inteligência Educacional (RAG + Anthropic Clauude)
- Ação: gestor pergunta em linguagem natural e recebe síntese com dados reais + visual sugerido.
- Resultado: resposta com diagnóstico territorial e recomendações prescritivas + (mapa/gráfico/tabela).
- Aceite: usa os 4 datasets anonimizados; model fallback (offline heurístico) quando sem API key.
### F-006 — Relatório executivo (PDF)
- Ação: gerar síntese executiva em PDF com indicadores-chave.
- Resultado: documento exportável com KPIs e recomendações (IA).
- Aceite: PDF gerado e baixável, contendo métricas do processo.

## 6. Regras de negócio
- RN-001: Régua de pontuação socioeconômica muda a cada processo (2021–2023, 2024, 2025) — aplicar a
  régua vigente de cada ano; pesos: Cartão Família Carioca/Bolsa Família/deficiência (100), etc.
- RN-002: Uma inscrição ativa por CPF; até 5 opções por inscrição; classificação é por opção hoje.
- RN-003: Convocação: 1 tentativa/dia por 3 dias; família tem 3 dias úteis p/ confirmar; extensão de 1 dia.
- RN-004: Anonimização: sem endereço exato (só bairro/CEP), nascimento só ano-mês, códigos anônimos.
- RN-005: Preferência por um cadastro segurar MÚLTIPLA vagas quebra a alocação (a conatar como anti-gap).

## 7. Requisitos não-funcionais
- RNF-001 (stack/arquitetura): Next.js (App Router) + Tailwind + shadcn/ui; Supabase (Postgres + PostGIS
  + pgvector); Mapbox/react-map-gl/deck.gl; deploy Vercel. Reaproveitar padrões do claude-impact-lab.
- RNF-002 (IA): Anthropic API (claude) com cadeia de fallback de modelos e fallback heurístico offline.
- RNF-003 (dados): integrar DATA.RIO / datalake (Registro Municipal Integrado — docs.dados.rio/rmi),
  microáreas IPP, unidades georreferenciadas (Instituto Longitude), censos, IDH, nascidos vivos (IBGE).
- RNF-004 (privacidade): dados anonimizados; nenhuma exposição de identidade/endereço exato.
- RNF-005 (apresentação): demo pública online + vídeo 60s; pitch de 6min; modelo econômico de custo
  (sugestão: usar modelo intermediário para economizar créditos).

## 8. Premissas (declaradas)
- P-001: Usará os datasets anonimizados de inscrição 2021–2025 (4 tabelas) como fonte primária.
- P-002: A solução é analítica/demonstrativa e não acessa o sistema transacional oficial em produção.
- P-003: Dados reais contêm ruído → toda métrica exige limpeza/validação antes de interpretar.
- P-004: Stack e padrões reaproveitados do `claude-impact-lab` (adaptação, não refazer do zero).
- P-005: Para o hackathon, parte dos elementos pode ter fallback demonstrativo (dado consolidado/mock)
  onde o dado real não estiver completo, desde que explícito.

## 9. Lacunas em aberto (a decidir)
- L-001: Escopo do MVP dentro das 3 eixos → **DECIDIDO PELO JÚRI (the-jury, 2026-08-30):**
  **MVP = A + C** — Profundidade no motor de classificação por CPF (anti-multi-vaga) + Mapa de
  Oferta×Demanda territorial + Copilot RAG, ACRESCENTANDO a simulação de automação de convocação
  (derivada do mesmo motor CPF→vaga; baixo custo, alto valor de "ideia"). Score: A=148 vs B=67
  (confiança HIGH; voto dissidente B por resiliência ao dado ruidoso).
- L-002: "Antecipar demanda" → incluir nascidos vivos (IBGE), IDH/microárea, IDS (SMDEIS) e
  empregabilidade formal como variáveis do índice de pressão de demanda (via IA + validação).
- L-003: Convocação → MVP entrega a SIMULAÇÃO de automação + painel de priorização (não a integração
  WhatsApp/SMS real, que fica pós-pitch).
- L-004: Acesso/permissão de mapa de infraestrutura EDU do DATA.RIO para cruzar (climatização/reformas).
- L-005: Fonte exata dos datasets brutos no repositório do desafio (baixar de CIT-SME-RJ/dadoscreche).

## 9b. Decisão técnica do júri (the-jury — Fase 2 da orquestração)
VEREDITO: MVP = profundidade (motor por CPF + mapa oferta×demanda + copilot RAG) mais a simulação
de automação de convocação (A+C). Confiança HIGH (score 148 vs 67; sem bandwagon).
- Por que (ranked): (1) o motor por CPF ataca a dor mensurável de "1 criança segura até 5 vagas",
  gerando impacto operacional "usável hoje" (Impacto Real=40%); (2) dados reais 2021-25 sustentam as
  2-3 features de ponta a ponta viáveis no timebox; (3) a simulação de convocação é o diferencial de
  menor custo que transforma a fila em fluxo acionável (Ideia=10%); (4) reuso do claude-impact-lab
  (RAG/fallback Anthropic/PostGIS/Mapbox) acelera a entrega sem inflar créditos.
- Voto dissidente (B): cobrir os 3 eixos para resiliência a dado ruidoso e narrativa completa.
- Premissa mais arriscada: a QUALIDADE dos dados reais (ruído) — motor por CPF/RAG podem quebrar na
  demo sem pipeline defensiva de limpeza desde a 1ª hora.
- Teste/primeiro passo: carregar e limpar as 4 tabelas e validar contagens (837 mil opções etc.)
  ANTES de qualquer feature — gate de qualidade de dados.

## 10. Fontes / conhecimento consultado
- Entrevista (Transcript + Résumé) do stakeholder (SME-Rio).
- Briefing_SME.docx.pdf e Apresentação.pdf (eixos, critérios, dados, anonimização).
- README e dados do repositório `taicor-ai/claude-impact-lab-rio-2`.
- Análise do projeto `claude-impact-lab` (EduRio-Insights): RAG/copilot, modelos preditivos, mapas,
  dashboards, relatório PDF, padrão de fallback Anthropic.
- Mnemosyne/wiki: conceitos de RAG, LLMs, arquitetura, vibe coding (conhecimento unificado).