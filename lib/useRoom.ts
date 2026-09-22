"use client";

import { useEffect, useState } from "react";
import { db } from "./firebase";
import {
  ref,
  onValue,
  set,
  update,
  onDisconnect,
  get,
} from "firebase/database";
import { Room, Player } from "./types";
import { generateRoomCode, generatePlayerId, assignRoles } from "./game";
import { pickRandomPair } from "./words";

const PLAYER_ID_KEY = "mrwhite_player_id";
const PLAYER_NAME_KEY = "mrwhite_player_name";

export function getOrCreatePlayerId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(PLAYER_ID_KEY);
  if (!id) {
    id = generatePlayerId();
    localStorage.setItem(PLAYER_ID_KEY, id);
  }
  return id;
}

export function getSavedName(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(PLAYER_NAME_KEY) || "";
}

export function saveName(name: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PLAYER_NAME_KEY, name);
}

export async function createRoom(hostName: string): Promise<string> {
  const code = generateRoomCode();
  const hostId = getOrCreatePlayerId();
  saveName(hostName);

  const room: Room = {
    code,
    createdAt: Date.now(),
    phase: "lobby",
    roundNumber: 0,
    players: {
      [hostId]: {
        id: hostId,
        name: hostName,
        joinedAt: Date.now(),
        isHost: true,
        connected: true,
      },
    },
  };

  await set(ref(db, `rooms/${code}`), room);
  onDisconnect(ref(db, `rooms/${code}/players/${hostId}/connected`)).set(
    false
  );
  return code;
}

export async function joinRoom(
  code: string,
  name: string
): Promise<{ ok: boolean; error?: string }> {
  const upperCode = code.toUpperCase().trim();
  const roomSnap = await get(ref(db, `rooms/${upperCode}`));
  if (!roomSnap.exists()) {
    return { ok: false, error: "Room not found. Check the code and try again." };
  }
  const room: Room = roomSnap.val();
  const playerId = getOrCreatePlayerId();
  saveName(name);

  const existing = room.players?.[playerId];
  if (!existing && room.phase !== "lobby") {
    return {
      ok: false,
      error: "This round has already started. Ask the host to start a new one.",
    };
  }

  const player: Player = existing
    ? { ...existing, connected: true, name }
    : {
        id: playerId,
        name,
        joinedAt: Date.now(),
        isHost: false,
        connected: true,
      };

  await update(ref(db, `rooms/${upperCode}/players/${playerId}`), player);
  onDisconnect(
    ref(db, `rooms/${upperCode}/players/${playerId}/connected`)
  ).set(false);
  return { ok: true };
}

export function useRoom(code: string | null) {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!code) return;
    const roomRef = ref(db, `rooms/${code.toUpperCase()}`);
    const unsub = onValue(roomRef, (snap) => {
      if (!snap.exists()) {
        setNotFound(true);
        setRoom(null);
      } else {
        setNotFound(false);
        setRoom(snap.val());
      }
      setLoading(false);
    });
    return () => unsub();
  }, [code]);

  return { room, loading, notFound };
}

export async function startRound(code: string) {
  const roomRef = ref(db, `rooms/${code}`);
  const snap = await get(roomRef);
  if (!snap.exists()) return;
  const room: Room = snap.val();

  const connectedPlayers = Object.values(room.players || {}).filter(
    (p) => p.connected
  );
  const ids = connectedPlayers.map((p) => p.id);
  if (ids.length < 3) return;

  const [civilianWord, imposterWord] = pickRandomPair();
  const roles = assignRoles(ids);
  const turnOrder = [...ids].sort(() => Math.random() - 0.5);

  const updatedPlayers: Record<string, Player> = {};
  for (const p of Object.values(room.players)) {
    if (!ids.includes(p.id)) {
      updatedPlayers[p.id] = p;
      continue;
    }
    const role = roles[p.id];
    updatedPlayers[p.id] = {
      ...p,
      role,
      word: role === "civilian" ? civilianWord : role === "imposter" ? imposterWord : "",
      eliminated: false,
    };
  }

  await update(roomRef, {
    phase: "reveal",
    civilianWord,
    imposterWord,
    turnOrder,
    votes: {},
    roundNumber: (room.roundNumber || 0) + 1,
    lastEliminatedId: null,
    lastEliminatedRole: null,
    winner: null,
    players: updatedPlayers,
  });
}

export async function advancePhase(code: string, phase: Room["phase"]) {
  await update(ref(db, `rooms/${code}`), { phase });
}

export async function castVote(code: string, voterId: string, votedForId: string) {
  await update(ref(db, `rooms/${code}/votes`), { [voterId]: votedForId });
}

export async function resolveVotes(code: string) {
  const roomRef = ref(db, `rooms/${code}`);
  const snap = await get(roomRef);
  if (!snap.exists()) return;
  const room: Room = snap.val();

  const { tallyVotes, checkWinner } = await import("./game");
  const { eliminatedId, isTie } = tallyVotes(room.votes || {});

  if (isTie || !eliminatedId) {
    // No elimination on a tie — back to discussion for another round of talk
    await update(roomRef, { phase: "discussion", votes: {} });
    return;
  }

  const updatedPlayers = { ...room.players };
  const eliminated = updatedPlayers[eliminatedId];
  updatedPlayers[eliminatedId] = { ...eliminated, eliminated: true };

  const winner = checkWinner(updatedPlayers);

  await update(roomRef, {
    players: updatedPlayers,
    lastEliminatedId: eliminatedId,
    lastEliminatedRole: eliminated.role,
    phase: "results",
    winner: winner,
  });
}

export async function returnToLobby(code: string) {
  const roomRef = ref(db, `rooms/${code}`);
  const snap = await get(roomRef);
  if (!snap.exists()) return;
  const room: Room = snap.val();

  const updatedPlayers: Record<string, Player> = {};
  for (const p of Object.values(room.players || {})) {
    updatedPlayers[p.id] = {
      ...p,
      role: undefined,
      word: undefined,
      eliminated: false,
    };
  }

  await update(roomRef, {
    phase: "lobby",
    votes: {},
    winner: null,
    lastEliminatedId: null,
    lastEliminatedRole: null,
    players: updatedPlayers,
  });
}

export async function kickPlayer(code: string, playerId: string) {
  await set(ref(db, `rooms/${code}/players/${playerId}`), null);
}
