"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

export type LightboxPhoto = {
  id: string;
  fullUrl: string;
  thumbUrl: string;
  caption: string | null;
};

export default function Lightbox({ photos }: { photos: LightboxPhoto[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  const close = useCallback(() => {
    setOpenIndex(null);
    dialogRef.current?.close();
  }, []);

  const open = useCallback((index: number) => {
    setOpenIndex(index);
    const dlg = dialogRef.current;
    if (dlg && !dlg.open) dlg.showModal();
  }, []);

  const showPrev = useCallback(() => {
    setOpenIndex((i) => (i === null ? null : (i - 1 + photos.length) % photos.length));
  }, [photos.length]);

  const showNext = useCallback(() => {
    setOpenIndex((i) => (i === null ? null : (i + 1) % photos.length));
  }, [photos.length]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (openIndex === null) return;
      if (e.key === "ArrowLeft") showPrev();
      else if (e.key === "ArrowRight") showNext();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [openIndex, showPrev, showNext]);

  const current = openIndex !== null ? photos[openIndex] : null;

  return (
    <>
      <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {photos.map((photo, index) => (
          <li key={photo.id}>
            <button
              type="button"
              onClick={() => open(index)}
              className="block aspect-square w-full overflow-hidden rounded-xl bg-[color:var(--color-omas-cream)] ring-1 ring-[color:var(--color-border)] transition active:scale-[0.98] hover:ring-[color:var(--color-omas-teal)]/40"
              aria-label={photo.caption ?? "Ouvrir la photo"}
            >
              <Image
                src={photo.thumbUrl}
                alt={photo.caption ?? ""}
                width={300}
                height={300}
                className="h-full w-full object-cover"
                unoptimized
              />
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        onClose={close}
        onClick={(e) => {
          if (e.target === dialogRef.current) close();
        }}
        className="m-0 h-full max-h-none w-full max-w-none bg-black/90 p-0 backdrop:bg-black/60"
      >
        {current && (
          <div className="relative flex h-dvh w-dvw items-center justify-center">
            <button
              type="button"
              onClick={close}
              aria-label="Fermer"
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white text-xl backdrop-blur transition hover:bg-white/25"
            >
              ✕
            </button>

            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={showPrev}
                  aria-label="Photo précédente"
                  className="absolute left-2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white text-2xl backdrop-blur transition hover:bg-white/25"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={showNext}
                  aria-label="Photo suivante"
                  className="absolute right-2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white text-2xl backdrop-blur transition hover:bg-white/25"
                >
                  ›
                </button>
              </>
            )}

            <div className="relative flex h-full w-full items-center justify-center p-4">
              <Image
                src={current.fullUrl}
                alt={current.caption ?? ""}
                width={1600}
                height={1600}
                className="max-h-[88dvh] w-auto object-contain"
                unoptimized
              />
            </div>

            {current.caption && (
              <p className="absolute bottom-6 left-1/2 -translate-x-1/2 max-w-[88%] text-center text-sm text-white/90">
                {current.caption}
              </p>
            )}
          </div>
        )}
      </dialog>
    </>
  );
}
