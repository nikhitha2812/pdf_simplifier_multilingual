/*
# Create pdf_history table (single-tenant, no auth)

1. Overview
This app is intentionally single-tenant: there is no account/signup flow, and the
anon-key frontend must be able to write and read processed-PDF records so users can
revisit prior results. Because all data is intentionally shared across the (anon)
frontend session, public CRUD policies are acceptable and documented as such.

2. New Tables
- `pdf_history`
  - `id` (uuid, primary key, defaults to gen_random_uuid())
  - `file_name` (text, not null) — original uploaded PDF file name
  - `page_count` (integer, nullable) — number of pages extracted; nullable for safety
  - `level` (text, nullable) — simplification level: 'beginner' | 'intermediate' | 'advanced'
  - `language` (text, nullable) — target translation language code, e.g. 'en','hi','ta'
  - `simplified_text` (text, nullable) — AI-simplified English explanation
  - `translated_text` (text, nullable) — final translated explanation
  - `created_at` (timestamptz, defaults to now()) — processing timestamp

3. Indexes
- Index on `created_at DESC` to support the history list ordering efficiently.
- Index on `file_name` (ilike search) to support the name search box.

4. Security
- RLS ENABLED on `pdf_history`.
- Four separate CRUD policies (SELECT/INSERT/UPDATE/DELETE) scoped to `anon, authenticated`
  with USING(true) / WITH CHECK(true). This is permitted because the entire table is
  intentionally shared (single-tenant app, no user accounts). This is the explicit design
  choice, not a fallback.
*/

CREATE TABLE IF NOT EXISTS pdf_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name text NOT NULL,
  page_count integer,
  level text,
  language text,
  simplified_text text,
  translated_text text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pdf_history_created_at
  ON pdf_history (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_pdf_history_file_name
  ON pdf_history (file_name);

ALTER TABLE pdf_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_pdf_history" ON pdf_history;
CREATE POLICY "anon_select_pdf_history" ON pdf_history FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_pdf_history" ON pdf_history;
CREATE POLICY "anon_insert_pdf_history" ON pdf_history FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_pdf_history" ON pdf_history;
CREATE POLICY "anon_update_pdf_history" ON pdf_history FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_pdf_history" ON pdf_history;
CREATE POLICY "anon_delete_pdf_history" ON pdf_history FOR DELETE
  TO anon, authenticated USING (true);
