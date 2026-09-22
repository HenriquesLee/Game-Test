"use client";

import Button from "@/components/Button";
import { Room } from "@/lib/types";
import { advancePhase, returnToLobby, startRound } from "@/lib/useRoom";

const roleLabel: Record<string, string> = {
  civilian: "a Civilian",
  imposter: "the Imposter",
  mrwhite: "Mr. White",
};

export default function Results({
  room,
  isHost,
}: {
  room: Room;
  isHost: boolean;
}) {
  const eliminated = room.lastEliminatedId
    ? room.players[room.lastEliminatedId]
    : null;
  const gameOver = !!room.winner;

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-sm text-center">
      {eliminated && (
        <div>
          <p className="font-sans text-[13px] text-paper-dim mb-2">
            The table voted out
          </p>
          <h2 className="font-display italic font-semibold text-4xl text-paper mb-3">
            {eliminated.name}
          </h2>
          <p className="font-sans text-[16px] text-gold">
            {eliminated.name} was {roleLabel[room.lastEliminatedRole || ""]}
          </p>
          {room.lastEliminatedRole !== "civilian" && (
            <p className="font-sans text-[14px] text-paper-dim mt-2">
              Their word was{" "}
              <span className="text-paper">
                {eliminated.role === "civilian"
                  ? room.civilianWord
                  : eliminated.role === "imposter"
                  ? room.imposterWord
                  : "— nothing"}
              </span>
            </p>
          )}
        </div>
      )}

      {gameOver ? (
        <div className="w-full flex flex-col items-center gap-6 pt-2">
          <div
            className={`px-5 py-2.5 rounded-full font-display italic text-xl ${
              room.winner === "civilians"
                ? "bg-teal-dim text-paper"
                : "bg-red-dim text-paper"
            }`}
          >
            {room.winner === "civilians"
              ? "The Civilians win"
              : "The Imposters win"}
          </div>
          <p className="font-sans text-[13px] text-paper-dim leading-relaxed max-w-xs">
            The word was{" "}
            <span className="text-paper">{room.civilianWord}</span> — the
            Imposter had{" "}
            <span className="text-paper">{room.imposterWord}</span>.
          </p>
          {isHost ? (
            <div className="w-full flex flex-col gap-3">
              <Button
                variant="gold"
                onClick={() => startRound(room.code)}
                className="w-full"
              >
                Play again
              </Button>
              <Button
                variant="ghost"
                onClick={() => returnToLobby(room.code)}
                className="w-full"
              >
                Back to lobby
              </Button>
            </div>
          ) : (
            <p className="font-sans text-[14px] text-paper-dim">
              Waiting for the host to start a new round.
            </p>
          )}
        </div>
      ) : isHost ? (
        <Button
          variant="gold"
          onClick={() => advancePhase(room.code, "discussion")}
          className="w-full"
        >
          Continue to next round of talk
        </Button>
      ) : (
        <p className="font-sans text-[14px] text-paper-dim">
          The game continues. Waiting for the host.
        </p>
      )}
    </div>
  );
}
