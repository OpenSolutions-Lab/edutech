# 00 — ÍNDICE / VISÃO GERAL DOS REQUISITOS — Projeto EduTech

> **Projeto:** EduTech / "Match Perfeito" — Inteligência na Inscrição de Creche (SME-Rio)
> **Fonte do desafio:** Hackathon SME-Rio + Rio Impact Lab 2026 (Claude Impact Lab Rio 2)
> **Armazenado em:** `/home/traluog/Documentos/Projects/edutech/requisitos/`
> **Status:** Fases 1–3 da orquestração concluídas; Fase 4 (desenvolvimento via opencode) em execução.

Este diretório consolida TUDO que foi criado, analisado e gerado até aqui (requisitos, spec,
tasks, decisão do júri, dados reais e soluções de IA). Cada fase da pipeline de orquestração
tem seu artefato documentado.

## Documentos neste diretório

| # | Arquivo | Conteúdo | Fase da pipeline |
| --- | --- | --- | --- |
| 00 | `00_README_INDEX.md` | Este índice | — |
| 01 | `01_entendimento_do_problema.md` | Dores, eixos do desafio e problemas a resolver | Análise (pré-Fase 1) |
| 02 | `02_requisitos_funcionais_completos.md` | Documento de requisitos (objetivo, módulos, funcionalidades, regras, não-funcionais, premissas, lacunas) | Fase 1 — requirements-distillation |
| 03 | `03_decisao_juridica_the_jury.md` | Veredito do júri (escopo do MVP) + tally determinístico | Fase 2 — the-jury |
| 04 | `04_spec_mapa_oferta_demanda.md` | Spec técnica do núcleo (EARS, REQ-001..005, ACs) — validada pelos gates | Fase 3 — tlc-spec-driven |
| 05 | `05_tasks_mvp.md` | Tasks atômicas T1..T7 (4 fases, dependências, testes/gates) — validada | Fase 3 — tlc-spec-driven |
| 06 | `06_analise_dados_reais.md` | Achados sobre os dados reais (contagens, duplicidade, saldo oferta×demanda) | Análise de dados reais |
| 07 | `07_solucoes_ia_ml_arquitetura.md` | Soluções de IA/ML, arquitetura (Vercel/Supabase/Mapbox), DATA.RIO e reuso do claude-impact-lab | Consolidação |

## Onde estão os artefatos originais no projeto
- `docs/requirements.md` — documento de requisitos (fonte do 02)
- `.specs/features/mapa-oferta-demanda/spec.md` e `tasks.md` — spec + tasks (fonte do 04 e 05)
- `analytics/inscricoes_agregadas.json`, `unidades_geo.json`, `insights.md` — análise de dados reais
- `data/inscricoes/` — bases reais do desafio (CIT-SME-RJ/dadoscreche)
- `scripts/analise_creche.py`, `scripts/gera_unidades_geo.py` — pipeline real
- `app/` — MVP (em desenvolvimento via opencode, Fase 4)

## Resumo executivo
- **Problema:** a rede de creches da SME-Rio (600 mil alunos, 1.560 escolas, +300 creches) tem
  **vagas ociosas E filas longas** — a fila é de **preferência territorial/turno**, não de
  escassez global. Uma criança pode segurar até 5 vagas por CPF, e a convocação é manual e lenta.
- **Dados reais:** 5 processos (2021–2025), 837.179 opções, ~343 mil inscrições, ~260 mil crianças,
  872 unidades — base anonimizada fornecida no desafio.
- **Escopo do MVP (decisão do júri):** profundidade no motor de classificação por CPF + Mapa de
  Oferta×Demanda + Copilot RAG (A), acrescido da simulação de automação de convocação (C).
- **Arquitetura:** Next.js (Vercel) + Supabase (Postgres/PostGIS/pgvector) + Mapbox + Anthropic.