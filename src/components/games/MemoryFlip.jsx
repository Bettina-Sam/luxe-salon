import { useEffect, useMemo, useRef, useState } from "react";
import { InstructionCard, HUD, EndScreen } from "./GameKit";

/** Memory Flip — no strikes, two-card logic, time bonus per match */
export default function MemoryFlip({ onExit, onPoints }) {
  const [phase, setPhase] = useState("intro"); // intro | play | end
  const [time, setTime]   = useState(75);      // round time
  const [score, setScore] = useState(0);
  const [note, setNote]   = useState("Find all pairs!");
  const [ptsAwarded, setPtsAwarded] = useState(0);

  const wrapRef = useRef(null);
  const gridRef = useRef({ cols: 4, rows: 4 });

  const EMOJIS = useMemo(
    () => ["💄","💅","💇‍♀️","💆‍♀️","🧴","🧖‍♀️","💍","💎","🌸","✨","🧼","🪞","🎀","👑","🧴","🧴"],
    []
  );

  const [cards, setCards] = useState([]);        // {id, face, open, solved, wobble, glow}
  const [openIdx, setOpenIdx] = useState([]);    // indices currently opened (max 2)
  const [combo, setCombo] = useState(0);
  const [inputLocked, setInputLocked] = useState(false);

  // responsive grid
  useEffect(() => {
    const apply = () => {
      const w = wrapRef.current?.clientWidth || 600;
      gridRef.current = w >= 700 ? { cols: 5, rows: 4 } : { cols: 4, rows: 4 };
      if (phase === "play") newRound();
    };
    apply();
    const ro = new ResizeObserver(apply);
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const start = () => {
    setTime(75); setScore(0); setNote("Find all pairs!");
    setCombo(0); setInputLocked(false);
    newRound();
    setPhase("play");
  };

  const newRound = () => {
    const { cols, rows } = gridRef.current;
    const need = Math.floor((cols * rows) / 2);
    const pool = shuffle([...EMOJIS]);
    const faces = shuffle([...pool.slice(0, need), ...pool.slice(0, need)]);
    const deck = faces.map((f, i) => ({
      id: i, face: f, open: false, solved: false, wobble: false, glow: false,
    }));
    setCards(deck);
    setOpenIdx([]);
  };

  // timer
  useEffect(() => {
    if (phase !== "play") return;
    const iv = setInterval(() => setTime(t => Math.max(0, t - 1)), 1000);
    return () => clearInterval(iv);
  }, [phase]);

  useEffect(() => { if (phase === "play" && time === 0) end(); }, [time, phase]);

  // keyboard
  const [focusIdx, setFocusIdx] = useState(0);
  useEffect(() => {
    if (phase !== "play") return;
    const onKey = (e) => {
      const { cols, rows } = gridRef.current;
      const total = cols * rows;
      const k = e.key.toLowerCase();
      if (["arrowright","d"].includes(k)) setFocusIdx(i => (i + 1) % total);
      if (["arrowleft","a"].includes(k))  setFocusIdx(i => (i - 1 + total) % total);
      if (["arrowdown","s"].includes(k)) setFocusIdx(i => (i + cols) % total);
      if (["arrowup","w"].includes(k))   setFocusIdx(i => (i - cols + total) % total);
      if (k === "enter" || k === " ") flip(focusIdx);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, focusIdx]);

  // flip logic (strict two-at-a-time)
  const flip = (idx) => {
    if (inputLocked) return;
    setCards(prev => {
      const c = prev[idx];
      if (!c || c.open || c.solved) return prev;

      const next = prev.map(x => ({ ...x }));
      next[idx].open = true;
      const openNow = [...openIdx, idx];
      setOpenIdx(openNow);

      if (openNow.length === 2) {
        setInputLocked(true); // block until pair resolved
        const [a, b] = openNow;
        const ca = next[a], cb = next[b];

        if (ca.face === cb.face) {
          // MATCH — keep open, mark solved, add time + score
          setTimeout(() => {
            setCards(cur => {
              const copy = cur.map(x => ({ ...x }));
              copy[a].solved = copy[b].solved = true;
              copy[a].glow = copy[b].glow = true;
              setTimeout(() => setCards(c2 => c2.map(x => ({ ...x, glow:false }))), 450);
              return copy;
            });
          }, 160);

          setOpenIdx([]);
          setCombo(c => Math.min(50, c + 1));
          const add = 20 + Math.floor(combo * 2.5);
          setScore(s => s + add);
          setTime(t => Math.min(180, t + 5));    // ⏱️ +5s per match
          setNote(`Match! +${add} • +5s • streak ×${(1 + combo*0.1).toFixed(1)}`);

          // clear check
          const willClear = next.every((x, i) => i === a || i === b || x.solved);
          setTimeout(() => {
            setInputLocked(false);
            if (willClear) end(true);
          }, 200);
        } else {
          // MISMATCH — keep visible briefly then flip back
          triggerWobble(a); triggerWobble(b);
          setTimeout(() => {
            setCards(cur => {
              const copy = cur.map(x => ({ ...x }));
              copy[a].open = false; copy[b].open = false;
              return copy;
            });
            setOpenIdx([]);
            setCombo(0);
            setNote("Miss—try again!");
            setInputLocked(false);
          }, 650);
        }
      }
      return next;
    });
  };

  const triggerWobble = (i) => {
    setCards(cur => {
      const copy = cur.map(x => ({ ...x }));
      copy[i].wobble = true;
      setTimeout(() => setCards(c2 => c2.map((x, idx) => idx===i ? { ...x, wobble:false } : x)), 320);
      return copy;
    });
  };

  const end = (cleared=false) => {
    const timeBonus = cleared ? time * 2 : 0;
    const final = score + timeBonus;
    const pts = Math.max(1, Math.floor(final / 30));
    setScore(final);
    setPtsAwarded(pts);
    onPoints?.(pts);
    setPhase("end");
  };

  // size helpers
  const { cols, rows } = gridRef.current;
  const total = cols * rows;
  const cellSize = useCellSize(cols, rows);

  return (
    <div className="mem">
      {phase === "intro" && (
        <InstructionCard
          title="Memory Flip"
          lines={[
            "Flip two cards to find a pair.",
            "No strikes—mismatches stay open briefly, then flip back.",
            "Every match adds +5s to the timer. Clear the board for a bonus!",
          ]}
          onStart={start}
        />
      )}

      {phase === "play" && (
        <>
          <HUD time={time} score={score} hint={note} emoji="🧠🎴" />
          <div ref={wrapRef} className="wrap">
            <div
              className="grid"
              style={{
                gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
                gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
                gap: Math.max(8, Math.floor(cellSize * 0.08)),
              }}
            >
              {Array.from({ length: total }).map((_, i) => {
                const c = cards[i];
                return (
                  <button
                    key={i}
                    className={`card ${c?.open ? "open" : ""} ${c?.solved ? "solved" : ""} ${c?.wobble ? "wobble" : ""} ${focusIdx===i?"focus":""}`}
                    onClick={() => flip(i)}
                    aria-label={`card ${i+1}`}
                    style={{ width: cellSize, height: cellSize }}
                  >
                    <span className="front">?</span>
                    <span className="back">{c?.face}</span>
                    {c?.glow && <span className="ring" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {phase === "end" && (
        <EndScreen
          title="Memory Flip — Results"
          score={score}
          points={ptsAwarded}
          onAgain={() => setPhase("intro")}
          onExit={onExit}
        />
      )}

      <style>{`
        .mem { display:grid; gap:10px; }
        .wrap { display:grid; place-items:center; }
        .grid {
          display:grid; padding:12px;
          background: radial-gradient(120% 120% at 50% 0%, #111827 0%, #0b1220 60%, #08101b 100%);
          border-radius:16px; box-shadow:0 18px 40px rgba(0,0,0,.28);
          max-width: 980px; width: 92vw;
        }

        .card {
          position:relative; border:none; cursor:pointer; border-radius:12px; outline:none;
          transform-style: preserve-3d;
          transition: transform .35s cubic-bezier(.2,.8,.2,1), box-shadow .2s ease;
          background: linear-gradient(180deg, rgba(255,255,255,.05), rgba(255,255,255,.02));
          box-shadow: inset 0 0 0 2px rgba(255,255,255,.08), 0 10px 20px rgba(0,0,0,.25);
        }
        .card:hover { transform: translateY(-2px) scale(1.01); }
        .card.open, .card.solved { transform: rotateY(180deg) scale(1.02); }
        .card.wobble { animation: wob .32s ease; }
        @keyframes wob { 0%{transform:translateX(0)} 25%{transform:translateX(-4px)} 50%{transform:translateX(4px)} 100%{transform:translateX(0)} }

        .card .front, .card .back {
          position:absolute; inset:0; display:grid; place-items:center;
          backface-visibility:hidden; border-radius:12px; font-weight:800;
          font-size: clamp(18px, 6.2vw, 38px);
        }
        .card .front { color: rgba(255,255,255,.85); text-shadow: 0 2px 6px rgba(0,0,0,.45); }
        .card .back  { transform: rotateY(180deg); background: linear-gradient(180deg, #2c1f43, #2b2550); color:#fff; }

        .card.solved {
          box-shadow:
            inset 0 0 0 2px rgba(255,255,255,.14),
            0 10px 22px rgba(99,102,241,.25);
        }
        .card .ring {
          position:absolute; inset:-6px; border-radius:16px; pointer-events:none;
          box-shadow: 0 0 0 0 rgba(99,102,241,.65), 0 0 26px 12px rgba(99,102,241,.35);
          animation: pop .45s ease-out;
        }
        @keyframes pop {
          0%{ box-shadow: 0 0 0 0 rgba(99,102,241,.65), 0 0 26px 12px rgba(99,102,241,.35) }
          100%{ box-shadow: 0 0 0 14px rgba(0,0,0,0), 0 0 0 0 rgba(0,0,0,0) }
        }

        .card.focus { outline:2px solid rgba(255,255,255,.25); outline-offset:2px; }
      `}</style>
    </div>
  );
}

/* ---------- helpers ---------- */
function useCellSize(cols, rows){
  const [px, setPx] = useState(120);
  useEffect(() => {
    const calc = () => {
      const vw = Math.max(320, window.innerWidth);
      const vh = Math.max(480, window.innerHeight);
      const maxW = Math.min(980, vw * 0.92);
      const maxH = vh * 0.64;
      const cellX = (maxW - 12*2) / cols;
      const cellY = (maxH - 12*2) / rows;
      setPx(Math.floor(Math.max(68, Math.min(cellX, cellY))));
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, [cols, rows]);
  return px;
}
function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]];} return a; }
