"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

export default function MessagesPage() {
  const { applicationId } = useParams();
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { router.push("/login"); return; }
      setSession(data.session);
    });
    load();

    const channel = supabase
      .channel(`messages-${applicationId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `application_id=eq.${applicationId}` }, (payload) => {
        setMessages((prev) => [...prev, payload.new]);
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [applicationId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);

  async function load() {
    const { data } = await supabase.from("messages").select("*").eq("application_id", applicationId).order("created_at", { ascending: true });
    setMessages(data || []);
  }

  async function send() {
    if (!draft.trim() || !session) return;
    await supabase.from("messages").insert({ application_id: applicationId, sender_id: session.user.id, body: draft.trim() });
    setDraft("");
  }

  return (
    <div className="container" style={{ padding: "40px 32px 80px" }}>
      <h1 style={{ fontSize: 22, marginBottom: 18 }}>Nachrichten</h1>
      <div className="panel" style={{ display: "flex", flexDirection: "column", height: 460, padding: 0, overflow: "hidden" }}>
        <div style={{ flex: 1, padding: 20, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
          {messages.map((m) => (
            <div key={m.id} style={{ display: "flex", justifyContent: m.sender_id === session?.user.id ? "flex-end" : "flex-start" }}>
              <div style={{
                maxWidth: "70%",
                background: m.sender_id === session?.user.id ? "var(--pine)" : "#E7ECE2",
                color: m.sender_id === session?.user.id ? "var(--paper)" : "#31463D",
                padding: "9px 14px", borderRadius: 10, fontSize: 14,
              }}>
                {m.body}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <div style={{ display: "flex", gap: 10, padding: 14, borderTop: "1px solid var(--line)" }}>
          <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Nachricht schreiben…" style={{ flex: 1 }} />
          <button className="btn-primary" onClick={send}>Senden</button>
        </div>
      </div>
    </div>
  );
}
