// src/components/mascot/MascotActor.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAvatar } from "../../context/AvatarContext";
import MascotSVG from "./MascotSVG";

/* simple cat */
const Cat = () => (
  <svg viewBox="0 0 60 36" width="100%" height="100%">
    <path d="M8,22 q6,-10 18,-10 q14,0 18,10 q-3,6 -10,8 q-16,2 -26,-8" fill="#34363a" />
    <circle cx="44" cy="18" r="5" fill="#34363a" />
    <circle cx="46" cy="17" r="1.1" fill="#fff" />
    <path d="M42,12 l-3,-5 l5,3 M46,12 l3,-5 l-5,3" stroke="#34363a" strokeWidth="2" />
  </svg>
);

export default function MascotActor() {
  const { avatar } = useAvatar();
  const nav = useNavigate();
  const loc = useLocation();
  const hidden = useMemo(() => loc.pathname.startsWith("/avatar"), [loc]);
  const isMirror = useMemo(() => loc.pathname.startsWith("/mirror"), [loc]);

  const railRef = useRef(null);
  const actorRef = useRef(null);

  const [phase, setPhase] = useState("fall");
  const [visible, setVisible] = useState(true);
  const [facing, setFacing] = useState(1); // 1 -> right, -1 -> left

  // physics state (px, px/s)
  const pos = useRef({ x: 0, y: 0 });
  const vel = useRef({ vx: 0, vy: 0 });
  const rafId = useRef(0);

  const ACTOR_W = 86;
  const ACTOR_H = 128;

  /* ---------- schedule the fun loop ---------- */
  useEffect(() => {
    if (hidden || isMirror) return;
    let timers = [];
    const later = (ms, fn) => { const t = setTimeout(fn, ms); timers.push(t); };

    const loop = () => {
      setPhase("walk");                // 1) walk (U-turn with physics)
      later(8000, () => {
        setPhase("run");               // 2) run (faster U-turn)
        later(5000, () => {
          setPhase("float");           // 3) float (diagonal bounce)
          later(6000, () => {
            setPhase("climb");         // 4) climb → hang → fall → getup
            later(3600, () => {
              setPhase("hang");
              later(1800, () => {
                setPhase("falldown");
                later(1200, () => {
                  setPhase("getup");
                  later(900, loop);
                });
              });
            });
          });
        });
      });
    };

    // entry
    setPhase("fall");
    later(1100, () => { setPhase("getup"); later(900, loop); });

    return () => timers.forEach(clearTimeout);
  }, [hidden, isMirror]);

  /* ---------- physics engine: true U-turn + float bounce ---------- */
  useEffect(() => {
    if (hidden || !visible || isMirror) return;
    cancelAnimationFrame(rafId.current);

    // set initial velocities for the current phase
    if (phase === "walk") {
      vel.current = { vx: 60, vy: 0 };               // ~60 px/s
    } else if (phase === "run") {
      vel.current = { vx: 120, vy: 0 };              // faster
    } else if (phase === "float") {
      const dir = Math.random() > 0.5 ? 1 : -1;
      vel.current = { vx: 80 * dir, vy: 40 };        // diagonal
    } else {
      // non-physics phases: freeze to rail bottom
      vel.current = { vx: 0, vy: 0 };
      // let CSS handle climb/hang/falldown/getup transforms
    }

    let last = performance.now();
    const step = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000); // clamp for safety
      last = now;

      const W = window.innerWidth;
      const maxX = Math.max(0, W - ACTOR_W);
      const maxY = Math.max(0, Math.round(window.innerHeight * 0.22)); // float ceiling (~22vh)

      // integrate
      pos.current.x += vel.current.vx * dt;
      pos.current.y += vel.current.vy * dt;

      // bounds + U-turns
      if (phase === "walk" || phase === "run" || phase === "float") {
        if (pos.current.x <= 0) {
          pos.current.x = 0;
          vel.current.vx = Math.abs(vel.current.vx);
          setFacing(1);
        }
        if (pos.current.x >= maxX) {
          pos.current.x = maxX;
          vel.current.vx = -Math.abs(vel.current.vx);
          setFacing(-1);
        }
      }
      if (phase === "float") {
        if (pos.current.y <= 0) {
          pos.current.y = 0;
          vel.current.vy = Math.abs(vel.current.vy);
        }
        if (pos.current.y >= maxY) {
          pos.current.y = maxY;
          vel.current.vy = -Math.abs(vel.current.vy);
        }
      } else {
        pos.current.y = 0; // stick to ground for walk/run
      }

      // apply to DOM (we animate left/bottom via JS; transforms are for body antics)
      const el = actorRef.current;
      if (el) {
        el.style.left = `${pos.current.x}px`;
        el.style.bottom = `${pos.current.y}px`;
      }

      // continue while in these phases
      if (["walk", "run", "float"].includes(phase)) {
        rafId.current = requestAnimationFrame(step);
      }
    };

    // start engine if this phase is physics-driven
    if (["walk", "run", "float"].includes(phase)) {
      rafId.current = requestAnimationFrame(step);
    }

    return () => cancelAnimationFrame(rafId.current);
  }, [phase, visible, hidden, isMirror]);

  if (hidden || !visible) return null;

  if (isMirror) {
    return (
      <div
        style={{
          position: "fixed",
          left: 12,
          bottom: 12,
          width: `${ACTOR_W}px`,
          height: `${ACTOR_H}px`,
          zIndex: 60,
          pointerEvents: "auto",
          filter: "drop-shadow(0 6px 14px rgba(0,0,0,.35))",
        }}
        title="Click to edit avatar"
        onClick={() => nav("/avatar")}
      >
        <button
          onClick={(e) => { e.stopPropagation(); setVisible(false); }}
          style={{
            position: "absolute",
            left: -6,
            top: -6,
            borderRadius: 12,
            fontSize: 12,
            padding: "2px 6px",
            border: "1px solid rgba(255,255,255,.25)",
            background: "rgba(20,20,30,.6)",
            color: "#fff",
          }}
          aria-label="Close mascot"
        >
          ×
        </button>
        <MascotSVG avatar={avatar} />
      </div>
    );
  }

  return (
    <>
      {/* PATROL CAT: bottom, left↔right U-turn */}
      <div
        className="pet patrol"
        style={{
          position: "fixed",
          bottom: 6,
          left: 0,
          width: 56,
          height: 34,
          pointerEvents: "none",
          opacity: 0.95,
          zIndex: 59,
        }}
      >
        <Cat />
      </div>

      {/* RAIL: full width, actor sits inside (we control left/bottom via JS) */}
      <div
        ref={railRef}
        style={{
          position: "fixed",
          left: 0,
          bottom: 12,
          width: "100vw",
          height: `${ACTOR_H}px`,
          pointerEvents: "none",
          zIndex: 60,
        }}
      >
        <div
          ref={actorRef}
          className={`actor ${phase}`}
          title="Click to edit avatar"
          onClick={() => nav("/avatar")}
          onDoubleClick={(e) => { e.stopPropagation(); setPhase("jump"); setTimeout(() => setPhase("walk"), 700); }}
          onContextMenu={(e) => { e.preventDefault(); setPhase("spin"); setTimeout(() => setPhase("walk"), 900); }}
          style={{
            position: "absolute",
            left: 0,
            bottom: 0,
            width: `${ACTOR_W}px`,
            height: `${ACTOR_H}px`,
            pointerEvents: "auto",
            filter: "drop-shadow(0 6px 14px rgba(0,0,0,.35))",
          }}
        >
          {/* close — travels with avatar */}
          <button
            onClick={(e) => { e.stopPropagation(); setVisible(false); }}
            style={{
              position: "absolute",
              left: -6,
              top: -6,
              borderRadius: 12,
              fontSize: 12,
              padding: "2px 6px",
              border: "1px solid rgba(255,255,255,.25)",
              background: "rgba(20,20,30,.6)",
              color: "#fff",
            }}
            aria-label="Close mascot"
          >
            ×
          </button>

          {/* FOLLOWER CAT — orbits the avatar */}
          <div
            className="pet follower"
            style={{
              position: "absolute",
              left: -52,
              bottom: -10,
              width: 46,
              height: 28,
              pointerEvents: "none",
              opacity: 0.95,
              animation: "cat-orbit 4.2s linear infinite",
            }}
          >
            <Cat />
          </div>

          {/* face/body (flip by facing) */}
          <div className="flip" style={{ transform: `scaleX(${facing})`, transformOrigin: "50% 100%" }}>
            <div className={`limbs ${phase === "walk" ? "walk" : phase === "run" ? "run" : ""}`} style={{ position: "absolute", inset: 0 }}>
              <MascotSVG avatar={avatar} />
            </div>
          </div>
        </div>
      </div>

      {/* styles */}
      <style>{`
        /* ENTRY / RECOVERY (kept as transforms so they stack with JS left/bottom) */
        .actor { transform-origin: 50% 100%; }
        .actor.fall { animation: fall-in 1.1s ease-out forwards; }
        @keyframes fall-in {
          0%{transform:translateY(-120vh) rotate(-180deg); opacity:0}
          85%{transform:translateY(0) rotate(8deg) scale(1.02); opacity:1}
          92%{transform:translateY(4px) rotate(-6deg) scale(0.96)}
          100%{transform:translateY(0) rotate(0) scale(1)}
        }
        .actor.getup { animation: getup 0.9s ease-out forwards; }
        @keyframes getup { 0%{transform:rotate(-6deg)} 30%{transform:rotate(6deg)} 60%{transform:rotate(-4deg)} 100%{transform:rotate(0)} }

        /* VERTICAL ANTICS (CSS-only; JS keeps left/bottom) */
        .actor.climb { animation: climb-up 3.6s ease-in-out forwards; }
        @keyframes climb-up { 0%{transform:translateY(0)} 30%{transform:translateY(-20vh)} 60%{transform:translateY(-40vh)} 100%{transform:translateY(-52vh)} }
        .actor.hang { animation: hang 2s ease-in-out infinite; }
        @keyframes hang { 0%{transform:translateY(-52vh)} 50%{transform:translateY(-51vh)} 100%{transform:translateY(-52vh)} }
        .actor.falldown { animation: fall-down 1.2s cubic-bezier(.2,.9,.3,1) forwards; }
        @keyframes fall-down { 0%{transform:translateY(-52vh)} 70%{transform:translateY(0) rotate(8deg)} 85%{transform:translateY(4px) rotate(-6deg)} 100%{transform:translateY(0)} }

        /* FUN */
        .actor.jump { animation: jump 0.7s ease-out forwards; }
        @keyframes jump { 0%{transform:translateY(0)} 35%{transform:translateY(-40px)} 100%{transform:translateY(0)} }
        .actor.spin { animation: spin 0.9s ease-in-out forwards; }
        @keyframes spin { 0%{transform:rotate(0)} 50%{transform:rotate(360deg)} 100%{transform:rotate(0)} }

        /* LIMB SWING (unchanged) */
        .limbs.walk svg #legL { animation: legL .6s ease-in-out infinite; transform-origin:45px 108px; }
        .limbs.walk svg #legR { animation: legR .6s ease-in-out infinite; transform-origin:55px 108px; }
        .limbs.run  svg #legL { animation: legL .35s ease-in-out infinite; transform-origin:45px 108px; }
        .limbs.run  svg #legR { animation: legR .35s ease-in-out infinite; transform-origin:55px 108px; }
        @keyframes legL { 0%{transform:rotate(10deg)} 50%{transform:rotate(-10deg)} 100%{transform:rotate(10deg)} }
        @keyframes legR { 0%{transform:rotate(-10deg)} 50%{transform:rotate(10deg)} 100%{transform:rotate(-10deg)} }

        /* CATS */
        .pet.patrol { animation: patrol 14s linear infinite alternate; }
        @keyframes patrol { 0%{ left: 0 } 100%{ left: calc(100vw - 56px) } }
        @keyframes cat-orbit {
          0%   { transform: translate(0,0) rotate(0deg) }
          25%  { transform: translate(12px,-6px) rotate(90deg) }
          50%  { transform: translate(0,-12px) rotate(180deg) }
          75%  { transform: translate(-12px,-6px) rotate(270deg) }
          100% { transform: translate(0,0) rotate(360deg) }
        }
      `}</style>
    </>
  );
}
