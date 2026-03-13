import { useMemo, useState } from 'react'
import data from '../testimonialsData.js'
import Stars from './Stars.jsx'
import ConfettiBurst from './ConfettiBurst.jsx'

const INITIAL_COUNT = 6

export default function Testimonials(){
  // Shuffle so the page feels fresh on each load
  const cards = useMemo(()=>{
    const arr = [...data]
    for (let i=arr.length-1; i>0; i--){
      const j = Math.floor(Math.random()*(i+1))
      ;[arr[i],arr[j]] = [arr[j],arr[i]]
    }
    return arr
  },[])

  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? cards : cards.slice(0, INITIAL_COUNT)

  return (
    <section className="py-5">
      <div className="container">
        <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
          <h2 className="mb-0">What clients say</h2>
          <p className="text-muted mb-0">Real feedback — not all 5★, because honesty wins trust.</p>
        </div>

        <div className="testi-grid">
          {visible.map((c, idx)=> <TestiCard key={idx} {...c} idx={idx} />)}
        </div>

        {/* Toggle */}
        <div className="text-center mt-3">
          {!expanded ? (
            <button className="btn btn-outline-primary" onClick={()=>setExpanded(true)}>Show more</button>
          ) : (
            <button className="btn btn-outline-secondary" onClick={()=>setExpanded(false)}>Show less</button>
          )}
        </div>
      </div>
    </section>
  )
}

function TestiCard({ name, role, rating, text, avatar, idx }){
  const [burst, setBurst] = useState(false)
  const floater = `float${(idx % 4) + 1}` // vary amplitude/speed

  return (
    <div className={`testi-card ${floater} confetti-wrap`}>
      <div className="d-flex align-items-center gap-3 mb-2">
        <img src={avatar} alt={`${name} avatar`} width="44" height="44" style={{borderRadius:'999px'}} />
        <div>
          <div className="fw-semibold">{name}</div>
          <div className="small text-muted">{role}</div>
        </div>
      </div>

      <Stars value={rating} />
      <p className="mt-2 mb-3">{text}</p>

      <button
        className="btn btn-sm btn-outline-primary"
        onClick={()=>{ setBurst(false); requestAnimationFrame(()=> setBurst(true)) }}
      >
        👍 Helpful
      </button>

      <ConfettiBurst run={burst} />
    </div>
  )
}

