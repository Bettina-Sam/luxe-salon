import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import NavBar from './components/NavBar.jsx'
import Home from './pages/Home.jsx'
import ServiceDetail from './pages/ServiceDetail.jsx'
import Appointment from './pages/Appointment.jsx'
import NotFound from './pages/NotFound.jsx'
import CursorGlow from './components/CursorGlow.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

function applyTheme(theme){
  const t = theme === 'light' ? 'light' : 'dark'
  document.documentElement.setAttribute('data-theme', t)
  localStorage.setItem('theme', t)
}

export default function App(){
  const location = useLocation()

  useEffect(()=>{
    const saved = localStorage.getItem('theme') || 'dark'
    applyTheme(saved)
  },[])

  useEffect(()=>{ window.scrollTo(0,0) }, [location.pathname])

  return (
    <ErrorBoundary>
      <CursorGlow />
      <NavBar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/services/:serviceName' element={<ServiceDetail />} />
        <Route path='/appointment' element={<Appointment />} />
        <Route path='*' element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  )
}
