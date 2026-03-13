import { useEffect, useRef, useState } from "react";
import { InstructionCard, HUD, EndScreen } from "./GameKit";

/** Maze Runner — neon edition (clear star + lush background) */
export default function MazeRunner({ onExit, onPoints }) {
  const cvRef = useRef(null);
  const raf = useRef(0);
  const ro  = useRef(null);

  const [phase, setPhase] = useState("intro"); // intro | play | end
  const [time, setTime] = useState(60);
  const [score, setScore] = useState(0);
  const [note, setNote] = useState("Find the ⭐");
  const [won, setWon]   = useState(false);
  const [ptsAwarded, setPtsAwarded] = useState(0);

  // world
  const S = useRef({
    W: 960, H: 540,
    gridW: 21, gridH: 13,          // a bit larger; still odd
    cell: 36,
    maze: null,
    player: { cx:1, cy:1, x:1, y:1, tx:1, ty:1, moving:false, t:0 },
    orbsLeft: 0, collected: 0,
    tPrev: 0, tick: 0, parX: 0,
  });

  const start = () => {
    setTime(60); setScore(0); setNote("Find the ⭐"); setWon(false);
    const s = S.current;
    s.maze = buildMaze(s.gridW, s.gridH);
    s.player.cx = s.player.cy = s.player.x = s.player.y = s.player.tx = s.player.ty = 1;
    s.player.moving = false; s.player.t = 0;
    s.orbsLeft = s.maze.orbs.length; s.collected = 0; s.tick = 0;
    setPhase("play");
  };

  // timers
  useEffect(() => {
    if (phase !== "play") return;
    const iv = setInterval(() => setTime(t => Math.max(0, t - 1)), 1000);
    return () => clearInterval(iv);
  }, [phase]);

  useEffect(() => { if (phase === "play" && time === 0) finish(false); }, [time, phase]);

  // input
  useEffect(() => {
    if (phase !== "play") return;
    const onKey = (e) => {
      const k = e.key.toLowerCase();
      if (k === "arrowleft"  || k === "a") tryMove(-1, 0);
      if (k === "arrowright" || k === "d") tryMove( 1, 0);
      if (k === "arrowup"    || k === "w") tryMove( 0,-1);
      if (k === "arrowdown"  || k === "s") tryMove( 0, 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase]);

  const tryMove = (dx, dy) => {
    const s = S.current; if (s.player.moving) return;
    if (!isOpen(s.maze.cells, s.gridW, s.gridH, s.player.cx, s.player.cy, dx, dy)) return;
    s.player.tx = s.player.cx + dx; s.player.ty = s.player.cy + dy;
    s.player.t = 0; s.player.moving = true;
    s.parX = Math.max(-10, Math.min(10, s.parX + dx * 1.4));
  };

  // loop + resize
  useEffect(() => {
    if (phase !== "play") return;
    const cv = cvRef.current; const ctx = cv?.getContext("2d"); if (!cv || !ctx) return;

    const applySize = () => {
      const W = Math.max(320, Math.floor(cv.clientWidth));
      const H = Math.round(W * 9/16);
      cv.width = W; cv.height = H;
      const s = S.current; s.W = W; s.H = H;
      // fit board nicer: use up to 82% height or 88% width, whichever smaller
      const usable = Math.min(W*0.88, H*0.82);
      s.cell = Math.max(24, Math.floor(usable / Math.max(s.gridW, s.gridH)));
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

  const finish = (win) => {
    setWon(win);
    const bonus = win ? time * 2 : 0;
    const orbPts = S.current.collected * 5;
    const pts = Math.max(1, Math.floor(bonus + orbPts));
    setScore(bonus + orbPts); setPtsAwarded(pts);
    onPoints?.(pts); setPhase("end");
  };

  // update
  const update = (dt) => {
    const s = S.current;
    if (s.player.moving) {
      const speed = 7.2; // cells/sec
      s.player.t = Math.min(1, s.player.t + speed * dt);
      const k = ease(s.player.t);
      s.player.x = lerp(s.player.cx, s.player.tx, k);
      s.player.y = lerp(s.player.cy, s.player.ty, k);
      if (s.player.t >= 1) {
        s.player.moving = false;
        s.player.cx = s.player.tx; s.player.cy = s.player.ty;
        s.player.x = s.player.cx;  s.player.y = s.player.cy;
        // collect orb
        const idx = s.maze.orbs.findIndex(o => o.x === s.player.cx && o.y === s.player.cy);
        if (idx >= 0) { s.maze.orbs.splice(idx,1); s.collected++; setNote(`✨ ${s.collected}`); }
        // goal?
        if (s.player.cx === s.maze.goal.x && s.player.cy === s.maze.goal.y) finish(true);
      }
    } else {
      s.parX *= Math.pow(0.0008, dt); // ease back
    }
  };

  // draw
  const render = (ctx) => {
    const s = S.current, W = s.W, H = s.H, C = s.cell;
    ctx.globalAlpha = 1; ctx.clearRect(0,0,W,H);

    // rich background: vertical gradient + subtle radial glow
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#0f1730"); g.addColorStop(0.58, "#0c1426"); g.addColorStop(1, "#0a121d");
    ctx.fillStyle = g; ctx.fillRect(0,0,W,H);
    const rg = ctx.createRadialGradient(W*0.5, H*0.35, 10, W*0.5, H*0.35, Math.max(W,H)*0.7);
    rg.addColorStop(0, "rgba(35,65,130,.16)"); rg.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = rg; ctx.fillRect(0,0,W,H);

    // board placement
    const totalW = s.gridW * C, totalH = s.gridH * C;
    const ox = Math.floor((W - totalW)/2) + s.parX;
    const oy = Math.floor((H - totalH)/2);

    ctx.save();
    ctx.translate(ox, oy);

    // board background card
    ctx.fillStyle = "rgba(255,255,255,.02)";
    roundRect(ctx, -10, -10, totalW+20, totalH+20, 16); ctx.fill();

    // grid backdrop cells (checker for depth)
    for (let y=0;y<s.gridH;y++){
      for (let x=0;x<s.gridW;x++){
        ctx.fillStyle = (x+y)%2 === 0 ? "rgba(255,255,255,.035)" : "rgba(255,255,255,.02)";
        ctx.fillRect(x*C, y*C, C, C);
      }
    }

    // walls: neon-ish, high contrast
    const wallStroke = ctx.createLinearGradient(0,0,C,0);
    wallStroke.addColorStop(0,  "#6b7280");
    wallStroke.addColorStop(1,  "#9ca3af");
    ctx.strokeStyle = wallStroke;
    ctx.lineWidth = Math.max(2, Math.floor(C*0.11));
    ctx.lineCap = "square";

    const cells = s.maze.cells;
    for (let y=0;y<s.gridH;y++){
      for (let x=0;x<s.gridW;x++){
        const cell = cells[y*s.gridW + x];
        const px = x*C, py = y*C;
        if (cell & WALL.TOP)    { ctx.beginPath(); ctx.moveTo(px,py);     ctx.lineTo(px+C,py);     ctx.stroke(); }
        if (cell & WALL.RIGHT)  { ctx.beginPath(); ctx.moveTo(px+C,py);   ctx.lineTo(px+C,py+C);   ctx.stroke(); }
        if (cell & WALL.BOTTOM) { ctx.beginPath(); ctx.moveTo(px,py+C);   ctx.lineTo(px+C,py+C);   ctx.stroke(); }
        if (cell & WALL.LEFT)   { ctx.beginPath(); ctx.moveTo(px,py);     ctx.lineTo(px,py+C);     ctx.stroke(); }
      }
    }

    // breadcrumb: faint glow on visited
    ctx.fillStyle = "rgba(99,102,241,.16)";
    for (const v of s.maze.visited) ctx.fillRect(v.x*C+4, v.y*C+4, C-8, C-8);

// orbs ✨ (shimmer)
const wob = Math.sin(s.tick*3) * (C*0.05);
for (const o of s.maze.orbs) {
  const ox = o.x*C + C/2, oy = o.y*C + C/2 + wob;
  
  // solid background circle for visibility
  ctx.fillStyle = "#FFD700";             // bright yellow
  ctx.beginPath();


  drawEmoji(ctx, "✨", ox, oy, Math.max(18, C*0.45));
}

// goal ⭐ — big, pulsing glow ring
const gx = s.maze.goal.x*C + C/2, gy = s.maze.goal.y*C + C/2;
const pulse = (Math.sin(s.tick*4)+1)/2; // 0..1

// glow ring (optional)
ctx.save();
ctx.globalAlpha = 0.5 + pulse*0.35;
ctx.strokeStyle = "rgba(250,204,21,.85)";
ctx.lineWidth = Math.max(2, C*0.12);
ctx.beginPath(); ctx.arc(gx, gy, Math.max(C*0.35, 16), 0, Math.PI*2); ctx.stroke();
ctx.restore();



drawEmoji(ctx, "⭐", gx, gy, Math.max(22, C*0.6));


    // player (mascot)
    const px = s.player.x*C + C/2, py = s.player.y*C + C/2;
    ctx.fillStyle = "rgba(0,0,0,.35)";
    ctx.beginPath(); ctx.ellipse(px, py + C*0.28, C*0.22, C*0.10, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = "#3b2a5a";
    roundRect(ctx, px-C*0.22, py-C*0.28, C*0.44, C*0.56, 8); ctx.fill();
    ctx.strokeStyle="rgba(255,255,255,.10)";
    ctx.lineWidth=2; roundRect(ctx, px-C*0.22, py-C*0.28, C*0.44, C*0.56, 8); ctx.stroke();
    drawEmoji(ctx, "🤚", px-C*0.28, py-C*0.06, Math.max(14, C*0.26));
    drawEmoji(ctx, "🖐️", px+C*0.28, py-C*0.02, Math.max(14, C*0.26));
    drawEmoji(ctx, "😄", px,        py-C*0.36, Math.max(16, C*0.33));

    ctx.restore();
  };

  // controls overlay for mobile
  const Controls = () => (
    <div className="ctrls">
      <button onClick={()=>tryMove(0,-1)}>↑</button>
      <div className="row">
        <button onClick={()=>tryMove(-1,0)}>←</button>
        <button onClick={()=>tryMove(0,1)}>↓</button>
        <button onClick={()=>tryMove(1,0)}>→</button>
      </div>
    </div>
  );

  return (
    <div className="maze">
      {phase === "intro" && (
        <InstructionCard
          title="Maze Runner"
          lines={[
            "Use arrows / WASD (or tap) to move.",
            "Reach the big glowing ⭐.",
            "Collect ✨ on the way for extra points.",
          ]}
          onStart={start}
        />
      )}

      {phase === "play" && (
        <>
          <HUD
            time={time}
            score={score}
            hint={`${note} • ✨ ${S.current.collected}/${S.current.orbsLeft + S.current.collected}`}
            emoji="🧭⭐"
          />
          <div className="stage">
            <canvas ref={cvRef} className="cv" width="960" height="540" />
            <Controls />
          </div>
        </>
      )}

      {phase === "end" && (
        <EndScreen
          title={won ? "You found the star! 🌟" : "Time’s up!"}
          score={score}
          points={ptsAwarded}
          onAgain={() => setPhase("intro")}
          onExit={onExit}
        />
      )}

      <style>{`
        .maze { display:grid; gap:10px; }
        .stage { position:relative; }
        .cv {
          width:100%; max-width: 980px; aspect-ratio:16/9;
          background: rgba(0,0,0,0.75);
           border-radius:14px; box-shadow:0 18px 40px rgba(0,0,0,.28);
          display:block; margin:auto;
        }
        .ctrls {
          position:absolute; right:10px; bottom:10px; display:grid; gap:6px; place-items:center;
        }
        .ctrls .row { display:flex; gap:6px; }
        .ctrls button {
          width:38px; height:38px; border-radius:10px; border:1px solid rgba(255,255,255,.18);
          background: rgba(0,0,0,.45); color:#fff; font-weight:800; cursor:pointer;
        }
        @media (min-width: 900px){ .ctrls { display:none; } }
      `}</style>
    </div>
  );
}

/* ---------- Maze generation + helpers ---------- */

const WALL = { TOP:1, RIGHT:2, BOTTOM:4, LEFT:8 };
const OPP  = { [WALL.TOP]:WALL.BOTTOM, [WALL.RIGHT]:WALL.LEFT, [WALL.BOTTOM]:WALL.TOP, [WALL.LEFT]:WALL.RIGHT };

function buildMaze(w, h){
  const cells = new Array(w*h).fill(WALL.TOP|WALL.RIGHT|WALL.BOTTOM|WALL.LEFT);
  const visited = [];
  const stack = [];
  const idx = (x,y)=> y*w + x;

  // DFS backtracker from (1,1)
  let cx=1, cy=1; stack.push({x:cx,y:cy});
  const dirs = [
    {dx:0,dy:-1, wall:WALL.TOP},
    {dx:1,dy:0,  wall:WALL.RIGHT},
    {dx:0,dy:1,  wall:WALL.BOTTOM},
    {dx:-1,dy:0, wall:WALL.LEFT},
  ];
  const inside = (x,y)=> x>0 && y>0 && x<w-1 && y<h-1;
  const seen = new Set([idx(cx,cy)]);

  while(stack.length){
    const cur = stack[stack.length-1];
    const candidates = dirs
      .map(d=>({nx:cur.x+d.dx, ny:cur.y+d.dy, d}))
      .filter(n=> inside(n.nx,n.ny) && !seen.has(idx(n.nx,n.ny)));
    if (candidates.length){
      const pick = candidates[Math.floor(Math.random()*candidates.length)];
      const a = idx(cur.x, cur.y), b = idx(pick.nx, pick.ny);
      cells[a] &= ~pick.d.wall;
      cells[b] &= ~OPP[pick.d.wall];
      stack.push({x:pick.nx,y:pick.ny});
      seen.add(b);
    } else { visited.push(cur); stack.pop(); }
  }

  // orbs at dead-ends
  const orbs = [];
  for (let y=1;y<h-1;y++){
    for (let x=1;x<w-1;x++){
      const c = cells[idx(x,y)];
      const openings = ((c&WALL.TOP)?0:1)+((c&WALL.RIGHT)?0:1)+((c&WALL.BOTTOM)?0:1)+((c&WALL.LEFT)?0:1);
      if (openings <= 1 && Math.random()<0.42) orbs.push({x,y});
    }
  }
  while (orbs.length < 8) { // ensure some
    const x = 1 + Math.floor(Math.random()*(w-2));
    const y = 1 + Math.floor(Math.random()*(h-2));
    if (!(x===1 && y===1)) orbs.push({x,y});
  }

  // goal: far-ish from start (pick a cell near the DFS tail)
  const tail = visited.at(-Math.floor(visited.length*0.25)) || {x:w-2,y:h-2};
  const goal = {x: tail.x ?? w-2, y: tail.y ?? h-2};

  return { cells, visited, orbs, start:{x:1,y:1}, goal };
}

function isOpen(cells, w, h, x, y, dx, dy){
  const i = y*w + x;
  if (dx === -1 && (cells[i] & WALL.LEFT))   return false;
  if (dx ===  1 && (cells[i] & WALL.RIGHT))  return false;
  if (dy === -1 && (cells[i] & WALL.TOP))    return false;
  if (dy ===  1 && (cells[i] & WALL.BOTTOM)) return false;
  return true;
}

function drawEmoji(ctx, ch, x, y, size=24){
  ctx.font = `${size}px system-ui, Apple Color Emoji, Segoe UI Emoji`;
  ctx.textAlign="center"; ctx.textBaseline="middle"; ctx.fillText(ch, x, y);
}
function roundRect(ctx, x, y, w, h, r){
  ctx.beginPath(); ctx.moveTo(x+r, y);
  ctx.arcTo(x+w, y, x+w, y+h, r);
  ctx.arcTo(x+w, y+h, x, y+h, r);
  ctx.arcTo(x, y+h, x, y, r);
  ctx.arcTo(x, y, x+w, y, r);
  ctx.closePath();
}
const lerp = (a,b,t)=> a + (b-a)*t;
const ease = (t)=> t<.5 ? 2*t*t : 1 - Math.pow(-2*t+2,2)/2;
