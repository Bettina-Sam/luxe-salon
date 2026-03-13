import { useEffect, useRef, useState } from "react";

const LINES = [
  "Your glow is doing the most ✨",
  "Main-character energy 💃",
  "Skin so dewy—rain’s jealous 💧",
  "Brows? Elevated. Mood? Elevated. ✅",
  "That lip shade is iconic 💋",
  "Elegance is your default 🖤",
  "Fresh as a spring morning 🌿",
  "You’re the blueprint 🔥",
  "Radiance check: A+ 🏅",
  "Salon-level sparkle 🌟",
];

const MAX_BUBBLES = 6;

export default function ComplimentFab() {
  const [bubbles, setBubbles] = useState([]);
  const recent = useRef([]);

  const pickLine = () => {
    const used = new Set(recent.current);
    let idx = Math.floor(Math.random() * LINES.length);
    let guard = 0;
    while (used.has(idx) && guard++ < 20) idx = Math.floor(Math.random() * LINES.length);
    recent.current = [...recent.current, idx].slice(-5);
    return LINES[idx];
  };

  const emit = (count = 1) => {
    setBubbles((cur) => {
      const add = Array.from({ length: count }).map(() => {
        const id = crypto?.randomUUID?.() || String(Math.random());
        // inward float (always towards left/center)
        const dx = -(Math.random() * 60 + 40); // always inward (negative X)
        const dur = 2200 + Math.random() * 1400;
        const rot = (Math.random() * 10 - 5).toFixed(1);
        const delay = Math.random() * 100;
        return { id, text: pickLine(), dx, rot, dur, delay };
      });
      return [...cur, ...add].slice(-MAX_BUBBLES);
    });

    setTimeout(() => {
      setBubbles((cur) => cur.slice(-MAX_BUBBLES));
    }, 3800);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key?.toLowerCase() === "c") emit(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="cg-wrap" aria-live="polite">
      {/* Compliment bubbles */}
      <div className="cg-bubbles" aria-hidden>
        {bubbles.map((b) => (
          <div
            key={b.id}
            className="cg-bubble"
            style={{
              "--dx": `${b.dx}px`,
              "--dur": `${b.dur}ms`,
              "--rot": `${b.rot}deg`,
              "--delay": `${b.delay}ms`,
            }}
            onAnimationEnd={() =>
              setBubbles((cur) => cur.filter((x) => x.id !== b.id))
            }
          >
            {b.text}
          </div>
        ))}
      </div>

      {/* The ✨ FAB above WhatsApp icon */}
      <button
        className="cg-fab"
        aria-label="Compliment Generator"
        title="Compliment (C)"
        onClick={() => emit(1)}
        onDoubleClick={(e) => {
          e.preventDefault();
          emit(3);
        }}
      >
        ✨
      </button>
        <style>{`
  /* animation for peeking halfway in and out (not used now, but safe to keep) */
  @keyframes slideInHalf {
    0% { transform: translateX(0); }
    50% { transform: translateX(150px); }
    100% { transform: translateX(0); }
  }

  /* Wrapper above WhatsApp icon */
  .cg-wrap {
    position: fixed;
    right: var(--float-right, 18px);
    bottom: var(--motiv-bottom, 92px);
    z-index: 1190;
    pointer-events: none;
  }

  /* Bubble styling */
  .cg-bubble {
    pointer-events: none;
    user-select: none;
    font-size: 14px;
    line-height: 1.2;
    color: #111;
    background: linear-gradient(180deg, rgba(255,255,255,.95), rgba(255,255,255,.88));
    border: 1px solid rgba(0,0,0,.08);
    padding: 8px 12px;
    border-radius: 999px;
    box-shadow: 0 12px 30px rgba(0,0,0,.18);
    backdrop-filter: blur(8px);
    transform-origin: 100% 100%;
    animation: cg-slideIn var(--dur) ease-out forwards;
    animation-delay: var(--delay);
    margin-bottom: 8px;
    white-space: nowrap;
    position: relative;
  }

  @media (prefers-color-scheme: dark) {
    .cg-bubble {
      color: #f5f5f7;
      background: linear-gradient(180deg, rgba(30,30,36,.86), rgba(24,24,30,.82));
      border-color: rgba(255,255,255,.12);
      box-shadow: 0 14px 34px rgba(0,0,0,.5);
    }
  }

  /* ✨ Slide fully inside the screen and fade with confetti */
  @keyframes cg-slideIn {
    0% {
      opacity: 0;
      transform: translateX(80%) translateY(0) scale(0.96);
    }
    15% {
      opacity: 1;
      transform: translateX(0) translateY(-10px) scale(1);
    }
    75% {
      opacity: 1;
      transform: translateX(-10%) translateY(-110px) scale(1);
    }
    100% {
      opacity: 0;
      transform: translateX(-15%) translateY(-160px) scale(1.08);
    }
  }

  /* 🎉 Sparkle confetti effect */
  .cg-bubble::after {
    content: "✨";
    position: absolute;
    font-size: 10px;
    right: -8px;
    bottom: -4px;
    opacity: 0;
    animation: cg-confetti var(--dur) ease-in forwards;
    animation-delay: calc(var(--dur) - 600ms);
  }

  @keyframes cg-confetti {
    0% { opacity: 0; transform: scale(0.5) rotate(0deg); }
    20% { opacity: 1; transform: scale(1.3) rotate(15deg); }
    100% { opacity: 0; transform: translateY(-40px) scale(0.4) rotate(60deg); }
  }

  /* Floating button (compliment trigger) */
  .cg-fab {
    pointer-events: auto;
    width: 54px;
    height: 54px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    font-size: 22px;
    border: 1px solid rgba(0,0,0,.15);
    background: radial-gradient(120% 120% at 30% 20%, #ffffff 0%, #f4f4ff 45%, #f0f8ff 100%);
    box-shadow: 0 12px 28px rgba(0,0,0,.25);
    transition: transform .12s ease, box-shadow .12s ease;
    backdrop-filter: blur(6px);
  }

  .cg-fab:hover {
    transform: translateY(-1px) scale(1.03);
    box-shadow: 0 16px 34px rgba(0,0,0,.28);
  }

  .cg-fab:active {
    transform: translateY(0) scale(.97);
  }

  @media (prefers-color-scheme: dark) {
    .cg-fab {
      color: #fff;
      border-color: rgba(255,255,255,.18);
      background: radial-gradient(120% 120% at 30% 20%, #2a2a34 0%, #262633 45%, #22222c 100%);
    }
  }
`}</style>

    
    </div>
  );
}
