import { useState } from 'react'
import { Link } from 'react-router-dom'
import ConfettiBurst from './ConfettiBurst.jsx'

export default function Quiz({ fields=[], onRecommend=()=>null, ctaTo: getCtaUrl }){
  const [result, setResult] = useState(null)
  const [fire, setFire] = useState(false)

  function handleSubmit(e){
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.currentTarget).entries())
    const rec = onRecommend(data)
    setResult(rec)
    // trigger confetti right as we show the recommendation
    setFire(false); requestAnimationFrame(()=> setFire(true))
  }

  return (
    <div className='confetti-wrap'>
      <form className='row g-3' onSubmit={handleSubmit} aria-label='service quiz'>
        {fields.map((f, idx)=>(
          <div key={idx} className={f.full ? 'col-12' : 'col-md-6'}>
            <label className='form-label'>{f.label}</label>
            {f.type==='select' && (
              <select name={f.name} className='form-select' required={f.required} aria-label={f.label}>
                <option value=''>Choose…</option>
                {f.options.map((o,i)=>(<option key={i} value={o}>{o}</option>))}
              </select>
            )}
            {f.type==='radio' && (
              <div className='d-flex gap-3 flex-wrap' role='radiogroup' aria-label={f.label}>
                {f.options.map((o,i)=>(
                  <label key={i}><input type='radio' name={f.name} value={o} required={f.required} /> {o}</label>
                ))}
              </div>
            )}
          </div>
        ))}
        <div className='col-12'><button className='btn btn-primary'>Get Recommendation</button></div>
      </form>

      {result && (
        <div className='alert alert-success mt-3 position-relative'>
          Recommended: <strong>{result.name}</strong> — {result.details}
          <Link
            to={getCtaUrl ? getCtaUrl(result) : '#'}
            className='btn btn-sm btn-outline-success ms-2'
            style={{animation:'pulse 1.4s ease-in-out 2'}}
          >
            Book this
          </Link>
        </div>
      )}

      {/* overlay confetti for quiz */}
      <ConfettiBurst run={fire} />
    </div>
  )
}
