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
  ('Village santé — ouverture',                    'Les 5 stands accessibles de 10h à 18h : orientation, bucco-dentaire, premiers secours, addictologie, kiné/ostéo.', '2026-06-14 10:00+02', '2026-06-14 18:00+02', 'Place centrale',    'sante'),
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
  ('Ville de Choisy-le-Roi', 'Soutien institutionnel',          '/sponsors/ville-choisy.png', 'https://www.choisyleroi.fr', 'institutionnel', 10, true),
  ('ASCR Choisy-le-Roi',    'Partenaire sportif local',          '/sponsors/ascr-choisy.png',  null,                       'sportif',        20, true)
on conflict do nothing;
