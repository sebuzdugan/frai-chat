"use client";

import clsx from "clsx";
import { MODE_ORDER, MODES, type ModeId } from "@/lib/modes";

type Props = {
  value: ModeId;
  onChange: (mode: ModeId) => void;
};

export function ModeSelector({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
      {MODE_ORDER.map((id) => {
        const mode = MODES[id];
        const active = id === value;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={clsx(
              "rounded-lg border p-3 text-left transition",
              active
                ? "border-[#141712] bg-[#141712] text-white shadow-sm"
                : "border-[#d6dccf] bg-white text-[#141712] hover:bg-[#eef2e7]",
            )}
          >
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-80">
              {active ? "Active mode" : "Mode"}
            </div>
            <div className="mt-1 text-sm font-black">{mode.label}</div>
            <div
              className={clsx(
                "mt-1 text-[11px] leading-snug",
                active ? "text-[#c8d2c3]" : "text-[#526050]",
              )}
            >
              {mode.tagline}
            </div>
          </button>
        );
      })}
    </div>
  );
}
