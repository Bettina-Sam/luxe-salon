import { useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import FAQ from '../components/FAQ.jsx'
import PricingToggle from '../components/PricingToggle.jsx'
import Quiz from '../components/Quiz.jsx'
import FloatingEmojisService from '../components/FloatingEmojisService.jsx'
import data from '../servicesData.js'

export default function ServiceDetail(){
  const { serviceName } = useParams()
  const svc = useMemo(()=> (data ? data[serviceName] : undefined), [serviceName])

  useEffect(()=>{ if (svc?.title) document.title = `Luxe Salon — ${svc.title}` },[svc])

  // Safe fallbacks used by the header before render
  const heroImg = svc?.hero || 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1600&q=80'
  const title   = svc?.title   || 'Service'
  const tagline = svc?.tagline || ''

  const imgVariants = {
    hidden:{ opacity:0, y:14, scale:0.97, filter:'blur(6px)' },
    show:(i)=>({ opacity:1, y:0, scale:1, filter:'blur(0)', transition:{ delay:0.05*i, duration:.45, ease:'easeOut' } })
  }

  return (
    <main>
      <FloatingEmojisService emoji={svc?.emoji || '✨'} />

      {/* HERO */}
      <header
        className='service-hero'
        style={{ backgroundImage:`linear-gradient(to bottom, rgba(2,6,23,.65), rgba(2,6,23,.85)), url(${heroImg})` }}
      >
        <div className='container position-relative'>
          <h1 className='display-5 fw-bold'>{title}</h1>
          {tagline && <p className='lead'>{tagline}</p>}
        </div>
      </header>

      {!svc ? (
        <div className='container py-5'>
          <h2>Service not found</h2>
          <p className='text-muted'>Please choose from our services on the home page.</p>
          <Link to='/' className='btn btn-primary'>Back to Home</Link>
        </div>
      ) : (
        <>
          {/* ABOUT */}
          <section className='py-5'>
            <div className='container'>
              <div className='row g-4 align-items-start'>
                <motion.div
                  className='col-lg-6'
                  initial={{ opacity:0, x:-12 }}
                  whileInView={{ opacity:1, x:0 }}
                  viewport={{ once:true, amount:.4 }}
                  transition={{ duration:.45, ease:'easeOut' }}
                >
                  <div className='d-flex align-items-center gap-3 mb-1'>
                    <h2 className='mb-0'>About</h2>
                    <div className='emoji mega-anim sparkle' aria-hidden>{svc.emoji}</div>
                  </div>
                  <p className='mb-2'>{svc.about}</p>
                  <div className='feature-chips'>
                    {svc.points.map((p,i)=>(<span key={i} className='chip'>• {p}</span>))}
                  </div>
                </motion.div>

                <div className='col-lg-6'>
                  <div className='grid-2x2'>
                    {svc.images.map((src,i)=>(
                      <motion.img
                        key={i}
                        src={src}
                        alt={`${svc.title} ${i+1}`}
                        className='tiltable'
                        loading='lazy'
                        width='400' height='300'
                        custom={i}
                        variants={imgVariants}
                        initial='hidden'
                        whileInView='show'
                        viewport={{ once:true, amount:.3 }}
                        whileHover={{ rotateX:2.5, rotateY:-2.5, scale:1.02 }}
                        transition={{ type:'spring', stiffness:220, damping:18, mass:.4 }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* QUIZ */}
          <section className='py-5 section-muted'>
            <div className='container'>
              <h2 className='mb-4'>{svc.quiz.title}</h2>
              <Quiz
                fields={svc.quiz.fields}
                onRecommend={(ans)=>svc.quiz.recommend(ans)}
                ctaTo={(rec)=>'/appointment?service='+encodeURIComponent(rec?.name ?? svc.title)}
              />
            </div>
          </section>

          {/* PRICING */}
          <section className='py-5' style={{background:'linear-gradient(180deg, color-mix(in oklab, var(--bg), #ffffff 3%), transparent 100%)'}}>
            <div className='container'>
              <h2 className='mb-3'>Pricing</h2>
              <PricingToggle women={svc.pricing.women} men={svc.pricing.men} />
              <div className='text-center mt-4'>
                <Link className='btn btn-light btn-lg text-dark fw-semibold' to={'/appointment?service='+encodeURIComponent(svc.title)}>
                  Book Appointment
                </Link>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className='py-5'>
            <div className='container'>
              <h2 className='mb-4'>FAQ</h2>
              <FAQ items={svc.faq} idBase={'faq-'+serviceName} />
            </div>
          </section>

          <footer className='py-4 text-center text-muted'>© 2025 Luxe Salon</footer>
        </>
      )}
    </main>
  )
}
