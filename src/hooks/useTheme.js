import { useEffect, useState } from 'react'
export default function useTheme(){
  const get = () => document.documentElement.getAttribute('data-theme') || 'dark'
  const [theme, setTheme] = useState(get())
  useEffect(()=>{
    const obs = new MutationObserver(() => setTheme(get()))
    obs.observe(document.documentElement, { attributes:true, attributeFilter:['data-theme'] })
    return () => obs.disconnect()
  },[])
  return theme
}
