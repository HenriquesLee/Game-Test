import { Player, Role, VoteMap } from "./types";

export function generateRoomCode(): string {
  // Avoid ambiguous chars (0/O, 1/I)
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function generatePlayerId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

/**
 * Assigns roles to a set of active (non-eliminated) players.
 * Rules of thumb, scaled to group size:
 *  - 3-4 players: 1 imposter, no Mr. White
 *  - 5-7 players: 1 imposter, 1 Mr. White
 *  - 8+ players: 2 imposters, 1 Mr. White
 */
export function assignRoles(playerIds: string[]): Record<string, Role> {
  const n = playerIds.length;
  const shuffled = [...playerIds].sort(() => Math.random() - 0.5);

  let numImposters = 1;
  let numMrWhite = 0;

  if (n >= 5 && n <= 7) numMrWhite = 1;
  if (n >= 8) {
    numImposters = 2;
    numMrWhite = 1;
  }

  const roles: Record<string, Role> = {};
  let idx = 0;
  for (let i = 0; i < numImposters && idx < n; i++, idx++) {
    roles[shuffled[idx]] = "imposter";
  }
  for (let i = 0; i < numMrWhite && idx < n; i++, idx++) {
    roles[shuffled[idx]] = "mrwhite";
  }
  for (; idx < n; idx++) {
    roles[shuffled[idx]] = "civilian";
  }
  return roles;
}

export function tallyVotes(votes: VoteMap): {
  eliminatedId: string | null;
  isTie: boolean;
  counts: Record<string, number>;
} {
  const counts: Record<string, number> = {};
  Object.values(votes).forEach((votedFor) => {
    counts[votedFor] = (counts[votedFor] || 0) + 1;
  });

  let maxVotes = 0;
  let leaders: string[] = [];
  for (const [id, c] of Object.entries(counts)) {
    if (c > maxVotes) {
      maxVotes = c;
      leaders = [id];
    } else if (c === maxVotes) {
      leaders.push(id);
    }
  }

  if (leaders.length !== 1) {
    return { eliminatedId: null, isTie: true, counts };
  }
  return { eliminatedId: leaders[0], isTie: false, counts };
}

/**
 * Checks win condition after an elimination.
 * Civilians win when every imposter and Mr. White has been eliminated.
 * Imposters/Mr. White win when they equal or outnumber remaining civilians.
 */
export function checkWinner(
  players: Record<string, Player>
): "civilians" | "imposters" | null {
  const active = Object.values(players).filter((p) => !p.eliminated);
  const activeBad = active.filter(
    (p) => p.role === "imposter" || p.role === "mrwhite"
  );
  const activeCivilians = active.filter((p) => p.role === "civilian");

  if (activeBad.length === 0) return "civilians";
  if (activeBad.length >= activeCivilians.length) return "imposters";
  return null;
}
