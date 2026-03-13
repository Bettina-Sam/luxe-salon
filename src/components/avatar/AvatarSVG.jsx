// src/components/avatar/AvatarSVG.jsx
// Standalone avatar renderer (no external deps).
// Supports: hair (6 styles), brows (rounded/straight/arched/S), eyes, lips,
// bindi, earrings, glasses, nose ring, necklace, headband, blush.
// Transparent background by default.

export default function AvatarSVG({
  size = 360,

  // core look
  skin = "#F7D3C1",
  hairColor = "#2E1A47",
  hair = "long",               // "long" | "bob" | "bun" | "pixie" | "curly" | "ponytail"
  eye = "round",               // "round" | "sleepy" | "sparkle"
  lip = "#B64A62",

  // brows
  browStyle = "rounded",       // "rounded" | "straight" | "arched" | "s-shape"
  browThickness = 2,           // 1..6
  browRaise = 0,               // -4..+6
  browColor,                   // undefined => fallback to hairColor

  // accessories
  showBindi = true,
  showEarrings = true,
  showGlasses = false,
  showNoseRing = false,
  showNecklace = false,
  showHeadband = false,

  glassesColor = "#b7c2d6",
  metalColor = "#ffd966",
  headbandColor = "#ff7aa2",

  blush = true,
}) {
  const _browColor = browColor || hairColor;

  /* ---------- HAIR ---------- */
  const Hair = () => {
    if (hair === "bob") {
      return <path d="M20,42 Q50,18 80,42 L80,64 Q50,56 20,64 Z" fill={hairColor} />;
    }
    if (hair === "bun") {
      return (
        <>
          <circle cx="50" cy="28" r="8" fill={hairColor} />
          <path d="M18,44 Q50,22 82,44 Q78,66 22,66 Z" fill={hairColor} />
        </>
      );
    }
    if (hair === "pixie") {
      return (
        <>
          <path d="M22,42 Q50,20 78,42 Q70,50 30,50 Z" fill={hairColor} />
          <path d="M22,42 Q26,48 22,56" stroke={hairColor} strokeWidth="6" strokeLinecap="round"/>
          <path d="M78,42 Q74,48 78,56" stroke={hairColor} strokeWidth="6" strokeLinecap="round"/>
        </>
      );
    }
    if (hair === "curly") {
      return (
        <>
          {[
            [22,44,10],[34,36,9],[46,32,8],[58,34,9],[70,40,10],[78,50,9],
            [26,54,9],[38,58,8],[62,58,8],[74,54,9]
          ].map(([cx,cy,r],i)=>(
            <circle key={i} cx={cx} cy={cy} r={r} fill={hairColor} />
          ))}
          <path d="M18,60 Q50,86 82,60" fill={hairColor}/>
        </>
      );
    }
    if (hair === "ponytail") {
      return (
        <>
          {/* crown */}
          <path d="M16,44 Q50,18 84,44 L84,70 Q50,60 16,70 Z" fill={hairColor} />
          {/* tail to the right */}
          <path d="M74,56 q10,10 0,24 q-10,8 -14,4 q8,-10 4,-22 z" fill={hairColor} />
        </>
      );
    }
    // long (default)
    return <path d="M14,44 Q50,16 86,44 L86,86 Q50,98 14,86 Z" fill={hairColor} />;
  };

  /* ---------- EYES ---------- */
  const Eyes = () => {
    if (eye === "sleepy") {
      return (
        <>
          <path d="M36,56 q6,-4 12,0" stroke="#222" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M52,56 q6,-4 12,0" stroke="#222" strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      );
    }
    const EyeBase = (cx) => (
      <>
        <ellipse cx={cx} cy="56" rx="9" ry="6" fill="#fff" />
        <circle cx={cx} cy="57" r="2.7" fill="#2b2b2b" />
        {eye === "sparkle" && <circle cx={cx - 1} cy="56" r="0.9" fill="#fff" />}
      </>
    );
    return (<>{EyeBase(42)}{EyeBase(58)}</>);
  };

  /* ---------- BROWS ---------- */
  const BrowPaths = () => {
    const y = 49 + browRaise;
    let L, R;
    switch (browStyle) {
      case "straight":
        L = `M33,${y} q9,-1 18,0`;
        R = `M49,${y} q9,-1 18,0`;
        break;
      case "arched":
        L = `M33,${y} q9,-6 18,0`;
        R = `M49,${y} q9,-6 18,0`;
        break;
      case "s-shape":
        L = `M33,${y} c6,-3 9,-1 18,-2`;
        R = `M49,${y} c6,-3 9,-1 18,-2`;
        break;
      default: // rounded
        L = `M33,${y} q9,-3 18,0`;
        R = `M49,${y} q9,-3 18,0`;
    }
    return (
      <>
        <path d={L} stroke={_browColor} strokeWidth={browThickness} fill="none" strokeLinecap="round"/>
        <path d={R} stroke={_browColor} strokeWidth={browThickness} fill="none" strokeLinecap="round"/>
      </>
    );
  };

  return (
    <div style={{
      width: size, aspectRatio: "1 / 1",
      borderRadius: 16, overflow: "hidden",
      boxShadow: "0 8px 30px rgba(0,0,0,.15)",
      background: "transparent"
    }}>
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        {/* hair behind */}
        {Hair()}

        {/* head / face */}
        <ellipse cx="50" cy="58" rx="22" ry="26" fill={skin} />

        {/* headband (optional) */}
        {showHeadband && (
          <path d="M28,44 q22,-10 44,0" stroke={headbandColor} strokeWidth="6" fill="none" strokeLinecap="round" />
        )}

        {/* blush */}
        {blush && (
          <>
            <ellipse cx="36" cy="66" rx="5.2" ry="3.2" fill="#ff7aa2" opacity="0.22" />
            <ellipse cx="64" cy="66" rx="5.2" ry="3.2" fill="#ff7aa2" opacity="0.22" />
          </>
        )}

        {/* brows */}
        {BrowPaths()}

        {/* eyes */}
        {Eyes()}

        {/* bindi */}
        {showBindi && <circle cx="50" cy="48" r="1.4" fill="#c31919" />}

        {/* nose ring */}
        {showNoseRing && (
          <circle cx="47.5" cy="64.5" r="1.2" fill="none" stroke={metalColor} strokeWidth="1.2" />
        )}

        {/* mouth */}
        <path d="M40,72 q10,6 20,0" stroke={lip} strokeWidth="3" fill="none" strokeLinecap="round"/>

        {/* glasses */}
        {showGlasses && (
          <g opacity="0.95" stroke={glassesColor} fill="none" strokeWidth="1.4">
            <rect x="31" y="51" width="18" height="10" rx="3" />
            <rect x="51" y="51" width="18" height="10" rx="3" />
            <rect x="49" y="55" width="2" height="2" fill={glassesColor} />
            <path d="M31,53 q9,-6 18,0" />
            <path d="M69,53 q-9,-6 -18,0" />
          </g>
        )}

        {/* earrings */}
        {showEarrings && (
          <>
            <circle cx="28" cy="72" r="2.2" fill={metalColor}/>
            <circle cx="72" cy="72" r="2.2" fill={metalColor}/>
          </>
        )}

        {/* necklace */}
        {showNecklace && (
          <path d="M32,84 q18,10 36,0" stroke={metalColor} strokeWidth="2.2" fill="none" strokeLinecap="round"/>
        )}
      </svg>
    </div>
  );
}
