import { useEffect, useState } from 'react'

function applyTheme(theme){
  const t = theme === 'light' ? 'light' : 'dark'
  document.documentElement.setAttribute('data-theme', t)
  localStorage.setItem('theme', t)
  window.dispatchEvent(new CustomEvent('themechange', { detail: t }))
}

export default function ThemeButton(){
  const [theme, setTheme] = useState(document.documentElement.getAttribute('data-theme') || 'dark')

  useEffect(()=>{
    const saved = localStorage.getItem('theme') || theme
    applyTheme(saved); setTheme(saved)
    const onTheme = ()=> setTheme(document.documentElement.getAttribute('data-theme') || 'dark')
    window.addEventListener('themechange', onTheme)
    return ()=> window.removeEventListener('themechange', onTheme)
  },[])

  const toggle = () => { const next = theme==='dark'?'light':'dark'; applyTheme(next); setTheme(next) }
  return <button type='button' className='theme-btn ms-2' onClick={toggle}>{theme==='dark'?'Light':'Dark'} mode</button>
}
