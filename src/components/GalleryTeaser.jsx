import gallery from '../galleryData.js'

export default function GalleryTeaser(){
  const rows = [
    gallery.slice(0,12),
    gallery.slice(12,24),
    gallery.slice(24,36),
  ]
  return (
    <section className="py-5 section-muted">
      <div className="container">
        <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
          <h2 className="mb-0">Gallery Highlights</h2>
          <a href="/gallery" className="btn btn-outline-primary">View full gallery</a>
        </div>

        <div className="teaser">
          {rows.map((row, r)=>(
            <div key={r} className={`teaser-row r${r+1}`} aria-hidden>
              {[...row, ...row].map((it, i)=>(
                <a key={i} href="/gallery" className="teaser-item" title="Open gallery">
                  <img loading="lazy" src={it.src} alt={it.alt||''}/>
                </a>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
