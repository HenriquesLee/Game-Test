"use client";

import { use, useState } from "react";
import Link from "next/link";
import Button from "@/components/Button";
import { useRoom, getOrCreatePlayerId, joinRoom, getSavedName } from "@/lib/useRoom";
import Lobby from "./components/Lobby";
import Reveal from "./components/Reveal";
import Discussion from "./components/Discussion";
import Voting from "./components/Voting";
import Results from "./components/Results";

export default function RoomPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const upperCode = code.toUpperCase();
  const { room, loading, notFound } = useRoom(upperCode);
  const [selfId] = useState(() => getOrCreatePlayerId());
  const [nameInput, setNameInput] = useState(() => getSavedName());
  const [joinError, setJoinError] = useState("");
  const [joining, setJoining] = useState(false);

  const needsName = !!room && !room.players?.[selfId];

  async function handleJoin() {
    if (!nameInput.trim()) {
      setJoinError("Enter your name first.");
      return;
    }
    setJoining(true);
    setJoinError("");
    const result = await joinRoom(upperCode, nameInput.trim());
    if (!result.ok) {
      setJoinError(result.error || "Couldn't join.");
      setJoining(false);
      return;
    }
    setJoining(false);
  }

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <p className="font-sans text-paper-dim text-[14px]">Loading…</p>
      </main>
    );
  }

  if (notFound) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center px-6 gap-4 text-center">
        <h1 className="font-display italic text-3xl text-paper">
          Room not found
        </h1>
        <p className="font-sans text-paper-dim text-[15px]">
          The code &ldquo;{upperCode}&rdquo; doesn&apos;t match an open room.
        </p>
        <Link href="/" className="mt-2">
          <Button variant="gold">Back to start</Button>
        </Link>
      </main>
    );
  }

  if (!room) return null;

  if (needsName) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm flex flex-col gap-4 text-center">
          <p className="font-sans text-[13px] text-gold-dim">
            Joining room {upperCode}
          </p>
          <h1 className="font-display italic font-semibold text-3xl text-paper mb-2">
            What&apos;s your name?
          </h1>
          <input
            autoFocus
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            maxLength={20}
            placeholder="e.g. Lee"
            className="w-full bg-ink-raised border border-ink-line rounded-2xl px-4 py-3.5 text-paper font-sans text-center placeholder:text-paper-dim/50 focus:border-gold outline-none"
          />
          {joinError && (
            <p className="text-red text-[14px] font-sans">{joinError}</p>
          )}
          <Button variant="gold" disabled={joining} onClick={handleJoin}>
            {joining ? "Joining…" : "Join game"}
          </Button>
        </div>
      </main>
    );
  }

  const isHost = room.players[selfId]?.isHost ?? false;

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
      {room.phase === "lobby" && (
        <Lobby room={room} selfId={selfId} isHost={isHost} />
      )}
      {room.phase === "reveal" && (
        <Reveal room={room} selfId={selfId} isHost={isHost} />
      )}
      {room.phase === "discussion" && (
        <Discussion room={room} isHost={isHost} />
      )}
      {room.phase === "voting" && (
        <Voting room={room} selfId={selfId} isHost={isHost} />
      )}
      {room.phase === "results" && (
        <Results room={room} isHost={isHost} />
      )}
    </main>
  );
}
