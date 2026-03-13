import { useEffect, useMemo, useState } from 'react'

const COLORS = ['#f87171','#60a5fa','#34d399','#fbbf24','#c084fc','#f472b6']

export default function ConfettiBurst({ run=false }){
  const [show, setShow] = useState(false)

  useEffect(()=>{
    if (!run) return
    setShow(true)
    const t = setTimeout(()=> setShow(false), 1200)
    return ()=> clearTimeout(t)
  }, [run])

  const pieces = useMemo(()=>{
    return Array.from({length:28}).map((_,i)=>{
      const dx = (Math.random()*180 - 90) + 'px'
      const dy = (Math.random()*160 + 80) + 'px'
      const sx = (Math.random()*40 - 20) + 'px'
      const sy = (Math.random()*-10) + 'px'
      const rot = (Math.random()*360) + 'deg'
      const bg = COLORS[i % COLORS.length]
      const left = (Math.random()*80 + 10) + '%'
      return {dx,dy,sx,sy,rot,bg,left}
    })
  },[])

  if (!show) return null
  return (
    <div className='confetti-layer'>
      {pieces.map((p,i)=>(
        <span
          key={i}
          className='confetti-piece'
          style={{
            '--dx': p.dx, '--dy': p.dy, '--sx': p.sx, '--sy': p.sy, '--rot': p.rot,
            left: p.left, top: '0%', background: p.bg
          }}
        />
      ))}
    </div>
  )
}
