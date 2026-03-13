import { useEffect, useState } from 'react'

export default function ProgressBar(){
  const [p, setP] = useState(0)
  useEffect(()=>{
    const onScroll = ()=>{
      const el = document.documentElement
      const h  = el.scrollHeight - el.clientHeight
      const v  = (h>0 ? (window.scrollY / h) * 100 : 0)
      setP(Math.max(0, Math.min(100, v)))
    }
    onScroll(); window.addEventListener('scroll', onScroll, { passive:true })
    return ()=> window.removeEventListener('scroll', onScroll)
  },[])
  return <div className="read-progress" style={{width: p+'%'}} aria-hidden />
}
