import { useMemo, useState } from 'react'
import data from '../galleryData.js'
import Lightbox from '../components/Lightbox.jsx'

const TAGS = ['All','Hair','Skin','Spa','Bridal','Makeup','Eye']
const PAGE = 12

export default function Gallery(){
  const [tag, setTag] = useState('All')
  const [i, setI] = useState(-1)
  const [count, setCount] = useState(PAGE)

  const filtered = useMemo(()=> tag==='All' ? data : data.filter(d=>d.tag===tag), [tag])
  const items = filtered.slice(0, count)

  const openAt = (idx)=> setI(idx)
  const close = ()=> setI(-1)
  const prev = ()=> setI(p=> (p<=0 ? items.length-1 : p-1))
  const next = ()=> setI(p=> (p>=items.length-1 ? 0 : p+1))

  function setTagAndReset(t){ setTag(t); setCount(PAGE); setI(-1) }

  return (
    <main className="py-5">
      <div className="container">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
          <h1 className="mb-0">Gallery</h1>
          <div className="filters">
            {TAGS.map(t=>(
              <button key={t} className={'chip '+(tag===t?'active':'')} onClick={()=> setTagAndReset(t)}>{t}</button>
            ))}
          </div>
        </div>

        <div className="grid-gallery">
          {items.map((it, idx)=>(
            <a key={idx} href={it.src} onClick={(e)=>{e.preventDefault(); openAt(idx)}}
               className="g-item" aria-label={'Open '+(it.alt||'photo')}>
              <img loading="lazy" src={it.src} alt={it.alt||''} />
              <span className="g-tag">{it.tag}</span>
            </a>
          ))}
        </div>

        {count < filtered.length && (
          <div className="text-center mt-4">
            <button className="btn btn-outline-primary" onClick={()=> setCount(c=> Math.min(c+PAGE, filtered.length))}>
              Load more
            </button>
          </div>
        )}
      </div>

      <Lightbox open={i>=0} src={items[i]?.src} alt={items[i]?.alt} onClose={close} onPrev={prev} onNext={next}/>
    </main>
  )
}
