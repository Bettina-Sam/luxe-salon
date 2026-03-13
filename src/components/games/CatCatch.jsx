import { useEffect, useRef, useState } from "react";
import { InstructionCard, HUD, EndScreen } from "./GameKit";

/** Cat Catch — fixed loop + immediate draw */
export default function CatCatch({ onExit, onPoints }) {
  const cvRef = useRef(null);
  const raf = useRef(0);
  const ro = useRef(null); // ResizeObserver

  const [phase, setPhase] = useState("intro"); // intro | play | end
  const [time, setTime] = useState(45);
  const [score, setScore] = useState(0);
  const [resultPts, setResultPts] = useState(0);

  // game state
  const S = useRef({
    W: 800, H: 450,
    player: { x: 400, w: 110, vx: 0, speed: 460, stunned: 0 },
    items: [],
    spawn: 0,
    tPrev: 0,
    dragging: false,
    dragOffset: 0,
    frames: 0,
  });

  const start = () => {
    setScore(0);
    setTime(45);
    setPhase("play");
    const s = S.current;
    s.items = [];
    s.spawn = 0.2; // spawn quickly at start
    s.player.x = s.W/2;
    s.player.vx = 0;
    s.player.stunned = 0;
    s.frames = 0;
  };

  // countdown
  useEffect(() => {
    if (phase !== "play") return;
    const iv = setInterval(() => setTime(t => Math.max(0, t - 1)), 1000);
    return () => clearInterval(iv);
  }, [phase]);

  useEffect(() => {
    if (phase === "play" && time === 0) finish();
  }, [time, phase]);

  const finish = () => {
    cancelAnimationFrame(raf.current);
    const pts = Math.max(1, Math.floor(score / 10));
    setResultPts(pts);
    onPoints?.(pts);
    setPhase("end");
  };

  // keyboard
  useEffect(() => {
    if (phase !== "play") return;
    const kd = (e) => {
      const k = e.key.toLowerCase();
      if (k === "arrowleft" || k === "a") S.current.player.vx = -1;
      if (k === "arrowright" || k === "d") S.current.player.vx = 1;
    };
    const ku = (e) => {
      const k = e.key.toLowerCase();
      if (k === "arrowleft" || k === "a" || k === "arrowright" || k === "d") S.current.player.vx = 0;
    };
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    return () => { window.removeEventListener("keydown", kd); window.removeEventListener("keyup", ku); };
  }, [phase]);

  // drag/touch
  useEffect(() => {
    if (phase !== "play") return;
    const cv = cvRef.current;
    const s = S.current;

    const getX = (e) => {
      const rect = cv.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      return ((clientX - rect.left) / rect.width) * s.W;
    };
    const down = (e) => { e.preventDefault(); s.dragging = true; s.dragOffset = getX(e) - s.player.x; };
    const move = (e) => { if (!s.dragging) return; s.player.x = clamp(getX(e) - s.dragOffset, s.player.w*0.35, s.W - s.player.w*0.35); };
    const up = () => { s.dragging = false; };

    cv.addEventListener("mousedown", down);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    cv.addEventListener("touchstart", down, { passive:false });
    window.addEventListener("touchmove", move, { passive:false });
    window.addEventListener("touchend", up);
    return () => {
      cv.removeEventListener("mousedown", down);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      cv.removeEventListener("touchstart", down);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", up);
    };
  }, [phase]);

  // ---- DRAW LOOP (robust)
  useEffect(() => {
    if (phase !== "play") return;

    const cv = cvRef.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return; // safety

    // ensure pixel size (ResizeObserver)
    const applySize = () => {
      const W = Math.max(320, Math.floor(cv.clientWidth));
      const H = Math.round(W * 9 / 16);
      cv.width = W; cv.height = H;
      const s = S.current;
      s.W = W; s.H = H;
      s.player.w = Math.max(90, Math.min(150, W * 0.14));
      // draw one immediate frame so you see something even before RAF ticks
      draw(ctx, 0);
    };
    applySize();
    ro.current?.disconnect?.();
    ro.current = new ResizeObserver(applySize);
    ro.current.observe(cv);

    let tPrev = performance.now();
    const step = (tNow) => {
      const s = S.current;
      const dt = Math.min(0.04, (tNow - tPrev) / 1000);
      tPrev = tNow;
      s.tPrev = tNow;
      draw(ctx, dt);
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf.current);
      ro.current?.disconnect?.();
    };
  }, [phase]);

  // core renderer
  const draw = (ctx, dt) => {
    const s = S.current;
    s.frames++;

    // background
    const grd = ctx.createLinearGradient(0, 0, 0, s.H);
    grd.addColorStop(0, "#0f1320"); grd.addColorStop(0.55, "#141b2b"); grd.addColorStop(1, "#0b111d");
    ctx.fillStyle = grd; ctx.fillRect(0, 0, s.W, s.H);

    // simple parallax bits
    ctx.fillStyle = "rgba(255,255,255,0.03)";
    for (let i=0;i<6;i++){
      const x = (i * s.W/6) + 20;
      const h = s.H * (0.15 + (i%2)*0.06);
      ctx.fillRect(x, s.H*0.15, 6, h);
    }
    ctx.fillStyle = "#0a0f19"; ctx.fillRect(0, s.H*0.82, s.W, s.H*0.18);

    // spawn items (quicker at start)
    s.spawn -= dt || 0.016;
    if (s.spawn <= 0) {
      s.spawn = 0.28 + Math.random()*0.35;
      const r = Math.random();
      const kind = r < 0.75 ? "glow" : r < 0.9 ? "bottle" : "star";
      s.items.push({
        x: 30 + Math.random()*(s.W-60),
        y: -30,
        vy: 120 + Math.random()*160,
        kind,
        rot: (Math.random()*2-1)*0.004
      });
    }

    // move player
    if (s.player.stunned > 0) s.player.stunned -= dt;
    if (!s.dragging && s.player.vx !== 0 && s.player.stunned <= 0) {
      s.player.x += s.player.vx * s.player.speed * (dt || 0.016);
    }
    s.player.x = clamp(s.player.x, s.player.w*0.35, s.W - s.player.w*0.35);

    // update items
    s.items.forEach(o => o.y += o.vy * (dt || 0.016));

    // draw items + collision
    const bowlY = s.H*0.82 - 18;
    const catchW = s.player.w * 0.7;
    const newItems = [];
    for (const o of s.items) {
      ctx.save();
      ctx.translate(o.x, o.y);
      ctx.rotate(s.frames*o.rot);
      emoji(ctx, o.kind === "glow" ? "✨" : o.kind === "star" ? "⭐" : "🧴", 0, 0, 26);
      ctx.restore();

      const isCatchZone = (o.y > bowlY-10 && o.y < bowlY+18);
      const nearX = Math.abs(o.x - s.player.x) < catchW/2;

      if (isCatchZone && nearX) {
        if (o.kind === "glow") { setScore(v => v + 5); sparkle(ctx, o.x, bowlY); }
        else if (o.kind === "star") { setScore(v => v + 15); starburst(ctx, o.x, bowlY); }
        else { s.player.stunned = 1.0; }
      } else if (o.y < s.H + 40) {
        newItems.push(o);
      }
    }
    s.items = newItems;

    // cat + bowl
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.beginPath(); ctx.ellipse(s.player.x, s.H*0.82+8, s.player.w*0.45, 10, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.1)";
    ctx.fillRect(s.player.x - s.player.w*0.35, s.H*0.82 - 4, s.player.w*0.7, 8);
    const wob = Math.sin(s.frames*0.05) * (s.player.stunned > 0 ? 6 : 3);
    emoji(ctx, s.player.stunned > 0 ? "😵‍💫" : "🐱", s.player.x, s.H*0.82 - 26 + wob, 36);

    // tiny debug overlay so you KNOW it's drawing
    ctx.fillStyle = "rgba(255,255,255,.5)";
    ctx.font = "12px system-ui"; ctx.textAlign = "left"; ctx.textBaseline = "top";
    ctx.fillText(`${s.W}×${s.H}`, 8, 6);
  };

  return (
    <div className="catcatch">
      {phase === "intro" && (
        <InstructionCard
          title="Cat Catch"
          lines={[
            "Move with ←/→ or A/D. You can also drag/touch.",
            "Catch ✨ (+5) and ⭐ (+15). Avoid 🧴 (stuns).",
            "You’ve got 45 seconds — meow-sive score wins!",
          ]}
          onStart={start}
        />
      )}

      {phase === "play" && (
        <>
          <HUD time={time} score={score} hint="Catch the glow!" emoji="🐱🫧" />
          <canvas ref={cvRef} className="cv" width="800" height="450" />
        </>
      )}

      {phase === "end" && (
        <EndScreen
          title="Cat Catch — Results"
          score={score}
          points={resultPts}
          onAgain={() => setPhase("intro")}
          onExit={onExit}
        />
      )}

      <style>{`
  .catcatch { display:grid; gap:10px; }
  .cv {
    width:100%; max-width: 980px; aspect-ratio:16/9;
    background:transparent; /* Let JS draw background */
    border-radius:12px;
    box-shadow:0 14px 36px rgba(0,0,0,.28);
    margin:auto; display:block;
  }
    .catcatch {
  background:#0b111d;
  padding:12px;
  border-radius:12px;
}

`}</style>

    </div>
  );
}

/* helpers */
function emoji(ctx, ch, x, y, size=28) {
  ctx.font = `${size}px system-ui, Apple Color Emoji, Segoe UI Emoji`;
  ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(ch, x, y);
}
function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }
function sparkle(ctx, x, y) {
  ctx.save(); ctx.fillStyle = "rgba(255,255,255,.8)";
  for (let i=0;i<6;i++){ const a=(i/6)*Math.PI*2; const r=6+Math.random()*6;
    ctx.beginPath(); ctx.arc(x+Math.cos(a)*r, y+Math.sin(a)*r, 1.8, 0, Math.PI*2); ctx.fill(); }
  ctx.restore();
}
function starburst(ctx, x, y) {
  ctx.save(); ctx.strokeStyle = "rgba(255,215,90,.9)";
  for (let i=0;i<8;i++){ const a=(i/8)*Math.PI*2; ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+Math.cos(a)*14,y+Math.sin(a)*14); ctx.stroke(); }
  ctx.restore();
}
