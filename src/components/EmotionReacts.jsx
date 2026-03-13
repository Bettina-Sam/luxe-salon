import { useEffect, useRef, useState } from "react";
import EmojiBurst from "./effects/EmojiBurst";
import ComplimentCard from "./effects/ComplimentCard";

/**
 * EmotionReacts
 * - watches the video feed
 * - detects smile / frown via MediaPipe Face Landmarker (blendshapes), with a canvas fallback
 * - fires compliments / cheer-ups + emoji bursts
 */
export default function EmotionReacts({
  videoRef,
  enabled = true,
  onEvent, // optional callback: ('smile'|'sad', score) => void
}) {
  const [pop, setPop] = useState(null); // { type:'smile'|'sad', x, y, msg }
  const lmRef = useRef(null);           // MediaPipe landmarker
  const rafRef = useRef(0);
  const lastFired = useRef({ smile: 0, sad: 0 });
  const hold = useRef({ kind: null, t0: 0, lastScore: 0 });

  const SMILE_TH = 0.65;                 // tuned for blendshapes
  const SAD_TH   = 0.60;
  const SMILE_HOLD_MS = 500;
  const SAD_HOLD_MS   = 1000;
  const COOLDOWN_MS   = 6000;

  const compliments = [
    "That smile is everything ✨",
    "You’re glowing today 💖",
    "Iconic. Keep it! 😎",
    "The camera loves you 📸",
  ];
  const cheers = [
    "You’ve got this 🌈",
    "Chin up — you’re beautiful 💫",
    "Sending a little sunshine ☀️",
    "One deep breath — better already 💕",
  ];

  // Try to init MediaPipe Face Landmarker (with blendshapes)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const visionPkg = await import(
          /* webpackIgnore: true */ "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest"
        );
        const { FaceLandmarker, FilesetResolver } = visionPkg;
        const fileset = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        const landmarker = await FaceLandmarker.createFromOptions(fileset, {
          baseOptions: {
            modelAssetPath:
              "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm/face_landmarker.task",
          },
          runningMode: "VIDEO",
          numFaces: 1,
          outputFaceBlendshapes: true,
        });
        if (!cancelled) lmRef.current = landmarker;
      } catch {
        // No-op: will use fallback.
      }
    })();
    return () => {
      cancelled = true;
      try { lmRef.current?.close(); } catch {}
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const loop = async () => {
      const v = videoRef?.current;
      if (!v || !v.videoWidth) { rafRef.current = requestAnimationFrame(loop); return; }

      let smileScore = 0, sadScore = 0;

      if (lmRef.current) {
        // MediaPipe path
        const now = performance.now();
        const res = await lmRef.current.detectForVideo(v, now);
        const blends = res?.faceBlendshapes?.[0]?.categories || [];
        // Common blendshape names for smile; frown proxies:
        // "mouthSmileLeft", "mouthSmileRight", "mouthFrownLeft", "mouthFrownRight", "browDownLeft/Right"
        const byName = Object.fromEntries(blends.map(b => [b.categoryName, b.score]));
        smileScore = (byName.mouthSmileLeft ?? 0 + byName.mouthSmileRight ?? 0) / 2;
        const frown = (byName.mouthFrownLeft ?? 0 + byName.mouthFrownRight ?? 0) / 2;
        const browDown = (byName.browDownLeft ?? 0 + byName.browDownRight ?? 0) / 2;
        sadScore = Math.max(frown, browDown);
      } else {
        // Fallback: quick mouth-corner heuristic
        const c = document.createElement("canvas");
        const W = 160, H = Math.round(160 * v.videoHeight / v.videoWidth);
        c.width = W; c.height = H;
        const ctx = c.getContext("2d");
        ctx.drawImage(v, 0, 0, W, H);
        // sample lower-middle region horizontally
        const y = Math.round(H * 0.62), span = Math.round(W * 0.5);
        const x0 = Math.round(W * 0.25), x1 = x0 + span;
        const left = sampleLuma(ctx, x0, y), mid = sampleLuma(ctx, Math.round(W/2), y);
        const right = sampleLuma(ctx, x1, y);
        // smile proxy: corners brighter than center (teeth/cheeks), very rough
        smileScore = clamp01(((left + right)/2 - mid) / 40);
        // sad proxy: center darker than upper midline
        const up = sampleLuma(ctx, Math.round(W/2), Math.round(H*0.45));
        sadScore = clamp01((up - mid) / 35);
      }

      const nowMs = performance.now();
      const fire = (type, score) => {
        const last = lastFired.current[type];
        if (nowMs - last < COOLDOWN_MS) return;
        lastFired.current[type] = nowMs;
        onEvent?.(type, score);
        // Place pop near top-right of video
        const rect = v.getBoundingClientRect();
        const x = rect.width - 24, y = 24;
        setPop({
          type,
          x,
          y,
          msg: type === "smile"
            ? randPick(compliments)
            : randPick(cheers),
        });
        setTimeout(() => setPop(null), 2400);
      };

      // hold logic to avoid flicker
      const kindNow =
        smileScore > SMILE_TH ? "smile" :
        sadScore   > SAD_TH   ? "sad"   : null;

      if (kindNow) {
        if (hold.current.kind !== kindNow) {
          hold.current = { kind: kindNow, t0: nowMs, lastScore: kindNow === "smile" ? smileScore : sadScore };
        } else {
          const dt = nowMs - hold.current.t0;
          if (kindNow === "smile" && dt >= SMILE_HOLD_MS) fire("smile", smileScore);
          if (kindNow === "sad"   && dt >= SAD_HOLD_MS)   fire("sad",   sadScore);
        }
      } else {
        hold.current = { kind: null, t0: 0, lastScore: 0 };
      }

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [enabled, videoRef]);

  return (
    <>
      {pop && (
        <>
          <ComplimentCard type={pop.type} msg={pop.msg} />
          <EmojiBurst type={pop.type} />
        </>
      )}
    </>
  );
}

// utils
function clamp01(x){ return Math.max(0, Math.min(1, x)); }
function randPick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function sampleLuma(ctx, x, y){
  const d = ctx.getImageData(Math.max(0,x-2), Math.max(0,y-2), 4, 4).data;
  let s=0,n=0; for (let i=0;i<d.length;i+=4){ s += 0.2126*d[i] + 0.7152*d[i+1] + 0.0722*d[i+2]; n++; }
  return s/(n||1);
}
