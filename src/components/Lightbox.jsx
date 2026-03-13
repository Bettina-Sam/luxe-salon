import { useEffect } from 'react'
import { createPortal } from 'react-dom'

export default function Lightbox({ open=false, src='', alt='', onClose, onPrev, onNext }){
  useEffect(()=>{
    if (!open) return
    const onKey = (e)=>{
      if (e.key === 'Escape') onClose?.()
      if (e.key === 'ArrowLeft') onPrev?.()
      if (e.key === 'ArrowRight') onNext?.()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return ()=>{
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  },[open, onClose, onPrev, onNext])

  if (!open) return null
  return createPortal(
    <div className="lb-backdrop" onClick={onClose} aria-modal role="dialog">
      <figure className="lb-figure" onClick={e=>e.stopPropagation()}>
        <img src={src} alt={alt || ''} />
        <figcaption className="lb-caption">{alt}</figcaption>
        <button className="lb-close" onClick={onClose} aria-label="Close">×</button>
        <button className="lb-prev" onClick={onPrev} aria-label="Previous">‹</button>
        <button className="lb-next" onClick={onNext} aria-label="Next">›</button>
      </figure>
    </div>,
    document.body
  )
}
