import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ServiceCard from '../components/ServiceCard.jsx'
import FloatingEmojis from '../components/FloatingEmojis.jsx'
import data from '../servicesData.js'
import GalleryTeaser from '../components/GalleryTeaser.jsx'
import Testimonials from '../components/Testimonials.jsx'

const COUNTER_NAMESPACE = 'salon-luxe'
const COUNTER_KEY = 'home-page-visits'
const COUNTER_SESSION_KEY = 'salon_luxe_home_visit_counted'
const COUNTER_CACHE_KEY = 'salon_luxe_home_visits_cache'
const COUNTER_PROVIDERS = [
  {
    hit: `https://countapi.xyz/hit/${COUNTER_NAMESPACE}/${COUNTER_KEY}`,
    get: `https://countapi.xyz/get/${COUNTER_NAMESPACE}/${COUNTER_KEY}`,
    create: `https://countapi.xyz/create?namespace=${COUNTER_NAMESPACE}&key=${COUNTER_KEY}&value=0`,
    read: (payload) => payload?.value,
  },
  {
    hit: `https://api.counterapi.dev/v1/${COUNTER_NAMESPACE}/${COUNTER_KEY}/up`,
    get: `https://api.counterapi.dev/v1/${COUNTER_NAMESPACE}/${COUNTER_KEY}/`,
    create: `https://api.counterapi.dev/v1/${COUNTER_NAMESPACE}/${COUNTER_KEY}/up`,
    read: (payload) => payload?.count,
  },
]

async function requestCounterValue(url, reader, timeoutMs = 7000){
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(url, { method: 'GET', cache: 'no-store', signal: controller.signal })
    if (!response.ok) throw new Error('Counter request failed')
    const payload = await response.json()
    const value = reader(payload)
    if (typeof value !== 'number') throw new Error('Invalid counter response')
    return value
  } finally {
    clearTimeout(timer)
  }
}

async function runCounterRequest(mode){
  for (const provider of COUNTER_PROVIDERS) {
    try {
      return await requestCounterValue(provider[mode], provider.read)
    } catch {
      // Continue to next provider.
    }
  }
  throw new Error('Counter providers unavailable')
}

async function ensureCounterExists(){
  try {
    return await runCounterRequest('get')
  } catch {
    return await runCounterRequest('create')
  }
}

function readCachedVisits(){
  try {
    const raw = localStorage.getItem(COUNTER_CACHE_KEY)
    if (!raw) return null
    const value = Number(raw)
    return Number.isFinite(value) ? value : null
  } catch {
    return null
  }
}

function writeCachedVisits(value){
  try {
    localStorage.setItem(COUNTER_CACHE_KEY, String(value))
  } catch {
    // Ignore blocked storage.
  }
}

export default function Home(){
  const services = Object.values(data)
  const [visits, setVisits] = useState(() => readCachedVisits())
  const [counterError, setCounterError] = useState(false)
  const [counterRefreshToken, setCounterRefreshToken] = useState(0)

  useEffect(()=>{
    document.title = 'Luxe Salon - Hair - Skin - Spa - Makeup - Eye'
  },[])

  useEffect(() => {
    let mounted = true

    const syncCounter = async () => {
      try {
        let alreadyCounted = false
        try {
          alreadyCounted = sessionStorage.getItem(COUNTER_SESSION_KEY) === '1'
        } catch {
          alreadyCounted = false
        }
        let value

        if (alreadyCounted) {
          value = await ensureCounterExists()
        } else {
          try {
            value = await runCounterRequest('hit')
          } catch {
            await ensureCounterExists()
            value = await runCounterRequest('hit')
          }
          try {
            sessionStorage.setItem(COUNTER_SESSION_KEY, '1')
          } catch {
            // Ignore blocked storage and keep counter functional.
          }
        }

        if (!mounted) return
        setVisits(value)
        writeCachedVisits(value)
        setCounterError(false)
      } catch {
        if (!mounted) return
        setCounterError(readCachedVisits() === null)
      }
    }

    syncCounter()
    return () => { mounted = false }
  }, [counterRefreshToken])

  return (
    <main className='home-page'>
      {/* HERO */}
      <header className='hero'>
        {/* faint drifting emojis under the text */}
        <FloatingEmojis />

        <div className='container text-white text-center'>
          <h1 className='display-3 fw-bold'>Be Your Luxe Self</h1>
          <p className='lead opacity-75'>Hair - Skin - Spa - Bridal - Makeup - Eye care</p>
          <div className='d-flex gap-3 justify-content-center mt-3'>
            <a href='#services' className='btn btn-primary btn-lg'>Explore Services</a>
            <Link to='/appointment' className='btn btn-outline-light btn-lg'>Book Appointment</Link>
          </div>
          <button
            type='button'
            className='visit-counter-btn mt-4'
            aria-live='polite'
            onClick={() => setCounterRefreshToken((token) => token + 1)}
          >
            <span className='visit-counter-label'>Page Visits</span>
            <span className='visit-counter-value'>
              {counterError ? 'Counter unavailable' : visits === null ? '--' : visits.toLocaleString()}
            </span>
          </button>
        </div>

        <div className='scroll-indicator' aria-hidden>&#9660;</div>
      </header>

      {/* SERVICES GRID */}
      <section id='services' className='py-5 section-muted'>
        <div className='container'>
          <h2 className='text-center mb-4'>Our Services</h2>
          <div className='row g-4'>
            {services.map(s => (
              <div className='col-12 col-sm-6 col-lg-4' key={s.key}>
                <ServiceCard
                  icon={<span className={`emoji mega-anim sparkle ${s.emojiAnim}`}>{s.emoji}</span>}
                  title={s.title}
                  desc={s.brief}
                  price={s.startPrice}
                  to={'/services/'+s.key}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
      <GalleryTeaser />
      <Testimonials />


      <footer className='py-4 text-center text-muted'>&copy; 2025 Luxe Salon</footer>
    </main>
  )
}
