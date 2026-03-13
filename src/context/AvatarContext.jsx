import { createContext, useContext, useEffect, useState } from "react";

const LS_KEY = "luxe_avatar_state_v1";
const DEFAULT = {
  skin:"#F7D3C1", hairColor:"#2E1A47", hair:"long",
  eye:"round", lip:"#B64A62", blush:true,
  // brows
  browStyle:"rounded", browThickness:2, browRaise:0, browColor: undefined,
  // accessories
  showBindi:true, showEarrings:true, showGlasses:false, showNoseRing:false, showNecklace:false, showHeadband:false,
  glassesColor:"#b7c2d6", metalColor:"#ffd966", headbandColor:"#ff7aa2",
};

const Ctx = createContext({ avatar: DEFAULT, setAvatar: () => {} });
export const useAvatar = () => useContext(Ctx);

export function AvatarProvider({ children }) {
  const [avatar, setAvatar] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LS_KEY)) || DEFAULT; } catch { return DEFAULT; }
  });

  useEffect(() => { localStorage.setItem(LS_KEY, JSON.stringify(avatar)); }, [avatar]);

  return <Ctx.Provider value={{ avatar, setAvatar }}>{children}</Ctx.Provider>;
}
