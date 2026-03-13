export default function ShareRow({ title, slug }){
  const url = typeof window !== 'undefined' ? window.location.origin + '/blog/' + slug : ''
  const text = encodeURIComponent(title)
  const shareUrl = encodeURIComponent(url)
  return (
    <div className="share-row">
      <a className="sbtn x"    href={`https://twitter.com/intent/tweet?text=${text}&url=${shareUrl}`} target="_blank" rel="noreferrer">X</a>
      <a className="sbtn fb"   href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noreferrer">Fb</a>
      <a className="sbtn ln"   href={`https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}&title=${text}`} target="_blank" rel="noreferrer">In</a>
      <button className="sbtn link" onClick={()=>{ navigator.clipboard?.writeText(url) }}>Link</button>
    </div>
  )
}
