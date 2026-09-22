"use client";

import { useMemo } from "react";
import Button from "@/components/Button";
import { Room } from "@/lib/types";
import { castVote, resolveVotes } from "@/lib/useRoom";

export default function Voting({
  room,
  selfId,
  isHost,
}: {
  room: Room;
  selfId: string;
  isHost: boolean;
}) {
  const activePlayers = useMemo(
    () => Object.values(room.players || {}).filter((p) => !p.eliminated),
    [room.players]
  );
  const votes = room.votes || {};
  const myVote = votes[selfId];
  const votedCount = Object.keys(votes).length;
  const allVoted = votedCount >= activePlayers.length;

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-sm">
      <div className="text-center">
        <p className="font-sans text-[13px] text-gold-dim mb-2">
          Round {room.roundNumber}
        </p>
        <h2 className="font-display italic font-semibold text-3xl text-paper">
          Who&apos;s suspicious?
        </h2>
        <p className="font-sans text-[14px] text-paper-dim mt-3">
          {votedCount} of {activePlayers.length} have voted
        </p>
      </div>

      <div className="w-full flex flex-col gap-2">
        {activePlayers.map((p) => {
          const isSelf = p.id === selfId;
          const isSelected = myVote === p.id;
          return (
            <button
              key={p.id}
              disabled={isSelf}
              onClick={() => castVote(room.code, selfId, p.id)}
              className={`flex items-center justify-between px-4 py-3.5 rounded-2xl border text-left font-sans text-[15px] transition-colors ${
                isSelected
                  ? "bg-gold-dim/30 border-gold text-paper"
                  : isSelf
                  ? "border-ink-line text-paper-dim/40 cursor-not-allowed"
                  : "border-ink-line text-paper hover:border-paper-dim"
              }`}
            >
              <span>
                {p.name}
                {isSelf && (
                  <span className="text-paper-dim/60 text-[13px]"> (you)</span>
                )}
              </span>
              {isSelected && <span className="text-gold">✓</span>}
            </button>
          );
        })}
      </div>

      {isHost ? (
        <Button
          variant="gold"
          disabled={!allVoted}
          onClick={() => resolveVotes(room.code)}
          className="w-full"
        >
          {allVoted ? "Reveal result" : "Waiting for everyone to vote…"}
        </Button>
      ) : (
        <p className="font-sans text-[14px] text-paper-dim text-center">
          {myVote
            ? "Vote in. Waiting on the rest of the table."
            : "Tap a name to cast your vote."}
        </p>
      )}
    </div>
  );
}
