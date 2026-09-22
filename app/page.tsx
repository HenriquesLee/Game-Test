"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import { createRoom, joinRoom, getSavedName } from "@/lib/useRoom";

export default function Home() {
  const router = useRouter();
  const [mode, setMode] = useState<"idle" | "create" | "join">("idle");
  const [name, setName] = useState(() => getSavedName());
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleCreate() {
    if (!name.trim()) {
      setError("Enter your name first.");
      return;
    }
    setError("");
    setBusy(true);
    try {
      const roomCode = await createRoom(name.trim());
      router.push(`/room/${roomCode}`);
    } catch {
      setError("Couldn't create a room. Check your connection and try again.");
      setBusy(false);
    }
  }

  async function handleJoin() {
    if (!name.trim()) {
      setError("Enter your name first.");
      return;
    }
    if (!code.trim()) {
      setError("Enter the room code.");
      return;
    }
    setError("");
    setBusy(true);
    const result = await joinRoom(code.trim(), name.trim());
    if (!result.ok) {
      setError(result.error || "Couldn't join that room.");
      setBusy(false);
      return;
    }
    router.push(`/room/${code.trim().toUpperCase()}`);
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center mb-12">
          <p className="font-sans text-[13px] text-gold-dim mb-3">
            A word-deduction party game
          </p>
          <h1 className="font-display italic font-semibold text-5xl text-paper leading-none">
            Mr. White
          </h1>
          <p className="font-sans text-[15px] text-paper-dim mt-4 leading-relaxed">
            Everyone at the table gets a secret word — almost everyone.
          </p>
        </div>

        {mode === "idle" && (
          <div className="flex flex-col gap-3">
            <Button variant="gold" onClick={() => setMode("create")}>
              Start a new game
            </Button>
            <Button variant="ghost" onClick={() => setMode("join")}>
              Join with a code
            </Button>
          </div>
        )}

        {(mode === "create" || mode === "join") && (
          <div className="flex flex-col gap-4">
            <div>
              <label className="font-sans text-[13px] text-paper-dim block mb-2">
                Your name
              </label>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={20}
                placeholder="e.g. Lee"
                className="w-full bg-ink-raised border border-ink-line rounded-2xl px-4 py-3.5 text-paper font-sans placeholder:text-paper-dim/50 focus:border-gold outline-none"
              />
            </div>

            {mode === "join" && (
              <div>
                <label className="font-sans text-[13px] text-paper-dim block mb-2">
                  Room code
                </label>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  maxLength={5}
                  placeholder="ABCDE"
                  className="w-full bg-ink-raised border border-ink-line rounded-2xl px-4 py-3.5 text-paper font-sans tracking-[0.3em] uppercase placeholder:tracking-[0.3em] placeholder:text-paper-dim/50 focus:border-gold outline-none"
                />
              </div>
            )}

            {error && (
              <p className="text-red text-[14px] font-sans -mt-1">{error}</p>
            )}

            <div className="flex flex-col gap-3 mt-2">
              <Button
                variant="gold"
                disabled={busy}
                onClick={mode === "create" ? handleCreate : handleJoin}
              >
                {busy
                  ? "One moment…"
                  : mode === "create"
                  ? "Create room"
                  : "Join room"}
              </Button>
              <Button
                variant="ghost"
                disabled={busy}
                onClick={() => {
                  setMode("idle");
                  setError("");
                }}
              >
                Back
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
