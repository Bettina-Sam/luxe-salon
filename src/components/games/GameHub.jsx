import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

// same-folder lazy imports
const MascotDash   = lazy(() => import("./MascotDash"));
const BreathRush   = lazy(() => import("./BreathRush"));
const CatCatch     = lazy(() => import("./CatCatch"));
const BubblePop    = lazy(() => import("./BubblePop"));
const MemoryFlip   = lazy(() => import("./MemoryFlip"));
const MazeRunner   = lazy(() => import("./MazeRunner"));
const WhackAGlow   = lazy(() => import("./WhackAGlow"));
const BalloonFloat = lazy(() => import("./BalloonFloat"));
const ColorSimon   = lazy(() => import("./ColorSimon"));

const GAMES = [
  {
    id:"dash", title:"Mascot Dash", emoji:"🏃‍♀️✨", badge:"≤ 60s",
    desc:"Dodge the bad, collect the glow. Quick, simple, fun.",
    tags:["Arcade","Reflex","Keyboard"], comp:MascotDash
  },
  {
    id:"breath", title:"Breath Rush", emoji:"🌬️🎯", badge:"60s",
    desc:"Rhythm tapper—hit the beat, build a combo.",
    tags:["Rhythm","Tap","Combo"], comp:BreathRush
  },
  {
    id:"catch", title:"Cat Catch", emoji:"🐱🫧", badge:"≤ 45s",
    desc:"Move the cat and catch glow drops raining down.",
    tags:["Reflex","Keyboard"], comp:CatCatch
  },
  {
    id:"bubbles", title:"Bubble Pop", emoji:"🫧🎈", badge:"≤ 30s",
    desc:"Tap bubbles fast—new ones spawn as you pop.",
    tags:["Tap","Speed"], comp:BubblePop
  },
  {
    id:"memory", title:"Memory Flip", emoji:"🧠🃏", badge:"≤ 60s",
    desc:"Flip and match all pairs. Bonus for fewer misses.",
    tags:["Puzzle","Memory"], comp:MemoryFlip
  },
  {
    id:"maze", title:"Maze Runner", emoji:"🧭⭐", badge:"≤ 60s",
    desc:"Get to the star through a simple maze.",
    tags:["Puzzle","Keyboard"], comp:MazeRunner
  },
  {
    id:"whack", title:"Whack-a-Glow", emoji:"🔆🔨", badge:"≤ 30s",
    desc:"Tap glowing targets quickly—don’t let them fade.",
    tags:["Tap","Reflex"], comp:WhackAGlow
  },
  {
    id:"balloon", title:"Balloon Float", emoji:"🎈😮", badge:"≤ 30s",
    desc:"Press & hold to inflate—bank size before it pops!",
    tags:["Hold","Timing"], comp:BalloonFloat
  },
  {
    id:"simon", title:"Color Simon", emoji:"🟥🟩🟦", badge:"≤ 60s",
    desc:"Watch the colors, repeat the pattern—sequence grows.",
    tags:["Memory","Pattern"], comp:ColorSimon
  },
];

export default function GameHub({ open = true, onClose }) {
  const nav = useNavigate();
  const handleClose = onClose || (() => nav(-1));
  const [active, setActive] = useState(null);
  const [points, setPoints] = useState(0);

  useEffect(() => {
    try { setPoints(parseInt(localStorage.getItem("glow_points") || "0", 10)); } catch {}
  }, []);
  const addPoints = (n) => {
    setPoints(p => {
      const v = Math.max(0, p + n);
      try { localStorage.setItem("glow_points", String(v)); } catch {}
      return v;
    });
  };

  if (!open) return null;
  const ActiveComp = useMemo(() => GAMES.find(g => g.id === active)?.comp || null, [active]);

  return (
    <div className="gh-wrap" role="dialog" aria-modal="true">
      <div className="gh-backdrop" onClick={handleClose}/>
      <div className="gh-card">
        <header className="gh-head">
          <div className="gh-title">
            <span className="gh-logo">🎮</span>
            <h3>Game Hub</h3>
          </div>
          <div className="gh-right">
            <div className="gh-points" title="Glow Points">✨ <b>{points}</b></div>
            <button className="gh-x" onClick={handleClose}>×</button>
          </div>
        </header>

        {!ActiveComp && (
          <div className="gh-grid">
            {GAMES.map((g,i)=>(
              <button key={g.id} className="gh-cardbtn" onClick={()=>setActive(g.id)} style={{animationDelay: `${i*60}ms`}}>
                <div className="gh-top">
                  <span className="gh-emoji">{g.emoji}</span>
                  <span className="gh-badge">{g.badge}</span>
                </div>
                <div className="gh-title2">{g.title}</div>
                <div className="gh-desc">{g.desc}</div>
                <div className="gh-tags">
                  {g.tags.map(t => <span key={t} className="gh-tag">{t}</span>)}
                </div>
                <div className="gh-sparkles" aria-hidden>✦</div>
              </button>
            ))}
          </div>
        )}

        {ActiveComp && (
          <div className="gh-play">
            <button className="gh-back" onClick={()=>setActive(null)}>← Games</button>
            <Suspense fallback={<div className="gh-loading">Loading…</div>}>
              <ActiveComp onExit={()=>setActive(null)} onPoints={(n)=>addPoints(n)}/>
            </Suspense>
          </div>
        )}
      </div>

      <style>{`
        .gh-wrap { position:fixed; inset:0; z-index:2147481600; display:grid; place-items:center; }
        .gh-backdrop { position:absolute; inset:0; background:rgba(0,0,0,.45); backdrop-filter: blur(6px); }
        .gh-card { position:relative; width:min(1100px,96vw); max-height:92vh; overflow:auto;
          background:rgba(255,255,255,.98); color:#111; border:1px solid rgba(0,0,0,.08);
          border-radius:18px; box-shadow:0 30px 80px rgba(0,0,0,.35); }
        @media (prefers-color-scheme: dark){ .gh-card { background:rgba(24,24,30,.95); color:#f5f5f7; border-color:rgba(255,255,255,.12);} }
        .gh-head { position:sticky; top:0; display:flex; align-items:center; justify-content:space-between; gap:12px;
          padding:14px 16px; border-bottom:1px solid rgba(0,0,0,.08); background:inherit; backdrop-filter: blur(6px); border-radius:18px 18px 0 0; }
        .gh-title { display:flex; align-items:center; gap:8px; }
        .gh-logo { font-size:22px; animation: bob 2.2s ease-in-out infinite; display:inline-block; }
        @keyframes bob { 0%{transform:translateY(0)} 50%{transform:translateY(-3px)} 100%{transform:translateY(0)} }
        .gh-right { display:flex; align-items:center; gap:8px; }
        .gh-points { padding:6px 10px; border-radius:999px; background:rgba(255,255,255,.7); border:1px solid rgba(0,0,0,.08); }
        @media (prefers-color-scheme: dark){ .gh-points { background:rgba(255,255,255,.08); border-color:rgba(255,255,255,.14);} }
        .gh-x, .gh-back { border-radius:10px; padding:6px 10px; border:1px solid rgba(0,0,0,.2); background:transparent; color:inherit; cursor:pointer; }

        /* floating card grid */
        .gh-grid { display:grid; grid-template-columns: repeat(3,1fr); gap:14px; padding:16px; }
        @media (max-width: 1000px){ .gh-grid { grid-template-columns: repeat(2,1fr); } }
        @media (max-width: 640px){ .gh-grid { grid-template-columns: 1fr; } }

        .gh-cardbtn {
          position:relative; text-align:left; padding:14px; border-radius:16px;
          border:1px solid rgba(0,0,0,.08); background:rgba(255,255,255,.78);
          cursor:pointer; overflow:hidden;
          transform: translateY(0) translateZ(0);
          animation: floatY 4.2s ease-in-out infinite;
          transition: transform .14s ease, box-shadow .14s ease, border-color .14s ease;
        }
        .gh-cardbtn:hover { transform: translateY(-4px) scale(1.01);
          box-shadow:0 22px 46px rgba(0,0,0,.18); border-color: rgba(99,102,241,.22); }
        @media (prefers-color-scheme: dark){
          .gh-cardbtn { background:rgba(255,255,255,.06); border-color:rgba(255,255,255,.16); }
          .gh-cardbtn:hover { border-color: rgba(99,102,241,.35); }
        }
        @keyframes floatY { 0%{transform:translateY(0)} 50%{transform:translateY(-6px)} 100%{transform:translateY(0)} }

        .gh-top { display:flex; align-items:center; justify-content:space-between; }
        .gh-emoji { font-size:38px; filter: drop-shadow(0 8px 16px rgba(0,0,0,.22));
          animation: wiggle 2s ease-in-out infinite; }
        @keyframes wiggle { 0%{ transform: rotate(0) } 50%{ transform: rotate(7deg) } 100%{ transform: rotate(0) } }

        .gh-badge { font-size:11px; opacity:.85; border:1px solid currentColor; border-radius:999px; padding:2px 6px; }
        .gh-title2 { font-weight:800; margin-top:8px; }
        .gh-desc { font-size:13px; opacity:.95; margin-top:4px; min-height:36px; }

        .gh-tags { display:flex; flex-wrap:wrap; gap:6px; margin-top:10px; }
        .gh-tag { font-size:11px; padding:4px 8px; border-radius:999px; border:1px solid rgba(0,0,0,.12); background:rgba(99,102,241,.08); }
        @media (prefers-color-scheme: dark){
          .gh-tag { border-color:rgba(255,255,255,.16); background:rgba(99,102,241,.12); }
        }

        /* sparkles drifting up */
        .gh-sparkles {
          position:absolute; right:-10px; bottom:-10px; font-size:18px; opacity:.65;
          animation: sparkle 3.4s ease-in-out infinite;
        }
        @keyframes sparkle {
          0%{ transform: translate(0,0) rotate(0); opacity:.0 }
          20%{ opacity:.65 }
          100%{ transform: translate(-30px,-34px) rotate(20deg); opacity:0 }
        }

        .gh-play { padding:12px 16px 16px; }
        .gh-loading { padding:40px; text-align:center; opacity:.7; }
        /* base text inside cards */
.gh-title2 { 
  font-weight: 800; 
  margin-top: 8px; 
  color: rgba(255,255,255,0.95);      /* brighter title on dark */
}

.gh-desc { 
  font-size: 13px; 
  margin-top: 4px; 
  min-height: 36px; 
  color: rgba(255,255,255,0.82);      /* readable body */
}

/* tags */
.gh-tag { 
  font-size: 11px; 
  padding: 4px 8px; 
  border-radius: 999px; 
  border: 1px solid rgba(255,255,255,0.22); 
  background: rgba(255,255,255,0.08); 
  color: rgba(255,255,255,0.92);
}

/* badge (time) */
.gh-badge { 
  font-size: 11px; 
  border: 1px solid rgba(255,255,255,0.35); 
  color: rgba(255,255,255,0.92);
}

/* card bg/border for dark */
@media (prefers-color-scheme: dark){
  .gh-card { background: rgba(16,16,20,0.96); color: rgba(255,255,255,0.94); border-color: rgba(255,255,255,0.10); }

  .gh-cardbtn { 
    background: rgba(34,36,48,0.7); 
    border-color: rgba(255,255,255,0.10); 
  }
  .gh-cardbtn:hover { 
    border-color: rgba(140,148,255,0.35); 
    box-shadow: 0 24px 48px rgba(0,0,0,0.35);
  }

  .gh-points { 
    background: rgba(255,255,255,0.10); 
    color: rgba(255,255,255,0.92); 
    border-color: rgba(255,255,255,0.16);
  }
}

/* keep light theme looking balanced */
@media (prefers-color-scheme: light){
  .gh-title2 { color: #0d1117; }
  .gh-desc   { color: rgba(0,0,0,0.72); }
  .gh-tag    { border-color: rgba(0,0,0,0.12); background: rgba(99,102,241,0.10); color: #111; }
  .gh-badge  { border-color: rgba(0,0,0,0.35); color: #111; }
}

      `}</style>
    </div>
  );
}
