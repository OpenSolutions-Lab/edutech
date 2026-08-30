# Eden: achados reais (núcleo analítico sobre dados reais)

Fonte: `CIT-SME-RJ/dadoscreche` (Inscrição Creche SME-Rio 2021-2025, anonimizado).
Pipeline: `scripts/analise_creche.py` (stdlib) → `analytics/inscricoes_agregadas.json`.

## Contagens reais (batem com o dicionário oficial — soma = 837.179 opções)
| Ano | Opções | Inscrições distintas | Crianças distintas | Confirmados | Fila (lista de espera) |
| --- | ---: | ---: | ---: | ---: | ---: |
| 2021 | 198.498 | 73.283 | 57.690 | 29.166 | 68.392 |
| 2022 | 158.122 | 64.055 | 57.820 | 34.893 | 33.338 |
| 2023 | 123.174 | 51.331 | 45.918 | 28.329 | 29.715 |
| 2024 | 197.406 | 82.690 | 71.757 | 51.494 | 30.941 |
| 2025 | 159.979 | 71.949 | 62.899 | 48.688 | 16.345 |

## Insight central — duplicidade multi-inscrição (2025)
- **3.935 crianças em 2025 tinham ≥2 opções ativas simultâneas**
  (lista de espera ∪ posse de vaga), segurando **12.498 vagas** — média **3,18 vagas por criança**.
- Efeito: o mesmo CPF/criança entra em várias filas; congelita a realocação e prolonga o
  preenchimento de vagas ociosas. → base empírica do motor de reclassificação por CPF.

## Saldo oferta × demanda (2025) — pressão = fila / (fila + confirmados)
Top unidades por fila (exemplos reais):
- CM RIO NOVO - RIO DAS FLORES (0716609): fila 765, confirmados 67 → pressão 0,919
- EDI ESCRITORA CLARICE LISPECTOR (0716812): fila 580, confirmados 70 → pressão 0,892
- CM OTÁVIO HENRIQUE DE OLIVEIRA (0716601): fila 560, confirmados 94 → pressão 0,856

## Fila por bairro (2025, topo)
ANIL (1.825), JACAREPAGUÁ (1.387), CIDADE DE DEUS (1.007), MARÉ (899), TAQUARA (819), GUARATIBA (696)...

## Uso no MVP
Estes agregados REAIS alimentam os KPIs, o mapa de oferta×demanda e o motor de duplicidade do app.
Nenhum número foi inventado; todos derivam das 4 bases do desafio.