import { useEffect, useRef, useState } from "react";
import { InstructionCard, HUD, EndScreen } from "./GameKit";

/**
 * Whack-a-Glow — tap glowing targets quickly—don’t let them fade.
 * - Click/tap targets ✨ (+10), ⭐ bonus (+25), avoid 💣 (−1 heart).
 * - Build combo for multipliers. 60s round, 3 hearts.
 */
export default function WhackAGlow({ onExit, onPoints }) {
  const cvRef = useRef(null);
  const raf = useRef(0);
  const ro  = useRef(null);

  const [phase, setPhase] = useState("intro"); // intro | play | end
  const [time, setTime] = useState(60);
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [note, setNote] = useState("Tap the glow!");
  const [ptsAwarded, setPtsAwarded] = useState(0);
  const [flash, setFlash] = useState(false);

  // world state
  const S = useRef({
    W: 960, H: 540,
    grid: { cols: 5, rows: 3, cell: 140, pad: 18, offX: 0, offY: 0 },
    tPrev: 0, tick: 0,
    items: [],           // active targets
    particles: [],
    spawn: 0.6,          // time until next spawn
    rate: { min: .35, max: .9 }, // spawn variability
    combo: 0,
  });

  const start = () => {
    setScore(0); setTime(60); setHearts(3); setNote("Tap the glow!");
    setFlash(false);
    const s = S.current;
    s.items = []; s.particles = []; s.spawn = 0.6; s.combo = 0;
    setPhase("play");
  };

  // timer
  useEffect(() => {
    if (phase !== "play") return;
    const iv = setInterval(() => setTime(t => Math.max(0, t - 1)), 1000);
    return () => clearInterval(iv);
  }, [phase]);

  useEffect(() => { if (phase === "play" && time === 0) end(); }, [time, phase]);

  // click / touch
  useEffect(() => {
    if (phase !== "play") return;
    const cv = cvRef.current;
    const onDown = (e) => {
      const rect = cv.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const x = ((clientX - rect.left) / rect.width) * S.current.W;
      const y = ((clientY - rect.top) / rect.height) * S.current.H;
      hit(x, y);
    };
    cv.addEventListener("mousedown", onDown);
    cv.addEventListener("touchstart", onDown, { passive: true });
    return () => {
      cv.removeEventListener("mousedown", onDown);
      cv.removeEventListener("touchstart", onDown);
    };
  }, [phase]);

  // loop + resize
  useEffect(() => {
    if (phase !== "play") return;
    const cv = cvRef.current, ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;

    const applySize = () => {
      const W = Math.max(320, Math.floor(cv.clientWidth));
      const H = Math.round(W * 9/16);
      cv.width = W; cv.height = H;
      S.current.W = W; S.current.H = H;

      // compute grid to fit nicely
      const g = S.current.grid;
      const targetCols = W > 800 ? 5 : 4;
      g.cols = targetCols; g.rows = 3;
      const usableW = W * 0.9, usableH = H * 0.72;
      const cellX = Math.floor(usableW / g.cols);
      const cellY = Math.floor(usableH / g.rows);
      g.cell = Math.max(100, Math.min(cellX, cellY));
      g.pad  = Math.max(14, Math.floor(g.cell * 0.12));
      g.offX = Math.floor((W - g.cols * g.cell) / 2);
      g.offY = Math.floor((H - g.rows * g.cell) / 2) - 6;
    };
    applySize();
    ro.current?.disconnect?.(); ro.current = new ResizeObserver(applySize); ro.current.observe(cv);

    let tPrev = performance.now();
    const step = (tNow) => {
      const dt = Math.min(0.05, (tNow - tPrev) / 1000);
      tPrev = tNow; S.current.tPrev = tNow; S.current.tick += dt;
      update(dt); render(ctx);
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => { cancelAnimationFrame(raf.current); ro.current?.disconnect?.(); };
  }, [phase]);

  const end = () => {
    const pts = Math.max(1, Math.floor(score / 35));
    setPtsAwarded(pts); setPhase("end");
  };

  // gameplay
  const update = (dt) => {
    const s = S.current; s.spawn -= dt;
    // spawn logic
    if (s.spawn <= 0) {
      s.spawn = rand(s.rate.min, s.rate.max);
      // accelerate slightly over time
      s.rate.min = Math.max(0.18, s.rate.min - 0.002);
      s.rate.max = Math.max(0.36, s.rate.max - 0.003);

      // find a free slot
      const slot = chooseFreeSlot();
      if (slot) {
        // choose kind: 70% ✨, 20% ⭐, 10% 💣
        const r = Math.random();
        const kind = r < 0.7 ? "glow" : r < 0.9 ? "star" : "bomb";
        const life = kind === "star" ? 1.3 : kind === "bomb" ? 1.6 : 1.0;
        s.items.push({
          kind,
          // slot to pixel center
          cx: slot.cx, cy: slot.cy,
          life, t: 0, // t 0..1 (appear→fade)
          hit: false,
        });
      }
    }

    // progress items
    const remain = [];
    for (const it of s.items) {
      it.t += dt / it.life;
      if (!it.hit && it.t >= 1) {
        if (it.kind !== "bomb") {
          // missed glow/star → small penalty (lose combo)
          s.combo = 0;
          setNote("Miss!"); // no heart loss
        }
      }
      if (it.t < 1.2) remain.push(it);
    }
    s.items = remain;

    // particles
    for (const p of s.particles) { p.life -= dt; p.x += p.vx*dt; p.y += p.vy*dt; p.vy += 10*dt; }
    s.particles = s.particles.filter(p => p.life > 0);
  };

  const hit = (x, y) => {
    const s = S.current;
    // check topmost target under pointer
    for (let i=s.items.length-1; i>=0; i--) {
      const it = s.items[i];
      const { px, py, r } = cellToXY(it.cx, it.cy, s.grid);
      const d = Math.hypot(x - px, y - py);
      if (d <= r * 0.9 && it.t < 1) {
        it.hit = true;
        // effects & scoring
        if (it.kind === "bomb") {
          setHearts(h => {
            const nh = Math.max(0, h - 1);
            if (nh <= 0) end();
            return nh;
          });
          s.combo = 0;
          setNote("💣 Ouch!");
          setFlash(true); setTimeout(()=>setFlash(false), 120);
          burst(px, py, ["#ef4444","#fca5a5","#ef4444"], 14);
        } else {
          const base = it.kind === "star" ? 25 : 10;
          s.combo = Math.min(50, s.combo + 1);
          const mult = 1 + Math.floor(s.combo / 5) * 0.2; // every 5 hits +0.2x
          const add = Math.floor(base * mult);
          setScore(v => v + add);
          setNote(`${it.kind==="star"?"⭐": "✨"} +${add}${mult>1?` (×${mult.toFixed(1)})`:""}`);
          burst(px, py, it.kind==="star"
            ? ["#fbbf24","#fde68a","#f59e0b"]
            : ["#60a5fa","#a78bfa","#34d399"], 10);
        }
        // remove
        s.items.splice(i,1);
        return;
      }
    }
    // empty tap: light ripple / lose combo softly
    s.combo = 0;
    ripple(x, y);
  };

  // helpers
  const chooseFreeSlot = () => {
    const s = S.current, g = s.grid;
    const taken = new Set(s.items.map(it => `${it.cx},${it.cy}`));
    const slots = [];
    for (let cy=0; cy<g.rows; cy++) for (let cx=0; cx<g.cols; cx++){
      const k = `${cx},${cy}`; if (!taken.has(k)) slots.push({cx,cy});
    }
    if (!slots.length) return null;
    return slots[Math.floor(Math.random()*slots.length)];
  };

  const cellToXY = (cx, cy, g) => {
    const px = g.offX + cx*g.cell + g.cell/2;
    const py = g.offY + cy*g.cell + g.cell/2;
    const r  = Math.min(g.cell*0.36, 52);
    return { px, py, r };
  };

  const burst = (x, y, palette, n=8) => {
    const s = S.current;
    for (let i=0;i<n;i++){
      s.particles.push({
        x, y,
        vx: (Math.random()*2-1)*80,
        vy: (Math.random()*2-1)*80 - 20,
        s: 2+Math.random()*3,
        life: .7+Math.random()*.5,
        col: palette[i%palette.length],
      });
    }
  };

  const ripple = (x, y) => {
    const s = S.current;
    s.particles.push({ x, y, vx:0, vy:0, s: 0, life:.35, col:"ripple" });
  };

  const render = (ctx) => {
    const s = S.current, W=s.W, H=s.H, g=s.grid;
    ctx.globalAlpha = 1; ctx.clearRect(0,0,W,H);

    // background — salon-night w/ vignette
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#0f1730"); bg.addColorStop(1, "#0b111d");
    ctx.fillStyle = bg; ctx.fillRect(0,0,W,H);
    const rg = ctx.createRadialGradient(W*.5, H*.35, 8, W*.5, H*.35, Math.max(W,H)*.7);
    rg.addColorStop(0, "rgba(56,189,248,.08)"); rg.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = rg; ctx.fillRect(0,0,W,H);

    // grid placeholders (soft pads)
    for (let cy=0; cy<g.rows; cy++){
      for (let cx=0; cx<g.cols; cx++){
        const { px, py, r } = cellToXY(cx, cy, g);
        ctx.fillStyle = "rgba(255,255,255,.04)";
        ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI*2); ctx.fill();
      }
    }

    // items
    for (const it of s.items) {
      const { px, py, r } = cellToXY(it.cx, it.cy, g);
      const a = Math.max(0, 1 - it.t); // fade out
      const base = it.kind==="star" ? "#f59e0b" : it.kind==="bomb" ? "#ef4444" : "#60a5fa";
      const glow = it.kind==="star" ? "rgba(245,158,11,.6)" : it.kind==="bomb" ? "rgba(239,68,68,.6)" : "rgba(96,165,250,.6)";
      // neon ring
      ctx.save();
      ctx.globalAlpha = a;
      ctx.shadowColor = glow; ctx.shadowBlur = 22;
      ctx.fillStyle = base;
      ctx.beginPath(); ctx.arc(px, py, r*0.74, 0, Math.PI*2); ctx.fill();
      ctx.shadowBlur = 0; ctx.restore();

      // emoji flair
      drawEmoji(ctx, it.kind==="star" ? "⭐" : it.kind==="bomb" ? "💣" : "✨", px, py, Math.min(r*0.9, 40), a);

      // progress arc
      ctx.strokeStyle = "rgba(255,255,255,.85)";
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(px, py, r*0.9, -Math.PI/2, -Math.PI/2 + (1-it.t)*Math.PI*2, false); ctx.stroke();
    }

    // particles
    ctx.save();
    for (const p of s.particles) {
      if (p.col === "ripple") {
        const t = 1 - p.life/.35;
        ctx.globalAlpha = 0.35*(1-t);
        ctx.strokeStyle = "rgba(255,255,255,.75)";
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(p.x, p.y, 12 + t*26, 0, Math.PI*2); ctx.stroke();
      } else {
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.col;
        ctx.fillRect(p.x, p.y, 3, 3);
      }
    }
    ctx.restore();

    // flash on hit
    if (flash) {
      ctx.fillStyle = "rgba(239,68,68,.15)";
      ctx.fillRect(0,0,W,H);
    }
  };

  const drawEmoji = (ctx, ch, x, y, size=28, alpha=1) => {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = `${size}px system-ui, Apple Color Emoji, Segoe UI Emoji`;
    ctx.textAlign="center"; ctx.textBaseline="middle"; ctx.fillText(ch, x, y);
    ctx.restore();
  };

  const rand = (a,b)=> a + Math.random()*(b-a);

  return (
    <div className="whack">
      {phase === "intro" && (
        <InstructionCard
          title="Whack-a-Glow"
          lines={[
            "Tap the glowing circles before they fade.",
            "✨ +10, ⭐ +25, avoid 💣 (loses a heart).",
            "Hit streak builds a multiplier—go fast!",
          ]}
          onStart={start}
        />
      )}

      {phase === "play" && (
        <>
          <HUD
            time={time}
            score={score}
            hint={`❤️×${hearts} • ${note}`}
            emoji="🔆🔨"
          />
          <div className={`stage ${flash ? "flash" : ""}`}>
            <canvas ref={cvRef} className="cv" width="960" height="540" />
            <div className="chips">
              <span className="chip">Tap fast</span>
              <span className="chip">Avoid 💣</span>
              <span className="chip">Build combo</span>
            </div>
          </div>
        </>
      )}

      {phase === "end" && (
        <EndScreen
          title="Whack-a-Glow — Results"
          score={score}
          points={ptsAwarded}
          onAgain={() => setPhase("intro")}
          onExit={onExit}
        />
      )}

      <style>{`
        .whack { display:grid; gap:10px; }
        .stage { position:relative; }
        .stage.flash { animation: flash .12s ease; }
        @keyframes flash { from { filter:brightness(1.25) } to { filter:brightness(1) } }

        .cv {
          width:100%; max-width: 980px; aspect-ratio:16/9;
          background:#0b111d; border-radius:14px; box-shadow:0 18px 40px rgba(0,0,0,.28);
          display:block; margin:auto;
        }
        .chips { position:absolute; left:8px; bottom:8px; display:flex; gap:6px; flex-wrap:wrap; }
        .chip {
          font-size:11px; padding:4px 8px; border-radius:999px;
          background: rgba(0,0,0,.45); color:#fff; border:1px solid rgba(255,255,255,.22);
        }
      `}</style>
    </div>
  );
}
