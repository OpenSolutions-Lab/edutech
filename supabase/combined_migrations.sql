-- 001_extensions.sql
-- Extensões necessárias para o EduRio-Insights

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Tipos enumerados
CREATE TYPE tipo_escola AS ENUM (
  'Creche', 'EDI', 'Fundamental_I', 'Fundamental_II',
  'Fundamental_Completo', 'CIEP', 'Especial', 'EJA'
);

CREATE TYPE nivel_risco AS ENUM ('baixo', 'moderado', 'alto', 'critico');

CREATE TYPE segmento_escolar AS ENUM (
  'Creche', 'Pre_Escola', 'Fundamental_I', 'Fundamental_II', 'EJA'
);
-- 002_core_tables.sql
-- Tabelas principais: CREs, Bairros e Escolas

CREATE TABLE cres (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  sigla VARCHAR(10) NOT NULL UNIQUE,
  endereco TEXT,
  regiao_administrativa VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE bairros (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  regiao_administrativa VARCHAR(100),
  idh NUMERIC(5,3),
  populacao_0_5 INTEGER DEFAULT 0,
  populacao_6_14 INTEGER DEFAULT 0,
  geometria GEOMETRY(MultiPolygon, 4326),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE escolas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  cre_id INTEGER REFERENCES cres(id),
  bairro_id INTEGER REFERENCES bairros(id),
  tipo tipo_escola NOT NULL,
  endereco_completo TEXT,
  localizacao GEOMETRY(Point, 4326),
  capacidade_maxima INTEGER,
  ano_construcao INTEGER,
  ar_condicionado BOOLEAN DEFAULT FALSE,
  tipologia_predial VARCHAR(50),
  status VARCHAR(20) DEFAULT 'ativa',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_escolas_localizacao ON escolas USING GIST(localizacao);
CREATE INDEX idx_escolas_cre ON escolas(cre_id);
CREATE INDEX idx_escolas_tipo ON escolas(tipo);
CREATE INDEX idx_escolas_nome_trgm ON escolas USING GIN(nome gin_trgm_ops);
CREATE INDEX idx_bairros_geometria ON bairros USING GIST(geometria);
-- 003_historical_data.sql
-- Tabelas de dados históricos: Matrículas, Quadro Pessoal, Orçamento

CREATE TABLE matriculas_historico (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  escola_id UUID REFERENCES escolas(id) ON DELETE CASCADE,
  ano INTEGER NOT NULL,
  semestre INTEGER DEFAULT 1 CHECK (semestre IN (1, 2)),
  total_matriculas INTEGER DEFAULT 0,
  total_aprovados INTEGER DEFAULT 0,
  total_reprovados INTEGER DEFAULT 0,
  total_evadidos INTEGER DEFAULT 0,
  total_transferidos INTEGER DEFAULT 0,
  taxa_aprovacao NUMERIC(5,2),
  taxa_reprovacao NUMERIC(5,2),
  taxa_evasao NUMERIC(5,2),
  taxa_distorcao_idade_serie NUMERIC(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(escola_id, ano, semestre)
);

CREATE TABLE quadro_pessoal (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  escola_id UUID REFERENCES escolas(id) ON DELETE CASCADE,
  ano INTEGER NOT NULL,
  mes INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 12),
  total_professores INTEGER DEFAULT 0,
  professores_efetivos INTEGER DEFAULT 0,
  professores_contratados INTEGER DEFAULT 0,
  carga_16h INTEGER DEFAULT 0,
  carga_22h INTEGER DEFAULT 0,
  carga_30h INTEGER DEFAULT 0,
  carga_40h INTEGER DEFAULT 0,
  carencia_portugues INTEGER DEFAULT 0,
  carencia_matematica INTEGER DEFAULT 0,
  carencia_ciencias INTEGER DEFAULT 0,
  carencia_ingles INTEGER DEFAULT 0,
  carencia_educacao_fisica INTEGER DEFAULT 0,
  carencia_total INTEGER GENERATED ALWAYS AS (
    carencia_portugues + carencia_matematica + carencia_ciencias +
    carencia_ingles + carencia_educacao_fisica
  ) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(escola_id, ano, mes)
);

CREATE TABLE orcamento_manutencao (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  escola_id UUID REFERENCES escolas(id) ON DELETE CASCADE,
  ano INTEGER NOT NULL,
  valor_empenhado NUMERIC(14,2) DEFAULT 0,
  valor_liquidado NUMERIC(14,2) DEFAULT 0,
  valor_pago NUMERIC(14,2) DEFAULT 0,
  gasto_por_aluno NUMERIC(10,2),
  categoria_gasto VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(escola_id, ano, categoria_gasto)
);

-- Índices de performance
CREATE INDEX idx_matriculas_escola_ano ON matriculas_historico(escola_id, ano DESC);
CREATE INDEX idx_quadro_escola_ano_mes ON quadro_pessoal(escola_id, ano DESC, mes DESC);
CREATE INDEX idx_orcamento_escola_ano ON orcamento_manutencao(escola_id, ano DESC);
-- 004_predictions_queue.sql
-- Tabelas de predições de IA e fila de espera

CREATE TABLE predicoes_evasao (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  escola_id UUID REFERENCES escolas(id) ON DELETE CASCADE,
  ano INTEGER NOT NULL,
  semestre INTEGER DEFAULT 1,
  score_risco NUMERIC(5,4) CHECK (score_risco BETWEEN 0 AND 1),
  nivel_risco nivel_risco NOT NULL,
  fatores_contribuintes JSONB DEFAULT '{}',
  recomendacoes JSONB DEFAULT '[]',
  calculated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE predicoes_rh (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cre_id INTEGER REFERENCES cres(id),
  ano INTEGER NOT NULL,
  mes_projecao INTEGER NOT NULL,
  disciplina VARCHAR(50) NOT NULL,
  carencia_projetada INTEGER DEFAULT 0,
  confianca NUMERIC(5,4),
  detalhamento JSONB DEFAULT '{}',
  calculated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE merenda_dimensionamento (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  escola_id UUID REFERENCES escolas(id) ON DELETE CASCADE,
  ano INTEGER NOT NULL,
  mes INTEGER NOT NULL,
  dias_letivos INTEGER DEFAULT 20,
  matriculas_ativas INTEGER DEFAULT 0,
  taxa_presenca_media NUMERIC(5,4) DEFAULT 0.85,
  refeicoes_estimadas INTEGER DEFAULT 0,
  custo_estimado NUMERIC(12,2) DEFAULT 0,
  itens_sugeridos JSONB DEFAULT '[]',
  calculated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE fila_espera (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  escola_id UUID REFERENCES escolas(id) ON DELETE CASCADE,
  ano INTEGER NOT NULL,
  mes INTEGER NOT NULL,
  segmento segmento_escolar NOT NULL,
  vagas_disponiveis INTEGER DEFAULT 0,
  inscritos_fila INTEGER DEFAULT 0,
  vagas_liberadas_mes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_predicoes_evasao_escola ON predicoes_evasao(escola_id, calculated_at DESC);
CREATE INDEX idx_predicoes_rh_cre ON predicoes_rh(cre_id, ano, mes_projecao);
CREATE INDEX idx_fila_escola_periodo ON fila_espera(escola_id, ano, mes);
-- 005_views_functions.sql
-- Views materializadas e funções RPC para consultas complexas

-- View materializada: KPIs consolidados da cidade
CREATE MATERIALIZED VIEW mv_kpis_cidade AS
SELECT
  COUNT(DISTINCT e.id) AS total_escolas,
  COALESCE(SUM(mh.total_matriculas), 0) AS total_matriculas,
  ROUND(COALESCE(AVG(mh.taxa_evasao), 0), 2) AS taxa_evasao_media,
  ROUND(COALESCE(AVG(mh.taxa_aprovacao), 0), 2) AS taxa_aprovacao_media,
  ROUND(COALESCE(AVG(om.gasto_por_aluno), 0), 2) AS custo_medio_por_aluno,
  COALESCE(SUM(GREATEST(e.capacidade_maxima - COALESCE(mh.total_matriculas, 0), 0)), 0) AS vagas_ociosas,
  COALESCE(SUM(qp.carencia_total), 0) AS carencia_total_professores
FROM escolas e
LEFT JOIN LATERAL (
  SELECT * FROM matriculas_historico
  WHERE escola_id = e.id ORDER BY ano DESC, semestre DESC LIMIT 1
) mh ON TRUE
LEFT JOIN LATERAL (
  SELECT * FROM orcamento_manutencao
  WHERE escola_id = e.id ORDER BY ano DESC LIMIT 1
) om ON TRUE
LEFT JOIN LATERAL (
  SELECT * FROM quadro_pessoal
  WHERE escola_id = e.id ORDER BY ano DESC, mes DESC LIMIT 1
) qp ON TRUE
WHERE e.status = 'ativa';

-- Função RPC: Escolas por CRE com dados geográficos
CREATE OR REPLACE FUNCTION fn_escolas_por_cre(p_cre_id INTEGER)
RETURNS TABLE(
  id UUID,
  nome VARCHAR,
  tipo tipo_escola,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  total_matriculas INTEGER,
  taxa_evasao NUMERIC,
  score_risco NUMERIC,
  carencia_total INTEGER
) LANGUAGE SQL STABLE AS $$
  SELECT
    e.id, e.nome, e.tipo,
    ST_Y(e.localizacao) AS lat,
    ST_X(e.localizacao) AS lng,
    mh.total_matriculas,
    mh.taxa_evasao,
    pe.score_risco,
    qp.carencia_total
  FROM escolas e
  LEFT JOIN LATERAL (
    SELECT total_matriculas, taxa_evasao FROM matriculas_historico
    WHERE escola_id = e.id ORDER BY ano DESC, semestre DESC LIMIT 1
  ) mh ON TRUE
  LEFT JOIN LATERAL (
    SELECT score_risco FROM predicoes_evasao
    WHERE escola_id = e.id ORDER BY calculated_at DESC LIMIT 1
  ) pe ON TRUE
  LEFT JOIN LATERAL (
    SELECT carencia_total FROM quadro_pessoal
    WHERE escola_id = e.id ORDER BY ano DESC, mes DESC LIMIT 1
  ) qp ON TRUE
  WHERE e.cre_id = p_cre_id AND e.status = 'ativa';
$$;

-- Função RPC: Identificar vazios educacionais
CREATE OR REPLACE FUNCTION fn_vazios_educacionais(p_tipo tipo_escola DEFAULT 'Creche')
RETURNS TABLE(
  bairro_nome VARCHAR,
  populacao_alvo INTEGER,
  total_vagas INTEGER,
  deficit_estimado INTEGER,
  geometria GEOMETRY
) LANGUAGE SQL STABLE AS $$
  SELECT
    b.nome AS bairro_nome,
    CASE WHEN p_tipo IN ('Creche', 'EDI') THEN b.populacao_0_5
         ELSE b.populacao_6_14 END AS populacao_alvo,
    COALESCE(SUM(e.capacidade_maxima), 0)::INTEGER AS total_vagas,
    (CASE WHEN p_tipo IN ('Creche', 'EDI') THEN b.populacao_0_5
          ELSE b.populacao_6_14 END - COALESCE(SUM(e.capacidade_maxima), 0))::INTEGER AS deficit_estimado,
    b.geometria
  FROM bairros b
  LEFT JOIN escolas e ON e.bairro_id = b.id AND e.tipo = p_tipo AND e.status = 'ativa'
  GROUP BY b.id, b.nome, b.populacao_0_5, b.populacao_6_14, b.geometria
  HAVING (
    CASE WHEN p_tipo IN ('Creche', 'EDI') THEN b.populacao_0_5
         ELSE b.populacao_6_14 END
  ) > COALESCE(SUM(e.capacidade_maxima), 0)
  ORDER BY deficit_estimado DESC;
$$;

-- Função para refresh da view materializada
CREATE OR REPLACE FUNCTION fn_refresh_kpis()
RETURNS VOID LANGUAGE SQL AS $$
  REFRESH MATERIALIZED VIEW mv_kpis_cidade;
$$;

-- Função para associar escolas a bairros espacialmente
CREATE OR REPLACE FUNCTION fn_vincular_escolas_bairros()
RETURNS VOID LANGUAGE SQL AS $$
  UPDATE escolas e
  SET bairro_id = b.id
  FROM bairros b
  WHERE ST_Contains(b.geometria, e.localizacao);
$$;
-- 006_rls_policies.sql
-- Row Level Security para todas as tabelas

-- Habilitar RLS
ALTER TABLE escolas ENABLE ROW LEVEL SECURITY;
ALTER TABLE matriculas_historico ENABLE ROW LEVEL SECURITY;
ALTER TABLE quadro_pessoal ENABLE ROW LEVEL SECURITY;
ALTER TABLE orcamento_manutencao ENABLE ROW LEVEL SECURITY;
ALTER TABLE predicoes_evasao ENABLE ROW LEVEL SECURITY;
ALTER TABLE predicoes_rh ENABLE ROW LEVEL SECURITY;
ALTER TABLE merenda_dimensionamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE fila_espera ENABLE ROW LEVEL SECURITY;
ALTER TABLE cres ENABLE ROW LEVEL SECURITY;
ALTER TABLE bairros ENABLE ROW LEVEL SECURITY;

-- Dados abertos: leitura pública
CREATE POLICY "public_read_cres" ON cres FOR SELECT USING (true);
CREATE POLICY "public_read_bairros" ON bairros FOR SELECT USING (true);
CREATE POLICY "public_read_escolas" ON escolas FOR SELECT USING (true);
CREATE POLICY "public_read_matriculas" ON matriculas_historico FOR SELECT USING (true);
CREATE POLICY "public_read_orcamento" ON orcamento_manutencao FOR SELECT USING (true);
CREATE POLICY "public_read_fila" ON fila_espera FOR SELECT USING (true);

-- Dados sensíveis: apenas gestores autenticados
CREATE POLICY "auth_read_quadro" ON quadro_pessoal
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "auth_read_predicoes_evasao" ON predicoes_evasao
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "auth_read_predicoes_rh" ON predicoes_rh
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "auth_read_merenda" ON merenda_dimensionamento
  FOR SELECT USING (auth.role() = 'authenticated');

-- Escrita: apenas service_role (via Server Actions)
CREATE POLICY "service_write_escolas" ON escolas
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_write_matriculas" ON matriculas_historico
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_write_quadro" ON quadro_pessoal
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_write_orcamento" ON orcamento_manutencao
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_write_predicoes_evasao" ON predicoes_evasao
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_write_predicoes_rh" ON predicoes_rh
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_write_merenda" ON merenda_dimensionamento
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_write_fila" ON fila_espera
  FOR ALL USING (auth.role() = 'service_role');
