import { Player } from "@/lib/types";

export default function PlayerList({
  players,
  selfId,
}: {
  players: Player[];
  selfId: string;
}) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {players.map((p) => (
        <div
          key={p.id}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border font-sans text-[14px] ${
            p.eliminated
              ? "border-ink-line text-paper-dim/50 line-through"
              : p.connected
              ? "border-ink-line text-paper"
              : "border-ink-line text-paper-dim/40"
          } ${p.id === selfId ? "bg-ink-raised" : ""}`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              p.connected ? "bg-teal" : "bg-paper-dim/30"
            }`}
          />
          {p.name}
          {p.isHost && <span className="text-gold-dim text-[11px]">host</span>}
        </div>
      ))}
    </div>
  );
}
