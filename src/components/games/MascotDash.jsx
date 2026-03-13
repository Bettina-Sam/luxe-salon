import { useEffect, useRef, useState } from "react";
import { InstructionCard, HUD, EndScreen } from "./GameKit";

/**
 * Mascot Dash — arcade runner
 * Controls:
 *  - Jump:  W / ↑ / Space / Tap
 *  - Slide: S / ↓  (hold)
 *  - Dash:  Shift  (short invincible burst)
 *
 * Goal:
 *  - Collect ✨ (+10) and ⭐ (+25), avoid 🚧 cones & 💥 bots
 *  - 3 hearts; distance + pickups = score. 60s round.
 */
export default function MascotDash({ onExit, onPoints }) {
  const cvRef = useRef(null);
  const raf = useRef(0);
  const ro = useRef(null);

  const [phase, setPhase] = useState("intro"); // intro | play | end
  const [time, setTime] = useState(60);
  const [score, setScore] = useState(0);
  const [ptsAwarded, setPtsAwarded] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [note, setNote] = useState("Ready?");
  const [flash, setFlash] = useState(false);

  // game state
  const S = useRef({
    W: 960, H: 540,
    tPrev: 0, frames: 0,
    speed: 260, // world speed
    accel: 0.8, // per second
    groundY: 0,
    // player
    p: {
      x: 120, y: 0, vy: 0,
      w: 44, h: 76,
      onGround: true,
      slide: false,
      dash: 0, // seconds remaining
      dashCD: 0,
      inv: 0,
    },
    // world
    items: [], // orbs & stars
    obs: [],   // obstacles
    spawnI: 0, spawnO: 0,
    particles: [],
    dragging: false,
  });

  // start round
  const start = () => {
    setScore(0); setTime(60); setHearts(3); setNote("Go!");
    setFlash(false);
    const s = S.current;
    s.speed = 260;
    s.items = []; s.obs = []; s.particles = [];
    s.spawnI = 0.3; s.spawnO = 0.7;
    s.frames = 0;
    s.p.x = 120; s.p.y = 0; s.p.vy = 0; s.p.onGround = true; s.p.slide = false; s.p.dash = 0; s.p.dashCD = 0; s.p.inv = 0;
    setPhase("play");
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

  // input
  useEffect(() => {
    if (phase !== "play") return;

    const jump = () => {
      const p = S.current.p;
      if (p.onGround && !p.slide) {
        p.vy = -430;
        p.onGround = false;
        setNote("Jump!");
      }
    };
    const slideOn = () => { const p=S.current.p; if (p.onGround) p.slide = true; };
    const slideOff = () => { S.current.p.slide = false; };
    const dash = () => {
      const p = S.current.p;
      if (p.dashCD <= 0) {
        p.dash = 0.35;        // invincible/window
        p.dashCD = 1.6;       // cooldown
        p.inv = Math.max(p.inv, 0.35);
        setNote("Dash!");
      }
    };

    const kd = (e) => {
      const k = e.key.toLowerCase();
      if (k === "w" || k === "arrowup" || k === " ") { e.preventDefault(); jump(); }
      if (k === "s" || k === "arrowdown") { e.preventDefault(); slideOn(); }
      if (k === "shift") { dash(); }
    };
    const ku = (e) => {
      const k = e.key.toLowerCase();
      if (k === "s" || k === "arrowdown") slideOff();
    };

    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);

    // touch: tap to jump; swipe down to slide; double-tap to dash
    let lastTap = 0;
    const cv = cvRef.current;
    const touchStart = (e) => {
      const t = Date.now();
      const dt = t - lastTap;
      lastTap = t;
      if (dt < 280) dash();
      else S.current.dragging = true;
    };
    const touchEnd = (e) => {
      if (S.current.dragging) {
        // decide: simple: if end lower than start by >40px → slide; else jump
        const touch = e.changedTouches?.[0]; if (!touch) return;
        const rect = cv.getBoundingClientRect();
        const y = touch.clientY - rect.top;
        // heuristic, just jump on tap
        const p = S.current.p;
        if (p.onGround) p.slide = false;
        jump();
      }
      S.current.dragging = false;
    };

    cv.addEventListener("touchstart", touchStart, { passive: true });
    cv.addEventListener("touchend", touchEnd);

    return () => {
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
      cv.removeEventListener("touchstart", touchStart);
      cv.removeEventListener("touchend", touchEnd);
    };
  }, [phase]);

  // main loop + resize
  useEffect(() => {
    if (phase !== "play") return;
    const cv = cvRef.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;

    const applySize = () => {
      const W = Math.max(320, Math.floor(cv.clientWidth));
      const H = Math.round(W * 9/16);
      cv.width = W; cv.height = H;
      S.current.W = W; S.current.H = H;
      S.current.groundY = Math.round(H * 0.78);
    };
    applySize();
    ro.current?.disconnect?.();
    ro.current = new ResizeObserver(applySize);
    ro.current.observe(cv);

    let tPrev = performance.now();
    const step = (tNow) => {
      const dt = Math.min(0.04, (tNow - tPrev) / 1000);
      tPrev = tNow;
      S.current.tPrev = tNow;
      update(dt);
      render(ctx);
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf.current);
      ro.current?.disconnect?.();
    };
  }, [phase]);

  const finish = () => {
    cancelAnimationFrame(raf.current);
    const pts = Math.max(1, Math.floor(score / 50));
    setPtsAwarded(pts);
    onPoints?.(pts);
    setPhase("end");
  };

  // ---- game update
  const update = (dt) => {
    const s = S.current;
    s.frames++;

    // accelerate slightly over time
    s.speed += s.accel * dt;

    // cooldowns
    s.p.dash = Math.max(0, s.p.dash - dt);
    s.p.dashCD = Math.max(0, s.p.dashCD - dt);
    s.p.inv = Math.max(0, s.p.inv - dt);

    // player physics
    const baseH = s.p.slide ? 44 : 76;
    s.p.h = baseH;
    if (!s.p.onGround) s.p.vy += 1200 * dt; // gravity
    s.p.y += s.p.vy * dt;

    // ground clamp
    const yGround = s.groundY - s.p.h;
    if (s.p.y >= yGround) { s.p.y = yGround; s.p.vy = 0; s.p.onGround = true; }

    // spawn collectibles
    s.spawnI -= dt;
    if (s.spawnI <= 0) {
      s.spawnI = 0.45 + Math.random()*0.6;
      const kind = Math.random() < 0.8 ? "orb" : "star";
      s.items.push({
        x: s.W + 40,
        y: s.groundY - (kind === "orb" ? (60 + Math.random()*80) : (120 + Math.random()*120)),
        kind, vx: s.speed * (0.9 + Math.random()*0.2),
        rot: (Math.random()*2-1)*0.004
      });
    }
    // spawn obstacles
    s.spawnO -= dt;
    if (s.spawnO <= 0) {
      s.spawnO = 0.9 + Math.random()*0.9;
      const kind = Math.random() < 0.7 ? "cone" : "bot";
      s.obs.push({
        x: s.W + 50,
        y: s.groundY, kind,
        vx: s.speed,
      });
    }

    // move world
    for (const it of s.items) it.x -= it.vx * dt;
    for (const ob of s.obs) ob.x -= ob.vx * dt;

    // collect / collide
    const px = s.p.x, py = s.p.y, pw = s.p.w, ph = s.p.h;
    const pBox = { x:px, y:py, w:pw, h:ph };

    const newItems = [];
    for (const it of s.items) {
      const w = 22, h = 22;
      if (AABB(pBox, { x: it.x-12, y: it.y-12, w, h })) {
        // collect
        makeSpark(it.x, it.y, it.kind === "star" ? 10 : 6);
        const add = it.kind === "star" ? 25 : 10;
        setScore(v => v + add);
        setNote(it.kind === "star" ? "⭐ +25!" : "✨ +10!");
      } else if (it.x > -40) {
        newItems.push(it);
      }
    }
    s.items = newItems;

    const newObs = [];
    for (const ob of s.obs) {
      const box = ob.kind === "cone"
        ? { x: ob.x-14, y: s.groundY-30, w: 28, h: 30 }
        : { x: ob.x-18, y: s.groundY-50, w: 36, h: 50 };
      if (AABB(pBox, box)) {
        if (s.p.inv <= 0) {
          // hit
          s.p.inv = 1.0;
          setHearts(h => Math.max(0, h-1));
          setFlash(true); setTimeout(()=>setFlash(false), 120);
          setNote("Ouch!");
          if (hearts-1 <= 0) { finish(); return; }
        }
      }
      if (ob.x > -60) newObs.push(ob);
    }
    s.obs = newObs;

    // particles scroll + decay
    for (const p of s.particles) { p.life -= dt; p.x -= (s.speed*0.6)*dt; p.y += p.vy*dt; }
    s.particles = s.particles.filter(p => p.life > 0);

    // distance score trickle
    setScore(v => v + Math.floor(s.speed * 0.02));
  };

  // ---- draw
  const render = (ctx) => {
  const s = S.current;
  const W = s.W, H = s.H;

  // always start clean/opaque
  ctx.globalAlpha = 1;
  ctx.clearRect(0, 0, W, H);

  // solid night gradient
  const grd = ctx.createLinearGradient(0, 0, 0, H);
  grd.addColorStop(0, "#12192c");
  grd.addColorStop(0.55, "#0f1726");
  grd.addColorStop(1, "#0b111d");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, W, H);

  // subtler skyline (no tall translucent bars)
  drawCity(ctx, s.frames, W, H, s.speed);

  // ground line
  ctx.strokeStyle = "rgba(255,255,255,.10)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, s.groundY + 1);
  ctx.lineTo(W, s.groundY + 1);
  ctx.stroke();


    // items
    for (const it of s.items) {
      const t = s.frames*it.rot;
      ctx.save(); ctx.translate(it.x, it.y); ctx.rotate(t);
      emoji(ctx, it.kind === "star" ? "⭐" : "✨", 0, 0, it.kind==="star"?28:24);
      ctx.restore();
    }

    // obstacles
    for (const ob of s.obs) {
      if (ob.kind === "cone") {
        emoji(ctx, "🚧", ob.x, s.groundY-18, 28);
      } else {
        emoji(ctx, "🤖", ob.x, s.groundY-26, 30);
      }
    }

    // player shadow
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.beginPath(); ctx.ellipse(s.p.x+2, s.groundY+6, s.p.w*0.42, 10, 0, 0, Math.PI*2); ctx.fill();

    // player (simple mascot body)
    drawMascot(ctx, s.p.x, s.p.y, s.p.w, s.p.h, s.p.slide, s.p.dash>0, s.p.inv>0);

    // particles
    for (const p of s.particles) {
      ctx.globalAlpha = Math.max(0, p.life / p.max);
      ctx.fillStyle = p.col; ctx.fillRect(p.x, p.y, p.s, p.s);
    }
    ctx.globalAlpha = 1;

    // hearts HUD (inline for extra charm; real HUD shows time/score)
    const hX = 14, hY = 16;
    for (let i=0;i<3;i++) emoji(ctx, i < hearts ? "❤️" : "🖤", hX + i*22, hY, 16);

    // dash trail hint
    if (s.p.dash > 0) {
      ctx.fillStyle = "rgba(99,102,241,.12)";
      ctx.fillRect(s.p.x - 56, s.p.y, 56, s.p.h);
    }

    // debug dims
    // ctx.fillStyle="#fff"; ctx.font="12px system-ui"; ctx.fillText(`${W}×${H}`, 8, H-18);
  };

  // helpers: draw things
  const emoji = (ctx, ch, x, y, size=28) => {
    ctx.font = `${size}px system-ui, Apple Color Emoji, Segoe UI Emoji`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(ch, x, y);
  };

 const drawCity = (ctx, frames, W, H, speed) => {
  // back layer (distant)
  const baseY1 = H * 0.70;
  const off1 = (frames * (speed * 0.18) / 60) % W;
  ctx.save();
  ctx.fillStyle = "#0f1a2b"; // solid silhouette
  for (let x = -off1; x < W + 140; x += 120) {
    const bw = 44 + ((x / 120) % 3) * 10;
    const bh = 90 + ((x / 120) % 4) * 18;
    ctx.fillRect(x, baseY1 - bh, bw, bh);
  }
  ctx.restore();

  // front layer (closer)
  const baseY2 = H * 0.78;
  const off2 = (frames * (speed * 0.30) / 60) % W;
  ctx.save();
  ctx.fillStyle = "#132035";
  for (let x = -off2; x < W + 160; x += 150) {
    const bw = 54 + ((x / 150) % 4) * 12;
    const bh = 120 + ((x / 150) % 5) * 22;
    ctx.fillRect(x, baseY2 - bh, bw, bh);
  }
  ctx.restore();

  // subtle vignette to ground the scene (not see-through)
  const v = ctx.createLinearGradient(0, H * 0.6, 0, H);
  v.addColorStop(0, "rgba(0,0,0,0)");
  v.addColorStop(1, "rgba(0,0,0,0.25)");
  ctx.fillStyle = v;
  ctx.fillRect(0, H * 0.6, W, H * 0.4);
};


  const drawMascot = (ctx, x, y, w, h, sliding, dashing, inv) => {
    // body
    const r = 8;
    ctx.save();
    ctx.translate(x, y);
    // inv glow
    if (inv) {
      ctx.shadowColor = "rgba(99,102,241,.6)";
      ctx.shadowBlur = 18;
    }
    ctx.fillStyle = "#3b2a5a";
    roundRect(ctx, -w/2, 0, w, h, r); ctx.fill();
    ctx.shadowBlur = 0;

    // hands
    emoji(ctx, "🤚", -w/2 - 12, h*0.25, 16);
    emoji(ctx, "🖐️",  w/2 + 12,  h*0.3,  16);

    // head
    emoji(ctx, dashing ? "😎" : sliding ? "🙂" : "😁", 0, -12, 24);

    // legs wiggle (if on ground & not sliding)
    if (!sliding) {
      const k = Math.sin(S.current.frames*0.4)*6;
      ctx.fillStyle = "rgba(0,0,0,.25)";
      ctx.fillRect(-6+k*0.2, h-10, 6, 10);
      ctx.fillRect(2-k*0.2, h-10, 6, 10);
    }
    ctx.restore();
  };

  const roundRect = (ctx, x, y, w, h, r) => {
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.arcTo(x+w, y, x+w, y+h, r);
    ctx.arcTo(x+w, y+h, x, y+h, r);
    ctx.arcTo(x, y+h, x, y, r);
    ctx.arcTo(x, y, x+w, y, r);
    ctx.closePath();
  };

  const makeSpark = (x, y, n=8) => {
    const s = S.current;
    for (let i=0;i<n;i++){
      s.particles.push({
        x, y, s: 2+Math.random()*3,
        vy: -20 + Math.random()*40,
        life: 0.6 + Math.random()*0.5, max: 1,
        col: ["#fbbf24","#60a5fa","#a78bfa","#34d399","#f472b6"][i%5],
      });
    }
  };

  // AABB helper
  const AABB = (a, b) => (a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y);

  return (
    <div className="dash">
      {phase === "intro" && (
        <InstructionCard
          title="Mascot Dash"
          lines={[
            "Jump with W / ↑ / Space (or tap). Hold ↓ / S to slide.",
            "Press Shift to DASH (briefly invincible).",
            "Collect ✨ (+10) & ⭐ (+25). Avoid obstacles. 3 hearts.",
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
            emoji="🏃‍♀️✨"
          />
          <div className={`stage ${flash ? "flash" : ""}`}>
            <canvas ref={cvRef} className="cv" width="960" height="540" />
            <div className="chips">
              <span className="chip">Jump: W / ↑ / Space</span>
              <span className="chip">Slide: S / ↓</span>
              <span className="chip">Dash: Shift</span>
            </div>
          </div>
        </>
      )}

      {phase === "end" && (
        <EndScreen
          title="Mascot Dash — Results"
          score={score}
          points={ptsAwarded}
          onAgain={() => setPhase("intro")}
          onExit={onExit}
        />
      )}

      <style>{`
        .dash { display:grid; gap:10px; }
        .stage { position:relative; }
        .stage.flash { animation: flash .12s ease; }
        @keyframes flash { from { filter:brightness(1.25) } to { filter:brightness(1) } }

        .cv {
          width:100%;
          max-width: 1000px;
          aspect-ratio:16/9;
          background:#0b111d;
          border-radius:14px;
          box-shadow:0 18px 40px rgba(0,0,0,.28);
          display:block;
          margin:auto;
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
