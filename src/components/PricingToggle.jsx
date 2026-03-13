import { useEffect, useMemo, useRef, useState } from 'react'
import useTheme from '../hooks/useTheme.js'
import { motion } from 'framer-motion'

export default function PricingToggle({ women=[], men=[] }){
  const [tab, setTab] = useState('women')
  const theme = useTheme()
  const trackRef = useRef(null)
  const knobW = 116

  useEffect(()=>{
    const h = (window.location.hash || '').replace('#','')
    if (h === 'men' || h === 'women') setTab(h)
    const onHash = () => {
      const v = (window.location.hash || '').replace('#','')
      if (v === 'men' || v === 'women') setTab(v)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  },[])
  useEffect(()=>{
    if (window.location.hash.replace('#','') !== tab){
      history.replaceState(null, '', '#'+tab)
    }
  },[tab])

  useEffect(()=>{
    const el = trackRef.current
    if (!el) return
    const x = tab === 'women' ? '15%' : '85%'
    el.style.setProperty('--x', x)
    el.classList.add('active')
    const t = setTimeout(()=> el.classList.remove('active'), 350)
    return ()=> clearTimeout(t)
  },[tab])

  const tableClass = theme === 'dark' ? 'table-dark' : ''
  const Table = ({ rows }) => (
    <div className='table-responsive'>
      <table className={`table table-striped table-hover align-middle ${tableClass}`}>
        <thead><tr><th>Service</th><th>Price</th><th>Duration</th><th></th></tr></thead>
        <tbody>
          {rows.map((r,i)=>(
            <tr key={i}>
              <td>{r.name}</td><td>{r.price}</td><td>{r.duration}</td>
              <td><a href={'/appointment?service='+encodeURIComponent(r.name)} className='btn btn-outline-primary btn-sm'>Book</a></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
  const knobX = useMemo(()=> tab === 'women' ? 4 : (260 - knobW - 4), [tab])

  return (
    <div>
      <div className='gender-switch' role='tablist' aria-label='Gender toggle'>
        <span className={'gender-label ' + (tab==='women'?'active':'')} onClick={()=>setTab('women')}>Women</span>
        <div ref={trackRef} className='gender-track'>
          <div className='gender-trail'></div>
          <motion.div
            className='gender-knob' role='button' tabIndex={0}
            onClick={()=> setTab(tab==='women' ? 'men' : 'women')}
            onKeyDown={(e)=> (e.key==='Enter'||e.key===' ') && setTab(tab==='women'?'men':'women')}
            animate={{ x: knobX }} transition={{ type:'spring', stiffness:450, damping:30, mass:.5 }}
          >{tab==='women'?'Women':'Men'}</motion.div>
        </div>
        <span className={'gender-label ' + (tab==='men'?'active':'')} onClick={()=>setTab('men')}>Men</span>
      </div>

      <div className={'pricing-table ' + (tab==='women'?'show':'')} aria-hidden={tab!=='women'}><Table rows={women} /></div>
      <div className={'pricing-table ' + (tab==='men'?'show':'')} aria-hidden={tab!=='men'}><Table rows={men} /></div>
    </div>
  )
}
