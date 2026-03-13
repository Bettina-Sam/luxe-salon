import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "./MirrorMode.css";

// Wait until the video actually has dimensions (prevents 0×0 canvas captures)
async function ensureVideoReady(videoEl) {
  if (!videoEl) return false;
  if (videoEl.readyState >= 2 && videoEl.videoWidth > 0) return true;
  await new Promise((res) => {
    const onData = () => { videoEl.removeEventListener("loadeddata", onData); res(); };
    videoEl.addEventListener("loadeddata", onData, { once: true });
  });
  return videoEl.videoWidth > 0;
}


/* ---------------------- utils ---------------------- */
const mean = a => a.length ? a.reduce((x,y)=>x+y,0)/a.length : 0;
const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
const isMobileDevice = () =>
  typeof navigator !== "undefined" &&
  /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent || "");

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-2.5-flash";

/* ---------------------- analysis ---------------------- */
function analyzeCanvas(canvas){
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const { width, height } = canvas;
  const s = 2;
  const { data } = ctx.getImageData(0,0,width,height);

  let luma=[], rA=[], gA=[], bA=[];
  for(let y=0;y<height;y+=s){
    for(let x=0;x<width;x+=s){
      const i=(y*width+x)*4;
      const r=data[i], g=data[i+1], b=data[i+2];
      const Y=0.2126*r+0.7152*g+0.0722*b;
      luma.push(Y); rA.push(r); gA.push(g); bA.push(b);
    }
  }
  const lMean=mean(luma);
  const lStd=Math.sqrt(mean(luma.map(v=>(v-lMean)**2)));
  const rM=mean(rA), gM=mean(gA), bM=mean(bA);

  const exposure = lMean<85 ? "tooDark" : lMean>180 ? "tooBright" : "ok";
  const contrast = lStd<25 ? "low" : lStd>60 ? "high" : "ok";
  const cast =
    rM-bM>10 && rM-gM>8 ? "warm" :
    bM-rM>10 && gM-rM>8 ? "cool" :
    gM-rM>12 && gM-bM>8 ? "green" : "neutral";

  const regions={
    forehead:[0.35,0.18,0.30,0.12],
    cheeksL:[0.20,0.40,0.22,0.16],
    cheeksR:[0.58,0.40,0.22,0.16],
    underEye:[0.38,0.35,0.24,0.10],
    center:[0.42,0.28,0.16,0.16],
  };
  const pick=([nx,ny,nw,nh])=>{
    const xs=Math.floor(nx*width), ys=Math.floor(ny*height);
    const w=Math.floor(nw*width), h=Math.floor(nh*height);
    let lum=[], r=[], g=[], b=[];
    for(let yy=ys;yy<ys+h;yy+=s){
      for(let xx=xs;xx<xs+w;xx+=s){
        const ii=(yy*width+xx)*4;
        const R=data[ii], G=data[ii+1], B=data[ii+2];
        const Y=0.2126*R+0.7152*G+0.0722*B;
        lum.push(Y); r.push(R); g.push(G); b.push(B);
      }
    }
    const m=mean(lum), sd=Math.sqrt(mean(lum.map(v=>(v-m)**2)));
    return { m, sd, r:mean(r), g:mean(g), b:mean(b) };
  };
  const rs={}; Object.entries(regions).forEach(([k,box])=>rs[k]=pick(box));

  const flags=[];
  if(exposure==="tooDark") flags.push("tooDark");
  if(exposure==="tooBright") flags.push("tooBright");
  if(contrast==="low") flags.push("lowContrast");
  if(cast==="warm") flags.push("castWarm");
  if(cast==="cool") flags.push("castCool");
  if(cast==="green") flags.push("castGreen");

  const fh=rs.forehead, ckL=rs.cheeksL, ckR=rs.cheeksR, ue=rs.underEye, ctr=rs.center;
  if (fh.m-ctr.m>12 && fh.sd>ctr.sd+4) flags.push("shinyForehead");
  const cheeksAvg=(ckL.m+ckR.m)/2;
  if (ctr.m-cheeksAvg>10 && ctr.sd<12) flags.push("dryCheeks");
  const cheeksRmean=(ckL.r+ckR.r)/2, cheeksGmean=(ckL.g+ckR.g)/2;
  if (cheeksRmean-cheeksGmean>14) flags.push("redness");
  if (ctr.m-ue.m>14) flags.push("underEyeShadow");

  // backlight/off-center
  const edgeStrip=6, centerStrip=Math.floor(width*0.2);
  let L=0,R=0,C=0,cL=0,cR=0,cC=0;
  for(let y=0;y<height;y+=s){
    for(let x=0;x<edgeStrip;x+=s){ L+=luma[(y*width+x)]; cL++; }
    for(let x=width-edgeStrip;x<width;x+=s){ R+=luma[(y*width+x)]; cR++; }
    for(let x=Math.floor((width-centerStrip)/2); x<Math.floor((width+centerStrip)/2); x+=s){ C+=luma[(y*width+x)]; cC++; }
  }
  if(((L/cL+R/cR)/2)-(C/cC)>18) flags.push("backlight");
  if(Math.abs(ckL.m-ckR.m)>18) flags.push("offCenter");

  const tips=[];
  if(flags.includes("tooDark")) tips.push("Turn toward a window or add a soft front light.");
  if(flags.includes("tooBright")) tips.push("Step back slightly or soften direct light.");
  if(flags.includes("lowContrast")) tips.push("Increase distance from the background or add gentle side light.");
  if(flags.includes("castWarm")) tips.push("Move away from warm bulbs or face daylight.");
  if(flags.includes("castCool")||flags.includes("castGreen")) tips.push("Add a warm lamp or face a neutral wall.");
  if(flags.includes("shinyForehead")) tips.push("Blot forehead or use a matte powder.");
  if(flags.includes("dryCheeks")) tips.push("Hydrate cheeks with a light moisturizer.");
  if(flags.includes("underEyeShadow")) tips.push("Raise camera to eye-line and tilt chin slightly.");
  if(flags.includes("backlight")) tips.push("Avoid a bright window behind you; face the light.");
  if(flags.includes("offCenter")) tips.push("Center your face; align eyes to the guide line.");

  const treatments=new Set();
  if(flags.some(f=>["dryCheeks","castCool","castGreen"].includes(f))) treatments.add("Hydrating Facial");
  if(flags.includes("redness")) treatments.add("Calming Facial");
  if(flags.includes("shinyForehead")) treatments.add("Oil-Control Facial");
  if(flags.includes("underEyeShadow")) treatments.add("Under-Eye Revive");
  if(treatments.size===0) treatments.add("Photo-ready Glow Facial");

  return {
    exposure, contrast, cast, flags,
    tips: Array.from(new Set(tips)).slice(0,6),
    treatments: Array.from(treatments)
  };
}
function rgbFromCast(c){
  const map={ neutral:[200,200,200], warm:[210,190,180], cool:[180,190,210], green:[180,210,180] };
  return map[c||"neutral"];
}
function composeBookingNote(result){
  const f=(result?.flags||[]).slice(0,3).join(", ");
  const t=(result?.treatments||[]).slice(0,2).join(" / ");
  const tip=(result?.tips||[])[0]||"Great framing!";
  return `Mirror Mode suggests: ${tip} Flags: ${f||"none"}. Recs: ${t}.`;
}

function AnalysisModal({ open, onClose, result, pngUrl }) {
  if (!open) return null;
  const rgb = result ? {
    r: (result.cast === "warm" ? 210 : result.cast==="neutral" ? 200 : 180),
    g: (result.cast === "green" ? 210 : 190),
    b: (result.cast === "cool" ? 210 : 180),
  } : { r:0,g:0,b:0 };

  const glow = (() => {
    if (!result) return 0;
    let s = 60;
    if (result.exposure === "ok") s += 15; else s -= 6;
    if (result.contrast === "ok") s += 10; else if (result.contrast==="high") s += 5; else s -= 4;
    if (result.cast === "neutral") s += 10; else s -= 3;
    if (result.flags.includes("backlight")) s -= 6;
    if (result.flags.includes("offCenter")) s -= 5;
    return Math.max(0, Math.min(100, Math.round(s)));
  })();

  return (
    <div className="lx-modal-backdrop" role="dialog" aria-modal="true" aria-label="Analysis">
      <div className="lx-modal">
        <header>
          <h3>AI Analysis</h3>
          <button className="btn lx-close" onClick={onClose}>Close</button>
        </header>

        <div className="lx-row">
          {/* left: snapshot + gauges */}
          <div className="lx-col">
            {pngUrl && <img src={pngUrl} alt="Snapshot" style={{width:"100%",borderRadius:12,border:"1px solid var(--line)"}}/>}
            {result && (
              <>
                <div style={{marginTop:10}}>
                  <div className="toolbar" style={{gap:8}}>
                    <span className="chip">Exposure: {result.exposure}</span>
                    <span className="chip">Contrast: {result.contrast}</span>
                    <span className="chip">Cast: {result.cast}</span>
                  </div>
                </div>
                <div style={{marginTop:10}}>
                  <small className="muted">Glow Score</small>
                  <div className="lx-gauge"><b style={{width:`${glow}%`}}/></div>
                </div>
              </>
            )}
          </div>

          {/* right: flags, tips, recs */}
          <div className="lx-col">
            <strong>What we noticed</strong>
            <div style={{marginTop:6}}>
              {(result?.flags?.length ? result.flags : ["Balanced overall"]).map((f,i)=>(
                <span key={i} className="lx-badge">{f.replace(/([A-Z])/g," $1")}</span>
              ))}
            </div>

            <div style={{marginTop:12}}>
              <strong>Smart Tips</strong>
              <ul style={{marginTop:6}}>
                {(result?.tips?.length ? result.tips : ["Face the light and align eyes to the guide."]).map((t,i)=>(
                  <li key={i}>💡 {t}</li>
                ))}
              </ul>
            </div>

            <div style={{marginTop:8}}>
              <strong>Stylist Recommends</strong>
              <div className="toolbar" style={{marginTop:6}}>
                {(result?.treatments||[]).map((t,i)=><span key={i} className="chip">{t}</span>)}
              </div>
            </div>

            <div style={{marginTop:10}}>
              <strong>R/G/B Balance</strong>
              <div style={{display:"flex",gap:8,alignItems:"flex-end",marginTop:6}}>
                <div className="rgbbar rgb-R"><b style={{height:`${(rgb.r/255)*100}%`}}/></div>
                <div className="rgbbar rgb-G"><b style={{height:`${(rgb.g/255)*100}%`}}/></div>
                <div className="rgbbar rgb-B"><b style={{height:`${(rgb.b/255)*100}%`}}/></div>
              </div>
            </div>
          </div>
        </div>

        <div className="toolbar" style={{marginTop:12}}>
          <button className="btn" onClick={onClose}>Great, thanks</button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------- component ---------------------- */
export default function MirrorMode(){
  const videoRef=useRef(null);
  const canvasRef=useRef(null);
  const uploadCanvasRef=useRef(null);
  const cameraRequestIdRef = useRef(0);
  const [search]=useSearchParams();

  // ui state
  const [streamOn,setStreamOn]=useState(false);
  const [mirrored,setMirrored]=useState(()=>JSON.parse(localStorage.getItem("mm_mirrored")??"true"));
  const [paused,setPaused]=useState(false);
  const [brightness,setBrightness]=useState(()=>parseFloat(localStorage.getItem("mm_brightness")??"1"));
  const [countdown,setCountdown]=useState(0);
  const [pngUrl,setPngUrl]=useState("");
  const [result,setResult]=useState(null);
  const [speaking,setSpeaking]=useState(false);
  const [facing,setFacing]=useState("user");
  const [compliment,setCompliment]=useState("");
  const [cameraError, setCameraError] = useState("");
  const [cameraNonce, setCameraNonce] = useState(0);
  const [history,setHistory]=useState(()=>{ try{return JSON.parse(localStorage.getItem("mm_history")||"[]");}catch{return []; } });

  const [showGrid, setShowGrid] = useState(false);   // default off
  const [gridScale, setGridScale] = useState(1.0);

  const reduced = prefersReducedMotion();

  const [showAnalysis, setShowAnalysis] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");
  const [chatMessages, setChatMessages] = useState([{ role:"model", text:"Hi, I'm your AI chat bot. Ask me about your look, confidence, camera framing, or salon prep." }]);

  // persist
  useEffect(()=>localStorage.setItem("mm_mirrored", JSON.stringify(mirrored)),[mirrored]);
  useEffect(()=>localStorage.setItem("mm_brightness", String(brightness)),[brightness]);

  // camera start (lag-friendly)
  useEffect(()=>{
    let active=true, media;
    const requestId = ++cameraRequestIdRef.current;
    (async ()=>{
      try{
        if(!navigator.mediaDevices?.getUserMedia){
          setCameraError("This browser does not support camera access.");
          setStreamOn(false);
          return;
        }

        // Ensure old stream is fully released before requesting again.
        const current = videoRef.current?.srcObject;
        if (current?.getTracks) current.getTracks().forEach((track)=>track.stop());
        if (videoRef.current) videoRef.current.srcObject = null;

        const devices = await navigator.mediaDevices.enumerateDevices();
        const cams = devices.filter((d)=>d.kind === "videoinput");
        if (!cams.length) {
          throw new DOMException("No camera device was detected.", "NotFoundError");
        }

        setCameraError("");
        const preferredFacing = isMobileDevice() ? facing : "user";

        const trials = [
          // Mobile can try exact front/back first.
          ...(isMobileDevice() ? [
            { video:{ facingMode:{ exact:preferredFacing }, width:{ideal:1280}, height:{ideal:720}, frameRate:{ideal:30} }, audio:false },
          ] : []),
          // Desktop defaults to user camera via ideal facing hint.
          { video:{ facingMode:{ ideal:preferredFacing }, width:{ideal:1280}, height:{ideal:720}, frameRate:{ideal:30} }, audio:false },
          // Fallback to any available camera.
          { video:{ width:{ideal:1280}, height:{ideal:720}, frameRate:{ideal:30} }, audio:false },
          { video:true, audio:false },
        ];

        let lastError;
        for (const constraints of trials){
          try{
            media = await navigator.mediaDevices.getUserMedia(constraints);
            break;
          }catch(err){
            lastError = err;
          }
        }

        if (!media) throw lastError || new Error("Could not start camera.");
        if (!active || requestId !== cameraRequestIdRef.current) {
          media.getTracks().forEach((track)=>track.stop());
          return;
        }
        videoRef.current.srcObject=media;
        await videoRef.current.play();
        setStreamOn(true);
        setCameraError("");
      }catch(e){
        console.warn("camera error",e);
        if (!active || requestId !== cameraRequestIdRef.current) return;
        setStreamOn(false);
        const name = e?.name || "CameraError";
        const msg = e?.message || "Could not start camera.";
        setCameraError(
          `${name}: ${msg} ` +
          `Check browser camera permission, close apps using the camera, then tap Retry Camera.`
        );
      }
    })();
    return ()=>{
      active=false;
      if (videoRef.current?.srcObject) videoRef.current.srcObject = null;
      if(media) media.getTracks().forEach(t=>t.stop());
    };
  },[facing, cameraNonce]);

  // keyboard
  useEffect(()=>{
    const onKey=e=>{
      if(/input|textarea|select/i.test(e.target.tagName)) return;
      const k=e.key.toLowerCase();
      if(k==="c") doCapture();
      if(k==="p") setPaused(p=>!p);
      if(k==="m") setMirrored(m=>!m);
      if(k==="s") (speaking? stopAllSpeech() : speakQueue(coachScript(result)));
      if(k==="a") analyzeNow();
      if(k==="g") setShowGrid(g=>!g);
    };
    window.addEventListener("keydown", onKey);
    return ()=>window.removeEventListener("keydown", onKey);
  },[speaking,result]);

  // voice commands
  useEffect(()=>{
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if(!SR) return;
    const rec=new SR(); rec.continuous=true; rec.lang="en-US";
    try{rec.start();}catch{}
    rec.onresult=(e)=>{
      const text=[...e.results].at(-1)[0].transcript.toLowerCase().trim();
      if (text.includes("take picture") || text.includes("capture")) doCapture();
      if (text.includes("pause")) setPaused(true);
      if (text.includes("play") || text.includes("resume")) setPaused(false);
      if (text.includes("mirror on")) setMirrored(true);
      if (text.includes("mirror off") || text.includes("unmirror")) setMirrored(false);
      if (text.includes("brightness up")) setBrightness(b=>Math.min(1.3,b+0.05));
      if (text.includes("brightness down")) setBrightness(b=>Math.max(0.7,b-0.05));
      if (text.includes("speak")) speakQueue(coachScript(result));
      if (text.includes("stop speaking")) stopAllSpeech();
      if (text.includes("analyze")) analyzeNow();
      if (text.includes("motivate me")) motivateMe();
      if (text.includes("hide grid")) setShowGrid(false);
      if (text.includes("show grid")) setShowGrid(true);
      if (text.includes("bigger grid")) setGridScale(g=>Math.min(1.3,g+0.05));
      if (text.includes("smaller grid")) setGridScale(g=>Math.max(0.7,g-0.05));
    };
    return ()=>rec.stop();
  },[result]);

  // capture flow
const doCapture = async () => {
  const v = videoRef.current;
  if (!(await ensureVideoReady(v))) {
    alert("Camera isn’t ready yet. Try again in a second.");
    return;
  }
  setResult(null);
  setCompliment("");
  if (!prefersReducedMotion()) {
    for (let i = 3; i > 0; i--) {
      setCountdown(i);
      await new Promise((r) => setTimeout(r, 650));
    }
    setCountdown(0);
  }
  captureFromVideo();
};

  const captureFromVideo = ()=>{
    const v=videoRef.current, c=canvasRef.current;
    let w=v.videoWidth, h=v.videoHeight; if(!w||!h) return;
    const MAX=900, scale=Math.min(1, MAX/Math.max(w,h));
    w=Math.round(w*scale); h=Math.round(h*scale);
    c.width=w; c.height=h;
    const ctx=c.getContext("2d");
    ctx.save();
    if(mirrored){ ctx.translate(w,0); ctx.scale(-1,1); }
    ctx.filter=`brightness(${brightness})`;
    ctx.drawImage(v,0,0,w,h);
    ctx.restore();
    finalize(c);
  };
  // re-analyze current frame without capture flash
const analyzeNow = async () => {
  const v = videoRef.current, c = canvasRef.current;
  if (!(await ensureVideoReady(v))) return;

  const MAX = 900, scale = Math.min(1, MAX / Math.max(v.videoWidth, v.videoHeight));
  c.width = Math.max(1, Math.round(v.videoWidth * scale));
  c.height = Math.max(1, Math.round(v.videoHeight * scale));

  const ctx = c.getContext("2d");
  ctx.save();
  if (mirrored) { ctx.translate(c.width, 0); ctx.scale(-1, 1); }
  ctx.filter = `brightness(${brightness})`;
  ctx.drawImage(v, 0, 0, c.width, c.height);
  ctx.restore();

  finalize(c);
  setShowAnalysis(true); // open the pop-up if you want
};


const finalize = (canvas) => {
  try {
    if (!canvas?.width || !canvas?.height) return;
    const url = canvas.toDataURL("image/png");
    setPngUrl(url);

    const res = analyzeCanvas(canvas);
    setResult(res);
    setShowAnalysis(true);

    const entry = { ts: Date.now(), glow: getGlowScore(res), png: url };
    setHistory((h) => {
      const next = [...(h || []), entry].slice(-15);
      localStorage.setItem("mm_history", JSON.stringify(next));
      return next;
    });

    if (res.exposure === "ok" && res.contrast !== "low" && res.cast === "neutral" && res.flags.length <= 1) {
      const msgs = ["Lovely smile ✨","That glow is gorgeous 💫","Camera loves you 📸","Frame on point 👌","Salon-ready look 🌟"];
      setCompliment(msgs[Math.floor(Math.random()*msgs.length)]);
      setTimeout(()=>setCompliment(""), 3000);
    }
  } catch (err) {
    console.error("Finalize error", err);
    alert("Something went wrong analyzing that frame. Try again or hit Analyze Now.");
  }
};


  // upload fallback
  const onUpload = (file)=>{
    const img=new Image();
    img.onload=()=>{
      const c=uploadCanvasRef.current;
      const max=1280, sc=Math.min(1, max/Math.max(img.width,img.height));
      c.width=Math.round(img.width*sc); c.height=Math.round(img.height*sc);
      const ctx=c.getContext("2d"); ctx.drawImage(img,0,0,c.width,c.height);
      if(mirrored){ const t=document.createElement("canvas"); t.width=c.width; t.height=c.height; const tc=t.getContext("2d"); tc.translate(t.width,0); tc.scale(-1,1); tc.drawImage(c,0,0); ctx.clearRect(0,0,c.width,c.height); ctx.drawImage(t,0,0); }
      finalize(c);
    };
    img.src=URL.createObjectURL(file);
  };

  /* ---------------------- AI Coach (speak) ---------------------- */
  function coachScript(r){
    if(!r) return ["Take a photo to begin coaching."];
    const intro=[
      `Alright. Exposure is ${r.exposure}.`,
      `Contrast is ${r.contrast}.`,
      r.cast!=="neutral" ? `Color cast looks ${r.cast}.` : `Color looks neutral.`
    ];
    const flags=(r.flags||[]).slice(0,6).map(f=>f.replace(/([A-Z])/g," $1").toLowerCase());
    const seen = flags.length ? [`I noticed: ${flags.join(", ")}.`] : [`Balance looks great.`];
    const tips=(r.tips||[]).map(t=>`Tip: ${t}`);
    const recs=(r.treatments||[]).slice(0,2);
    const stylist = recs.length
      ? [`Stylist note: ${recs.join(" or ")} would suit today’s look.`]
      : [`Stylist note: Classic Glow Facial is a safe pick.`];
    return [...intro, ...seen, ...tips, ...stylist, `You can retake or download your consult when ready.`];
  }
  function speakQueue(lines){
    if(!("speechSynthesis" in window)){ alert("Voice not supported in this browser."); return; }
    window.speechSynthesis.cancel(); let i=0; setSpeaking(true);
    const speakNext=()=>{
      if(i>=lines.length){ setSpeaking(false); return; }
      const u=new SpeechSynthesisUtterance(lines[i++]); u.rate=1.03; u.pitch=1.02;
      // try to prefer a female-ish voice if present
      const voices = window.speechSynthesis.getVoices();
      const pick = voices.find(v=>/female|samantha|victoria|google uk english female/i.test(v.name));
      if (pick) u.voice = pick;
      u.onend=()=>setTimeout(speakNext,220);
      window.speechSynthesis.speak(u);
    };
    speakNext();
  }
  function stopAllSpeech(){ window.speechSynthesis?.cancel(); setSpeaking(false); }
function motivateMe(){
  if (!("speechSynthesis" in window)) return;

  // Broad, real motivation (not skincare) – grouped & rotated smartly
  const sets = [
    [
      "Take a deep breath. Shoulders down. You’re safe and capable.",
      "You don’t need perfect—just one honest try.",
      "Small steps compound. Today’s effort counts more than you think."
    ],
    [
      "Confidence is a muscle. You’re training it right now.",
      "Look at you showing up. That’s the hardest part.",
      "Progress beats perfection, every single time."
    ],
    [
      "Your voice matters. Your presence matters. Keep going.",
      "You’ve done harder things before—you can do this too.",
      "Aim for better, not best. Better is powerful."
    ],
    [
      "Breathe in for four, hold for four, out for six. Calm follows courage.",
      "Set one tiny goal for the next minute. Then do it.",
      "Future you is already proud of this moment."
    ],
    [
      "When doubt knocks, answer with action.",
      "You are allowed to take up space and shine.",
      "Let’s choose momentum over hesitation."
    ]
  ];

  // Avoid repeating the last set (persist across page refresh)
  const key="mm_last_motivation_idx";
  let last = parseInt(localStorage.getItem(key) || "-1", 10);
  let idx = Math.floor(Math.random() * sets.length);
  if (idx === last) idx = (idx + 1) % sets.length;
  localStorage.setItem(key, String(idx));
  const lines = sets[idx];

  // prefer a warm/female voice if available
  const voices = window.speechSynthesis.getVoices();
  const pick = voices.find(v=>/female|samantha|victoria|google uk english female/i.test(v.name)) || voices[0];

  window.speechSynthesis.cancel();
  setSpeaking(true);

  const speakNext = (i=0) => {
    if (i >= lines.length) { setSpeaking(false); return; }
    const u = new SpeechSynthesisUtterance(lines[i]);
    if (pick) u.voice = pick;
    u.rate = 1.02; u.pitch = 1.06;
    u.onend = () => setTimeout(() => speakNext(i+1), 250);
    window.speechSynthesis.speak(u);
  };
  speakNext();
}


async function askMirrorBot() {
  const prompt = chatInput.trim();
  if (!prompt || chatLoading) return;
  if (!GEMINI_API_KEY) {
    setChatError("Missing VITE_GEMINI_API_KEY. Add it to your .env file and restart the dev server.");
    return;
  }

  const context = result
    ? `Latest mirror analysis: exposure ${result.exposure}, contrast ${result.contrast}, cast ${result.cast}, flags ${(result.flags || []).join(", ") || "none"}, tips ${(result.tips || []).join(" | ") || "none"}, treatments ${(result.treatments || []).join(" | ") || "none"}.`
    : "No mirror analysis yet. Give helpful general beauty, confidence, and prep advice until the user captures a frame.";

  const nextUser = { role: "user", text: prompt };
  setChatMessages((items) => [...items, nextUser]);
  setChatInput("");
  setChatError("");
  setChatLoading(true);

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [{
            text: `You are Luxe Salon's AI beauty assistant inside Mirror Mode. Keep replies concise, warm, and practical. Focus on salon prep, confidence, mirror guidance, styling, and the current analysis context. ${context}\n\nUser question: ${prompt}`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 220
        }
      })
    });

    const payload = await response.json();
    const text = payload?.candidates?.[0]?.content?.parts?.map((part) => part.text).join(" ")?.trim();

    if (!response.ok || !text) {
      throw new Error(payload?.error?.message || "The AI chat bot could not answer right now.");
    }

    setChatMessages((items) => [...items, { role: "model", text }]);
  } catch (error) {
    setChatError(error.message || "The AI chat bot could not answer right now.");
  } finally {
    setChatLoading(false);
  }
}
  // booking link
  const bookingUrl=useMemo(()=>{
    const base="/booking";
    const rec=result?.treatments?.[0] || "Photo-ready Glow Facial";
    const note=composeBookingNote(result || {flags:[],treatments:[rec],tips:["Great framing!"]});
    const params=new URLSearchParams({ service:rec, note });
    const offer=search.get("offer"); if(offer) params.set("offer", offer);
    return `${base}?${params.toString()}`;
  },[result,search]);

  // resets
  const resetDiary=()=>{ localStorage.removeItem("mm_history"); setHistory([]); };
  const resetPrefs=()=>{ localStorage.removeItem("mm_mirrored"); localStorage.removeItem("mm_brightness"); setMirrored(true); setBrightness(1); };

  const rgb = rgbFromCast(result?.cast);
  const subtitle = coachScript(result).slice(0,2).join(" ");

  return (
      <div className="mirror">       {/* <= added */}
    <div className="luxe-bg">
      <section className="luxe-page">
        <div className="luxe-grid" aria-label="Mirror Mode">

          {/* LEFT: camera */}
          <div className="card" style={{position:"relative"}}>
            <h1 style={{marginTop:0}}>Mirror Mode — Studio View</h1>

            {!streamOn && (
              <div className="card" style={{marginBottom:10}}>
                <p className="muted">Camera blocked or unavailable. Analyze a photo instead:</p>
                {cameraError && <p className="muted" style={{marginTop:6}}>{cameraError}</p>}
                <button className="btn" style={{marginBottom:8}} onClick={()=>setCameraNonce(v=>v+1)}>Retry Camera</button>
                <input type="file" accept="image/*" onChange={e=>e.target.files?.[0] && onUpload(e.target.files[0])}/>
              </div>
            )}

            <div className="luxe-stage">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                aria-label="Live camera"
                className="luxe-video"
                style={{
                  filter:`brightness(${brightness})`,
                  transform: mirrored ? "scaleX(-1)" : "none",
                  display: paused ? "none" : "block"
                }}
              />

              {/* vignette */}
              <div className="luxe-overlay luxe-vignette" />

              {/* optional grid/oval */}
              {showGrid && (
                <svg className="luxe-overlay" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                  <line x1="33.33" y1="0" x2="33.33" y2="100" className="grid-line" />
                  <line x1="66.66" y1="0" x2="66.66" y2="100" className="grid-line" />
                  <line x1="0" y1="33.33" x2="100" y2="33.33" className="grid-line" />
                  <line x1="0" y1="66.66" x2="100" y2="66.66" className="grid-line" />
                  <ellipse cx="50" cy="46" rx={19*gridScale} ry={25*gridScale} className="luxe-oval" />
                  <line x1={50-14*gridScale} y1="46" x2={50+14*gridScale} y2="46" className="luxe-oval" />
                </svg>
              )}

              {/* paused */}
              {paused && (
                <div aria-live="polite" className="luxe-overlay" style={{display:"grid",placeItems:"center",color:"#fff"}}>
                  <div className="chip" style={{backdropFilter:"blur(6px)"}}>Paused</div>
                </div>
              )}

              {/* countdown */}
              {!!countdown && (
                <div aria-live="assertive" className="luxe-overlay" style={{display:"grid",placeItems:"center",color:"#fff",fontSize:"3rem",fontWeight:700}}>
                  {countdown}
                </div>
              )}

              {/* floating background tips (subtle) */}
              <div className="float-tips" aria-hidden="true">
                {["Face the light","Relax shoulders","Eyes to the guide","Breathe","Soft smile"].map((t,i)=>(
                  <span key={i} className="tip"
                        style={{"--x":`${15 + i*20}%`,"--dur":`${10+i*2}s`,"--delay":`${i*1.2}s`}}>
                    {t}
                  </span>
                ))}
              </div>

              {/* dock */}
              <div className="luxe-dock" role="group" aria-label="Controls">
                <button className="btn" title="Capture (C)" onClick={doCapture}>Capture</button>
                <button className="btn" title="Play/Pause (P)" onClick={()=>setPaused(p=>!p)}>{paused?"Play":"Pause"}</button>
                <button className="btn" title="Mirror (M)" onClick={()=>setMirrored(m=>!m)}>{mirrored?"Unmirror":"Mirror"}</button>
                <label className="chip" htmlFor="br">Brightness</label>
                <input id="br" type="range" min="0.7" max="1.3" step="0.02"
                       value={brightness} onChange={e=>setBrightness(parseFloat(e.target.value))}/>
              </div>

              {/* compliment bubble */}
              {compliment && (
                <div className="luxe-overlay" style={{pointerEvents:"none"}}>
                  <div style={{position:"absolute",right:12,top:12}}>
                    <div className="chip" style={{background:"rgba(255,255,255,.16)"}}>{compliment}</div>
                  </div>
                </div>
              )}
            </div>

            {/* hidden canvases */}
            <canvas ref={canvasRef} className="visually-hidden" aria-hidden="true"/>
            <canvas ref={uploadCanvasRef} className="visually-hidden" aria-hidden="true"/>

            {/* secondary row */}
            <div className="toolbar" style={{marginTop:10}}>
              <button className="btn" onClick={()=>setFacing(f=>f==="user"?"environment":"user")}>{facing==="user"?"Front":"Back"}</button>
              <button className="btn" onClick={analyzeNow}>Analyze Now</button>
              <button className="btn" disabled={!pngUrl} onClick={()=>{
                const a=document.createElement("a"); a.href=pngUrl; a.download="luxe-mirror.png"; a.click();
              }}>Download PNG</button>
              <button className="btn" disabled={!result} onClick={()=>{
                const r=result;
                const lines=[
                  "Luxe Salon — Mirror Consult",
                  new Date().toLocaleString(),"",
                  `Exposure: ${r?.exposure} | Contrast: ${r?.contrast} | Cast: ${r?.cast}`,
                  `Flags: ${r?.flags?.join(", ") || "none"}`,"",
                  "Top tips:", ...(r?.tips||[]).map(t=>`- ${t}`),"",
                  "Recommended treatments:", ...(r?.treatments||[]).map(t=>`- ${t}`)
                ].join("\n");
                const blob=new Blob([lines],{type:"text/plain"});
                const url=URL.createObjectURL(blob);
                const a=document.createElement("a"); a.href=url; a.download="luxe-consult.txt"; a.click(); URL.revokeObjectURL(url);
              }}>Download TXT</button>
              <a className="btn" href={bookingUrl} style={{marginLeft:"auto"}}>Book Recommended</a>
            </div>

            {/* grid controls */}
            <div className="toolbar" style={{marginTop:8, gap:10}}>
              <label className="chip">
                <input type="checkbox" checked={showGrid} onChange={e=>setShowGrid(e.target.checked)} /> Show grid
              </label>
              {showGrid && (
                <>
                  <span className="chip">Guide size</span>
                  <input type="range" min="0.7" max="1.3" step="0.02" value={gridScale}
                         onChange={e=>setGridScale(parseFloat(e.target.value))}/>
                </>
              )}
            </div>
          </div>

          {/* RIGHT: results */}
          <div className="card">
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <h2 style={{margin:"0 8px 0 0"}}>Results</h2>
              <button className="btn" onClick={()=>setShowAnalysis(true)}>Open Analysis</button>

              {history.length>0 && <button className="btn" onClick={resetDiary}>Reset Diary</button>}
            </div>

            {/* history strip */}
            <div className="thumb-strip" style={{margin:"8px 0 10px 0"}}>
              {history.slice(-5).reverse().map((h,i)=>(
                <img key={i} src={h.png} alt={`Session ${i}`} />
              ))}
            </div>

            {/* metrics */}
            <div className="card" style={{marginBottom:10}}>
              <div className="toolbar" style={{gap:8, flexWrap:"wrap"}}>
                <span className="chip">Exposure: {result?.exposure||"—"}</span>
                <span className="chip">Contrast: {result?.contrast||"—"}</span>
                <span className="chip">Cast: {result?.cast||"—"}</span>
              </div>
              {result && (
                <div style={{display:"flex", gap:8, alignItems:"flex-end", marginTop:8}}>
                  {(() => {
                    const [r,g,b] = rgbFromCast(result.cast);
                    return (
                      <>
                        <div className="rgbbar rgb-R"><b style={{height:`${(r/255)*100}%`}}/></div>
                        <div className="rgbbar rgb-G"><b style={{height:`${(g/255)*100}%`}}/></div>
                        <div className="rgbbar rgb-B"><b style={{height:`${(b/255)*100}%`}}/></div>
                        <span className="muted" style={{marginLeft:8}}>R/G/B balance</span>
                      </>
                    );
                  })()}
                </div>
              )}
              <p className="subtitle" aria-live="polite">
                {result ? coachScript(result).slice(0,2).join(" ") : "Take a snapshot to see coaching."}
              </p>
            </div>

            {/* tips */}
            <div className="card" style={{marginBottom:10}}>
              <strong>Smart Tips</strong>
              <ul>
                {(result?.tips?.length? result.tips : ["Take a snapshot to see tailored tips."]).map((t,i)=>(
                  <li key={i}>💡 {t}</li>
                ))}
              </ul>
            </div>

            {/* AI chat bot */}
            <div className="card" style={{marginBottom:10}}>
              <div className="mm-chat-head">
                <strong>AI Chat Bot</strong>
                <span className="chip">Gemini 2.5 Flash</span>
              </div>
              <div className="mm-chat-log" aria-live="polite">
                {chatMessages.map((message, index) => (
                  <div key={index} className={`mm-chat-bubble ${message.role === "user" ? "is-user" : "is-bot"}`}>
                    {message.text}
                  </div>
                ))}
                {chatLoading && <div className="mm-chat-bubble is-bot">Thinking...</div>}
              </div>
              <div className="mm-chat-form">
                <textarea
                  className="mm-chat-input"
                  rows="3"
                  value={chatInput}
                  onChange={(e)=>setChatInput(e.target.value)}
                  placeholder="Ask about your look, your confidence, or what to do next."
                />
                <button className="btn" onClick={askMirrorBot} disabled={chatLoading || !chatInput.trim()}>
                  Send
                </button>
              </div>
              {chatError && <div className="muted" style={{marginTop:8}}>{chatError}</div>}
            </div>

            {/* actions */}
            <div className="card">
              <div className="toolbar" style={{gap:8, flexWrap:"wrap"}}>
                {!speaking
                  ? <button className="btn" onClick={()=>speakQueue(coachScript(result))}>Speak</button>
                  : <button className="btn" onClick={stopAllSpeech}>Stop</button>
                }
                <button className="btn" onClick={motivateMe}>Motivate Me</button>
                <button className="btn" onClick={resetPrefs}>Reset Preferences</button>
              </div>
              {result && (
                <div style={{marginTop:10}}>
                  <span className="muted">Suggested in-salon: </span>
                  {(result.treatments||[]).map((t,i)=>(<span key={i} className="chip" style={{marginRight:6}}>{t}</span>))}
                </div>
              )}
            </div>
          </div>
        </div>
        <AnalysisModal
  open={showAnalysis}
  onClose={()=>setShowAnalysis(false)}
  result={result}
  pngUrl={pngUrl}
/>

      </section>
    </div>
    </div>
  );
}

/* --- helpers used above --- */
function getGlowScore(r){
  if(!r) return 0;
  let s=60;
  if(r.exposure==="ok") s+=15; else if(["tooDark","tooBright"].includes(r.exposure)) s-=8;
  if(r.contrast==="ok") s+=10; else if(r.contrast==="high") s+=5; else s-=6;
  if(r.cast==="neutral") s+=10; else s-=4;
  if(r.flags.includes("backlight")) s-=6;
  if(r.flags.includes("offCenter")) s-=5;
  return Math.max(0,Math.min(100,Math.round(s)));
}





