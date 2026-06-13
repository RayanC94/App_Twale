-- =========================================================
-- À appliquer dans l'éditeur SQL Supabase (comme apply-me.sql).
-- Ajout du 13 juin 2026 : questionnaires numériques du village santé.
--   • Quiz « La santé bucco-dentaire »  (quiz_slug = 'bucco')
--   • Test « Êtes-vous dépendant·e aux écrans ? » (quiz_slug = 'ecrans')
-- Les réponses sont anonymes et stockées en JSON.
-- Script rejouable (idempotent).
-- =========================================================

create table if not exists quiz_responses (
  id uuid primary key default gen_random_uuid(),
  quiz_slug text not null check (quiz_slug in ('bucco', 'ecrans')),
  answers jsonb not null default '{}'::jsonb,
  score int,
  max_score int,
  result_band text,             -- test écrans : maitrise / vigilance / problematique / dependance
  created_at timestamptz not null default now(),
  ip_hash text
);

create index if not exists quiz_responses_slug_created_idx
  on quiz_responses (quiz_slug, created_at desc);

alter table quiz_responses enable row level security;

-- Saisie anonyme autorisée (comme survey_responses) ; lecture réservée
-- au service_role (admin / Server Actions). Pas de policy de select = pas
-- de lecture via la clé anon.
drop policy if exists "insert_anon" on quiz_responses;
create policy "insert_anon" on quiz_responses for insert with check (true);
