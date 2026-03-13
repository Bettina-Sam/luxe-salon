import { useEffect, useRef, useState } from "react";
import { InstructionCard, HUD, EndScreen } from "./GameKit";

export default function BubblePop({ onExit, onPoints }) {
  const [phase, setPhase] = useState("intro");
  const [time, setTime] = useState(30);
  const [score, setScore] = useState(0);
  const [bubs, setBubs] = useState([]);
  const stageRef = useRef(null);
  const spawnTimer = useRef(0);

  const start = () => {
    setScore(0);
    setTime(30);
    setBubs(Array.from({ length: 8 }, () => makeBubble()));
    setPhase("play");
  };

  useEffect(() => {
    if (phase !== "play") return;
    const iv = setInterval(() => setTime((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(iv);
  }, [phase]);

  useEffect(() => {
    if (phase === "play" && time === 0) {
      clearInterval(spawnTimer.current);
      onPoints?.(Math.max(1, Math.floor(score / 15)));
      setPhase("end");
    }
  }, [time, phase, score, onPoints]);

  useEffect(() => {
    if (phase !== "play") return;
    clearInterval(spawnTimer.current);
    spawnTimer.current = setInterval(() => {
      setBubs((prev) => {
        const need = Math.max(0, 6 - prev.filter((b) => !b.popping && !b.dead).length);
        const extra = prev.length < 10 ? Math.floor(Math.random() * 2) : 0;
        return [
          ...prev.filter((b) => !b.dead),
          ...Array.from({ length: need + extra }, () => makeBubble()),
        ];
      });
      setBubs((prev) => prev.map((b) => (Date.now() > b.dieAt && !b.popping ? { ...b, dead: true } : b)));
    }, 450);
    return () => clearInterval(spawnTimer.current);
  }, [phase]);

  function makeBubble() {
    const dur = 3500 + Math.random() * 2500;
    const x = 8 + Math.random() * 84;
    const y = 15 + Math.random() * 55;
    const r = 18 + Math.random() * 16;
    const hue = Math.floor(Math.random() * 360);
    return {
      id: cryptoRandomId(),
      x, y, r, hue,
      born: Date.now(),
      dieAt: Date.now() + dur,
      popping: false,
      dead: false,
      drift: (Math.random() * 2 - 1) * 10,
      spin: Math.random() > 0.5 ? 1 : -1,
    };
  }

  const pop = (id) => {
    if (phase !== "play") return;
    setBubs((prev) => prev.map((b) => (b.id === id && !b.popping ? { ...b, popping: true } : b)));
    setScore((s) => s + 10);
    // remove after animation
    setTimeout(() => {
      setBubs((prev) => prev.filter((b) => b.id !== id));
    }, 260);
  };

  return (
    <div className="wrap">
      {phase === "intro" && (
        <InstructionCard
          title="Bubble Pop"
          lines={[
            "Tap the colorful bubbles to pop them!",
            "Bubbles float, wobble, and burst in style.",
            "30 seconds — 10 points per pop. Let's go!",
          ]}
          onStart={start}
        />
      )}

      {phase === "play" && (
        <>
          <HUD time={time} score={score} hint="Pop pop pop!" emoji="🫧🎈" />
          <div ref={stageRef} className="stage">
            {bubs.map((b) => (
              <button
                key={b.id}
                className={`b ${b.popping ? "pop" : ""}`}
                style={{
                  left: `${b.x}%`,
                  top: `${b.y}%`,
                  width: b.r * 2,
                  height: b.r * 2,
                  "--drift": `${b.drift}px`,
                  "--spin": b.spin,
                  background: `radial-gradient(circle at 30% 30%, hsl(${b.hue}, 80%, 70%), hsl(${b.hue}, 80%, 40%))`,
                  animationDuration: `${3 + (b.r % 7) / 3}s, ${1.5 + Math.random()}s`,
                }}
                onClick={() => pop(b.id)}
                aria-label="Bubble"
              >
                <span className="emoji">🫧</span>
              </button>
            ))}
          </div>
        </>
      )}

      {phase === "end" && (
        <EndScreen
          title="Bubble Pop — Results"
          score={score}
          points={Math.max(1, Math.floor(score / 15))}
          onAgain={() => setPhase("intro")}
          onExit={onExit}
        />
      )}

     <style>{`
  .wrap {
    display: grid;
    gap: 10px;
    font-family: 'Arial', sans-serif;
  }

  /* Stage background — lively, moving gradient */
  .stage {
    position: relative;
    height: min(52vh, 460px);
    border-radius: 16px;
    overflow: hidden;
    background: linear-gradient(270deg, #ff9a9e, #fad0c4, #fbc2eb, #a6c1ee, #84fab0, #8fd3f4);
    background-size: 1200% 1200%;
    animation: gradientShift 20s ease infinite;
    box-shadow: 0 12px 36px rgba(0,0,0,.22);
    touch-action: manipulation;
  }

  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  /* Bubble buttons */
  .b {
    position: absolute;
    left: 50%; top: 50%;
    display: grid;
    place-items: center;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,.35);
    cursor: pointer;
    user-select: none;
    -webkit-tap-highlight-color: transparent;

    animation-name: floatY, wobble, spawnPop;
    animation-timing-function: ease-in-out, ease-in-out, ease-out;
    animation-iteration-count: infinite, infinite, 1;

    transition: transform .08s ease, opacity .2s ease, box-shadow .12s ease;
    box-shadow: 0 10px 20px rgba(0,0,0,.18);
    z-index: 2;
  }

  .b:hover { transform: translate(-50%, -50%) scale(1.1); }
  .b:active { transform: translate(-50%, -50%) scale(.9); }

  .b .emoji {
    font-size: 18px;
    transform: translateY(-1px);
    filter: drop-shadow(0 4px 8px rgba(0,0,0,.25));
  }

  /* Pop animation */
  .b.pop {
    pointer-events: none;
    animation: popOut .24s ease forwards !important;
  }

  @keyframes spawnPop {
    0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
    100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
  }

  @keyframes popOut {
    0%   { transform: translate(-50%, -50%) scale(1); opacity: 1; }
    50%  { transform: translate(-50%, -50%) scale(1.4); opacity: .8; }
    100% { transform: translate(-50%, -50%) scale(.2); opacity: 0; }
  }

  /* Floating up & down */
  @keyframes floatY {
    0%   { transform: translate(calc(-50% - var(--drift)/2), -52%) }
    50%  { transform: translate(calc(-50% + var(--drift)), -46%) }
    100% { transform: translate(calc(-50% - var(--drift)/2), -52%) }
  }

  /* Gentle wobble & tiny rotation */
  @keyframes wobble {
    0%   { transform: translate(-50%, -50%) rotate(0deg) }
    50%  { transform: translate(calc(-50% + var(--drift)/2), -50%) rotate(calc(5deg * var(--spin))) }
    100% { transform: translate(-50%, -50%) rotate(0deg) }
  }
`}</style>

    </div>
  );
}

function cryptoRandomId() {
  try {
    const a = new Uint32Array(2);
    crypto.getRandomValues(a);
    return `${a[0].toString(36)}${a[1].toString(36)}`;
  } catch {
    return Math.random().toString(36).slice(2);
  }
}
