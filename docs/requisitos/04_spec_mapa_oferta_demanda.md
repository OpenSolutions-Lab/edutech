# Spec — Mapa de Oferta × Demanda + Motor de Classificação por CPF (núcleo do MVP)

Status: DRAFT
Diretorio: .specs/features/mapa-oferta-demanda/
Escopo: núcleo analítico que alimenta o restante do MVP (convocação simulada e copilot RAG).

## Problem Statement
No processo de Inscrição Creche da SME-Rio (2021-2025) a fila não reflete escassez global, mas
descompasso de PREFERÊNCIA territorial/turno: há vagas ociosas e filas longas simultâneas, e a
classificação é feita por OPÇÃO (até 5 por CPF), permitindo que uma mesma criança segure até 5
vagas ao mesmo tempo e congele a realocação. Não há painel que sinalize esse descompasso nem a
duplicidade, e o tempo para ocupar uma vaga ociosa pode passar de uma semana. Este núcleo entrega
a base limpa processada com a régua vigente, o cálculo do saldo oferta×demanda por unidade/turno/
microárea/CRE, a detecção de multi-inscrição e a agregação da fila por CPF.

## User Stories
- Como gestor da CRE, quero ver o saldo de vagas por território para saber onde abrir vagas e
  onde reequilibrar a oferta.
- Como coordenador do nível central, quero ver alertas de crianças segurando múltiplas vagas
  para desbloquear vagas ociosas mais rápido.
- Como analista de dados, quero uma base agregada por CPF e pela régua vigente para reclassificar
  a fila por criança e dar suporte às demais features (convocação e copilot).

## Acceptance Criteria
1. WHEN o pipeline de dados processa as 4 tabelas, shall produzir uma base limpa por opção,
   responsável e criança, aplicando a régua de pontuação vigente de cada processo.
2. The saldo de vagas por unidade e turno shall ser calculado e apresentado como indicador de
   descompasso oferta×demanda, agregável por microárea e CRE.
3. WHEN um responsável tiver mais de uma opção Ativa/Selecionada, then o sistema shall sinalizar
   a duplicidade (multi-vaga) como alerta no painel.
4. The base shall ser agregável por CPF para permitir reclassificação da fila por criança,
   reduzindo o bloqueio de vagas por multi-inscrição.
5. WHEN o gestor filtrar por CRE/microárea/ano, then o mapa e os KPIs shall atualizar com os
   saldos e alertas correspondentes em tempo real.

## Out of Scope
- Automação/convocação WhatsApp ou SMS (está no diferencial "A+C", fora deste núcleo).
- Acesso ou alteração do sistema transacional oficial da prefeitura (a solução é analítica).
- Visual de relatório executivo PDF e copilot conversacional (features separadas do roadmap).

## Assumptions & Open Questions

| Assumption | Chosen default | Rationale |
| --- | --- | --- |
| Ordem dos dados | Usar os 4 datasets anonimizados 2021-2025 do repositório oficial | São a fonte pedida pelo desafio; permitem reprodução |
| Disponibilidade dos datasets | Baixar do CIT-SME-RJ/dadoscreche; se ausente, carregar amostra/consolidado representativo via seed | Sem os arquivos locais, um seed representativo permite demo realista |
| Qualidade dos dados | Pressupor ruído e validar contagens antes de todo KPI (gate de qualidade) | Dados reais podem conter ruído; a prefeitura alertou para limpeza |
| Métrica de duplicidade | Multi-inscrição = >1 opção Ativa/Selecionada no mesmo CPF/criança | Reflete o gargalo declarado (1 criança segurando até 5 vagas) |

Open questions: none

## Requirement Traceability

| ID | Requisito | Status | Verificação |
| --- | --- | --- | --- |
| REQ-001 | Pipeline processa as 4 tabelas com a régua vigente de cada processo | pending | ACE-001 |
| REQ-002 | Saldo oferta×demanda por unidade/turno, agregável por microárea e CRE | pending | ACE-002 |
| REQ-003 | Sinalizar duplicidade multi-vaga no painel | pending | ACE-003 |
| REQ-004 | Agregação por CPF para reclassificação da fila por criança | pending | ACE-004 |
| REQ-005 | Filtros por CRE/microárea/ano atualizam mapa e KPIs em tempo real | pending | ACE-005 |