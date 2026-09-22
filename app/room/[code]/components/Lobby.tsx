"use client";

import { useState } from "react";
import Button from "@/components/Button";
import PlayerList from "./PlayerList";
import { Room } from "@/lib/types";
import { startRound } from "@/lib/useRoom";

export default function Lobby({
  room,
  selfId,
  isHost,
}: {
  room: Room;
  selfId: string;
  isHost: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const players = Object.values(room.players || {});
  const connectedCount = players.filter((p) => p.connected).length;
  const canStart = connectedCount >= 3;

  function copyLink() {
    const url = `${window.location.origin}/room/${room.code}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  return (
    <div className="flex flex-col items-center gap-10 w-full max-w-sm">
      <div className="text-center">
        <p className="font-sans text-[13px] text-paper-dim mb-2">
          Room code
        </p>
        <div className="font-display font-semibold text-5xl tracking-[0.08em] text-gold">
          {room.code}
        </div>
      </div>

      <Button variant="ghost" onClick={copyLink} className="w-full">
        {copied ? "Link copied" : "Copy invite link"}
      </Button>

      <div className="w-full">
        <p className="font-sans text-[13px] text-paper-dim mb-3 text-center">
          {connectedCount} {connectedCount === 1 ? "player" : "players"}{" "}
          {canStart ? "ready" : "— need at least 3"}
        </p>
        <PlayerList players={players} selfId={selfId} />
      </div>

      {isHost ? (
        <Button
          variant="gold"
          disabled={!canStart}
          onClick={() => startRound(room.code)}
          className="w-full"
        >
          {canStart ? "Start round" : "Waiting for players…"}
        </Button>
      ) : (
        <p className="font-sans text-[14px] text-paper-dim text-center">
          Waiting for the host to start the round.
        </p>
      )}
    </div>
  );
}
