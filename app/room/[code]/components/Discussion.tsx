"use client";

import Button from "@/components/Button";
import { Room } from "@/lib/types";
import { advancePhase } from "@/lib/useRoom";

export default function Discussion({
  room,
  isHost,
}: {
  room: Room;
  isHost: boolean;
}) {
  const turnOrder = (room.turnOrder || []).filter(
    (id) => !room.players[id]?.eliminated
  );

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-sm">
      <div className="text-center">
        <p className="font-sans text-[13px] text-gold-dim mb-2">
          Round {room.roundNumber}
        </p>
        <h2 className="font-display italic font-semibold text-3xl text-paper">
          Speaking order
        </h2>
        <p className="font-sans text-[14px] text-paper-dim mt-3 leading-relaxed">
          Going in order, everyone says one word or short clue about their
          word. No repeats, no blurting the word itself.
        </p>
      </div>

      <ol className="w-full flex flex-col gap-2">
        {turnOrder.map((id, i) => (
          <li
            key={id}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-ink-raised border border-ink-line"
          >
            <span className="font-display text-gold text-[15px] w-5">
              {i + 1}
            </span>
            <span className="font-sans text-paper text-[15px]">
              {room.players[id]?.name}
            </span>
          </li>
        ))}
      </ol>

      {isHost ? (
        <Button
          variant="gold"
          onClick={() => advancePhase(room.code, "voting")}
          className="w-full"
        >
          Move to voting
        </Button>
      ) : (
        <p className="font-sans text-[14px] text-paper-dim text-center">
          The host will open voting once discussion wraps up.
        </p>
      )}
    </div>
  );
}
