"use client";
import { useState } from "react";
import { CANTONS, flagUrl } from "../lib/cantons";

export default function CantonFlag({ code, size = 22 }) {
  const [failed, setFailed] = useState(false);
  const canton = CANTONS.find((c) => c.code === code);
  if (!canton) return null;

  if (failed) {
    return (
      <span
        style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: size, height: size, borderRadius: "50%", background: "var(--pine)",
          color: "#fff", fontSize: size * 0.32, fontWeight: 700, flexShrink: 0,
        }}
      >
        {code}
      </span>
    );
  }

  return (
    <img
      src={flagUrl(canton.flagFile, size * 3)}
      alt={`Flagge ${canton.name}`}
      width={size}
      height={size}
      onError={() => setFailed(true)}
      style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "1px solid var(--line)" }}
    />
  );
}
