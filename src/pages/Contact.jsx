import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ConfettiBurst from '../components/ConfettiBurst.jsx'
import Reveal from '../components/Reveal.jsx'

export default function Contact() {
  const [ok, setOk] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Feedback widget
  const [feedback, setFeedback] = useState('')
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const MIN_FEEDBACK = 12
  const maxChars = 500

  useEffect(() => { document.title = 'Luxe Salon — Contact' }, [])

  const showToast = (id = 'contactToast') => {
    const toastEl = document.getElementById(id)
    const B = window.bootstrap || window.Bootstrap
    if (toastEl && B?.Toast) {
      const t = B.Toast.getOrCreateInstance(toastEl, { delay: 3200, autohide: true })
      t.show()
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const form = e.currentTarget
    if (!form.checkValidity()) {
      form.classList.add('was-validated')
      return
    }
    setSubmitting(true)

    // Place API call here
    await new Promise(r => setTimeout(r, 600))

    // confetti + toast
    setOk(false); requestAnimationFrame(() => setOk(true))
    showToast()

    // reset form & validation
    form.reset()
    form.classList.remove('was-validated')
    setSubmitting(false)
  }

  function handleFeedbackSubmit(e) {
    e.preventDefault()
    if (rating === 0) return alert('Please choose a star rating.')
    if (feedback.trim().length < MIN_FEEDBACK) {
      return alert(`Please write at least ${MIN_FEEDBACK} characters.`)
    }
    // Send to API here
    alert(`Thanks! ⭐ ${rating} star(s)\n\n${feedback.trim()}`)
    setFeedback('')
    setRating(0)
    setHoverRating(0)
  }

  // Anim presets
  const fadeUp = { hidden: {opacity:0, y:16}, show: {opacity:1, y:0, transition:{duration:.45, ease:'easeOut'}} }
  const cardIn = { hidden:{opacity:0, scale:.98}, show:{opacity:1, scale:1, transition:{duration:.35, ease:'easeOut'}} }

  const current = hoverRating || rating
  const remaining = useMemo(() => Math.max(0, maxChars - feedback.length), [feedback])

  return (
    <main className="py-5">
      <div className="container">

        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="show"
          className="d-flex align-items-end justify-content-between mb-3 flex-wrap gap-2">
          <div>
            <h1 className="mb-1">Let’s talk</h1>
            <p className="text-muted mb-0">Questions, bookings, collabs — we’re one message away.</p>
          </div>
          <div className="socials-large d-flex gap-2">
            <a className="social-btn ig" href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" title="Instagram">{IG()}</a>
            <a className="social-btn fb" href="https://facebook.com"  target="_blank" rel="noreferrer" aria-label="Facebook"  title="Facebook">{FB()}</a>
            <a className="social-btn yt" href="https://youtube.com"   target="_blank" rel="noreferrer" aria-label="YouTube"   title="YouTube">{YT()}</a>
          </div>
        </motion.div>

        {/* Info + Map */}
        <div className="row g-4">
          <div className="col-lg-5">
            <Reveal>
              <motion.div variants={cardIn} initial="hidden" whileInView="show" viewport={{once:true, amount:.3}}
                className="contact-card luxe">
                <h5 className="mb-3 d-flex align-items-center gap-2">
                  Reach us <span className="badge text-bg-dark">Live now</span>
                </h5>

                <div className="d-flex align-items-center mb-2">
                  {Phone()} <strong className="ms-2">Phone: </strong>
                  <a href="tel:+911234567890" className="ms-1">+91 12345 67890</a>
                  <a className="btn btn-sm btn-outline-secondary ms-auto"
                     href="https://wa.me/911234567890?text=Hi%20Luxe%20Salon%2C%20I%27d%20like%20to%20book%20an%20appointment."
                     target="_blank" rel="noreferrer">WhatsApp</a>
                </div>
                <div className="d-flex align-items-center mb-2">
                  {Mail()} <strong className="ms-2">Email: </strong>
                  <a href="mailto:hello@luxesalon.example" className="ms-1">hello@luxesalon.example</a>
                </div>
                <div className="d-flex align-items-center">
                  {Pin()} <strong className="ms-2">Address: </strong>
                  <span className="ms-1">123 Luxe Street, City Center, IN</span>
                </div>

                <div className="hrs mt-3">
                  <div><span>Mon–Fri</span><b>10:00 – 20:00</b></div>
                  <div><span>Sat–Sun</span><b>10:00 – 21:00</b></div>
                </div>
              </motion.div>
            </Reveal>
          </div>

          <div className="col-lg-7">
            <Reveal>
              <motion.div variants={cardIn} initial="hidden" whileInView="show" viewport={{once:true, amount:.3}}
                className="map-wrap ratio ratio-16x9 rounded-3 overflow-hidden luxe-border">
                <iframe
                  title="Luxe Salon Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3504.731293105659!2d77.2090!3d28.6139!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd35b5b2f9bf%3A0x9b7b1b!2sCity%20Center!5e0!3m2!1sen!2sin!4v1610000000000"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </motion.div>
            </Reveal>
          </div>
        </div>

        {/* Contact form */}
        <div className="row g-4 mt-4 position-relative">
          <div className="col-lg-8">
            <Reveal>
              <motion.div variants={cardIn} initial="hidden" whileInView="show" viewport={{once:true, amount:.3}}
                className="contact-card confetti-wrap luxe">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-3">Send us a message</h5>
                  <span className="badge text-bg-dark">Avg reply: &lt; 2 hrs</span>
                </div>

                <form className="row g-3 needs-validation" noValidate onSubmit={handleSubmit}>
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="c-name">Name</label>
                    <input id="c-name" className="form-control" name="name" required />
                    <div className="invalid-feedback">Please enter your name.</div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="c-email">Email</label>
                    <input id="c-email" type="email" className="form-control" name="email" required />
                    <div className="invalid-feedback">Valid email required.</div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="c-phone">Phone (optional)</label>
                    <input id="c-phone" type="tel" className="form-control" name="phone" placeholder="+91" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="c-subject">Subject</label>
                    <input id="c-subject" className="form-control" name="subject" placeholder="Booking / Feedback / Collaboration…" required />
                    <div className="invalid-feedback">Subject required.</div>
                  </div>
                  <div className="col-12">
                    <label className="form-label" htmlFor="c-message">Message</label>
                    <textarea id="c-message" className="form-control" name="message" rows="5" required />
                    <div className="invalid-feedback">Please write a message.</div>
                  </div>
                  <div className="col-12 d-flex gap-2">
                    <button className="btn btn-primary btn-lg" disabled={submitting}>
                      {submitting ? 'Sending…' : 'Send Message'}
                    </button>
                    <a className="btn btn-outline-light btn-lg"
                      href="https://wa.me/911234567890?text=Hi%20Luxe%20Salon%2C%20I%27d%20like%20to%20book%20an%20appointment."
                      target="_blank" rel="noreferrer">
                      WhatsApp Us
                    </a>
                  </div>
                </form>

                <ConfettiBurst run={ok} />
              </motion.div>
            </Reveal>
          </div>
        </div>

        {/* Feedback */}
        <div className="row g-4 mt-4">
          <div className="col-lg-8">
            <Reveal>
              <motion.div variants={cardIn} initial="hidden" whileInView="show" viewport={{once:true, amount:.3}}
                className="contact-card luxe">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-3">Feedback</h5>
                  <AnimatePresence>
                    {(rating > 0 || feedback.length > 0) && (
                      <motion.span
                        initial={{opacity:0, y:-6}}
                        animate={{opacity:1, y:0}}
                        exit={{opacity:0, y:-6}}
                        className="badge rounded-pill text-bg-success"
                      >
                        We read every note 💌
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                <form onSubmit={handleFeedbackSubmit} aria-labelledby="feedback-heading">
                  <label id="feedback-heading" className="form-label">Rate your experience</label>

                  {/* Stars */}
                  <div
                    role="radiogroup"
                    aria-labelledby="feedback-heading"
                    className="d-flex align-items-center mb-3"
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowRight') setRating(Math.min(5, (rating || 0) + 1))
                      if (e.key === 'ArrowLeft') setRating(Math.max(1, (rating || 1) - 1))
                    }}
                    tabIndex={0}
                    style={{outline:'none'}}
                  >
                    {[1,2,3,4,5].map(star => (
                      <motion.button
                        key={star}
                        type="button"
                        role="radio"
                        aria-checked={rating === star}
                        className="btn btn-link p-0 me-1"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onFocus={() => setHoverRating(star)}
                        onBlur={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        title={`${star} star${star>1?'s':''}`}
                        whileHover={{ scale: 1.15, rotate: -3 }}
                        whileTap={{ scale: 0.9 }}
                        style={{
                          fontSize: '2rem',
                          lineHeight: 1,
                          color: star <= current ? '#FFD54A' : '#5f6b7a',
                          textShadow: star <= current ? '0 0 12px rgba(255,213,74,.4)' : 'none'
                        }}
                      >★</motion.button>
                    ))}
                    <span className="ms-2 small text-muted">{current ? `${current}/5` : 'Choose a rating'}</span>
                  </div>

                  {/* Textarea with counter */}
                  <div className="mb-2">
                    <label className="form-label" htmlFor="fb-text">Your Feedback</label>
                    <textarea
                      id="fb-text"
                      className="form-control"
                      rows="4"
                      value={feedback}
                      maxLength={maxChars}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Tell us what you loved, or what we can improve…"
                      required
                    />
                    <div className="d-flex justify-content-between mt-1">
                      <small className={`text-${feedback.length < MIN_FEEDBACK ? 'warning' : 'muted'}`}>
                        {feedback.length < MIN_FEEDBACK
                          ? `Min ${MIN_FEEDBACK} characters`
                          : 'Looks good!'}
                      </small>
                      <small className="text-muted">{remaining} left</small>
                    </div>
                  </div>

                  <button className="btn btn-success btn-lg mt-2">Submit Feedback</button>
                </form>
              </motion.div>
            </Reveal>
          </div>
        </div>

        {/* Toast */}
        <div
          id="contactToast"
          className="toast align-items-center text-bg-success border-0 position-fixed bottom-0 end-0 m-4"
          role="status" aria-live="polite" aria-atomic="true"
        >
          <div className="d-flex">
            <div className="toast-body">🎉 Message received! We’ll get back to you soon.</div>
            <button type="button" className="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
          </div>
        </div>

      </div>
    </main>
  )
}

/* small inline icons (unchanged from your version) */
function Phone(){return(<span className="ic" aria-hidden><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.7 19.7 0 0 1-8.59-3.07 19.38 19.38 0 0 1-6-6A19.7 19.7 0 0 1 2.08 4.2 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.12.86.34 1.7.66 2.49a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.59-1.17a2 2 0 0 1 2.11-.45c.79.32 1.63.54 2.49.66A2 2 0 0 1 22 16.92Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg></span>)}
function Mail(){return(<span className="ic" aria-hidden><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6"/><path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg></span>)}
function Pin(){return(<span className="ic" aria-hidden><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 22s7-5.33 7-12a7 7 0 1 0-14 0c0 6.67 7 12 7 12Z" stroke="currentColor" strokeWidth="1.6"/><circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.6"/></svg></span>)}
function IG(){return(<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden><rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6"/><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6"/><circle cx="17.5" cy="6.5" r="1.4" fill="currentColor"/></svg>)}
function FB(){return(<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.5 1.6-1.5H17V5.1c-.3 0-1.2-.1-2.2-.1-2.2 0-3.8 1.3-3.8 3.9V11H8v3h3v8h2.5Z"/></svg>)}
function YT(){return(<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M23 12s0-3.5-.45-5.18a3 3 0 0 0-2.12-2.12C18.75 4.25 12 4.25 12 4.25s-6.75 0-8.43.45A3 3 0 0 0 1.45 6.82C1 8.5 1 12 1 12s0 3.5.45 5.18a3 3 0 0 0 2.12 2.12C5.25 19.75 12 19.75 12 19.75s6.75 0 8.43-.45a3 3 0 0 0 2.12-2.12C23 15.5 23 12 23 12ZM10 8.9l5.8 3.1L10 15.1V8.9Z"/></svg>)}
