"use client";

import { useState } from "react";
import Image from "next/image";

// A poster that swaps itself for the player on click. Two eager YouTube
// iframes would pull roughly a megabyte of third-party script on page load,
// for videos most visitors never press play on.
export default function LiteVideo({
  videoId,
  src,
  thumb,
  title,
  square,
}: {
  videoId?: string;
  src?: string;
  thumb: string;
  title: string;
  square?: boolean;
}) {
  // A 1:1 social cut letterboxes badly in a 16:9 slot, so it keeps its shape.
  const ratio = square ? "aspect-square" : "aspect-video";
  const [playing, setPlaying] = useState(false);

  if (playing && src) {
    return (
      <div className={`relative ${ratio} w-full overflow-hidden bg-black`}>
        <video
          src={src}
          poster={thumb}
          controls
          autoPlay
          playsInline
          className="absolute inset-0 h-full w-full"
        />
      </div>
    );
  }

  if (playing && videoId) {
    return (
      <div className={`relative ${ratio} w-full overflow-hidden bg-black`}>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      data-cursor="link"
      onClick={() => setPlaying(true)}
      aria-label={`Play ${title}`}
      className={`group relative block ${ratio} w-full overflow-hidden bg-black`}
    >
      <Image
        src={thumb}
        alt=""
        fill
        sizes="(max-width: 768px) 100vw, 45vw"
        className="object-contain transition-opacity duration-500 group-hover:opacity-80"
      />
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full border border-fg/40 bg-black/40 backdrop-blur-sm transition-colors duration-300 group-hover:border-fg group-hover:bg-black/60">
          <span className="ml-0.5 block h-0 w-0 border-y-[7px] border-l-[11px] border-y-transparent border-l-fg" />
        </span>
      </span>
    </button>
  );
}
