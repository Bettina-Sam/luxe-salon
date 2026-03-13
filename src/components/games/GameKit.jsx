export function InstructionCard({ title, lines = [], onStart, children }) {
  return (
    <div className="kit-instruct">
      <div className="kit-card">
        <div className="kit-emo">🎮</div>
        <h4>{title}</h4>
        <ul>{lines.map((l,i)=><li key={i}>{l}</li>)}</ul>
        {children}
        <button className="kit-btn" onClick={onStart}>Start</button>
      </div>
      <style>{`
        .kit-instruct { display:grid; place-items:center; min-height:220px; }
        .kit-card { text-align:center; padding:14px; border-radius:14px; border:1px solid rgba(0,0,0,.08);
          background:rgba(255,255,255,.75); max-width:560px; box-shadow:0 12px 36px rgba(0,0,0,.15); }
        @media (prefers-color-scheme: dark){ .kit-card { background:rgba(255,255,255,.06); border-color:rgba(255,255,255,.16); color:#f5f5f7; } }
        .kit-emo { font-size:36px; animation: pop 1.8s ease-in-out infinite; }
        @keyframes pop { 0%{transform:scale(1)} 50%{transform:scale(1.1)} 100%{transform:scale(1)} }
        .kit-card ul { margin:8px 0 12px; padding-left:20px; text-align:left; display:grid; gap:4px; }
        .kit-btn { padding:8px 12px; border-radius:10px; background:#3b82f6; color:#fff; border:1px solid #3b82f6; cursor:pointer; }
      `}</style>
    </div>
  );
}

export function HUD({ time, score, hint, emoji }) {
  return (
    <div className="kit-hud">
      <span className="kit-hud-emo">{emoji||"✨"}</span>
      <span>Time <b>{time}s</b></span>
      <span>Score <b>{score}</b></span>
      {hint && <span className="kit-hud-hint">{hint}</span>}
      <style>{`
        .kit-hud { display:flex; gap:10px; align-items:center; justify-content:space-between; font-size:14px; }
        .kit-hud-emo { animation: float 3s ease-in-out infinite; }
        @keyframes float { 0%{ transform:translateY(0)} 50%{ transform:translateY(-3px)} 100%{ transform:translateY(0)} }
        .kit-hud-hint { opacity:.8; }
      `}</style>
    </div>
  );
}

export function EndScreen({ title="Game Over", score, onAgain, onExit, points=0 }) {
  return (
    <div className="kit-end">
      <div className="kit-card">
        <div className="kit-emo">{score >= 100 ? "🏆" : "🎉"}</div>
        <h4>{title}</h4>
        <p>Your score: <b>{score}</b>{points>0?` • +${points} pts`:""}</p>
        <div className="kit-row">
          <button className="kit-btn" onClick={onAgain}>Play Again</button>
          <button className="kit-btn ghost" onClick={onExit}>Exit</button>
        </div>
      </div>
      <style>{`
        .kit-end { display:grid; place-items:center; padding:10px; }
        .kit-row { display:flex; gap:10px; justify-content:center; }
        .kit-btn { padding:8px 12px; border-radius:10px; background:#3b82f6; color:#fff; border:1px solid #3b82f6; cursor:pointer; }
        .ghost { background:transparent; color:inherit; border-color:currentColor; }
        .kit-card { text-align:center; padding:14px; border-radius:14px; border:1px solid rgba(0,0,0,.08);
          background:rgba(255,255,255,.8); max-width:560px; box-shadow:0 12px 36px rgba(0,0,0,.15); }
        @media (prefers-color-scheme: dark){ .kit-card { background:rgba(255,255,255,.06); border-color:rgba(255,255,255,.16); color:#f5f5f7; } }
        .kit-emo { font-size:42px; animation: pop 1.8s ease-in-out infinite; }
        @keyframes pop { 0%{transform:scale(1)} 50%{transform:scale(1.1)} 100%{transform:scale(1)} }
      `}</style>
    </div>
  );
}
