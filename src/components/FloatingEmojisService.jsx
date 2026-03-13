import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'

export default function FloatingEmojisService({ emoji = '✨', count = 14 }){
  const [mount, setMount] = useState(null)

  useEffect(()=>{ setMount(document.body) },[])
  const items = useMemo(()=>{
    // make a pleasant spread across the viewport
    const arr = []
    for (let i=0; i<count; i++){
      const left = Math.random()*100   // percent
      const delay = (Math.random()*2).toFixed(2) + 's'
      const speedCls = i % 3 === 0 ? 'fall-14s' : i % 3 === 1 ? 'fall-11s' : 'fall-8s'
      // horizontal drift start/end
      const sx = (Math.random()*40 - 20) + 'px'   // -20..20
      const ex = (Math.random()*60 - 30) + 'px'   // -30..30
      arr.push({ left, delay, speedCls, sx, ex, ch: i%4===0 ? '✨' : emoji })
    }
    // add 2 roamers mid-page for extra life
    arr.push({ left: 18, delay:'0s', speedCls:'roamA', sx:'0px', ex:'0px', ch:'✨', mid:true, top:'28%' })
    arr.push({ left: 72, delay:'0s', speedCls:'roamB', sx:'0px', ex:'0px', ch:'✨', mid:true, top:'36%' })
    return arr
  },[emoji, count])

  if (!mount) return null
  return createPortal(
    <div className="service-emoji-page" aria-hidden>
      {items.map((it, i)=>(
        <span
          key={i}
          className={`item ${it.speedCls}`}
          style={{
            left: `${it.left}%`,
            animationDelay: it.delay,
            top: it.mid ? it.top : undefined,
            // custom props for start/end x drift used in @keyframes
            '--sx': it.sx, '--ex': it.ex
          }}
        >
          {it.ch}
        </span>
      ))}
    </div>,
    mount
  )
}
