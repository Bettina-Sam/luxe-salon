import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ConfettiBurst from './ConfettiBurst.jsx'

export default function ServiceCard({ icon, title, desc, price, to }){
  const navigate = useNavigate()
  const [burst, setBurst] = useState(false)

  // simple color cycle for price badge
  const badge = useMemo(()=> ({ label:`from ${price}`, cls:'price-badge' }), [price])

  function handleClick(e){
    e.preventDefault()
    // fire confetti now, then route after a short delight delay
    setBurst(false); requestAnimationFrame(()=> setBurst(true))
    setTimeout(()=> navigate(to), 450)
  }

  return (
    <a href={to} onClick={handleClick} className='text-decoration-none'>
      <div className='card service confetti-wrap'>
        <div className='mb-2'>{icon}</div>
        <h5>{title}</h5>
        <div className='card-desc'>{desc}</div>
        <span className={badge.cls}>{badge.label}</span>

        {/* local confetti layer */}
        <ConfettiBurst run={burst} />
      </div>
    </a>
  )
}
