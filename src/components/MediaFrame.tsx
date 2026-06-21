"use client";

import { useState } from "react";
import type { MediaItem } from "@/lib/types";

function hashHue(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
  return h;
}

function Fallback({ label }: { label: string }) {
  const hue = hashHue(label);
  return (
    <div
      className="absolute inset-0 flex items-end p-5"
      style={{
        background: `linear-gradient(135deg, hsl(${hue} 38% 20%), hsl(${
          (hue + 40) % 360
        } 45% 12%))`,
      }}
    >
      <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/55">
        {label}
      </span>
    </div>
  );
}

export function MediaFrame({
  item,
  label,
  priority = false,
}: {
  item: MediaItem;
  label: string;
  priority?: boolean;
}) {
  const [broken, setBroken] = useState(false);

  if (item.type === "video") {
    return (
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-ink-deep">
        <iframe
          src={item.url}
          title={item.caption ?? label}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <figure className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-ink-deep">
      {broken ? (
        <Fallback label={label} />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.url}
          alt={item.caption ?? label}
          loading={priority ? "eager" : "lazy"}
          onError={() => setBroken(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      {item.caption && !broken && (
        <figcaption className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-ink-deep/80 to-transparent px-4 pb-3 pt-8 font-mono text-[11px] uppercase tracking-[0.18em] text-white/75">
          {item.caption}
        </figcaption>
      )}
    </figure>
  );
}
