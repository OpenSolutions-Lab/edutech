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
