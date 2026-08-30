# Tasks — Mapa de Oferta × Demanda + Motor CPF (núcleo do MVP)

## Test Coverage Matrix

| Camada | Coberto por | Strategy |
| --- | --- | --- |
| Pipeline de dados (ingestão/limpeza) | T2 | teste de contagem/reconstrução contra dataset de exemplo (ex: 837k opções) |
| Régua de pontuação vigente | T3 | teste unitário por processo (2021-23, 2024, 2025) aplicando o catálogo |
| Saldo oferta×demanda | T4 | teste de agregação por unidade/turno/microárea/CRE |
| Detecção de multi-inscrição | T5 | teste de alerta para >1 opção Ativa/Selecionada por CPF |
| Agregação por CPF / reclassificação | T6 | teste de fila reclassificada por criança |
| Mapa + KPIs | T7 | teste de atualização ao filtrar por CRE/microárea/ano |

## Gate Check Commands

```
python3 .specs/scripts/validate_spec.py .specs/features/mapa-oferta-demanda
python3 .specs/scripts/validate_tasks.py .specs/features/mapa-oferta-demanda
npm run lint
npm run test
```

## Execution Plan

```
### Phase 1 — Base e dados
### T1: ...
### T2: ...
### Phase 2 — Cálculo do núcleo
### T3: ...
### T4: ...
### Phase 3 — Duplicidade e reclassificação
### T5: ...
### T6: ...
### Phase 4 — Visualização
### T7: ...
```

Diagrama de dependências (por fase; setas apontam para a trás/dentro da fase):

```
T1 -> T2
T2 -> T3
T3 -> T4
T3 -> T5
T3 -> T6
T4 -> T7
T5 -> T7
T6 -> T7
```

## Task Breakdown

### T1: Criar base de dados Supabase e camadas de acesso
**Depends on:** none
**Where:** supabase/migrations/011_creche_tables.sql
**Tests:** rodar migrations num Supabase local de teste; tabelas criadas e RLS habilitado.
**Gate:** `supabase db reset` aplica migrações sem erro; `select count(*)` nas tabelas vazias retorna 0.

### T2: Pipeline de ingestão/limpeza das 4 tabelas (2021-2025)
**Depends on:** T1
**Where:** src/actions/pipeline-inscricao.ts
**Tests:** ingerir dataset de exemplo; contar linhas de opções e comparar com esperado dentro de tolerância.
**Gate:** `npm run test` passa; contagem de opções reportada bate o esperado (gatilho de qualidade de dados).

### T3: Aplicação da régua de pontuação vigente por processo
**Depends on:** T2
**Where:** src/lib/scoring/régua-processo.ts
**Tests:** unitário por ano (2021-23, 2024, 2025) pontuando uma inscrição de exemplo conforme o catálogo.
**Gate:** `npm run test` passa para os 3 cenários de régua.

### T4: Cálculo do saldo oferta×demanda por unidade/turno, agregável por microárea e CRE
**Depends on:** T3
**Where:** src/actions/saldo-oferta-demanda.ts
**Tests:** agregação unitária de saldo em dataset pequeno; soma por CRE preserva totais.
**Gate:** `npm run test` passa; função retorna saldo coerente (fila local vs vagas).

### T5: Detecção de duplicidade multi-vaga (1 criança segurando várias vagas)
**Depends on:** T3
**Where:** src/actions/duplicidade-multivaga.ts
**Tests:** caso com 2 opções Ativa/Selecionada por CPF gera alerta; caso normal não gera.
**Gate:** `npm run test` passa para ambos os casos.

### T6: Agregação por CPF e reclassificação da fila por criança
**Depends on:** T3
**Where:** src/actions/reclassificacao-por-cpf.ts
**Tests:** dataset com mesma criança em 2 opções reclassifica/consolida a fila corretamente.
**Gate:** `npm run test` passa; ordem da fila reflete agregação por criança.

### T7: Integração do mapa (Mapbox/deck.gl) + KPIs com filtros por CRE/microárea/ano
**Depends on:** T4, T5, T6
**Where:** src/components/features/mapa-oferta-demanda.tsx
**Tests:** renderização do mapa com pontos por unidade e KPIs (fila, vagas, duplicidade) que atualizam ao filtrar por CRE.
**Gate:** `npm run lint` e `npm run test` passam; `npm run build` completa sem erro de tipo.