import { useEffect, useRef, useState } from "react";
import { InstructionCard, HUD, EndScreen } from "./GameKit";

/**
 * Balloon Float — lively sky edition
 * Controls: Hold mouse/touch/Space/Enter to inflate; release to bank size.
 * - Animated sky, sun, clouds, parallax hills, swaying balloon + string
 * - Risk meter (green→yellow→red) as you near pop limit
 * - Confetti burst when you bank a big size
 * - 30s round, final points from your BEST banked size
 */
export default function BalloonFloat({ onExit, onPoints }) {
  // game state
  const [phase, setPhase] = useState("intro");     // "intro" | "play" | "end"
  const [time, setTime] = useState(30);
  const [best, setBest] = useState(0);             // best banked size
  const [size, setSize] = useState(40);            // current balloon diameter
  const [holding, setHolding] = useState(false);
  const [status, setStatus] = useState("Ready");
  const [popped, setPopped] = useState(false);

  const stageRef = useRef(null);
  const confettiRef = useRef([]);

  // tuning
  const GROW = 3;          // px per tick while holding
  const SHRINK = 1;        // px per tick when not holding
  const TICK_MS = 70;
  const POP_LIMIT = 140;   // approx visual pop
  const BIG_BANK = 110;    // confetti threshold

  // start
  const start = () => {
    setBest(0);
    setSize(40);
    setTime(30);
    setStatus("Hold to inflate… release to bank!");
    setPopped(false);
    setPhase("play");
  };

  // countdown timer
  useEffect(() => {
    if (phase !== "play") return;
    const iv = setInterval(() => setTime(t => Math.max(0, t - 1)), 1000);
    return () => clearInterval(iv);
  }, [phase]);

  // per-tick growth/shrink + pop
  useEffect(() => {
    if (phase !== "play") return;
    const id = setInterval(() => {
      setSize(s => {
        const next = Math.max(32, Math.min(POP_LIMIT + 4, s + (holding ? GROW : -SHRINK)));
        if (next >= POP_LIMIT) {
          // pop!
          setPopped(true);
          setStatus("Pop! 😅");
          setPhase("end");
        }
        return next;
      });
    }, TICK_MS);
    return () => clearInterval(id);
  }, [phase, holding]);

  // end when time runs out
  useEffect(() => {
    if (phase === "play" && time === 0) {
      setStatus("Time!");
      setPhase("end");
    }
  }, [phase, time]);

  // keyboard hold (Space / Enter)
  useEffect(() => {
    if (phase !== "play") return;
    const down = (e) => {
      if (e.code === "Space" || e.code === "Enter") { e.preventDefault(); setHolding(true); }
    };
    const up = (e) => {
      if (e.code === "Space" || e.code === "Enter") { e.preventDefault(); handleBank(); setHolding(false); }
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, [phase, size, best]);

  // bank on mouse/touch release
  const handleBank = () => {
    if (phase !== "play") return;
    setBest(b => {
      const nb = Math.max(b, Math.floor(size));
      // confetti if big
      if (size >= BIG_BANK) blastConfetti();
      return nb;
    });
    setStatus("Banked!");
  };

  // points on end
  const finalPoints = Math.max(1, Math.floor(best / 20));
  useEffect(() => {
    if (phase === "end") onPoints?.(finalPoints);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // confetti burst (simple DOM particles)
  const blastConfetti = () => {
    const stage = stageRef.current;
    if (!stage) return;
    const colors = ["#fbbf24","#60a5fa","#a78bfa","#34d399","#f472b6"];
    const N = 22;
    for (let i=0;i<N;i++){
      const s = document.createElement("span");
      s.className = "confetti";
      s.style.background = colors[i % colors.length];
      s.style.left = "50%";
      s.style.top = "45%";
      s.style.setProperty("--dx", `${(Math.random()*2-1)*140}px`);
      s.style.setProperty("--dy", `${(Math.random()*-1-0.5)*140}px`);
      s.style.setProperty("--rt", `${(Math.random()*2-1)*180}deg`);
      stage.appendChild(s);
      confettiRef.current.push(s);
      setTimeout(()=>{ s.remove(); }, 900);
    }
  };

  // risk meter color
  const risk = size / POP_LIMIT; // 0..1+
  const meterColor = risk < 0.6 ? "#22c55e" : risk < 0.85 ? "#eab308" : "#ef4444";

  return (
    <div className="balloon-game">
      {phase === "intro" && (
        <InstructionCard
          title="Balloon Float"
          lines={[
            "Press & HOLD (mouse, touch, Space/Enter) to inflate.",
            "Release to BANK your size — aim big but don’t POP!",
            "30 seconds. Score = your BEST banked size.",
          ]}
          onStart={start}
        />
      )}

      {phase === "play" && (
        <>
          <HUD
            time={time}
            score={best}
            hint={`Best ${best}px • ${status}`}
            emoji="🎈"
          />
          <div
            ref={stageRef}
            className="stage"
            onMouseDown={() => setHolding(true)}
            onMouseUp={() => { handleBank(); setHolding(false); }}
            onMouseLeave={() => setHolding(false)}
            onTouchStart={() => setHolding(true)}
            onTouchEnd={() => { handleBank(); setHolding(false); }}
          >
            {/* background layers */}
            <div className="sun" />
            <div className="cloud c1">☁️</div>
            <div className="cloud c2">☁️</div>
            <div className="hill back" />
            <div className="hill front" />

            {/* risk meter */}
            <div className="meter">
              <div className="bar" style={{width: `${Math.min(100, risk*100)}%`, background: meterColor}}/>
              <span className="label">{risk<0.6?"Chill":risk<0.85?"Careful":"Danger"}</span>
            </div>

            {/* balloon */}
            <div
              className={`balloon ${holding ? "hold" : ""}`}
              style={{ width: size, height: size }}
              aria-label="Balloon"
            >
              <div className="string" />
              <div className="shine" />
              <div className="emoji">🎈</div>
            </div>

            {/* instruction chip */}
            <div className="chip">{holding ? "Hold…" : "Release to bank"}</div>
          </div>
        </>
      )}

      {phase === "end" && (
        <EndScreen
          title={popped ? "It popped! 😅" : "Time!"}
          score={best}
          points={finalPoints}
          onAgain={() => setPhase("intro")}
          onExit={onExit}
        />
      )}

      <style>{`
        .balloon-game { display: grid; gap: 10px; }

        /* sky stage with depth */
        .stage {
          position: relative;
          height: min(54vh, 480px);
          border-radius: 16px;
          overflow: hidden;
          background:
            radial-gradient(120% 120% at 50% -10%, #1e2a46 0%, #141b2b 60%, #0e1626 100%);
          box-shadow: 0 18px 40px rgba(0,0,0,.28);
          user-select: none;
          touch-action: manipulation;
        }

        /* gentle sun glow */
        .sun {
          position: absolute; width: 160px; height: 160px; border-radius: 50%;
          background: radial-gradient(100% 100% at 50% 50%, #fde68a, #fb923c 70%, rgba(251,146,60,0) 72%);
          top: -40px; right: -30px; opacity: .45;
          animation: sunFloat 10s ease-in-out infinite;
        }
        @keyframes sunFloat { 0%{transform:translateY(0)} 50%{transform:translateY(8px)} 100%{transform:translateY(0)} }

        /* clouds */
        .cloud {
          position: absolute; font-size: 46px; opacity: .35; filter: drop-shadow(0 8px 14px rgba(0,0,0,.25));
          animation: cloudDrift linear infinite;
        }
        .cloud.c1 { top: 14%; left: -10%; animation-duration: 24s; }
        .cloud.c2 { top: 34%; left: -20%; animation-duration: 32s; font-size: 52px; opacity: .28; }
        @keyframes cloudDrift { from{ transform: translateX(0) } to{ transform: translateX(140%) } }

        /* parallax hills (pure CSS shapes) */
        .hill {
          position: absolute; left: -10%; right: -10%; height: 40%;
          border-radius: 50% 50% 0 0 / 80% 80% 0 0;
          bottom: -24%;
          filter: blur(1px);
        }
        .hill.back  { background: linear-gradient(180deg,#1d243c,#121a2d); transform: scale(1.2); }
        .hill.front { background: linear-gradient(180deg,#263255,#17203a); bottom: -20%; filter: blur(0px); }

        /* balloon with sway + string */
        .balloon {
          position: absolute; left: 50%; top: 50%;
          transform: translate(-50%,-50%) rotate(0deg);
          border-radius: 50%;
          background: radial-gradient(110% 110% at 30% 25%, rgba(255,255,255,.35), rgba(255,255,255,.06));
          border: 1px solid rgba(255,255,255,.35);
          display: grid; place-items: center;
          animation: sway 3.2s ease-in-out infinite;
          transition: width .08s linear, height .08s linear, transform .12s ease;
          box-shadow: 0 10px 28px rgba(0,0,0,.22);
        }
        .balloon.hold { animation-duration: 2.2s; } /* a bit more lively while holding */

        @keyframes sway { 0%{ transform:translate(-50%,-50%) rotate(-2deg) } 50%{ transform:translate(-50%,-50%) rotate(2deg) } 100%{ transform:translate(-50%,-50%) rotate(-2deg) } }

        .string {
          position: absolute; bottom: -46px; width: 2px; height: 54px; left: 50%;
          transform: translateX(-50%); background: linear-gradient(#ddd,#bbb);
          border-radius: 2px; opacity: .8;
          animation: wiggle 1.8s ease-in-out infinite;
        }
        @keyframes wiggle { 0%{ transform:translateX(-50%) rotate(-3deg)} 50%{ transform:translateX(-50%) rotate(3deg)} 100%{ transform:translateX(-50%) rotate(-3deg)} }

        .shine {
          position: absolute; left: 16%; top: 18%; width: 28%; height: 28%;
          border-radius: 50%; background: radial-gradient(100% 100%, rgba(255,255,255,.55), rgba(255,255,255,0));
          filter: blur(0.5px);
        }
        .emoji { font-size: 22px; transform: translateY(-1px); }

        /* risk meter */
        .meter {
          position: absolute; left: 14px; top: 14px; right: 14px;
          height: 10px; border-radius: 999px; background: rgba(255,255,255,.08);
          border: 1px solid rgba(255,255,255,.18); overflow: hidden;
          display: flex; align-items: center;
        }
        .meter .bar { height: 100%; transition: width .08s linear, background .12s ease; }
        .meter .label {
          position: absolute; right: 10px; top: -20px; font-size: 11px; opacity: .85;
          background: rgba(0,0,0,.35); color: #fff; padding: 2px 6px; border-radius: 999px;
        }

        /* instruction chip */
        .chip {
          position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%);
          background: rgba(0,0,0,.45); color: #fff; padding: 6px 10px; border-radius: 10px;
          font-size: 12px; box-shadow: 0 8px 18px rgba(0,0,0,.25);
          animation: chipFloat 2.8s ease-in-out infinite;
        }
        @keyframes chipFloat { 0%{transform:translate(-50%,0)} 50%{transform:translate(-50%,-4px)} 100%{transform:translate(-50%,0)} }

        /* confetti particles */
        .confetti {
          position: absolute; width: 7px; height: 10px; border-radius: 2px;
          animation: conf 0.9s ease-out forwards;
          box-shadow: 0 6px 14px rgba(0,0,0,.25);
        }
        @keyframes conf {
          0%   { transform: translate(0,0) rotate(0);   opacity: 1; }
          100% { transform: translate(var(--dx),var(--dy)) rotate(var(--rt)); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
