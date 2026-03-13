import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import NavBar from './components/NavBar.jsx'
import Home from './pages/Home.jsx'
import ServiceDetail from './pages/ServiceDetail.jsx'
import Appointment from './pages/Appointment.jsx'
import NotFound from './pages/NotFound.jsx'
import Gallery from './pages/Gallery.jsx'
import Contact from './pages/Contact.jsx'
import FooterMega from './components/FooterMega.jsx'
import WhatsAppButton from './components/WhatsAppButton.jsx'
// imports
import BlogList from './pages/BlogList.jsx'
import BlogPost from './pages/BlogPost.jsx'
import Pricing from './pages/Pricing.jsx'
import Testimonials from './components/Testimonials.jsx' // What Clients Say (Review)

// at top where your routes live
import AvatarPage from "./components/avatar/AvatarPage";
import MascotActor from "./components/mascot/MascotActor";

import ComplimentFab from "./components/fun/ComplimentFab";
import MirrorMode from "./components/mirror/MirrorMode";
import GameHub from "./components/games/GameHub";
import AIChatDock from './components/AIChatDock.jsx'


// --- Inline fallbacks so there are NO missing-import errors ---
const ServicesPage = () => (
  <main className="container py-4 page-section">
    <h1 className="mb-3">Services</h1>
    <div className="row g-3">
      {[
        { slug: 'haircut', title: 'Haircut + Styling', blurb: 'Precision cuts & finish' },
        { slug: 'hydra-glow', title: 'Hydra Glow Facial', blurb: 'Event-safe glow' },
        { slug: 'bridal-makeup', title: 'Bridal Makeup (HD)', blurb: 'Trials + day-of' },
      ].map(s => (
        <div key={s.slug} className="col-12 col-md-6 col-lg-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">{s.title}</h5>
              <p className="card-text text-muted">{s.blurb}</p>
              {/* Deep link to your existing detail route */}
              <a className="btn btn-dark" href={`/services/${s.slug}`}>View</a>
            </div>
          </div>
        </div>
      ))}
    </div>
  </main>
)
const AboutPage = () => (
  <main className="container py-4 position-relative page-section">
    {/* HERO */}
    <header className="mb-4 text-left">
      <span
        className="badge rounded-pill"
        style={{
          background: 'color-mix(in oklab, var(--panel-2), #fff 8%)',
          border: '1px solid var(--border)',
          color: 'var(--ink)',
          padding: '.4rem .75rem',
          letterSpacing: '.4px',
          fontWeight: 800
        }}
      >
      </span>

      <h1 className="mt-2 mb-2" style={{fontWeight: 900, letterSpacing: '.2px'}}>
        About <span
          style={{
            background: 'linear-gradient(90deg, #7a6cf4, #35d0ff)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent'
          }}
        >
        Luxe Salon
        </span>
      </h1>


    </header>

    {/* STORY + IMAGE */}
    <div className="row g-4 align-items-center mb-4">
      <div className="col-lg-6">
        <div
          className="card h-100"
          style={{
            background: 'rgba(230, 211, 211, 0.06)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            boxShadow: '0 14px 36px rgba(0,0,0,.22)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <div className="card-body">
            <h3 className="h5" style={{fontWeight: 800,color: '#fff'}}>Our Story</h3>
            <p className="mb-2" style={{color: 'var(--ink)'}}>
              We started Luxe with a simple idea: <em>listen first</em>. Every face, scalp, and schedule is different,
              so our artists begin with a short consult, map your goals, and build a look that fits your routine — not the other way around.
            </p>
            <p className="mb-0" style={{color: 'var(--ink)'}}>
              From ammonia-free color and skin-safe actives to hygienic tools and timed appointments, we sweat the details
              so you can relax in the chair and leave feeling like yourself, only brighter.
            </p>
          </div>
        </div>
      </div>

      <div className="col-lg-6">
        <div
          className="ratio ratio-16x9 rounded-4 overflow-hidden"
          style={{
            border: '1px solid var(--border)',
            boxShadow: '0 16px 44px rgba(0,0,0,.28)'
          }}
        >
          <img
            src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1600&q=80"
            alt="Inside Luxe Salon studio"
            className="w-100 h-100 object-fit-cover"
            loading="lazy"
            style={{filter: 'saturate(1.03) contrast(1.02)'}}
          />
        </div>
      </div>
    </div>

    {/* VALUES */}
    <section className="mb-4">
      <h3 className="h5 mb-3" style={{fontWeight: 800}}>Our Values</h3>
      <div className="d-flex flex-wrap gap-2">
        {['Hygiene first','Transparent advice','Time respect','Skin & scalp safe','Results you can feel'].map((t,i)=>(
          <span
            key={i}
            className="badge rounded-pill"
            style={{
              background: 'color-mix(in oklab, var(--panel), #fff 8%)',
              border: '1px solid var(--border)',
              color: 'var(--ink)',
              padding: '.45rem .8rem',
              fontWeight: 800
            }}
          >
            {t}
          </span>
        ))}
      </div>
    </section>

    {/* WHY CHOOSE US */}
    <section className="mb-4">
      <h3 className="h5 mb-3" style={{fontWeight: 800}}>Why clients pick us</h3>
      <div className="row g-3">
        {[
          ['🗺️','Consults that map to you','Face-shape, undertone, lifestyle — we design around your real life.'],
          ['🧴','Skin-safe products','Ammonia-free color, gentle actives, and strict tool sanitation.'],
          ['⏱️','On-time appointments','Smart scheduling and realistic service timings — no surprise waits.'],
          ['✨','Event-ready finishing','Long-wear prep & touch-up tips so the look lasts past photos.']
        ].map(([emoji,title,desc],i)=>(
          <div key={i} className="col-md-6 col-lg-3">
            <div
              className="card h-100"
              style={{
                background: 'rgba(255,255,255,.06)',
                border: '1px solid var(--border)',
                borderRadius: 16,
                boxShadow: '0 12px 32px rgba(0,0,0,.2)',
                transition: 'transform .18s ease, box-shadow .18s ease'
              }}
              onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 18px 44px rgba(0,0,0,.26)'; }}
              onMouseLeave={e=>{ e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='0 12px 32px rgba(0,0,0,.2)'; }}
            >
              <div className="card-body">
                <div className="fs-3 mb-1" aria-hidden>{emoji}</div>
                <h4 className="h6 mt-1 mb-1" style={{color:'var(--ink)', fontWeight:800}}>{title}</h4>
                <p className="small mb-0" style={{color:'var(--muted)'}}>{desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>

    {/* STATS / TRUST */}
    <section className="mb-4">
      <div className="row g-3">
        {[
          ['10k+','Appointments'],
          ['1,200+','Bridal looks'],
          ['4.9★','Average rating'],
          ['24–48h','Support response']
        ].map(([num,label],i)=>(
          <div key={i} className="col-6 col-md-3">
            <div
              className="card text-center"
              style={{
                background: 'rgba(255,255,255,.06)',
                border: '1px solid var(--border)',
                borderRadius: 16,
                boxShadow: '0 12px 32px rgba(0,0,0,.2)'
              }}
            >
              <div className="card-body py-4">
                <div
                  className="mb-0"
                  style={{
                    fontSize: '2rem',
                    fontWeight: 900,
                    background: 'linear-gradient(90deg, #7a6cf4, #35d0ff)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent'
                  }}
                >
                  {num}
                </div>
                <div className="small" style={{color:'var(--muted)'}}>{label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>

    {/* PROMISE */}
    <section className="mb-4">
      <div
        className="card"
        style={{
          background: 'rgba(255,255,255,.06)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          boxShadow: '0 14px 36px rgba(0,0,0,.22)'
        }}
      >
        <div className="card-body">
<h3 className="h5" style={{ fontWeight: 800, color: '#fff' }}>Our Promise</h3>
          <ul className="mb-0" style={{color:'var(--muted)'}}>
            <li>Clear, up-front pricing (with add-on suggestions only when it helps).</li>
            <li>Consults that respect sensitivities, routines, and timelines.</li>
            <li>Take-home care notes so results last between visits.</li>
          </ul>
        </div>
      </div>
    </section>

    {/* CTAs */}
    <section className="d-flex flex-wrap gap-2 mt-3">
      <a
        className="btn btn-lg"
        href="/appointment"
        style={{
          background: 'linear-gradient(90deg, #7a6cf4, #35d0ff)',
          border: '1px solid color-mix(in oklab, var(--border), #fff 20%)',
          color: '#0b1020',
          fontWeight: 800
        }}
      >
        Book an Appointment
      </a>
      <a
        className="btn btn-outline-light btn-lg"
        href="/gallery"
        style={{borderColor:'var(--border)', color:'var(--ink)'}}
      >
        See the Gallery
      </a>
      <a
        className="btn btn-outline-secondary btn-lg"
        href="/review"
        style={{borderColor:'var(--border)', color:'var(--ink)'}}
      >
        What Clients Say
      </a>
    </section>

    {/* FOOT NOTE */}
    <p className="small mt-4 mb-0" style={{color: 'var(--muted)'}}>
      Hygiene • Transparency • Time respect — every single visit.
    </p>
  </main>
);




// --- End fallbacks ---

function applyTheme(theme){
  const t = theme === 'light' ? 'light' : 'dark'
  document.documentElement.setAttribute('data-theme', t)
  localStorage.setItem('theme', t)
}

export default function App(){
  const location = useLocation()
  const isMirrorPage = location.pathname.startsWith('/mirror')

  useEffect(()=>{ applyTheme(localStorage.getItem('theme') || 'dark') },[])
  useEffect(()=>{ window.scrollTo(0,0) }, [location.pathname])

  return (
    <>
      <NavBar />
      <div className="app-main">
        <Routes>
          {/* Blog */}
          <Route path='/blog' element={<BlogList />} />
          <Route path='/blog/:slug' element={<BlogPost />} />

          {/* Core pages */}
          <Route path='/' element={<Home />} />
          <Route path='/services' element={<ServicesPage />} />          {/* Services list (fallback) */}
          <Route path='/services/:serviceName' element={<ServiceDetail />} />
          <Route path='/review' element={<Testimonials />} />            {/* What Clients Say */}
          <Route path='/pricing' element={<Pricing />} />
          <Route path='/appointment' element={<Appointment />} />
          <Route path='/gallery' element={<Gallery />} />
          <Route path='/about' element={<AboutPage />} />                {/* About (fallback) */}
          <Route path='/contact' element={<Contact />} />

          <Route path="/avatar" element={<AvatarPage />} />
          <Route path="/mirror" element={<MirrorMode />} />
          <Route path="/games" element={<GameHub />} />

          {/* 404 */}
          <Route path='*' element={<NotFound />} />
        </Routes>
      </div>
      <MascotActor />
      {!isMirrorPage && <ComplimentFab />}
      {!isMirrorPage && <AIChatDock />}
      {!isMirrorPage && <WhatsAppButton phone="+917418415133" />}
      <FooterMega />
    </>
  )
}
