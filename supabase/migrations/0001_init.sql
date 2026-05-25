-- =========================================================
-- Migration initiale — Application Tournoi La TWALE
-- Date événement : 14 juin 2026
-- =========================================================

create extension if not exists "pgcrypto";

-- =========================================================
-- AUTH STAFF (PIN custom — pas Supabase Auth)
-- =========================================================
create type staff_role as enum ('admin', 'referee');
create type sport_t as enum ('foot', 'volley');
create type gender_t as enum ('H', 'F', 'mixte');

create table staff (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  role staff_role not null,
  sport sport_t null,
  pin_hash text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table staff_sessions (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references staff(id) on delete cascade,
  token_hash text not null unique,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  user_agent text,
  ip inet
);
create index on staff_sessions(token_hash);
create index on staff_sessions(expires_at);

create table staff_login_attempts (
  id uuid primary key default gen_random_uuid(),
  ip inet not null,
  attempted_at timestamptz not null default now(),
  success boolean not null default false
);
create index on staff_login_attempts(ip, attempted_at desc);

-- =========================================================
-- TOURNOI — équipes, poules, terrains, matchs
-- =========================================================
create type match_status as enum ('scheduled', 'live', 'finished', 'cancelled');
create type match_stage as enum ('group', 'qf', 'sf', 'final', 'third');
create type match_slot_t as enum ('home', 'away');

create table teams (
  id uuid primary key default gen_random_uuid(),
  sport sport_t not null,
  gender gender_t not null default 'mixte',
  name text not null,
  short_name text,
  logo_url text,
  color text,
  created_at timestamptz not null default now(),
  unique (sport, gender, name)
);

create table pools (
  id uuid primary key default gen_random_uuid(),
  sport sport_t not null,
  gender gender_t not null default 'mixte',
  label text not null,
  unique (sport, gender, label)
);

create table pool_teams (
  pool_id uuid not null references pools(id) on delete cascade,
  team_id uuid not null references teams(id) on delete cascade,
  primary key (pool_id, team_id)
);

create table fields (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sport sport_t null
);

create table matches (
  id uuid primary key default gen_random_uuid(),
  sport sport_t not null,
  gender gender_t not null default 'mixte',
  stage match_stage not null,
  pool_id uuid references pools(id) on delete set null,
  bracket_slot int null,
  field_id uuid references fields(id) on delete set null,
  scheduled_at timestamptz not null,
  team_home_id uuid references teams(id) on delete set null,
  team_away_id uuid references teams(id) on delete set null,
  placeholder_home text,
  placeholder_away text,
  score_home int,
  score_away int,
  status match_status not null default 'scheduled',
  winner_team_id uuid references teams(id) on delete set null,
  next_match_id uuid references matches(id) on delete set null,
  next_match_slot match_slot_t null,
  updated_by uuid references staff(id) on delete set null,
  updated_at timestamptz not null default now()
);
create index on matches(sport, scheduled_at);
create index on matches(status);
create index on matches(stage);

-- =========================================================
-- ATHLÉTISME
-- =========================================================
create type athletics_stage as enum ('series', 'demi', 'finale');

create table athletics_events (
  id uuid primary key default gen_random_uuid(),
  name text not null,                  -- "100m", "Relais 4x400"
  gender gender_t not null,
  stage athletics_stage not null default 'series',
  unit text not null default 's',      -- "s", "m"
  lower_is_better boolean not null default true,
  scheduled_at timestamptz,
  field_id uuid references fields(id) on delete set null,
  status match_status not null default 'scheduled',
  position int default 0
);
create index on athletics_events(scheduled_at);

create table athletes (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  team_id uuid references teams(id) on delete set null,
  bib_number text
);

create table event_results (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references athletics_events(id) on delete cascade,
  athlete_id uuid not null references athletes(id) on delete cascade,
  performance numeric(10, 3) not null,
  rank int,
  updated_by uuid references staff(id) on delete set null,
  updated_at timestamptz not null default now(),
  unique (event_id, athlete_id)
);

-- =========================================================
-- PROGRAMME GÉNÉRAL DE LA JOURNÉE
-- =========================================================
create table schedule_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  location text,
  category text
);
create index on schedule_items(starts_at);

-- =========================================================
-- VILLAGE SANTÉ
-- =========================================================
create table health_stands (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  color text,
  icon text,
  position int default 0
);

create table health_speakers (
  id uuid primary key default gen_random_uuid(),
  stand_id uuid not null references health_stands(id) on delete cascade,
  name text not null,
  title text,
  starts_at timestamptz not null,
  ends_at timestamptz not null
);
create index on health_speakers(stand_id, starts_at);

create table health_documents (
  id uuid primary key default gen_random_uuid(),
  stand_id uuid not null references health_stands(id) on delete cascade,
  title text not null,
  file_path text not null,
  size_bytes int,
  created_at timestamptz not null default now()
);

-- =========================================================
-- CARTE DU SITE
-- =========================================================
create type poi_kind as enum ('field', 'health', 'foodtruck', 'infirmary', 'wc', 'water', 'entrance', 'other');

create table map_pois (
  id uuid primary key default gen_random_uuid(),
  kind poi_kind not null,
  label text not null,
  x_pct numeric(5, 2) not null,
  y_pct numeric(5, 2) not null,
  ref_id uuid,
  description text
);

-- =========================================================
-- FOOD TRUCK
-- =========================================================
create table foodtruck_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price_cents int,
  category text,
  image_url text,
  available boolean default true,
  position int default 0
);

-- =========================================================
-- GALERIE PHOTO
-- =========================================================
create table photos (
  id uuid primary key default gen_random_uuid(),
  file_path text not null,
  thumb_path text,
  caption text,
  taken_at timestamptz,
  uploaded_by uuid references staff(id) on delete set null,
  created_at timestamptz not null default now(),
  approved boolean not null default true
);
create index on photos(created_at desc);

-- =========================================================
-- SPONSORS
-- =========================================================
create table sponsors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  logo_url text not null,
  website_url text,
  tier text,
  position int default 0,
  show_in_marquee boolean default true
);

-- =========================================================
-- SONDAGE DE FIN
-- =========================================================
create table survey_responses (
  id uuid primary key default gen_random_uuid(),
  favorite_stand_id uuid references health_stands(id) on delete set null,
  rating smallint check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  ip_hash text,
  approved boolean not null default true
);
create index on survey_responses(created_at desc);

-- =========================================================
-- CONFIGURATION GÉNÉRALE (clés/valeurs)
-- =========================================================
create table app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- =========================================================
-- VUE : CLASSEMENT DE POULE (calculée à la volée)
-- =========================================================
create or replace view pool_standings as
select
  p.id as pool_id,
  p.sport,
  p.label as pool_label,
  t.id as team_id,
  t.name,
  count(m.*) filter (where m.status = 'finished') as played,
  sum(case
    when m.status = 'finished' and m.winner_team_id = t.id then 3
    when m.status = 'finished' and m.winner_team_id is null
         and (m.team_home_id = t.id or m.team_away_id = t.id) then 1
    else 0
  end) as points,
  sum(case
    when m.team_home_id = t.id then coalesce(m.score_home, 0)
    when m.team_away_id = t.id then coalesce(m.score_away, 0)
    else 0
  end) as scored,
  sum(case
    when m.team_home_id = t.id then coalesce(m.score_away, 0)
    when m.team_away_id = t.id then coalesce(m.score_home, 0)
    else 0
  end) as conceded
from pools p
  join pool_teams pt on pt.pool_id = p.id
  join teams t on t.id = pt.team_id
  left join matches m on m.pool_id = p.id
    and m.stage = 'group'
    and (m.team_home_id = t.id or m.team_away_id = t.id)
group by p.id, p.sport, p.label, t.id, t.name;

-- =========================================================
-- ROW LEVEL SECURITY
-- Toutes les tables : RLS activée.
-- Lectures publiques whitelistées (sauf staff*).
-- Écritures via service_role uniquement (Server Actions Next).
-- =========================================================

-- Activer RLS partout
alter table teams              enable row level security;
alter table pools              enable row level security;
alter table pool_teams         enable row level security;
alter table fields             enable row level security;
alter table matches            enable row level security;
alter table athletics_events   enable row level security;
alter table athletes           enable row level security;
alter table event_results      enable row level security;
alter table schedule_items     enable row level security;
alter table health_stands      enable row level security;
alter table health_speakers    enable row level security;
alter table health_documents   enable row level security;
alter table map_pois           enable row level security;
alter table foodtruck_items    enable row level security;
alter table photos             enable row level security;
alter table sponsors           enable row level security;
alter table survey_responses   enable row level security;
alter table app_settings       enable row level security;
alter table staff              enable row level security;
alter table staff_sessions     enable row level security;
alter table staff_login_attempts enable row level security;

-- Policies de lecture publique
create policy "read_public" on teams              for select using (true);
create policy "read_public" on pools              for select using (true);
create policy "read_public" on pool_teams         for select using (true);
create policy "read_public" on fields             for select using (true);
create policy "read_public" on matches            for select using (true);
create policy "read_public" on athletics_events   for select using (true);
create policy "read_public" on athletes           for select using (true);
create policy "read_public" on event_results      for select using (true);
create policy "read_public" on schedule_items     for select using (true);
create policy "read_public" on health_stands      for select using (true);
create policy "read_public" on health_speakers    for select using (true);
create policy "read_public" on health_documents   for select using (true);
create policy "read_public" on map_pois           for select using (true);
create policy "read_public" on foodtruck_items    for select using (true);
create policy "read_public" on photos             for select using (approved = true);
create policy "read_public" on sponsors           for select using (true);
create policy "read_public" on app_settings       for select using (true);

-- Sondage : insert anonyme autorisé, lecture restreinte au service-role
create policy "insert_anon" on survey_responses for insert with check (true);

-- staff* : aucune policy = inaccessible via anon key (seul service_role peut lire)

-- =========================================================
-- REALTIME : publication sur les tables temps réel
-- =========================================================
alter publication supabase_realtime add table matches;
alter publication supabase_realtime add table event_results;
alter publication supabase_realtime add table photos;
