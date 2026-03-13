import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useEffect, useRef } from 'react'
export default function Magnetic({ radius=80, strength=14, children, className='' }){
  const ref = useRef(null)
  const x = useMotionValue(0), y = useMotionValue(0)
  const sx = useSpring(x,{ stiffness:180, damping:18, mass:.4 })
  const sy = useSpring(y,{ stiffness:180, damping:18, mass:.4 })
  useEffect(()=>{
    const el = ref.current; if (!el) return
    function onMove(e){
      const r = el.getBoundingClientRect(), cx=r.left+r.width/2, cy=r.top+r.height/2
      const dx=e.clientX-cx, dy=e.clientY-cy, d=Math.hypot(dx,dy)
      if (d<radius){ x.set((dx/r.width)*strength); y.set((dy/r.height)*strength) } else { x.set(0); y.set(0) }
    }
    function onLeave(){ x.set(0); y.set(0) }
    window.addEventListener('mousemove', onMove); el.addEventListener('mouseleave', onLeave)
    return ()=>{ window.removeEventListener('mousemove', onMove); el.removeEventListener('mouseleave', onLeave) }
  },[radius,strength,x,y])
  return <motion.div ref={ref} className={`magnetic ${className}`} style={{ x:sx, y:sy }}>{children}</motion.div>
}
