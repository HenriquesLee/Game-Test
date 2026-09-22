export type Role = "civilian" | "imposter" | "mrwhite";

export type Phase = "lobby" | "reveal" | "discussion" | "voting" | "results";

export interface Player {
  id: string;
  name: string;
  joinedAt: number;
  isHost: boolean;
  connected: boolean;
  role?: Role;
  word?: string; // empty string for Mr. White
  eliminated?: boolean;
}

export interface VoteMap {
  [voterId: string]: string; // voterId -> votedForPlayerId
}

export interface Room {
  code: string;
  createdAt: number;
  phase: Phase;
  players: Record<string, Player>;
  civilianWord?: string;
  imposterWord?: string;
  turnOrder?: string[];
  votes?: VoteMap;
  roundNumber: number;
  lastEliminatedId?: string | null;
  lastEliminatedRole?: Role | null;
  winner?: "civilians" | "imposters" | null;
}
