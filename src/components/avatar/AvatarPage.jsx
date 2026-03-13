import { useEffect, useRef, useState } from "react";
import AvatarSVG from "./AvatarSVG";
import { useAvatar } from "../../context/AvatarContext";

const SKIN_SWATCH = ["#FDE5D7","#F7D3C1","#EEC1A8","#D8A489","#BB7E5E","#9A5F41"];
const HAIR_SWATCH = ["#2E1A47","#1C1C1C","#3C2A21","#704214","#A55728","#B8815B","#000000"];
const LIP_SWATCH  = ["#B64A62","#FF6B6B","#6B2F5B","#B58A78","#A83256","#C2453A"];
const HAIR_OPTS   = ["long","bob","bun","pixie","curly","ponytail"];
const EYE_OPTS    = ["round","sleepy","sparkle"];
const BROW_OPTS   = ["rounded","straight","arched","s-shape"];
const PRESETS_KEY = "luxe_avatar_presets_v1";
const pill = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  border: "1px solid #bbb",
  borderRadius: 10,
  padding: "4px 8px",
  cursor: "pointer",
};

export default function AvatarPage() {
  const { avatar: savedAvatar, setAvatar } = useAvatar();
  // ----- core
  const [skin, setSkin] = useState(savedAvatar.skin ?? SKIN_SWATCH[1]);
  const [hairColor, setHairColor] = useState(savedAvatar.hairColor ?? HAIR_SWATCH[0]);
  const [hair, setHair] = useState(savedAvatar.hair ?? "long");
  const [eye, setEye] = useState(savedAvatar.eye ?? "round");
  const [lip, setLip] = useState(savedAvatar.lip ?? LIP_SWATCH[0]);
  const [blush, setBlush] = useState(savedAvatar.blush ?? true);

  // ----- brows
  const [browStyle, setBrowStyle] = useState(savedAvatar.browStyle ?? "rounded");
  const [browThickness, setBrowThickness] = useState(savedAvatar.browThickness ?? 2);
  const [browRaise, setBrowRaise] = useState(savedAvatar.browRaise ?? 0);
  const [useHairForBrow, setUseHairForBrow] = useState(
    savedAvatar.browColor === undefined // undefined = "use hair color" fallback in AvatarSVG
  );
  const [browColor, setBrowColor] = useState(savedAvatar.browColor ?? hairColor);

  // ----- accessories
  const [showBindi, setShowBindi] = useState(savedAvatar.showBindi ?? true);
  const [showEarrings, setShowEarrings] = useState(savedAvatar.showEarrings ?? true);
  const [showGlasses, setShowGlasses] = useState(savedAvatar.showGlasses ?? false);
  const [showNoseRing, setShowNoseRing] = useState(savedAvatar.showNoseRing ?? false);
  const [showNecklace, setShowNecklace] = useState(savedAvatar.showNecklace ?? false);
  const [showHeadband, setShowHeadband] = useState(savedAvatar.showHeadband ?? false);

  const [glassesColor, setGlassesColor] = useState(savedAvatar.glassesColor ?? "#b7c2d6");
  const [metalColor, setMetalColor] = useState(savedAvatar.metalColor ?? "#ffd966");
  const [headbandColor, setHeadbandColor] = useState(savedAvatar.headbandColor ?? "#ff7aa2");

  // keep brow color synced when toggled
  useEffect(() => { if (useHairForBrow) setBrowColor(hairColor); }, [useHairForBrow, hairColor]);

  // push to context (so roaming mascot updates live)
  useEffect(() => {
    setAvatar({
      skin, hairColor, hair, eye, lip, blush,
      browStyle, browThickness, browRaise,
      browColor: useHairForBrow ? undefined : browColor,
      showBindi, showEarrings, showGlasses, showNoseRing, showNecklace, showHeadband,
      glassesColor, metalColor, headbandColor,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    skin, hairColor, hair, eye, lip, blush,
    browStyle, browThickness, browRaise, useHairForBrow, browColor,
    showBindi, showEarrings, showGlasses, showNoseRing, showNecklace, showHeadband,
    glassesColor, metalColor, headbandColor
  ]);

  // ---------- Randomize ----------
  const rnd = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const randomize = () => {
    setSkin(rnd(SKIN_SWATCH));
    const hc = rnd(HAIR_SWATCH);
    setHairColor(hc);
    setHair(rnd(HAIR_OPTS));
    setEye(rnd(EYE_OPTS));
    setLip(rnd(LIP_SWATCH));
    setBlush(Math.random() > 0.2);
    setBrowStyle(rnd(BROW_OPTS));
    setBrowThickness(1 + Math.floor(Math.random() * 6));
    setBrowRaise(-2 + Math.floor(Math.random() * 9)); // -2..+6
    if (Math.random() > 0.5) {
      setUseHairForBrow(true);
    } else {
      setUseHairForBrow(false);
      setBrowColor(hc);
    }
    setShowBindi(Math.random() > 0.4);
    setShowEarrings(Math.random() > 0.4);
    setShowGlasses(Math.random() > 0.7);
    setShowNoseRing(Math.random() > 0.7);
    setShowNecklace(Math.random() > 0.5);
    setShowHeadband(Math.random() > 0.5);
    setGlassesColor(rnd(["#b7c2d6","#ffd1a6","#88d1ff","#ffd6e7","#d1ffd6"]));
    setMetalColor(rnd(["#ffd966","#fff1a8","#d4c1a3","#e7e7e7"]));
    setHeadbandColor(rnd(["#ff7aa2","#8fd3fe","#c8a6ff","#ffb36b","#7fffd4"]));
  };

  // ---------- Download PNG / SVG ----------
  const canvasRef = useRef(null);
  const downloadSVG = () => {
    // serialize the inner svg
    const el = canvasRef.current?.querySelector("svg");
    if (!el) return;
    const s = new XMLSerializer().serializeToString(el);
    const blob = new Blob([s], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "luxe-avatar.svg"; a.click();
    URL.revokeObjectURL(url);
  };
  const downloadPNG = (size = 1024) => {
    const el = canvasRef.current?.querySelector("svg");
    if (!el) return;
    const s = new XMLSerializer().serializeToString(el);
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = size; c.height = size;
      const ctx = c.getContext("2d");
      // white background is optional; keep transparent by default
      // ctx.fillStyle = "#ffffff"; ctx.fillRect(0,0,size,size);
      ctx.drawImage(img, 0, 0, size, size);
      const a = document.createElement("a");
      a.href = c.toDataURL("image/png");
      a.download = "luxe-avatar.png";
      a.click();
    };
    const svg64 = "data:image/svg+xml;charset=utf-8;base64," + btoa(unescape(encodeURIComponent(s)));
    img.src = svg64;
  };

  // ---------- Presets (save/load/delete) ----------
  const [presets, setPresets] = useState(() => {
    try { return JSON.parse(localStorage.getItem(PRESETS_KEY)) || []; } catch { return []; }
  });
  const [presetName, setPresetName] = useState("");

  const currentState = () => ({
    skin, hairColor, hair, eye, lip, blush,
    browStyle, browThickness, browRaise,
    browColor: useHairForBrow ? undefined : browColor,
    showBindi, showEarrings, showGlasses, showNoseRing, showNecklace, showHeadband,
    glassesColor, metalColor, headbandColor,
  });

  const loadState = (data) => {
    setSkin(data.skin); setHairColor(data.hairColor); setHair(data.hair);
    setEye(data.eye); setLip(data.lip); setBlush(!!data.blush);
    setBrowStyle(data.browStyle); setBrowThickness(data.browThickness); setBrowRaise(data.browRaise);
    if (data.browColor === undefined) { setUseHairForBrow(true); setBrowColor(hairColor); }
    else { setUseHairForBrow(false); setBrowColor(data.browColor); }
    setShowBindi(!!data.showBindi); setShowEarrings(!!data.showEarrings);
    setShowGlasses(!!data.showGlasses); setShowNoseRing(!!data.showNoseRing);
    setShowNecklace(!!data.showNecklace); setShowHeadband(!!data.showHeadband);
    setGlassesColor(data.glassesColor || "#b7c2d6");
    setMetalColor(data.metalColor || "#ffd966");
    setHeadbandColor(data.headbandColor || "#ff7aa2");
  };

  const savePreset = () => {
    const name = presetName.trim() || `Look ${presets.length + 1}`;
    const next = [...presets, { id: Date.now(), name, data: currentState() }];
    setPresets(next);
    localStorage.setItem(PRESETS_KEY, JSON.stringify(next));
    setPresetName("");
  };

  const applyPreset = (p) => loadState(p.data);
  const deletePreset = (id) => {
    const next = presets.filter(p => p.id !== id);
    setPresets(next);
    localStorage.setItem(PRESETS_KEY, JSON.stringify(next));
  };

  return (
    <div style={{ padding: "96px 24px 24px", maxWidth: 1220, margin: "0 auto" }}>
      <h2 style={{ marginBottom: 12 }}>Avatar — Studio</h2>

      <div style={{ display: "grid", gap: 24, gridTemplateColumns: "minmax(340px, 1fr) 1fr" }}>
        {/* Canvas + actions */}
        <div>
          <div ref={canvasRef} style={{
            width: 380, maxWidth: "100%", aspectRatio: "1 / 1",
            borderRadius: 16, overflow: "hidden", boxShadow: "0 8px 30px rgba(0,0,0,.15)"
          }}>
            <AvatarSVG
              size={380}
              /* core */
              skin={skin} hairColor={hairColor} hair={hair} eye={eye} lip={lip} blush={blush}
              /* brows */
              browStyle={browStyle} browThickness={browThickness} browRaise={browRaise}
              browColor={useHairForBrow ? undefined : browColor}
              /* accessories */
              showBindi={showBindi} showEarrings={showEarrings}
              showGlasses={showGlasses} showNoseRing={showNoseRing}
              showNecklace={showNecklace} showHeadband={showHeadband}
              glassesColor={glassesColor} metalColor={metalColor} headbandColor={headbandColor}
            />
          </div>

          <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="btn btn-dark" onClick={randomize}>Randomize ✨</button>
            <button className="btn btn-outline-primary" onClick={() => downloadPNG(1024)}>Download PNG</button>
            <button className="btn btn-outline-secondary" onClick={downloadSVG}>Download SVG</button>
          </div>

          {/* Presets */}
          <div style={{ marginTop: 14, padding: 12, border: "1px solid rgba(0,0,0,.08)", borderRadius: 12 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Presets</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 8 }}>
              <input
                value={presetName}
                onChange={(e)=>setPresetName(e.target.value)}
                placeholder="Preset name"
                style={{ padding: "6px 10px", borderRadius: 10, border: "1px solid #bbb" }}
              />
              <button className="btn btn-outline-success" onClick={savePreset}>Save</button>
            </div>
            {presets.length === 0 ? (
              <div style={{ color: "#666", fontSize: 13 }}>No presets yet. Save your favorite looks!</div>
            ) : (
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
                {presets.map(p => (
                  <li key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid #eee", borderRadius: 10, padding: "6px 8px" }}>
                    <span>{p.name}</span>
                    <span style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-sm btn-outline-primary" onClick={()=>applyPreset(p)}>Load</button>
                      <button className="btn btn-sm btn-outline-danger" onClick={()=>deletePreset(p.id)}>Delete</button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Controls */}
        <div style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(6px)",
                      border: "1px solid rgba(0,0,0,.06)", borderRadius: 16, padding: 16 }}>
          <Section title="Skin"><Swatches list={SKIN_SWATCH} value={skin} onPick={setSkin} /></Section>

          <Section title="Hair Style">
            <Row>
              {HAIR_OPTS.map(h => <Btn key={h} active={hair===h} onClick={()=>setHair(h)}>{h}</Btn>)}
            </Row>
          </Section>

          <Section title="Hair Color"><Swatches list={HAIR_SWATCH} value={hairColor} onPick={setHairColor} /></Section>

          <Section title="Eyes">
            <Row>{EYE_OPTS.map(e => <Btn key={e} active={eye===e} onClick={()=>setEye(e)}>{e}</Btn>)}</Row>
          </Section>

          <Section title="Lips"><Swatches list={LIP_SWATCH} value={lip} onPick={setLip} /></Section>

          <Section title="Brows">
            <Row>{BROW_OPTS.map(b => <Btn key={b} active={browStyle===b} onClick={()=>setBrowStyle(b)}>{b}</Btn>)}</Row>
            <Grid>
              <label>Thickness</label>
              <input type="range" min={1} max={6} step={1} value={browThickness} onChange={(e)=>setBrowThickness(+e.target.value)} />
              <label>Height</label>
              <input type="range" min={-4} max={6} step={1} value={browRaise} onChange={(e)=>setBrowRaise(+e.target.value)} />
              <label>Color</label>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <label style={pill}>
                  <input type="checkbox" checked={useHairForBrow} onChange={(e)=>setUseHairForBrow(e.target.checked)} />
                  Use hair color
                </label>
                {!useHairForBrow && <input type="color" value={browColor} onChange={(e)=>setBrowColor(e.target.value)} />}
              </div>
            </Grid>
          </Section>

          <Section title="Accessories">
            <Row>
              <Toggle label="Bindi" checked={showBindi} onChange={setShowBindi} />
              <Toggle label="Earrings" checked={showEarrings} onChange={setShowEarrings} />
              <Toggle label="Glasses" checked={showGlasses} onChange={setShowGlasses} />
              <Toggle label="Nose Ring" checked={showNoseRing} onChange={setShowNoseRing} />
              <Toggle label="Necklace" checked={showNecklace} onChange={setShowNecklace} />
              <Toggle label="Headband" checked={showHeadband} onChange={setShowHeadband} />
              <Toggle label="Blush" checked={blush} onChange={setBlush} />
            </Row>
            <Grid style={{ marginTop: 10 }}>
              <label>Glasses</label>
              <input type="color" value={glassesColor} onChange={(e)=>setGlassesColor(e.target.value)} />
              <label>Metal</label>
              <input type="color" value={metalColor} onChange={(e)=>setMetalColor(e.target.value)} />
              <label>Headband</label>
              <input type="color" value={headbandColor} onChange={(e)=>setHeadbandColor(e.target.value)} />
            </Grid>
          </Section>
        </div>
      </div>
    </div>
  );
}

/* ---------- tiny UI helpers ---------- */
function Section({ title, children }) {
  return <div style={{ marginBottom: 14 }}><div style={{ fontWeight: 600, marginBottom: 8 }}>{title}</div>{children}</div>;
}
function Row({ children }) { return <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{children}</div>; }
function Grid({ children, style }) { return <div style={{ display:"grid", gridTemplateColumns:"120px 1fr", gap:8, ...style }}>{children}</div>; }
function Swatches({ list, value, onPick }) {
  return (
    <Row>
      {list.map((c) => (
        <button key={c} onClick={() => onPick(c)} title={c}
          style={{ width: 28, height: 28, borderRadius: "999px",
                   border: value===c ? "2px solid #111" : "1px solid #bbb", background: c }} />
      ))}
    </Row>
  );
}
function Btn({ active, onClick, children }) {
  return (
    <button onClick={onClick}
      style={{ padding: "6px 10px", borderRadius: 10,
               border: active ? "2px solid #111" : "1px solid #bbb",
               background: active ? "#111" : "#fff",
               color: active ? "#fff" : "#111", textTransform:"capitalize" }}>
      {children}
    </button>
  );
}
function Toggle({ label, checked, onChange }) {
  return (
    <label style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"6px 10px",
                    border:"1px solid #bbb", borderRadius:10, cursor:"pointer" }}>
      <input type="checkbox" checked={checked} onChange={(e)=>onChange(e.target.checked)} />
      {label}
    </label>
  );
}
