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
