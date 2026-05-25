-- =========================================================
-- Migration initiale — Application Tournoi multisports
-- Date événement : dimanche 14 juin 2026
-- Lieu : Stade Jean Bouin, Choisy
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
-- =========================================================
-- Seed initial — Tournoi multisports (co-organisé)
-- 14 juin 2026, Stade Jean Bouin, Choisy.
-- Source : Feuille de Route TOURNOI.
-- À appliquer APRÈS la migration 0001_init.sql.
-- Idempotent grâce aux ON CONFLICT.
-- =========================================================

-- -----------------------------
-- Stands village santé (5 thèmes officiels)
-- -----------------------------
insert into health_stands (slug, name, description, color, icon, position) values
  ('orientation',  'Orientation',              'Filières et carrières : médecine, kinésithérapie, paramédical. Témoignages et conseils de pros & étudiants.', '#5B2A8C', 'graduation-cap', 1),
  ('bucco',        'Hygiène bucco-dentaire',   'Prévention des caries, gestes d''hygiène, dépistage rapide avec un chirurgien-dentiste.',                  '#8B5DBA', 'tooth',          2),
  ('premiers',     'Premiers secours',         'Gestes qui sauvent : PLS, massage cardiaque, alerte. Ateliers pratiques avec démonstration.',               '#3D1B5E', 'life-buoy',      3),
  ('addictologie', 'Addictologie',             'Écrans, tabac, alcool : auto-dépistage et orientation avec des addictologues.',                              '#5B2A8C', 'shield-alert',   4),
  ('kine',         'Kiné / Ostéo',             'Posture, étirements, gestion des blessures sportives. Conseils par des kinés et ostéopathes.',              '#8B5DBA', 'activity',       5)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  color = excluded.color,
  icon = excluded.icon,
  position = excluded.position;

-- -----------------------------
-- Terrains (3 foot + 4 volley + piste athlé)
-- -----------------------------
insert into fields (name, sport) values
  ('Terrain Foot 1',  'foot'),
  ('Terrain Foot 2',  'foot'),
  ('Terrain Foot 3',  'foot'),
  ('Terrain Volley A', 'volley'),
  ('Terrain Volley B', 'volley'),
  ('Terrain Volley C', 'volley'),
  ('Terrain Volley D', 'volley'),
  ('Piste Athlé',     null)
on conflict (name) do nothing;

-- -----------------------------
-- Programme de la journée (Dimanche 14 juin 2026)
-- -----------------------------
delete from schedule_items;
insert into schedule_items (title, description, starts_at, ends_at, location, category) values
  ('Accueil des équipes & installation',          'Inscription, distribution des dossards et installation.',                          '2026-06-14 08:00+02', '2026-06-14 08:45+02', 'Entrée principale', 'ouverture'),
  ('Briefing général & ouverture officielle',      'Mot d''accueil de La TWALE, rappel des règles.',                                   '2026-06-14 08:45+02', '2026-06-14 09:00+02', 'Place centrale',    'ouverture'),
  ('Phases de poules — Foot & Athlé séries',       'Foot sur 3 terrains. Séries de relais 4×100/4×400, puis 100/400/800m, puis 3km.', '2026-06-14 09:00+02', '2026-06-14 11:05+02', 'Terrains & piste',  'tournoi'),
  ('Phases de poules — Volley démarre',            'Volley sur 4 terrains, en parallèle de la fin du foot.',                            '2026-06-14 11:05+02', '2026-06-14 12:45+02', 'Terrains volley',   'tournoi'),
  ('Village santé — ouverture',                    'Les 5 stands accessibles toute la journée : orientation, bucco-dentaire, premiers secours, addictologie, kiné/ostéo.', '2026-06-14 09:00+02', '2026-06-14 18:00+02', 'Place centrale',    'sante'),
  ('Pause déjeuner — food truck & buvette',        'Restauration sur place.',                                                            '2026-06-14 12:45+02', '2026-06-14 14:00+02', 'Food truck',        'pause'),
  ('Phases finales — Foot, Volley, Athlé',         'Demi-finales, quarts, petites et grandes finales.',                                  '2026-06-14 14:00+02', '2026-06-14 17:30+02', 'Terrains & piste',  'tournoi'),
  ('Finales — consolidation des résultats',        'Grande finale foot femmes puis hommes, finalisation des classements.',               '2026-06-14 17:30+02', '2026-06-14 18:15+02', 'Terrains',          'tournoi'),
  ('Cérémonie officielle & remise des récompenses','Podiums et clôture de la journée.',                                                 '2026-06-14 18:15+02', '2026-06-14 18:45+02', 'Place centrale',    'podium');

-- -----------------------------
-- Épreuves d'athlétisme (programme détaillé feuille de route)
-- -----------------------------
delete from athletics_events;
insert into athletics_events (name, gender, stage, unit, lower_is_better, scheduled_at, position) values
  -- Séries / qualifs (matin)
  ('Relais 4×100', 'H', 'series', 's', true,  '2026-06-14 09:00+02', 10),
  ('Relais 4×100', 'F', 'series', 's', true,  '2026-06-14 09:00+02', 11),
  ('Relais 4×400', 'H', 'series', 's', true,  '2026-06-14 09:30+02', 12),
  ('Relais 4×400', 'F', 'series', 's', true,  '2026-06-14 09:30+02', 13),
  ('100m',         'F', 'series', 's', true,  '2026-06-14 10:15+02', 20),
  ('400m',         'F', 'series', 's', true,  '2026-06-14 10:20+02', 21),
  ('800m',         'F', 'series', 's', true,  '2026-06-14 10:30+02', 22),
  ('100m',         'H', 'series', 's', true,  '2026-06-14 10:40+02', 23),
  ('400m',         'H', 'series', 's', true,  '2026-06-14 10:45+02', 24),
  ('800m',         'H', 'series', 's', true,  '2026-06-14 10:55+02', 25),
  ('3km',          'F', 'series', 's', true,  '2026-06-14 11:30+02', 30),
  ('3km',          'H', 'series', 's', true,  '2026-06-14 12:00+02', 31),
  -- Finales (après-midi)
  ('Finale 800m',         'H', 'finale', 's', true,  '2026-06-14 14:50+02', 50),
  ('Finale 800m',         'F', 'finale', 's', true,  '2026-06-14 14:50+02', 51),
  ('Finale Relais 4×100', 'H', 'finale', 's', true,  '2026-06-14 15:40+02', 60),
  ('Finale Relais 4×100', 'F', 'finale', 's', true,  '2026-06-14 15:40+02', 61),
  ('Finale Relais 4×400', 'H', 'finale', 's', true,  '2026-06-14 15:45+02', 62),
  ('Finale Relais 4×400', 'F', 'finale', 's', true,  '2026-06-14 15:45+02', 63),
  ('Finale 100m',         'H', 'finale', 's', true,  '2026-06-14 16:55+02', 70),
  ('Finale 100m',         'F', 'finale', 's', true,  '2026-06-14 16:55+02', 71),
  ('Finale 400m',         'H', 'finale', 's', true,  '2026-06-14 17:05+02', 72),
  ('Finale 400m',         'F', 'finale', 's', true,  '2026-06-14 17:05+02', 73);

-- -----------------------------
-- Paramètres globaux / SOS
-- -----------------------------
insert into app_settings (key, value) values
  ('sos', jsonb_build_object(
    'phone', '+33 0 00 00 00 00',
    'location_label', 'Infirmerie — Tente blanche près de l''entrée',
    'samu', '15',
    'pompiers', '18',
    'note', 'À mettre à jour avec le numéro réel avant le 14 juin'
  )),
  ('event', jsonb_build_object(
    'name', 'Tournoi multisports',
    'organizer', '',
    'tagline', 'Sport, Santé, Prévention',
    'date', '2026-06-14',
    'opens_at', '2026-06-14T09:00:00+02:00',
    'closes_at', '2026-06-14T19:00:00+02:00',
    'venue', 'Stade Jean Bouin',
    'city', 'Choisy',
    'max_capacity', 800,
    'expected_participants', 300
  ))
on conflict (key) do update set
  value = excluded.value,
  updated_at = now();

-- -----------------------------
-- Buckets Storage
-- -----------------------------
insert into storage.buckets (id, name, public)
values
  ('team-logos',  'team-logos',  true),
  ('sponsors',    'sponsors',    true),
  ('foodtruck',   'foodtruck',   true),
  ('health-pdfs', 'health-pdfs', true),
  ('gallery',     'gallery',     true),
  ('map',         'map',         true)
on conflict (id) do nothing;

-- -----------------------------
-- Sponsors / partenaires
-- -----------------------------
insert into sponsors (name, description, logo_url, website_url, tier, position, show_in_marquee)
values
  ('Ville de Choisy-le-Roi', 'Soutien institutionnel',          '/sponsors/ville-choisy.jpeg', 'https://www.choisyleroi.fr', 'institutionnel', 10, true),
  ('ASCR Choisy-le-Roi',    'Partenaire sportif local',          '/sponsors/ascr-choisy.jpeg',  null,                       'sportif',        20, true)
on conflict do nothing;
