import { useEffect, useRef, useState } from "react";
import { InstructionCard, HUD, EndScreen } from "./GameKit";

/**
 * Breath Rush — rhythm tapper
 * Tap/click (or Space/Enter) when the moving ring fits the center circle.
 * - BPM stages: 72 → 88 → 104 → 120 (gets spicier)
 * - Accuracy windows: PERFECT / GREAT / GOOD / MISS
 * - Combo & multiplier, streak glow, background pulse
 * - 60s round; end screen shows score & awards points
 */
export default function BreathRush({ onExit, onPoints }) {
  const [phase, setPhase] = useState("intro");      // intro | play | end
  const [time, setTime]   = useState(60);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [note, setNote]   = useState("Tap when the ring fits the circle!");
  const [flash, setFlash] = useState(false);         // bg flash on hits
  const [stage, setStage] = useState(0);             // BPM stage idx
  const [grade, setGrade] = useState(null);          // 'Perfect' etc (brief)

  // visual state
  const progRef = useRef(0);   // 0..1 position of ring inside a beat
  const bpmRef  = useRef(72);  // current BPM
  const raf     = useRef(0);
  const tPrev   = useRef(0);
  const pluses  = useRef([]);  // floating +score DOMs

  // stage plan across 60s
  const STAGES = [
    { until: 45, bpm: 72 },
    { until: 30, bpm: 88 },
    { until: 15, bpm: 104 },
    { until:  0, bpm: 120 },
  ];

  // --- lifecycle
  useEffect(() => {
    if (phase !== "play") return;
    const iv = setInterval(() => setTime(t => Math.max(0, t - 1)), 1000);
    return () => clearInterval(iv);
  }, [phase]);

  useEffect(() => {
    if (phase !== "play") return;
    // choose bpm by remaining time
    const st = STAGES.findIndex(s => time > s.until) === -1
      ? STAGES.findIndex(s => s.until === 0)
      : STAGES.findIndex(s => time > s.until);
    const idx = Math.max(0, STAGES.length - 1 - st);
    const target = STAGES[idx]?.bpm || 120;
    setStage(idx);
    bpmRef.current = target;
  }, [time, phase]);

  useEffect(() => {
    if (phase === "play" && time === 0) end();
  }, [time, phase]);

  // game loop
  const start = () => {
    setScore(0); setCombo(0); setTime(60); setNote("Tap in time!");
    setGrade(null); setFlash(false); setStage(0);
    bpmRef.current = 72; progRef.current = 0;
    tPrev.current = performance.now();
    setPhase("play");
    raf.current = requestAnimationFrame(loop);
  };

  const loop = (tNow) => {
    const dt = Math.min(0.05, (tNow - tPrev.current) / 1000);
    tPrev.current = tNow;

    // advance ring with current BPM
    const secondsPerBeat = 60 / bpmRef.current;
    progRef.current = (progRef.current + dt / secondsPerBeat) % 1;

    raf.current = requestAnimationFrame(loop);
  };

  const end = () => {
    cancelAnimationFrame(raf.current);
    onPoints?.(Math.max(1, Math.floor(score / 50)));
    setPhase("end");
  };

  // --- input
  useEffect(() => {
    if (phase !== "play") return;
    const down = (e) => {
      if (e.code === "Space" || e.code === "Enter") { e.preventDefault(); judge(); }
    };
    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, [phase]);

  const judge = () => {
    if (phase !== "play") return;

    // distance to hit moment (when prog ~= 0 or 1)
    const p = progRef.current;
    const d = Math.min(Math.abs(p - 1), Math.abs(p - 0)); // 0..0.5

    // windows (tighten slightly with faster BPM)
    const speed = bpmRef.current;
    const adj = speed >= 110 ? 0.02 : speed >= 95 ? 0.01 : 0;

    let pts = 0, tag = "", mult = 1;
    if (d < 0.06 - adj) { pts = 30; tag = "Perfect"; mult = 1.6; }
    else if (d < 0.12 - adj) { pts = 18; tag = "Great"; mult = 1.3; }
    else if (d < 0.18 - adj) { pts = 10; tag = "Good"; mult = 1.0; }
    else { pts = 0; tag = "Miss"; mult = 0; }

    if (pts > 0) {
      const c2 = combo + 1;
      setCombo(c2);
      setScore(s => s + Math.round(pts * (1 + Math.min(0.02 * c2, 0.6))));
      setNote(`${tag}! +${pts}`);
      setGrade(tag);
      hitFlash();
      floatPlus(`+${pts}`);
    } else {
      setCombo(0);
      setNote("Miss…");
      setGrade("Miss");
    }

    // clear grade quickly
    setTimeout(() => setGrade(null), 420);
  };

  const hitFlash = () => {
    setFlash(true);
    setTimeout(() => setFlash(false), 120);
  };

  // floating +score badges
  const floatPlus = (text) => {
    const id = Math.random().toString(36).slice(2);
    pluses.current.push({ id, text });
    // auto-remove
    setTimeout(() => {
      const el = document.getElementById(`plus-${id}`);
      if (el) el.remove();
    }, 800);
  };

  // UI: clickable stage to judge
  const tapAnywhere = () => judge();

  // derived visuals
  const scale = 0.55 + progRef.current * 1.25; // ring scale 0.55 → 1.8
  const beatPulse = 0.98 + (progRef.current < 0.1 ? (0.1 - progRef.current) * 0.2 : 0);

  const stageName = ["Calm", "Steady", "Focus", "Rush"][stage] || "Rush";

  return (
    <div className="rush">
      {phase === "intro" && (
        <InstructionCard
          title="Breath Rush"
          lines={[
            "Tap/click — or press Space/Enter — when the moving ring fits the center circle.",
            "Each hit builds your combo and boosts points.",
            "Speed rises over time (BPM increases). You’ve got 60s!",
          ]}
          onStart={start}
        />
      )}

      {phase === "play" && (
        <>
          <HUD
            time={time}
            score={score}
            hint={`Combo ${combo} • ${stageName} (${bpmRef.current} BPM) • ${note}`}
            emoji="🌬️🎯"
          />
          <div className={`stage ${flash ? "flash" : ""}`} onClick={tapAnywhere}>
            {/* background pulse halo */}
            <div className="halo" style={{ transform: `scale(${beatPulse})` }} />

            {/* center target */}
            <div className="center">
              <div className="ringBase" />
              <div className={`grade ${grade ? "show" : ""}`}>{grade || ""}</div>
            </div>

            {/* animated moving ring */}
            <div className="ring" style={{ transform: `scale(${scale})` }} />

            {/* subtle orbit dots (visual beat) */}
            <div className="orbit o1" />
            <div className="orbit o2" />

            {/* +score badges (mounted to DOM) */}
            <div className="pluses" aria-hidden>
              {pluses.current.map(p => (
                <span id={`plus-${p.id}`} key={p.id} className="plus">{p.text}</span>
              ))}
            </div>

            {/* instructions chip */}
            <div className="chip">Tap / Space / Enter</div>
          </div>
        </>
      )}

      {phase === "end" && (
        <EndScreen
          title="Breath Rush — Results"
          score={score}
          points={Math.max(1, Math.floor(score / 50))}
          onAgain={() => setPhase("intro")}
          onExit={onExit}
        />
      )}

      <style>{`
        .rush { display:grid; gap:10px; }

        .stage {
          position:relative;
          height:min(54vh,480px);
          border-radius:16px;
          overflow:hidden;
          background:
            radial-gradient(140% 120% at 50% 0%, #131a2c 0%, #0e1626 65%, #0a1220 100%);
          box-shadow:0 18px 40px rgba(0,0,0,.28);
          display:grid; place-items:center;
          user-select:none; touch-action: manipulation;
        }
        .stage.flash { animation: flashBg .12s ease; }
        @keyframes flashBg { from{filter:brightness(1.25)} to{filter:brightness(1)} }

        .halo {
          position:absolute; width:80vmin; height:80vmin; border-radius:50%;
          background: radial-gradient(60% 60% at 50% 50%, rgba(99,102,241,.18), rgba(99,102,241,0) 70%);
          transition: transform .06s linear;
          pointer-events:none;
        }

        .center {
          position:absolute; width:160px; height:160px; border-radius:50%;
          display:grid; place-items:center;
        }
        .ringBase {
          position:absolute; width:135px; height:135px; border-radius:50%;
          border:3px solid rgba(99,102,241,.7);
          box-shadow:0 0 14px rgba(99,102,241,.18) inset;
        }

        .ring {
          position:absolute; width:135px; height:135px; border-radius:50%;
          border:4px solid rgba(59,130,246,.8);
          box-shadow:0 0 16px rgba(59,130,246,.35), inset 0 0 12px rgba(255,255,255,.12);
          transition: transform .06s linear;
          will-change: transform;
        }

        .grade {
          position:absolute; top: calc(50% + 70px); left: 50%; transform: translate(-50%,-50%) scale(.9);
          font-weight:800; color:#fff; background:rgba(0,0,0,.35); padding:4px 10px; border-radius:10px;
          opacity:0; transition: opacity .16s ease, transform .16s ease;
          text-shadow: 0 2px 6px rgba(0,0,0,.4);
          pointer-events:none;
        }
        .grade.show { opacity:1; transform: translate(-50%,-50%) scale(1); }

        /* orbit dots show beat motion */
        .orbit { position:absolute; width:8px; height:8px; border-radius:50%; background:#a5b4fc; opacity:.75; }
        .o1 { animation: orbit 1.2s linear infinite; }
        .o2 { animation: orbit 1.2s linear infinite; animation-delay: .6s; filter:brightness(.85);}
        @keyframes orbit {
          0%   { transform: translate(0, -96px); }
          25%  { transform: translate(96px, 0); }
          50%  { transform: translate(0, 96px); }
          75%  { transform: translate(-96px, 0); }
          100% { transform: translate(0, -96px); }
        }

        .chip {
          position:absolute; bottom:12px; left:50%; transform:translateX(-50%);
          background:rgba(0,0,0,.45); color:#fff; padding:6px 10px; border-radius:10px; font-size:12px;
          box-shadow:0 8px 18px rgba(0,0,0,.25); animation: chip 2.8s ease-in-out infinite;
        }
        @keyframes chip { 0%{transform:translate(-50%,0)} 50%{transform:translate(-50%,-4px)} 100%{transform:translate(-50%,0)} }

        /* +score badges */
        .pluses { position:absolute; inset:0; pointer-events:none; }
        .plus {
          position:absolute; left:50%; top:45%;
          transform:translate(-50%,0); color:#fff; font-weight:800;
          text-shadow: 0 2px 6px rgba(0,0,0,.4);
          animation: fly .8s ease-out forwards;
        }
        @keyframes fly {
          0%{ opacity:0; transform:translate(-50%,0) scale(.9)}
          20%{opacity:1}
          100%{ opacity:0; transform:translate(-50%,-40px) scale(1.05)}
        }
      `}</style>
    </div>
  );
}
