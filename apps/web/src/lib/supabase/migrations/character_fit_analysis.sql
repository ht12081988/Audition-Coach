-- Migration: Character Fit Analysis
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/dvnwenupqvbkrnlyvzpu/sql/new

-- ─── 1. Extend script table with character brief columns ──────────────────────
ALTER TABLE script
  ADD COLUMN IF NOT EXISTS archetype                 TEXT,
  ADD COLUMN IF NOT EXISTS emotional_arc             TEXT,
  ADD COLUMN IF NOT EXISTS status_in_scene           TEXT,
  ADD COLUMN IF NOT EXISTS energy_signature          TEXT,
  ADD COLUMN IF NOT EXISTS psychological_core        TEXT,
  ADD COLUMN IF NOT EXISTS physical_presence         TEXT,
  ADD COLUMN IF NOT EXISTS voice_character           TEXT,
  ADD COLUMN IF NOT EXISTS director_vision_note      TEXT,
  ADD COLUMN IF NOT EXISTS screen_presence_note      TEXT,
  ADD COLUMN IF NOT EXISTS physical_world_fit        TEXT,
  ADD COLUMN IF NOT EXISTS role_specific_physicality TEXT;

-- ─── 2. Create character_fit_analysis table ───────────────────────────────────
CREATE TABLE IF NOT EXISTS character_fit_analysis (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  performance_id          UUID REFERENCES performance(id) ON DELETE CASCADE,
  casting_fit_score       INTEGER CHECK (casting_fit_score BETWEEN 0 AND 100),
  casting_label           TEXT,
  -- six core dimension scores
  archetype_score         INTEGER CHECK (archetype_score BETWEEN 0 AND 100),
  archetype_comment       TEXT,
  emotional_arc_score     INTEGER CHECK (emotional_arc_score BETWEEN 0 AND 100),
  emotional_arc_comment   TEXT,
  status_score            INTEGER CHECK (status_score BETWEEN 0 AND 100),
  status_comment          TEXT,
  energy_score            INTEGER CHECK (energy_score BETWEEN 0 AND 100),
  energy_comment          TEXT,
  psych_core_score        INTEGER CHECK (psych_core_score BETWEEN 0 AND 100),
  psych_core_comment      TEXT,
  phys_vocal_score        INTEGER CHECK (phys_vocal_score BETWEEN 0 AND 100),
  phys_vocal_comment      TEXT,
  -- screen presence (nullable — null when video quality insufficient)
  screen_presence_score   INTEGER CHECK (screen_presence_score BETWEEN 0 AND 100),
  screen_presence_comment TEXT,
  camera_expressiveness   INTEGER CHECK (camera_expressiveness BETWEEN 0 AND 100),
  presentation_register   INTEGER CHECK (presentation_register BETWEEN 0 AND 100),
  physical_precision      INTEGER CHECK (physical_precision BETWEEN 0 AND 100),
  visual_world_coherence  INTEGER CHECK (visual_world_coherence BETWEEN 0 AND 100),
  -- synthesis fields
  fit_vs_performance_gap  TEXT,
  director_recommendation TEXT,
  created_at              TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ─── 3. Enable RLS (matching existing tables) ─────────────────────────────────
ALTER TABLE character_fit_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own character fit analysis"
  ON character_fit_analysis FOR SELECT
  USING (
    performance_id IN (
      SELECT id FROM performance WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can insert character fit analysis"
  ON character_fit_analysis FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update character fit analysis"
  ON character_fit_analysis FOR UPDATE
  USING (true);
