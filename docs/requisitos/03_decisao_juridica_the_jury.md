# 03 — DECISÃO DO JÚRI (the-jury) — Escopo do MVP

> Skill: `the-jury` (categoria orchestration) · Fase 2 do `project-orchestrator`.
> Data: 2026-08-30 · Painel: 3 juris em paralelo via `delegate_task` (blind Round 1).

## Pergunta decidida (decision frame)
Escolher o melhor escopo de MVP para o app EduTech ("Match Perfeito") de inscrição em creche,
em um hackathon de 1 dia. Opções:
- **A) PROFUNDIDADE:** Mapa de Oferta×Demanda territorial + Motor de classificação por CPF
  (anti-multi-vaga) + Copilot RAG, com dados reais.
- **B) COBERTURA:** cobrir os 3 eixos (planejamento/classificação/convocatória) de forma ampla
  + Copilot, com menos profundidade em cada.
- **C) DIFERENCIAL:** simulação de automação de convocação + match territorial, dashboards mínimos.

## Rubric (critérios de boa resposta)
1) Impacto Real (40%); 2) Viabilidade no timebox de 1 dia; 3) Inovação (10%); 4) Qualidade/engenharia (20%).

## Painel e votos blind (Round 1)
| Juror | Role / lente | Posição | Confiança | Evidência |
| --- | --- | --- | --- | --- |
| J1 | Proponente (steelman da profundidade) | **A** | 78 | B |
| J2 | Cético / devil's advocate (pre-mortem) | **B** | 67 | B |
| J3 | Integrador | **A + C** | 70 | B |

## Tally determinístico (scripts/tally.py)
- Round 1 (independente): **A = 148.0** | B = 67.0
- Round 2 (final, sem flips — não houve deliberação): A = 148.0 | B = 67.0
- Bandwagon check: **clean** · Flips: 0 · Aggregate: confidence-weighted final
- Resultado do script: **winner = A**, confiança recomendada **HIGH**, evidence avg 3.0.

## Veredito (emitido pelo foreman, formato ADHD)
```
VEREDITO: MVP do EduTech = profundidade (motor de classificação por CPF +
mapa oferta×demanda + copilot RAG) mais a simulação de automação de
convocação — "A + C".
Confiança: HIGH (score A=148 vs B=67; sem bandwagon)
Por que:
1. O motor por CPF ataca a dor mensurável de "1 criança segura até 5 vagas",
   liberando vagas reais de imediato (Impacto Real = 40% da nota).
2. Os dados reais 2021-25 sustentam as 2-3 features de ponta a ponta,
   viáveis no timebox porque reutilizam o claude-impact-lab
   (RAG/fallback Anthropic/PostGIS/Mapbox).
3. A simulação de convocação é o diferencial de menor custo que transforma
   a fila em fluxo acionável (Ideia = 10%) — derivada do mesmo motor CPF→vaga.
4. Modelo intermediário + fallback heurístico mantêm o custo dentro do teto
   do prêmio (MAX-20, US$200/mês).
Dissent: B — cobrir os 3 eixos para resiliência ao dado ruidoso e narrativa completa.
Riskiest assumption: a QUALIDADE dos dados reais (ruído) — motor por CPF/RAG
podem quebrar na demo sem pipeline defensiva de limpeza desde a 1ª hora.
Test: carregar e limpar as 4 tabelas e validar contagens (837 mil opções
etc.) ANTES de qualquer feature — gate de qualidade de dados.
Next: começar pela pipeline de ingestão+limpeza + motor por CPF, e adicionar
as demais features em ordem de impacto.
```

## Impacto no documento de requisitos
A lacuna **L-001** (escopo do MVP) foi **resolvida** pela decisão do júri (A+C). A lacuna **L-002**
(anteceder demanda) incorpora nascidos vivos/IBGE, IDH/microárea, IDS e empregabilidade. A **L-003**
(convocatória) define MVP = simulação de automação + painel de priorização (sem integração
WhatsApp/SMS real no MVP). Referência: `02_requisitos_funcionais_completos.md` (seções 9 e 9b).