# 01 — ENTENDIMENTO DO PROBLEMA — Inscrição de Creche na SME-Rio

## Contexto
A Secretaria Municipal de Educação do Rio é a **maior rede de escolas próprias da América Latina**:
600 mil estudantes, 1.560 escolas próprias e +300 creches parceiras, com mais de 40 mil professores.
A gestão tem DNA de inovação (acordos de resultados desde 2009, modelo JET de ensino integral,
atendimento da creche de 6 meses ao 9º ano). Central ao desafio está o processo de **Inscrição
Creche** (crianças de 0 a 3 anos e 11 meses).

## A dor central
> A rede tem **vagas ociosas em algumas unidades E listas de espera longas em outras**.
> A fila NÃO reflete escassez global de vagas — reflete um **descompasso entre oferta e demanda
> por território e turno** (fila de "preferência", não de ausência de vaga).

A resposta que o desafio pede: **"quantas vagas abrir e onde, em que ordem chamar a fila e como
garantir que a família chegue à vaga dentro do prazo".**

## Os três eixos do desafio (e os problemas em cada um)

### Eixo 1 — Planejamento de vagas (oferta)
- **Hoje:** a oferta de vagas por unidade parte basicamente da **fila do ano anterior** como
  "demanda manifesta", mais análise de nascidos vivos (IBGE) e histórico de matriculados.
- **Problema:** é um olhar **retrospectivo**, sem antecipação. Não incorpora variáveis territoriais
  (IDH/microárea, IDS, empregabilidade, densidade infantil) que permitiriam prever onde a demanda
  crescerá.
- **Pergunta:** o que incorporar para antecipar a demanda futura por território.

### Eixo 2 — Inscrição e Classificação (onde a lógica quebra)
- **Hoje:** o responsável escolhe até **5 unidades** no site (matricula.rio), sem critério de
  distância/território; comprovação manual de vulnerabilidade; a classificação é feita **por opção,
  não por CPF**.
- **Problemas (dados reais comprovam):**
  - Escolha livre gera **opções inviáveis** (distância) → cancelamentos e deslocamentos.
  - **Uma mesma criança pode segurar até 5 vagas simultaneamente**, congelando a realocação.
  - **3.935 crianças em 2025 tinham ≥2 opções ativas** (lista de espera ∪ posse) segurando
    **12.498 vagas simultâneas** (média 3,18 vaga/criança).
  - A régua de pontuação socioeconômica **muda a cada processo** (2021–23, 2024, 2025), difícil
    de explicar/replicar.

### Eixo 3 — Convocação (manual e lenta)
- **Hoje:** convocação por telefone/e-mail/WhatsApp; 1 tentativa/dia por 3 dias; a família tem
  3 dias úteis para confirmar (extensão de 1 dia). Contatos desatualizados; o sistema não edita contato.
- **Problemas:** não localizar a família a tempo **faz perder a vaga**; tempo para preencher 1 vaga
  pode passar de uma semana; casos transitórios (ex.: "Selecionado" sem confirmação) não são
  sinalizados por painel.

## Dados disponibilizados (reais, anonimizados)
| Base | Grão | Linhas |
| --- | --- | --- |
| QueryA — Inscrições por opção | 1 opção por linha | 837.179 |
| QueryB — Respostas socioeconômicas | 1 pergunta respondida por linha | 4.357.119 |
| QueryC — Catálogo de perguntas/pontuação | 1 pergunta por processo/ano | 65 |
| QueryD — Unidades com endereço | 1 unidade por linha | 2.188 |

- Cobertura: processos **179 (2021), 181 (2022), 184 (2023), 194 (2024), 195 (2025)**.
- Anonimização: crianças/responsáveis por código (`aluno_NNNNNNN`); nascimento só ano-mês;
  endereço só bairro/CEP; sem endereço exato nem identificadores diretos.
- **Aviso oficial:** dados reais têm **ruído** — exigem limpeza/validação antes de interpretar.

## Critérios de julgamento do desafio (norte do impacto)
- **Impacto Real = 40%**, Produto = 20%, Engenharia = 20%, Ideia = 10%, Apresentação = 10%.
- Apresentação: máx. 6 minutos; vídeo opcional se o app estiver público.
- Restrição de custo: usar modelo intermediário para poupar créditos (prêmio = plano MAX-20, US$200/mês).

## O que o stakeholder espera de resolução
- Antecipar onde abrir vagas (planejamento).
- Otimizar a classificação (ordem de chamada; eliminar multi-vaga por CPF).
- Automatizar/rastrear a convocação.
- Transformar 5 anos de dados em **inteligência acionável** e de alto impacto real.