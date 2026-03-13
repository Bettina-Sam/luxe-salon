import { useEffect, useRef, useState } from "react";
import { InstructionCard, HUD, EndScreen } from "./GameKit";

/**
 * Color Simon — Neon Glow
 * Repeat the color sequence. Each round adds one step and speeds up.
 * Controls: click/tap the tiles or press 1/2/3/4.
 * 3 strikes = game over. Points grow with round + streak.
 */
export default function ColorSimon({ onExit, onPoints }) {
  const [phase, setPhase] = useState("intro"); // intro | play | end
  const [time, setTime]   = useState(60);
  const [score, setScore] = useState(0);
  const [note, setNote]   = useState("Watch the sequence…");
  const [round, setRound] = useState(0);
  const [strikes, setStrikes] = useState(0);

  // sequence + input
  const seqRef = useRef([]);     // array of tile indexes [0..3]
  const stepRef = useRef(0);     // user progress within sequence
  const lockRef = useRef(true);  // ignore input while playing back
  const speedRef = useRef(700);  // ms per flash, reduces each round
  const pointsToSend = useRef(0);

  // neon flash state
  const [hot, setHot] = useState(null);   // glowing index while playing or pressed
  const [ripples, setRipples] = useState([]); // {id, i} for ripple anim

  // simple beeps
  const audio = useRef(null);
  const ensureAudio = () => {
    if (!audio.current) audio.current = new (window.AudioContext || window.webkitAudioContext)();
  };
  const beep = (i, dur=0.14, vol=0.06) => {
    try {
      ensureAudio();
      const freqs = [392, 494, 587, 698]; // G4, B4, D5, F5
      const o = audio.current.createOscillator();
      const g = audio.current.createGain();
      o.type = "sine"; o.frequency.value = freqs[i] || 440;
      g.gain.value = vol;
      o.connect(g); g.connect(audio.current.destination);
      o.start(); o.stop(audio.current.currentTime + dur);
    } catch {}
  };

  // start
  const start = () => {
    setScore(0); setRound(0); setStrikes(0); setTime(60);
    seqRef.current = [];
    stepRef.current = 0;
    speedRef.current = 700;
    setNote("Watch the sequence…");
    setPhase("play");
  };

  // timer
  useEffect(() => {
    if (phase !== "play") return;
    const iv = setInterval(() => setTime(t => Math.max(0, t - 1)), 1000);
    return () => clearInterval(iv);
  }, [phase]);

  useEffect(() => {
    if (phase === "play" && time === 0) end();
  }, [time, phase]);

  // keyboard input
  useEffect(() => {
    if (phase !== "play") return;
    const onKey = (e) => {
      const map = { "1":0, "2":1, "3":2, "4":3 };
      const idx = map[e.key];
      if (idx !== undefined) choose(idx);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase]);

  // kick off first round when play starts
  useEffect(() => {
    if (phase === "play") nextRound();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const COLORS = [
    { name: "Crimson", base: "#ef4444", glow: "rgba(239,68,68,.6)" },   // red
    { name: "Lime",    base: "#22c55e", glow: "rgba(34,197,94,.55)" },  // green
    { name: "Sky",     base: "#38bdf8", glow: "rgba(56,189,248,.55)" }, // blue
    { name: "Amber",   base: "#f59e0b", glow: "rgba(245,158,11,.55)" }, // yellow
  ];

  const nextRound = async () => {
    lockRef.current = true;
    // add step
    seqRef.current = [...seqRef.current, Math.floor(Math.random() * 4)];
    setRound(r => r + 1);
    setNote("Watch…");
    stepRef.current = 0;

    // ramp speed slightly
    speedRef.current = Math.max(340, speedRef.current - 28);

    // playback
    await playSequence(seqRef.current);
    setNote("Your turn!");
    lockRef.current = false;
  };

  const playSequence = async (arr) => {
    for (let i = 0; i < arr.length; i++) {
      const idx = arr[i];
      setHot(idx); ripple(idx);
      beep(idx);
      await sleep(speedRef.current * 0.68);
      setHot(null);
      await sleep(speedRef.current * 0.32);
    }
  };

  const choose = (i) => {
    if (lockRef.current || phase !== "play") return;
    // flash + beep
    setHot(i); ripple(i); beep(i);
    setTimeout(() => setHot(null), 140);

    const exp = seqRef.current[stepRef.current];
    if (i === exp) {
      // correct
      stepRef.current += 1;
      const add = 10 + Math.floor(stepRef.current * 1.2) + round; // scale points a bit by depth
      pointsToSend.current += add;
      setScore(s => s + add);
      setNote("Nice!");
      if (stepRef.current >= seqRef.current.length) {
        // full sequence entered → next round
        lockRef.current = true;
        setTimeout(() => nextRound(), 420);
      }
    } else {
      // wrong
      setStrikes(n => n + 1);
      setNote("Oops!");
      shakeBoard();
      stepRef.current = 0;
      // if 3 strikes, done
      if (strikes + 1 >= 3) {
        end();
        return;
      }
      // re-show sequence quickly to help the player
      lockRef.current = true;
      setTimeout(async () => {
        setNote("Watch again…");
        await playSequence(seqRef.current);
        setNote("Your turn!");
        lockRef.current = false;
      }, 420);
    }
  };

  const end = () => {
    lockRef.current = true;
    onPoints?.(Math.max(1, Math.floor(score / 40)));
    setPhase("end");
  };

  // tiny helpers
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const ripple = (i) => {
    const id = Math.random().toString(36).slice(2);
    setRipples(rs => [...rs, { id, i }]);
    setTimeout(() => setRipples(rs => rs.filter(r => r.id !== id)), 480);
  };
  const shakeBoard = () => {
    const el = document.querySelector(".simon-board");
    if (!el) return;
    el.classList.add("shake");
    setTimeout(() => el.classList.remove("shake"), 320);
  };

  return (
    <div className="simon">
      {phase === "intro" && (
        <InstructionCard
          title="Color Simon"
          lines={[
            "Watch the glowing tiles, then repeat the sequence.",
            "Click/tap or use keys 1–4.",
            "You have 60s. 3 strikes = game over.",
          ]}
          onStart={start}
        />
      )}

      {phase === "play" && (
        <>
          <HUD
            time={time}
            score={score}
            hint={`Round ${round} • ${note} • Strikes ${strikes}/3`}
            emoji="🟥🟩🟦🟨"
          />
          <div className="stage">
            <div className="simon-board">
              {COLORS.map((c, i) => (
                <button
                  key={i}
                  className={`tile ${hot === i ? "hot" : ""}`}
                  style={{
                    "--base": c.base,
                    "--glow": c.glow,
                    "--idx": i,
                  }}
                  onClick={() => choose(i)}
                  aria-label={c.name}
                >
                  <span className="ring" />
                  <span className="label">{i + 1}</span>
                </button>
              ))}

              {/* Ripples */}
              {ripples.map(r => (
                <span key={r.id} className={`ripple i${r.i}`} />
              ))}
            </div>

            <div className="legend">
              <span>1</span><span>2</span><span>3</span><span>4</span>
            </div>
          </div>
        </>
      )}

      {phase === "end" && (
        <EndScreen
          title="Color Simon — Results"
          score={score}
          points={Math.max(1, Math.floor(score / 40))}
          onAgain={() => setPhase("intro")}
          onExit={onExit}
        />
      )}

      <style>{`
        .simon { display:grid; gap:10px; }

        .stage {
          display:grid; place-items:center; gap:10px;
        }

        .simon-board {
          position: relative;
          width: min(560px, 88vw);
          aspect-ratio: 1 / 1;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          grid-template-rows: repeat(2, 1fr);
          gap: 14px;
          padding: 16px;
          border-radius: 18px;
          background: radial-gradient(120% 120% at 50% 0%, #111827 0%, #0b1220 60%, #08101b 100%);
          box-shadow: 0 18px 40px rgba(0,0,0,.28);
          overflow: hidden;
        }
        .simon-board.shake { animation: shake .32s ease; }
        @keyframes shake {
          0%{ transform: translateX(0) } 25%{ transform: translateX(-6px) }
          50%{ transform: translateX(6px) } 100%{ transform: translateX(0) }
        }

        .tile {
          position: relative;
          border: none;
          border-radius: 18px;
          cursor: pointer;
          background: linear-gradient(180deg, color-mix(in oklab, var(--base) 26%, #ffffff 8%) , color-mix(in oklab, var(--base) 70%, #000 8%));
          box-shadow:
            inset 0 0 0 2px color-mix(in oklab, var(--base) 70%, #ffffff 0%),
            0 8px 22px color-mix(in oklab, var(--base) 25%, #000 0%);
          filter: saturate(1.05);
          transition: transform .08s ease, box-shadow .12s ease;
          outline: none;
        }
        .tile:hover { transform: translateY(-2px) scale(1.01); }
        .tile:active { transform: translateY(0) scale(.99); }

        /* neon ring glow */
        .tile .ring {
          position: absolute; inset: -6px;
          border-radius: 22px;
          box-shadow: 0 0 0 0 var(--glow), 0 0 0 0 rgba(0,0,0,0);
          opacity: .0; pointer-events:none;
          transition: opacity .08s ease;
        }
        .tile.hot .ring {
          opacity: 1;
          animation: ringPulse .42s ease-out;
        }
        @keyframes ringPulse {
          0%   { box-shadow: 0 0 0 0 var(--glow), 0 0 30px 8px var(--glow); }
          100% { box-shadow: 0 0 0 14px rgba(0,0,0,0), 0 0 0 0 rgba(0,0,0,0); }
        }

        .label {
          position: absolute; right: 10px; bottom: 8px;
          font-weight: 800; color: rgba(255,255,255,.85);
          text-shadow: 0 2px 6px rgba(0,0,0,.45);
          font-size: 14px;
        }

        /* ripples (one per tile slot) */
        .ripple {
          position: absolute;
          width: 40%; height: 40%;
          border-radius: 999px;
          border: 4px solid rgba(255,255,255,.55);
          opacity: .0; transform: scale(.2);
          animation: ripple .48s ease-out forwards;
          pointer-events:none;
        }
        @keyframes ripple {
          0%{ opacity:.6; transform: scale(.3) }
          100%{ opacity:0; transform: scale(1.4) }
        }
        .ripple.i0 { left: 9%;  top: 9%; }
        .ripple.i1 { right: 9%; top: 9%; }
        .ripple.i2 { left: 9%;  bottom: 9%; }
        .ripple.i3 { right: 9%; bottom: 9%; }

        .legend { display:flex; gap:10px; opacity:.7; }
        .legend span {
          font-size:12px; background: rgba(255,255,255,.08);
          border: 1px solid rgba(255,255,255,.18);
          padding: 4px 8px; border-radius: 999px;
        }
      `}</style>
    </div>
  );
}
