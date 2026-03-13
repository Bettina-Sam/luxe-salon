import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import posts from '../blogData.js'
import Reveal from '../components/Reveal.jsx'

const ALL_TAGS = ['All', ...Array.from(new Set(posts.flatMap(p=>p.tags)))]

export default function BlogList(){
  useEffect(()=>{ document.title = 'Luxe Salon — Beauty Blog' },[])

  // search with small debounce
  const [qRaw, setQRaw] = useState('')
  const [q, setQ] = useState('')
  useEffect(()=>{
    const t = setTimeout(()=> setQ(qRaw.trim()), 180)
    return ()=> clearTimeout(t)
  }, [qRaw])

  const [tag, setTag] = useState('All')

  const filtered = useMemo(()=>{
    return posts.filter(p=>{
      const tagOk = tag === 'All' || p.tags.includes(tag)
      const text = (p.title + ' ' + p.excerpt).toLowerCase()
      const qOk = q === '' || text.includes(q.toLowerCase())
      return tagOk && qOk
    })
  }, [tag, q])

  return (
    <main className="py-5">
      <div className="container">
        <h1 className="mb-3">Beauty Blog</h1>

        {/* Toolbar: sticky, animated */}
        <div className="blog-toolbar">
          <div className="search-wrap">
            <input
              className="form-control blog-search"
              value={qRaw}
              onChange={e=>setQRaw(e.target.value)}
              placeholder="Search posts, tips, ingredients…"
              aria-label="Search blog"
            />
            <div className="search-glow" aria-hidden />
          </div>

          <div className="chip-row" role="tablist" aria-label="Filter by tag">
            {ALL_TAGS.map((t, i)=>(
              <button
                key={t}
                className={'chip ' + (tag===t ? 'active' : '')}
                onClick={()=>setTag(t)}
                style={{animationDelay: (40*i)+'ms'}}
                role="tab"
                aria-selected={tag===t}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="blog-grid">
          {filtered.map((p,i)=>(
            <Reveal key={p.slug} delay={60*i}>
              <Link to={`/blog/${p.slug}`} className="blog-card">
                <div className="bc-cover"><img loading="lazy" src={p.cover} alt={p.title} /></div>
                <div className="bc-body">
                  <div className="bc-tags">{p.tags.map(t=><span key={t} className="tag">{t}</span>)}</div>
                  <h5 className="bc-title">{p.title}</h5>
                  <p className="bc-excerpt">{p.excerpt}</p>
                  <div className="bc-meta">
                    <span>{new Date(p.date).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{p.minutes} min read</span>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </main>
  )
}
