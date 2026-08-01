"use client";

import { useState } from "react";
import { ShineButton } from "@/components/ui/ShineButton";
import type { ActiveUser } from "@/lib/types";

export function NoteForm({
  appointmentId,
  activeUser,
  onNoteAdded,
}: {
  appointmentId: string;
  activeUser: ActiveUser;
  onNoteAdded: () => void;
}) {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId,
          authorId: activeUser.id,
          role: activeUser.role,
          content,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Eroare necunoscută");
      setContent("");
      onNoteAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eroare necunoscută");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Adaugă o notiță pentru această programare…"
        rows={2}
        className="w-full resize-none rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-gold/50"
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex justify-end">
        <ShineButton
          type="submit"
          variant="outline"
          disabled={submitting || !content.trim()}
          className="px-4 py-2 text-sm disabled:opacity-40"
        >
          {submitting ? "Se trimite…" : "Trimite notiță"}
        </ShineButton>
      </div>
    </form>
  );
}
