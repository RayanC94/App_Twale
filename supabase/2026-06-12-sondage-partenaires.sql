-- =========================================================
-- À appliquer dans l'éditeur SQL Supabase (comme apply-me.sql).
-- Ajouts du 12 juin 2026 : sondage de satisfaction enrichi
-- + nouveaux partenaires.
-- =========================================================

-- 1) Sondage : moment préféré de la journée + intention de revenir.
--    (Le formulaire /sondage envoie ces champs ; tant que ces colonnes
--    n'existent pas, il retombe sur les champs historiques.)
alter table survey_responses
  add column if not exists favorite_moment text
    check (favorite_moment in ('foot', 'volley', 'athle', 'village_sante', 'famille', 'food'));

alter table survey_responses
  add column if not exists would_return text
    check (would_return in ('oui', 'peut_etre', 'non'));

-- 2) Partenaires supplémentaires (logos déjà présents dans public/sponsors/).
--    Guard « where not exists » : la table n'a pas de contrainte unique sur name,
--    le script reste donc rejouable sans créer de doublons.
insert into sponsors (name, description, logo_url, website_url, tier, position, show_in_marquee)
select v.name, v.description, v.logo_url, v.website_url, v.tier, v.position, v.show_in_marquee
from (values
  ('Protection civile', 'Poste de secours de la journée — couverture premiers secours sur l''ensemble du site.', '/sponsors/protection-civile.png', null, 'partenaire', 30, true),
  ('Portalo',           'Créateur d''un système de gourde pour se laver et tout nettoyer sans gaspiller d''eau.', '/sponsors/portalo.png',           null, 'partenaire', 40, true)
) as v(name, description, logo_url, website_url, tier, position, show_in_marquee)
where not exists (select 1 from sponsors s where s.name = v.name);

-- 3) SOS : numéro réel de l'organisation (le seed contenait un placeholder).
update app_settings
set value = jsonb_build_object(
  'phone', '07 69 70 69 40',
  'location_label', 'Poste de secours — Protection civile, près de l''entrée',
  'samu', '15',
  'pompiers', '18',
  'note', 'Numéro organisation confirmé le 11 juin 2026'
), updated_at = now()
where key = 'sos';

-- 4) Planning seedé : le volley se joue sur 3 terrains (info du 11 juin), pas 4.
update schedule_items
set description = replace(description, 'Volley sur 4 terrains', 'Volley sur 3 terrains')
where description like '%Volley sur 4 terrains%';

-- 5) (Optionnel) Aligner le nom du stand sur le dossier de présentation :
--    le stand « Addictologie » y est appelé « Santé mentale » et ses fiches
--    couvrent aussi violences conjugales et harcèlement.
-- update health_stands set name = 'Santé mentale' where slug = 'addictologie';

-- 6) (Optionnel) Le tournoi n'utilise que 3 terrains de volley (info du 11 juin) ;
--    le seed en avait créé 4. À exécuter seulement si aucun match n'y est rattaché.
-- delete from fields where name = 'Terrain Volley D' and not exists (select 1 from matches where field_id = fields.id);
