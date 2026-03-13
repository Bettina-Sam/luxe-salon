import { useEffect, useRef } from 'react'
export default function CursorGlow(){
  const ref = useRef(null)
  useEffect(()=>{
    const el = ref.current; if (!el) return
    function onMove(e){ el.style.setProperty('--mx', e.clientX+'px'); el.style.setProperty('--my', e.clientY+'px') }
    window.addEventListener('mousemove', onMove); return ()=> window.removeEventListener('mousemove', onMove)
  },[])
  return <div ref={ref} className="cursor-glow" aria-hidden />
}
