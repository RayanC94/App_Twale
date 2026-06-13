-- =========================================================
-- À appliquer dans l'éditeur SQL Supabase (comme apply-me.sql).
-- Ajout du 13 juin 2026 : miroir des réponses Google Forms.
--   • Questionnaire « Sport »          (form_key = 'sport')
--   • Questionnaire « Village santé »  (form_key = 'sante')
-- Chaque soumission Google Forms est recopiée ici par un Google Apps Script
-- (voir docs/google-forms-supabase.md). Les réponses restent dans Google
-- Forms ET arrivent dans Supabase → visibles dans l'admin (/admin/sondage).
-- Script rejouable (idempotent).
-- =========================================================

create table if not exists form_responses (
  id uuid primary key default gen_random_uuid(),
  form_key text not null check (form_key in ('sport', 'sante')),
  form_title text,
  answers jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists form_responses_key_created_idx
  on form_responses (form_key, created_at desc);

alter table form_responses enable row level security;

-- Insertion anonyme autorisée (depuis Apps Script via la clé anon publique),
-- comme quiz_responses / survey_responses. Pas de policy de select = pas de
-- lecture via la clé anon ; l'admin lit avec le service_role.
drop policy if exists "insert_anon" on form_responses;
create policy "insert_anon" on form_responses for insert with check (true);
