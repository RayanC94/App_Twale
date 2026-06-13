# Recopier les réponses Google Forms dans Supabase

Objectif : garder les **Google Forms** (Sport & Village santé) tels quels, et faire
que **chaque réponse arrive aussi dans Supabase** → visible dans l'admin
(`/admin/sondage`, sections « Avis Google Forms »).

On ajoute à chaque formulaire un petit script Google (Apps Script) qui envoie la
réponse à Supabase à chaque envoi. C'est une configuration **à faire une seule fois
par formulaire** (~5 min).

---

## Étape 1 — Créer la table Supabase (une fois)

1. Ouvre Supabase → **SQL Editor**.
2. Copie-colle le contenu de [`supabase/2026-06-13-form-responses.sql`](../supabase/2026-06-13-form-responses.sql) et clique **Run**.

## Étape 2 — Récupérer ta clé « anon »

Supabase → **Project Settings** → **API** → section **Project API keys** →
copie la clé **`anon` `public`** (longue chaîne commençant par `eyJ…`).
Cette clé est publique, elle ne peut **qu'insérer** des réponses (pas les lire).

## Étape 3 — Coller le script dans CHAQUE formulaire

Pour le Google Form **Sport**, puis pour **Village santé** :

1. Ouvre le formulaire en édition.
2. Menu **⋮** (en haut à droite) → **Éditeur de scripts** *(ou « Apps Script »)*.
3. Efface ce qu'il y a et **colle le script ci-dessous**.
4. Remplace les 2 valeurs :
   - `SUPABASE_ANON_KEY` → ta clé anon (étape 2).
   - `FORM_KEY` → `'sport'` pour le formulaire Sport, `'sante'` pour Village santé.
5. **Enregistre** (icône disquette).

```javascript
// ====== À CONFIGURER ======
const SUPABASE_URL = 'https://gnwqycedllwyincbllpo.supabase.co';
const SUPABASE_ANON_KEY = 'COLLE_TA_CLE_ANON_ICI';
const FORM_KEY = 'sport'; // 'sport' = questionnaire Sport · 'sante' = Village santé
// ==========================

function onFormSubmit(e) {
  const answers = {};
  e.response.getItemResponses().forEach(function (ir) {
    answers[ir.getItem().getTitle()] = ir.getResponse();
  });

  UrlFetchApp.fetch(SUPABASE_URL + '/rest/v1/form_responses', {
    method: 'post',
    contentType: 'application/json',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: 'Bearer ' + SUPABASE_ANON_KEY,
      Prefer: 'return=minimal',
    },
    payload: JSON.stringify({
      form_key: FORM_KEY,
      form_title: FormApp.getActiveForm().getTitle(),
      answers: answers,
    }),
    muteHttpExceptions: true,
  });
}
```

## Étape 4 — Activer le déclencheur « à l'envoi du formulaire »

Toujours dans l'éditeur Apps Script :

1. Clique l'icône **⏰ Déclencheurs** (réveil, à gauche).
2. **+ Ajouter un déclencheur** (en bas à droite).
3. Règle :
   - Fonction à exécuter : **`onFormSubmit`**
   - Source de l'événement : **Depuis le formulaire**
   - Type d'événement : **À l'envoi du formulaire**
4. **Enregistrer** → Google demande d'**autoriser** le script : accepte
   (choisis ton compte, « Paramètres avancés » → « Accéder à … » si besoin).

Répète les étapes 3 et 4 pour le **second** formulaire (avec `FORM_KEY = 'sante'`).

## Étape 5 — Tester

Envoie une réponse de test sur chaque formulaire, puis ouvre **`/admin/sondage`** :
les compteurs « Avis Sport » / « Avis Santé » augmentent et la réponse s'affiche.

---

### Notes

- Les réponses restent **aussi** dans Google Forms (onglet « Réponses »). Rien n'est perdu.
- Conseil : dans chaque formulaire, onglet **Réponses** → icône **Sheets**, lie aussi
  une Google Sheet (export tableur en 1 clic, indépendant de Supabase).
- Si l'admin reste à 0 après un test : vérifie que la table existe (étape 1), que la
  clé anon est bien collée, et que le déclencheur est bien « À l'envoi du formulaire ».
