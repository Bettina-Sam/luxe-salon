import { useEffect, useRef } from 'react'

export default function Reveal({ children, y = 16, delay = 0 }){
  const ref = useRef(null)
  useEffect(()=>{
    const el = ref.current
    if (!el) return
    el.style.setProperty('--ry', y+'px')
    el.style.setProperty('--rdelay', delay+'ms')
    const io = new IntersectionObserver(([e])=>{
      if (e.isIntersecting){ el.classList.add('reveal-show'); io.disconnect() }
    }, { threshold: 0.2 })
    io.observe(el)
    return ()=> io.disconnect()
  },[y,delay])
  return <div ref={ref} className="reveal">{children}</div>
}
