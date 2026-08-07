"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Scroll-linked image sequence on a canvas — the technique Apple uses on the
 * AirPods page. Every frame is a separate JPEG; scroll position picks which one
 * is painted, so scrubbing back and forth is instant and never re-decodes.
 *
 * Everything this needs lives in this file: loading, painting, the ScrollTrigger
 * wiring, and the loading state. Drop it in and give it a frame count and a path
 * builder.
 *
 * Why a canvas rather than 240 stacked <img> elements: the browser would keep
 * every decoded bitmap in layout and composite them all, which costs memory and
 * forces a paint per frame. One canvas paints one bitmap.
 *
 * The painting helpers live outside the component on purpose — they are pure
 * functions of their arguments, which keeps them out of every effect's
 * dependency list and lets React's compiler reason about the component.
 */

type Fit = "contain" | "cover";

type ScrollSequenceProps = {
  /** Number of frames in the sequence. */
  frameCount?: number;
  /** Builds the URL for frame `index` (1-based). */
  frameUrl?: (index: number) => string;
  /**
   * How far the page scrolls, as a multiple of viewport height, to play the
   * sequence once. Higher means slower and more deliberate.
   */
  scrollLength?: number;
  /**
   * "contain" shows the whole frame, letterboxed and centred — the honest
   * default when frames carry text or UI, because pinning a 16:9 source to a
   * full-height section crops hard enough to cut words off. "cover" fills the
   * section edge to edge and crops, which is right for footage shot for it.
   */
  fit?: Fit;
  /**
   * Aspect ratio of the visible band, width over height. Matching the frames'
   * own ratio is what makes the sequence run full width with no letterboxing;
   * pass something taller only if you want a cropped band.
   */
  aspectRatio?: number;
  /**
   * Fills the letterbox bars and the section behind the canvas. Black suits
   * footage; a page-matching colour suits a banner that should sit in the
   * layout rather than punch a hole in it.
   */
  background?: string;
  className?: string;
};

/** Frames are named ezgif-frame-001.jpg through ezgif-frame-240.jpg. */
function defaultFrameUrl(index: number): string {
  return `/banner/ezgif-frame-${String(index).padStart(3, "0")}.jpg`;
}

/**
 * Load images a few at a time.
 *
 * Firing 240 requests at once buries the connection pool and delays the first
 * frame — the one frame the visitor is actually waiting to see. A small window
 * gets the early frames in quickly while the rest stream in behind them.
 */
const CONCURRENCY = 8;

/**
 * Fraction of frames that must be decoded before the sequence takes over the
 * scroll. Below this the component shows what it has plus a progress bar,
 * rather than pinning the page to an animation that would stutter.
 */
const READY_THRESHOLD = 0.35;

/**
 * The loaded frame nearest to `index`, or -1 if nothing is loaded yet.
 *
 * This is what keeps a half-loaded sequence watchable: a gap would otherwise
 * flash the canvas empty mid-scroll.
 */
function nearestLoaded(loaded: boolean[], index: number): number {
  if (loaded[index]) return index;

  let back = -1;
  for (let i = index; i >= 0; i -= 1) {
    if (loaded[i]) {
      back = i;
      break;
    }
  }

  let forward = -1;
  for (let i = index; i < loaded.length; i += 1) {
    if (loaded[i]) {
      forward = i;
      break;
    }
  }

  if (back === -1) return forward;
  if (forward === -1) return back;
  return index - back <= forward - index ? back : forward;
}

/** Paint one frame, scaled per `fit` and centred. Returns whether it painted. */
function paintFrame(
  canvas: HTMLCanvasElement,
  frames: (HTMLImageElement | undefined)[],
  loaded: boolean[],
  index: number,
  fit: Fit,
  background: string,
): boolean {
  const resolved = nearestLoaded(loaded, index);
  if (resolved === -1) return false;

  const image = frames[resolved];
  if (!image) return false;

  const context = canvas.getContext("2d", { alpha: false });
  if (!context) return false;

  const { width, height } = canvas;

  const scale =
    fit === "cover"
      ? Math.max(width / image.naturalWidth, height / image.naturalHeight)
      : Math.min(width / image.naturalWidth, height / image.naturalHeight);

  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;

  // Letterboxing leaves bare canvas, which would otherwise keep the previous
  // frame's edges showing around this one.
  if (fit === "contain") {
    context.fillStyle = background;
    context.fillRect(0, 0, width, height);
  }

  context.drawImage(
    image,
    (width - drawWidth) / 2,
    (height - drawHeight) / 2,
    drawWidth,
    drawHeight,
  );

  return true;
}

/**
 * Match the backing store to the CSS box times the device pixel ratio, so the
 * sequence is sharp on a phone rather than upscaled from CSS pixels. Capped at
 * 2 — a 3x backing store triples the fill cost for no visible gain.
 *
 * Returns true when the size actually changed, since resizing clears the canvas
 * and the caller then has to repaint.
 */
function sizeCanvasToBox(canvas: HTMLCanvasElement): boolean {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const rect = canvas.getBoundingClientRect();
  const width = Math.round(rect.width * ratio);
  const height = Math.round(rect.height * ratio);

  if (canvas.width === width && canvas.height === height) return false;

  canvas.width = width;
  canvas.height = height;
  return true;
}

export function ScrollSequence({
  frameCount = 240,
  frameUrl = defaultFrameUrl,
  scrollLength = 4,
  fit = "contain",
  aspectRatio = 16 / 9,
  background = "#000000",
  className,
}: ScrollSequenceProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentFrameRef = useRef(-1);
  // Set by the loading effect, read by the scroll effect — so a frame landing
  // never re-runs the ScrollTrigger setup.
  const paintRef = useRef<((index: number) => void) | null>(null);

  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const frames: (HTMLImageElement | undefined)[] = new Array(frameCount);
    const loaded: boolean[] = new Array(frameCount).fill(false);

    const paint = (index: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      if (paintFrame(canvas, frames, loaded, index, fit, background)) {
        currentFrameRef.current = index;
      }
    };

    paintRef.current = paint;

    const resize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      if (sizeCanvasToBox(canvas)) paint(Math.max(currentFrameRef.current, 0));
    };

    resize();
    const observer = new ResizeObserver(resize);
    if (canvasRef.current) observer.observe(canvasRef.current);

    let done = 0;
    let failures = 0;
    let next = 0;

    const startNext = (): void => {
      if (cancelled || next >= frameCount) return;

      const index = next++;
      const image = new Image();
      // Decoding off the main thread keeps the first paint from janking.
      image.decoding = "async";
      image.src = frameUrl(index + 1);

      const settle = (ok: boolean) => {
        if (cancelled) return;

        if (ok) {
          frames[index] = image;
          loaded[index] = true;
        } else {
          failures += 1;
        }

        done += 1;
        setProgress(done / frameCount);

        // Most frames failing means the path is wrong — say so, rather than
        // pinning the page to a blank canvas.
        if (failures > frameCount / 2) setFailed(true);
        if (done / frameCount >= READY_THRESHOLD) setReady(true);

        // Show something the moment there is something to show.
        if (currentFrameRef.current === -1) paint(0);

        startNext();
      };

      image.onload = () => settle(true);
      image.onerror = () => settle(false);
    };

    for (let i = 0; i < Math.min(CONCURRENCY, frameCount); i += 1) startNext();

    return () => {
      cancelled = true;
      observer.disconnect();
      paintRef.current = null;
      currentFrameRef.current = -1;
    };
  }, [frameCount, frameUrl, fit, background]);

  useEffect(() => {
    if (!ready || failed) return;

    const section = sectionRef.current;
    if (!section) return;

    // Honour a reduced-motion preference: keep the artwork, drop the
    // scroll-jacking. The canvas holds its first frame as a still image.
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) {
      paintRef.current?.(0);
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const state = { frame: 0 };

    const tween = gsap.to(state, {
      frame: frameCount - 1,
      ease: "none",
      snap: "frame",
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: `+=${window.innerHeight * scrollLength}`,
        pin: true,
        // A small scrub smooths the wheel's own discrete steps without lagging
        // behind a finger on a touch screen.
        scrub: 0.4,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
      onUpdate: () => {
        const index = Math.round(state.frame);
        // One draw per frame index; repainting the same frame is wasted fill.
        if (index !== currentFrameRef.current) paintRef.current?.(index);
      },
    });

    // Pinning changes document height, so let ScrollTrigger re-measure once
    // layout has settled.
    ScrollTrigger.refresh();

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [ready, failed, frameCount, scrollLength]);

  const percent = Math.round(progress * 100);

  return (
    <section
      ref={sectionRef}
      className={className}
      aria-label="Scroll-driven animation"
    >
      {/* Full-bleed band sized to the frames' own ratio, so the sequence runs
          edge to edge with nothing letterboxed away. Capped at the viewport
          height so an unusually tall ratio cannot push the page around. */}
      <div
        className="relative w-full overflow-hidden"
        style={{ aspectRatio, maxHeight: "100dvh", backgroundColor: background }}
      >
        {/* Decorative: the section carries the accessible name. */}
        <canvas ref={canvasRef} className="block h-full w-full" role="none" />

        {/* Held above the canvas rather than replacing it, so the first decoded
            frame shows through underneath as soon as it lands. */}
        {!ready && !failed && (
          <div
            className="absolute inset-0 grid place-items-center bg-black/70 backdrop-blur-sm"
            role="status"
            aria-live="polite"
          >
            <div className="w-56 text-center">
              <div
                className="h-1 w-full overflow-hidden rounded-full bg-white/20"
                role="progressbar"
                aria-valuenow={percent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Loading animation frames"
              >
                <div
                  className="h-full rounded-full bg-white transition-[width] duration-200 ease-out"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <p className="mt-3 text-sm text-white/80">
                Loading animation… {percent}%
              </p>
            </div>
          </div>
        )}

        {/* Frames could not be fetched: show the first one as a plain image so
            the section is still a picture rather than a black hole. */}
        {failed && (
          /* Deliberately not next/image: this is the fallback for a path that
             has already failed, and re-encoding through the optimizer would
             add another way for it to fail. */
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={frameUrl(1)}
            alt=""
            className="absolute inset-0 h-full w-full object-contain"
          />
        )}
      </div>
    </section>
  );
}
