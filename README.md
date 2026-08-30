# 🎓 EduTech — Gestão Eficiente de Vagas na Educação

Uma plataforma inteligente desenvolvida para otimizar a gestão, planejamento e alocação de vagas na Educação Infantil (Creches e Espaços de Desenvolvimento Infantil - EDIs) da Rede Municipal de Ensino do Rio de Janeiro (SME-RJ).

---

## 🚀 Acesso à Aplicação & Materiais da Solução

- 🌐 **Aplicação em Produção (Vercel):** [https://edutech-steel-six.vercel.app/](https://edutech-steel-six.vercel.app/)
  - 🔑 **Credenciais de Acesso para Teste:**
    - **Usuário:** `juniorgoulart.rj@gmail.com`
    - **Senha:** `123456`
- 📊 **Apresentação Interativa da Solução:** [EduTech-Slides-Apresentacao-v2.html](./EduTech-Slides-Apresentacao-v2.html)
- 🎥 **Vídeo Explicativo da Solução:** [Gestão eficiente de vagas na educação.mp4](./Gestão%20eficiente%20de%20vagas%20na%20educação.mp4)

---

## 📌 Visão Geral do Projeto

O **EduTech** foi desenvolvido para transformar o cenário de distribuição e atendimento de vagas em creches públicas, enfrentando desafios como filas de espera regionais, escassez de infraestrutura em áreas vulneráveis e assimetria entre oferta e demanda.

### Principais Funcionalidades:
- 🗺️ **Mapa Interativo & Georreferenciamento:** Visualização geoespacial (Mapbox + Deck.gl) com análise de capacidade, cobertura regional por CRE e isolinhas de acessibilidade.
- 📊 **Painel Executivo BI:** Métricas em tempo real sobre taxa de atendimento, déficit de vagas e distribuição de matrículas por faixa etária (Berçário I/II, Maternal I/II).
- 📋 **Gestão de Fila Unificada:** Acompanhamento dinâmico das filas de espera com ordenação por critérios de prioridade e vulnerabilidade socioeconômica.
- 🤝 **Inteligência Intersetorial:** Integração de dados de programas sociais para priorização transparente de famílias de baixa renda.
- 🤖 **Assistente com IA:** Suporte inteligente baseado em linguagem natural para consulta de dados, geração de relatórios e tomada de decisão estratégica.

---

## 🛠️ Tecnologias Utilizadas

- **Framework Front-end:** [Next.js 16](https://nextjs.org/) (React 19, App Router, TypeScript)
- **Estilização & UI:** Tailwind CSS, Framer Motion, Lucide Icons
- **Mapeamento & Geoprocessamento:** Mapbox GL JS, Deck.gl, Supercluster
- **Banco de Dados & Backend:** Supabase (PostgreSQL)
- **Visualização de Dados:** Recharts
- **Deploy:** Vercel

---

## 💻 Como Executar o Projeto Localmente

### Pré-requisitos
- Node.js 18+ instalado
- Gerenciador de pacotes (`npm`, `yarn` ou `pnpm`)

### Passo a Passo

1. **Clonar o repositório:**
   ```bash
   git clone https://github.com/seu-usuario/edutech.git
   cd edutech
   ```

2. **Instalar as dependências:**
   ```bash
   npm install
   ```

3. **Configurar as Variáveis de Ambiente:**
   Crie um arquivo `.env.local` na raiz do projeto com as credenciais do Supabase e Mapbox:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
   NEXT_PUBLIC_MAPBOX_TOKEN=seu_token_mapbox
   ```

4. **Iniciar o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

5. **Acessar no navegador:**
   Abra [http://localhost:3000](http://localhost:3000)
