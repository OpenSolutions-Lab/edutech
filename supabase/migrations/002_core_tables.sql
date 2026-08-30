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
