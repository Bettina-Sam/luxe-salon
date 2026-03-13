import { createContext, useContext, useEffect, useMemo, useState } from "react";

const MoodCtx = createContext();
export const useMood = () => useContext(MoodCtx);

const MOODS = {
  calm:   { name: "Calm Spa",      vars: { bg:"#0f172a", surface:"#111827", text:"#e5e7eb", primary:"#38bdf8", accent:"#a78bfa", card:"#0b1220", muted:"#1f2937"} },
  glam:   { name: "Glam Night",    vars: { bg:"#0b0b12", surface:"#141420", text:"#f5f5f7", primary:"#ff4d6d", accent:"#ffd166", card:"#111119", muted:"#232338"} },
  spring: { name: "Fresh Spring",  vars: { bg:"#0e1712", surface:"#132017", text:"#e9ffee", primary:"#34d399", accent:"#7dd3fc", card:"#102017", muted:"#1a2a22"} },
  bridal: { name: "Festive Bridal",vars: { bg:"#130f0f", surface:"#1c1212", text:"#fff7f2", primary:"#ff8fab", accent:"#ffd6a5", card:"#1a1111", muted:"#2a1717"} },
  mono:   { name: "Monochrome",    vars: { bg:"#0f0f0f", surface:"#151515", text:"#ededed", primary:"#9ca3af", accent:"#a3a3a3", card:"#131313", muted:"#222"} },
};

export default function MoodThemeProvider({ children }) {
  const [mood, setMood] = useState(() => localStorage.getItem("luxe_mood") || "calm");

  useEffect(() => {
    localStorage.setItem("luxe_mood", mood);
    const root = document.documentElement;
    root.setAttribute("data-mood", mood);
    const v = MOODS[mood].vars;
    Object.entries(v).forEach(([k, val]) => root.style.setProperty(`--${k}`, val));
  }, [mood]);

  const value = useMemo(() => ({ mood, setMood, MOODS }), [mood]);
  return <MoodCtx.Provider value={value}>{children}</MoodCtx.Provider>;
}
