"use client";

import { useState } from "react";
import Button from "@/components/Button";
import { Room } from "@/lib/types";
import { advancePhase } from "@/lib/useRoom";

export default function Reveal({
  room,
  selfId,
  isHost,
}: {
  room: Room;
  selfId: string;
  isHost: boolean;
}) {
  const [flipped, setFlipped] = useState(false);
  const me = room.players[selfId];
  const isMrWhite = me?.role === "mrwhite";
  const turnOrder = room.turnOrder || [];
  const firstPlayerName = turnOrder[0]
    ? room.players[turnOrder[0]]?.name
    : null;

  return (
    <div className="flex flex-col items-center gap-10 w-full max-w-sm">
      <p className="font-sans text-[13px] text-paper-dim text-center">
        Tap the card. Only you can see it.
      </p>

      <div className="flip-scene w-64 h-80">
        <button
          onClick={() => setFlipped(true)}
          aria-label={flipped ? "Your word" : "Reveal your word"}
          className={`flip-card relative w-full h-full ${
            flipped ? "is-flipped" : ""
          }`}
        >
          {/* Card back */}
          <div className="flip-face absolute inset-0 rounded-3xl bg-ink-raised border border-ink-line flex items-center justify-center">
            <div className="w-20 h-20 rounded-full border border-gold-dim flex items-center justify-center">
              <span className="font-display italic text-3xl text-gold-dim">
                W
              </span>
            </div>
          </div>

          {/* Card front */}
          <div
            className={`flip-face flip-face-back absolute inset-0 rounded-3xl border flex flex-col items-center justify-center px-6 ${
              isMrWhite
                ? "bg-red-dim border-red"
                : "bg-teal-dim border-teal"
            }`}
          >
            {isMrWhite ? (
              <>
                <p className="font-sans text-[12px] text-paper/70 mb-3 uppercase tracking-wide">
                  You are Mr. White
                </p>
                <p className="font-display italic text-2xl text-paper text-center leading-tight">
                  No word for you.
                </p>
                <p className="font-sans text-[13px] text-paper/60 mt-3 text-center leading-relaxed">
                  Bluff your way through. Listen closely and guess the word
                  from what others say.
                </p>
              </>
            ) : (
              <>
                <p className="font-sans text-[12px] text-paper/60 mb-3 uppercase tracking-wide">
                  Your word
                </p>
                <p className="font-display font-semibold text-4xl text-paper text-center leading-tight">
                  {me?.word}
                </p>
              </>
            )}
          </div>
        </button>
      </div>

      {flipped && (
        <p className="font-sans text-[13px] text-paper-dim text-center leading-relaxed max-w-xs">
          Keep it to yourself. When it&apos;s your turn, say one word or short
          phrase that relates to it — without giving it away.
        </p>
      )}

      {isHost ? (
        <Button
          variant="gold"
          onClick={() => advancePhase(room.code, "discussion")}
          className="w-full"
        >
          Everyone&apos;s seen their word — begin
        </Button>
      ) : (
        <p className="font-sans text-[14px] text-paper-dim text-center">
          {firstPlayerName
            ? `${firstPlayerName} goes first once the host begins.`
            : "Waiting for the host to begin."}
        </p>
      )}
    </div>
  );
}
