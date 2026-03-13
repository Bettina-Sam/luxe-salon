import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import posts from '../blogData.js'
import ProgressBar from '../components/ProgressBar.jsx'
import ShareRow from '../components/ShareRow.jsx'
import ConfettiBurst from '../components/ConfettiBurst.jsx'
import Reveal from '../components/Reveal.jsx'
import { useState } from 'react'

export default function BlogPost(){
  const { slug } = useParams()
  const i = posts.findIndex(p=>p.slug===slug)
  const post = posts[i]

  const [clap, setClap] = useState(false)

  useEffect(()=>{
    if (post) document.title = `Blog — ${post.title}`
  }, [post])

  if (!post){
    return (
      <main className="py-5">
        <div className="container">
          <h1>Post not found</h1>
          <Link className="btn btn-primary mt-2" to="/blog">Back to Blog</Link>
        </div>
      </main>
    )
  }

  const prev = posts[i-1]
  const next = posts[i+1]

  return (
    <main>
      <ProgressBar />

      <header className="blog-hero" style={{backgroundImage:`linear-gradient(to bottom, rgba(2,6,23,.55), rgba(2,6,23,.75)), url(${post.cover})`}}>
        <div className="container">
          <div className="tag-row">{post.tags.map(t=><span key={t} className="tag">{t}</span>)}</div>
          <h1 className="display-6 fw-bold">{post.title}</h1>
          <div className="bc-meta">
            <span>{new Date(post.date).toLocaleDateString()}</span><span>•</span><span>{post.minutes} min read</span>
          </div>
        </div>
      </header>

      <article className="container blog-article">
        <Reveal>
          <div className="prose" dangerouslySetInnerHTML={{__html: md(post.body)}} />
        </Reveal>

        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mt-4">
          <ShareRow title={post.title} slug={post.slug} />

          <div className="confetti-wrap">
            <button
              className="btn btn-outline-primary"
              onClick={()=>{ setClap(false); requestAnimationFrame(()=> setClap(true)) }}
            >
              👏 Clap
            </button>
            <ConfettiBurst run={clap} />
          </div>
        </div>

        <hr className="my-4" />

        <div className="d-flex justify-content-between flex-wrap gap-2">
          {prev ? <Link className="btn btn-light" to={`/blog/${prev.slug}`}>← {prev.title}</Link> : <span/>}
          {next ? <Link className="btn btn-light" to={`/blog/${next.slug}`}>{next.title} →</Link> : <span/>}
        </div>
      </article>
    </main>
  )
}

// super tiny MD → HTML (only headings, bold, lists, italics, code)
function md(src=''){
  return src
    .replace(/^### (.*)$/gm, '<h3>$1</h3>')
    .replace(/^## (.*)$/gm, '<h2>$1</h2>')
    .replace(/^# (.*)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/_(.*?)_/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/^- (.*)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
    .replace(/\n{2,}/g, '<br/><br/>')
}
