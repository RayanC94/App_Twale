"use server";

import { requireStaff } from "@/lib/auth/require";
import { createServiceClient } from "@/lib/supabase/service";
import { TOURNOI_DATE_ISO } from "@/lib/constants";

export type TournoiActionState = {
  success?: boolean;
  error?: string;
};

type Sport = "foot" | "volley";
type Gender = "H" | "F" | "mixte";
type Stage = "group" | "qf" | "sf" | "final" | "third";
type MatchStatus = "scheduled" | "live" | "finished" | "cancelled";

const SPORTS = new Set(["foot", "volley"]);
const GENDERS = new Set(["H", "F", "mixte"]);
const STAGES = new Set(["group", "qf", "sf", "final", "third"]);
const STATUSES = new Set(["scheduled", "live", "finished", "cancelled"]);

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function str(formData: FormData, name: string): string {
  const v = formData.get(name);
  return typeof v === "string" ? v.trim() : "";
}

/**
 * Vérifie que le staff connecté peut gérer ce sport :
 * admin → tout ; arbitre → uniquement son sport (ou tous si non restreint).
 */
async function requireSportAccess(sport: Sport) {
  const staff = await requireStaff();
  if (staff.role !== "admin" && staff.sport && staff.sport !== sport) {
    return { staff: null, error: `Accès réservé au référent ${sport}.` };
  }
  return { staff, error: null };
}

async function getMatchSport(matchId: string): Promise<Sport | null> {
  const supabase = createServiceClient();
  const { data } = await supabase.from("matches").select("sport").eq("id", matchId).maybeSingle();
  return (data?.sport as Sport | undefined) ?? null;
}

// =========================================================
// ÉQUIPES
// =========================================================

export async function createTeam(formData: FormData): Promise<TournoiActionState> {
  const sport = str(formData, "sport") as Sport;
  const gender = str(formData, "gender") as Gender;
  const name = str(formData, "name").slice(0, 60);

  if (!SPORTS.has(sport) || !GENDERS.has(gender)) return { error: "Sport ou catégorie invalide." };
  if (name.length < 2) return { error: "Nom d'équipe trop court." };

  const { error: accessError } = await requireSportAccess(sport);
  if (accessError) return { error: accessError };

  const supabase = createServiceClient();
  const { error } = await supabase.from("teams").insert({ sport, gender, name });
  if (error) {
    return { error: error.code === "23505" ? "Cette équipe existe déjà." : "Création impossible. Réessayez." };
  }
  return { success: true };
}

export async function deleteTeam(formData: FormData): Promise<TournoiActionState> {
  const id = str(formData, "id");
  if (!isUuid(id)) return { error: "Équipe invalide." };

  const supabase = createServiceClient();
  const { data: team } = await supabase.from("teams").select("sport").eq("id", id).maybeSingle();
  if (!team) return { error: "Équipe introuvable." };

  const { error: accessError } = await requireSportAccess(team.sport as Sport);
  if (accessError) return { error: accessError };

  const { error } = await supabase.from("teams").delete().eq("id", id);
  if (error) return { error: "Suppression impossible. Réessayez." };
  return { success: true };
}

// =========================================================
// POULES
// =========================================================

export async function createPool(formData: FormData): Promise<TournoiActionState> {
  const sport = str(formData, "sport") as Sport;
  const gender = str(formData, "gender") as Gender;
  const label = str(formData, "label").slice(0, 30);

  if (!SPORTS.has(sport) || !GENDERS.has(gender)) return { error: "Sport ou catégorie invalide." };
  if (label.length < 1) return { error: "Nom de poule requis (ex. Poule A)." };

  const { error: accessError } = await requireSportAccess(sport);
  if (accessError) return { error: accessError };

  const supabase = createServiceClient();
  const { error } = await supabase.from("pools").insert({ sport, gender, label });
  if (error) {
    return { error: error.code === "23505" ? "Cette poule existe déjà." : "Création impossible. Réessayez." };
  }
  return { success: true };
}

export async function deletePool(formData: FormData): Promise<TournoiActionState> {
  const id = str(formData, "id");
  if (!isUuid(id)) return { error: "Poule invalide." };

  const supabase = createServiceClient();
  const { data: pool } = await supabase.from("pools").select("sport").eq("id", id).maybeSingle();
  if (!pool) return { error: "Poule introuvable." };

  const { error: accessError } = await requireSportAccess(pool.sport as Sport);
  if (accessError) return { error: accessError };

  const { error } = await supabase.from("pools").delete().eq("id", id);
  if (error) return { error: "Suppression impossible. Réessayez." };
  return { success: true };
}

export async function addTeamToPool(formData: FormData): Promise<TournoiActionState> {
  const poolId = str(formData, "pool_id");
  const teamId = str(formData, "team_id");
  if (!isUuid(poolId) || !isUuid(teamId)) return { error: "Sélection invalide." };

  const supabase = createServiceClient();
  const { data: pool } = await supabase.from("pools").select("sport,gender").eq("id", poolId).maybeSingle();
  if (!pool) return { error: "Poule introuvable." };

  const { error: accessError } = await requireSportAccess(pool.sport as Sport);
  if (accessError) return { error: accessError };

  const { data: team } = await supabase.from("teams").select("sport,gender").eq("id", teamId).maybeSingle();
  if (!team || team.sport !== pool.sport || team.gender !== pool.gender) {
    return { error: "Équipe incompatible avec cette poule." };
  }

  const { error } = await supabase.from("pool_teams").insert({ pool_id: poolId, team_id: teamId });
  if (error) {
    return { error: error.code === "23505" ? "Équipe déjà dans cette poule." : "Ajout impossible. Réessayez." };
  }
  return { success: true };
}

export async function removeTeamFromPool(formData: FormData): Promise<TournoiActionState> {
  const poolId = str(formData, "pool_id");
  const teamId = str(formData, "team_id");
  if (!isUuid(poolId) || !isUuid(teamId)) return { error: "Sélection invalide." };

  const supabase = createServiceClient();
  const { data: pool } = await supabase.from("pools").select("sport").eq("id", poolId).maybeSingle();
  if (!pool) return { error: "Poule introuvable." };

  const { error: accessError } = await requireSportAccess(pool.sport as Sport);
  if (accessError) return { error: accessError };

  const { error } = await supabase.from("pool_teams").delete().eq("pool_id", poolId).eq("team_id", teamId);
  if (error) return { error: "Retrait impossible. Réessayez." };
  return { success: true };
}

// =========================================================
// MATCHS
// =========================================================

export async function createMatch(formData: FormData): Promise<TournoiActionState> {
  const sport = str(formData, "sport") as Sport;
  const gender = str(formData, "gender") as Gender;
  const stage = str(formData, "stage") as Stage;
  const poolId = str(formData, "pool_id");
  const fieldId = str(formData, "field_id");
  const time = str(formData, "time");
  const teamHomeId = str(formData, "team_home_id");
  const teamAwayId = str(formData, "team_away_id");
  const placeholderHome = str(formData, "placeholder_home").slice(0, 40);
  const placeholderAway = str(formData, "placeholder_away").slice(0, 40);

  if (!SPORTS.has(sport) || !GENDERS.has(gender)) return { error: "Sport ou catégorie invalide." };
  if (!STAGES.has(stage)) return { error: "Phase invalide." };
  if (!/^\d{2}:\d{2}$/.test(time)) return { error: "Horaire requis (HH:MM)." };
  if (stage === "group" && !isUuid(poolId)) return { error: "Choisissez la poule du match." };
  if (!isUuid(teamHomeId) && !placeholderHome) return { error: "Équipe domicile (ou libellé « 1er Poule A ») requise." };
  if (!isUuid(teamAwayId) && !placeholderAway) return { error: "Équipe extérieure (ou libellé) requise." };
  if (isUuid(teamHomeId) && teamHomeId === teamAwayId) return { error: "Les deux équipes doivent être différentes." };

  const { error: accessError } = await requireSportAccess(sport);
  if (accessError) return { error: accessError };

  const supabase = createServiceClient();

  // Cohérence sport/genre des références : l'UI filtre déjà, mais une server
  // action est un endpoint public — le serveur doit imposer les mêmes règles.
  if (stage === "group") {
    const { data: pool } = await supabase.from("pools").select("sport,gender").eq("id", poolId).maybeSingle();
    if (!pool || pool.sport !== sport || pool.gender !== gender) {
      return { error: "Poule incompatible avec ce tournoi." };
    }
  }
  const teamIds = [teamHomeId, teamAwayId].filter(isUuid);
  if (teamIds.length > 0) {
    const { data: refTeams } = await supabase.from("teams").select("id,sport,gender").in("id", teamIds);
    if (
      !refTeams ||
      refTeams.length !== teamIds.length ||
      refTeams.some((t) => t.sport !== sport || t.gender !== gender)
    ) {
      return { error: "Équipe incompatible avec ce tournoi." };
    }
    if (stage === "group") {
      const { data: members } = await supabase
        .from("pool_teams")
        .select("team_id")
        .eq("pool_id", poolId)
        .in("team_id", teamIds);
      if ((members ?? []).length !== teamIds.length) {
        return { error: "Les équipes doivent appartenir à la poule choisie." };
      }
    }
  }
  if (isUuid(fieldId)) {
    const { data: field } = await supabase.from("fields").select("sport").eq("id", fieldId).maybeSingle();
    if (!field || (field.sport !== null && field.sport !== sport)) {
      return { error: "Terrain incompatible avec ce sport." };
    }
  }

  // Heure locale Europe/Paris (le 14 juin = heure d'été, UTC+2).
  const scheduledAt = `${TOURNOI_DATE_ISO}T${time}:00+02:00`;

  const { error } = await supabase.from("matches").insert({
    sport,
    gender,
    stage,
    pool_id: stage === "group" && isUuid(poolId) ? poolId : null,
    field_id: isUuid(fieldId) ? fieldId : null,
    scheduled_at: scheduledAt,
    team_home_id: isUuid(teamHomeId) ? teamHomeId : null,
    team_away_id: isUuid(teamAwayId) ? teamAwayId : null,
    placeholder_home: isUuid(teamHomeId) ? null : placeholderHome || null,
    placeholder_away: isUuid(teamAwayId) ? null : placeholderAway || null,
    status: "scheduled",
  });
  if (error) return { error: "Création du match impossible. Réessayez." };
  return { success: true };
}

export async function deleteMatch(formData: FormData): Promise<TournoiActionState> {
  const id = str(formData, "id");
  if (!isUuid(id)) return { error: "Match invalide." };

  const sport = await getMatchSport(id);
  if (!sport) return { error: "Match introuvable." };

  const { error: accessError } = await requireSportAccess(sport);
  if (accessError) return { error: accessError };

  const supabase = createServiceClient();
  const { error } = await supabase.from("matches").delete().eq("id", id);
  if (error) return { error: "Suppression impossible. Réessayez." };
  return { success: true };
}

/**
 * Saisie de score arbitre, par incrément (+1 / −1 sur un côté) : le score
 * courant est relu en base, ce qui évite d'écraser une saisie concurrente.
 * Passe automatiquement le match en « live » s'il était encore « scheduled ».
 */
export async function updateMatchScore(formData: FormData): Promise<TournoiActionState> {
  const id = str(formData, "id");
  const side = str(formData, "side");
  const delta = Number.parseInt(str(formData, "delta"), 10);

  if (!isUuid(id)) return { error: "Match invalide." };
  if (side !== "home" && side !== "away") return { error: "Saisie invalide." };
  if (delta !== 1 && delta !== -1) return { error: "Saisie invalide." };

  const supabase = createServiceClient();
  const { data: match } = await supabase
    .from("matches")
    .select("sport,status,score_home,score_away")
    .eq("id", id)
    .maybeSingle();
  if (!match) return { error: "Match introuvable." };
  if (match.status === "cancelled") return { error: "Match annulé — score verrouillé." };
  if (match.status === "finished") return { error: "Match terminé — rouvrez-le pour corriger le score." };

  const { staff, error: accessError } = await requireSportAccess(match.sport as Sport);
  if (accessError || !staff) return { error: accessError ?? "Accès refusé." };

  const current = (side === "home" ? match.score_home : match.score_away) ?? 0;
  const next = Math.max(0, current + delta);
  const other = (side === "home" ? match.score_away : match.score_home) ?? 0;

  const { error } = await supabase
    .from("matches")
    .update({
      score_home: side === "home" ? next : other,
      score_away: side === "away" ? next : other,
      status: match.status === "scheduled" ? "live" : match.status,
      updated_by: staff.staff_id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return { error: "Enregistrement impossible. Réessayez." };
  return { success: true };
}

/**
 * Changement de statut. À la fin d'un match (« finished »), le vainqueur est
 * calculé depuis le score (égalité → match nul, pas de vainqueur).
 */
export async function setMatchStatus(formData: FormData): Promise<TournoiActionState> {
  const id = str(formData, "id");
  const status = str(formData, "status") as MatchStatus;

  if (!isUuid(id)) return { error: "Match invalide." };
  if (!STATUSES.has(status)) return { error: "Statut invalide." };

  const supabase = createServiceClient();
  const { data: match } = await supabase
    .from("matches")
    .select("sport,stage,score_home,score_away,team_home_id,team_away_id")
    .eq("id", id)
    .maybeSingle();
  if (!match) return { error: "Match introuvable." };

  const { staff, error: accessError } = await requireSportAccess(match.sport as Sport);
  if (accessError || !staff) return { error: accessError ?? "Accès refusé." };

  let winnerTeamId: string | null = null;
  if (status === "finished") {
    if (match.score_home === null || match.score_away === null) {
      return { error: "Saisissez le score avant de terminer le match." };
    }
    if (match.stage !== "group" && match.score_home === match.score_away) {
      return { error: "Phase finale : pas de match nul — départagez les équipes." };
    }
    if (match.score_home > match.score_away) winnerTeamId = match.team_home_id;
    else if (match.score_away > match.score_home) winnerTeamId = match.team_away_id;
  }

  const { error } = await supabase
    .from("matches")
    .update({
      status,
      winner_team_id: winnerTeamId,
      updated_by: staff.staff_id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return { error: "Changement de statut impossible. Réessayez." };
  return { success: true };
}
