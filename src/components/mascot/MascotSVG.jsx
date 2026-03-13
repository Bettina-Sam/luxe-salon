// src/components/mascot/MascotSVG.jsx
import AvatarSVG from "../avatar/AvatarSVG";

export default function MascotSVG({ avatar, size = 96 }) {
  // container height a bit taller to include legs/shoes
  const H = size + 24;

  return (
    <div style={{ position: "relative", width: size, height: H }}>
      {/* HEAD (your avatar) */}
      <div
        style={{
          position: "absolute",
          top: -2,                 // tiny overlap with torso
          left: "50%",
          transform: "translateX(-50%) scale(0.72)",
          width: 100,
          height: 100,
          pointerEvents: "none",   // so clicks go to mascot container
          boxShadow: "none",
        }}
      >
        <AvatarSVG
          size={100}
          {...avatar}
        />
      </div>

      {/* BODY (SVG so we can animate limbs) */}
      <svg
        viewBox="0 0 100 140"
        width={size}
        height={H}
        style={{
          position: "absolute",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        {/* torso */}
        <rect x="38" y="88" width="24" height="20" rx="6" fill={avatar.hairColor || "#2E1A47"} opacity="0.92" />
        <path d="M38,88 q12,8 24,0" fill="#ffffff" opacity="0.18" />

        {/* arms */}
        <g id="armL">
          <path d="M38,94 q-8,6 -8,14" stroke={avatar.skin || "#F7D3C1"} strokeWidth="6" fill="none" strokeLinecap="round" />
        </g>
        <g id="armR">
          <path d="M62,94 q8,6 8,14" stroke={avatar.skin || "#F7D3C1"} strokeWidth="6" fill="none" strokeLinecap="round" />
        </g>

        {/* legs */}
        <g id="legL">
          <path d="M45,108 v22" stroke={avatar.hairColor || "#2E1A47"} strokeWidth="7" strokeLinecap="round" />
          <circle cx="45" cy="131" r="4" fill="#2b2b2b" />
        </g>
        <g id="legR">
          <path d="M55,108 v22" stroke={avatar.hairColor || "#2E1A47"} strokeWidth="7" strokeLinecap="round" />
          <circle cx="55" cy="131" r="4" fill="#2b2b2b" />
        </g>
      </svg>
    </div>
  );
}
