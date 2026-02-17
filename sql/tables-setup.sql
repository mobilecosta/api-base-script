-- AliasSchema relational setup for Supabase/PostgreSQL
-- Creates:
--   tables            <- AliasSchema
--   tables_fields     <- AliasSchema.struct
--   tables_folders    <- AliasSchema.folders
--   tables_agrups     <- AliasSchema.agrups

BEGIN;

-- Helper function for updated_at maintenance.
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS tables (
  id BIGSERIAL PRIMARY KEY,
  alias_code VARCHAR(10) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tables_folders (
  id BIGSERIAL PRIMARY KEY,
  table_id BIGINT NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
  folder_code VARCHAR(60) NOT NULL,
  title VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_tables_folders_table_folder UNIQUE (table_id, folder_code)
);

CREATE TABLE IF NOT EXISTS tables_agrups (
  id BIGSERIAL PRIMARY KEY,
  table_id BIGINT NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
  agrup_code VARCHAR(60) NOT NULL,
  title VARCHAR(255) NOT NULL,
  agrup_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_tables_agrups_table_agrup UNIQUE (table_id, agrup_code)
);

CREATE TABLE IF NOT EXISTS tables_fields (
  id BIGSERIAL PRIMARY KEY,
  table_id BIGINT NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
  field_name VARCHAR(60) NOT NULL,
  title VARCHAR(255) NOT NULL,
  type CHAR(1) NOT NULL CHECK (type IN ('C', 'N', 'D', 'L', 'M')),
  size INTEGER NOT NULL CHECK (size > 0),
  required BOOLEAN NOT NULL DEFAULT FALSE,
  editable BOOLEAN NOT NULL DEFAULT TRUE,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  virtual BOOLEAN NOT NULL DEFAULT FALSE,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  decimals INTEGER NOT NULL DEFAULT 0,
  exist_trigger BOOLEAN NOT NULL DEFAULT FALSE,
  help TEXT NOT NULL DEFAULT '',
  field_order INTEGER NOT NULL,
  agrup_code VARCHAR(60),
  folder_code VARCHAR(60),
  standard_query TEXT,
  standard_query_detail JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_tables_fields_table_field UNIQUE (table_id, field_name),
  CONSTRAINT ck_tables_fields_options_array CHECK (jsonb_typeof(options) = 'array'),
  CONSTRAINT ck_tables_fields_std_query_obj CHECK (
    standard_query_detail IS NULL OR jsonb_typeof(standard_query_detail) = 'object'
  ),
  CONSTRAINT fk_tables_fields_agrup FOREIGN KEY (table_id, agrup_code)
    REFERENCES tables_agrups (table_id, agrup_code)
    ON DELETE SET NULL,
  CONSTRAINT fk_tables_fields_folder FOREIGN KEY (table_id, folder_code)
    REFERENCES tables_folders (table_id, folder_code)
    ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_tables_alias_code ON tables(alias_code);
CREATE INDEX IF NOT EXISTS idx_tables_fields_table_id ON tables_fields(table_id);
CREATE INDEX IF NOT EXISTS idx_tables_fields_order ON tables_fields(table_id, field_order);
CREATE INDEX IF NOT EXISTS idx_tables_fields_agrup_code ON tables_fields(table_id, agrup_code);
CREATE INDEX IF NOT EXISTS idx_tables_fields_folder_code ON tables_fields(table_id, folder_code);
CREATE INDEX IF NOT EXISTS idx_tables_fields_options_gin ON tables_fields USING GIN (options);
CREATE INDEX IF NOT EXISTS idx_tables_fields_std_query_detail_gin ON tables_fields USING GIN (standard_query_detail);
CREATE INDEX IF NOT EXISTS idx_tables_folders_table_id ON tables_folders(table_id);
CREATE INDEX IF NOT EXISTS idx_tables_agrups_table_id ON tables_agrups(table_id);

DROP TRIGGER IF EXISTS update_tables_updated_at ON tables;
CREATE TRIGGER update_tables_updated_at
  BEFORE UPDATE ON tables
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tables_fields_updated_at ON tables_fields;
CREATE TRIGGER update_tables_fields_updated_at
  BEFORE UPDATE ON tables_fields
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tables_folders_updated_at ON tables_folders;
CREATE TRIGGER update_tables_folders_updated_at
  BEFORE UPDATE ON tables_folders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tables_agrups_updated_at ON tables_agrups;
CREATE TRIGGER update_tables_agrups_updated_at
  BEFORE UPDATE ON tables_agrups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMIT;
